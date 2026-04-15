create table if not exists public.strategies (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'paper', 'paused', 'archived')),
  current_version_id uuid,
  created_at timestamptz not null default now(),
  unique (workspace_id, name)
);

create table if not exists public.strategy_versions (
  id uuid primary key default gen_random_uuid(),
  strategy_id uuid not null references public.strategies (id) on delete cascade,
  version integer not null check (version > 0),
  config jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles (id) on delete set null,
  unique (strategy_id, version)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'strategies_current_version_id_fkey'
  ) then
    alter table public.strategies
      add constraint strategies_current_version_id_fkey
      foreign key (current_version_id)
      references public.strategy_versions (id)
      on delete set null;
  end if;
end $$;
