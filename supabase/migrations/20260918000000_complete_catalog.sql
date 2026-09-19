begin;

drop index public.one_admin_only;
alter table public.products alter column price drop not null;
alter table public.categories
  add column description text not null default '',
  add column image_path text,
  add column image_fallback text not null default '/images/logo.jpeg';
update public.categories set image_fallback = case slug
  when 'tohum' then '/categories/tohum.jpg'
  when 'gubre' then '/categories/gubre.jpeg'
  when 'zirai-ilac' then '/categories/zirai-ilac.jpg'
  when 'tarim-aletleri' then '/categories/tarim-aletleri.jpeg'
  when 'peyzaj' then '/categories/peyzaj.jpg'
  else image_fallback end;
update public.categories set description = case slug
  when 'tohum' then 'Kaliteli ve verimli tohum çeşitleri'
  when 'gubre' then 'Bitkinizin ihtiyacına uygun gübreler'
  when 'zirai-ilac' then 'Bitki sağlığı ve koruma ürünleri'
  when 'tarim-aletleri' then 'Tarım işleriniz için profesyonel ekipmanlar'
  when 'peyzaj' then 'Bahçe ve peyzaj ürünleri' else '' end;

-- A hidden category hides all of its product metadata, including direct URLs.
drop policy "Public can read active products" on public.products;
create policy "Public can read active products" on public.products for select using (
  public.is_admin() or (is_active and exists (
    select 1 from public.categories c where c.id = category_id and c.is_active
  ))
);

alter table public.storage_cleanup add column processing boolean not null default false;
create or replace function public.queue_deleted_media()
returns trigger language plpgsql security definer set search_path = '' as $$
declare media_bucket text; media_path text;
begin
  if tg_table_name = 'product_images' then
    media_bucket := 'product-images'; media_path := old.storage_path;
  else
    media_bucket := 'site-media'; media_path := old.image_path;
    if tg_op = 'UPDATE' and new.image_path is not distinct from old.image_path then return new; end if;
  end if;
  if media_path is not null then
    insert into public.storage_cleanup (bucket,path,ready_at)
    values (media_bucket, media_path, now())
    on conflict (bucket,path) do update set ready_at = now();
  end if;
  if tg_op = 'UPDATE' then return new; end if;
  return old;
end;
$$;
create trigger cleanup_slide_replacement after update of image_path on public.slides
for each row execute function public.queue_deleted_media();
create trigger cleanup_category after delete or update of image_path on public.categories
for each row execute function public.queue_deleted_media();

-- Saving and claiming an upload serialize on its reservation. Once claimed for
-- removal, an expired upload cannot be attached by a late form submission.
create function public.commit_upload(media_bucket text, media_path text)
returns void language plpgsql security invoker set search_path = '' as $$
declare reservation public.storage_cleanup;
begin
  if not public.is_admin() then raise exception 'Admin required' using errcode = '42501'; end if;
  select * into reservation from public.storage_cleanup
    where bucket = media_bucket and path = media_path for update;
  if not found or reservation.processing or reservation.ready_at <= now() then
    raise exception 'Upload expired; upload the image again';
  end if;
  if not exists (select 1 from storage.objects where bucket_id = media_bucket and name = media_path) then
    raise exception 'Image upload not found';
  end if;
  delete from public.storage_cleanup where bucket = media_bucket and path = media_path;
end;
$$;
revoke all on function public.commit_upload(text,text) from public, anon;
grant execute on function public.commit_upload(text,text) to authenticated;

create function public.claim_storage_cleanup()
returns table(bucket text,path text) language plpgsql security invoker set search_path = '' as $$
begin
  if not public.is_admin() then raise exception 'Admin required' using errcode = '42501'; end if;
  return query with due as (
    select q.bucket,q.path from public.storage_cleanup q where q.ready_at <= now()
    order by q.ready_at,q.path limit 50 for update skip locked
  ) update public.storage_cleanup q set processing=true from due
    where q.bucket=due.bucket and q.path=due.path returning q.bucket,q.path;
end;
$$;
revoke all on function public.claim_storage_cleanup() from public, anon;
grant execute on function public.claim_storage_cleanup() to authenticated;

