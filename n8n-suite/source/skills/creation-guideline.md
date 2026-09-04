---
name: creation-guideline
description: >
  Run structured project intake before designing an n8n automation, React dashboard,
  or full client system. Use for a new project, feature request, client brief, or
  automation idea that needs requirements gathering, a PRD, technical requirements,
  app flow, UI brief, data schema draft, and implementation plan before work begins.
---

# Creation Guideline — Project Intake and Handoff

## Purpose

Turn an unstructured request into an approved, buildable project definition before
creating a dashboard, workflow JSON, database schema, or application code.

For every new project or meaningful feature, gather the missing information, write the
six documents below in order, obtain confirmation for material assumptions, then hand
the relevant information to the downstream skills:

1. PRD
2. Technical Requirements Document
3. App Flow
4. UI Brief
5. Data Schema Draft
6. Implementation Plan

For a small, fully specified change, compress the intake to the missing sections only.
State which sections were omitted and why. Do not skip the process for a new dashboard,
automation, or multi-system build.

## Intake process

### 1. Classify the request

Choose the smallest appropriate intake depth:

| Request maturity | Intake response |
| --- | --- |
| Idea only | Ask the standard question set, then produce all six documents. |
| Partial requirement | Confirm known facts, ask only for gaps, then produce all six documents. |
| Detailed specification | Validate contradictions and missing operational details, then write concise documents. |
| Small, self-contained modification | Capture the affected flow, data, security impact, and implementation steps. |

Classify the delivery shape as one or more of:

- Automation only
- Dashboard/application only
- Full system: automation plus dashboard/application
- Data/security foundation

For a full system, define workflow and data contracts before finalizing UI behavior.

### 2. Ask the standard question set

Ask questions in short rounds. Do not ask for facts already supplied. Record decisions,
unknowns, owners, and assumptions.

#### Users and outcomes

1. Who will use this system? List roles, responsibilities, and approximate user count.
2. What task is difficult today, and what measurable result would indicate success?
3. Which features are essential for the first release? What is explicitly out of scope?

#### Core workflows

4. What operational workflows should be automated from trigger to outcome?
5. What starts each workflow: user action, schedule, incoming webhook, form, or app event?
6. What decisions, approvals, retries, exceptions, and notifications does each workflow need?
7. Which outputs are created or changed: records, documents, emails, messages, reports, or API responses?

#### Data and integrations

8. What are the current sources of record and their data owners?
9. Which integrations are required: SaaS applications, files, databases, APIs, email, messaging, or AI providers?
10. What data fields are sensitive, regulated, or business-critical?
11. What data must be stored locally, synchronized, or only read on demand?

#### Tenancy, volume, and access

12. Is the system single-tenant or shared by multiple client organizations?
13. For multi-tenant use, who can access each tenant, how is membership managed, and can a user switch tenants?
14. What data volume is expected now and at twelve months: records, workflow runs, file sizes, and peak concurrency?
15. What retention, deletion, export, backup, or audit requirements apply?

#### Authentication and deployment

16. How should users authenticate: email/password, OAuth providers, SSO, MFA, or invitation-only access?
17. What roles and permissions are required, including administrators and approval owners?
18. Where should the frontend be hosted: Vercel, Netlify, or another approved host?
19. Where should n8n run: Docker on a VPS, Railway, Render, or another approved environment?
20. What environments are required: development, staging, production?

#### Delivery

21. What is the timeline, launch milestone, budget constraint, and demo date?
22. What must be usable first, and what can be delivered later?
23. Who approves scope, design, integrations, and production release?

If the requester delegates a decision, select a safe default, mark it as an assumption,
and identify the later decision point.

## Required outputs

Create six separate Markdown sections in one intake document by default. When the
project repository has a docs directory, save them as separate files:

~~~text
docs/01-prd.md
docs/02-technical-requirements.md
docs/03-app-flow.md
docs/04-ui-brief.md
docs/05-data-schema.md
docs/06-implementation-plan.md
~~~

Keep each document concise, concrete, and testable. Use TBD for a truly unresolved
fact; never silently invent it.

### 01 — Product Requirements Document

Include:

- Product name or working title
- Problem, target users, and user roles
- Desired outcomes and measurable success criteria
- In-scope features and explicitly out-of-scope items
- Core use cases and acceptance criteria
- Constraints, assumptions, dependencies, and open questions

### 02 — Technical Requirements Document

Include:

