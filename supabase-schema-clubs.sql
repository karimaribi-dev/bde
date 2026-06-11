-- ============================================================
--  TABLE : clubs
-- ============================================================
create table if not exists clubs (
  id                 uuid primary key default gen_random_uuid(),
  title              text        not null,
  slug               text        not null unique,
  tagline            text        not null default '',   -- ex : "INTÉRESSÉ PAR LA TYPOGRAPHIE ?"
  tagline_sub        text,                              -- ex : "C'EST POUR VOUS !"
  accent_color       text        not null default '#FFB3F0',
  accent_text_color  text        not null default '#111111',
  who_we_are         text,
  objective          text,
  -- Infos importantes
  schedule           text,        -- horaires ex: "10h - 12h"
  frequency          text,        -- date/fréquence ex: "Chaque vendredi"
  location           text,        -- lieu ex: "FAB LAB"
  member_count       text,
  image_url          text,
  is_published       boolean     not null default false,
  sort_order         int         not null default 0,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);

create trigger clubs_updated_at
  before update on clubs
  for each row execute function update_updated_at();

alter table clubs enable row level security;

create policy "Public read published clubs"
  on clubs for select using (is_published = true);

create policy "Auth full access clubs"
  on clubs for all using (auth.role() = 'authenticated');
