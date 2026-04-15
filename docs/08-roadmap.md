# Phased Roadmap

## Week-by-week plan (target: 2 weeks to V1 paper-trading loop)

### Week 0 — Planning (today)
- [x] All planning docs written
- [ ] Register for TradingView Premium
- [ ] Register for Tradovate paper demo account
- [ ] Create OpenAI API account, add $20 credit
- [ ] Create Anthropic API account, add $20 credit
- [ ] Create Supabase account, new project
- [ ] Create Fly.io account
- [ ] Create Vercel account (linked to GitHub)
- [ ] Create Upstash account (free tier)

### Week 1 — UI + Foundation

**Day 1 — Lovable UI generation**
- [ ] Paste `docs/01-lovable-prompt.md` into Lovable
- [ ] Iterate on Trading Desk page until 9/10+
- [ ] Polish remaining pages
- [ ] Sync to GitHub, clone into this folder

**Day 2 — Claude Code handoff, Phase A + B**
- [ ] Paste `docs/07-repo-handoff-prompt.md`
- [ ] Review the plan, approve Phase A
- [ ] Monorepo migration (Phase A)
- [ ] Supabase setup + migrations (Phase B)

**Day 3 — Strategy + Risk engines**
- [ ] Strategy interface + condition primitives (Phase C)
- [ ] First 3 strategies: Sweep Long, Sweep Short, ORB Break
- [ ] Risk engine + unit tests (Phase D)

**Day 4 — Worker + Webhook**
- [ ] Fastify worker scaffolded (Phase E)
- [ ] TradingView webhook with secret + dedup
- [ ] Setup candidate flow working end-to-end with fake webhook payloads

**Day 5 — Frontend wire-up**
- [ ] Supabase Realtime subscriptions for Kanban + Setup Board + Trade Log
- [ ] AI Assistant panel wired to a simple echo backend first
- [ ] Kill switch wired

### Week 2 — Tradovate + AI + Replay

**Day 6–7 — Tradovate paper integration (Phase F)**
- [ ] Tradovate API client
- [ ] Market data subscription
- [ ] Paper order placement
- [ ] Fill reconciliation
- [ ] First paper order placed end-to-end from webhook

**Day 8 — AI agents (Phase G)**
- [ ] ai-routing package
- [ ] 8 agents wired as event handlers
- [ ] Cost logging
- [ ] Kanban updates from agent_status_events

**Day 9 — Replay + grading (Phase H)**
- [ ] Replay events stream
- [ ] Session grading algorithm
- [ ] Replay UI wired to real session data
- [ ] Coach agent generates end-of-session lessons

**Day 10 — Polish + smoke test (Phases I + J)**
- [ ] Compliance flow
- [ ] Cost Monitor wired
- [ ] Agent Audit wired
- [ ] Full smoke test: fake webhook → paper trade → fill → replay → grade
- [ ] Deploy web to Vercel, worker to Fly.io

## Post-V1 milestones

### Week 3–5 — Real paper trading
- Run daily during NY open
- Tune strategy thresholds based on real paper results
- Add the remaining strategies (VWAP Reclaim, Hourly Zone, Failed Breakdown)
- Tune AI prompts based on actual narration quality
- Fix bugs, improve UX
- Track whether the system is finding setups you'd miss manually

### Week 6–8 — Prop firm prep (V1.5)
- Read each firm's current automation rules
- Add `firm_rules` profiles to the Risk Manager
- Test with Topstep or TPT combine account (cheap, low-risk)
- Consistency rule monitoring
- Daily loss limit safety margin tuning

### Month 3+ — Live prop firm (V2)
**Only if paper performance has been consistently net-green for 30+ days.**
- Compliance acknowledgment flow
- Live mode gate
- Enhanced monitoring
- Daily reports

### Month 4+ — Multi-account copy trading (V2.5)
- Master/follower account relationships
- Per-account sizing
- Fan-out execution
- Account fleet dashboard
- Eval rotation automation

### Month 6+ — V3 features
- Voice mode desk assistant
- Cowork Observe mode for screen-aware supervision
- Mobile companion app
- Weekly AI coaching reports
- Strategy marketplace (share with trusted friends)
- Backtesting on historical bars

## What's intentionally NOT on this roadmap

- Stocks, forex spot, crypto spot
- Options
- Multi-tenant SaaS (it's single-user by design for a long time)
- Portfolio optimization
- Social/community features
- Turning this into a product to sell — focus on making it great for you first

## Decision gates

Before moving between major phases, confirm:

### Gate 1: UI → Backend (end of Week 1 Day 1)
- [ ] Trading Desk is 9/10+ quality
- [ ] All pages exist at reasonable fidelity
- [ ] Mode toggle and kill switch are obvious and correctly placed

### Gate 2: Paper infra → Tradovate (end of Week 1)
- [ ] Strategy engine has >80% test coverage
- [ ] Risk engine has >90% test coverage
- [ ] Webhook can receive and route a test payload
- [ ] UI updates in realtime when DB changes

### Gate 3: Paper → Live prop (post-V1)
- [ ] 30+ days of paper trading data
- [ ] Net-green months >= 2 out of 3
- [ ] Zero risk rule violations in last 14 days
- [ ] Strategy win rate + R-multiple statistically meaningful
- [ ] You can confidently explain every trade the system took

### Gate 4: Single account → Fleet (V2.5)
- [ ] 30+ days of live prop firm performance
- [ ] Positive net payout covering costs
- [ ] Compliance with all firm rules verified
- [ ] Copy trading risk reviewed

## How to know the project is working

**Week 1 checkpoint:** You can see the cockpit, fake-fire a webhook, and watch a setup candidate appear on the Setup Board in realtime.

**Week 2 checkpoint:** A real TradingView alert on NQ fires, the system places a paper trade on Tradovate, fills come back, and the end-of-session replay shows a grade.

**Month 1 checkpoint:** You've traded 15+ paper sessions, the replay + coach has taught you something you didn't already know about your trading, and you're spending less than $100/mo on infra + AI.

**Month 3 checkpoint:** The system is preventing tilt resets. You're net-green on paper. You've read the prop firm docs and you're ready for a combine.

**Month 6 checkpoint:** First prop firm payout. The system is an asset, not a project.

## The hardest part

Not building it. Running it long enough to trust it. Paper trading for 30+ days feels slow and pointless — until the day you'd have blown $20K on one tilted morning (FSB's April) and the system's daily loss limit saved you instead.

Build for the day things go wrong. That's the day the platform pays for itself.
