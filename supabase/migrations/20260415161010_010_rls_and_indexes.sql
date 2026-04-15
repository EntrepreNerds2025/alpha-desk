alter table public.profiles enable row level security;
alter table public.broker_profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.watchlists enable row level security;
alter table public.strategies enable row level security;
alter table public.strategy_versions enable row level security;
alter table public.sessions enable row level security;
alter table public.market_events enable row level security;
alter table public.setup_candidates enable row level security;
alter table public.trade_signals enable row level security;
alter table public.trades enable row level security;
alter table public.orders enable row level security;
alter table public.risk_rules enable row level security;
alter table public.risk_events enable row level security;
alter table public.manual_interventions enable row level security;
alter table public.agent_status_events enable row level security;
alter table public.ai_messages enable row level security;
alter table public.cost_logs enable row level security;
alter table public.replay_sessions enable row level security;
alter table public.replay_events enable row level security;
alter table public.symbols enable row level security;
alter table public.ai_agents enable row level security;

drop policy if exists profiles_self_access on public.profiles;
create policy profiles_self_access
on public.profiles
for all
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists broker_profiles_owner_access on public.broker_profiles;
create policy broker_profiles_owner_access
on public.broker_profiles
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists workspaces_owner_access on public.workspaces;
create policy workspaces_owner_access
on public.workspaces
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists watchlists_workspace_access on public.watchlists;
create policy watchlists_workspace_access
on public.watchlists
for all
to authenticated
using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

drop policy if exists strategies_workspace_access on public.strategies;
create policy strategies_workspace_access
on public.strategies
for all
to authenticated
using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

drop policy if exists strategy_versions_workspace_access on public.strategy_versions;
create policy strategy_versions_workspace_access
on public.strategy_versions
for all
to authenticated
using (
  strategy_id in (
    select s.id
    from public.strategies s
    join public.workspaces w on w.id = s.workspace_id
    where w.user_id = auth.uid()
  )
)
with check (
  strategy_id in (
    select s.id
    from public.strategies s
    join public.workspaces w on w.id = s.workspace_id
    where w.user_id = auth.uid()
  )
);

drop policy if exists sessions_workspace_access on public.sessions;
create policy sessions_workspace_access
on public.sessions
for all
to authenticated
using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

drop policy if exists market_events_workspace_access on public.market_events;
create policy market_events_workspace_access
on public.market_events
for all
to authenticated
using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

drop policy if exists setup_candidates_workspace_access on public.setup_candidates;
create policy setup_candidates_workspace_access
on public.setup_candidates
for all
to authenticated
using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

drop policy if exists trade_signals_workspace_access on public.trade_signals;
create policy trade_signals_workspace_access
on public.trade_signals
for all
to authenticated
using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

drop policy if exists trades_workspace_access on public.trades;
create policy trades_workspace_access
on public.trades
for all
to authenticated
using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

drop policy if exists orders_workspace_access on public.orders;
create policy orders_workspace_access
on public.orders
for all
to authenticated
using (
  trade_id in (
    select t.id
    from public.trades t
    join public.workspaces w on w.id = t.workspace_id
    where w.user_id = auth.uid()
  )
)
with check (
  trade_id in (
    select t.id
    from public.trades t
    join public.workspaces w on w.id = t.workspace_id
    where w.user_id = auth.uid()
  )
);

drop policy if exists risk_rules_workspace_access on public.risk_rules;
create policy risk_rules_workspace_access
on public.risk_rules
for all
to authenticated
using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

drop policy if exists risk_events_workspace_access on public.risk_events;
create policy risk_events_workspace_access
on public.risk_events
for all
to authenticated
using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

drop policy if exists manual_interventions_workspace_access on public.manual_interventions;
create policy manual_interventions_workspace_access
on public.manual_interventions
for all
to authenticated
using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

drop policy if exists agent_status_events_workspace_access on public.agent_status_events;
create policy agent_status_events_workspace_access
on public.agent_status_events
for all
to authenticated
using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

drop policy if exists ai_messages_workspace_access on public.ai_messages;
create policy ai_messages_workspace_access
on public.ai_messages
for all
to authenticated
using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

drop policy if exists cost_logs_workspace_access on public.cost_logs;
create policy cost_logs_workspace_access
on public.cost_logs
for all
to authenticated
using (workspace_id in (select id from public.workspaces where user_id = auth.uid()))
with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

drop policy if exists replay_sessions_workspace_access on public.replay_sessions;
create policy replay_sessions_workspace_access
on public.replay_sessions
for all
to authenticated
using (
  session_id in (
    select s.id
    from public.sessions s
    join public.workspaces w on w.id = s.workspace_id
    where w.user_id = auth.uid()
  )
)
with check (
  session_id in (
    select s.id
    from public.sessions s
    join public.workspaces w on w.id = s.workspace_id
    where w.user_id = auth.uid()
  )
);

drop policy if exists replay_events_workspace_access on public.replay_events;
create policy replay_events_workspace_access
on public.replay_events
for all
to authenticated
using (
  session_id in (
    select s.id
    from public.sessions s
    join public.workspaces w on w.id = s.workspace_id
    where w.user_id = auth.uid()
  )
)
with check (
  session_id in (
    select s.id
    from public.sessions s
    join public.workspaces w on w.id = s.workspace_id
    where w.user_id = auth.uid()
  )
);

drop policy if exists symbols_authenticated_read on public.symbols;
create policy symbols_authenticated_read
on public.symbols
for select
to authenticated
using (true);

drop policy if exists ai_agents_authenticated_read on public.ai_agents;
create policy ai_agents_authenticated_read
on public.ai_agents
for select
to authenticated
using (true);

create index if not exists idx_trades_workspace_session_entry_time
  on public.trades (workspace_id, session_id, entry_time);

create index if not exists idx_setup_candidates_workspace_session_status
  on public.setup_candidates (workspace_id, session_id, status);

create index if not exists idx_ai_messages_workspace_created_desc
  on public.ai_messages (workspace_id, created_at desc);

create index if not exists idx_cost_logs_workspace_date_desc
  on public.cost_logs (workspace_id, date desc);

create index if not exists idx_agent_status_events_workspace_occurred_desc
  on public.agent_status_events (workspace_id, occurred_at desc);

create index if not exists idx_replay_events_session_t
  on public.replay_events (session_id, t);

create index if not exists idx_market_events_workspace_impact_occurred
  on public.market_events (workspace_id, impact, occurred_at desc);

create index if not exists idx_trade_signals_workspace_session_created
  on public.trade_signals (workspace_id, session_id, created_at desc);

create index if not exists idx_orders_trade_submitted
  on public.orders (trade_id, submitted_at desc);
