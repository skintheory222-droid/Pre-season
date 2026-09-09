-- Preseason Dashboard Schema

create table if not exists days (
  id uuid primary key default gen_random_uuid(),
  day_number integer unique not null check (day_number between 1 and 60),
  phase text not null,
  tasks jsonb not null default '[]'::jsonb,
  bonus_tasks jsonb not null default '[]'::jsonb,
  task_order text[] not null default '{}',
  bonus_task_order text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  explanation text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references habits(id) on delete cascade,
  day_number integer not null,
  completed boolean not null default false,
  logged_at timestamptz not null default now(),
  unique (habit_id, day_number)
);

create table if not exists settings (
  key text primary key,
  value text not null
);
