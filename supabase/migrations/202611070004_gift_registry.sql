begin;

create table private.invitation_gift_registry (
  gift_id bigint primary key check (gift_id between 1 and 9007199254740991),
  gift_name text not null check (btrim(gift_name) <> ''),
  price_kzt bigint not null check (price_kzt >= 0),
  bookable boolean not null default true
);
alter table private.invitation_gift_registry enable row level security;
revoke all on private.invitation_gift_registry from public, anon, authenticated;

-- Carry over published IDs so existing reservations retain their association.
insert into private.invitation_gift_registry (gift_id, gift_name, price_kzt)
select (item->>'id')::bigint, item->>'name', (item->>'price')::bigint
from public.invitation_content c
cross join lateral jsonb_array_elements(c.body->'items') item
where c.section = 'gifts';

create or replace function public.reserve_invitation_gift(requested_id bigint, giver text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then raise insufficient_privilege; end if;
  perform 1
  from private.invitation_gift_registry g
  where g.gift_id = requested_id and g.bookable
  for share;
  if not found then
    raise exception 'Gift is not bookable' using errcode = '22023';
  end if;

  insert into private.gift_reservations (gift_id, owner_id, giver_name)
    values (requested_id, auth.uid(), btrim(giver))
    on conflict (gift_id) do nothing;
  return found;
end;
$$;
revoke all on function public.reserve_invitation_gift(bigint,text) from public, anon, authenticated;
grant execute on function public.reserve_invitation_gift(bigint,text) to authenticated;

create function public.invitation_gift_availability()
returns table(gift_id bigint, bookable boolean, reserved boolean, own boolean)
language sql stable security definer set search_path = ''
as $$
  select coalesce(g.gift_id, r.gift_id), coalesce(g.bookable, false),
         r.gift_id is not null, coalesce(r.owner_id = (select auth.uid()), false)
  from private.invitation_gift_registry g
  full join private.gift_reservations r using (gift_id)
  where g.bookable or r.gift_id is not null;
$$;
revoke all on function public.invitation_gift_availability() from public, anon, authenticated;
grant execute on function public.invitation_gift_availability() to anon, authenticated;
commit;
