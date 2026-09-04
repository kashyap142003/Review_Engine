# Review Engine — Implementation Plan

**Status:** Approved draft v0.1
**Date:** 2026-08-09

Sequenced phases with owner, dependency, validation, and acceptance condition. Owner
keys: **You** (operator), **Client** (business owner), **Both**.

---

## Phase 1 — Confirm scope, access, and integration credentials

- **Work:** Confirm single-email flow (done), single tenant (done); obtain client
  Google Workspace/Gmail access + Google Business Profile; obtain/confirm Supabase,
  OpenRouter, n8n environments; capture client product identity (name/logo/accent).
  **Verify the Google Business Profile API contract** (endpoints, OAuth scopes, quota)
  — the only open integration; holds W4 import-readiness.
- **Owner:** Both. **Dependency:** client accounts. **Validation:** checklist signed
  off. **Acceptance:** all integrations reachable; one registry-reviewed n8n install.

## Phase 2 — Supabase schema, Auth config, RLS, seed users

- **Work:** Create `supabase/migrations/0001_init.sql` (`tenants`, `staff`, RLS +
  helper `current_tenant_id()`), configure Auth (email/password, email verification),
  seed owner + one test staff user, create the two Edge Functions.
- **Owner:** You. **Dependency:** Phase 1. **Validation:** two real test users — one
  in-tenant (reads OK), one out-of-tenant (denied); owner manages staff, member cannot;
  RLS test script passes. **Acceptance:** Postgres migration green; auth flows work.

## Phase 3 — n8n workflows and input/output contracts

- **Work:** Build workflows (see handoff below) with credential placeholders:
  - **W1 Follow-up & invite (single email):** Sheets Trigger → validate → send one
    email (feedback + review link) → write-back → Activity.
  - **W2 Reply & issue detection:** Gmail Trigger → store reply → OpenRouter sentiment
    → branch on issue → write Issue + owner email alert; never withholds review link.
  - **W3 Reminder:** Schedule (daily) → no click within M days → reminder email.
  - **W4 GBP intake:** Schedule (daily) → HTTP Request GBP API → Reviews + Track
    update. **Held back until API verified**; Manual-tab fallback during gap.
  - **W5 Log click:** Webhook (server-secret + rate limit) → idempotent click log →
    Activity + Track.
- **Owner:** You. **Dependency:** registry review, Phase 1 credentials. **Validation:**
  each node type/parameter/credential key checked against `source/registry.md`; JSON
  parses; runs against staging Sheet; W4 re-verified once GBP contract known.
  **Acceptance:** W1–W3, W5 import-ready; W4 documented behind GBP gate.

## Phase 4 — Server-side proxy / Edge Functions

- **Work:** `sheets-proxy` (JWT-verified Sheets reads + resolve-issue writes) and
  `review-redirect` (validate `/r/:id`, idempotent log via n8n, 302 to review URL).
  Wire server-only envs: `N8N_WEBHOOK_URL`, signing secret, service-role client.
- **Owner:** You. **Dependency:** Phase 2–3. **Validation:** requests without/with
  stale JWT rejected; payload validation; rate-limit 429; browser never sees secrets;
  click path idempotent. **Acceptance:** proxy E2E green in dev/staging.

## Phase 5 — React application shell + reusable UI

- **Work:** Vite + React + Tailwind + Recharts; token CSS from `tokens.md`; Tailwind
  breakpoint aliases; product config applied at startup; shell components (Sidebar,
  Topbar, StatCard, DataTable, ChartCard, EmptyState, LoginScreen) with loading/
  empty/error/disabled/permission states.
- **Owner:** You. **Dependency:** Phase 4 contracts. **Validation:** no hardcoded
  visual literals; tokens only; tablet layout; a11y checklist from frontend skill.
  **Acceptance:** shell renders all states at desktop + tablet.

## Phase 6 — Pages against verified data contracts

- **Work:** Overview (KPIs + growth chart + recent activity), Customers (filterable
  status table), Issues (resolve flow), Reviews (avg + list), Settings (sheet id,
  review URL, reminder days, channel select, staff invite via proxy).
- **Owner:** You. **Dependency:** Phase 4–5. **Validation:** each page uses the stable
  contracts from 03/05; filters, empty/error, permission states.
  **Acceptance:** both roles complete journeys J1–J6 in staging.

## Phase 7 — Test failures, isolation, authorization, responsiveness, a11y

- **Work:** Failure injection (bad email → `needs_info`; send failure → `failed`);
  RLS cross-tenant denial; click idempotency; reminder eligibility; tablet widths;
  keyboard/focus; contrast; empty/long-name tables.
- **Owner:** You. **Dependency:** Phases 2–6. **Validation:** checklist in each skill.
  **Acceptance:** no cross-tenant read; no gating violation; states correct.

## Phase 8 — Deploy to staging → approval → production

- **Work:** Deploy frontend (Vercel) + Edge Functions + n8n; security headers; CSP
  Report-Only then enforce; configure domain, redirects, production envs. Present to
  owner; obtain sign-off; enable production workflow schedules.
- **Owner:** Both. **Dependency:** Phases 1–7. **Validation:** header scan; staging
  demo with real data; production smoke. **Acceptance:** owner approves release.

## Phase 9 — Monitor after release

- **Work:** Track n8n executions, Activity, click idempotency, GBP quota; watch for
  `failed` rows, RLS or proxy errors; periodic KPI sanity vs Sheets.
- **Owner:** Both. **Dependency:** Phase 8. **Validation:** weekly review. **Acceptance:**
  two consecutive clean weeks; changes routed through the intake process.

---

## Handoff: automation-architect.md

- **Inputs provided above:** named workflows W1–W5 with trigger → steps → conditions →
  outputs; integrations (Google Sheets, Gmail, OpenRouter, GBP-flagged HTTP, n8n
  webhook); contracts in 03/05; scheduling/retries/idempotency/rate needs; LLM task
  (reply sentiment, structured output `{is_issue, severity, summary}`, OpenRouter
  model, ≤30/msg per reply — no batching).
- Credits: Google Sheets OAuth2, Gmail OAuth2, OpenRouter API, GBP HTTP (verify),
  n8n webhook signing secret. Placeholders only; never credential values.
- **Registry gaps:** Google Business Profile not confirmed (flagged `HTTP FALLBACK`);
  confirm n8n release + installed node list before JSON generation.

## Handoff: frontend.md

- Page map, roles, permission boundaries (03), metrics/tables/filters/charts/statuses
  (04), Edge Function actions + contracts (03/04), tokens.md authority, product
  identity from config, dark-mode, tablet/mobile + a11y requirements.

## Handoff: secure-build.md

- Supabase Auth (email/password + email verify), roles, single tenant + fixed
  `tenant_id`, RLS intent (05), sensitive data = customer PII + retention/delete,
  public `/r/:id` inbound webhook with idempotency + rate limit, server-only
  credentials, hosting/env + release gates.

## Completion checklist

- [x] Request classified; facts collected; three open TBDs recorded (identity, n8n
      version/node list, GBP API verification).
- [ ] All six documents exist in order. (In progress.)
- [ ] Workflows have unambiguous trigger/steps/conditions/outputs.
- [ ] Integrations, data owners, volume, tenant, auth, hosting, timeline documented.
- [ ] UI and workflow contracts agree.
- [ ] Handoff inputs ready for automation-architect, frontend, secure-build.
- [ ] Assumptions + approvers visible before implementation.