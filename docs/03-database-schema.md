# Database Schema

Target: Supabase (Postgres). Realtime subscriptions for live-updating UI. Row-level security since this is single-user but designed to support multi-account later.

## Core entities

### users
Handled by Supabase Auth. Extended via `profiles` table.

### profiles
```sql
id uuid PK (references auth.users)
display_name text
timezone text default 'America/New_York'
preferred_accent text default 'electric_blue'
created_at timestamptz
```

### workspaces
A user can have multiple workspaces (e.g., "My Primary", "Prop Firm A", "Prop Firm B"). For V1: one workspace per user.
```sql
id uuid PK
user_id uuid FK -> profiles
name text
mode text check (mode in ('manual','assist','auto_paper','auto_live'))
broker_profile_id uuid nullable
created_at timestamptz
```

### broker_profiles
Stores broker connection config (NOT secrets — those live in Supabase Vault).
```sql
id uuid PK
user_id uuid FK
broker text check (broker in ('tradovate','ninjatrader','rithmic','paper_simulator'))
account_type text check (account_type in ('demo','live','prop_firm'))
prop_firm text nullable check (prop_firm in ('topstep','tpt','apex','mff','leeloo', null))
account_number text
vault_secret_id text -- reference to Supabase Vault
enabled boolean default true
created_at timestamptz
```

### symbols
Reference table. Pre-populated.
```sql
id text PK -- 'NQ', 'ES', 'CL', ...
name text
exchange text -- 'CME', 'NYMEX', 'COMEX'
asset_class text -- 'index_future', 'energy_future', 'metals_future', 'crypto_future'
tick_size numeric
tick_value numeric -- dollars per tick
contract_multiplier numeric
trading_hours jsonb
```

### watchlists
```sql
id uuid PK
workspace_id uuid FK
name text
symbols text[] -- array of symbol ids
sort_order int
```

### strategies
```sql
id uuid PK
workspace_id uuid FK
name text
description text
status text check (status in ('draft','paper','paused','archived'))
current_version_id uuid FK -> strategy_versions
created_at timestamptz
```

### strategy_versions
Immutable. New version on every edit.
```sql
id uuid PK
strategy_id uuid FK
version int
config jsonb -- full Strategy interface from 02-strategy-framework.md
created_at timestamptz
created_by uuid
```

### sessions
A trading session (one per day per workspace, or one per manual start/stop).
```sql
id uuid PK
workspace_id uuid FK
started_at timestamptz
ended_at timestamptz nullable
session_type text check (session_type in ('premarket','ny_open','midday','power_hour','full_day','custom'))
mode_at_start text
notes text
grade text nullable -- 'A+','A','B+',...
grade_reasons jsonb nullable
```

### market_events
Every interesting thing that happens — news, economic releases, volatility spikes.
```sql
id uuid PK
workspace_id uuid FK
session_id uuid FK nullable
event_type text check (event_type in ('news','econ_release','volatility_spike','session_open','session_close','user_note'))
impact text check (impact in ('low','medium','high','critical'))
symbol text nullable
headline text
body text
source text
scheduled_at timestamptz nullable
occurred_at timestamptz
metadata jsonb
```

### setup_candidates
Every time a strategy says "a setup might be forming."
```sql
id uuid PK
workspace_id uuid FK
session_id uuid FK
strategy_version_id uuid FK
symbol text
direction text check (direction in ('long','short'))
conditions_met jsonb -- array of { condition_id, met: bool, value, weight }
confidence numeric -- 0-100
status text check (status in ('forming','ready','invalidated','taken','skipped'))
first_detected_at timestamptz
resolved_at timestamptz nullable
metadata jsonb
```

### trade_signals
When a candidate crosses the action threshold.
```sql
id uuid PK
setup_candidate_id uuid FK
workspace_id uuid FK
session_id uuid FK
strategy_version_id uuid FK
symbol text
direction text
entry_type text check (entry_type in ('market','limit','stop'))
entry_price numeric
stop_price numeric
target_price numeric
size int -- number of contracts
risk_amount numeric
reward_amount numeric
rr_ratio numeric
confidence numeric
status text check (status in ('pending','sent','filled','cancelled','rejected'))
reason text
created_at timestamptz
```

### trades
A completed or open trade.
```sql
id uuid PK
signal_id uuid FK
workspace_id uuid FK
session_id uuid FK
symbol text
side text check (side in ('long','short'))
size int
entry_time timestamptz
entry_price numeric
stop_price numeric
target_price numeric
exit_time timestamptz nullable
exit_price numeric nullable
exit_reason text nullable -- 'target','stop','manual','time','risk_override'
pnl_ticks numeric nullable
pnl_dollars numeric nullable
fees_dollars numeric default 0
net_pnl_dollars numeric nullable
status text check (status in ('open','closed','cancelled','partially_filled'))
is_paper boolean default true
broker_order_id text nullable
notes text
```

