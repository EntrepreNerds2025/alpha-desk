import { booleanSignalCondition, minNumericSignalCondition } from "./conditions";
import type { Strategy, StrategyContext, StrategySignals } from "./types";

const author = "AI Trading Office";
const version = "0.1.0";

const defaultRisk = {
  killSwitchActive: false,
  dailyLossLimitHit: false,
  trailingDrawdownBreach: false,
  consistencyLimitBreach: false,
};

const defaultSignals: StrategySignals = {
  priorSwingSwept: false,
  reclaimCloseBackInsideRange: false,
  volumeMultiple: 1,
  opposingHighImpactNewsWithin15m: false,
  openingRangeEstablished: false,
  openingRangeBreakout: false,
  retestOfBrokenLevel: false,
  volumeOnRetestMultiple: 1,
  vwapLostAndReclaimed: false,
  hourlyZoneTouched: false,
  trendAligned: false,
  failedBreakdownConfirmed: false,
};

function contextWithSignals(
  partialSignals: Partial<StrategySignals>,
  overrides?: Partial<Pick<StrategyContext, "symbol" | "timeframe" | "session">>,
): StrategyContext {
  return {
    symbol: overrides?.symbol ?? "NQ",
    timeframe: overrides?.timeframe ?? "1m",
    session: overrides?.session ?? "NY_OPEN_FIRST_90",
    signals: {
      ...defaultSignals,
      ...partialSignals,
    },
    risk: {
      ...defaultRisk,
    },
    now: new Date().toISOString(),
  };
}

