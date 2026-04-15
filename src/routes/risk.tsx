import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  complianceChecklistLabels,
  hasCompletedComplianceChecklist,
} from "@/lib/risk/prop-firm-compliance";
import { useTradingControls } from "@/lib/trading-controls";
import { cn } from "@/lib/utils";
import { Shield, Octagon, Clock, AlertTriangle, Activity, Newspaper } from "lucide-react";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Risk Center - AI Trading Office" },
      { name: "description", content: "Monitor and manage trading risk parameters" },
    ],
  }),
  component: RiskPage,
});

const riskEvents = [
  {
    time: "11:02 AM",
    event: "Position size reduced",
    detail: "CPI risk window approaching - auto-reduced max size to 1 contract",
    type: "warning",
  },
  {
    time: "10:48 AM",
    event: "Stop triggered",
    detail: "NQ Long #5 stopped at 21,460.00 - loss $80",
    type: "danger",
  },
  {
    time: "10:31 AM",
    event: "New position opened",
    detail: "CL Short at 74.85 - within risk limits",
    type: "info",
  },
  {
    time: "10:14 AM",
    event: "Position closed",
    detail: "NQ Long #3 target hit at 21,490 - profit $120",
    type: "success",
  },
];

const riskRules = [
  { name: "Max Daily Loss Limit", value: "$1,000" },
  { name: "Max Trades Per Session", value: "12" },
  { name: "Max Concurrent Positions", value: "3" },
  { name: "News Block Window", value: "+/-5 min" },
  { name: "Cooldown After Loss", value: "5 min" },
  { name: "Max Position Size", value: "3 contracts" },
];

