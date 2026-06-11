create table if not exists club_join_requests (
  id           uuid        primary key default gen_random_uuid(),
  club_slug    text        not null,
  club_title   text        not null,
  prenom       text        not null,
  nom          text        not null,
  classe       text,
  mail         text        not null,
  presentation text,
  is_read      boolean     not null default false,
  created_at   timestamptz default now()
);

alter table club_join_requests enable row level security;

-- Tout le monde peut insérer (formulaire public)
create policy "Public insert club requests" on club_join_requests
  for insert with check (true);

-- Seuls les admins authentifiés peuvent lire / modifier
create policy "Auth read club requests" on club_join_requests
  for select using (auth.role() = 'authenticated');

create policy "Auth update club requests" on club_join_requests
  for update using (auth.role() = 'authenticated');

create policy "Auth delete club requests" on club_join_requests
  for delete using (auth.role() = 'authenticated');
