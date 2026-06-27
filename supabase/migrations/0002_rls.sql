-- Security assumptions for Chronos MVP:
-- 1. Every persisted application table has a non-null user_id that references auth.users(id).
-- 2. Server-side code writes user_id from the authenticated Supabase session, never from untrusted client input.
-- 3. Supabase Auth JWTs expose the current user through auth.uid(); anonymous users receive no table access.
-- 4. RLS is the last line of defense for cross-user isolation; service-role access must stay server-only.

alter table public.blocks enable row level security;
alter table public.tasks enable row level security;
alter table public.events enable row level security;
alter table public.pauses enable row level security;
alter table public.actual_time_entries enable row level security;
alter table public.conclusion_reviews enable row level security;

create policy "Users can view their own blocks"
on public.blocks for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own blocks"
on public.blocks for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own blocks"
on public.blocks for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own blocks"
on public.blocks for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can view their own tasks"
on public.tasks for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own tasks"
on public.tasks for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and (
    tasks.block_id is null
    or exists (
      select 1 from public.blocks where blocks.id = tasks.block_id and blocks.user_id = (select auth.uid())
    )
  )
);

create policy "Users can update their own tasks"
on public.tasks for update to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and (
    tasks.block_id is null
    or exists (
      select 1 from public.blocks where blocks.id = tasks.block_id and blocks.user_id = (select auth.uid())
    )
  )
);

create policy "Users can delete their own tasks"
on public.tasks for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can view their own events"
on public.events for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own events"
on public.events for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.blocks where blocks.id = events.block_id and blocks.user_id = (select auth.uid())
  )
);

create policy "Users can update their own events"
on public.events for update to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.blocks where blocks.id = events.block_id and blocks.user_id = (select auth.uid())
  )
);

create policy "Users can delete their own events"
on public.events for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can view their own pauses"
on public.pauses for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own pauses"
on public.pauses for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.blocks where blocks.id = pauses.block_id and blocks.user_id = (select auth.uid())
  )
);

create policy "Users can update their own pauses"
on public.pauses for update to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.blocks where blocks.id = pauses.block_id and blocks.user_id = (select auth.uid())
  )
);

create policy "Users can delete their own pauses"
on public.pauses for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can view their own actual time entries"
on public.actual_time_entries for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own actual time entries"
on public.actual_time_entries for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.blocks where blocks.id = actual_time_entries.block_id and blocks.user_id = (select auth.uid())
  )
  and (
    actual_time_entries.pause_id is null
    or exists (
      select 1 from public.pauses where pauses.id = actual_time_entries.pause_id and pauses.user_id = (select auth.uid())
    )
  )
);

create policy "Users can update their own actual time entries"
on public.actual_time_entries for update to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.blocks where blocks.id = actual_time_entries.block_id and blocks.user_id = (select auth.uid())
  )
  and (
    actual_time_entries.pause_id is null
    or exists (
      select 1 from public.pauses where pauses.id = actual_time_entries.pause_id and pauses.user_id = (select auth.uid())
    )
  )
);

create policy "Users can delete their own actual time entries"
on public.actual_time_entries for delete to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can view their own conclusion reviews"
on public.conclusion_reviews for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own conclusion reviews"
on public.conclusion_reviews for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.blocks where blocks.id = conclusion_reviews.block_id and blocks.user_id = (select auth.uid())
  )
);

create policy "Users can update their own conclusion reviews"
on public.conclusion_reviews for update to authenticated
using ((select auth.uid()) = user_id)
with check (
  (select auth.uid()) = user_id
  and exists (
    select 1 from public.blocks where blocks.id = conclusion_reviews.block_id and blocks.user_id = (select auth.uid())
  )
);

create policy "Users can delete their own conclusion reviews"
on public.conclusion_reviews for delete to authenticated
using ((select auth.uid()) = user_id);
