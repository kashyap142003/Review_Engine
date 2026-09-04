# Review Engine — Product Requirements Document

**Status:** Approved draft v0.1
**Date:** 2026-08-09
**Working title:** Review Engine

## Problem

Local businesses often provide good service but fail to consistently collect Google
reviews because they lack a reliable customer follow-up process. Owners and staff
forget to ask for feedback, customers forget to leave reviews, and genuine customer
issues can go unnoticed. The result is fewer Google reviews, missed opportunities to
improve customer experience, and a weaker online reputation.

## Product Overview

Review Engine is an automated Customer Follow-Up & Google Review Management system for
local businesses. After a completed service, it automatically emails the customer for
feedback (including a genuine review invitation in the same message), detects issues
in replies, alerts the owner, tracks review engagement end-to-end, and reports KPIs on
a clean dashboard.

The system is intentionally **cost-effective and simple** for the MVP and is built on
n8n + email (Gmail) + Google Sheets + Google Business Profile. A communication-channel
abstraction means WhatsApp Business/Meta API can be added later without rebuilding the
core system.

## Target Users and Roles

| Role | Responsibility | Approx count |
| --- | --- | --- |
| Business Owner (admin) | Full dashboard access, resolves issues, manages staff, configures settings | 1 |
| Staff | Add completed-service rows to the Google Sheet, view follow-up status | 2–9 |

Single client organisation for the MVP (single tenant), with the schema left
tenant-aware for future multi-business rollout.

## Desired Outcomes and Success Criteria

1. Every completed service receives an automated follow-up within 24 hours.
2. Every eligible customer receives a genuine, un-gated Google review invitation.
3. Customer replies are analyzed; issues are flagged and the owner is alerted.
4. Review engagement is tracked end-to-end (invite → click → posted review).
5. The dashboard shows accurate KPIs: customers contacted, review requests sent,
   review-link clicks, new reviews, average rating, review growth, and issues
   detected/resolved.

### Measurable success criteria

- ≥95% of completed-service rows produce a sent follow-up email.
- 100% of eligible customers receive a review link in the follow-up email (no gating).
- Issue replies produce an owner alert same-day.
- Click-through and review events are reflected in the dashboard without manual entry
  (except the GBP API gap until verified — see [02-technical-requirements.md](02-technical-requirements.md)).

## In-Scope Features (MVP)

- Google Sheets trigger that starts a follow-up for each new completed-service row.
- Single personalized email per customer that asks for feedback **and** includes a
  genuine Google review invitation link (no review gating).
- Reply detection via Gmail Trigger; issue detection via LLM sentiment analysis.
- Owner alerting: email + dashboard badge when an issue is detected.
- Review-link click tracking through an `/r/<id>` redirect endpoint.
- Follow-up reminder email when a customer has not clicked the review link.
- Google Business Profile review intake (daily poll) written to the Reviews sheet.
- Dashboard: Overview (KPIs), Customers, Issues, Reviews, Settings.
- Channel abstraction so the delivery channel (email today, WhatsApp later) is
  configurable per customer and swapped without rebuilding workflows.

## In-Scope Explicitly Deferred / Out of Scope

- Multi-business tenancy (schema is tenant-aware but only single-tenant is wired).
- WhatsApp Business / Meta API implementation (only the channel abstraction ships).
- Booking-tool / calendar integrations (e.g. Calendly, Square).
- Promotional bulk email campaigns (non-follow-up marketing).
- Two-stage email flow (feedback email, then separate invite email). The approved flow
  is a single email containing both the feedback ask and the review link.
- CRM, payroll, or billing features.

## Core Use Cases and Acceptance Criteria

### UC-1: Completed service triggers a follow-up
- **Trigger:** A row is added to the `Track` sheet with a valid customer email.
- **Acceptance:** One personalized email is sent with the feedback ask and the unique
  review link; the row status becomes `contacted`; timestamps are written back.

### UC-2: Customer replies and reports an issue
- **Trigger:** Customer replies to the follow-up email.
- **Acceptance:** Reply is stored, LLM sentiment analysis qualifies it as an issue,
  an Issue row is created, and the owner is alerted by email with the reply snippet.

### UC-3: Every customer receives a genuine review invitation
- **Trigger:** Follow-up email send.
- **Acceptance:** The review link is present in every sent email regardless of known
  sentiment (no gating). Clicking it records a click and redirects to the Google
  review URL.

### UC-4: Owner resolves an issue
- **Trigger:** Owner marks an issue resolved in the dashboard.
- **Acceptance:** Issue status becomes `resolved` with a timestamp; badge count drops.

### UC-5: Reminder for no click
- **Trigger:** M days after the follow-up email with `review_click_count = 0`.
- **Acceptance:** A reminder email with the same link is sent and logged.

### UC-6: New Google review tracked
- **Trigger:** Daily GBP poll finds a new review.
- **Acceptance:** Review row is added, the matching Track row is marked reviewed, and
  dashboard KPIs update.

## Constraints, Assumptions, Dependencies, Open Questions

- **Volume:** <30 customers/month, single business. No LLM batching needed.
- **Stack:** n8n + Gmail + Google Sheets + Google Business Profile + React/Vite/Tailwind
  + Supabase (auth + edge proxy). See [02-technical-requirements.md](02-technical-requirements.md).
- **Assumptions:** Staff add rows to Google Sheets manually; owner has a Google Business
  Profile; Google Workspace/Gmail is available for sending and a reply mailbox is
  monitored.
- **Dependencies on third parties:** Google Business Profile API must be verified
  (scopes, OAuth, quota) before the GBP intake workflow is import-ready. Until then a
  manual-review fallback is used.
- **Open questions (TBD):** client product name/logo/accent; target n8n version and
  installed node list; sender domain; exact reminder delay (M days) and GBP verification.

## Review-Invitation Policy

Approved: **invite everyone, always.** Every eligible customer receives the genuine
review link in the single follow-up email — including customers who reported an issue.
This complies with Google's anti-gating policy.