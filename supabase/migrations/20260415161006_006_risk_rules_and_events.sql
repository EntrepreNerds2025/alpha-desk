create table if not exists public.risk_rules (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  rule_type text not null check (
    rule_type in (
      'max_daily_loss',
      'max_trades_per_session',
      'max_position_size',
      'cooldown_after_loss',
      'cooldown_after_win',
      'news_block_window',
      'session_max_loss',
      'daily_profit_target',
      'max_consecutive_losses'
    )
  ),
  value jsonb not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.risk_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  session_id uuid not null references public.sessions (id) on delete cascade,
  rule_id uuid references public.risk_rules (id) on delete set null,
  event text not null check (event in ('block', 'approach_80', 'approach_95', 'override', 'reset', 'breach')),
  context jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
