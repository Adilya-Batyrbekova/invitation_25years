-- Run only in a disposable database with both migrations applied.
begin;

insert into auth.users (id) values
  ('00000000-0000-4000-8000-000000000011'),
  ('00000000-0000-4000-8000-000000000012');
insert into private.admin_members values ('00000000-0000-4000-8000-000000000011');

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000011', true);
do $$
begin
  if not public.can_edit_invitation() then raise exception 'Owner denied'; end if;
end
$$;
insert into public.invitation_content values ('personal', '{"intro":"Synthetic"}');
insert into storage.objects (bucket_id, name) values ('invitation-images', 'synthetic.webp');

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000012', true);
do $$
begin
  if public.can_edit_invitation() then raise exception 'Guest can edit'; end if;
  if not exists (select 1 from public.invitation_content where body->>'intro' = 'Synthetic') then
    raise exception 'Published content not visible';
  end if;
  update public.invitation_content set body = '{}' where section = 'personal';
  if found then raise exception 'Guest changed published content'; end if;
  begin
    insert into public.invitation_content values ('ideas', '{}');
    raise exception 'Guest created published content';
  exception when insufficient_privilege then null;
  end;
  begin
    insert into storage.objects (bucket_id, name) values ('invitation-images', 'unauthorized.webp');
    raise exception 'Guest uploaded an image';
  exception when insufficient_privilege then null;
  end;
end
$$;

set local role anon;
do $$
begin
  if not exists (select 1 from public.invitation_content where body->>'intro' = 'Synthetic') then
    raise exception 'Published content not visible anonymously';
  end if;
end
$$;

rollback;
