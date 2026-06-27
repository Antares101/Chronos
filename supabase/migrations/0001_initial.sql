create type public.block_category as enum ('work', 'home', 'training');
create type public.block_phase as enum ('planning', 'execution', 'conclusion');
create type public.task_status as enum ('todo', 'done');
create type public.task_source as enum ('general', 'block');
create type public.pause_kind as enum ('5m', '10m', 'untimed');
create type public.actual_activity as enum ('focus', 'pause', 'inactivity');

create table public.blocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category public.block_category not null,
  title text not null,
  planned_start timestamptz not null,
  planned_end timestamptz not null,
  phase public.block_phase not null default 'planning',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint blocks_planned_range_check check (planned_end > planned_start)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  block_id uuid references public.blocks(id) on delete set null,
  title text not null,
  status public.task_status not null default 'todo',
  source public.task_source not null default 'general',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  block_id uuid not null references public.blocks(id) on delete cascade,
  title text not null,
  highlighted boolean not null default true,
  occurred_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_highlighted_check check (highlighted is true)
);

create table public.pauses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  block_id uuid not null references public.blocks(id) on delete cascade,
  kind public.pause_kind not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pauses_time_range_check check (ended_at is null or ended_at >= started_at)
);

create table public.actual_time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  block_id uuid not null references public.blocks(id) on delete cascade,
  phase public.block_phase not null,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  activity public.actual_activity not null,
  pause_id uuid references public.pauses(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint actual_time_entries_time_range_check check (ended_at >= started_at)
);

create table public.conclusion_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  block_id uuid not null references public.blocks(id) on delete cascade,
  completed_task_ids jsonb not null default '[]'::jsonb,
  planned_minutes integer not null,
  actual_minutes integer not null,
  notes text not null,
  next_adjustment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conclusion_reviews_minutes_check check (planned_minutes >= 0 and actual_minutes >= 0),
  constraint conclusion_reviews_completed_task_ids_array_check check (jsonb_typeof(completed_task_ids) = 'array')
);

create index blocks_user_planned_start_idx on public.blocks(user_id, planned_start);
create index tasks_user_idx on public.tasks(user_id);
create index tasks_block_idx on public.tasks(block_id);
create index events_user_block_idx on public.events(user_id, block_id);
create index pauses_user_block_idx on public.pauses(user_id, block_id);
create index actual_time_entries_user_block_idx on public.actual_time_entries(user_id, block_id);
create index conclusion_reviews_user_block_idx on public.conclusion_reviews(user_id, block_id);
