// review-redirect — public review-link redirect that logs clicks.
//
// URL shape:  /review/:id
//   1. Validates the :id format.
//   2. Forwards a click event to the n8n "log-click" webhook (server secret header,
//      idempotent per review_link_id + ts) so n8n updates Track/Activity.
//   3. 302-redirects the customer to the configured Google review URL.
//
// Env (server-only):
//   N8N_WEBHOOK_URL, N8N_WEBHOOK_SIGNING_SECRET, GBP_REVIEW_URL

const N8N_WEBHOOK_URL = Deno.env.get('N8N_WEBHOOK_URL') ?? '';
const N8N_WEBHOOK_SIGNING_SECRET = Deno.env.get('N8N_WEBHOOK_SIGNING_SECRET') ?? '';
const GBP_REVIEW_URL = Deno.env.get('GBP_REVIEW_URL') ?? '';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

// Validate a review link id: uuid-like token derived from a Track row.
const ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function redirect(location: string) {
  return new Response('', { status: 302, headers: { Location: location } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });

  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);
  // Supports /review/:id and bare /:id.
  const id = (parts[parts.length - 1] ?? '').trim();

  if (!ID_RE.test(id)) {
    // Malformed ids look like bot noise; silently land on the review page rather
    // than leaking internal details.
    return redirect(GBP_REVIEW_URL);
  }

  // Best-effort click log; never fail the customer redirect on a logging error.
  try {
    await fetch(`${N8N_WEBHOOK_URL}/log-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RV-Webhook-Secret': N8N_WEBHOOK_SIGNING_SECRET,
      },
      body: JSON.stringify({
        review_link_id: id,
        ts: new Date().toISOString(),
        source: 'review-link',
      }),
    });
  } catch (err) {
    console.error('click log failed:', err);
  }

  return redirect(GBP_REVIEW_URL);
});