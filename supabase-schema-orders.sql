create table if not exists shop_orders (
  id           uuid         primary key default gen_random_uuid(),
  prenom       text         not null,
  nom          text         not null,
  classe       text,
  mail         text         not null,
  items        jsonb        not null,   -- [{productId, title, qty, price, subtotal}]
  total        numeric(10,2) not null,
  is_processed boolean      not null default false,
  created_at   timestamptz  default now()
);

alter table shop_orders enable row level security;

create policy "Public insert orders" on shop_orders
  for insert with check (true);

create policy "Auth read orders" on shop_orders
  for select using (auth.role() = 'authenticated');

create policy "Auth update orders" on shop_orders
  for update using (auth.role() = 'authenticated');

create policy "Auth delete orders" on shop_orders
  for delete using (auth.role() = 'authenticated');
