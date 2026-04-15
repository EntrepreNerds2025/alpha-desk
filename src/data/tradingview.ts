export const tradingViewWebhookPath = "/api/webhooks/tradingview";

export interface TradingViewTemplate {
  id: string;
  label: string;
  payload: string;
}

const genericTemplate = {
  secret: "{{shared_secret_env_var}}",
  strategy_id: "sweep-long-nq-1m",
  strategy_version: "v3",
  symbol: "{{ticker}}",
  tf: "{{interval}}",
  event: "setup_forming",
  direction: "long",
  price: "{{close}}",
  time: "{{time}}",
  bar: {
    open: "{{open}}",
    high: "{{high}}",
    low: "{{low}}",
    close: "{{close}}",
    volume: "{{volume}}",
  },
  conditions_fired: ["sweep_low", "volume_spike"],
  confidence_hint: 65,
  indicator_values: {
    vwap: "{{plot_0}}",
    atr14: "{{plot_1}}",
  },
  note: "{{alert_message}}",
};

const sweepLongTemplate = {
  secret: "SECRET_HERE",
  strategy_id: "sweep-long",
  strategy_version: "v1",
  symbol: "{{ticker}}",
  tf: "{{interval}}",
  event: "setup_forming",
  direction: "long",
  price: "{{close}}",
  time: "{{time}}",
  swept_level: "{{plot_0}}",
  reclaim_confirmed: true,
  volume_ratio: "{{plot_1}}",
};

const orbBreakTemplate = {
  secret: "SECRET_HERE",
  strategy_id: "orb-break",
  strategy_version: "v1",
  symbol: "{{ticker}}",
  tf: "{{interval}}",
  event: "setup_ready",
  direction: "{{plot_2}}",
  price: "{{close}}",
  time: "{{time}}",
  or_high: "{{plot_0}}",
  or_low: "{{plot_1}}",
  retest_confirmed: true,
};

const killSwitchTemplate = {
  secret: "SECRET_HERE",
  event: "kill_switch",
  reason: "manual_user_alert",
  time: "{{time}}",
};

export const tradingViewAlertTemplates: TradingViewTemplate[] = [
  {
    id: "generic",
    label: "Generic Template",
    payload: JSON.stringify(genericTemplate, null, 2),
  },
  {
    id: "sweep-long",
    label: "Sweep Long",
    payload: JSON.stringify(sweepLongTemplate, null, 2),
  },
  {
    id: "orb-break",
    label: "ORB Break",
    payload: JSON.stringify(orbBreakTemplate, null, 2),
  },
  {
    id: "kill-switch",
    label: "Kill Switch",
    payload: JSON.stringify(killSwitchTemplate, null, 2),
  },
];

export function getTradingViewWebhookUrl() {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${tradingViewWebhookPath}`;
  }

  const envBaseUrl = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
    ?.VITE_PUBLIC_API_BASE_URL;
  const baseUrl = envBaseUrl ?? "https://api.ai-trading-office.app";

  return `${baseUrl}${tradingViewWebhookPath}`;
}
