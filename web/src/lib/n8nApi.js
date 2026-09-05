// n8nApi.js - Direct n8n webhook client (no Supabase needed for MVP)
// All data flows through n8n which reads/writes Google Sheets.
//
// In mock mode (VITE_USE_MOCK=1 or env not set), the mock data layer is used instead.
// In live mode, set:
//   VITE_N8N_BASE_URL=https://your-app.up.railway.app/webhook
//   VITE_N8N_API_TOKEN=your_secret_token   (any random string you set in n8n)

const N8N_BASE = import.meta.env.VITE_N8N_BASE_URL?.replace(/\/$/, '') ?? '';
const API_TOKEN = import.meta.env.VITE_N8N_API_TOKEN ?? '';

// Reads the password from localStorage (set by the simple login page)
function getStoredToken() {
  return localStorage.getItem('re_token') ?? '';
}

async function n8nRequest(path, options = {}) {
  const url = options.isAbsolute ? path : `${N8N_BASE}${path}`;
  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Bypass-Tunnel-Reminder': 'true',
      'ngrok-skip-browser-warning': 'true',
      'x-api-token': API_TOKEN,
      'x-session-token': getStoredToken(),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `n8n request failed (${res.status})`);
  }

  return res.json().catch(() => ({}));
}

// Fetch all sheets in one call - n8n aggregates them
export async function n8nFetchOverview() {
  const data = await n8nRequest('/data');
  return {
    track: { rows: data.track ?? [] },
    issues: { rows: data.issues ?? [] },
    reviews: { rows: data.reviews ?? [] },
    activity: { rows: data.activity ?? [] },
    competitors: { rows: data.competitors ?? [] },
  };
}

// Resolve an issue - n8n webhook updates the Issues sheet row
export async function n8nResolveIssue(issueId) {
  return n8nRequest('/resolve-issue', {
    method: 'POST',
    body: { issue_id: issueId },
  });
}

// Add customer lead manually to the Track sheet via n8n
export async function n8nAddCustomer(customerData) {
  return n8nRequest('/add-customer', {
    method: 'POST',
    body: customerData,
  });
}

// Trigger manual SerpAPI sync
export async function n8nSyncReviews() {
  const path = import.meta.env.VITE_N8N_SYNC_URL || '/webhook-test/sync-reviews';
  return n8nRequest(path, { method: 'POST', isAbsolute: true });
}

// Verify the password against n8n
export async function n8nVerifyPassword(password) {
  const res = await fetch(`${N8N_BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-token': API_TOKEN },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) return false;
  const data = await res.json().catch(() => ({}));
  return data.ok === true;
}
