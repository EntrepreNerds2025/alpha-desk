import type { RiskState, Strategy, StrategyEvaluation, StrategyContext } from "./types";

function calculateConfidence(
  strategy: Strategy,
  context: StrategyContext,
): { confidence: number; conditionResults: StrategyEvaluation["conditionResults"] } {
  const conditionResults = strategy.conditions.map((condition) => condition.evaluator(context));
  const totalWeight = conditionResults.reduce((sum, result) => {
    return sum + (strategy.confidence.weightByConditionId[result.conditionId] ?? 1);
  }, 0);
  const passedWeight = conditionResults.reduce((sum, result) => {
    if (!result.passed) {
      return sum;
    }

    return sum + (strategy.confidence.weightByConditionId[result.conditionId] ?? 1);
  }, 0);

  const ratio = totalWeight > 0 ? passedWeight / totalWeight : 0;
  const boundedRatio = Math.max(0, Math.min(1, ratio));
  const rawConfidence =
    strategy.confidence.base + boundedRatio * (strategy.confidence.max - strategy.confidence.base);

  return {
    confidence: Math.round(rawConfidence),
    conditionResults,
  };
}

function getRiskBlockReasons(risk: RiskState): string[] {
  const reasons: string[] = [];

  if (risk.killSwitchActive) {
    reasons.push("Kill switch is active.");
  }
  if (risk.dailyLossLimitHit) {
    reasons.push("Daily loss limit is already hit.");
  }
  if (risk.trailingDrawdownBreach) {
    reasons.push("Trailing drawdown limit is breached.");
  }
  if (risk.consistencyLimitBreach) {
    reasons.push("Consistency payout rule is breached.");
  }

  return reasons;
}

export function evaluateStrategy(strategy: Strategy, context: StrategyContext): StrategyEvaluation {
  const { confidence, conditionResults } = calculateConfidence(strategy, context);
  const riskBlockReasons = getRiskBlockReasons(context.risk);
  const passedConditions = conditionResults.filter((result) => result.passed).length;
  const allConditionsPassed = passedConditions === conditionResults.length;
  const riskBlocked = riskBlockReasons.length > 0;
  const executable =
    allConditionsPassed && !riskBlocked && confidence >= strategy.confidence.minExecutionScore;

  return {
    strategyId: strategy.id,
    strategyName: strategy.name,
    confidence,
    passedConditions,
    totalConditions: conditionResults.length,
    conditionResults,
    riskBlocked,
    riskBlockReasons,
    executable,
  };
}
