-- Run only in a disposable test database with the guest response migration applied.
begin;

insert into auth.users (id) values
  ('00000000-0000-4000-8000-000000000001'),
  ('00000000-0000-4000-8000-000000000002'),
  ('00000000-0000-4000-8000-000000000003');
insert into private.admin_members values ('00000000-0000-4000-8000-000000000003');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
insert into public.attendance (name, attending) values ('Synthetic guest', true);
insert into public.wishes (name, message) values ('Synthetic guest', 'First wish');

do $$
begin
  if exists (select 1 from public.attendance) then
    raise exception 'Guest can read attendance';
  end if;
  update public.attendance set attending = false;
  if found then raise exception 'Guest can edit attendance'; end if;
  if (select count(*) from public.own_wish_ids()) <> 1 then
    raise exception 'Author cannot identify own wish';
  end if;
  update public.wishes set message = 'Updated wish' where name = 'Synthetic guest';
  if not found then raise exception 'Author cannot edit own wish'; end if;
  delete from public.wishes where name = 'Synthetic guest';
  if found then raise exception 'Author can delete own wish'; end if;
end
$$;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);
do $$
begin
  if not exists (select message from public.wishes where message = 'Updated wish') then
    raise exception 'Second guest cannot read the published wish';
  end if;
  if exists (select 1 from public.own_wish_ids()) then
    raise exception 'Second guest can identify another guest''s wish as own';
  end if;
  update public.wishes set message = 'Unauthorized change' where name = 'Synthetic guest';
  if found then raise exception 'Second guest can edit another guest''s wish'; end if;
  begin
    perform owner_id from public.wishes;
    raise exception 'Guest can read private ownership IDs';
  exception when insufficient_privilege then null;
  end;
end
$$;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000003', true);
do $$
begin
  if not exists (select 1 from public.attendance where name = 'Synthetic guest') then
    raise exception 'Administrator cannot read attendance';
  end if;
  update public.attendance set attending = false where name = 'Synthetic guest';
  if not found then raise exception 'Administrator cannot correct attendance'; end if;
  delete from public.wishes where name = 'Synthetic guest';
  if not found then raise exception 'Administrator cannot delete a wish'; end if;
end
$$;

rollback;
