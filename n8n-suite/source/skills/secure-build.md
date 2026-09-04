---
name: secure-build
description: >
  Apply production security requirements to React/Vite applications using Supabase
  Auth, Postgres, Row-Level Security, Supabase Edge Functions, and n8n workflows.
  Use when designing or implementing authentication, tenant isolation, database
  policies, server-side workflow proxies, form handling, secrets, rate limits, or
  Vercel/Netlify security headers.
---

# Secure Build — Supabase and n8n Production Security

## Purpose

Build security into an application before it ships. This skill covers a React/Vite
frontend, Supabase Auth and Postgres, Edge Functions or server API routes, and n8n
automations. It applies equally to dashboards, portals, and public forms.

Treat the browser as untrusted. Authentication establishes identity; Row-Level
Security (RLS) establishes which rows that identity may access; server-side code
protects privileged credentials and workflow endpoints.

## Security baseline

- Require HTTPS in every deployed environment.
- Enable RLS on every public table that holds application or client data.
- Treat all browser, webhook, form, LLM, and third-party API input as untrusted.
- Enforce authorization on the server and in RLS, never only in hidden UI controls.
- Use least-privilege credentials and rotate any credential exposed or logged by
  mistake.
- Keep development, staging, and production Supabase projects and n8n instances
  separate where practical.

## 1. Supabase Auth in React/Vite

### Authentication methods

Support email/password and only the OAuth providers the project needs. Configure
allowed redirect URLs separately for local development, preview, staging, and
production. Do not accept wildcard production redirects.

Use Supabase Auth APIs for sign-up, sign-in, password reset, and OAuth. Require email
verification where the product's risk model permits it. For sensitive workflows, add
appropriate reauthentication, MFA, or server-side step-up checks instead of trusting a
stale UI session.

### Session handling

Create one Supabase client with the project URL and its public/publishable key. At
startup, determine the signed-in state, subscribe to auth changes, and unsubscribe
when the provider unmounts.

~~~jsx
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
~~~

~~~jsx
useEffect(() => {
  let active = true;

  supabase.auth.getClaims().then(({ data: { claims } }) => {
    if (active) setClaims(claims ?? null);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => setSession(session),
  );

  return () => {
    active = false;
    subscription.unsubscribe();
  };
}, []);
~~~

Render a neutral loading state while claims/session verification is in progress.
Clear application state on sign-out. Do not use a client-side role check as an
authorization boundary: it only improves the user experience; RLS and server checks
remain mandatory.

## 2. Row-Level Security and tenant isolation

### Data model

For a shared multi-tenant database, include tenant_id on every tenant-owned table.
Resolve the tenant from a trusted membership relation, not from a tenant ID supplied
by the browser. Keep a unique membership row per user and tenant, and explicitly
model a user's role if privileges differ.

Use a small security-definer helper to resolve the current user's tenant. It avoids
copying membership joins into every policy and lets policies remain clear. Review the
function's search path and permissions as carefully as the policies themselves.

~~~sql
create table public.tenant_memberships (
  tenant_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  primary key (tenant_id, user_id)
);

create or replace function public.current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id
  from public.tenant_memberships
  where user_id = (select auth.uid())
  limit 1;
$$;

revoke all on function public.current_tenant_id() from public;
grant execute on function public.current_tenant_id() to authenticated;
~~~

If a person can actively use more than one tenant, do not use an arbitrary first
membership as the production rule. Store an approved active-tenant claim or pass an
explicit tenant selection that server code verifies against tenant_memberships before
each tenant-scoped operation.

### Shared customers and orders tables

This example gives authenticated users access only to rows in their current tenant.
It applies both USING and WITH CHECK: the latter prevents inserts or updates into
another tenant.

~~~sql
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  name text not null,
  email text,
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  customer_id uuid not null references public.customers(id),
  status text not null,
  amount_cents integer not null check (amount_cents >= 0),
  created_at timestamptz not null default now()
);

alter table public.customers enable row level security;
alter table public.orders enable row level security;

create policy "tenant members manage their customers"
on public.customers
for all
to authenticated
using (tenant_id = (select public.current_tenant_id()))
with check (tenant_id = (select public.current_tenant_id()));

create policy "tenant members manage their orders"
on public.orders
for all
to authenticated
using (tenant_id = (select public.current_tenant_id()))
with check (tenant_id = (select public.current_tenant_id()));
~~~

RLS alone does not guarantee an order references a customer from the same tenant.
Add a composite unique key and foreign key, or enforce the relationship in a
transaction/RPC:

~~~sql
alter table public.customers
  add constraint customers_id_tenant_unique unique (id, tenant_id);

alter table public.orders
  add constraint orders_customer_same_tenant_fk
  foreign key (customer_id, tenant_id)
  references public.customers (id, tenant_id);
~~~

Use narrower policies for readers, editors, and admins when roles differ. Test every
policy with at least two real test users in different tenants and verify that direct
API calls cannot read, create, update, or delete cross-tenant data.

## 3. n8n webhook proxy

Never call an n8n webhook URL directly from browser code. A raw n8n URL is a
credential-like endpoint and gives a client a replayable automation trigger.

Use a Supabase Edge Function or a server API route as the only browser-facing action
endpoint:

