# Design Tokens

**Status:** Approved — v2026-08

This file is the frontend skill's authoritative source. Every generated component must
theme off these tokens — no hardcoded hex values, pixel values, or font sizes in
component code.

## Color Roles

Colors are defined as **roles**, not fixed hexes. `--accent` is the only value that
changes per client/project; everything else stays constant across projects.

```css
:root {
  /* Light theme */
  --bg: #FAFAFA;
  --surface: #FFFFFF;
  --border: #E5E7EB;
  --text-primary: #111827;
  --text-secondary: #6B7280;
  --text-muted: #9CA3AF;

  --accent: #4F46E5;         /* project-supplied — placeholder shown */
  --accent-fg: #FFFFFF;      /* text/icon color on top of accent */

  --success: #16A34A;
  --warning: #D97706;
  --danger: #DC2626;
  --info: #2563EB;

  --focus-ring: color-mix(in srgb, var(--accent) 40%, transparent);
}

[data-theme="dark"] {
  --bg: #0B0B10;
  --surface: #16161D;
  --border: #26262F;
  --text-primary: #F3F4F6;
  --text-secondary: #9CA3AF;
  --text-muted: #6B7280;

  --accent: #6366F1;         /* slightly lighter for dark-mode contrast */
  --accent-fg: #FFFFFF;

  --success: #22C55E;
  --warning: #F59E0B;
  --danger: #EF4444;
  --info: #3B82F6;
}
```

Status colors (`success`/`warning`/`danger`/`info`) are used as a small dot + colored
text in tables, never as a full-row or full-cell background fill.

## Typography

```css
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;

--text-xs:   12px;  /* table meta, timestamps, labels */
--text-sm:   14px;  /* body, table cells, nav items */
--text-base: 16px;  /* card labels, secondary headings */
--text-lg:   20px;  /* section headings */
--text-2xl:  28px;  /* stat card big numbers */
--text-3xl:  32px;  /* page titles */

--weight-normal: 400;
--weight-medium: 500;
--weight-semibold: 600;
```

Rule: no more than two weights and three sizes on any single screen. Stat-card numbers
are the only place `--text-2xl`+`--weight-semibold` is used together.

## Spacing Scale (4px base unit)

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
--space-16: 64px;
```

Card internal padding: `--space-6`. Gap between cards in a grid: `--space-4`. Sidebar
internal padding: `--space-4`.

## Radius & Elevation

```css
--radius-sm: 6px;   /* buttons, inputs, status dots */
--radius-md: 10px;  /* cards */
--radius-lg: 16px;  /* modals, large panels */

--shadow-card: 0 1px 2px rgba(0,0,0,0.04);           /* light theme, subtle only */
--shadow-card-dark: 0 1px 2px rgba(0,0,0,0.4);
--shadow-none: none;  /* dark theme cards default to border-only, no shadow */
```

Cards use `border: 1px solid var(--border)` as the primary definition, with
`--shadow-card` as a light accent — never a heavy drop shadow.

## Layout

```css
--sidebar-width: 240px;
--sidebar-width-collapsed: 64px;
--topbar-height: 64px;

--breakpoint-tablet: 768px;
--breakpoint-desktop: 1024px;
--breakpoint-wide: 1440px;
```

- Below `--breakpoint-tablet`: sidebar collapses to an overlay/drawer, stat card grid
  goes to 1 column.
- `--breakpoint-tablet` to `--breakpoint-desktop`: stat card grid is 2 columns.
- Above `--breakpoint-desktop`: stat card grid is 4 columns (or as many as fit at
  min-width 220px per card).

## Component States

Every interactive element needs explicit hover/active/focus/disabled styling — don't
leave these to browser defaults.

```css
--state-hover-overlay: rgba(0,0,0,0.04);       /* light */
--state-hover-overlay-dark: rgba(255,255,255,0.06);
--state-active-overlay: rgba(0,0,0,0.08);
--state-disabled-opacity: 0.5;
```

- **Focus**: every focusable element gets `outline: 2px solid var(--focus-ring); outline-offset: 2px;` — never `outline: none` without a replacement.
- **Hover**: nav items and table rows get `--state-hover-overlay` as background, not a
  color/weight change.
- **Active nav item**: `background: var(--accent)` at low opacity (`color-mix(in srgb, var(--accent) 12%, transparent)`) + left border accent bar, text in `--accent`.
- **Disabled**: `opacity: var(--state-disabled-opacity); cursor: not-allowed;`

## Accessibility Rules

- Minimum contrast: 4.5:1 for body text, 3:1 for large text (≥20px) and icons —
  validate `--text-secondary` against both `--bg` and `--surface` in both themes.
- Minimum tap target: 44×44px for any icon-only button (sidebar icons, topbar icons).
- Every icon-only button needs an `aria-label`.
- Status dots must never be the *only* signal — always pair with text (e.g. "● Delivered", not just a colored dot).
- Charts: don't rely on color alone to distinguish series — use direct labels or distinct patterns/shapes where more than 2 series appear on one chart.

## Structural Pattern (from reference review)

- Persistent left sidebar: logo/product-name slot (not a fixed brand) → nav items →
  settings/sign-out pinned to bottom.
- Topbar: page title (`--text-3xl`) → context control (date range/filter) → utility
  icons → profile.
- Page body: stat card row (4-up, collapsing per breakpoints above) → chart section →
  table section.
- Table rows: no full-row background tint for status — status dot + text only, per
  Accessibility Rules above.
