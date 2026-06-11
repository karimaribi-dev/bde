create table if not exists suggestions (
  id         uuid        primary key default gen_random_uuid(),
  source     text        not null default 'agenda', -- 'agenda' | 'clubs' | 'a-propos'
  message    text        not null,
  is_read    boolean     not null default false,
  created_at timestamptz default now()
);

alter table suggestions enable row level security;

create policy "Public insert suggestions" on suggestions
  for insert with check (true);

create policy "Auth read suggestions" on suggestions
  for select using (auth.role() = 'authenticated');

create policy "Auth update suggestions" on suggestions
  for update using (auth.role() = 'authenticated');

create policy "Auth delete suggestions" on suggestions
  for delete using (auth.role() = 'authenticated');
