create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  session_type text not null check (session_type in ('premarket', 'ny_open', 'midday', 'power_hour', 'full_day', 'custom')),
  mode_at_start text not null check (mode_at_start in ('manual', 'assist', 'auto_paper', 'auto_live')),
  notes text,
  grade text check (grade in ('A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D', 'F')),
  grade_reasons jsonb
);

create table if not exists public.market_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  session_id uuid references public.sessions (id) on delete set null,
  event_type text not null check (event_type in ('news', 'econ_release', 'volatility_spike', 'session_open', 'session_close', 'user_note')),
  impact text not null check (impact in ('low', 'medium', 'high', 'critical')),
  symbol text references public.symbols (id) on delete set null,
  headline text not null,
  body text,
  source text,
  scheduled_at timestamptz,
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);
