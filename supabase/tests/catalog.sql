begin;
create function pg_temp.assert_true(value boolean, description text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAILED: %',description; end if; end $$;
insert into auth.users(id) values
  ('10000000-0000-4000-8000-000000000001'),
  ('10000000-0000-4000-8000-000000000002'),
  ('10000000-0000-4000-8000-000000000003');
update public.profiles set role='admin' where id in ('10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002');
select pg_temp.assert_true((select count(*)=2 from public.profiles where role='admin'),'multiple administrators permitted');
set local role authenticated;
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000001';
insert into storage.objects(bucket_id,name) values ('product-images','a.jpg'),('product-images','b.jpg'),('product-images','c.jpg'),('site-media','slide-a.jpg'),('site-media','slide-b.jpg'),('site-media','category.jpg');
insert into public.storage_cleanup(bucket,path) select bucket_id,name from storage.objects;
select set_config('test.category', public.save_category(null,'Yeni Kategori','Açıklama','category.jpg',2,true)::text,true);
select set_config('test.slug', (select slug from public.categories where id=current_setting('test.category')::uuid),true);
select set_config('test.product', public.save_product(null,'Ürün','','',null,current_setting('test.slug'),true,true,array['a.jpg','b.jpg'])::text,true);
select pg_temp.assert_true((select price is null from public.products where id=current_setting('test.product')::uuid),'blank prices stored as null');
select pg_temp.assert_true((select count(*)=0 from public.storage_cleanup where path in ('a.jpg','b.jpg','category.jpg')),'committed reservations consumed');
select public.save_product(current_setting('test.product')::uuid,'Ürün','','',0,current_setting('test.slug'),true,true,array['b.jpg','a.jpg']);
select pg_temp.assert_true((select storage_path='b.jpg' from public.product_images where product_id=current_setting('test.product')::uuid order by sort_order limit 1),'first image becomes cover');
select pg_temp.assert_true((select price=0 from public.products where id=current_setting('test.product')::uuid),'explicit zero preserved');
select public.save_product(current_setting('test.product')::uuid,'Ürün','','',null,current_setting('test.slug'),true,true,array['b.jpg']);
select pg_temp.assert_true((select count(*)=1 from public.storage_cleanup where path='a.jpg' and ready_at<=now()),'removed image queued');
-- Another product cannot reuse an attached image.
do $$ begin
  begin
    perform public.save_product(null,'Other','','',1,'tohum',false,true,array['b.jpg']);
    raise exception 'FAILED: reused image';
  exception when raise_exception then if sqlerrm <> 'Image belongs to another product' then raise; end if; end;
  begin
    perform public.save_product(current_setting('test.product')::uuid,'Bad','','',1,'tohum',false,true,array['b.jpg','b.jpg']);
    raise exception 'FAILED: duplicate image';
  exception when raise_exception then if sqlerrm <> 'Invalid product' then raise; end if; end;
  begin
    perform public.save_product(null,'Bad','','',1,'tohum',false,true,array_fill('c.jpg'::text,array[11]));
    raise exception 'FAILED: excessive images';
  exception when raise_exception then if sqlerrm <> 'Invalid product' then raise; end if; end;
end $$;
-- Delete is blocked by the existing foreign key; slug survives renames.
do $$ begin
  begin delete from public.categories where id=current_setting('test.category')::uuid;
    raise exception 'FAILED: category deletion orphaned products';
  exception when foreign_key_violation then null; end;
end $$;
select public.save_category(current_setting('test.category')::uuid,'Yeni Ad','Changed',null,0,false);
select pg_temp.assert_true((select slug=current_setting('test.slug') from public.categories where id=current_setting('test.category')::uuid),'category slug stays stable');
select pg_temp.assert_true((select count(*)=1 from public.storage_cleanup where path='category.jpg' and ready_at<=now()),'category replacement queues old image');
reset role;
set local role anon;
set local request.jwt.claim.sub='';
select pg_temp.assert_true((select count(*)=0 from public.products where id=current_setting('test.product')::uuid),'hidden categories hide products');
select pg_temp.assert_true((select count(*)=0 from public.product_images where product_id=current_setting('test.product')::uuid),'hidden categories hide image metadata');
do $$ begin
  begin insert into public.categories(name,slug) values('Forbidden','forbidden');
    raise exception 'FAILED: anonymous mutation';
  exception when insufficient_privilege then null; end;
  begin perform public.save_slide(null,'Forbidden','','/products','slide-a.jpg',0,true);
    raise exception 'FAILED: anonymous RPC';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000003';
update public.products set name='Forbidden';
select pg_temp.assert_true((select count(*)=0 from public.products where name='Forbidden'),'non-admin direct update denied');
do $$ begin
  begin perform public.save_category(null,'Forbidden','',null,0,true);
    raise exception 'FAILED: customer category RPC';
  exception when insufficient_privilege then null; end;
  begin perform public.claim_storage_cleanup();
    raise exception 'FAILED: customer cleanup';
  exception when insufficient_privilege then null; end;
end $$;
reset role;
set local role authenticated;
set local request.jwt.claim.sub='10000000-0000-4000-8000-000000000002';
select set_config('test.slide',public.save_slide(null,'Slide','Description','/products','slide-a.jpg',0,true)::text,true);
select public.save_slide(current_setting('test.slide')::uuid,'Edited','Text','/contact','slide-a.jpg',3,false);
select pg_temp.assert_true((select title='Edited' and image_path='slide-a.jpg' and sort_order=3 and not is_active from public.slides where id=current_setting('test.slide')::uuid),'text-only slide edit preserves image');
select public.save_slide(current_setting('test.slide')::uuid,'Edited','Text','/contact','slide-b.jpg',1,true);
select pg_temp.assert_true((select count(*)=1 from public.storage_cleanup where path='slide-a.jpg' and ready_at<=now()),'replaced slide queues old image');
-- An expired upload is claimed for cleanup and cannot be attached later.
update public.storage_cleanup set ready_at=now() where path='c.jpg';
select * from public.claim_storage_cleanup();
select pg_temp.assert_true((select processing from public.storage_cleanup where path='c.jpg'),'cleanup claim marks reservation');
do $$ begin
  begin perform public.save_product(current_setting('test.product')::uuid,'Too late','','',2,'tohum',true,true,array['c.jpg']);
    raise exception 'FAILED: claimed upload attached';
  exception when raise_exception then if sqlerrm <> 'Upload expired; upload the image again' then raise; end if; end;
  perform pg_temp.assert_true((select name='Ürün' from public.products where id=current_setting('test.product')::uuid),'expired save rolls back');
  begin perform public.save_slide(current_setting('test.slide')::uuid,'Bad','','//evil.example','slide-b.jpg',0,true);
    raise exception 'FAILED: unsafe slide URL';
  exception when raise_exception then if sqlerrm <> 'Invalid slide' then raise; end if; end;
end $$;
delete from public.products where id=current_setting('test.product')::uuid;
delete from public.categories where id=current_setting('test.category')::uuid;
select pg_temp.assert_true((select count(*)=0 from public.categories where id=current_setting('test.category')::uuid),'empty category deletable');
reset role;
rollback;
