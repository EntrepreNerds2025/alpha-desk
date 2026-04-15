# Repo Handoff Prompt — Claude Code / Codex

After Lovable generates the UI and you sync to GitHub, open the repo in Claude Code (`claude code` in terminal) or Codex CLI. Paste the prompt below as your first message. It references the other docs in this folder, so make sure they're committed to the repo.

## Step-by-step handoff process

1. In Lovable: click GitHub → create new repo → wait for sync
2. Clone into this folder: `git clone <repo-url> .` (may need to move/merge files)
3. Ensure all `docs/` files are committed
4. Add `.gitignore` entries for `.env*`, `node_modules`, `.next`, `dist`, `*.log`
5. Open terminal in the folder, run `claude code` (or Codex equivalent)
6. Paste the prompt below
7. Let the agent propose a plan, review, then let it start committing

## First prompt (paste into Claude Code / Codex)

```
You are taking over an "AI Trading Office" repo. Lovable generated the frontend. Your job is to turn it into a production-ready paper-trading platform for futures, and prepare it for live prop firm trading later.

READ FIRST (in order):
- README.md
- docs/00-vision-and-scope.md
- docs/01-lovable-prompt.md  (for context on what the UI should look like — do not change the visual design without a reason)
- docs/02-strategy-framework.md
- docs/03-database-schema.md
- docs/04-tradingview-integration.md
- docs/05-prop-firm-rules.md
- docs/06-tech-stack-and-hosting.md
- docs/08-roadmap.md

PROJECT GOALS

V1 (this build): Full paper-trading loop.
- Multi-strategy framework (Sweep Long/Short, ORB, VWAP Reclaim, Hourly Zone, Failed Breakdown)
- TradingView webhook ingestion
- Event-driven AI narration (never in the hot path)
- Replay with session grading
- Risk command center with kill switch
- Tradovate paper broker integration
- 8 agents feeding the AI Trading Office Kanban board in real time

V2 (later): Live prop firm, multi-account copy trading.

HARD CONSTRAINTS

1. LLMs must NOT sit in the execution hot path. Rules engine decides. AI explains.
2. No exchange credentials in the frontend. Ever. All broker calls from the worker.
3. Mode badge (Manual / Assist / Auto Paper / Auto Live) visible on every page. Kill switch on every page.
4. Paper mode is default. Auto Live is gated by compliance acknowledgment (see docs/05).
5. Preserve the Lovable visual design unless a change demonstrably improves clarity or performance.
6. Every AI call is logged to ai_messages with cost attribution.
7. Every trade decision has a full reason chain — no black-box entries.

STACK

- Next.js 15 App Router (from Lovable)
- Supabase (Postgres, Auth, Realtime, Vault, Edge Functions)
- Fastify worker on Fly.io (Chicago region, future)
- BullMQ + Upstash Redis
- OpenAI + Anthropic via an internal ai-routing package
- pnpm + Turborepo monorepo

REPO STRUCTURE TO CREATE

Restructure the Lovable output into the monorepo described in docs/06-tech-stack-and-hosting.md.

TASK PLAN — PROPOSE AND EXECUTE IN ORDER

Phase A: Foundation (commit early, commit often)
  A1. Audit current Lovable output. Report what exists and what's missing.
  A2. Convert to monorepo: apps/web, apps/worker, packages/types, packages/ui, packages/strategy-engine, packages/risk-engine, packages/ai-routing, packages/replay-engine, packages/broker-tradovate, packages/shared.
  A3. Set up pnpm workspaces + Turborepo.
  A4. Set up TypeScript configs, ESLint, Prettier across the monorepo.
  A5. Set up .env.example with every required variable documented.
  A6. Add Vitest + basic CI (GitHub Actions: typecheck + lint + test).

Phase B: Database + Auth
  B1. Set up Supabase project locally (supabase init, supabase start).
  B2. Create migrations for every table in docs/03-database-schema.md, in the migration order listed.
  B3. Seed the symbols and ai_agents reference tables.
  B4. Write RLS policies for every workspace-scoped table.
  B5. Wire Supabase Auth into the Next.js app (login, signup, logout, session management).
  B6. Add a workspace-setup flow for first-time users.

Phase C: Strategy Engine
  C1. Implement the Strategy interface from docs/02.
  C2. Implement the condition primitives (price, structure, volume, indicator, session, event, confluence).
  C3. Implement the confidence model.
  C4. Implement 3 strategies first: Sweep Long, Sweep Short, ORB Break. Ship the other 3 in a later commit.
  C5. Unit tests for each strategy with fixture bar data.

Phase D: Risk Engine
  D1. Implement the risk rule evaluation engine (docs/03 risk_rules table).
  D2. Implement firm_rules check (docs/05) with safety margin.
  D3. Implement kill switch flow (state change, order cancellation, worker pause).
  D4. Unit tests for every rule type.

Phase E: Worker + TradingView Webhook
  E1. Set up Fastify app in apps/worker with health check.
  E2. Webhook endpoint with secret verification, schema validation, deduplication.
  E3. Event bus (BullMQ) for async processing.
  E4. Strategy engine integration — on webhook, create setup_candidates.
  E5. Risk engine gate before any trade_signal is promoted to an order.
  E6. Local dev setup with ngrok instructions.

Phase F: Tradovate Paper Integration
  F1. Tradovate REST + WebSocket client in packages/broker-tradovate.
  F2. Auth flow (OAuth2 or API token per their docs).
  F3. Market data subscription for active symbols.
  F4. Order placement (market, limit, stop, OCO for bracket).
  F5. Order status + fill reconciliation back to trades and orders tables.
  F6. Position tracking.
  F7. Paper mode sandbox integration first, live wired but flagged off.

Phase G: AI Routing + Agents
  G1. packages/ai-routing with provider abstraction (OpenAI + Anthropic).
  G2. Per-agent config (provider, model, prompt template, caching strategy).
  G3. Cost attribution on every call (ai_messages insert).
  G4. Implement the 8 agents as event handlers:
       market_watch, setup_scout, news_desk, risk_manager,
       execution_desk, journal_desk, coach, strategy_analyst
  G5. Each agent emits agent_status_events on state change.
  G6. Hook up to Supabase Realtime so the Kanban board updates live.

Phase H: Replay + Grading
  H1. replay_events denormalized stream builder (runs after session close).
  H2. Session grading algorithm (docs/00 "V1 success criteria" — what the scores mean).
  H3. Replay scrubbing UI (wire to existing Lovable-generated UI).
  H4. Coach agent generates lessons from replay data.

Phase I: Polish + Guardrails
  I1. Compliance acknowledgment flow for any broker_profile with prop_firm set.
  I2. Cost Monitor tab wired to cost_logs.
  I3. Agent Audit tab showing agent_status_events + ai_messages.
  I4. Settings > TradingView page with copy-able webhook URL + alert templates.
  I5. Kill switch wired end-to-end (UI → API → worker → cancel all orders → emit risk_event).
  I6. Error boundaries + empty states everywhere.
  I7. Sentry wired.

Phase J: End-to-end paper trade test
  J1. Write a manual smoke test script that:
      - Creates a workspace
      - Connects Tradovate paper
      - Sets TradingView webhook secret
      - Fires a fake webhook for NQ Sweep Long
      - Verifies setup_candidate appears in UI
      - Verifies risk check passes
      - Verifies trade placed on Tradovate paper
      - Verifies fill comes back
      - Verifies journal entry generated
      - Verifies replay grading runs after session close
  J2. Document any manual steps required.

WORKFLOW RULES

- Commit early, commit often. One feature per commit minimum.
- Every phase ends with `pnpm typecheck && pnpm lint && pnpm test` green.
- Write tests for the strategy engine, risk engine, and replay grading. Other tests are nice-to-have.
- If you hit an ambiguous design decision, stop and ask me. Don't silently pick.
- Before starting Phase F (Tradovate), ask me to confirm Tradovate paper credentials are ready.
- Before starting Phase G (AI), ask me which OpenAI + Anthropic API keys to use and confirm model routing preferences.
- Never touch live trading code or credentials in this build.

START BY:

1. Reading all the docs listed.
2. Reporting back with:
   (a) what you found in the Lovable output,
   (b) your proposed monorepo migration plan,
   (c) any questions or flags before you begin.

Then wait for my go-ahead before starting Phase A.
```

## Notes for working with the agent

- Let it work in small commits. Review diffs.
- If it goes off-script, stop it and re-anchor to this doc.
- Don't let it skip tests for the strategy engine or risk engine. Those are the two things that MUST be correct.
- When it's ready for Tradovate paper credentials, register a Tradovate paper account first and have the credentials ready.
- The agent will likely ask about prompt caching strategy for the AI agents — the answer is: cache the strategy rules, risk rules, and agent system prompts (all relatively static); don't cache user messages or live market state.

## If using Codex specifically

Codex's CLI wraps API calls differently than Claude Code. Pass the prompt the same way. Codex might be more aggressive about running commands — review its plan before letting it execute Phase A migrations.

## If using Claude Code via subscription

Fine for the build. For the production runtime, the worker uses API keys (see docs/06). Don't let Claude Code plug its subscription into the worker — the worker needs API billing for predictable always-on access.

## Iterating after Phase A

After Phase A, create a new issue for each subsequent phase and have the agent work phase-by-phase. Don't let it try to do Phases B–J in one go — too much context, too many decisions.
