# Review Engine — Technical Requirements

**Status:** Approved draft v0.1
**Date:** 2026-08-09

## Approved Stack

- **Automation:** self-hosted n8n (Docker on VPS, or Railway/Render per client).
- **Frontend:** React + Vite + Tailwind CSS + Recharts. Hosted on Vercel.
- **Backend/data/auth:** Google Sheets is the **source of record**. Supabase provides
  Auth (email/password) and Edge Functions as the authenticated server proxy. No
  Postgres application data in the MVP beyond the `staff` membership table.
- **AI:** n8n AI/LangChain nodes with an OpenRouter chat model for reply sentiment
  analysis.
- **Channels:** email (Gmail) active; WhatsApp Business/Meta reserved behind the
  channel abstraction.

## Environment Topology

Three environments, kept separate wherever practical:

| Environment | Purpose | Supabase | n8n | Frontend |
| --- | --- | --- | --- | --- |
| dev | Local development | dev project | dev instance | Vite dev |
| staging | Client review, integration tests | staging project | staging n8n | Vercel preview |
| production | Live business | prod project | prod n8n | Vercel prod |

Each environment uses its own Google Sheets spreadsheet, Gmail source, and OpenRouter
credential.

## Required Integrations and Credential Owners

| Integration | Use | Credential/account owner | Node / mechanism |
| --- | --- | --- | --- |
| Google Sheets | Trigger + read/write Track/Issues/Reviews/Activity | Business owner (Google Workspace) | `googleSheets` (CORE), `googleSheetsTrigger` (CORE) |
| Gmail | Send follow-up/reminder emails; trigger on replies | Business owner mailbox | `gmail`, `gmailTrigger` (CORE) |
| OpenRouter | LLM sentiment classification | You (operator) | `lmChatOpenRouter` (AI CORE) |
| Google Business Profile | Daily review intake | Business owner | HTTP Request (HTTP FALLBACK — must verify API contract and OAuth scopes) |
| Supabase | Auth + Edge Functions proxy | You | Supabase project |
| n8n | Workflow executions | You | self-hosted |

Credential **values are never committed**. n8n workflows use placeholder credential
objects; the browser contains only the Supabase URL and publishable key.

## Trigger, Latency, Reliability, Observability, Retry

- **Trigger (W1):** `googleSheetsTrigger` fires on new `Track` rows. Fallback to a
  `scheduleTrigger` poll if trigger latency is unacceptable.
- **Latency:** W1 send within a minute of row creation; W2 reply handling near
  real-time; W4 GBP intake daily.
- **Reliability/retry:** Email send failures log to the `Activity` sheet and set the
  row to `failed` for manual review. Click logging is idempotent (event id stored per
  link).
- **Observability:** n8n execution history; `Activity` sheet appended for every
  event; dashboard reads the same data.
- **Rate limits:** Gmail send quota is far above 30 emails/month; GBP API quota is a
  TBD verification item.

## Authentication, Authorization, Tenant Model, Security, Compliance, Retention

- **Auth:** Supabase Auth, email/password. Email verification enabled. Owner (admin)
  invites staff.
- **Authorization:** Single tenant for MVP, identified by a fixed `tenant_id`.
  `staff` table stores trusted membership; RLS scopes reads to the tenant. The browser
  never supplies a tenant id; the Edge Function resolves identity from the JWT and
  verifies membership server-side.
- **Tenant model:** `staff (id, tenant_id, user_id, role)`; seed one tenant row.
- **Security:**
  - HTTPS everywhere.
  - RLS enabled; `staff` table policy: authenticated members of the tenant can read;
    owners (role `owner`) can insert/update staff.
  - Browser code contains no n8n webhook URL, no service-role key, no secrets.
  - Edge Functions are the *only* browser-facing proxies: verify JWT, validate
    payload, rate-limit, then call n8n/Sheets with server-only credentials.
  - Public `/r/:id` redirect endpoint validates the link id and logs via n8n; it does
    not expose Secrets.
  - Security headers per `secure-build` (CSP, HSTS, X-Frame-Options DENY,
    nosniff, referrer policy, permissions policy).
- **Compliance:** Customer data is names + emails. Provide an export/delete path for
  customer PII (documented in 05-data-schema.md).
- **Retention:** Sheet rows are kept while the client uses the system; a documented
  delete flow removes customer PII on request.

## Volume Estimates and Scale Limits

- ~30 customers/month, single business. Sheets free tier is sufficient.
- No batch processing required; each row is handled individually.
- Twelve-month ceiling assumed <2,000 rows. If exceeded, move the source of record to
  Supabase Postgres (out of MVP scope).

## Technical Decisions, Assumptions, and Risks

- **Decision:** Google Sheets is the source of record; the dashboard reads via a
  server proxy rather than directly from the browser (keeps API keys server-side and
  keeps Sheets honest as the single truth).
- **Decision:** Single email performs both the feedback ask and the review invitation
  (client-approved; no two-stage flow).
- **Decision:** Channel abstraction — `channel` column on `Track` defaults to `email`;
  workflows route on channel so a WhatsApp node later replaces the Gmail send step.
- **Risk (medium):** Google Business Profile has **no confirmed built-in n8n node**.
  Flagged `HTTP FALLBACK`; workflow W4 is delivered but marked not import-ready until
  the API/OAuth contract is verified. Fallback: manual review entries via the Sheets
  "Manual" tab.
- **Risk (low):** LLM classification can misfire; mitigation is a severity threshold
  and a review-by-owner path in the Issues tab.
- **Risk (low):** Sheets concurrency — n8n and Edge Functions may write concurrently;
  MVP volume makes this negligible. Logged through Append operation semantics.

## Verification Requirements (MVP Definition of Done)

1. n8n workflows W1–W5 import into a registry-validated n8n release without node
   errors (W4 held back pending GBP verification).
2. Sheets proxy and `/r/:id` Edge Functions pass local + staging tests with JWT, rate
   limit, and idempotency checks.
3. RLS test: two users — one in-tenant reads, out-of-tenant is denied; owner can
   manage staff; member cannot.
4. Dashboard renders all five pages with loading/empty/error states at desktop and
   tablet widths.
5. Security header scan passes on production preview.