# Review Engine — Data Schema Draft

**Status:** Approved draft v0.1
**Date:** 2026-08-09

## Source of Record

**Google Sheets is the source of record.** It contains four tabs:

### 1. `Track` — follow-up ledger (staff-add → automation updates)

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (text) | Stable row id; used as `review_link_id` basis |
| `customer_name` | text | Required |
| `email` | text | Required trigger input |
| `phone` | text | Optional (future WhatsApp) |
| `service` | text | Service performed |
| `completion_date` | date | Date of completed service |
| `channel` | text | Communication channel, default `email` (abstraction for WhatsApp later) |
| `status` | text | `needs_info` / `contacted` / `replied` / `issue` / `reminded` / `reviewed` / `failed` |
| `feedback_sent_at` | timestamp | W1 email send time |
| `feedback_reply_at` | timestamp | Reply received time |
| `reply_text` | text | Raw reply body |
| `issue_flagged` | boolean | Issue detected |
| `issue_summary` | text | LLM summary |
| `issue_resolved_at` | timestamp | Marked resolved |
| `review_link_id` | text | Unique per-customer link id (slug of `id`) |
| `review_sent_at` | timestamp | Invite link sent (same email as feedback in single-email flow) |
| `review_click_count` | int | Clicks on `/r/<id>` |
| `last_clicked_at` | timestamp | Last click |
| `review_posted` | boolean | Review captured |
| `review_rating` | int | Rating 1–5 |
| `review_text` | text | Review body |
| `review_url` | text | Public review URL |
| `reminder_sent_at` | timestamp | Reminder send time |
| `created_at` | timestamp | Row creation |
| `updated_at` | timestamp | Last automation write |

### 2. `Issues` — derived by n8n
`id, track_id, customer_name, email, summary, severity, status (open|resolved), created_at, resolved_at`

### 3. `Reviews` — derived by n8n (GBP intake or Manual fallback)
`id, track_id (nullable), author, rating, text, url, captured_at`

### 4. `Activity` — event log (derived by n8n)
`id, ts, event (email_sent|reply_received|issue_flagged|click|reminder_sent|review_captured|failed), track_id, detail`

### 5. `Manual` — fallback input (owner/staff enter values; n8n consumes)
`review_link_id (or email), author, rating, text, url, captured_at`

No cross-tab FK enforcement is performed by Sheets; n8n validates referential fields
(`track_id`) before writing derived tabs.

## Powers: Who Writes What

| Tab | Writer | Reader(s) |
| --- | --- | --- |
| `Track` | Staff (insert), n8n (update) | Proxy/dashboard, n8n |
| `Issues` | n8n | Proxy/dashboard |
| `Reviews` | n8n (or Manual input) | Proxy/dashboard |
| `Activity` | n8n | Proxy/dashboard |
| `Manual` | Owner/staff | n8n |

## Supabase (MVP)

Supabase provides **auth + proxy only**. No Postgres app data beyond membership:

### `staff` table
| Column | Type | Purpose |
| --- | --- | --- |
| `id` | uuid pk | Row id |
| `tenant_id` | uuid | Tenant scope (fixed single tenant seeded) |
| `user_id` | uuid references `auth.users(id)` | Supabase Auth user |
| `role` | text `owner`/`member` | Role |
| `created_at` | timestamptz | Created |

### `tenants` table
`id uuid pk, name text, gbp_review_url text, sheet_id text, reminder_days int,
created_at`

### RLS intent

- `tenants`: authenticated users may read the row for their owned tenant only
  (via membership).
- `staff`: authenticated members of the tenant can `select` staff rows; role `owner`
  can `insert`/`update`/`delete` within the tenant. **No service-role key in browser.**
- `auth.users`: managed by Supabase Auth (not exposed).
- Edge Functions resolve the caller's tenant server-side from the verified JWT +
  membership; they never trust a client-supplied tenant id.

### Edge Function secret env (server-only)
`SUPABASE_SERVICE_ROLE_KEY` (scoped usage), `N8N_WEBHOOK_URL`, `N8N_WEBHOOK_SIGNING_SECRET`,
`GOOGLE_SHEETS_SERVICE_ACCOUNT`, `GOOGLE_SHEET_ID`.

## Validation / Indexing / Retention / Audit / File Storage

- **Validation:** email format + required fields at the Sheets trigger, at n8n write,
  and in the proxy before any dashboard-facing read or resolve action.
- **Indexing:** Sheets columns are not indexed; volume is <30 rows/mo. Filtering is
  client-side on proxy reads.
- **Retention:** rows persist while the client uses the system. Customer PII deletion
  = a staff/owner action (documented delete flow) that removes `Track` + child rows.
- **Audit:** `Activity` tab is the audit trail. Review-link click events are idempotent
  (per `review_link_id` + ts) to block double-credit.
- **File storage:** none in MVP. Sheet attachments unsupported.

## Data Origin Summary

| Data | Origin |
| --- | --- |
| Customer/service rows | Google Sheets (staff) |
| Email send/reply timestamps | n8n / Gmail |
| Sentiment labels + issue summaries | OpenRouter via n8n |
| Review-link clicks | `/r/:id` Edge Function → n8n |
| Google reviews | GB Business Profile (W4) or Manual |
| Authorised dashboard reads | Edge proxy (from Sheets), not raw browser access |

## Workflow Output/Input Contracts (stable, not arbitrary JSON)

Covered in 03-app-flow.md. Key invariants: every `track_id` referenced in Issues/
Reviews/Activity exists in `Track`; every `review_link_id` is unique; every click event
is idempotent.