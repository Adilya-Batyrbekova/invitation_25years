-- Run in a disposable database with the invitation migrations applied.
begin;

insert into auth.users (id) values ('00000000-0000-4000-8000-000000000061');
insert into private.admin_members (user_id) values ('00000000-0000-4000-8000-000000000061');
insert into private.invitation_gift_registry (gift_id, gift_name, price_kzt)
values (71, 'Synthetic original', 100), (72, 'Synthetic retired', 200);

set local role anon;
do $$
begin
  begin
    perform public.publish_invitation_gifts('{"intro":"","items":[]}');
    raise exception 'Anonymous API call succeeded';
  exception when insufficient_privilege then null;
  end;
end;
$$;

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000062', true);
do $$
begin
  begin
    perform public.publish_invitation_gifts('{"intro":"","items":[]}');
    raise exception 'Guest published';
  exception when insufficient_privilege then null;
  end;
  if not public.reserve_invitation_gift(71, 'Synthetic guest')
    or not public.reserve_invitation_gift(72, 'Synthetic guest') then
    raise exception 'Synthetic bookings failed';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000061', true);
select public.publish_invitation_gifts(
  '{"intro":"Synthetic catalogue","items":[{"id":73,"name":"Synthetic new","price":300},{"id":71,"name":"Synthetic renamed","price":150}]}'
);
-- The same request can be retried safely.
select public.publish_invitation_gifts(
  '{"intro":"Synthetic catalogue","items":[{"id":73,"name":"Synthetic new","price":300},{"id":71,"name":"Synthetic renamed","price":150}]}'
);
do $$
begin
  begin
    perform public.publish_invitation_gifts(
      '{"intro":"","items":[{"id":73,"name":"One","price":1},{"id":73,"name":"Two","price":2}]}'
    );
    raise exception 'Duplicate IDs accepted';
  exception when invalid_parameter_value then null;
  end;
  begin
    perform public.publish_invitation_gifts(
      '{"intro":"","items":[{"id":72,"name":"Reused","price":1}]}'
    );
    raise exception 'Retired ID accepted';
  exception when invalid_parameter_value then null;
  end;
end;
$$;

reset role;
set local role anon;
do $$
begin
  if (select body->'items' from public.invitation_content where section = 'gifts')
    is distinct from
    '[{"id":73,"name":"Synthetic new","price":300},{"id":71,"name":"Synthetic renamed","price":150}]'::jsonb then
    raise exception 'Public catalogue missing or changed after rejected publication';
  end if;
  if not exists (select 1 from public.invitation_gift_availability() where gift_id = 71 and bookable and reserved)
    or not exists (select 1 from public.invitation_gift_availability() where gift_id = 72 and not bookable and reserved)
    or not exists (select 1 from public.invitation_gift_availability() where gift_id = 73 and bookable and not reserved) then
    raise exception 'Registry or booking state is inconsistent';
  end if;
end;
$$;

rollback;