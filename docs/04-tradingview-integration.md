# TradingView Integration

TradingView is the signal source and the chart. Two integration points: the embedded chart (display) and alerts (webhook signals).

## Required TradingView plan

**TradingView Premium ($60/mo) or higher.** Reasons:
- Server-side alerts (run 24/7 without browser open) — Premium required
- Webhook URL in alerts — Premium required
- More alerts per account (400 on Premium)
- Multiple charts per layout

Essential/Plus tiers will NOT work for production. Don't cheap out here.

## Embedded chart

Two options, pick based on polish needed:

### Option A — Advanced Chart Widget (simplest)

Free to embed, works out of the box. Loses some features (no account integration, no order tickets from chart).

```html
<div id="tradingview_chart"></div>
<script src="https://s3.tradingview.com/tv.js"></script>
<script>
  new TradingView.widget({
    container_id: "tradingview_chart",
    symbol: "CME_MINI:NQ1!",
    interval: "1",
    theme: "dark",
    style: "1",
    locale: "en",
    toolbar_bg: "#121418",
    enable_publishing: false,
    hide_top_toolbar: false,
    save_image: false,
    studies: ["VWAP@tv-basicstudies", "Volume@tv-basicstudies"],
    width: "100%",
    height: "100%",
  });
</script>
```

For V1, use this. Add overlay chips via absolute-positioned divs on top of the iframe (for setup status, confidence, etc).

### Option B — Trading Platform (premium path, V2+)

Full chart + order panel + position tracking inside the chart. Requires TradingView Broker API implementation on the backend. Heavy lift — defer to V2.

## Alert webhook setup

### Webhook endpoint on our backend

```
POST https://api.ai-trading-office.app/webhooks/tradingview
Headers:
  X-TV-Secret: <shared secret set in env>
Body: JSON (see templates below)
```

### TradingView alert configuration

1. In TradingView, open chart for a symbol
2. Click alert icon (clock)
3. Set condition (e.g., "NQ crosses VWAP" or custom Pine script alert condition)
4. Under "Notifications" tab:
   - Enable "Webhook URL"
   - Paste: `https://api.ai-trading-office.app/webhooks/tradingview`
   - Alert name: e.g., "NQ-SweepLong-1m"
5. Under "Message" field, paste the JSON template below

### Rate limit to design around

TradingView stops alerts that fire >15 times in 3 minutes. Mitigations:

1. Alert on bar close, not tick-by-tick
2. Use `once_per_bar_close` as trigger frequency, not `each_time`
3. For fast strategies, batch related conditions into a single alert with payload that describes *which* condition fired
4. Have a fallback: if webhook was expected but didn't arrive within bar + 5 seconds, have the worker cross-check against broker market data stream

## Alert payload templates

Include enough structured data that the backend can route without guessing.

### Generic template (use this as default)

```json
{
  "secret": "{{shared_secret_env_var}}",
  "strategy_id": "sweep-long-nq-1m",
  "strategy_version": "v3",
  "symbol": "{{ticker}}",
  "tf": "{{interval}}",
  "event": "setup_forming",
  "direction": "long",
  "price": {{close}},
  "time": "{{time}}",
  "bar": {
    "open": {{open}},
    "high": {{high}},
    "low": {{low}},
    "close": {{close}},
    "volume": {{volume}}
  },
  "conditions_fired": ["sweep_low", "volume_spike"],
  "confidence_hint": 65,
  "indicator_values": {
    "vwap": {{plot_0}},
    "atr14": {{plot_1}}
  },
  "note": "{{alert_message}}"
}
```

### Sweep Long alert

```json
{
  "secret": "SECRET_HERE",
  "strategy_id": "sweep-long",
  "strategy_version": "v1",
  "symbol": "{{ticker}}",
  "tf": "{{interval}}",
  "event": "setup_forming",
  "direction": "long",
  "price": {{close}},
  "time": "{{time}}",
  "swept_level": {{plot_0}},
  "reclaim_confirmed": true,
  "volume_ratio": {{plot_1}}
}
```

### ORB Break alert

```json
{
  "secret": "SECRET_HERE",
  "strategy_id": "orb-break",
  "strategy_version": "v1",
  "symbol": "{{ticker}}",
  "tf": "{{interval}}",
  "event": "setup_ready",
  "direction": "{{plot_2}}",
  "price": {{close}},
  "time": "{{time}}",
  "or_high": {{plot_0}},
  "or_low": {{plot_1}},
  "retest_confirmed": true
}
```

### Kill switch / flatten alert

User-triggered kill switch from TradingView can also hit webhook:

```json
{
  "secret": "SECRET_HERE",
  "event": "kill_switch",
  "reason": "manual_user_alert",
  "time": "{{time}}"
}
```

## Backend webhook handler flow

```
1. Verify X-TV-Secret header matches env var (reject otherwise, return 401)
2. Validate JSON schema by `event` type
3. Dedupe: check if same strategy_id + symbol + tf + time seen in last 5s (idempotency)
4. Route by event:
   - 'setup_forming' → create/update setup_candidate, emit realtime to UI
   - 'setup_ready' → create trade_signal (pending), pass to Risk Manager
   - 'setup_invalidated' → mark setup_candidate invalidated
   - 'trade_exit' → close trade, trigger Journal Desk
   - 'kill_switch' → activate kill switch
5. Return 200 with minimal body (TradingView ignores response but fast is better)
6. Emit internal event bus message; actual order placement happens async
```

## Using Pine Script strategies

If using TradingView strategies (Pine Script `strategy.*` calls), you can fire webhooks on entry/exit orders directly:

```pine
strategy("Sweep Long NQ", overlay=true)
// ... conditions ...
if (longCondition)
    strategy.entry("Long", strategy.long, alert_message='{"secret":"X","strategy_id":"sweep-long","event":"setup_ready","direction":"long","symbol":"{{ticker}}","price":{{close}}}')
```

Use `{{strategy.order.alert_message}}` in the alert's Message field to pass the per-order custom payload.

## Backup data source

Webhooks are the signal source but NOT the only truth. The worker also maintains a WebSocket connection to Tradovate (paper or live) for:

- Real-time market data (bid, ask, last, volume)
- Order fills and status updates
- Position state
- Account balance / P&L

If a TradingView webhook fires but broker data disagrees (e.g., price already 3 points past entry), the worker should reject the signal and log a `signal_rejected_stale_price` event.

## Testing

- Use TradingView's "Test Alert" to fire webhooks on demand
- Use ngrok or Cloudflare Tunnel in dev: `ngrok http 3001` → put the ngrok URL in TradingView alert
- Log every webhook receipt to a debug table for replay

## What goes in the Settings > TradingView page

- Webhook URL (read-only, copy-button)
- Shared secret (rotate button)
- Connection status (last webhook received X seconds ago)
- Alert templates (copy buttons for each strategy)
- Rate limit monitor (webhooks received in last 3 minutes, with limit warning)
