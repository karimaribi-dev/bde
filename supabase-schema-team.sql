create table if not exists team_members (
  id         uuid  primary key default gen_random_uuid(),
  name       text  not null,
  role       text,
  badge_color text  not null default '#4FA3FF',
  photo_url  text,
  sort_order int   not null default 0
);

alter table team_members enable row level security;

create policy "Public select team" on team_members
  for select using (true);

create policy "Auth insert team" on team_members
  for insert with check (auth.role() = 'authenticated');

create policy "Auth update team" on team_members
  for update using (auth.role() = 'authenticated');

create policy "Auth delete team" on team_members
  for delete using (auth.role() = 'authenticated');

-- Membres initiaux (photos à uploader depuis le dashboard)
insert into team_members (name, badge_color, sort_order) values
  ('LOUISON', '#4FA3FF', 1),
  ('BENJI',   '#FFB3F0', 2),
  ('ACHILLE', '#FFE74A', 3);
