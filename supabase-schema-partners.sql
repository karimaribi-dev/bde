create table if not exists partners (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  logo_url    text,
  website_url text,
  sort_order  int default 0,
  is_visible  boolean default true,
  created_at  timestamptz default now()
);

-- Activer RLS
alter table partners enable row level security;

-- Lecture publique
create policy "partners_public_read" on partners
  for select using (true);

-- Écriture admin uniquement (authentifié)
create policy "partners_admin_write" on partners
  for all using (auth.role() = 'authenticated');
