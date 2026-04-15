export type FuturesSymbol = "NQ" | "ES" | "CL" | "GC" | "YM" | "RTY" | "BTC" | "ETH";

export type Timeframe = "1m" | "5m" | "15m" | "1h";

export type SessionWindow = "NY_OPEN_FIRST_90" | "NY_RTH" | "FULL_DAY";

export interface StrategySignals {
  priorSwingSwept: boolean;
  reclaimCloseBackInsideRange: boolean;
  volumeMultiple: number;
  opposingHighImpactNewsWithin15m: boolean;
  openingRangeEstablished: boolean;
  openingRangeBreakout: boolean;
  retestOfBrokenLevel: boolean;
  volumeOnRetestMultiple: number;
  vwapLostAndReclaimed: boolean;
  hourlyZoneTouched: boolean;
  trendAligned: boolean;
  failedBreakdownConfirmed: boolean;
}

export interface RiskState {
  killSwitchActive: boolean;
  dailyLossLimitHit: boolean;
  trailingDrawdownBreach: boolean;
  consistencyLimitBreach: boolean;
}

export interface StrategyContext {
  symbol: FuturesSymbol;
  timeframe: Timeframe;
  session: SessionWindow;
  signals: StrategySignals;
  risk: RiskState;
  now: string;
}

export interface ConditionEvaluation {
  conditionId: string;
  label: string;
  passed: boolean;
  detail: string;
}

export type ConditionEvaluator = (context: StrategyContext) => ConditionEvaluation;

export interface StrategyCondition {
  id: string;
  label: string;
  description: string;
  evaluator: ConditionEvaluator;
}

export interface EntryRule {
  orderType: "market" | "limit";
  trigger: string;
  side: "long" | "short";
  allowScaleIn?: boolean;
}

export interface ExitRule {
  stopType: "ticks" | "structure_plus_ticks" | "range_opposite_side";
  stopValue: number;
  targetType: "fixed_points" | "range_multiple" | "vwap_trail" | "runner";
  targetValue: number;
  trailingEnabled: boolean;
}

export interface RiskProfile {
  maxRiskUsd: number;
  maxContracts: number;
  maxTradesPerSession: number;
  dailyLossBufferPct: number;
}

export interface ConfidenceModel {
  base: number;
  max: number;
  minExecutionScore: number;
  weightByConditionId: Record<string, number>;
}

export interface CooldownRule {
  reason: string;
  minutes: number;
}

export interface StrategyPerformanceSnapshot {
  winRate: number;
  avgR: number;
  sharpe: number;
  maxDD: number;
  trades: number;
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  symbols: FuturesSymbol[];
  timeframes: Timeframe[];
  sessions: SessionWindow[];
  conditions: StrategyCondition[];
  entry: EntryRule;
  exit: ExitRule;
  risk: RiskProfile;
  confidence: ConfidenceModel;
  cooldowns: CooldownRule[];
  metadata: {
    tags: string[];
    version: string;
    author: string;
  };
  stats: StrategyPerformanceSnapshot;
}

export interface StrategyEvaluation {
  strategyId: string;
  strategyName: string;
  confidence: number;
  passedConditions: number;
  totalConditions: number;
  conditionResults: ConditionEvaluation[];
  riskBlocked: boolean;
  riskBlockReasons: string[];
  executable: boolean;
}
