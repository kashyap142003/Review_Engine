---
name: frontend
description: >
  Build white-label React, Vite, and Tailwind business interfaces: analytics
  dashboards, CRUD tables, settings pages, workflow-status views, login screens, and
  admin panels. Use for client-facing operational applications that must follow
  source/design/tokens.md, use configurable project branding, support tablet layouts,
  and integrate safely with Supabase and n8n-backed APIs.
---

# Frontend — White-label Business Dashboard System

## Purpose

Build usable, responsive business applications with React, Vite, Tailwind, and
Recharts. This skill is for product surfaces: analytics, operational tables, settings,
workflow monitoring, authentication, and administration.

Read source/design/tokens.md in full before designing or writing component code. It
is the authority for color roles, typography, spacing, elevation, layout, component
states, responsive rules, and accessibility. Do not replace it with an aesthetic from
another project.

## Inputs

Confirm or obtain:

- Product name, logo or text mark, accent color, and optional dark-mode preference.
- User roles, navigation items, pages, and primary user journeys.
- Data sources, loading/empty/error states, and permitted actions.
- Tables, filters, date ranges, chart metrics, and workflow statuses required.
- Supabase access pattern and the n8n workflow/API actions available to the UI.

Store client identity in project configuration. For example:

~~~js
export const product = {
  name: import.meta.env.VITE_PRODUCT_NAME,
  logoUrl: import.meta.env.VITE_PRODUCT_LOGO_URL,
  accent: import.meta.env.VITE_PRODUCT_ACCENT,
};
~~~

Apply the configured accent to the CSS variable --accent at application startup.
Never hardcode a product name, logo, accent, or replacement brand asset in a
component.

## Non-negotiable rules

### White-label identity

- Use only project configuration for product name, logo, and accent color.
- Do not add a vendor badge, attribution, mascot, or fixed identity.
- Do not use mascot art or stock illustrations of people. Prefer an empty-state icon,
  a compact diagram, or a clear text action.
- Do not hardcode a hex color, font size, spacing value, radius, or shadow in
  component files. Reference a token instead.

### Application shell

Use the token-defined sidebar plus topbar as the default authenticated layout:

- Persistent left sidebar on desktop: configurable product slot, navigation, then
  settings and sign-out pinned at the bottom.
- Topbar: current page title, context/date-range control, utility actions, and profile.
- Below tablet width, turn the sidebar into an accessible overlay or drawer.
- Use the token breakpoint names configured from tokens.md; do not rely on
  unreviewed default breakpoints.

Use a different layout only when the product flow genuinely requires it, such as a
public marketing page or a focused, single-purpose authentication screen.

### Visual system

- Use the 8-point spacing rhythm defined by the token scale.
- Stat cards use a one-pixel token border and only the token's minimal card shadow.
  Never use a heavy drop shadow.
- Use the token-defined radius and surface colors.
- Tables never use a full-row or full-cell status tint. Render status as a small dot
  plus colored status text. Status must also be readable without color.
- Use one coherent type scale. On a screen, use no more than three sizes and no more
  than two weights. Reserve the large stat-number treatment for stat values only.
- Implement hover, active, focus, and disabled states from tokens. Never remove a
  focus outline without the token-defined replacement.

### Charts

Prefer Recharts for bar, line, and donut charts. Bind chart strokes, fills, tooltip
styling, and legend labels to token roles. The project accent is the primary series
color through var(--accent), never a hardcoded chart palette.

When a chart has more than two series, distinguish series with direct labels, patterns,
or shapes in addition to color. Provide an accessible text summary for important
metrics.

### Responsive and accessible behavior

Every dashboard must work at tablet width at minimum:

- Below tablet: one stat-card column and sidebar drawer.
- Tablet to desktop: two stat-card columns.
- Desktop and wider: four columns where the page has four primary metrics.
- Preserve horizontal table access with a scroll wrapper when columns cannot reflow.
- Keep icon-only targets at the token-mandated minimum size and provide aria-labels.
- Pair every status dot with text. Support keyboard navigation and visible focus.

## Build process

1. Read source/design/tokens.md and configure Tailwind screen aliases to match its
   tablet and desktop breakpoints.
2. Define product configuration and install it as CSS variables at the application
   root. Reject an accent that does not meet the token accessibility requirements.
3. Create the app shell before page components: Sidebar, Topbar, responsive drawer,
   route outlet, and page padding.
4. Build reusable, token-driven primitives from the checklist below.
5. Implement each page using real loading, empty, error, and permission states—not
   only a happy-path mock.
