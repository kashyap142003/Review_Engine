# Review Engine — UI Brief

**Status:** Approved draft v0.1
**Date:** 2026-08-09

> Visual authority: `n8n-suite/source/design/tokens.md`. No fixed brand identity is
> defined here — product name, logo, and accent color come from project configuration.

## Client Identity

- Product name: TBD (config via `VITE_PRODUCT_NAME`).
- Logo: TBD (config via `VITE_PRODUCT_LOGO_URL`).
- Accent color: TBD (config via `VITE_PRODUCT_ACCENT`; must satisfy token contrast
  rules). Placeholder `--accent: #4F46E5` until client supplies.
- Dark-mode preference: configurable via `VITE_DARK_MODE` toggle in the topbar.

## Pages and Primary Goals

| Page | Primary goal | Core content |
| --- | --- | --- |
| Overview | Understand performance at a glance | 4 stat cards → review-growth line chart → recent activity table |
| Customers | Operate follow-up records | Filterable/sortable Track table with per-row status |
| Issues | Resolve customer problems | Open-issue table with resolve action; resolved section |
| Reviews | Monitor reputation | Recent reviews table + average-rating summary card |
| Settings | Configure the system | Sheet id, Google review URL, channel config, automation status, staff management |

## Navigation Requirements

- **Sidebar (left):** product slot → nav items (Overview, Customers, Issues, Reviews)
  → Settings and Sign out pinned at bottom.
- **Topbar:** page title (`--text-3xl`) → date-range context control (default "Last 30
  days", presets 7/30/90) → issues badge (from open-issue count) → theme toggle →
  profile menu.
- Below tablet: sidebar becomes an accessible overlay/drawer; stat grid collapses to
  1 column.

## Metrics, Charts, Tables, Forms, Filters, Workflow Status

### Overview — 4 stat cards
1. Customers contacted (rows with `feedback_sent_at` set)
2. Review requests sent (rows with `review_sent_at` set)
3. Review-link clicks (sum of `review_click_count`)
4. New reviews (rows with `review_posted` true)

Then:
- **Review growth:** line chart of new reviews per week over selected range (>=1
  series; single series uses accent via `var(--accent)`; summary text below).
- **Recent activity:** `Activity` table filtered to the selected range (event, detail,
  timestamp) with status rendering as dot + text.

### Customers
- Columns: customer, service, channel (email), status (dot+text), feedback sent,
  last reply, review link clicks, reminders.
- Filters: status, channel; free-text search on customer name/email.
- Row statuses: `needs_info`, `contacted`, `replied`, `issue`, `reminded`, `reviewed`,
  `failed`.

### Issues
- Open issues (dot+text `open`), "Resolve" button (owner only), and a resolved section.
- Columns: customer, summary, severity (dot colored), reported, resolved.

### Reviews
- Average-rating summary card + recent reviews table (author, rating stars, text, date).

### Forms
- Login: email + password (password-manager-friendly, error/loading states).
- Settings: sheet spreadsheet id, Google review URL, reminder delay (M days), channel
  default select (email active; WhatsApp disabled label), staff invite form (owner
  only).

### Workflow-status needs
- Settings shows automation readouts: last follow-up run, last GBP sync, execution
  errors (surfaced from n8n via Activity/proxy), with a manual "Test connection" action.

## Desktop / Tablet / Mobile Priorities and Accessibility

- Desktop (>=1024px): 4-column stat grid, full sidebar.
- Tablet (768–1024px): 2-column stat grid, drawer sidebar.
- Mobile (<768px): 1-column stat grid, drawer sidebar, tables scroll horizontally
  (scroll wrapper), read-only emphasis.
- Accessibility: minimum 4.5:1 body contrast (tokens), 44×44px icon targets,
  aria-labels on icon buttons, status never color-only (dot + text), focus-visible
  rings from tokens, keyboard navigable tables/actions.

## Required States

- **Loading:** skeletons/spinners on proxy data, button spinners on resolve/invite.
- **Empty:** per-tab empty states with a clear next action.
- **Error:** inline banner + retry; no internal detail leaked.
- **Disabled:** resolve while in flight; invite while submitting; sign-out button text.
- **Permission-denied:** staff see no Settings management controls; server rejects any
  direct attempt.

## Layout Pattern (from tokens)

Persistent left sidebar → topbar (title, context control, utilities, profile) → page
body: stat-card row → chart section → table section. Cards use `1px solid
var(--border)` + minimal card shadow; no heavy elevation; status as small dot +
colored text only.