# Multi-Strategy Framework

The core bet is that the strategy engine is **pluggable**. A new strategy should require only: a signal spec, a condition checker, a risk profile, and an entry/exit definition. The rest of the cockpit (dashboard, replay, grading, AI narration) should work unchanged.

## Strategy interface

Every strategy implements the same contract:

```ts
interface Strategy {
  id: string;                    // "sweep-long-nq-1m"
  name: string;                  // "Sweep Long"
  description: string;
  symbols: Symbol[];             // ["NQ", "ES"]
  timeframes: Timeframe[];       // ["1m", "5m"]
  sessions: SessionWindow[];     // ["NY_OPEN_FIRST_90"]
  conditions: Condition[];       // checklist the engine evaluates
  entry: EntryRule;              // how to enter when conditions met
  exit: ExitRule;                // stop, target, trailing, time-based
  risk: RiskProfile;             // per-trade risk, max size
  confidence: ConfidenceModel;   // how to score 0-100
  cooldowns: CooldownRule[];
  metadata: { tags, version, author };
}
```

## V1 strategies to ship

### 1. Sweep Long / Sweep Short
**The FSB classic.** Price sweeps a prior swing low/high, then reclaims. Enter on reclaim candle close.

Conditions:
- [x] Prior swing level swept (liquidity taken)
- [x] Reclaim candle closes back inside range
- [x] Volume spike on reclaim > 1.5x 20-bar avg
- [x] No opposing high-impact news in 15-min window

Entry: market order on reclaim candle close
Stop: below/above the swept low/high + 2 ticks
Target: 10, 15, or 20 points (configurable) OR prior session VWAP

### 2. ORB (Opening Range Break)
**Mechanical classic.** First 5-min or 15-min range after NY open. Trade the break on retest.

Conditions:
- [x] Opening range established (first 5 or 15 min)
- [x] Price breaks out of range
- [x] Price retests the broken level
- [x] Volume confirmation on retest

Entry: limit at retest level
Stop: opposite side of opening range
Target: 1x range, 2x range, or VWAP trail

### 3. VWAP Reclaim
Price loses VWAP, comes back, reclaims with volume. Common NY open setup.

### 4. Hourly Zone Trend
**FSB hybrid.** On the 1-hour chart, identify demand/supply zones. When price hits zone with confluence, hold for 50–100 points instead of scalping.

Conditions:
- [x] Price in hourly demand/supply zone
- [x] Lower timeframe entry trigger (sweep, reclaim, or break)
- [x] Zone has been respected at least once
- [x] Higher-timeframe trend aligned

Entry: on lower-TF trigger
Stop: below zone
Target: next major zone OR trailing 1-hour lows/highs

### 5. Failed Breakdown / Failed Breakout
Price breaks a key level, immediately reverses.

### 6. News Fade / News Momentum
Designed to trade AROUND scheduled economic events (CPI, FOMC, NFP). Not used during (that's the Risk Manager's job — it blocks entries inside event windows).

## Condition types

Conditions are composable. The engine evaluates them on every tick/bar update for active strategies. Supported condition primitives:

- **Price**: `above(level)`, `below(level)`, `crossed_up(level)`, `crossed_down(level)`
- **Structure**: `swept(swing_point)`, `reclaimed(level)`, `broke(level, direction)`
- **Volume**: `spike(multiple)`, `above_average(lookback, multiplier)`
- **Indicator**: `rsi_below(n)`, `vwap_above/below`, `atr_above(n)`
- **Session**: `in_session(session_id)`, `time_since_open(gt_minutes)`
- **Event**: `no_news_in(minutes)`, `event_in(minutes)`
- **Confluence**: `any(conditions)`, `all(conditions)`, `count_at_least(conditions, n)`
- **Custom**: user-defined via Strategy Lab UI

## Confidence model

Every candidate setup emits a confidence score 0–100. Built from:

1. **Condition coverage** (weight: 40%) — how many conditions met
2. **Signal strength** (weight: 25%) — volume spike magnitude, sweep depth, breakout cleanliness
3. **Session context** (weight: 15%) — is this setup historically strong in current session?
4. **Risk alignment** (weight: 10%) — R:R >= 2 on target
5. **News-free window** (weight: 10%) — boosted if no event in next 30 min

Formula:
```
confidence = 0.40 * condition_score
           + 0.25 * signal_strength_score
           + 0.15 * session_historical_score
           + 0.10 * risk_score
           + 0.10 * news_safety_score
```

Threshold for action:
- Manual mode: show any candidate with confidence >= 50
- Assist mode: recommend at >= 65
- Auto Paper: execute at >= 75 (user-configurable in Strategy Lab)

## Risk profile per strategy

Each strategy defines its own risk profile:

```ts
{
  per_trade_risk_percent: 0.5,    // % of account
  max_concurrent_positions: 1,
  max_trades_per_session: 8,
  cooldown_after_loss_min: 15,
  cooldown_after_win_min: 3,
  session_max_loss_multiplier: 2,  // stop trading after 2x per-trade loss in session
  allowed_sessions: ["NY_OPEN"],
  blocked_event_impact: ["HIGH", "CRITICAL"],
  blocked_event_window_min: 15,
}
```

These get overridden by the **global risk rules** (Risk Command Center) — whichever is stricter wins.

## How the engine runs

```
On every market event (tick, bar close, news, alert):
  1. For each active strategy:
       a. Update its conditions against current market state
       b. Compute confidence
       c. If confidence crosses threshold AND risk is green:
            emit SetupCandidate event
  2. Emit events to Setup Board (UI) and Setup Scout agent (AI)
  3. If in Auto Paper mode and confidence >= auto_threshold:
       - Pass to Risk Manager for final check
       - If green, pass to Execution Desk
       - Execution Desk places paper order via Tradovate paper API
       - Journal Desk logs the decision chain
  4. AI agents (Setup Scout, News Desk, Coach) are woken
     only on meaningful events, not on every tick
```

## Strategy versioning

Every strategy is versioned. When you edit params in Strategy Lab, a new version is created. Replay can reference which version ran at any given time. This matters because when you change thresholds and blow up in paper, you want to know *which version* did what.

## Backtesting (V2)

Out of scope for V1. Add later via historical bar replay on top of the same strategy engine.

## Sharing strategies (V3)

Out of scope. Strategies are local to the user.

## The "all relevant strategies" principle

The framework is designed so that:

- Adding a new strategy is a one-file change (plus tests)
- Strategies can be enabled/disabled independently per symbol
- Multiple strategies can be active simultaneously on different symbols
- A single symbol can have multiple strategies running (e.g., Sweep Long + ORB on NQ)
- Conflict resolution: if two strategies signal opposite directions, higher-confidence wins OR user is asked in Assist mode

This is what unlocks the "AI Trading Office" feel — the Setup Scout agent can simultaneously report "sweep long forming on NQ" and "ORB break watching on ES" because they're just different strategies running in parallel.
