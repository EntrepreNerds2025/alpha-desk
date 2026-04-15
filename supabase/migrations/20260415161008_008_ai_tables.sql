create table if not exists public.ai_agents (
  id text primary key,
  name text not null,
  description text not null,
  default_provider text not null,
  default_model text not null
);

create table if not exists public.agent_status_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  session_id uuid references public.sessions (id) on delete set null,
  agent_id text not null references public.ai_agents (id) on delete restrict,
  status text not null check (status in ('watching', 'analyzing', 'waiting', 'acting', 'review', 'idle')),
  current_task text not null,
  priority text not null check (priority in ('low', 'normal', 'high', 'critical')),
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 100)),
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  session_id uuid references public.sessions (id) on delete set null,
  agent_id text references public.ai_agents (id) on delete set null,
  trigger text not null,
  provider text not null check (provider in ('openai', 'anthropic')),
  model text not null,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null,
  tool_calls jsonb,
  tool_results jsonb,
  input_tokens integer not null default 0,
  cached_input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd numeric not null default 0,
  latency_ms integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.cost_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  date date not null,
  agent_id text not null references public.ai_agents (id) on delete restrict,
  provider text not null check (provider in ('openai', 'anthropic')),
  model text not null,
  calls integer not null default 0,
  input_tokens bigint not null default 0,
  cached_input_tokens bigint not null default 0,
  output_tokens bigint not null default 0,
  cost_usd numeric not null default 0,
  unique (workspace_id, date, agent_id, provider, model)
);

insert into public.ai_agents (id, name, description, default_provider, default_model)
values
  ('market_watch', 'Market Watch', 'Monitors market structure and volatility shifts.', 'openai', 'gpt-5.4-mini'),
  ('setup_scout', 'Setup Scout', 'Tracks setup condition checklists and confidence.', 'anthropic', 'claude-sonnet-4-6'),
  ('news_desk', 'News Desk', 'Summarizes headline and economic-event impact.', 'openai', 'gpt-5.4-mini'),
  ('risk_manager', 'Risk Manager', 'Enforces drawdown and trade limit policies.', 'openai', 'gpt-5.4-mini'),
  ('execution_desk', 'Execution Desk', 'Coordinates order intent and broker state sync.', 'anthropic', 'claude-sonnet-4-6'),
  ('journal_desk', 'Journal Desk', 'Writes end-of-trade narratives and tags.', 'openai', 'gpt-5.4-mini'),
  ('coach', 'Coach', 'Generates performance feedback and missed-opportunity notes.', 'anthropic', 'claude-sonnet-4-6'),
  ('strategy_analyst', 'Strategy Analyst', 'Compares strategy outcomes and drift over time.', 'openai', 'gpt-5.4-mini')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  default_provider = excluded.default_provider,
  default_model = excluded.default_model;
