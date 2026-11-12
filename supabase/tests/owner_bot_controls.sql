-- Use only an isolated database with the invitation migrations applied.
begin;
insert into public.wishes (id, owner_id, name, message)
values ('00000000-0000-4000-8000-000000000071', '00000000-0000-4000-8000-000000000021', 'Synthetic author', 'Synthetic wish');
insert into private.invitation_gift_registry (gift_id, gift_name, price_kzt)
values (971, 'Synthetic gift', 1000);
insert into private.gift_reservations (gift_id, owner_id, giver_name, reservation_id)
values (971, '00000000-0000-4000-8000-000000000021', 'Private synthetic name', '00000000-0000-4000-8000-000000000072');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000021', true);
do $$
begin
  begin
    perform public.invitation_owner_manage('delete_wish', '00000000-0000-4000-8000-000000000071');
    raise exception 'Guest used owner mutation';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
set local role anon;
do $$
begin
  begin
    perform public.invitation_owner_manage('cancel_booking', '00000000-0000-4000-8000-000000000072');
    raise exception 'Anonymous role used owner mutation';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
set local role service_role;
do $$
declare report jsonb;
begin
  report := public.invitation_owner_report('bookings', 1);
  if report->'rows'->0->>'reservation_id' is distinct from '00000000-0000-4000-8000-000000000072'
    or report::text like '%Private synthetic name%' or report::text like '%owner_id%' then
    raise exception 'Unsafe or incomplete booking report';
  end if;
  begin
    perform public.invitation_owner_manage('edit_wish', '00000000-0000-4000-8000-000000000071', '   ');
    raise exception 'Empty edit accepted';
  exception when invalid_parameter_value then null;
  end;
  if not public.invitation_owner_manage('edit_wish', '00000000-0000-4000-8000-000000000071', ' Synthetic updated ') then
    raise exception 'Wish edit failed';
  end if;
  report := public.invitation_owner_report('wishes', 1);
  if report->'rows'->0->>'message' is distinct from 'Synthetic updated'
    or report->'rows'->0->>'name' is distinct from 'Synthetic author'
    or report->'rows'->0->>'id' is distinct from '00000000-0000-4000-8000-000000000071' then
    raise exception 'Edit changed author or report metadata';
  end if;
  if not public.invitation_owner_manage('delete_wish', '00000000-0000-4000-8000-000000000071')
    or public.invitation_owner_manage('delete_wish', '00000000-0000-4000-8000-000000000071') then
    raise exception 'Wish deletion or retry failed';
  end if;
  if not public.invitation_owner_manage('cancel_booking', '00000000-0000-4000-8000-000000000072') then
    raise exception 'Owner cancellation failed';
  end if;
end;
$$;
reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000022', true);
do $$
begin
  if not public.reserve_invitation_gift(971, 'New synthetic guest') then
    raise exception 'Gift did not become available after cancellation';
  end if;
end;
$$;
reset role;
set local role service_role;
do $$
begin
  if public.invitation_owner_manage('cancel_booking', '00000000-0000-4000-8000-000000000072') then
    raise exception 'Old cancellation found a new reservation';
  end if;
end;
$$;
reset role;
set local role anon;
do $$
begin
  if not exists (select 1 from public.invitation_gift_availability() where gift_id = 971 and reserved) then
    raise exception 'Old cancellation affected a new reservation';
  end if;
end;
$$;
rollback;
