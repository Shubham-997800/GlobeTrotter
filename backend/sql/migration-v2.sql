-- GlobeTrotter migration v2 — itinerary documents, bookmarks, dashboard content.
-- Run at integration time (after frontend completion), together with seed.
-- Safe to re-run.

-- ── Itinerary: one JSONB document per trip ────────────────────────
create table if not exists public.trip_itineraries (
  trip_id    uuid primary key references public.trips(id) on delete cascade,
  document   jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.trip_itineraries enable row level security;

drop policy if exists "itineraries_select_own" on public.trip_itineraries;
create policy "itineraries_select_own" on public.trip_itineraries
  for select using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

drop policy if exists "itineraries_write_own" on public.trip_itineraries;
create policy "itineraries_write_own" on public.trip_itineraries
  for insert with check (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

drop policy if exists "itineraries_update_own" on public.trip_itineraries;
create policy "itineraries_update_own" on public.trip_itineraries
  for update using (
    exists (select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid())
  );

-- ── Trips: archive + attached catalog activity ids ────────────────
alter table public.trips add column if not exists archived_at timestamptz;
alter table public.trips add column if not exists updated_at  timestamptz;
alter table public.trips add column if not exists activity_ids text[] not null default '{}';

-- ── Profiles: saved bookmarks ─────────────────────────────────────
alter table public.profiles add column if not exists saved_destination_ids text[] not null default '{}';
alter table public.profiles add column if not exists saved_activity_ids    text[] not null default '{}';

-- ── Dashboard editorial content ───────────────────────────────────
create table if not exists public.dashboard_destinations (
  id                   text primary key,
  city                 text not null,
  country              text not null,
  region               text not null,
  category             text not null,
  rating               numeric(2, 1) not null default 0,
  reviews              integer not null default 0,
  estimated_budget_inr integer not null default 0,
  description          text not null default '',
  image                text not null default '',
  image_alt            text not null default ''
);

create table if not exists public.featured_slides (
  id          integer primary key,
  badge       text not null,
  name        text not null,
  description text not null default '',
  best_time   text not null default '',
  country     text not null default '',
  category    text not null default '',
  image       text not null default '',
  image_alt   text not null default '',
  sort_order  integer not null default 0
);

create table if not exists public.regions (
  id         text primary key,
  label      text not null,
  blurb      text not null default '',
  sort_order integer not null default 0
);

create table if not exists public.insights (
  id              text primary key,
  label           text not null,
  value           text not null,
  trend           text not null default '',
  trend_direction text not null check (trend_direction in ('up', 'down')),
  sort_order      integer not null default 0
);

create table if not exists public.quick_actions (
  id          text primary key,
  title       text not null,
  description text not null default '',
  href        text not null default '/',
  emphasized  boolean not null default false,
  sort_order  integer not null default 0
);

-- Notifications / recent activity ship as JSON blobs in app_config:
--   keys 'dashboard_notifications' and 'dashboard_recent_activity'.

alter table public.dashboard_destinations enable row level security;
alter table public.featured_slides        enable row level security;
alter table public.regions                enable row level security;
alter table public.insights               enable row level security;
alter table public.quick_actions          enable row level security;

drop policy if exists "dash_read_destinations" on public.dashboard_destinations;
create policy "dash_read_destinations" on public.dashboard_destinations for select using (true);
drop policy if exists "dash_read_featured" on public.featured_slides;
create policy "dash_read_featured" on public.featured_slides for select using (true);
drop policy if exists "dash_read_regions" on public.regions;
create policy "dash_read_regions" on public.regions for select using (true);
drop policy if exists "dash_read_insights" on public.insights;
create policy "dash_read_insights" on public.insights for select using (true);
drop policy if exists "dash_read_quick_actions" on public.quick_actions;
create policy "dash_read_quick_actions" on public.quick_actions for select using (true);
