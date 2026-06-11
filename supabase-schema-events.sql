-- ============================================================
-- Table EVENTS — BDE LISAA DGC
-- Coller dans le Supabase SQL Editor et exécuter
-- ============================================================

create table if not exists events (
  id              uuid primary key default gen_random_uuid(),
  badge           text not null default 'EVENT',
  badge_color     text not null default '#FFB3F0',
  badge_text_color text not null default '#111111',
  title           text not null,
  slug            text not null unique,
  description     text,
  event_date      date not null,
  event_time      text not null default '',
  price           text not null default 'gratuit',
  image_url       text,
  location_name   text,
  location_address text,
  location_lat    numeric(10,7),
  location_lng    numeric(10,7),
  is_published    boolean not null default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Auto-update updated_at (réutilise la fonction update_updated_at() du schema principal)
create trigger events_updated_at
  before update on events
  for each row execute function update_updated_at();

-- Row Level Security
alter table events enable row level security;

-- Lecture publique (événements publiés seulement)
create policy "Public read published events" on events
  for select using (is_published = true);

-- Accès complet pour les utilisateurs authentifiés (admin)
create policy "Auth full access events" on events
  for all using (auth.role() = 'authenticated');