1. The React client calls the function with the user's session.
2. The function verifies the JWT before running.
3. The function resolves identity and tenant server-side; it does not trust a
   client-provided tenant ID or role.
4. The function validates the request body and applies rate limits.
5. The function uses a server-only N8N_WEBHOOK_URL secret to call the intended n8n
   endpoint.
6. The function returns only the minimum safe response to the browser.

Keep JWT verification enabled for authenticated Edge Functions. Use an RLS-scoped
Supabase client for user operations. Use an admin/secret-key client only for a
specific privileged operation after the function has independently authorized it.

For public inbound webhooks, create a separate endpoint. Verify the source signature,
timestamp, and replay protection before processing. Do not set a function to public
merely to avoid implementing browser authentication.

## 4. Environment variables and secrets

Maintain a committed .env.example containing names only and keep all real .env files
out of version control.

### Browser-visible values

Only VITE_-prefixed values are bundled by Vite. Limit them to non-secret values such
as:

~~~text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_PRODUCT_NAME=
~~~

The Supabase publishable/anon key is designed for client use only when RLS is correct.
It is not a substitute for policies.

### Server-only values

Store these in the Edge Function, server platform, or deployment secret manager:

~~~text
SUPABASE_URL=
SUPABASE_SECRET_KEY=
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SIGNING_SECRET=
OAUTH_CLIENT_SECRET=
SMTP_PASSWORD=
~~~

Never expose a Supabase secret/service-role key, n8n webhook URL, n8n API key,
OAuth client secret, database password, SMTP password, signing secret, or private
third-party API key to Vite, source control, browser logs, or client responses.

## 5. Validate and rate-limit public inputs

Validate input at every trust boundary:

- In React, validate for immediate feedback.
- In the Edge Function/API route, validate again before any database or n8n call.
- In the database, enforce invariant constraints, foreign keys, types, and RLS.

Use a schema validator on the server. Limit accepted fields, reject unexpected fields
where appropriate, trim and normalize text deliberately, enforce length and format
limits, and return generic client-safe errors. Encode user content before HTML output;
never render untrusted HTML without a carefully reviewed sanitizer.

Rate-limit public forms and webhook receivers by a combination of:

- source IP, respecting trusted proxy configuration;
- authenticated user ID where present;
- tenant ID after it has been verified server-side; and
- action name or endpoint.

Use a shared durable rate-limit store or a database/RPC with atomic updates. Do not
rely on an in-memory counter in an Edge Function, because instances may scale or
restart. Return HTTP 429 with a Retry-After value. Add a short-lived idempotency key
for retried write operations and record webhook event IDs to block replay.

For signed third-party webhooks, verify the signature over the unmodified raw request
body, enforce a narrow timestamp tolerance, and reject duplicate event IDs before
performing side effects.

## 6. Deployment security headers

Start a Content-Security-Policy rollout in Report-Only mode, inspect violations, then
enforce the smallest allowlist needed by the application. Because n8n is accessed only
through a server proxy, it should not appear in the browser's CSP connect-src list.

Baseline headers:

- Content-Security-Policy: explicit default-src, script-src, style-src, img-src,
  connect-src, base-uri, form-action, and frame-ancestors directives.
- Strict-Transport-Security: enable only on HTTPS production domains after confirming
  subdomain behavior.
- X-Frame-Options: DENY unless the product intentionally supports framing.
- X-Content-Type-Options: nosniff.
- Referrer-Policy: strict-origin-when-cross-origin or stricter.
- Permissions-Policy: explicitly disable browser features the application does not use.

Example Vercel header configuration. Replace every placeholder with the exact domains
the browser needs; do not use a broad wildcard allowlist.

~~~json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://<project-ref>.supabase.co; base-uri 'self'; form-action 'self'; frame-ancestors 'none'"
        },
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
~~~

Equivalent Netlify pattern:

~~~toml
[[headers]]
  for = "/*"
  [headers.values]
    Content-Security-Policy = "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://<project-ref>.supabase.co; base-uri 'self'; form-action 'self'; frame-ancestors 'none"
    Strict-Transport-Security = "max-age=31536000; includeSubDomains"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
~~~

Verify final headers in a deployed production response. CSP changes can break analytics,
fonts, images, OAuth, or Supabase connections; amend only the specific required source
after reviewing the browser violation report.

## Release checklist

- [ ] Auth redirects, provider configuration, and email verification rules are reviewed.
- [ ] Client session state is subscribed and cleaned up correctly.
- [ ] RLS is enabled and tested for every exposed table.
- [ ] Tenant policies use verified server-side membership, including WITH CHECK.
- [ ] Cross-tenant foreign keys or equivalent transaction checks are present.
- [ ] Browser code has no raw n8n webhook URL or privileged credential.
- [ ] Server proxy validates JWT, tenant, payload, and rate limit before n8n calls.
- [ ] Public webhooks verify signature, timestamp, and replay protection.
- [ ] Environment files and logs contain no secrets.
- [ ] Production headers are deployed and CSP has been tested.

## References

- [Supabase Auth with React](https://supabase.com/docs/guides/auth/quickstarts/react)
- [Supabase Edge Function security](https://supabase.com/docs/guides/functions/auth)
- [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Vercel response headers](https://vercel.com/docs/headers/response-headers)
- [Netlify custom headers](https://docs.netlify.com/manage/routing/headers/)
