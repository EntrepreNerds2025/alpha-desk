import type { TradingMode } from "@/data/placeholder";

export type ComplianceChecklistKey =
  | "supervisedAutomationOnly"
  | "dailyLossHardLimit"
  | "trailingDrawdownProtection"
  | "consistencyRuleAware"
  | "newsBlackoutAware";

export interface PropFirmComplianceChecklist {
  supervisedAutomationOnly: boolean;
  dailyLossHardLimit: boolean;
  trailingDrawdownProtection: boolean;
  consistencyRuleAware: boolean;
  newsBlackoutAware: boolean;
}

export interface PropFirmComplianceState {
  policyVersion: string;
  acknowledgedAt: string | null;
  checklist: PropFirmComplianceChecklist;
  paperTradingDays: number;
  requiredPaperTradingDays: number;
}

export interface RiskGuardState {
  killSwitchActive: boolean;
  dailyLossUsed: number;
  dailyLossLimit: number;
  trailingDrawdownRemaining: number;
  consistencyLargestWinningDayPct: number;
  newsBlockActive: boolean;
}

export interface TradingControlState {
  mode: TradingMode;
  compliance: PropFirmComplianceState;
  risk: RiskGuardState;
}

export interface ModeSwitchResult {
  ok: boolean;
  mode: TradingMode;
  blockers: string[];
}

export const complianceChecklistLabels: Record<ComplianceChecklistKey, string> = {
  supervisedAutomationOnly:
    "I will only run Auto Live while supervised and ready to intervene immediately.",
  dailyLossHardLimit: "I understand daily loss limits are hard stops and must never be breached.",
  trailingDrawdownProtection:
    "I understand trailing drawdown rules and will keep protective buffer enforced.",
  consistencyRuleAware:
    "I understand payout consistency constraints (single day should not dominate results).",
  newsBlackoutAware: "I will respect firm-specific news blackout windows and event risk limits.",
};

export function hasCompletedComplianceChecklist(checklist: PropFirmComplianceChecklist) {
  return Object.values(checklist).every(Boolean);
}

export function getAutoLiveBlockers(state: TradingControlState) {
  const blockers: string[] = [];

  if (!state.compliance.acknowledgedAt) {
    blockers.push("Prop-firm compliance has not been acknowledged.");
  }

  if (!hasCompletedComplianceChecklist(state.compliance.checklist)) {
    blockers.push("Compliance checklist is incomplete.");
  }

  if (state.compliance.paperTradingDays < state.compliance.requiredPaperTradingDays) {
    blockers.push(
      `Paper trading track record is ${state.compliance.paperTradingDays}/${state.compliance.requiredPaperTradingDays} days.`,
    );
  }

  if (state.risk.killSwitchActive) {
    blockers.push("Kill switch is active.");
  }

  const dailyLossBufferThreshold = state.risk.dailyLossLimit * 0.85;
  if (state.risk.dailyLossUsed >= dailyLossBufferThreshold) {
    blockers.push(
      `Daily loss usage is near hard limit ($${state.risk.dailyLossUsed.toFixed(0)} / $${state.risk.dailyLossLimit.toFixed(0)}).`,
    );
  }

  if (state.risk.trailingDrawdownRemaining <= 0) {
    blockers.push("Trailing drawdown buffer is depleted.");
  }

  if (state.risk.consistencyLargestWinningDayPct > 30) {
    blockers.push(
      `Consistency rule risk: largest winning day is ${state.risk.consistencyLargestWinningDayPct.toFixed(1)}% of total profit.`,
    );
  }

  if (state.risk.newsBlockActive) {
    blockers.push("News blackout window is active.");
  }

  return blockers;
}

export function evaluateModeSwitch(
  state: TradingControlState,
  nextMode: TradingMode,
): ModeSwitchResult {
  if (nextMode !== "Auto Live") {
    if (state.risk.killSwitchActive && nextMode === "Auto Paper") {
      return {
        ok: false,
        mode: nextMode,
        blockers: ["Kill switch is active. Clear it before re-enabling Auto Paper."],
      };
    }

    return { ok: true, mode: nextMode, blockers: [] };
  }

  const blockers = getAutoLiveBlockers(state);
  return {
    ok: blockers.length === 0,
    mode: nextMode,
    blockers,
  };
}