-- The supplied paths are the complete ordered image selection, not an append list.
create or replace function public.save_product(
  product_id uuid, product_name text, product_brand text, product_description text,
  product_price numeric, category_slug text, featured boolean, active boolean, image_paths text[]
) returns uuid language plpgsql security invoker set search_path = '' as $$
declare saved_id uuid; selected_category uuid; image_path text;
begin
  if not public.is_admin() then raise exception 'Admin required' using errcode = '42501'; end if;
  if product_name is null or length(trim(product_name)) not between 1 and 200
    or product_brand is null or length(product_brand)>120
    or product_description is null or length(product_description)>10000
    or (product_price is not null and (product_price<0 or product_price>9999999999.99 or product_price<>round(product_price,2)))
    or featured is null or active is null or image_paths is null
    or cardinality(image_paths)>10
    or cardinality(image_paths)<>(select count(distinct p) from unnest(image_paths) p)
    then raise exception 'Invalid product'; end if;
  select id into selected_category from public.categories where slug=category_slug;
  if selected_category is null then raise exception 'Category not found'; end if;
  if product_id is not null then
    perform 1 from public.products where id=product_id for update;
    if not found then raise exception 'Product not found'; end if;
    saved_id := product_id;
  else
    saved_id := gen_random_uuid();
  end if;
  foreach image_path in array image_paths loop
    if not exists (select 1 from public.product_images i where i.product_id=saved_id and i.storage_path=image_path) then
      if exists (select 1 from public.product_images i where i.storage_path=image_path) then raise exception 'Image belongs to another product'; end if;
      perform public.commit_upload('product-images',image_path);
    end if;
  end loop;
  if product_id is null then
    insert into public.products (id,name,slug,brand,description,price,category_id,is_featured,is_active)
    values (saved_id,trim(product_name),coalesce(nullif(trim(both '-' from regexp_replace(translate(lower(product_name),'çğıöşü','cgiosu'),'[^a-z0-9]+','-','g')),''),'urun') || '-' || saved_id::text,
      product_brand,product_description,product_price,selected_category,featured,active);
  else
    update public.products set name=trim(product_name),brand=product_brand,description=product_description,
      price=product_price,category_id=selected_category,is_featured=featured,is_active=active,updated_at=now()
      where id=saved_id;
  end if;
  delete from public.product_images i where i.product_id=saved_id and not (i.storage_path=any(image_paths));
  -- Preserve existing image IDs; normalize old duplicate references if present.
  delete from public.product_images a using public.product_images b
    where a.product_id=saved_id and b.product_id=saved_id and a.storage_path=b.storage_path and a.id>b.id;
  update public.product_images i set sort_order=images.ordinality-1
    from unnest(image_paths) with ordinality images(path,ordinality)
    where i.product_id=saved_id and i.storage_path=images.path;
  insert into public.product_images(product_id,storage_path,sort_order)
    select saved_id,images.path,images.ordinality-1 from unnest(image_paths) with ordinality images(path,ordinality)
    where not exists(select 1 from public.product_images i where i.product_id=saved_id and i.storage_path=images.path);
  return saved_id;
end;
$$;

create function public.save_category(category_id uuid, category_name text, category_description text,
  media_path text, display_order integer, active boolean)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare saved_id uuid; old_path text; new_slug text;
begin
  if not public.is_admin() then raise exception 'Admin required' using errcode = '42501'; end if;
  if category_name is null or length(trim(category_name)) not between 1 and 120
    or category_description is null or length(category_description)>2000
    or display_order is null or display_order<0 or active is null then raise exception 'Invalid category'; end if;
  if category_id is not null then
    select image_path into old_path from public.categories where id=category_id for update;
    if not found then raise exception 'Category not found'; end if;
    saved_id := category_id;
  else saved_id := gen_random_uuid(); end if;
  if media_path is not null and media_path is distinct from old_path then perform public.commit_upload('site-media',media_path); end if;
  if category_id is null then
    new_slug := coalesce(nullif(trim(both '-' from regexp_replace(translate(lower(category_name),'çğıöşü','cgiosu'),'[^a-z0-9]+','-','g')),''),'kategori') || '-' || saved_id::text;
    insert into public.categories(id,name,slug,description,image_path,sort_order,is_active)
      values(saved_id,trim(category_name),new_slug,category_description,media_path,display_order,active);
  else
    update public.categories set name=trim(category_name),description=category_description,image_path=media_path,
      sort_order=display_order,is_active=active where id=saved_id;
  end if;
  return saved_id;
end;
$$;
revoke all on function public.save_category(uuid,text,text,text,integer,boolean) from public, anon;
grant execute on function public.save_category(uuid,text,text,text,integer,boolean) to authenticated;

create function public.save_slide(slide_id uuid, slide_title text, slide_text text, slide_href text,
  media_path text, display_order integer, active boolean)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare saved_id uuid; old_path text;
begin
  if not public.is_admin() then raise exception 'Admin required' using errcode = '42501'; end if;
  if slide_title is null or length(trim(slide_title)) not between 1 and 200
    or slide_text is null or length(slide_text)>2000 or slide_href is null or length(slide_href)>2048
    or left(slide_href,1)<>'/' or left(slide_href,2)='//' or slide_href ~ '[[:space:][:cntrl:]]' or position(chr(92) in slide_href)>0
    or media_path is null or display_order is null or display_order<0 or active is null then raise exception 'Invalid slide'; end if;
  if slide_id is not null then
    select image_path into old_path from public.slides where id=slide_id for update;
    if not found then raise exception 'Slide not found'; end if;
    saved_id := slide_id;
  else saved_id := gen_random_uuid(); end if;
  if media_path is distinct from old_path then perform public.commit_upload('site-media',media_path); end if;
  if slide_id is null then
    insert into public.slides(id,title,text,href,image_path,sort_order,is_active)
      values(saved_id,trim(slide_title),slide_text,slide_href,media_path,display_order,active);
  else
    update public.slides set title=trim(slide_title),text=slide_text,href=slide_href,image_path=media_path,
      sort_order=display_order,is_active=active,updated_at=now() where id=saved_id;
  end if;
  return saved_id;
end;
$$;
revoke all on function public.save_slide(uuid,text,text,text,text,integer,boolean) from public, anon;
grant execute on function public.save_slide(uuid,text,text,text,text,integer,boolean) to authenticated;
commit;
