import { useState } from "react";
import { Bell, ChevronDown, Lock, Octagon, User, X } from "lucide-react";
import { symbols, modes } from "@/data/placeholder";
import { LiveClock } from "@/components/trading/LiveClock";
import { strategyNames } from "@/lib/strategy";
import {
  type ComplianceChecklistKey,
  complianceChecklistLabels,
  hasCompletedComplianceChecklist,
} from "@/lib/risk/prop-firm-compliance";
import { useTradingControls } from "@/lib/trading-controls";
import { cn } from "@/lib/utils";

const checklistEntries = Object.entries(complianceChecklistLabels) as [
  ComplianceChecklistKey,
  string,
][];

export function TopBar() {
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]);
  const [selectedStrategy, setSelectedStrategy] = useState(strategyNames[0] ?? "Sweep Long");
  const [symbolOpen, setSymbolOpen] = useState(false);
  const [strategyOpen, setStrategyOpen] = useState(false);
  const [complianceModalOpen, setComplianceModalOpen] = useState(false);

  const {
    state,
    autoLiveBlockers,
    requestModeChange,
    setComplianceChecklistItem,
    acknowledgeCompliance,
    setPaperTradingDays,
    activateKillSwitch,
    clearKillSwitch,
  } = useTradingControls();

  const mode = state.mode;
  const checklistComplete = hasCompletedComplianceChecklist(state.compliance.checklist);
  const hasAutoLiveBlockers = autoLiveBlockers.length > 0;

  const onModeClick = (nextMode: (typeof modes)[number]) => {
    const result = requestModeChange(nextMode);
    if (!result.ok && nextMode === "Auto Live") {
      setComplianceModalOpen(true);
    }
  };

  const tryEnableAutoLive = () => {
    if (!checklistComplete) {
      return;
    }

    acknowledgeCompliance();
    const result = requestModeChange("Auto Live");
    if (result.ok) {
      setComplianceModalOpen(false);
    }
  };

  return (
    <>
      <header className="flex h-14 items-center justify-between border-b border-border bg-surface-1 px-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-primary-foreground">AI</span>
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Trading Office
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => {
                setSymbolOpen(!symbolOpen);
                setStrategyOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm transition-colors hover:bg-surface-3"
            >
              <span className="font-semibold text-foreground">{selectedSymbol.symbol}</span>
              <span className="text-price text-xs">
                {selectedSymbol.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span
                className={cn(
                  "text-xs font-medium",
                  selectedSymbol.change >= 0 ? "text-positive" : "text-negative",
                )}
              >
                {selectedSymbol.change >= 0 ? "+" : ""}
                {selectedSymbol.changePct.toFixed(2)}%
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            {symbolOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-border bg-surface-1 p-1 shadow-xl">
                {symbols.map((symbolOption) => (
                  <button
                    key={symbolOption.symbol}
                    onClick={() => {
                      setSelectedSymbol(symbolOption);
                      setSymbolOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-surface-3",
                      symbolOption.symbol === selectedSymbol.symbol && "bg-primary/10",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{symbolOption.symbol}</span>
                      <span className="text-xs text-muted-foreground">{symbolOption.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-price text-xs">
                        {symbolOption.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span
                        className={cn(
                          "text-xs",
                          symbolOption.change >= 0 ? "text-positive" : "text-negative",
                        )}
                      >
                        {symbolOption.change >= 0 ? "+" : ""}
                        {symbolOption.changePct.toFixed(2)}%
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setStrategyOpen(!strategyOpen);
                setSymbolOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm transition-colors hover:bg-surface-3"
            >
              <span className="text-xs text-muted-foreground">Strategy:</span>
              <span className="font-medium text-foreground">{selectedStrategy}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            {strategyOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-lg border border-border bg-surface-1 p-1 shadow-xl">
                {strategyNames.map((strategyName) => (
                  <button
                    key={strategyName}
                    onClick={() => {
                      setSelectedStrategy(strategyName);
                      setStrategyOpen(false);
                    }}
                    className={cn(
                      "w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-3",
                      strategyName === selectedStrategy && "bg-primary/10 text-primary",
                    )}
                  >
                    {strategyName}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center rounded-lg border border-border bg-surface-2 p-0.5">
            {modes.map((modeOption) => {
              const active = modeOption === mode;
              const autoPaperTone = modeOption === "Auto Paper";
              const autoLiveTone = modeOption === "Auto Live";

              const colorClass = active
                ? autoPaperTone
                  ? "bg-success/20 text-success"
                  : autoLiveTone
                    ? "bg-danger/20 text-danger"
                    : "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground";

              return (
                <button
                  key={modeOption}
                  onClick={() => onModeClick(modeOption)}
                  className={cn(
                    "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                    colorClass,
                    autoLiveTone && hasAutoLiveBlockers && !active && "text-warning",
                  )}
                >
                  {autoLiveTone && <Lock className="h-2.5 w-2.5" />}
                  {modeOption}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1.5">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                state.risk.killSwitchActive ? "bg-danger" : "animate-pulse-glow bg-success",
              )}
            />
            <span
              className={cn(
                "text-xs font-medium",
                state.risk.killSwitchActive ? "text-danger" : "text-success",
              )}
            >
              {state.risk.killSwitchActive ? "Kill Switch Active" : "NY Open"}
            </span>
            <span className="text-xs text-muted-foreground">|</span>
            <LiveClock />
            <span className="text-xs text-muted-foreground">|</span>
            <span className="text-xs text-muted-foreground">Mode: {mode}</span>
          </div>

          <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-surface-3 hover:text-foreground">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>

          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-3">
            <User className="h-3.5 w-3.5 text-muted-foreground" />
          </div>

          <button
            onClick={() => {
              if (state.risk.killSwitchActive) {
                clearKillSwitch();
                return;
              }

              activateKillSwitch();
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors",
              state.risk.killSwitchActive
                ? "bg-success text-success-foreground hover:bg-success/90"
                : "bg-danger text-danger-foreground hover:bg-danger/90",
            )}
          >
            <Octagon className="h-3 w-3" />
            {state.risk.killSwitchActive ? "RESUME" : "STOP ALL"}
          </button>
        </div>
      </header>

      {complianceModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-surface-1 shadow-2xl">
            <div className="flex items-start justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Auto Live Compliance Gate
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Policy v{state.compliance.policyVersion} - Prop-firm safeguards must be
                  acknowledged.
                </p>
              </div>
              <button
                onClick={() => setComplianceModalOpen(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-surface-3 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 px-5 py-4">
              <div className="rounded-lg border border-border bg-surface-2 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Stable paper-trading days</span>
                  <span className="font-semibold text-foreground">
                    {state.compliance.paperTradingDays}/{state.compliance.requiredPaperTradingDays}
                  </span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(
                        100,
                        (state.compliance.paperTradingDays /
                          state.compliance.requiredPaperTradingDays) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setPaperTradingDays(state.compliance.paperTradingDays + 1)}
                    className="rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-surface-3 hover:text-foreground"
                  >
                    +1 day
                  </button>
                  <button
                    onClick={() => setPaperTradingDays(state.compliance.paperTradingDays + 5)}
                    className="rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-surface-3 hover:text-foreground"
                  >
                    +5 days
                  </button>
                </div>
              </div>

              <div className="space-y-2 rounded-lg border border-border bg-surface-2 p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Required Acknowledgments
                </h3>
                {checklistEntries.map(([key, label]) => (
                  <label key={key} className="flex items-start gap-2 text-xs text-foreground">
                    <input
                      type="checkbox"
                      checked={state.compliance.checklist[key]}
                      onChange={(event) => setComplianceChecklistItem(key, event.target.checked)}
                      className="mt-0.5 h-3.5 w-3.5 rounded border-border bg-surface-1 accent-primary"
                    />
                    <span className="leading-relaxed">{label}</span>
                  </label>
                ))}
              </div>

              <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-warning">
                  Active Blockers
                </h3>
                <ul className="mt-2 space-y-1 text-xs text-foreground">
                  {autoLiveBlockers.map((blocker) => (
                    <li key={blocker}>- {blocker}</li>
                  ))}
                  {autoLiveBlockers.length === 0 && (
                    <li>- No blockers detected. Auto Live is ready.</li>
                  )}
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-4">
              <button
                onClick={() => setComplianceModalOpen(false)}
                className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-surface-3 hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={tryEnableAutoLive}
                disabled={!checklistComplete}
                className={cn(
                  "rounded-md px-3 py-1.5 text-xs font-semibold",
                  checklistComplete
                    ? "bg-danger text-danger-foreground hover:bg-danger/90"
                    : "cursor-not-allowed bg-surface-3 text-muted-foreground",
                )}
              >
                Acknowledge and Enable Auto Live
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