export const strategyCatalog: Strategy[] = [
  {
    id: "sweep-long",
    name: "Sweep Long",
    description:
      "Price sweeps a prior swing low and closes back inside range with volume confirmation.",
    symbols: ["NQ", "ES", "RTY"],
    timeframes: ["1m", "5m"],
    sessions: ["NY_OPEN_FIRST_90", "NY_RTH"],
    conditions: [
      booleanSignalCondition({
        id: "prior-swing-swept",
        label: "Prior swing swept",
        description: "Liquidity sweep occurred before reclaim.",
        signal: "priorSwingSwept",
        expected: true,
      }),
      booleanSignalCondition({
        id: "reclaim-close",
        label: "Reclaim close back inside range",
        description: "Reclaim candle must close back inside prior range.",
        signal: "reclaimCloseBackInsideRange",
        expected: true,
      }),
      minNumericSignalCondition({
        id: "reclaim-volume",
        label: "Reclaim volume multiple",
        description: "Reclaim volume should be at least 1.5x the 20-bar average.",
        signal: "volumeMultiple",
        min: 1.5,
        unit: "x",
      }),
      booleanSignalCondition({
        id: "news-window-clear",
        label: "No opposing high-impact news in 15m",
        description: "Avoid entries around high-impact event risk.",
        signal: "opposingHighImpactNewsWithin15m",
        expected: false,
      }),
    ],
    entry: {
      orderType: "market",
      trigger: "on_reclaim_close",
      side: "long",
      allowScaleIn: false,
    },
    exit: {
      stopType: "structure_plus_ticks",
      stopValue: 2,
      targetType: "fixed_points",
      targetValue: 15,
      trailingEnabled: false,
    },
    risk: {
      maxRiskUsd: 200,
      maxContracts: 2,
      maxTradesPerSession: 6,
      dailyLossBufferPct: 0.15,
    },
    confidence: {
      base: 35,
      max: 96,
      minExecutionScore: 68,
      weightByConditionId: {
        "prior-swing-swept": 3,
        "reclaim-close": 3,
        "reclaim-volume": 2,
        "news-window-clear": 2,
      },
    },
    cooldowns: [
      { reason: "Stopped out", minutes: 5 },
      { reason: "Back-to-back winner lockout", minutes: 2 },
    ],
    metadata: {
      tags: ["liquidity", "reversal", "ny-open"],
      version,
      author,
    },
    stats: { winRate: 68, avgR: 1.8, sharpe: 1.42, maxDD: 820, trades: 124 },
  },
  {
    id: "sweep-short",
    name: "Sweep Short",
    description: "Price sweeps a prior swing high then reclaims back below the level.",
    symbols: ["NQ", "ES", "YM"],
    timeframes: ["1m", "5m"],
    sessions: ["NY_OPEN_FIRST_90", "NY_RTH"],
    conditions: [
      booleanSignalCondition({
        id: "prior-swing-swept",
        label: "Prior swing swept",
        description: "Liquidity sweep occurred before reclaim.",
        signal: "priorSwingSwept",
        expected: true,
      }),
      booleanSignalCondition({
        id: "reclaim-close",
        label: "Reclaim close back inside range",
        description: "Reclaim candle must close back inside prior range.",
        signal: "reclaimCloseBackInsideRange",
        expected: true,
      }),
      minNumericSignalCondition({
        id: "reclaim-volume",
        label: "Reclaim volume multiple",
        description: "Reclaim volume should be at least 1.4x the 20-bar average.",
        signal: "volumeMultiple",
        min: 1.4,
        unit: "x",
      }),
      booleanSignalCondition({
        id: "news-window-clear",
        label: "No opposing high-impact news in 15m",
        description: "Avoid entries around high-impact event risk.",
        signal: "opposingHighImpactNewsWithin15m",
        expected: false,
      }),
    ],
    entry: {
      orderType: "market",
      trigger: "on_reclaim_close",
      side: "short",
      allowScaleIn: false,
    },
    exit: {
      stopType: "structure_plus_ticks",
      stopValue: 2,
      targetType: "fixed_points",
      targetValue: 14,
      trailingEnabled: false,
    },
    risk: {
      maxRiskUsd: 200,
      maxContracts: 2,
      maxTradesPerSession: 6,
      dailyLossBufferPct: 0.15,
    },
    confidence: {
      base: 33,
      max: 94,
      minExecutionScore: 66,
      weightByConditionId: {
        "prior-swing-swept": 3,
        "reclaim-close": 3,
        "reclaim-volume": 2,
        "news-window-clear": 2,
      },
    },
    cooldowns: [{ reason: "Stopped out", minutes: 5 }],
    metadata: {
      tags: ["liquidity", "reversal", "ny-open"],
      version,
      author,
    },
    stats: { winRate: 62, avgR: 1.5, sharpe: 1.15, maxDD: 1100, trades: 87 },
  },
  {
    id: "orb-break",
    name: "ORB Break",
    description: "Opening range breakout followed by retest and confirmation.",
    symbols: ["NQ", "ES", "CL"],
    timeframes: ["5m", "15m"],
    sessions: ["NY_OPEN_FIRST_90"],
    conditions: [
      booleanSignalCondition({
        id: "or-established",
        label: "Opening range established",
        description: "First 5m/15m opening range has formed.",
        signal: "openingRangeEstablished",
        expected: true,
      }),
      booleanSignalCondition({
        id: "or-breakout",
        label: "Breakout from opening range",
        description: "Price breaks beyond opening range boundary.",
        signal: "openingRangeBreakout",
        expected: true,
      }),
      booleanSignalCondition({
        id: "or-retest",
        label: "Retest of broken level",
        description: "Price retests broken range level.",
        signal: "retestOfBrokenLevel",
        expected: true,
      }),
      minNumericSignalCondition({
        id: "or-retest-volume",
        label: "Retest volume confirmation",
        description: "Retest bar should confirm with volume > 1.2x average.",
        signal: "volumeOnRetestMultiple",
        min: 1.2,
        unit: "x",
      }),
    ],
    entry: {
      orderType: "limit",
      trigger: "on_retest",
      side: "long",
      allowScaleIn: true,
    },
    exit: {
      stopType: "range_opposite_side",
      stopValue: 1,
      targetType: "range_multiple",
      targetValue: 2,
      trailingEnabled: true,
    },
    risk: {
      maxRiskUsd: 250,
      maxContracts: 3,
      maxTradesPerSession: 4,
      dailyLossBufferPct: 0.15,
    },
    confidence: {
      base: 30,
      max: 92,
      minExecutionScore: 64,
      weightByConditionId: {
        "or-established": 2,
        "or-breakout": 3,
        "or-retest": 3,
        "or-retest-volume": 2,
      },
    },
    cooldowns: [{ reason: "Failed breakout", minutes: 10 }],
    metadata: {
      tags: ["breakout", "opening-range", "momentum"],
      version,
      author,
    },
    stats: { winRate: 55, avgR: 2.1, sharpe: 0.98, maxDD: 1450, trades: 203 },
  },
  {
    id: "vwap-reclaim",
    name: "VWAP Reclaim",
    description: "Price loses VWAP, then reclaims with renewed buying/selling pressure.",
    symbols: ["NQ", "ES", "GC"],
    timeframes: ["1m", "5m"],
    sessions: ["NY_OPEN_FIRST_90", "NY_RTH"],
    conditions: [
      booleanSignalCondition({
        id: "vwap-reclaim",
        label: "VWAP lost then reclaimed",
        description: "Market retakes VWAP after loss.",
        signal: "vwapLostAndReclaimed",
        expected: true,
      }),
      minNumericSignalCondition({
        id: "vwap-volume",
        label: "Volume multiple on reclaim",
        description: "Reclaim should print with >= 1.3x volume.",
        signal: "volumeMultiple",
        min: 1.3,
        unit: "x",
      }),
      booleanSignalCondition({
        id: "news-window-clear",
        label: "No opposing high-impact news in 15m",
        description: "Avoid entries around high-impact event risk.",
        signal: "opposingHighImpactNewsWithin15m",
        expected: false,
      }),
    ],
    entry: {
      orderType: "market",
      trigger: "on_vwap_reclaim_close",
      side: "long",
      allowScaleIn: false,
    },
    exit: {
      stopType: "ticks",
      stopValue: 10,
      targetType: "vwap_trail",
      targetValue: 1,
      trailingEnabled: true,
    },
    risk: {
      maxRiskUsd: 180,
      maxContracts: 2,
      maxTradesPerSession: 6,
      dailyLossBufferPct: 0.15,
    },
    confidence: {
      base: 36,
      max: 95,
      minExecutionScore: 67,
      weightByConditionId: {
        "vwap-reclaim": 4,
        "vwap-volume": 3,
        "news-window-clear": 2,
      },
    },
    cooldowns: [{ reason: "VWAP chop protection", minutes: 6 }],
    metadata: {
      tags: ["vwap", "mean-reversion", "intraday"],
      version,
      author,
    },
    stats: { winRate: 64, avgR: 1.6, sharpe: 1.28, maxDD: 780, trades: 98 },
  },
  {
    id: "hourly-zone-trend",
    name: "Hourly Zone Trend",
    description: "Trade higher timeframe demand/supply zones with trend confluence.",
    symbols: ["NQ", "ES", "CL", "GC"],
    timeframes: ["15m", "1h"],
    sessions: ["NY_RTH", "FULL_DAY"],
    conditions: [
      booleanSignalCondition({
        id: "hourly-zone-touch",
        label: "Hourly demand/supply zone touched",
        description: "Price interacts with mapped hourly zone.",
        signal: "hourlyZoneTouched",
        expected: true,
      }),
      booleanSignalCondition({
        id: "trend-aligned",
        label: "Trend confluence aligned",
        description: "Lower timeframe aligns with hourly trend bias.",
        signal: "trendAligned",
        expected: true,
      }),
      minNumericSignalCondition({
        id: "zone-volume",
        label: "Reaction volume multiple",
        description: "Zone reaction volume should exceed 1.1x average.",
        signal: "volumeMultiple",
        min: 1.1,
        unit: "x",
      }),
    ],
    entry: {
      orderType: "limit",
      trigger: "on_zone_reaction",
      side: "long",
      allowScaleIn: true,
    },
    exit: {
      stopType: "structure_plus_ticks",
      stopValue: 4,
      targetType: "runner",
      targetValue: 80,
      trailingEnabled: true,
    },
    risk: {
      maxRiskUsd: 300,
      maxContracts: 2,
      maxTradesPerSession: 3,
      dailyLossBufferPct: 0.15,
    },
    confidence: {
      base: 38,
      max: 93,
      minExecutionScore: 65,
      weightByConditionId: {
        "hourly-zone-touch": 3,
        "trend-aligned": 3,
        "zone-volume": 2,
      },
    },
    cooldowns: [{ reason: "Zone invalidation lockout", minutes: 15 }],
    metadata: {
      tags: ["higher-timeframe", "trend", "swing"],
      version,
      author,
    },
    stats: { winRate: 71, avgR: 1.3, sharpe: 1.65, maxDD: 540, trades: 156 },
  },
  {
    id: "failed-breakdown",
    name: "Failed Breakdown",
    description: "Short breakdown fails, price reclaims, and reverses with trapped sellers.",
    symbols: ["NQ", "ES", "RTY"],
    timeframes: ["1m", "5m"],
    sessions: ["NY_OPEN_FIRST_90", "NY_RTH"],
    conditions: [
      booleanSignalCondition({
        id: "failed-breakdown-signal",
        label: "Failed breakdown confirmed",
        description: "Breakdown wick rejected and trapped sellers visible.",
        signal: "failedBreakdownConfirmed",
        expected: true,
      }),
      booleanSignalCondition({
        id: "reclaim-close",
        label: "Reclaim close back inside range",
        description: "Reclaim candle must close back inside prior range.",
        signal: "reclaimCloseBackInsideRange",
        expected: true,
      }),
      minNumericSignalCondition({
        id: "reversal-volume",
        label: "Reversal volume multiple",
        description: "Reversal bar should print with >= 1.2x volume.",
        signal: "volumeMultiple",
        min: 1.2,
        unit: "x",
      }),
      booleanSignalCondition({
        id: "news-window-clear",
        label: "No opposing high-impact news in 15m",
        description: "Avoid entries around high-impact event risk.",
        signal: "opposingHighImpactNewsWithin15m",
        expected: false,
      }),
    ],
    entry: {
      orderType: "market",
      trigger: "on_failed_breakdown_reclaim",
      side: "long",
      allowScaleIn: false,
    },
    exit: {
      stopType: "structure_plus_ticks",
      stopValue: 3,
      targetType: "fixed_points",
      targetValue: 20,
      trailingEnabled: false,
    },
    risk: {
      maxRiskUsd: 220,
      maxContracts: 2,
      maxTradesPerSession: 5,
      dailyLossBufferPct: 0.15,
    },
    confidence: {
      base: 34,
      max: 94,
      minExecutionScore: 66,
      weightByConditionId: {
        "failed-breakdown-signal": 3,
        "reclaim-close": 3,
        "reversal-volume": 2,
        "news-window-clear": 2,
      },
    },
    cooldowns: [{ reason: "Consecutive fade losses", minutes: 8 }],
    metadata: {
      tags: ["reversal", "trap", "momentum-shift"],
      version,
      author,
    },
    stats: { winRate: 59, avgR: 2.4, sharpe: 1.08, maxDD: 1200, trades: 62 },
  },
];

