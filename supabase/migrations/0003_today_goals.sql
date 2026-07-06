create table public.today_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_date text not null,
  title text not null,
  position integer not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint today_goals_position_check check (position >= 0),
  constraint today_goals_title_non_empty_check check (btrim(title) <> '')
);

create index today_goals_user_date_idx
  on public.today_goals(user_id, goal_date);

create unique index today_goals_user_date_position_idx
  on public.today_goals(user_id, goal_date, position);

alter table public.today_goals enable row level security;

create policy "Users can view their own today goals"
on public.today_goals for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can create their own today goals"
on public.today_goals for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users can update their own today goals"
on public.today_goals for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can delete their own today goals"
on public.today_goals for delete to authenticated
using ((select auth.uid()) = user_id);
