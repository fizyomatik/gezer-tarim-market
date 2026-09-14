create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  address text not null default '',
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index one_admin_only on public.profiles ((role)) where role = 'admin';

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id),
  name text not null,
  slug text not null unique,
  brand text not null default '',
  description text not null default '',
  price numeric(12, 2) not null check (price >= 0),
  is_featured boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null,
  alt_text text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.slides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  text text not null default '',
  href text not null default '/products',
  image_path text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.slides enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create policy "Public can read active categories" on public.categories for select using (is_active = true or public.is_admin());
create policy "Public can read active products" on public.products for select using (is_active = true or public.is_admin());
create policy "Public can read product images" on public.product_images for select using (true);
create policy "Public can read active slides" on public.slides for select using (is_active = true or public.is_admin());

create policy "Admins manage categories" on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage product images" on public.product_images for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage slides" on public.slides for all using (public.is_admin()) with check (public.is_admin());

create policy "Users read own profile" on public.profiles for select using (auth.uid() = id or public.is_admin());
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

insert into public.categories (name, slug, sort_order) values
  ('Tohum', 'tohum', 1),
  ('Gübre', 'gubre', 2),
  ('Zirai İlaç', 'zirai-ilac', 3),
  ('Tarım Aletleri', 'tarim-aletleri', 4),
  ('Peyzaj', 'peyzaj', 5)
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public) values
  ('product-images', 'product-images', true),
  ('site-media', 'site-media', true)
on conflict (id) do nothing;

create policy "Public can view catalog images" on storage.objects for select using (bucket_id in ('product-images', 'site-media'));
create policy "Admins upload catalog images" on storage.objects for insert with check (bucket_id in ('product-images', 'site-media') and public.is_admin());
create policy "Admins update catalog images" on storage.objects for update using (bucket_id in ('product-images', 'site-media') and public.is_admin());
create policy "Admins delete catalog images" on storage.objects for delete using (bucket_id in ('product-images', 'site-media') and public.is_admin());