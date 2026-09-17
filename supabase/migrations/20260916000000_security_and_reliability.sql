begin;

-- Row ownership must not imply permission to assign roles.
revoke update on public.profiles from anon, authenticated;
grant update (full_name, address, updated_at) on public.profiles to authenticated;

create or replace function public.protect_profile_role()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.role is distinct from old.role and current_user in ('anon', 'authenticated') then
    raise exception 'Role changes require a trusted database administrator' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger protect_profile_role before update on public.profiles
for each row execute function public.protect_profile_role();

drop policy "Public can read product images" on public.product_images;
create policy "Read images of visible products" on public.product_images for select
using (exists (select 1 from public.products p where p.id = product_id and (p.is_active or public.is_admin())));

update storage.buckets set file_size_limit = 10485760,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where id in ('product-images', 'site-media');

create table public.company_settings (
  id boolean primary key default true check (id),
  company_name text not null check (length(company_name) between 1 and 120),
  address text not null check (length(address) between 1 and 500),
  phone text not null check (length(phone) between 7 and 30),
  email text not null check (length(email) between 3 and 254),
  whatsapp text not null check (whatsapp ~ '^\+?[0-9]{7,15}$'),
  hours text not null check (length(hours) between 1 and 200),
  map_url text not null check (map_url ~ '^https://'),
  updated_at timestamptz not null default now()
);
alter table public.company_settings enable row level security;
grant select on public.company_settings to anon, authenticated;
grant update on public.company_settings to authenticated;
create policy "Public company details" on public.company_settings for select using (true);
create policy "Admins edit company details" on public.company_settings for update
using (public.is_admin()) with check (public.is_admin());
insert into public.company_settings (company_name,address,phone,email,whatsapp,hours,map_url)
values ('Gezer Tarım Market','Adıyaman, Türkiye','+90 545 490 49 28','info@gezertarim.com','+905454904928','Pazartesi - Cumartesi / 08:00 - 19:00','https://maps.google.com');

-- Durable cleanup: reserve a unique path before uploading. Uncommitted uploads
-- expire after one day; deleted references become eligible immediately.
create table public.storage_cleanup (
  bucket text not null check (bucket in ('product-images', 'site-media')),
  path text not null,
  ready_at timestamptz not null default (now() + interval '1 day'),
  primary key (bucket, path)
);
alter table public.storage_cleanup enable row level security;
grant select, insert, update, delete on public.storage_cleanup to authenticated;
create policy "Admins manage cleanup" on public.storage_cleanup for all
using (public.is_admin()) with check (public.is_admin());
create index storage_cleanup_due on public.storage_cleanup (ready_at);

create or replace function public.queue_deleted_media()
returns trigger language plpgsql security definer set search_path = '' as $$
declare media_bucket text; media_path text;
begin
  if tg_table_name = 'product_images' then
    media_bucket := 'product-images'; media_path := old.storage_path;
  else
    media_bucket := 'site-media'; media_path := old.image_path;
  end if;
  insert into public.storage_cleanup (bucket,path,ready_at)
  values (media_bucket, media_path, now())
  on conflict (bucket,path) do update set ready_at = now();
  return old;
end;
$$;
create trigger cleanup_product_image after delete on public.product_images
for each row execute function public.queue_deleted_media();
create trigger cleanup_slide after delete on public.slides
for each row execute function public.queue_deleted_media();

-- Atomic product + image persistence, with invoker RLS and explicit admin checks.
create or replace function public.save_product(
  product_id uuid, product_name text, product_brand text, product_description text,
  product_price numeric, category_slug text, featured boolean, active boolean, image_paths text[]
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  saved_id uuid;
  selected_category uuid;
  next_order integer;
begin
  if not public.is_admin() then raise exception 'Admin required' using errcode = '42501'; end if;
  if length(trim(product_name)) not between 1 and 200 or length(product_brand) > 120
     or length(product_description) > 10000 or product_price is null
     or product_price < 0 or product_price > 9999999999.99
     or coalesce(array_length(image_paths,1),0) > 10 then
    raise exception 'Invalid product';
  end if;
  select id into selected_category from public.categories where slug = category_slug;
  if selected_category is null then raise exception 'Category not found'; end if;
  if exists (select 1 from unnest(image_paths) path where not exists (
    select 1 from storage.objects o where o.bucket_id = 'product-images' and o.name = path
  )) then raise exception 'Image upload not found'; end if;
  if product_id is null then
    saved_id := gen_random_uuid();
    insert into public.products (id,name,slug,brand,description,price,category_id,is_featured,is_active)
    values (saved_id,trim(product_name),trim(both '-' from regexp_replace(translate(lower(product_name),'çğıöşü','cgiosu'),'[^a-z0-9]+','-','g')) || '-' || saved_id::text,product_brand,product_description,product_price,selected_category,featured,active);
  else
    saved_id := product_id;
    -- Serialize image ordering for concurrent edits of this product.
    perform 1 from public.products where id = saved_id for update;
    if not found then raise exception 'Product not found'; end if;
    update public.products set name=trim(product_name),brand=product_brand,description=product_description,
      price=product_price,category_id=selected_category,is_featured=featured,is_active=active,updated_at=now()
    where id=saved_id;
  end if;
  select coalesce(max(sort_order),-1)+1 into next_order from public.product_images where product_images.product_id=saved_id;
  insert into public.product_images (product_id,storage_path,sort_order)
  select saved_id,path,next_order+ordinality-1 from unnest(image_paths) with ordinality as images(path,ordinality);
  return saved_id;
end;
$$;
revoke all on function public.save_product(uuid,text,text,text,numeric,text,boolean,boolean,text[]) from public, anon;
grant execute on function public.save_product(uuid,text,text,text,numeric,text,boolean,boolean,text[]) to authenticated;

-- Index referencing columns used in catalog joins and cascading deletes.
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists product_images_product_id_idx on public.product_images(product_id);
commit;
