/* eslint-disable react-refresh/only-export-components */

import type { TradingMode } from "@/data/placeholder";
import {
  type ComplianceChecklistKey,
  type ModeSwitchResult,
  type TradingControlState,
  evaluateModeSwitch,
  getAutoLiveBlockers,
} from "@/lib/risk/prop-firm-compliance";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

const storageKey = "ai-trading-office:trading-controls:v1";

const defaultState: TradingControlState = {
  mode: "Auto Paper",
  compliance: {
    policyVersion: "2026-04-15",
    acknowledgedAt: null,
    checklist: {
      supervisedAutomationOnly: false,
      dailyLossHardLimit: false,
      trailingDrawdownProtection: false,
      consistencyRuleAware: false,
      newsBlackoutAware: false,
    },
    paperTradingDays: 18,
    requiredPaperTradingDays: 30,
  },
  risk: {
    killSwitchActive: false,
    dailyLossUsed: 420,
    dailyLossLimit: 1000,
    trailingDrawdownRemaining: 1600,
    consistencyLargestWinningDayPct: 22,
    newsBlockActive: false,
  },
};

interface TradingControlsContextValue {
  state: TradingControlState;
  autoLiveBlockers: string[];
  requestModeChange: (nextMode: TradingMode) => ModeSwitchResult;
  setComplianceChecklistItem: (key: ComplianceChecklistKey, checked: boolean) => void;
  acknowledgeCompliance: () => void;
  setPaperTradingDays: (days: number) => void;
  setRiskPatch: (patch: Partial<TradingControlState["risk"]>) => void;
  activateKillSwitch: () => void;
  clearKillSwitch: () => void;
}

const TradingControlsContext = createContext<TradingControlsContextValue | null>(null);

function isTradingControlState(value: unknown): value is TradingControlState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TradingControlState>;
  return (
    typeof candidate.mode === "string" && Boolean(candidate.compliance) && Boolean(candidate.risk)
  );
}

export function TradingControlsProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TradingControlState>(defaultState);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(storageKey);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      if (isTradingControlState(parsed)) {
        setState({
          ...defaultState,
          ...parsed,
          compliance: {
            ...defaultState.compliance,
            ...parsed.compliance,
            checklist: {
              ...defaultState.compliance.checklist,
              ...parsed.compliance.checklist,
            },
          },
          risk: {
            ...defaultState.risk,
            ...parsed.risk,
          },
        });
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const autoLiveBlockers = useMemo(() => getAutoLiveBlockers(state), [state]);

  const value: TradingControlsContextValue = useMemo(
    () => ({
      state,
      autoLiveBlockers,
      requestModeChange: (nextMode) => {
        const evaluation = evaluateModeSwitch(state, nextMode);
        if (!evaluation.ok) {
          return evaluation;
        }

        setState((current) => ({ ...current, mode: nextMode }));
        return evaluation;
      },
      setComplianceChecklistItem: (key, checked) => {
        setState((current) => ({
          ...current,
          compliance: {
            ...current.compliance,
            checklist: {
              ...current.compliance.checklist,
              [key]: checked,
            },
          },
        }));
      },
      acknowledgeCompliance: () => {
        setState((current) => ({
          ...current,
          compliance: {
            ...current.compliance,
            acknowledgedAt: new Date().toISOString(),
          },
        }));
      },
      setPaperTradingDays: (days) => {
        setState((current) => ({
          ...current,
          compliance: {
            ...current.compliance,
            paperTradingDays: Math.max(0, Math.round(days)),
          },
        }));
      },
      setRiskPatch: (patch) => {
        setState((current) => ({
          ...current,
          risk: {
            ...current.risk,
            ...patch,
          },
        }));
      },
      activateKillSwitch: () => {
        setState((current) => ({
          ...current,
          mode: "Manual",
          risk: {
            ...current.risk,
            killSwitchActive: true,
          },
        }));
      },
      clearKillSwitch: () => {
        setState((current) => ({
          ...current,
          risk: {
            ...current.risk,
            killSwitchActive: false,
          },
        }));
      },
    }),
    [autoLiveBlockers, state],
  );

  return (
    <TradingControlsContext.Provider value={value}>{children}</TradingControlsContext.Provider>
  );
}

export function useTradingControls() {
  const context = useContext(TradingControlsContext);
  if (!context) {
    throw new Error("useTradingControls must be used within TradingControlsProvider.");
  }

  return context;
}
