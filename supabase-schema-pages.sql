-- ============================================================
--  TABLE : pages  (pages hors navigation, liens dans le footer)
-- ============================================================
create table if not exists pages (
  id               uuid        primary key default gen_random_uuid(),
  title            text        not null,
  slug             text        not null unique,
  content          text        not null default '',
  meta_description text,
  is_published     boolean     not null default false,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

create trigger pages_updated_at
  before update on pages
  for each row execute function update_updated_at();

alter table pages enable row level security;

create policy "Public read published pages"
  on pages for select using (is_published = true);

create policy "Auth full access pages"
  on pages for all using (auth.role() = 'authenticated');
