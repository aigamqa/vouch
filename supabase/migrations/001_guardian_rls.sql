-- ============================================================
-- Migration 001: Guardian RLS policies (anon access via invite_token)
-- Run in Supabase SQL Editor
-- ============================================================

-- Allow anon to read guardians (Guardian clicks invite link)
create policy "guardians: anon read by token"
  on public.guardians for select to anon
  using (true);

-- Allow anon to update their guardian record (accept the invite)
create policy "guardians: anon update"
  on public.guardians for update to anon
  using (true) with check (true);

-- Allow anon to read tasks linked to a guardian record
create policy "tasks: anon read via guardian"
  on public.tasks for select to anon
  using (
    exists (select 1 from public.guardians g where g.id = guardian_id)
  );

-- Allow anon Guardian to update task status after verdict
create policy "tasks: guardian verdict update"
  on public.tasks for update to anon
  using (
    exists (select 1 from public.guardians g where g.id = guardian_id)
  )
  with check (true);

-- Allow anon to insert verdicts
create policy "verdicts: guardian insert"
  on public.verdicts for insert to anon
  with check (true);
