// sheets-proxy — authenticated proxy between the dashboard and Google Sheets.
// Browser code never holds Google credentials or n8n URLs.
//
// Env (server-only):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (scoped)
//   GOOGLE_SHEETS_SERVICE_ACCOUNT (JSON blob), GOOGLE_SHEET_ID
//   N8N_WEBHOOK_URL, N8N_WEBHOOK_SIGNING_SECRET
//
// Endpoints (all require an authenticated Supabase session):
//   GET  /?sheet=track|issues|reviews|activity     -> rows as JSON
//   POST /resolve                                 -> body { issue_id: string }
//
// Every call verifies a valid JWT, validates the payload, resolves the tenant from
// the trusted staff membership, and rate-limits by user.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const SHEETS_SA_JSON = Deno.env.get('GOOGLE_SHEETS_SERVICE_ACCOUNT') ?? '';
const SHEET_ID = Deno.env.get('GOOGLE_SHEET_ID') ?? '';
const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL') ?? '';
const N8N_WEBHOOK_SIGNING_SECRET = Deno.env.get('N8N_WEBHOOK_SIGNING_SECRET') ?? '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// In-memory rate limit is a dev-only shim; production should use a durable store.
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimited(userId: string): boolean {
  const now = Date.now();
  const bucket = rateBuckets.get(userId);
  if (!bucket || bucket.resetAt < now) {
    rateBuckets.set(userId, { count: 0, resetAt: now + 60_000 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > 30;
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}

function fail(message: string, status = 400) {
  return json({ error: message }, status);
}

// Mint a Google OAuth token from a service-account JSON secret (RS256 via WebCrypto).
async function googleAccessToken(): Promise<string> {
  const sa = JSON.parse(SHEETS_SA_JSON);
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    pemToBuffer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: sa.token_uri,
    iat: now,
    exp: now + 3600,
  };
  const b64 = (o: unknown) => btoa(JSON.stringify(o)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const signingInput = `${b64(header)}.${b64(claim)}`;
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    new TextEncoder().encode(signingInput),
  );
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
  const res = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${signingInput}.${sig}`,
  });
  if (!res.ok) throw new Error(`token mint failed: ${res.status}`);
  const token = await res.json();
  return token.access_token;
}

function pemToBuffer(pem: string): Uint8Array {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const bytes = atob(b64);
  const buf = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
  return buf;
}

async function readSheet(range: string): Promise<string[][]> {
  const token = await googleAccessToken();
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`sheets read failed: ${res.status}`);
  const body = await res.json();
  return body.values ?? [];
}

function rowsToJson(values: string[][]): Record<string, unknown>[] {
  const [header, ...rows] = values;
  if (!header) return [];
  return rows.map((row) =>
    Object.fromEntries(header.map((col, i) => [col, row[i] ?? '']))
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return fail('missing authorization', 401);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    global: { headers: { Authorization: authHeader } },
  });

  // 1. Verify JWT identity.
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return fail('invalid or expired session', 401);
  const userId = userData.user.id;

  if (rateLimited(userId)) {
    const retry = new Headers(CORS_HEADERS);
    retry.set('Retry-After', '60');
    return new Response(JSON.stringify({ error: 'rate limited' }), { status: 429, headers: retry });
  }

  // 2. Resolve tenant from trusted membership, never client input.
  const { data: membership } = await supabase
    .from('staff')
    .select('tenant_id, role')
    .eq('user_id', userId)
    .maybeSingle();
  if (!membership) return fail('not a team member', 403);

  const { data: tenant } = await supabase
    .from('tenants')
    .select('sheet_id')
    .eq('id', membership.tenant_id)
    .single();
  const sheetId = tenant?.sheet_id || SHEET_ID;

  const url = new URL(req.url);
  const path = url.pathname;
  const sheetParam = url.searchParams.get('sheet') ?? '';

  try {
    if (req.method === 'GET' && path === '/' && sheetParam) {
      const known = ['track', 'issues', 'reviews', 'activity'];
      if (!known.includes(sheetParam)) return fail(`unknown sheet: ${sheetParam}`);
      const sheetName = sheetParam.charAt(0).toUpperCase() + sheetParam.slice(1);
      const values = await readSheet(`${sheetName}!A1:ZZ`);
      return json({ rows: rowsToJson(values) });
    }

    if (req.method === 'POST' && path === '/resolve') {
      const body = await req.json();
      const issueId = String(body.issue_id ?? '').trim();
      if (!issueId) return fail('issue_id is required');

      // n8n webhook authenticates via a shared secret header. The secret is never
      // visible to the browser; only the authenticated proxy may forward this action.
      const res = await fetch(`${N8N_WEBHOOK_URL}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-RV-Webhook-Secret': N8N_WEBHOOK_SIGNING_SECRET,
        },
        body: JSON.stringify({ issue_id: issueId, actor: userId }),
      });
      if (!res.ok) return fail('resolve action failed upstream', 502);
      return json({ ok: true });
    }

    return fail('not found', 404);
  } catch (err) {
    console.error('sheets-proxy error:', err);
    return fail('internal error', 500);
  }
});