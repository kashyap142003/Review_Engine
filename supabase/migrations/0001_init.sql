-- Review Engine — initial schema
-- Single-tenant MVP: tenants + staff membership + RLS.
-- Google Sheets remains the source of record; Postgres holds only auth/membership/config.

create extension if not exists "pgcrypto";

-- Tenants ----------------------------------------------------------------
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gbp_review_url text,
  sheet_id text,
  reminder_days int not null default 3,
  created_at timestamptz not null default now()
);

alter table public.tenants enable row level security;

-- Staff membership --------------------------------------------------------
create table public.staff (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

alter table public.staff enable row level security;

-- Tenant resolution helper ------------------------------------------------
-- Resolves the caller's tenant from a trusted membership row (never client input).
create or replace function public.current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id
  from public.staff
  where user_id = (select auth.uid())
  limit 1;
$$;

revoke all on function public.current_tenant_id() from public;
grant execute on function public.current_tenant_id() to authenticated;

-- RLS policies ------------------------------------------------------------

-- Tenants: authenticated members may read their own tenant row.
create policy "tenant members read their tenant"
on public.tenants
for select
to authenticated
using (id = (select public.current_tenant_id()));

-- Staff: members may read staff rows for their tenant (needed for role checks).
create policy "tenant members read staff"
on public.staff
for select
to authenticated
using (tenant_id = (select public.current_tenant_id()));

-- Staff: only owners may manage staff within the tenant.
create policy "owner manages staff"
on public.staff
for insert
to authenticated
with check (
  tenant_id = (select public.current_tenant_id())
  and (select role from public.staff where user_id = (select auth.uid()) limit 1) = 'owner'
);

create policy "owner updates staff"
on public.staff
for update
to authenticated
using (
  tenant_id = (select public.current_tenant_id())
  and (select role from public.staff where user_id = (select auth.uid()) limit 1) = 'owner'
);

create policy "owner deletes staff"
on public.staff
for delete
to authenticated
using (
  tenant_id = (select public.current_tenant_id())
  and (select role from public.staff where user_id = (select auth.uid()) limit 1) = 'owner'
);

-- prevent members from escalating themselves: owner-only insert/update of role=owner is
-- enforced by the app server; keep a hard guard on privilege escalation here.
create or replace function public.can_write_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.staff
    where user_id = (select auth.uid())
      and role = 'owner'
  );
$$;

revoke all on function public.can_write_staff() from public;
grant execute on function public.can_write_staff() to authenticated;

-- Seeds -------------------------------------------------------------------
-- Single-tenant MVP: one tenant row. The operator inserts it with their real IDs.
-- Replace placeholder values before use. Do not commit real tenant ids.
insert into public.tenants (id, name, gbp_review_url, sheet_id, reminder_days)
values (
  '00000000-0000-4000-8000-000000000001',
  'Default Business',
  null,
  'YOUR_GOOGLE_SHEET_ID',
  3
)
on conflict (id) do nothing;

grant usage on schema public to authenticated;