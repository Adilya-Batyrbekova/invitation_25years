-- Use only an isolated database with the invitation migrations applied.
begin;
insert into public.wishes (id, owner_id, name, message) values
('00000000-0000-4000-8000-000000000081', '00000000-0000-4000-8000-000000000021', 'Synthetic author', 'Before');
set local role authenticated;
do $$
begin
  begin
    perform public.invitation_owner_apply_edit(1, 10, 'Unexpected');
    raise exception 'Guest invoked owner edit';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
set local role service_role;
select public.invitation_owner_prepare_edit(1, 10, '00000000-0000-4000-8000-000000000081');
select public.invitation_owner_prepare_edit(1, 11, '00000000-0000-4000-8000-000000000081');
do $$
begin
  if public.invitation_owner_apply_edit(1, 10, 'Old prompt') then
    raise exception 'Replaced prompt accepted';
  end if;
  if public.invitation_owner_apply_edit(2, 11, 'Wrong chat') then
    raise exception 'Wrong chat accepted';
  end if;
  if not public.invitation_owner_apply_edit(1, 11, 'Updated wish') then
    raise exception 'Active prompt did not update wish';
  end if;
  if public.invitation_owner_apply_edit(1, 11, 'Duplicate reply') then
    raise exception 'Used prompt was accepted twice';
  end if;
end;
$$;
reset role;
set local role anon;
do $$
begin
  if (select message from public.wishes where id = '00000000-0000-4000-8000-000000000081')
    is distinct from 'Updated wish' then
    raise exception 'Public feed did not see the confirmed update';
  end if;
end;
$$;
rollback;
