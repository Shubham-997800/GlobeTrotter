-- v3: notifications table + per-user settings blob
-- Mirrors frontend AppNotificationItem (features/notifications).

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in (
    'trip-reminder','activity-reminder','trip-shared',
    'community-like','community-comment','system','important-alert'
  )),
  category text not null check (category in ('trips','activities','community','system')),
  title text not null,
  description text not null default '',
  href text,
  actor_name text,
  actor_avatar text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_recent
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "own rows only" on public.notifications;
create policy "own rows only"
  on public.notifications
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Settings JSONB column on profiles (mirrors frontend SettingsState).
alter table public.profiles
  add column if not exists app_settings jsonb not null default '{}'::jsonb;

-- Seed a few starter notifications for every existing profile.
insert into public.notifications (user_id, type, category, title, description, href)
select p.id, 'system', 'system', 'Welcome to GlobeTrotter',
       'Plan your first trip and it will show up on your calendar.', '/trips'
from public.profiles p
where not exists (select 1 from public.notifications n where n.user_id = p.id);
