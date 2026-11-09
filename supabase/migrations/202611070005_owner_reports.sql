begin;

create function public.invitation_owner_report(report_kind text, report_page integer)
returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  result jsonb;
  page_size integer := case when report_kind = 'wishes' then 1 else 12 end;
  page_offset integer;
begin
  if report_page is null or report_page not between 1 and 10000 then
    raise invalid_parameter_value;
  end if;
  page_offset := (report_page - 1) * page_size;

  case report_kind
    when 'guests' then
      select jsonb_build_object(
        'rows', coalesce((select jsonb_agg(to_jsonb(r)) from (
          select name, attending from public.attendance
          order by created_at desc, id desc offset page_offset limit page_size + 1
        ) r), '[]'::jsonb),
        'yes', count(*) filter (where attending),
        'no', count(*) filter (where not attending)
      ) into result from public.attendance;
    when 'wishes' then
      select jsonb_build_object('rows', coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb))
        into result from (
          select name, message from public.wishes
          order by created_at desc, id desc offset page_offset limit page_size + 1
        ) r;
    when 'bookings' then
      select jsonb_build_object('rows', coalesce(jsonb_agg(to_jsonb(r)), '[]'::jsonb))
        into result from (
          select r.gift_id, g.gift_name, g.price_kzt
          from private.gift_reservations r
          left join private.invitation_gift_registry g using (gift_id)
          order by r.gift_id offset page_offset limit page_size + 1
        ) r;
    else raise invalid_parameter_value;
  end case;
  return result;
end;
$$;

revoke all on function public.invitation_owner_report(text, integer) from public, anon, authenticated;
grant execute on function public.invitation_owner_report(text, integer) to service_role;
commit;
