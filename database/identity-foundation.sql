-- Reviewed draft for a NEW dedicated identity project only.
-- Not a deployed migration. Membership writes are deliberately not granted.
begin;
create table public.id_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (char_length(display_name) between 1 and 100),
 created_at timestamptz not null default now()
);
create table public.id_organizations (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(name) between 1 and 150),
 kind text not null check (kind in ('company','association','family','study_group')),
 created_at timestamptz not null default now()
);
create table public.id_memberships (
 organization_id uuid not null references public.id_organizations(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check (role in ('owner','admin','member','billing')),
 status text not null default 'active' check (status in ('active','suspended','removed')),
 created_at timestamptz not null default now(),
 primary key (organization_id,user_id)
);
create index id_memberships_user_idx on public.id_memberships(user_id,status);
alter table public.id_profiles enable row level security;
alter table public.id_organizations enable row level security;
alter table public.id_memberships enable row level security;
revoke all on public.id_profiles,public.id_organizations,public.id_memberships from public,anon,authenticated;
grant select,insert on public.id_profiles to authenticated;
grant update(display_name) on public.id_profiles to authenticated;
grant select on public.id_organizations,public.id_memberships to authenticated;
create policy own_profile_read on public.id_profiles for select to authenticated using ((select auth.uid())=user_id);
create policy own_profile_insert on public.id_profiles for insert to authenticated with check ((select auth.uid())=user_id);
create policy own_profile_update on public.id_profiles for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy own_memberships on public.id_memberships for select to authenticated using ((select auth.uid())=user_id);
create policy active_organization on public.id_organizations for select to authenticated using (exists(select 1 from public.id_memberships m where m.organization_id=id and m.user_id=(select auth.uid()) and m.status='active'));
commit;
