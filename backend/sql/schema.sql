-- GlobeTrotter schema — run once in Supabase SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE throughout.

-- ── Profiles: extended user data alongside auth.users ────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null default '',
  phone       text,
  city        text,
  country     text,
  bio         text,
  avatar_url  text,
  role        text not null default 'user' check (role in ('user', 'admin')),
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_upsert_own" on public.profiles;
create policy "profiles_upsert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ── Name → email lookup used by identifier login ─────────────────
-- Service-role only (backend calls it with the admin key).
create or replace function public.get_auth_email(profile_id uuid)
returns text
language sql
security definer
set search_path = auth, public
stable
as $$
  select email from auth.users where id = profile_id;
$$;

revoke all on function public.get_auth_email(uuid) from public, anon, authenticated;
grant execute on function public.get_auth_email(uuid) to service_role;

-- ── Trips ─────────────────────────────────────────────────────────
create table if not exists public.trips (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  description    text,
  cover_image    text,
  start_date     date not null,
  end_date       date not null,
  destination_id text not null,
  interests      text[] not null default '{}',
  budget_tier    text not null check (budget_tier in ('budget', 'moderate', 'premium', 'custom')),
  currency       text not null default 'INR',
  budget_amount  numeric(14, 2) not null default 0 check (budget_amount >= 0),
  status         text not null default 'draft' check (status in ('draft', 'planned')),
  created_at     timestamptz not null default now()
);

create index if not exists trips_user_created_idx on public.trips (user_id, created_at desc);

alter table public.trips enable row level security;

drop policy if exists "trips_select_own" on public.trips;
create policy "trips_select_own" on public.trips
  for select using (auth.uid() = user_id);

drop policy if exists "trips_insert_own" on public.trips;
create policy "trips_insert_own" on public.trips
  for insert with check (auth.uid() = user_id);

drop policy if exists "trips_update_own" on public.trips;
create policy "trips_update_own" on public.trips
  for update using (auth.uid() = user_id);

drop policy if exists "trips_delete_own" on public.trips;
create policy "trips_delete_own" on public.trips
  for delete using (auth.uid() = user_id);

-- ── Catalog: shared read-only data ───────────────────────────────

create table if not exists public.destinations (
  id                       text primary key,
  city                     text not null,
  country                  text not null,
  description              text not null default '',
  image                    text not null default '',
  image_alt                text not null default '',
  rating                   numeric(2, 1) not null default 0,
  reviews                  integer not null default 0,
  estimated_daily_cost_inr integer not null default 0,
  tags                     text[] not null default '{}'
);

create table if not exists public.activities (
  id             text primary key,
  name           text not null,
  city           text not null,
  country        text not null,
  category       text not null check (category in ('adventure', 'culture', 'food', 'nature')),
  duration_hours numeric(4, 1) not null default 0,
  cost_inr       integer not null default 0,
  description    text not null default '',
  image          text not null default '',
  image_alt      text not null default ''
);

create table if not exists public.budget_tiers (
  id              text primary key,
  label           text not null,
  description     text not null default '',
  cost_multiplier numeric(6, 3),
  split           jsonb not null default '{}'::jsonb,
  sort_order      integer not null default 0
);

create table if not exists public.interests (
  id         text primary key,
  label      text not null,
  sort_order integer not null default 0
);

create table if not exists public.currencies (
  code   text primary key,
  label  text not null,
  symbol text not null
);

create table if not exists public.app_config (
  key   text primary key,
  value jsonb not null
);

-- Catalog is world-readable; writes stay backend/service_role only.
alter table public.destinations enable row level security;
alter table public.activities    enable row level security;
alter table public.budget_tiers  enable row level security;
alter table public.interests     enable row level security;
alter table public.currencies    enable row level security;
alter table public.app_config    enable row level security;

drop policy if exists "catalog_public_read_destinations" on public.destinations;
create policy "catalog_public_read_destinations" on public.destinations for select using (true);
drop policy if exists "catalog_public_read_activities" on public.activities;
create policy "catalog_public_read_activities" on public.activities for select using (true);
drop policy if exists "catalog_public_read_budget_tiers" on public.budget_tiers;
create policy "catalog_public_read_budget_tiers" on public.budget_tiers for select using (true);
drop policy if exists "catalog_public_read_interests" on public.interests;
create policy "catalog_public_read_interests" on public.interests for select using (true);
drop policy if exists "catalog_public_read_currencies" on public.currencies;
create policy "catalog_public_read_currencies" on public.currencies for select using (true);
drop policy if exists "catalog_public_read_app_config" on public.app_config;
create policy "catalog_public_read_app_config" on public.app_config for select using (true);