const mockContextByStrategyId: Record<string, StrategyContext> = {
  "sweep-long": contextWithSignals({
    priorSwingSwept: true,
    reclaimCloseBackInsideRange: true,
    volumeMultiple: 1.7,
    opposingHighImpactNewsWithin15m: false,
  }),
  "sweep-short": contextWithSignals({
    priorSwingSwept: true,
    reclaimCloseBackInsideRange: true,
    volumeMultiple: 1.2,
    opposingHighImpactNewsWithin15m: false,
  }),
  "orb-break": contextWithSignals(
    {
      openingRangeEstablished: true,
      openingRangeBreakout: true,
      retestOfBrokenLevel: true,
      volumeOnRetestMultiple: 1.35,
      volumeMultiple: 1.3,
    },
    { timeframe: "5m" },
  ),
  "vwap-reclaim": contextWithSignals({
    vwapLostAndReclaimed: true,
    volumeMultiple: 1.5,
    opposingHighImpactNewsWithin15m: false,
  }),
  "hourly-zone-trend": contextWithSignals(
    {
      hourlyZoneTouched: true,
      trendAligned: true,
      volumeMultiple: 1.15,
    },
    { timeframe: "1h", session: "NY_RTH" },
  ),
  "failed-breakdown": contextWithSignals({
    failedBreakdownConfirmed: true,
    reclaimCloseBackInsideRange: true,
    volumeMultiple: 1.25,
    opposingHighImpactNewsWithin15m: false,
  }),
};

export function getMockContextForStrategy(strategyId: string): StrategyContext {
  const context = mockContextByStrategyId[strategyId] ?? contextWithSignals({});

  return {
    ...context,
    signals: { ...context.signals },
    risk: { ...context.risk },
    now: new Date().toISOString(),
  };
}
