create table if not exists products (
  id           uuid         primary key default gen_random_uuid(),
  title        text         not null,
  slug         text         not null unique,
  description  text,
  price        numeric(10,2) not null default 0,
  stock_count  int          not null default 0,
  edition      text,
  image_url    text,
  is_published boolean      not null default false,
  sort_order   int          not null default 0,
  created_at   timestamptz  default now(),
  updated_at   timestamptz  default now()
);

create trigger products_updated_at before update on products
  for each row execute function update_updated_at();

alter table products enable row level security;

create policy "Public read published products" on products
  for select using (is_published = true);

create policy "Auth full access products" on products
  for all using (auth.role() = 'authenticated');
