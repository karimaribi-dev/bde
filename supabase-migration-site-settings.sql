-- Table de réglages globaux du site (clé/valeur)
create table if not exists site_settings (
  key   text primary key,
  value text not null default ''
);

-- Lecture publique
alter table site_settings enable row level security;
create policy "site_settings_public_read" on site_settings
  for select using (true);

-- Écriture admin uniquement
create policy "site_settings_admin_write" on site_settings
  for all using (auth.role() = 'authenticated');

-- Valeur par défaut : section partenaires visible
insert into site_settings (key, value)
values ('partners_section_visible', 'true')
on conflict (key) do nothing;
