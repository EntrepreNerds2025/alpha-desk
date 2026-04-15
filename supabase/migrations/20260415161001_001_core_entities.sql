create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  timezone text not null default 'America/New_York',
  preferred_accent text not null default 'electric_blue',
  created_at timestamptz not null default now()
);

create table if not exists public.broker_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  broker text not null check (broker in ('tradovate', 'ninjatrader', 'rithmic', 'paper_simulator')),
  account_type text not null check (account_type in ('demo', 'live', 'prop_firm')),
  prop_firm text check (prop_firm is null or prop_firm in ('topstep', 'tpt', 'apex', 'mff', 'leeloo')),
  account_number text not null,
  vault_secret_id text not null,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  mode text not null default 'manual' check (mode in ('manual', 'assist', 'auto_paper', 'auto_live')),
  broker_profile_id uuid references public.broker_profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create table if not exists public.symbols (
  id text primary key,
  name text not null,
  exchange text not null,
  asset_class text not null,
  tick_size numeric not null,
  tick_value numeric not null,
  contract_multiplier numeric not null,
  trading_hours jsonb not null default '{}'::jsonb
);

create table if not exists public.watchlists (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  symbols text[] not null default '{}',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (workspace_id, name)
);

insert into public.symbols (id, name, exchange, asset_class, tick_size, tick_value, contract_multiplier, trading_hours)
values
  (
    'NQ',
    'E-mini Nasdaq 100',
    'CME',
    'index_future',
    0.25,
    5,
    20,
    '{"session":"sun-fri 18:00-17:00 ET","break":"17:00-18:00 ET"}'::jsonb
  ),
  (
    'ES',
    'E-mini S&P 500',
    'CME',
    'index_future',
    0.25,
    12.5,
    50,
    '{"session":"sun-fri 18:00-17:00 ET","break":"17:00-18:00 ET"}'::jsonb
  ),
  (
    'CL',
    'Crude Oil',
    'NYMEX',
    'energy_future',
    0.01,
    10,
    1000,
    '{"session":"sun-fri 18:00-17:00 ET","break":"17:00-18:00 ET"}'::jsonb
  ),
  (
    'GC',
    'Gold',
    'COMEX',
    'metals_future',
    0.1,
    10,
    100,
    '{"session":"sun-fri 18:00-17:00 ET","break":"17:00-18:00 ET"}'::jsonb
  ),
  (
    'YM',
    'E-mini Dow',
    'CBOT',
    'index_future',
    1,
    5,
    5,
    '{"session":"sun-fri 18:00-17:00 ET","break":"17:00-18:00 ET"}'::jsonb
  ),
  (
    'RTY',
    'E-mini Russell 2000',
    'CME',
    'index_future',
    0.1,
    5,
    50,
    '{"session":"sun-fri 18:00-17:00 ET","break":"17:00-18:00 ET"}'::jsonb
  ),
  (
    'BTC',
    'CME Bitcoin Futures',
    'CME',
    'crypto_future',
    5,
    25,
    5,
    '{"session":"sun-fri 18:00-17:00 ET","break":"17:00-18:00 ET"}'::jsonb
  ),
  (
    'ETH',
    'CME Ether Futures',
    'CME',
    'crypto_future',
    0.25,
    12.5,
    50,
    '{"session":"sun-fri 18:00-17:00 ET","break":"17:00-18:00 ET"}'::jsonb
  )
on conflict (id) do nothing;