- Approved stack: n8n, React/Vite/Tailwind, Supabase, hosting choice, and AI path
- Environment topology: development, staging, production
- Required integrations and their account/credential owners
- Trigger, latency, reliability, observability, and retry expectations
- Authentication, authorization, tenant model, security, compliance, and retention needs
- Volume estimates and expected scale limits
- Explicit technical decisions, assumptions, and risks

### 03 — App Flow

Include:

- Authentication and first-landing behavior
- Page map and navigation
- Main user journeys from start to completion
- Each workflow trigger, input, status, approval, success state, and failure state
- Data exchanged between UI, server API/Edge Function, Supabase, and n8n
- Permission boundaries and empty/loading/error states

Express workflow-heavy journeys as a short sequence:

~~~text
Actor → entry point → validation → automation/API → decision → result → exception path
~~~

### 04 — UI Brief

Include:

- Pages and their primary user goal
- Sidebar/topbar navigation requirements
- Metrics, charts, tables, forms, filters, and workflow-status needs
- Desktop/tablet/mobile priorities and accessibility needs
- Client-provided name, logo, and accent color, or an explicit statement that they
  are still pending
- Required loading, empty, error, disabled, and permission-denied states

State that source/design/tokens.md is the visual authority. Do not define a fixed
brand identity in this document.

### 05 — Data Schema Draft

Include:

- Entities, fields, relationships, and source of truth for each entity
- Tenant boundaries and ownership fields
- Roles and access matrix
- Data validation, indexing, retention, audit, and file-storage requirements
- Which data comes from Supabase versus integrations or n8n results
- RLS policy intent for every application table

For a multi-tenant system, identify tenant_id and the trusted membership relation.
For a workflow result, name the stable input/output contract rather than leaving the
frontend to infer arbitrary JSON.

### 06 — Implementation Plan

Sequence the work with a clear done condition:

1. Confirm scope, access, environment, and integration credentials.
2. Create Supabase schema, Auth configuration, RLS policies, and test users.
3. Define and validate n8n workflows and their input/output contracts.
4. Deploy the server-side proxy or Edge Functions for workflow actions.
5. Build the React application shell and reusable UI components.
6. Implement pages against verified data contracts.
7. Test workflow failures, tenant isolation, authorization, responsiveness, and accessibility.
8. Deploy to staging, obtain approval, then release to production.
9. Monitor errors, execution outcomes, and usage after release.

For each phase include owner, dependency, validation method, and acceptance condition.

## Downstream handoffs

### Handoff to automation-architect.md

Provide:

- Named workflows with a plain-language trigger → steps → conditions → outputs map
- Exact integrations and actions needed
- Source and destination data shapes, including IDs used for updates
- Scheduling, retries, approvals, idempotency, rate, and error behavior
- LLM task, model/provider constraint, expected structured output, and batch volume
- Credential names/owners, but never the credential values
- Any registry gaps requiring verification before workflow generation

The automation skill returns n8n workflow JSON only after validating node types and
parameters against source/registry.md.

### Handoff to frontend.md

Provide:

- Approved page map, navigation, user roles, and route permissions
- Per-page metrics, tables, filters, forms, charts, and workflow-status requirements
- API/Edge Function actions and their input/output contracts
- Supabase tables, RLS-visible data, loading/empty/error states, and refresh behavior
- Client-provided identity configuration and dark-mode preference
- Tablet/mobile priorities and accessibility requirements

The frontend skill reads source/design/tokens.md and builds a white-label interface;
it does not invent unapproved integrations, data fields, or product identity.

### Handoff to secure-build.md

Provide:

- Auth providers, redirect URLs, roles, and reauthentication/MFA requirements
- Tenant and ownership model
- Sensitive data classification and retention requirements
- Server-only integrations, public forms, inbound webhooks, and rate-limit needs
- Hosting/environment choices and release requirements

## Completion checklist

- [ ] The request was classified and missing facts were collected or recorded as TBD.
- [ ] All required documents exist in the specified order.
- [ ] Core workflows have unambiguous trigger, steps, conditions, and outputs.
- [ ] Integrations, data owners, volume, tenant model, authentication, hosting, and timeline are documented.
- [ ] UI and workflow contracts agree on fields, states, and permissions.
- [ ] Relevant handoff inputs are ready for automation-architect.md, frontend.md, and secure-build.md.
- [ ] Material assumptions and approvers are visible before implementation begins.
