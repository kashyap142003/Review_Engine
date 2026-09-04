# Review Engine — App Flow

**Status:** Approved draft v0.1
**Date:** 2026-08-09

## Authentication and First Landing

1. Unauthenticated users hitting any route are redirected to `/login`.
2. Login uses Supabase email/password with email verification. Owner account is
   provisioned by the operator; staff are invited from Settings by the owner.
3. On successful sign-in, the user lands on `/` (Overview).

## Page Map and Navigation

| Route | Page | Primary goal |
| --- | --- | --- |
| `/login` | Sign in | Authenticate |
| `/` | Overview | View KPIs, review growth, recent activity |
| `/customers` | Customers | Manage follow-up records |
| `/issues` | Issues | Detect + resolve customer issues |
| `/reviews` | Reviews | Review intake and average rating |
| `/settings` | Settings | Configure sheet, review URL, channel, staff |

Navigation: persistent left sidebar (product slot → nav → settings/sign-out pinned at
bottom), 240px desktop, collapsible drawer below tablet (768px). Topbar holds page
title, a date-range control, and a profile menu with an issues badge count.

### Permission Boundaries

- Staff and owner both see all tabs (read).
- Only owner can invite/remove staff and edit Settings (server + RLS enforced).
- Sign-out clears local session state.

## Main User Journeys

### J1 — Staff adds a completed service (keyboard / sheet)
```
Staff → Google Sheet "Track" (new row) → googleSheetsTrigger
→ validate (email present, not duplicate id)
→ generate review_link_id
→ send ONE email: feedback ask + review link /r/<id>   [no gating]
→ write back: status=contacted, feedback_sent_at, channel
→ append Activity row
→ SUCCESS state: row visible in Customers table as "Contacted"
→ EXCEPTION: missing email → status=needs_info; send failure → status=failed (Activity logged)
```

### J2 — Customer replies
```
Customer replies to follow-up email → gmailTrigger
→ store reply_text, feedback_reply_at on Track
→ LLM sentiment via OpenRouter (structured output: {is_issue, severity, summary})
→ decision:
     issue=true  → create Issue row; alert owner (email owner + dashboard badge)
     issue=false → no alert (review link already sent in J1)
→ review invitation is NOT withheld (no gating)
```

### J3 — Customer clicks the review link
```
Customer clicks /r/<id> → Edge Function review-redirect (public)
→ validate id format + exists (via n8n webhook check) → idempotent log (registration stored)
→ call n8n webhook "log-click" (server secret, rate limited)
→ 302 Redirect → configured Google review URL
→ Track updated: review_click_count+1, last_clicked_at
```

### J4 — Owner resolves an issue
```
Owner → Issues tab → "Resolve" → Edge Function sheets-proxy (JWT)
→ update Issue row status=resolved, resolved_at
→ update Track issue_resolved_at
→ badge count decreases
```

### J5 — Reminder when no click
```
n8n schedule (daily) → query Track where status=contacted and last_clicked_at is null
  and feedback_sent_at older than M days and reminder_sent_at is null
→ send reminder email with the same review link
→ write reminder_sent_at, append Activity row
→ EXCEPTION: send failure → logged, not silenced
```

### J6 — GPB review intake
```
n8n schedule (daily) → HTTP Request → Google Business Profile API (OAuth)
→ new/updated reviews → append Reviews rows; match Track by review_link_id/email
→ mark Track review_posted, review_rating, review_text, review_url
→ KPIs update
→ EXCEPTION/non-verified API: manual review entry via "Manual" sheet tab as fallback
```

## Data Exchanged Between Layers

```
React (browser) ──JWT──► Supabase Edge Function ──server-only──► n8n webhook (log-click only)
React (browser) ──JWT──► Supabase Edge Function ──server-only──► Google Sheets API (proxy reads + resolve)
n8n ──► Google Sheets API (write/read Track, Issues, Reviews, Activity)
n8n ──► Gmail API (send emails, trigger replies)
n8n ──► OpenRouter API (sentiment)
n8n ──► Google Business Profile API (W4, daily)
```

Stable contracts:

- **Track row** (read): `{ id, customer_name, email, phone, service, completion_date,
  channel, status, feedback_sent_at, feedback_reply_at, reply_text, issue_flagged,
  issue_summary, issue_resolved_at, review_link_id, review_sent_at,
  review_click_count, last_clicked_at, review_posted, review_rating, review_text,
  review_url, reminder_sent_at, created_at, updated_at }`
- **Reply event:** `{ track_id, reply_text, reply_at, is_issue, severity, summary }`
- **Click event:** `{ review_link_id, ip_hash, ts }`
- **Review event:** `{ review_link_id | email, author, rating, text, url, captured_at }`
- **Issue event:** `{ track_id, summary, severity, status, created_at, resolved_at }`

## States

- **Loading:** per-page skeleton/spinner while the proxy resolves.
- **Empty:** each tab shows an empty-state message + primary action (e.g. "Add a
  customer row to the Track sheet").
- **Error:** banner with retry; proxy errors never leak internals.
- **Permission-denied:** Settings/Manage-staff controls are hidden for staff; any
  direct API attempt is rejected by RLS/server with a generic error.
- **Disabled:** resolve buttons disable while a request is in flight; rate-limited
  actions return a clear message.