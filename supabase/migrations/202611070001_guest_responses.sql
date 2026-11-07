begin;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table private.admin_members (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table private.admin_members enable row level security;

create function private.is_invitation_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from private.admin_members where user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_invitation_admin() from public;
grant execute on function private.is_invitation_admin() to authenticated;

create table public.attendance (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  name text not null check (char_length(btrim(name)) between 1 and 60),
  attending boolean not null,
  created_at timestamptz not null default now(),
  unique (owner_id, name)
);

create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid(),
  name text not null check (char_length(btrim(name)) between 1 and 60),
  message text not null check (char_length(btrim(message)) between 1 and 1500),
  created_at timestamptz not null default now()
);
create index wishes_feed_idx on public.wishes (created_at desc, id desc);

alter table public.attendance enable row level security;
alter table public.wishes enable row level security;

revoke all on public.attendance, public.wishes from public, anon, authenticated;
grant insert (name, attending), select, update (name, attending)
  on public.attendance to authenticated;
grant select (id, name, message, created_at) on public.wishes to anon, authenticated;
grant insert (id, name, message), update (name, message), delete
  on public.wishes to authenticated;

create policy attendance_submit on public.attendance for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy attendance_admin_read on public.attendance for select to authenticated
  using ((select private.is_invitation_admin()));
create policy attendance_admin_edit on public.attendance for update to authenticated
  using ((select private.is_invitation_admin()))
  with check ((select private.is_invitation_admin()));

create policy wishes_public_read on public.wishes for select to anon, authenticated
  using (true);
create policy wishes_submit on public.wishes for insert to authenticated
  with check (owner_id = (select auth.uid()));
create policy wishes_edit on public.wishes for update to authenticated
  using (owner_id = (select auth.uid()) or (select private.is_invitation_admin()))
  with check (owner_id = (select auth.uid()) or (select private.is_invitation_admin()));
create policy wishes_admin_delete on public.wishes for delete to authenticated
  using ((select private.is_invitation_admin()));

create function public.own_wish_ids()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select id from public.wishes where owner_id = (select auth.uid());
$$;
revoke all on function public.own_wish_ids() from public, anon, authenticated;
grant execute on function public.own_wish_ids() to authenticated;

commit;
