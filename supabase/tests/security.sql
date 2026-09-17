\set ON_ERROR_STOP on
begin;
create function pg_temp.assert_true(value boolean, description text) returns void language plpgsql as $$
begin if value is distinct from true then raise exception 'FAILED: %',description; end if; end $$;

insert into auth.users(id) values ('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000002';
-- Test the vulnerable case specifically: there is NO admin yet.
do $$ begin
  begin
    update public.profiles set role='admin' where id=auth.uid();
    raise exception 'FAILED: customer self promotion succeeded';
  exception when insufficient_privilege then null;
  end;
end $$;
-- The trigger also protects the role if a broad grant is accidentally restored.
reset role;
grant update(role) on public.profiles to authenticated;
set local role authenticated;
do $$ begin
  begin
    update public.profiles set role='admin' where id=auth.uid();
    raise exception 'FAILED: role guard trigger allowed promotion';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
revoke update(role) on public.profiles from authenticated;
set local role authenticated;
update public.profiles set full_name='Customer',address='Test address',updated_at=now() where id=auth.uid();
select pg_temp.assert_true((select full_name='Customer' from public.profiles where id=auth.uid()),'own profile fields remain editable');
select pg_temp.assert_true((select count(*)=1 from public.profiles),'other profiles remain private');
update public.company_settings set company_name='Tampered' where id=true;
select pg_temp.assert_true((select company_name<>'Tampered' from public.company_settings),'customer cannot edit shared settings');
do $$ begin
  begin
    perform public.save_product(null,'Bad','','',10,'tohum',false,true,'{}');
    raise exception 'FAILED: customer product RPC succeeded';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;
update public.profiles set role='admin' where id='00000000-0000-4000-8000-000000000001';
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
insert into storage.objects(bucket_id,name) values ('product-images','00000000-0000-4000-8000-000000000003.jpg');
select public.save_product(null,'Original','','',10,'tohum',false,true,array['00000000-0000-4000-8000-000000000003.jpg']) as product_id \gset
select public.save_product(:'product_id','Changed','Brand','Description',25,'gubre',true,false,'{}');
select pg_temp.assert_true((select p.name='Changed' and p.price=25 and p.is_featured and not p.is_active and c.slug='gubre' from public.products p join public.categories c on c.id=p.category_id where p.id=:'product_id'),'update persists category, price and visibility');
update public.company_settings set company_name='Shared Gezer' where id=true;
reset role;
-- Inject a late image insert failure and verify the product update rolls back.
create function public.test_reject_image() returns trigger language plpgsql as $$ begin raise exception 'test insert failure'; end $$;
create trigger test_reject_image before insert on public.product_images for each row execute function public.test_reject_image();
set local role authenticated;
do $$ declare pid uuid; begin
  select id into pid from public.products where name='Changed';
  begin
    perform public.save_product(pid,'Should roll back','','',99,'tohum',false,true,array['00000000-0000-4000-8000-000000000003.jpg']);
    raise exception 'FAILED: expected late image failure';
  exception when raise_exception then
    if sqlerrm <> 'test insert failure' then raise; end if;
  end;
  perform pg_temp.assert_true((select name='Changed' and price=25 from public.products where id=pid),'image failure rolls back the product update');
end $$;
reset role;
drop trigger test_reject_image on public.product_images;
drop function public.test_reject_image();
set local role anon;
set local request.jwt.claim.sub = '';
select pg_temp.assert_true((select count(*)=0 from public.products),'inactive products hidden');
select pg_temp.assert_true((select count(*)=0 from public.product_images),'inactive image metadata hidden');
select pg_temp.assert_true((select company_name='Shared Gezer' from public.company_settings),'settings shared with anonymous visitors');
select pg_temp.assert_true((select count(*)=0 from public.storage_cleanup),'cleanup queue private');
reset role;
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-4000-8000-000000000001';
delete from public.products where id=:'product_id';
select pg_temp.assert_true((select count(*)=1 from public.storage_cleanup where bucket='product-images' and ready_at<=now()),'cascade deletion atomically queues product media');
insert into public.slides(title,image_path) values ('Test','slide.jpg') returning id as slide_id \gset
delete from public.slides where id=:'slide_id';
select pg_temp.assert_true((select count(*)=1 from public.storage_cleanup where bucket='site-media' and path='slide.jpg' and ready_at<=now()),'slide deletion atomically queues media');
select pg_temp.assert_true((select bool_and(file_size_limit=10485760 and allowed_mime_types=array['image/jpeg','image/png','image/webp']) from storage.buckets),'bucket upload limits configured');
reset role;
rollback;
\echo 'Security and persistence regression checks passed.'
