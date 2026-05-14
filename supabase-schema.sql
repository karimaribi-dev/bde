-- Schema CMS AI Trends News
-- Exécuter dans Supabase SQL Editor

-- Categories
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz default now()
);

-- Articles
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text,
  cover_image_url text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  category_id uuid references categories(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger articles_updated_at
  before update on articles
  for each row execute function update_updated_at();

-- RLS (Row Level Security)
alter table categories enable row level security;
alter table articles enable row level security;

-- Lecture publique pour articles publiés
create policy "Public read published articles" on articles
  for select using (status = 'published');

create policy "Public read categories" on categories
  for select using (true);

-- Accès complet pour les utilisateurs authentifiés (admin)
create policy "Auth full access articles" on articles
  for all using (auth.role() = 'authenticated');

create policy "Auth full access categories" on categories
  for all using (auth.role() = 'authenticated');

-- Storage bucket pour les images
insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', true)
on conflict (id) do nothing;

create policy "Public read images" on storage.objects
  for select using (bucket_id = 'article-images');

create policy "Auth upload images" on storage.objects
  for insert with check (bucket_id = 'article-images' and auth.role() = 'authenticated');

create policy "Auth delete images" on storage.objects
  for delete using (bucket_id = 'article-images' and auth.role() = 'authenticated');

-- Données de démo
insert into categories (name, slug, description) values
  ('Intelligence Artificielle', 'intelligence-artificielle', 'Actualités IA générative et modèles'),
  ('Outils & Productivité', 'outils-productivite', 'Outils IA pour développeurs et créatifs'),
  ('Recherche', 'recherche', 'Papers et avancées scientifiques')
on conflict (slug) do nothing;
