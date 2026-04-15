create table if not exists public.replay_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  generated_at timestamptz not null default now(),
  market_opportunity_score numeric,
  bot_execution_score numeric,
  user_execution_score numeric,
  strategy_discipline_score numeric,
  news_disruption_score numeric,
  overall_grade text,
  summary text,
  lessons jsonb not null default '[]'::jsonb,
  missed_setups jsonb not null default '[]'::jsonb,
  best_setup_taken_id uuid references public.setup_candidates (id) on delete set null,
  worst_trade_id uuid references public.trades (id) on delete set null
);

create table if not exists public.replay_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions (id) on delete cascade,
  t timestamptz not null,
  event_type text not null,
  ref_table text not null,
  ref_id uuid,
  snapshot jsonb not null default '{}'::jsonb
);
