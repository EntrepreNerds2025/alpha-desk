import { z } from "zod";

const directionSchema = z.enum(["long", "short"]);

const basePayloadSchema = z
  .object({
    secret: z.string().min(1).optional(),
    strategy_id: z.string().min(1).optional(),
    strategy_version: z.string().min(1).optional(),
    symbol: z.string().min(1).optional(),
    tf: z.string().min(1).optional(),
    direction: directionSchema.optional(),
    price: z.number().optional(),
    time: z.string().min(1),
    note: z.string().optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .passthrough();

const setupFormingSchema = basePayloadSchema.extend({
  event: z.literal("setup_forming"),
  strategy_id: z.string().min(1),
  symbol: z.string().min(1),
  tf: z.string().min(1),
  direction: directionSchema,
  bar: z
    .object({
      open: z.number(),
      high: z.number(),
      low: z.number(),
      close: z.number(),
      volume: z.number(),
    })
    .optional(),
  conditions_fired: z.array(z.string()).optional(),
  confidence_hint: z.number().min(0).max(100).optional(),
  indicator_values: z.record(z.string(), z.number()).optional(),
});

const setupReadySchema = basePayloadSchema.extend({
  event: z.literal("setup_ready"),
  strategy_id: z.string().min(1),
  symbol: z.string().min(1),
  tf: z.string().min(1),
  direction: directionSchema,
});

const setupInvalidatedSchema = basePayloadSchema.extend({
  event: z.literal("setup_invalidated"),
  strategy_id: z.string().min(1),
  symbol: z.string().min(1),
  tf: z.string().min(1),
});

const tradeExitSchema = basePayloadSchema.extend({
  event: z.literal("trade_exit"),
  strategy_id: z.string().min(1),
  symbol: z.string().min(1),
  tf: z.string().min(1),
  exit_reason: z.string().optional(),
  exit_price: z.number().optional(),
});

const killSwitchSchema = z
  .object({
    event: z.literal("kill_switch"),
    secret: z.string().min(1).optional(),
    reason: z.string().min(1).optional(),
    time: z.string().min(1),
  })
  .passthrough();

export const tradingViewWebhookPayloadSchema = z.discriminatedUnion("event", [
  setupFormingSchema,
  setupReadySchema,
  setupInvalidatedSchema,
  tradeExitSchema,
  killSwitchSchema,
]);

export type TradingViewWebhookPayload = z.infer<typeof tradingViewWebhookPayloadSchema>;

export type TradingViewEventRoute =
  | "setup_candidates.upsert_forming"
  | "trade_signals.create_pending"
  | "setup_candidates.mark_invalidated"
  | "trades.close_and_journal"
  | "risk.kill_switch_activate";

export interface TradingViewRouteResult {
  event: TradingViewWebhookPayload["event"];
  routedTo: TradingViewEventRoute;
  summary: string;
}

export function parseTradingViewWebhookPayload(input: unknown) {
  return tradingViewWebhookPayloadSchema.safeParse(input);
}

const dedupeWindowMs = 5000;
const dedupeCache = new Map<string, number>();

export function isDuplicateTradingViewEvent(key: string, now = Date.now()) {
  for (const [cacheKey, ts] of dedupeCache) {
    if (now - ts > dedupeWindowMs) {
      dedupeCache.delete(cacheKey);
    }
  }

  const previousSeen = dedupeCache.get(key);
  if (previousSeen && now - previousSeen <= dedupeWindowMs) {
    return true;
  }

  dedupeCache.set(key, now);
  return false;
}

export function buildTradingViewDedupKey(payload: TradingViewWebhookPayload) {
  if (payload.event === "kill_switch") {
    return `kill_switch:${payload.time}:${payload.reason ?? "unspecified"}`;
  }

  return [payload.event, payload.strategy_id, payload.symbol, payload.tf, payload.time].join(":");
}

export function routeTradingViewEvent(payload: TradingViewWebhookPayload): TradingViewRouteResult {
  switch (payload.event) {
    case "setup_forming":
      return {
        event: payload.event,
        routedTo: "setup_candidates.upsert_forming",
        summary: "Upsert setup candidate and emit realtime setup board update.",
      };
    case "setup_ready":
      return {
        event: payload.event,
        routedTo: "trade_signals.create_pending",
        summary: "Create pending trade signal and enqueue risk evaluation.",
      };
    case "setup_invalidated":
      return {
        event: payload.event,
        routedTo: "setup_candidates.mark_invalidated",
        summary: "Mark active setup candidate invalidated and notify desk.",
      };
    case "trade_exit":
      return {
        event: payload.event,
        routedTo: "trades.close_and_journal",
        summary: "Close trade record and trigger Journal Desk follow-up.",
      };
    case "kill_switch":
      return {
        event: payload.event,
        routedTo: "risk.kill_switch_activate",
        summary: "Activate kill switch and block all new execution intents.",
      };
    default: {
      const unreachable: never = payload;
      return unreachable;
    }
  }
}