6. Wire data through authenticated Supabase queries or a server-side API/proxy for
   n8n workflow actions. Do not expose n8n URLs, API keys, service-role keys, or
   database secrets to the browser.
7. Test desktop, tablet, keyboard focus, empty states, long names, and narrow tables.

## Component checklist

Every project should provide these reusable components. Component files must contain
zero hardcoded hex colors, font sizes, spacing values, shadows, or radii.

| Component | Required behavior |
| --- | --- |
| Sidebar | Configurable logo/name slot, active route state, bottom-pinned settings/sign-out, desktop persistence, tablet drawer. |
| Topbar | Route-derived page title, context or date-range control, utility actions, profile menu, accessible icon buttons. |
| StatCard | Token border/minimal shadow, label, stat value, optional comparison text; no decorative color block. |
| DataTable | Sortable and filterable; loading/empty/error states; responsive scroll wrapper; status dot plus text only. |
| ChartCard | Token surface/border; accessible title and text summary; Recharts series use token variables. |
| EmptyState | Small non-person illustration/icon or text, explanation, and optional clear action. |
| LoginScreen | Product configuration only; accessible labels, error state, loading state, password manager-friendly fields, no stock people or mascots. |

## Validation checklist

- [ ] source/design/tokens.md was read before implementation.
- [ ] Product name, logo, and accent come only from configuration.
- [ ] No fixed brand badge, mascot, stock-person illustration, or hardcoded identity.
- [ ] Component files contain no hardcoded hex values or visual dimension literals.
- [ ] Sidebar/topbar follows the token structural pattern and collapses to a drawer.
- [ ] Cards use token borders and minimal elevation.
- [ ] Tables show statuses as token-colored dot plus text, not a tinted row.
- [ ] The page uses at most three text sizes and two weights.
- [ ] Recharts reads colors from CSS variables; no hardcoded chart colors.
- [ ] Tablet layout, keyboard focus, disabled controls, loading, empty, and error
      states have been checked.
- [ ] Browser code contains no n8n secret, raw n8n webhook URL, Supabase service-role
      key, or other privileged credential.

## Worked example — Overview analytics page

This single-file page contains four stat cards, one token-themed bar chart, and a
recent-activity table. It assumes the token CSS has already been loaded and that
Tailwind aliases named tablet and desktop match the breakpoints in tokens.md.

