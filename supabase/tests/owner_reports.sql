-- Run only with synthetic records in an isolated database.
begin;
insert into public.attendance (owner_id, name, attending)
values ('00000000-0000-4000-8000-000000000021', 'Synthetic guest', true);
insert into public.wishes (owner_id, name, message)
values ('00000000-0000-4000-8000-000000000021', 'Synthetic guest', 'Synthetic wish');
insert into private.invitation_gift_registry (gift_id, gift_name, price_kzt)
values (918, 'Synthetic gift', 2000);
insert into private.gift_reservations (gift_id, owner_id, giver_name)
values (918, '00000000-0000-4000-8000-000000000021', 'Private synthetic name');

set local role authenticated;
do $$
begin
  begin
    perform public.invitation_owner_report('guests', 1);
    raise exception 'Guest read owner report';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
set local role service_role;
do $$
declare report jsonb;
begin
  report := public.invitation_owner_report('guests', 1);
  if report->>'yes' is distinct from '1' or report->'rows'->0->>'name' is distinct from 'Synthetic guest' then
    raise exception 'Attendance report mismatch';
  end if;
  report := public.invitation_owner_report('wishes', 1);
  if report->'rows'->0->>'message' is distinct from 'Synthetic wish' then
    raise exception 'Wish report mismatch';
  end if;
  report := public.invitation_owner_report('bookings', 1);
  if report->'rows'->0->>'gift_name' is distinct from 'Synthetic gift'
    or report::text like '%Private synthetic name%' then
    raise exception 'Booking report mismatch';
  end if;
end;
$$;
rollback;