function RiskPage() {
  const {
    state,
    autoLiveBlockers,
    setPaperTradingDays,
    setRiskPatch,
    activateKillSwitch,
    clearKillSwitch,
  } = useTradingControls();

  const checklistComplete = hasCompletedComplianceChecklist(state.compliance.checklist);
  const paperProgressPct =
    (state.compliance.paperTradingDays / state.compliance.requiredPaperTradingDays) * 100;
  const dailyLossPct = (state.risk.dailyLossUsed / state.risk.dailyLossLimit) * 100;

  const riskCards = [
    {
      label: "Max Daily Loss",
      current: `$${state.risk.dailyLossUsed.toFixed(0)}`,
      max: `$${state.risk.dailyLossLimit.toFixed(0)}`,
      percent: dailyLossPct,
      icon: Shield,
    },
    {
      label: "Paper Track Record",
      current: `${state.compliance.paperTradingDays}`,
      max: `${state.compliance.requiredPaperTradingDays}`,
      percent: paperProgressPct,
      icon: Activity,
    },
    {
      label: "Trailing Buffer",
      current: `$${state.risk.trailingDrawdownRemaining.toFixed(0)}`,
      max: "$0 floor",
      percent: Math.min(100, (state.risk.trailingDrawdownRemaining / 2000) * 100),
      icon: AlertTriangle,
    },
    {
      label: "News Block",
      current: state.risk.newsBlockActive ? "Active" : "Clear",
      max: "Session",
      percent: state.risk.newsBlockActive ? 100 : 0,
      icon: Clock,
    },
  ];

  return (
    <AppLayout>
      <div className="flex h-full">
        <div className="flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin">
          <h1 className="text-lg font-semibold">Risk Command Center</h1>

          <div className="grid grid-cols-4 gap-3">
            {riskCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-lg border border-border bg-surface-2 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
                  </div>
                  <div className="mb-2 text-xl font-bold text-foreground">
                    {card.current}
                    <span className="text-sm text-muted-foreground"> / {card.max}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        card.percent > 85
                          ? "bg-danger"
                          : card.percent > 60
                            ? "bg-warning"
                            : "bg-success",
                      )}
                      style={{ width: `${Math.min(100, Math.max(0, card.percent))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-warning" />
              <h3 className="text-sm font-semibold">Upcoming News Blocks</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { event: "CPI Report", block: "8:25 - 8:35 AM ET" },
                { event: "Fed Speech", block: "10:55 - 11:05 AM ET" },
                { event: "Oil Inventories", block: "10:25 - 10:35 AM ET" },
              ].map((newsItem) => (
                <div
                  key={newsItem.event}
                  className="rounded-lg border border-warning/20 bg-warning/5 p-3"
                >
                  <div className="text-xs font-semibold text-foreground">{newsItem.event}</div>
                  <div className="mt-1 text-[10px] text-warning">Block: {newsItem.block}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <h3 className="mb-3 text-sm font-semibold">Auto Live Readiness</h3>
            <div className="mb-3 rounded-lg border border-border bg-surface-1 p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Checklist complete</span>
                <span
                  className={cn(
                    "font-semibold",
                    checklistComplete ? "text-success" : "text-warning",
                  )}
                >
                  {checklistComplete ? "Yes" : "No"}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-muted-foreground">Acknowledged at</span>
                <span className="text-foreground">
                  {state.compliance.acknowledgedAt ?? "Pending"}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <button
                  onClick={() => setPaperTradingDays(state.compliance.paperTradingDays + 1)}
                  className="rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-surface-3 hover:text-foreground"
                >
                  Add paper day
                </button>
                <button
                  onClick={() => setRiskPatch({ newsBlockActive: !state.risk.newsBlockActive })}
                  className="rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-surface-3 hover:text-foreground"
                >
                  Toggle news block
                </button>
              </div>
            </div>

            <div className="space-y-1 text-xs text-foreground">
              {autoLiveBlockers.map((blocker) => (
                <div
                  key={blocker}
                  className="rounded border border-warning/30 bg-warning/10 px-2 py-1"
                >
                  {blocker}
                </div>
              ))}
              {autoLiveBlockers.length === 0 && (
                <div className="rounded border border-success/30 bg-success/10 px-2 py-1 text-success">
                  Auto Live is currently eligible.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border-2 border-danger/30 bg-danger/5 p-6 text-center">
            <Octagon className="mx-auto mb-2 h-8 w-8 text-danger" />
            <h3 className="mb-1 text-sm font-semibold text-danger">Emergency Kill Switch</h3>
            <p className="mb-3 text-xs text-muted-foreground">
              Cancels execution intents and forces mode to Manual.
            </p>
            <button
              onClick={() => {
                if (state.risk.killSwitchActive) {
                  clearKillSwitch();
                  return;
                }
                activateKillSwitch();
              }}
              className={cn(
                "rounded-lg px-8 py-3 text-sm font-bold transition-colors",
                state.risk.killSwitchActive
                  ? "bg-success text-success-foreground hover:bg-success/90"
                  : "bg-danger text-danger-foreground hover:bg-danger/90",
              )}
            >
              {state.risk.killSwitchActive ? "CLEAR KILL SWITCH" : "STOP ALL TRADING"}
            </button>
          </div>

          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <h3 className="mb-3 text-sm font-semibold">Risk Events</h3>
            <div className="space-y-2">
              {riskEvents.map((eventItem) => (
                <div
                  key={`${eventItem.time}-${eventItem.event}`}
                  className="flex items-start gap-3 rounded-md p-2 hover:bg-surface-3"
                >
                  <span className="mt-0.5 whitespace-nowrap text-[10px] text-muted-foreground">
                    {eventItem.time}
                  </span>
                  <div
                    className={cn(
                      "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                      eventItem.type === "danger"
                        ? "bg-danger"
                        : eventItem.type === "warning"
                          ? "bg-warning"
                          : eventItem.type === "success"
                            ? "bg-success"
                            : "bg-info",
                    )}
                  />
                  <div>
                    <div className="text-xs font-medium text-foreground">{eventItem.event}</div>
                    <div className="text-[10px] text-muted-foreground">{eventItem.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-80 overflow-y-auto border-l border-border p-4 scrollbar-thin">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Prop-Firm Rules
          </h3>
          <div className="space-y-3">
            {riskRules.map((rule) => (
              <div key={rule.name} className="rounded-lg border border-border bg-surface-1 p-3">
                <div className="text-xs font-medium text-foreground">{rule.name}</div>
                <div className="text-[10px] text-muted-foreground">{rule.value}</div>
              </div>
            ))}
          </div>

          <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Compliance Checklist
          </h3>
          <div className="space-y-2">
            {Object.entries(complianceChecklistLabels).map(([key, label]) => {
              const checked =
                state.compliance.checklist[key as keyof typeof state.compliance.checklist];
              return (
                <div key={key} className="rounded-lg border border-border bg-surface-1 p-3">
                  <div
                    className={cn(
                      "mb-1 text-[10px] font-semibold uppercase tracking-wider",
                      checked ? "text-success" : "text-warning",
                    )}
                  >
                    {checked ? "Acknowledged" : "Pending"}
                  </div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
