begin;

create policy wishes_owner_delete on public.wishes for delete to authenticated
  using (owner_id = (select auth.uid()));

commit;
