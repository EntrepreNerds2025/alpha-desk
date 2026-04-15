create table if not exists public.manual_interventions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  session_id uuid not null references public.sessions (id) on delete cascade,
  trade_id uuid references public.trades (id) on delete set null,
  action text not null check (
    action in (
      'manual_entry',
      'manual_cancel',
      'manual_close',
      'mode_switch',
      'override_stop',
      'override_target',
      'approved_suggestion',
      'rejected_suggestion',
      'kill_switch_activated',
      'strategy_toggled'
    )
  ),
  details jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);
