create table if not exists public.trades (
  id uuid primary key default gen_random_uuid(),
  signal_id uuid references public.trade_signals (id) on delete set null,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  session_id uuid not null references public.sessions (id) on delete cascade,
  symbol text not null references public.symbols (id) on delete restrict,
  side text not null check (side in ('long', 'short')),
  size integer not null check (size > 0),
  entry_time timestamptz not null,
  entry_price numeric not null,
  stop_price numeric not null,
  target_price numeric not null,
  exit_time timestamptz,
  exit_price numeric,
  exit_reason text check (exit_reason is null or exit_reason in ('target', 'stop', 'manual', 'time', 'risk_override')),
  pnl_ticks numeric,
  pnl_dollars numeric,
  fees_dollars numeric not null default 0,
  net_pnl_dollars numeric,
  status text not null check (status in ('open', 'closed', 'cancelled', 'partially_filled')),
  is_paper boolean not null default true,
  broker_order_id text,
  notes text
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  trade_id uuid not null references public.trades (id) on delete cascade,
  broker_profile_id uuid not null references public.broker_profiles (id) on delete restrict,
  broker_order_id text not null,
  order_type text not null,
  side text not null,
  size integer not null check (size > 0),
  price numeric,
  status text not null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  raw_broker_response jsonb not null default '{}'::jsonb
);
