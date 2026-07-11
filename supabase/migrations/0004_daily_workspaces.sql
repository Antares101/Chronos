create table public.daily_workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  workspace_date text not null,
  focus text,
  constraints text,
  outcome text,
  tomorrow_adjustment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint daily_workspaces_user_date_key unique (user_id, workspace_date),
  constraint daily_workspaces_date_key_check check (
    workspace_date ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
    and to_char(workspace_date::date, 'YYYY-MM-DD') = workspace_date
  ),
  constraint daily_workspaces_focus_check check (
    focus is null or (focus = btrim(focus) and char_length(focus) between 1 and 160)
  ),
  constraint daily_workspaces_constraints_check check (
    constraints is null
    or (constraints = btrim(constraints) and char_length(constraints) between 1 and 500)
  ),
  constraint daily_workspaces_outcome_check check (
    outcome is null or (outcome = btrim(outcome) and char_length(outcome) between 1 and 500)
  ),
  constraint daily_workspaces_tomorrow_adjustment_check check (
    tomorrow_adjustment is null
    or (tomorrow_adjustment = btrim(tomorrow_adjustment) and char_length(tomorrow_adjustment) between 1 and 280)
  ),
  constraint daily_workspaces_closeout_pair_check check (
    (outcome is null and tomorrow_adjustment is null)
    or (outcome is not null and tomorrow_adjustment is not null)
  )
);

alter table public.daily_workspaces enable row level security;

create policy "Users can view their own daily workspaces"
on public.daily_workspaces for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own daily workspaces"
on public.daily_workspaces for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own daily workspaces"
on public.daily_workspaces for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own daily workspaces"
on public.daily_workspaces for delete to authenticated
using ((select auth.uid()) = user_id);
