begin;

create function public.publish_invitation_gifts(catalogue jsonb)
returns void
language plpgsql security definer set search_path = ''
as $function$
begin
  if not private.is_invitation_admin() then
    raise insufficient_privilege;
  end if;

  if catalogue is null or jsonb_typeof(catalogue) is distinct from 'object'
    or jsonb_typeof(catalogue->'intro') is distinct from 'string'
    or jsonb_typeof(catalogue->'items') is distinct from 'array'
    or octet_length(catalogue::text) > 131072 then
    raise exception 'Invalid gift catalogue' using errcode = '22023';
  end if;

  if exists (
    select 1 from jsonb_array_elements(catalogue->'items') item
    where jsonb_typeof(item->'id') is distinct from 'number'
      or coalesce(item->>'id', '') !~ '^[1-9][0-9]{0,15}$'
      or jsonb_typeof(item->'name') is distinct from 'string'
      or btrim(coalesce(item->>'name', '')) = ''
      or jsonb_typeof(item->'price') is distinct from 'number'
      or coalesce(item->>'price', '') !~ '^[0-9]{1,9}$'
  ) or exists (
    select 1 from jsonb_array_elements(catalogue->'items') item
    where (item->>'id')::bigint > 9007199254740991
      or (item->>'price')::bigint > 100000000
  ) or exists (
    select 1 from jsonb_array_elements(catalogue->'items') item
    group by item->>'id' having count(*) > 1
  ) then
    raise exception 'Invalid gift records' using errcode = '22023';
  end if;

  lock table private.invitation_gift_registry in share row exclusive mode;
  if exists (
    select 1 from private.invitation_gift_registry r
    join jsonb_array_elements(catalogue->'items') item
      on r.gift_id = (item->>'id')::bigint
    where not r.bookable
  ) then
    raise exception 'Retired gift ID cannot be reused' using errcode = '22023';
  end if;

  update private.invitation_gift_registry r
  set bookable = false
  where r.bookable and not exists (
    select 1 from jsonb_array_elements(catalogue->'items') item
    where (item->>'id')::bigint = r.gift_id
  );

  insert into private.invitation_gift_registry (gift_id, gift_name, price_kzt)
  select (item->>'id')::bigint, item->>'name', (item->>'price')::bigint
  from jsonb_array_elements(catalogue->'items') item
  on conflict (gift_id) do update set
    gift_name = excluded.gift_name, price_kzt = excluded.price_kzt;

  insert into public.invitation_content (section, body)
  values ('gifts', catalogue)
  on conflict (section) do update set body = excluded.body;
end;
$function$;

revoke all on function public.publish_invitation_gifts(jsonb)
  from public, anon, authenticated;
grant execute on function public.publish_invitation_gifts(jsonb) to authenticated;

commit;