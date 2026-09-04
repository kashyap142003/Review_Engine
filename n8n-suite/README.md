# n8n Suite

**Version:** v2026-08  
**Status:** Complete — v2026-08

## Purpose

n8n Suite is a white-label skill bundle for planning, building, securing, and
validating client-specific automation systems and business dashboards. It turns a
plain-language project request into documented requirements, safe n8n workflows,
Supabase-backed application architecture, and responsive React interfaces without
embedding any vendor identity in the delivered product.

## Supported Stack

- **Automation:** self-hosted n8n, deployed per client on Docker, Railway, Render, or
  a VPS.
- **Frontend:** React, Vite, and Tailwind; Ant Design is allowed for data-dense
  administration interfaces.
- **Backend, data, and auth:** Supabase Postgres, Supabase Auth, Row-Level Security,
  and Supabase Edge Functions or an equivalent server API route.
- **Hosting:** Vercel or Netlify for the frontend; Docker/Railway/Render/VPS for n8n.
- **AI:** n8n AI Agent and LangChain nodes, with OpenRouter supported as a model
  provider fallback.

## Bundle Layout

~~~text
n8n-suite/
├── README.md
├── source/
│   ├── skills/
│   │   ├── automation-architect.md
│   │   ├── frontend.md
│   │   ├── secure-build.md
│   │   └── creation-guideline.md
│   ├── registry.md
│   └── design/
│       └── tokens.md
~~~

## Skill Responsibilities

### creation-guideline

This is the entry point for a new project or significant feature. It gathers
requirements and produces a PRD, technical requirements document, app flow, UI brief,
data schema draft, and implementation plan in that order. It converts approved facts
into explicit handoffs for the automation, frontend, and security skills; it does not
skip unknown decisions or directly build an undocumented system.

### automation-architect

This skill transforms an approved workflow requirement into n8n workflow JSON. It
maps trigger, steps, conditions, and outputs to real nodes, requires node and parameter
checks against the registry and target instance, uses credential placeholders instead
of secrets, and calls out integrations that require a community-node installation. It
hands workflow input/output contracts and credential requirements back to the system,
but does not build UI, deploy n8n, or expose credentials.

### frontend

This skill builds the client-facing React/Vite/Tailwind product surface: dashboard
shells, analytics, CRUD tables, settings, workflow-status pages, and login screens.
It uses the design tokens as the visual authority, reads product identity only from
project configuration, and consumes approved Supabase and server-proxy contracts. It
does not invent integrations, tenant rules, brand identity, or unsafe direct calls to
n8n.

### secure-build

This skill provides the production security boundary around the stack. It configures
Supabase Auth/session handling, tenant-scoped RLS, safe secrets, protected n8n webhook
proxies, input validation, rate limiting, and deployment security headers. It supplies
the security rules and verification checks that the workflow and frontend layers must
honor; it does not replace project-specific authorization or compliance decisions.

## Authoring Principles

- **White-label by default:** Product name, logo, accent color, and dark-mode choices
  come from project configuration. The bundle adds no vendor badge, mascot, fixed
  identity, or stock-person illustration.
- **Token-driven UI:** source/design/tokens.md is the visual authority. Components use
  semantic token roles rather than hardcoded colors, spacing, typography, radius, or
  shadow values. Interfaces use the sidebar/topbar shell by default and remain usable
  through tablet width.
- **Secure client/server boundary:** Browser code contains only public configuration.
  Secrets, privileged Supabase keys, raw n8n webhook URLs, and third-party credentials
  stay in server-side secret storage. Browser workflow actions go through an
  authenticated, validated, rate-limited server proxy.
- **Authorization in depth:** Supabase Auth identifies users; RLS enforces row access;
  tenant data is scoped by trusted membership and tenant_id, not a client-supplied
  value. Server code rechecks identity and authorization before privileged work.
- **Deliberate validation:** Treat browser, form, webhook, API, and LLM output as
  untrusted. Validate inputs at the client, server boundary, and database constraint
  level, and test loading, empty, error, permission, and tenant-isolation states.

## Validation Approach

The automation skill validates a workflow before calling it import-ready. Every node
type must exist in the registry and target instance; its typeVersion, operation,
parameters, and credential key must match the installed node definition. Node names and
IDs must be unique, connections must target real nodes, branches must terminate or
rejoin deliberately, and AI model links must use the correct AI connection type.
Credentials must be placeholders only, expressions must reference upstream data, and
side-effecting steps need appropriate failure behavior. The final workflow must parse
as JSON and match the target n8n release. If any check cannot pass, the skill reports
the gap instead of producing a falsely import-ready workflow.

## Status

Complete — v2026-08
