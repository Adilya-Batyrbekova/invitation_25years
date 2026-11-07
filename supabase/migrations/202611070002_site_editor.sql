begin;
create table public.invitation_content (
  section text primary key check (section in ('personal', 'ideas', 'gifts')),
  body jsonb not null check (jsonb_typeof(body) = 'object' and octet_length(body::text) <= 131072)
);
alter table public.invitation_content enable row level security;
revoke all on public.invitation_content from public, anon, authenticated;
grant select on public.invitation_content to anon, authenticated;
grant insert, update on public.invitation_content to authenticated;
create policy invitation_content_read on public.invitation_content for select using (true);
create policy invitation_content_insert on public.invitation_content for insert to authenticated
  with check ((select private.is_invitation_admin()));
create policy invitation_content_update on public.invitation_content for update to authenticated
  using ((select private.is_invitation_admin()))
  with check ((select private.is_invitation_admin()));

create function public.can_edit_invitation()
returns boolean language sql stable security invoker set search_path = ''
as $$ select private.is_invitation_admin(); $$;
revoke all on function public.can_edit_invitation() from public, anon, authenticated;
grant execute on function public.can_edit_invitation() to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('invitation-images', 'invitation-images', true, 2097152,
        array['image/jpeg', 'image/png', 'image/webp']);
create policy invitation_images_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'invitation-images' and (select private.is_invitation_admin()));
commit;
