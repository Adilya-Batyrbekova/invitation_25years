-- Use only an isolated database with the invitation migrations applied.
begin;
insert into public.wishes (id, owner_id, name, message) values
('00000000-0000-4000-8000-000000000091','00000000-0000-4000-8000-000000000021','Synthetic owner','Synthetic wish'),
('00000000-0000-4000-8000-000000000092','00000000-0000-4000-8000-000000000022','Synthetic other','Synthetic wish');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000021', true);
do $$
begin
  delete from public.wishes where id = '00000000-0000-4000-8000-000000000092';
  if found then raise exception 'A guest deleted a different guest’s wish'; end if;
  delete from public.wishes where id = '00000000-0000-4000-8000-000000000091';
  if not found then raise exception 'A guest could not delete their own wish'; end if;
end;
$$;
reset role;
set local role anon;
do $$
begin
  begin
    delete from public.wishes where id = '00000000-0000-4000-8000-000000000092';
    raise exception 'Anonymous role can delete a wish';
  exception when insufficient_privilege then null;
  end;
  if exists (select 1 from public.wishes where id = '00000000-0000-4000-8000-000000000091')
    or not exists (select 1 from public.wishes where id = '00000000-0000-4000-8000-000000000092') then
    raise exception 'Public feed changed incorrectly';
  end if;
end;
$$;
rollback;
