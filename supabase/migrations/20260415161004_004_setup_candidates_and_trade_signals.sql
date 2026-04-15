create table if not exists public.setup_candidates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  session_id uuid not null references public.sessions (id) on delete cascade,
  strategy_version_id uuid not null references public.strategy_versions (id) on delete restrict,
  symbol text not null references public.symbols (id) on delete restrict,
  direction text not null check (direction in ('long', 'short')),
  conditions_met jsonb not null default '[]'::jsonb,
  confidence numeric not null check (confidence >= 0 and confidence <= 100),
  status text not null check (status in ('forming', 'ready', 'invalidated', 'taken', 'skipped')),
  first_detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.trade_signals (
  id uuid primary key default gen_random_uuid(),
  setup_candidate_id uuid not null references public.setup_candidates (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  session_id uuid not null references public.sessions (id) on delete cascade,
  strategy_version_id uuid not null references public.strategy_versions (id) on delete restrict,
  symbol text not null references public.symbols (id) on delete restrict,
  direction text not null check (direction in ('long', 'short')),
  entry_type text not null check (entry_type in ('market', 'limit', 'stop')),
  entry_price numeric not null,
  stop_price numeric not null,
  target_price numeric not null,
  size integer not null check (size > 0),
  risk_amount numeric not null,
  reward_amount numeric not null,
  rr_ratio numeric not null,
  confidence numeric not null check (confidence >= 0 and confidence <= 100),
  status text not null check (status in ('pending', 'sent', 'filled', 'cancelled', 'rejected')),
  reason text not null,
  created_at timestamptz not null default now()
);
