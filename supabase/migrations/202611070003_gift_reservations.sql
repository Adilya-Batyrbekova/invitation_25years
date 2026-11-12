begin;
create table private.gift_reservations (
  gift_id bigint primary key,
  owner_id uuid not null default auth.uid(),
  giver_name text not null check (char_length(btrim(giver_name)) between 1 and 60)
);
alter table private.gift_reservations enable row level security;
revoke all on private.gift_reservations from public, anon, authenticated;

create function public.gift_reservation_status()
returns table(gift_id bigint, own boolean)
language sql stable security definer set search_path = ''
as $$
  select r.gift_id, coalesce(r.owner_id = (select auth.uid()), false)
  from private.gift_reservations r;
$$;
revoke all on function public.gift_reservation_status() from public, anon, authenticated;
grant execute on function public.gift_reservation_status() to anon, authenticated;

create function public.reserve_invitation_gift(requested_id bigint, giver text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise insufficient_privilege; end if;
  if not exists (
    select 1 from public.invitation_content c
    cross join lateral jsonb_array_elements(c.body->'items') item
    where c.section = 'gifts' and item->'id' = to_jsonb(requested_id)
  ) then
    raise exception 'Gift is not published' using errcode = '22023';
  end if;
  insert into private.gift_reservations (gift_id, owner_id, giver_name)
    values (requested_id, auth.uid(), btrim(giver))
    on conflict (gift_id) do nothing;
  return found;
end;
$$;
revoke all on function public.reserve_invitation_gift(bigint,text) from public, anon, authenticated;
grant execute on function public.reserve_invitation_gift(bigint,text) to authenticated;

create function public.cancel_invitation_gift(requested_id bigint)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  delete from private.gift_reservations
  where gift_id = requested_id and owner_id = (select auth.uid());
  return found;
end;
$$;
revoke all on function public.cancel_invitation_gift(bigint) from public, anon, authenticated;
grant execute on function public.cancel_invitation_gift(bigint) to authenticated;
commit;
