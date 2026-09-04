# Review Engine

Automated Customer Follow-Up &amp; Google Review Management for local businesses.

The system watches a Google Sheet for completed services, emails each customer a
single personalized follow-up (feedback ask **and** a genuine, un-gated Google review
invitation in one message), detects issues in replies via LLM sentiment, alerts the
owner, tracks review-link clicks through a redirect, ingests Google reviews daily, and
shows the owner a clean KPIs dashboard.

**Status:** MVP build v0.1 (per `creation-guideline`) — see `docs/` for the full
intake: PRD, technical requirements, app flow, UI brief, data schema, implementation
plan.

## Architecture at a glance

```
Staff adds row ──► Google Sheet "Track" ──► n8n W1 ──► Gmail: single follow-up email
                                                    (feedback + review link, no gating)
Customer replies ─► Gmail trigger ─► n8n W2 ─► OpenRouter sentiment
                                            └─► Issue? ─► Issues sheet + owner alert
Customer clicks /r/<id> ─► Edge Function ─► n8n W5 (idempotent click) ─► 302 → Google review page
n8n W3 (daily)          ─► reminder when no click after M days
n8n W4 (daily)          ─► Google Business Profile intake (verified HTTP fallback)
Dashboard (React) ─► Supabase Edge "sheets-proxy" (JWT + RLS) ─► Sheets
```

- **Source of record:** Google Sheets (`Track`, `Issues`, `Reviews`, `Activity`, `Manual`).
- **Auth & proxy:** Supabase Auth + Edge Functions (browser never holds Google or n8n secrets).
- **Channel abstraction:** `channel` column on `Track` (default `email`); WhatsApp/Meta
  can be added later behind the same workflow route without a rebuild.

## Repository layout

```
docs/                     Six intake documents (PRD → implementation plan)
n8n/CREDENTIALS.md        Credential checklist + workflow notes + flagged gaps
n8n/workflows/            W1–W5 workflow JSON (placeholders only, not import-ready)
supabase/migrations/      0001_init.sql (tenants, staff, RLS, seeds)
supabase/functions/       sheets-proxy, review-redirect (Deno Edge Functions)
web/                      React + Vite + Tailwind dashboard
```

## Quick start

### 1. Google Sheets

Create a spreadsheet with tabs named exactly: `Track`, `Issues`, `Reviews`, `Activity`,
`Manual`. Add a header row to `Track` with the columns from
`docs/05-data-schema.md` (at minimum `id, customer_name, email, service,
completion_date, channel, status, review_link_id`). Share the spreadsheet with the
service-account email used in `sheets-proxy`.

### 2. Supabase

- Create a project, run `supabase/migrations/0001_init.sql` in the SQL editor.
- Enable Auth (email/password, email verification).
- Set Edge Function secrets (see `supabase/functions/*/index.ts` headers):
  `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GOOGLE_SHEETS_SERVICE_ACCOUNT`,
  `GOOGLE_SHEET_ID`, `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SIGNING_SECRET`, `GBP_REVIEW_URL`.
- Deploy the two functions (`supabase functions deploy sheets-proxy`, `review-redirect`).
- Invite the owner + staff into `auth.users` and insert `staff` rows (RRR requires
  owners to have `role = 'owner'`).

### 3. n8n

- Import the five workflows from `n8n/workflows/`.
- Read `n8n/CREDENTIALS.md` and configure credentials (never commit values).
- Replace every `__PLACEHOLDER__` before enabling production schedules.
- **W4 (Google Business Profile) is flagged HTTP FALLBACK** — verify the API/OAuth
  contract before enabling; use the `Manual` tab fallback until then.

### 4. Web dashboard

```bash
cd web
npm install
cp .env.example .env.local   # fill Supabase url/publishable key + functions URL
npm run dev
```

**No Supabase yet?** Run in mock mode — the dashboard renders instantly with sample
data (no login, no backend):

```bash
cd web
npm run dev   # mock mode is automatic when VITE_SUPABASE_URL is empty
```

Set `VITE_USE_MOCK=0` in `.env.local` once Supabase is connected.

## Security notes

- Browser code holds only `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and
  product identity. No service-role key, n8n URL, or Google credential ever ships to
  the browser.
- `sheets-proxy` verifies the JWT, resolves the tenant from the trusted `staff`
  membership, validates payloads, and rate-limits before any n8n call.
- `review-redirect` is a public endpoint that validates the link id, logs clicks
  idempotently, and only ever redirects.
- Enable RLS (on by default in the seed migration) and test cross-tenant denial with
  two users.

## Status

- [x] Six intake documents
- [x] Supabase migration + two Edge Functions
- [x] n8n W1–W5 (validation required before import — see `n8n/CREDENTIALS.md`)
- [x] React dashboard (Overview, Customers, Issues, Reviews, Settings)
- [ ] Client-provided product identity (name / logo / accent)
- [ ] GBP API verification (W4 gate)