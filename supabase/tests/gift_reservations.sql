-- Run only in a disposable database with the invitation migrations applied.
begin;
insert into private.invitation_gift_registry (gift_id, gift_name, price_kzt)
values (100, 'Synthetic gift', 1000);
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000021',true);
do $$
begin
  if not public.reserve_invitation_gift(100, 'Synthetic giver') then raise exception 'First claim failed'; end if;
  if not exists (select 1 from public.gift_reservation_status() where gift_id=100 and own) then
    raise exception 'Owner status missing';
  end if;
  begin
    perform public.reserve_invitation_gift(999, 'Synthetic giver');
    raise exception 'Unpublished gift accepted';
  exception when invalid_parameter_value then null;
  end;
end
$$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000022',true);
do $$
begin
  if public.reserve_invitation_gift(100, 'Second giver') then raise exception 'Double claim succeeded'; end if;
  if public.cancel_invitation_gift(100) then raise exception 'Other guest cancelled'; end if;
  if not exists (select 1 from public.gift_reservation_status() where gift_id=100 and not own) then
    raise exception 'Public reserved status missing';
  end if;
  begin
    perform giver_name from private.gift_reservations;
    raise exception 'Guest read giver name';
  exception when insufficient_privilege then null;
  end;
end
$$;
reset role;
update private.invitation_gift_registry
set gift_name = 'Renamed synthetic gift', price_kzt = 2000, bookable = false
where gift_id = 100;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000022',true);
do $$
begin
  if not exists (select 1 from public.gift_reservation_status() where gift_id=100 and not own) then
    raise exception 'Editing or retiring a gift lost its reservation';
  end if;
  if not exists (select 1 from public.invitation_gift_availability()
                 where gift_id=100 and reserved and not own and not bookable) then
    raise exception 'Availability did not retain the retired booking';
  end if;
  begin
    perform public.reserve_invitation_gift(100, 'Second giver');
    raise exception 'Retired gift accepted';
  exception when invalid_parameter_value then null;
  end;
end
$$;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-000000000021',true);
do $$
begin
  if not public.cancel_invitation_gift(100) then raise exception 'Owner cannot cancel'; end if;
  if exists (select 1 from public.gift_reservation_status()) then raise exception 'Cancelled gift still appears'; end if;
end
$$;
rollback;