### orders
Low-level broker orders (paper or real). One trade can have multiple orders (entry, stop, target).
```sql
id uuid PK
trade_id uuid FK
broker_profile_id uuid FK
broker_order_id text
order_type text
side text
size int
price numeric nullable
status text
submitted_at timestamptz
updated_at timestamptz
raw_broker_response jsonb
```

### risk_rules
```sql
id uuid PK
workspace_id uuid FK
rule_type text check (rule_type in (
  'max_daily_loss','max_trades_per_session','max_position_size',
  'cooldown_after_loss','cooldown_after_win','news_block_window',
  'session_max_loss','daily_profit_target','max_consecutive_losses'
))
value jsonb
enabled boolean default true
created_at timestamptz
```

### risk_events
Every block, override, or limit approach.
```sql
id uuid PK
workspace_id uuid FK
session_id uuid FK
rule_id uuid FK nullable
event text check (event in ('block','approach_80','approach_95','override','reset','breach'))
context jsonb
occurred_at timestamptz
```

### manual_interventions
When the user overrides the bot.
```sql
id uuid PK
workspace_id uuid FK
session_id uuid FK
trade_id uuid FK nullable
action text check (action in (
  'manual_entry','manual_cancel','manual_close','mode_switch',
  'override_stop','override_target','approved_suggestion','rejected_suggestion',
  'kill_switch_activated','strategy_toggled'
))
details jsonb
occurred_at timestamptz
```

### ai_agents
Reference table of the 8 agents.
```sql
id text PK -- 'market_watch', 'setup_scout', 'news_desk', ...
name text
description text
default_provider text
default_model text
```

### agent_status_events
Feeds the Kanban board in real time.
```sql
id uuid PK
workspace_id uuid FK
session_id uuid FK nullable
agent_id text FK
status text check (status in ('watching','analyzing','waiting','acting','review','idle'))
current_task text
priority text check (priority in ('low','normal','high','critical'))
confidence numeric nullable
metadata jsonb
occurred_at timestamptz
```

### ai_messages
Every LLM call.
```sql
id uuid PK
workspace_id uuid FK
session_id uuid FK nullable
agent_id text FK nullable
trigger text -- 'user_chat','setup_event','trade_filled','session_end',...
provider text -- 'openai','anthropic'
model text -- 'gpt-5.4-mini','claude-sonnet-4-6','claude-haiku-4-5'
role text check (role in ('user','assistant','system','tool'))
content text
tool_calls jsonb nullable
tool_results jsonb nullable
input_tokens int
cached_input_tokens int default 0
output_tokens int
cost_usd numeric
latency_ms int
created_at timestamptz
```

### cost_logs
Rollup for the Cost Monitor tab.
```sql
id uuid PK
workspace_id uuid FK
date date
agent_id text
provider text
model text
calls int
input_tokens bigint
cached_input_tokens bigint
output_tokens bigint
cost_usd numeric
UNIQUE(workspace_id, date, agent_id, provider, model)
```

### replay_sessions
```sql
id uuid PK
session_id uuid FK
generated_at timestamptz
market_opportunity_score numeric
bot_execution_score numeric
user_execution_score numeric
strategy_discipline_score numeric
news_disruption_score numeric
overall_grade text
summary text
lessons jsonb
missed_setups jsonb
best_setup_taken_id uuid nullable
worst_trade_id uuid nullable
```

### replay_events
A denormalized event stream for scrubbing through a session.
```sql
id uuid PK
session_id uuid FK
t timestamptz
event_type text -- references any of the above tables
ref_table text
ref_id uuid
snapshot jsonb -- point-in-time state for fast scrubbing
```

## Realtime channels (Supabase)

Subscribe the frontend to these for live updates:

- `agent_status_events` (filter: workspace_id) → Kanban board
- `setup_candidates` (filter: workspace_id, status != 'invalidated') → Setup Board
- `trades` (filter: workspace_id, status = 'open') → open positions panel
- `risk_events` (filter: workspace_id, session_id) → risk panel + notifications
- `market_events` (filter: workspace_id, impact in ('high','critical')) → news timeline + narrative
- `ai_messages` (filter: workspace_id, agent_id) → agent thinking stream

## Row-level security

Every table with `workspace_id` needs an RLS policy: `workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())`

## Indexes to add upfront

- `trades(workspace_id, session_id, entry_time)`
- `setup_candidates(workspace_id, session_id, status)`
- `ai_messages(workspace_id, created_at DESC)`
- `cost_logs(workspace_id, date DESC)`
- `agent_status_events(workspace_id, occurred_at DESC)`
- `replay_events(session_id, t)`

## Migration order

1. profiles, workspaces, symbols (reference)
2. strategies + strategy_versions
3. sessions + market_events
4. setup_candidates + trade_signals
5. trades + orders
6. risk_rules + risk_events
7. manual_interventions
8. ai_agents (seed 8 agents) + agent_status_events + ai_messages + cost_logs
9. replay_sessions + replay_events
10. RLS policies + indexes

Claude Code should generate these as sequential Supabase migrations.
