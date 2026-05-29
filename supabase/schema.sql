-- ============================================================
-- Vouch — full schema (run in Supabase SQL Editor)
-- ============================================================

-- 1. profiles (extends auth.users)
create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  email                 text not null,
  first_name            text not null,
  tone_default          text not null default 'supportive'
                          check (tone_default in ('supportive','playful','hardcore')),
  hardcore_consent_at   timestamptz,
  privacy_accepted_at   timestamptz not null default now(),
  pwa_installed_at      timestamptz,
  created_at            timestamptz not null default now()
);

-- 2. stakes library
create table if not exists public.stakes (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text not null,
  icon        text not null,
  tone_min    text not null check (tone_min in ('playful','hardcore')),
  category    text not null,
  active      boolean not null default true
);

-- 3. guardians
create table if not exists public.guardians (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  invite_token  text not null unique default gen_random_uuid()::text,
  display_name  text,
  accepted_at   timestamptz,
  declined_at   timestamptz,
  swapped_at    timestamptz,
  created_at    timestamptz not null default now()
);

-- 4. tasks
create table if not exists public.tasks (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  guardian_id           uuid not null references public.guardians(id),
  title                 text not null,
  deadline              timestamptz not null,
  tone                  text not null check (tone in ('supportive','playful','hardcore')),
  stake_id              uuid references public.stakes(id),
  status                text not null default 'pending'
                          check (status in ('pending','submitted','approved','rejected','ghost_failed')),
  evidence_url          text,
  evidence_uploaded_at  timestamptz,
  guardian_seen_at      timestamptz,
  verdict_at            timestamptz,
  guardian_note         text,
  created_at            timestamptz not null default now()
);

-- 5. verdicts
create table if not exists public.verdicts (
  id                          uuid primary key default gen_random_uuid(),
  task_id                     uuid not null references public.tasks(id) on delete cascade,
  guardian_id                 uuid not null references public.guardians(id),
  decision                    text not null check (decision in ('approve','reject')),
  note                        text,
  evidence_seen_duration_ms   integer,
  created_at                  timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles    enable row level security;
alter table public.stakes      enable row level security;
alter table public.guardians   enable row level security;
alter table public.tasks       enable row level security;
alter table public.verdicts    enable row level security;

-- profiles: own row only
create policy "profiles: own row" on public.profiles
  for all using (auth.uid() = id);

-- stakes: read-only for authenticated
create policy "stakes: read all" on public.stakes
  for select using (auth.role() = 'authenticated' or auth.role() = 'anon');

-- guardians: owner can manage; guardian can read via token
create policy "guardians: owner" on public.guardians
  for all using (auth.uid() = user_id);

-- tasks: owner can manage
create policy "tasks: owner" on public.tasks
  for all using (auth.uid() = user_id);

-- verdicts: task owner can read
create policy "verdicts: task owner read" on public.verdicts
  for select using (
    exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid())
  );

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, first_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Seed: 8 stakes (locked 2026-05-08)
-- ============================================================
insert into public.stakes (name, description, icon, tone_min, category) values
  ('Potato Avatar',       'Your avatar becomes an embarrassing photo for 24h.',                    '🥔', 'playful', 'social-public'),
  ('Story Post',          'I missed my deadline - story posts to IG/Twitter.',                     '📱', 'playful', 'social-public'),
  ('Friend Confession',   'Auto-sends a Telegram message to a friend you pre-select.',             '💬', 'playful', 'social-private'),
  ('Punishment Playlist', 'Your Guardian picks 5 songs for your Spotify for a month.',             '🎵', 'playful', 'creative'),
  ('LinkedIn Confession', 'Drafts a public LinkedIn post about the missed goal.',                  '💼', 'hardcore', 'social-public'),
  ('No-Coffee Week',      'A week without coffee. Honor-system.',                                  '☕', 'hardcore', 'physical'),
  ('$5 to anti-charity',  'Stripe charge of $5 to a politically-opposed organization.',            '💰', 'hardcore', 'financial'),
  ('Sweat Penalty',       'Extra workout the next day. Guardian asks for evidence.',               '🏃', 'hardcore', 'physical')
on conflict do nothing;
