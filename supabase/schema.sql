-- ─────────────────────────────────────────────────────────────
-- DreamSpace Architect — Supabase schema
-- Run this entire file in the Supabase SQL Editor.
--
-- Prerequisites (Supabase Dashboard):
--   Authentication → Settings → Enable Anonymous Sign-ins  ✓
-- ─────────────────────────────────────────────────────────────

-- ── Profiles ─────────────────────────────────────────────────
-- One row per named player.  id matches auth.users.id.
create table if not exists profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  username       text not null,
  username_lower text not null unique,       -- lower(trim(username))
  created_at     timestamptz not null default now()
);

alter table profiles enable row level security;

-- Anyone authenticated can read (username availability checks)
create policy "profiles_select" on profiles
  for select using (true);

create policy "profiles_insert" on profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update" on profiles
  for update using (auth.uid() = id);

create policy "profiles_delete" on profiles
  for delete using (auth.uid() = id);

-- ── Mission progress ──────────────────────────────────────────
-- One row per (player, mission).  Cleared when mission is submitted.
create table if not exists mission_progress (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references profiles(id) on delete cascade,
  mission_id   text not null,
  placed_items jsonb not null default '[]'::jsonb,
  last_updated timestamptz not null default now(),
  unique (profile_id, mission_id)
);

alter table mission_progress enable row level security;

create policy "progress_own" on mission_progress
  for all using (profile_id = auth.uid());

-- ── Mission scores ────────────────────────────────────────────
-- Append-only: one row per submission (replays create new rows).
-- Total score = sum of most-recent score per mission.
create table if not exists mission_scores (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  mission_id text not null,
  score      integer not null,
  scored_at  timestamptz not null default now()
);

alter table mission_scores enable row level security;

create policy "scores_own" on mission_scores
  for all using (profile_id = auth.uid());
