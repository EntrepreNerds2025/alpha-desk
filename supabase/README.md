# Supabase Schema

This folder contains the `03-database-schema` implementation as sequential SQL migrations.

## Migration order

1. `001_core_entities.sql`
2. `002_strategies.sql`
3. `003_sessions_and_market_events.sql`
4. `004_setup_candidates_and_trade_signals.sql`
5. `005_trades_and_orders.sql`
6. `006_risk_rules_and_events.sql`
7. `007_manual_interventions.sql`
8. `008_ai_tables.sql`
9. `009_replay_tables.sql`
10. `010_rls_and_indexes.sql`

## Apply

```bash
npx supabase db push
```

If you need local reset:

```bash
npx supabase db reset
```

## Notes

- `symbols` and `ai_agents` are seeded in migrations.
- RLS is enabled for all user/workspace scoped tables.
- Policies follow the workspace ownership model:
  `workspace_id IN (SELECT id FROM workspaces WHERE user_id = auth.uid())`.
