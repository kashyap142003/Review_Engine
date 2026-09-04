# Review Engine — n8n Credential Checklist & Workflow Notes

> **Status:** Draft v0.1 — workflows are structurally complete but **not import-ready**
> until validated against the target n8n instance exactly as instructed in
> `source/registry.md`. Replace every `__PLACEHOLDER__` before running.

## Credential checklist (each client account configured in n8n by the owner)

| Credential key | Account owner | Used by | Notes |
| --- | --- | --- | --- |
| `googleSheetsOAuth2Api` | Business owner | W1–W5 | One OAuth app for Sheets; the spreadsheet must be shared with the configured email |
| `gmailOAuth2` | Business owner | W1, W2, W3 | Sending account + watched reply mailbox. Owner must add the reply-search filter under the Gmail Trigger search filter |
| `openRouterApi` | Operator | W2 | Model selected at `__OPENROUTER_MODEL__` (e.g. `openrouter/anthropic/claude-3.5-haiku`) |
| `googleOAuth2Api` (GBP) | Business owner | W4 | TypeVersion/credential contract must be verified; may need an HTTP Request with manual OAuth |

Secrets are placeholders only — no credential values are committed in this repo.

## Workflow summary

| File | Trigger | Steps (condensed) | Terminal outputs |
| --- | --- | --- | --- |
| `W1-follow-up-and-invite.json` | Sheets trigger: new `Track` row | validate email → **send one email** (feedback ask + review link, no gating) → write-back `contacted` → Activity | Track row updated; Activity event |
| `W2-reply-and-issue-detection.json` | Gmail trigger: reply email | extract reply → OpenRouter sentiment (structured) → branch on issue → create Issue row + alert owner, always also update Track | Issue row; owner alert; Track reply fields; Activity event |
| `W3-reminder.json` | Schedule: daily 10:00 | read Track → filter (contacted/replied, no click, M days old, not yet reminded) → reminder email → mark `reminded` | reminder email; Track update; Activity event |
| `W4-gbp-review-intake.json` | Schedule: daily 06:00 | HTTP Request GBP reviews → map → append Reviews → Activity | Reviews rows; Activity event |
| `W5-log-click.json` | Webhook: POST `/webhook/log-click` | validate auth secret + `review_link_id` → read Track → compute new count → update → Activity | Track click count incr.; Activity event |

## Placeholder replacements before import

| Placeholder | Meaning | Where |
| --- | --- | --- |
| `__GOOGLE_SHEET_ID__` | Spreadsheet id (worksheet names `Track`, `Issues`, `Reviews`, `Activity`, `Manual`) | Blade params in WS`≥1` node types |
| `__N8N_CREDENTIAL_ID__` / `__CONFIGURE_IN_N8N__` | Populated by n8n when the owner attaches their credentials | every credentialed node |
| `__OWNER_EMAIL__` | Alert recipient | W2 |
| `__REMINDER_DAYS__` | Reminder delay M (align with tenant.reminder_days) | W3 code node |
| `__OPENROUTER_MODEL__` | Model id | W2 |
| `__N8N_WEBHOOK_SIGNING_SECRET__` | Shared secret used by the Edge Function proxy + webhook nodes | WS`1`+W5 validate node, and Supabase Edge Function env |
| `__ACCOUNT_ID__`, `__LOCATION_ID__` | GBP account + location | W4 |
| `__SENDER_EMAIL__`, `__BUSINESS_NAME__` | Sending identity inside templates | W1/W3/W2 bodies |

## Required validation before these are import-ready (per automation-architect)

- [ ] Record target n8n version and installed node packages.
- [ ] Confirm exact `typeVersion`, operation, parameter schema, and credential key for
      **every** node against the target instance — especially `googleSheetsTrigger`,
      `gmail`, `gmailTrigger`, `@n8n/n8n-nodes-langchain.chainLlm`,
      `lmChatOpenRouter`, and `httpRequest`.
- [ ] Replace `service`/`business_name` fields referenced in email templates with real
      sheet column names, or add those columns to the `Track` sheet header.
- [ ] `__N8N_WEBHOOK_SIGNING_SECRET__` must match the Edge Function env value.
- [ ] W4 GBP HTTP contract verified (OAuth scope `business.manage`, quota, response
      shape). Until verified, use the `Manual` sheet tab fallback described in
      docs/05-data-schema.md.
- [ ] All branches terminate or rejoin deliberately; run in staging with a test sheet
      before production.

## Integration gaps flagged

- **Google Business Profile** has **no confirmed built-in n8n node** — flagged as
  `HTTP FALLBACK`; verify the OAuth2 credential + response shape before enabling W4.
- `googleSheetsTrigger` operation/`typeVersion` must be confirmed for the target
  instance (polling trigger vs column-trigger).
- The `gmailTrigger` search filter (`newer_than:2d`) is a starting heuristic; tune to
  avoid reprocessing replies.