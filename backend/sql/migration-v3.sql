-- GlobeTrotter migration v3 — Explore catalog, Community feed, Calendar events.
-- Safe to re-run: IF NOT EXISTS / OR REPLACE / guarded ALTERs throughout.
-- Backend uses the service-role key (bypasses RLS); policies below are
-- defense-in-depth matching the v1/v2 conventions.

-- ═══ Explore catalog ══════════════════════════════════════════════

create table if not exists public.explore_destinations (
  id                       text primary key,
  city                     text not null,
  country                  text not null,
  description              text not null default '',
  image                    text not null default '',
  image_alt                text not null default '',
  rating                   numeric(2, 1) not null default 4.5,
  reviews                  integer not null default 0,
  estimated_daily_cost_inr integer not null default 5000,
  tags                     text[] not null default '{}',
  region                   text not null default 'asia',
  best_time_to_visit       text not null default 'Year-round',
  recommended_duration     text not null default '3–5 days',
  trending_score           integer,
  created_at               timestamptz not null default now()
);

create table if not exists public.explore_places (
  id             text primary key,
  destination_id text not null references public.explore_destinations(id) on delete cascade,
  name           text not null,
  category       text not null,
  description    text not null default '',
  image          text not null default '',
  image_alt      text not null default '',
  sort_order     integer not null default 0
);

alter table public.explore_destinations enable row level security;
alter table public.explore_places       enable row level security;

drop policy if exists "explore_read_destinations" on public.explore_destinations;
create policy "explore_read_destinations" on public.explore_destinations
  for select using (true);

drop policy if exists "explore_read_places" on public.explore_places;
create policy "explore_read_places" on public.explore_places
  for select using (true);

-- Per-user explore search history (autocomplete chips).
create table if not exists public.recent_searches (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  query      text not null,
  created_at timestamptz not null default now(),
  unique (user_id, query)
);
create index if not exists recent_searches_user_idx
  on public.recent_searches (user_id, created_at desc);

alter table public.recent_searches enable row level security;

drop policy if exists "recent_searches_own" on public.recent_searches;
create policy "recent_searches_own" on public.recent_searches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ═══ Community ════════════════════════════════════════════════════

-- Member profiles. Real users are auto-provisioned from auth on first
-- write; seeded demo authors use synthetic ids and is_system = true.
create table if not exists public.community_users (
  id              text primary key,
  name            text not null,
  username        text not null unique,
  avatar_url      text,
  bio             text,
  city            text,
  country         text,
  trips_count     integer not null default 0,
  followers_count integer not null default 0,
  following_count integer not null default 0,
  is_system       boolean not null default false,
  created_at      timestamptz not null default now()
);

-- Feed posts. Author is a live FK; the API layer denormalizes the full
-- CommunityUser snapshot into responses (mock-parity shape).
create table if not exists public.community_posts (
  id               text primary key,
  kind             text not null check (kind in ('story', 'shared-trip')),
  author_id        text not null references public.community_users(id) on delete cascade,
  content          text not null default '',
  media            jsonb not null default '[]',
  location_name    text,
  tags             text[] not null default '{}',
  privacy          text not null default 'public' check (privacy in ('public', 'private')),
  shared_trip      jsonb,
  comments_enabled boolean not null default true,
  likes_count      integer not null default 0,
  comments_count   integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz
);
create index if not exists community_posts_created_idx
  on public.community_posts (created_at desc);
create index if not exists community_posts_author_idx
  on public.community_posts (author_id);

create table if not exists public.post_likes (
  post_id    text not null references public.community_posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.post_saves (
  post_id    text not null references public.community_posts(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

-- One level of nesting: replies point at their parent comment.
create table if not exists public.post_comments (
  id                text primary key,
  post_id           text not null references public.community_posts(id) on delete cascade,
  author_id         text not null references public.community_users(id) on delete cascade,
  content           text not null,
  parent_comment_id text references public.post_comments(id) on delete cascade,
  likes_count       integer not null default 0,
  created_at        timestamptz not null default now()
);
create index if not exists post_comments_post_idx
  on public.post_comments (post_id, created_at desc);

create table if not exists public.comment_likes (
  comment_id text not null references public.post_comments(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  primary key (comment_id, user_id)
);

-- Viewer → author follow graph. followee may be a demo/system profile.
create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followee_id text not null references public.community_users(id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (follower_id, followee_id)
);

create table if not exists public.post_reports (
  id           uuid primary key default gen_random_uuid(),
  post_id      text not null references public.community_posts(id) on delete cascade,
  reporter_id  uuid not null references auth.users(id) on delete cascade,
  reason       text not null check (reason in ('spam', 'inappropriate', 'harassment', 'other')),
  details      text,
  reference_id text not null,
  created_at   timestamptz not null default now()
);

alter table public.community_users enable row level security;
alter table public.community_posts enable row level security;
alter table public.post_likes      enable row level security;
alter table public.post_saves      enable row level security;
alter table public.post_comments   enable row level security;
alter table public.comment_likes   enable row level security;
alter table public.follows         enable row level security;
alter table public.post_reports    enable row level security;

-- Posts are world-readable except other people's private ones.
drop policy if exists "community_posts_read" on public.community_posts;
create policy "community_posts_read" on public.community_posts
  for select using (
    privacy = 'public'
    or exists (
      select 1 from public.community_users cu
      where cu.id = community_posts.author_id and cu.id = auth.uid()::text
    )
  );

-- Members may update only their own author record.
drop policy if exists "community_users_update_own" on public.community_users;
create policy "community_users_update_own" on public.community_users
  for update using (id = auth.uid()::text);

drop policy if exists "post_likes_own" on public.post_likes;
create policy "post_likes_own" on public.post_likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "post_saves_own" on public.post_saves;
create policy "post_saves_own" on public.post_saves
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "comment_likes_own" on public.comment_likes;
create policy "comment_likes_own" on public.comment_likes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "follows_own" on public.follows;
create policy "follows_own" on public.follows
  for all using (auth.uid() = follower_id) with check (auth.uid() = follower_id);

drop policy if exists "post_reports_own" on public.post_reports;
create policy "post_reports_own" on public.post_reports
  for all using (auth.uid() = reporter_id) with check (auth.uid() = reporter_id);

-- Composer drafts live on profiles (one JSON blob per user).
alter table public.profiles add column if not exists post_draft jsonb;

-- ═══ Calendar ═════════════════════════════════════════════════════
-- Standalone events only; trip spans + itinerary activities are derived
-- server-side at read time so they can never drift from source data.

create table if not exists public.calendar_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in ('activity', 'food', 'transport', 'accommodation', 'custom')),
  title       text not null,
  date        date not null,
  start_time  text,
  end_time    text,
  location    text,
  description text,
  trip_id     uuid references public.trips(id) on delete set null,
  status      text not null default 'planned' check (status in ('planned', 'completed', 'cancelled')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists calendar_events_user_date_idx
  on public.calendar_events (user_id, date);

alter table public.calendar_events enable row level security;

drop policy if exists "calendar_events_own" on public.calendar_events;
create policy "calendar_events_own" on public.calendar_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
