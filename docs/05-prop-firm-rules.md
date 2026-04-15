# Prop Firm Automation Rules — Reference

**Read this before connecting any funded prop firm account.** Rules change often and violations can mean instant account termination or payout denial. This is your responsibility to verify with the firm before going live.

This document reflects general industry understanding as of planning time. **Always check the firm's current ToS and Rules page directly before enabling Auto Live.**

## The three categories of automation

1. **Fully autonomous bots (unsupervised).** Usually prohibited. The firm defines "unsupervised" as: runs when you're not at the computer, no ability to intervene, no human approval per trade.
2. **Semi-automated (TradingView alert → broker, supervised).** Usually allowed. Firm rules vary on what counts as "supervised."
3. **Copy trading across your own accounts.** Usually allowed for evals, stricter for funded. FSB's rotation model falls here.

## Firm-by-firm summary (verify before using)

### Topstep

- Semi-auto: **Allowed.** Specifically permits TradingView webhook → Tradovate.
- Full autonomous: **Prohibited** without explicit approval.
- Copy trading between your own Topstep accounts: **Allowed** with volume restrictions.
- HFT / scalping under 1 min: **Allowed** but subject to their consistency rules.
- Key rule that kills people: **Daily Loss Limit is hard.** Hit it, account dies.
- Payout rule: consistency (no single day >30% of total profit) — autotrading that spikes on one day can trigger this.
- ToS page: topstep.com

### Take Profit Trader (TPT) — FSB's favorite

- Semi-auto: **Allowed.**
- Full autonomous: **Allowed with registration.** Must disclose algo use. Check current rules.
- Copy trading: **Allowed** including mass eval copy trading (this is why FSB runs 100+ accounts).
- Max daily payout on PRO: $10K (FSB's video confirms).
- Pro Plus upgrade: live brokerage, no daily payout cap, slightly different rules.
- ToS: takeprofittrader.com

### Apex Trader Funding

- Semi-auto: **Allowed.**
- Recent rule tightening (2025): watch for "bot-like" patterns. Flagged accounts get reviewed.
- Copy trading: **Allowed for evals**, restrictions on funded. Max 20 accounts copied per master.
- Key rule: Consistency rule — no day can be >30% of total profit at payout time.
- Discount pattern: Apex runs 80-90% off sales roughly monthly. Stack eval purchases during sales (FSB's play).
- ToS: apextraderfunding.com

### MyFundedFutures (MFF)

- Semi-auto: **Allowed.**
- Full autonomous: **Allowed** per current rules.
- Copy trading: **Allowed.**
- Trailing drawdown model — different risk profile than fixed drawdown firms.
- ToS: myfundedfutures.com

### Leeloo Trading / others

Varies. Check individually.

## What will get your account killed

1. **Hitting Daily Loss Limit.** Hard stop on every firm. Your Risk Manager MUST enforce this with a margin buffer (stop 10-15% before the firm's limit).
2. **Trailing drawdown violations.** Applies to MFF, some Apex plans. Your equity peak is tracked — if you fall X below it, account dies.
3. **Consistency rule violations at payout.** Earn too much on one day, payout denied.
4. **News trading within blackout windows.** Some firms prohibit holding through FOMC, NFP, CPI. Check.
5. **Scalping rule violations.** Some firms require minimum hold times (e.g., 60 seconds).
6. **Account mirroring / "HFT like behavior".** If orders are placed in patterns that look like you're not human, reviewers flag.
7. **Using the same strategy across prohibited accounts.** Some firms prohibit running the same exact algo across multiple evals to inflate pass rates.

## How the Risk Manager enforces this

Per prop firm, store a `firm_rules` profile:

```ts
{
  firm: "topstep",
  daily_loss_limit: 1000,
  daily_loss_safety_margin_pct: 15,  // stop at $850
  trailing_drawdown_enabled: false,
  consistency_rule_max_day_pct: 30,
  min_trade_hold_seconds: 0,
  news_blackout_minutes_before: 5,
  news_blackout_minutes_after: 5,
  blackout_events: ["HIGH", "CRITICAL"],
  max_trades_per_day: null,
  max_positions_concurrent: 1,
  requires_algo_disclosure: true,
  disclosed: false  // user must confirm they disclosed
}
```

On every new trade signal, run `firm_rules.check(trade_signal, session_state)`. If any rule would be violated, **block the trade** and emit a `risk_event`.

## The "disclosed" checkbox

Before Auto Live can be enabled on a funded account, the user must check a mandatory acknowledgment:

> I confirm I have read this firm's current automation rules, I have disclosed my use of this platform if required, and I understand that violations may result in account termination. I accept full responsibility for all trades placed by this system.

Store this in `broker_profiles.compliance_ack_at`. Block Auto Live mode if null or > 30 days old.

## Copy trading across own accounts (V2 feature)

FSB's model: 20-100 eval accounts, all copy the same master. Once funded, rotate one-at-a-time.

Architecture for V2:

- `master_account_id` on each `broker_profile`
- When master fires a signal, fan out to N follower accounts based on their config (some take 1 contract, some 2, etc.)
- Follower accounts can be auto-disabled when they approach their loss limit
- UI: separate "Account Fleet" view showing status of every account

Rules to enforce:

- Copy only to same firm (most firms prohibit cross-firm copy)
- Respect per-firm maximums on copied accounts
- Detect duplicate fills (network delays causing double-orders) and reconcile

## Not legal advice

This document is operational guidance for the platform. It's not legal or compliance advice. The user is fully responsible for reading each firm's current rules, disclosing automation where required, and accepting consequences of violations.

**Final word:** prop firms are in the business of funding disciplined traders. Even a perfect algo can be killed by a rule violation. The Risk Manager is the most important agent in this product.