~~~jsx
import { useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const metrics = [
  { label: 'Workflow runs', value: '12,480', change: '+8.2% vs prior period' },
  { label: 'Successful runs', value: '98.6%', change: '+0.9% vs prior period' },
  { label: 'Average duration', value: '42s', change: '-6s vs prior period' },
  { label: 'Exceptions', value: '18', change: '-12 vs prior period' },
];

const volume = [
  { day: 'Mon', runs: 1840 },
  { day: 'Tue', runs: 2110 },
  { day: 'Wed', runs: 1960 },
  { day: 'Thu', runs: 2270 },
  { day: 'Fri', runs: 2430 },
  { day: 'Sat', runs: 920 },
  { day: 'Sun', runs: 950 },
];

const activity = [
  { id: 'run_1024', workflow: 'Invoice intake', status: 'Completed', tone: 'success', time: '2 min ago' },
  { id: 'run_1023', workflow: 'Lead enrichment', status: 'Review needed', tone: 'warning', time: '8 min ago' },
  { id: 'run_1022', workflow: 'Daily summary', status: 'Completed', tone: 'success', time: '16 min ago' },
  { id: 'run_1021', workflow: 'Customer sync', status: 'Failed', tone: 'danger', time: '24 min ago' },
];

const toneColor = {
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  info: 'var(--info)',
};

function Card({ children, className = '' }) {
  return (
    <section
      className={[
        'rounded-[var(--radius-md)] border border-[color:var(--border)]',
        'bg-[color:var(--surface)] p-[var(--space-6)] shadow-[var(--shadow-card)]',
        className,
      ].join(' ')}
    >
      {children}
    </section>
  );
}

function StatCard({ label, value, change }) {
  return (
    <Card>
      <p className="text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">
        {label}
      </p>
      <p className="mt-[var(--space-2)] text-[length:var(--text-2xl)] font-semibold text-[color:var(--text-primary)]">
        {value}
      </p>
      <p className="mt-[var(--space-2)] text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">
        {change}
      </p>
    </Card>
  );
}

function Status({ label, tone }) {
  const color = toneColor[tone] ?? 'var(--text-muted)';

  return (
    <span
      className="inline-flex items-center gap-[var(--space-2)] text-[length:var(--text-sm)] font-medium"
      style={{ color }}
    >
      <span
        aria-hidden="true"
        className="h-[var(--radius-sm)] w-[var(--radius-sm)] rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface)] p-[var(--space-3)] shadow-[var(--shadow-card)]">
      <p className="text-[length:var(--text-sm)] font-medium text-[color:var(--text-primary)]">
        {label}
      </p>
      <p className="mt-[var(--space-1)] text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">
        {payload[0].value} runs
      </p>
    </div>
  );
}

export default function OverviewPage() {
  const [query, setQuery] = useState('');
  const visibleActivity = useMemo(
    () => activity.filter((item) => item.workflow.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <main className="min-w-0 bg-[color:var(--bg)] p-[var(--space-4)] tablet:p-[var(--space-6)]">
      <div className="mx-auto flex max-w-full flex-col gap-[var(--space-6)]">
        <header className="flex flex-col gap-[var(--space-4)] desktop:flex-row desktop:items-center desktop:justify-between">
          <div>
            <h1 className="text-[length:var(--text-3xl)] font-semibold text-[color:var(--text-primary)]">
              Overview
            </h1>
            <p className="mt-[var(--space-2)] text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">
              Operational activity for the selected period
            </p>
          </div>
          <button
            type="button"
            className="min-h-[var(--topbar-height)] rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface)] px-[var(--space-4)] text-left text-[length:var(--text-sm)] font-medium text-[color:var(--text-primary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--focus-ring)] focus-visible:outline-offset-2"
          >
            Last 7 days
          </button>
        </header>

        <section aria-label="Key metrics" className="grid grid-cols-1 gap-[var(--space-4)] tablet:grid-cols-2 desktop:grid-cols-4">
          {metrics.map((metric) => <StatCard key={metric.label} {...metric} />)}
        </section>

        <Card>
          <div className="flex flex-col gap-[var(--space-2)]">
            <h2 className="text-[length:var(--text-sm)] font-semibold text-[color:var(--text-primary)]">
              Workflow volume
            </h2>
            <p className="text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">
              Daily workflow runs. Peak: 2,430 on Friday.
            </p>
          </div>
          <div className="mt-[var(--space-6)] h-[calc(var(--space-16)*4)]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volume} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--state-hover-overlay)' }} />
                <Bar dataKey="runs" fill="var(--accent)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex flex-col gap-[var(--space-4)] tablet:flex-row tablet:items-center tablet:justify-between">
            <div>
              <h2 className="text-[length:var(--text-sm)] font-semibold text-[color:var(--text-primary)]">
                Recent activity
              </h2>
              <p className="mt-[var(--space-1)] text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">
                Latest workflow executions
              </p>
            </div>
            <label className="text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">
              <span className="sr-only">Filter workflows</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter workflows"
                className="min-h-[var(--topbar-height)] w-full rounded-[var(--radius-sm)] border border-[color:var(--border)] bg-[color:var(--surface)] px-[var(--space-3)] text-[length:var(--text-sm)] font-medium text-[color:var(--text-primary)] placeholder:text-[color:var(--text-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--focus-ring)] focus-visible:outline-offset-2 tablet:w-auto"
              />
            </label>
          </div>
          <div className="mt-[var(--space-6)] overflow-x-auto">
            <table className="w-full min-w-max border-collapse text-left text-[length:var(--text-sm)]">
              <thead className="border-b border-[color:var(--border)] text-[color:var(--text-secondary)]">
                <tr>
                  <th className="p-[var(--space-3)] font-medium">Workflow</th>
                  <th className="p-[var(--space-3)] font-medium">Status</th>
                  <th className="p-[var(--space-3)] font-medium">Last run</th>
                </tr>
              </thead>
              <tbody>
                {visibleActivity.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-[color:var(--border)] last:border-b-0 hover:bg-[color:var(--state-hover-overlay)]"
                  >
                    <td className="p-[var(--space-3)] font-medium text-[color:var(--text-primary)]">{item.workflow}</td>
                    <td className="p-[var(--space-3)]"><Status label={item.status} tone={item.tone} /></td>
                    <td className="p-[var(--space-3)] font-medium text-[color:var(--text-secondary)]">{item.time}</td>
                  </tr>
                ))}
                {!visibleActivity.length && (
                  <tr>
                    <td colSpan="3" className="p-[var(--space-6)] text-[length:var(--text-sm)] font-medium text-[color:var(--text-secondary)]">
                      No activity matches this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </main>
  );
}
~~~

For a complete page, render OverviewPage inside the reusable Sidebar and Topbar shell.
The page intentionally contains no product identity; the shell reads it from project
configuration.
