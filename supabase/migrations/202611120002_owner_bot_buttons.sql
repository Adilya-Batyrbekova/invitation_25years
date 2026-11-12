begin;

create table private.owner_bot_pending_edit (
  chat_id bigint primary key,
  prompt_id bigint not null,
  wish_id uuid not null references public.wishes(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '20 minutes')
);
alter table private.owner_bot_pending_edit enable row level security;
revoke all on private.owner_bot_pending_edit from public, anon, authenticated;

create function public.invitation_owner_prepare_edit(owner_chat bigint, prompt_message bigint, wish_id uuid)
returns void
language sql security definer set search_path = ''
as $function$
  insert into private.owner_bot_pending_edit (chat_id, prompt_id, wish_id)
  values (owner_chat, prompt_message, wish_id)
  on conflict (chat_id) do update
  set prompt_id = excluded.prompt_id, wish_id = excluded.wish_id, expires_at = excluded.expires_at;
$function$;

create function public.invitation_owner_apply_edit(owner_chat bigint, prompt_message bigint, replacement text)
returns boolean
language plpgsql security definer set search_path = ''
as $function$
declare target uuid;
begin
  if replacement is null or char_length(btrim(replacement)) not between 1 and 1500 then
    raise invalid_parameter_value;
  end if;
  delete from private.owner_bot_pending_edit
  where chat_id = owner_chat and prompt_id = prompt_message and expires_at > now()
  returning wish_id into target;
  if not found then return false; end if;
  return public.invitation_owner_manage('edit_wish', target, replacement);
end;
$function$;

revoke all on function public.invitation_owner_prepare_edit(bigint, bigint, uuid) from public, anon, authenticated;
revoke all on function public.invitation_owner_apply_edit(bigint, bigint, text) from public, anon, authenticated;
grant execute on function public.invitation_owner_prepare_edit(bigint, bigint, uuid) to service_role;
grant execute on function public.invitation_owner_apply_edit(bigint, bigint, text) to service_role;

commit;
