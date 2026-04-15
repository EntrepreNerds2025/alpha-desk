import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { Shield, Octagon, Clock, AlertTriangle, Activity, Newspaper } from "lucide-react";

export const Route = createFileRoute("/risk")({
  head: () => ({
    meta: [
      { title: "Risk Center — AI Trading Office" },
      { name: "description", content: "Monitor and manage trading risk parameters" },
    ],
  }),
  component: RiskPage,
});

const riskCards = [
  { label: "Max Daily Loss", current: 420, max: 1000, icon: Shield, color: "warning" as const },
  { label: "Trades This Session", current: 7, max: 12, icon: Activity, color: "primary" as const },
  { label: "Current Exposure", current: 2, max: 6, icon: AlertTriangle, color: "success" as const },
  { label: "Cooldown Timer", current: 0, max: 1, icon: Clock, color: "success" as const },
];

const riskEvents = [
  { time: "11:02 AM", event: "Position size reduced", detail: "CPI risk window approaching — auto-reduced max size to 1 contract", type: "warning" },
  { time: "10:48 AM", event: "Stop triggered", detail: "NQ Long #5 stopped at 21,460.00 — loss $80", type: "danger" },
  { time: "10:31 AM", event: "New position opened", detail: "CL Short at 74.85 — within risk limits", type: "info" },
  { time: "10:14 AM", event: "Position closed", detail: "NQ Long #3 target hit at 21,490 — profit $120", type: "success" },
  { time: "9:58 AM", event: "Stop triggered", detail: "ES Short stopped at 5,854.00 — loss $165", type: "danger" },
  { time: "9:42 AM", event: "First trade of session", detail: "NQ Long at 21,442.25 — risk rules verified", type: "info" },
];

const riskRules = [
  { name: "Max Daily Loss Limit", enabled: true, value: "$1,000" },
  { name: "Max Trades Per Session", enabled: true, value: "12" },
  { name: "Max Concurrent Positions", enabled: true, value: "3" },
  { name: "News Block Window", enabled: true, value: "±5 min" },
  { name: "Cooldown After Loss", enabled: true, value: "5 min" },
  { name: "Max Position Size", enabled: true, value: "3 contracts" },
  { name: "Weekend Holding Block", enabled: false, value: "—" },
  { name: "Trailing Daily P&L Stop", enabled: false, value: "50% of peak" },
];

function RiskPage() {
  return (
    <AppLayout>
      <div className="flex h-full">
        <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin">
          <h1 className="text-lg font-semibold">Risk Command Center</h1>

          {/* Risk Cards */}
          <div className="grid grid-cols-4 gap-3">
            {riskCards.map((c) => {
              const pct = (c.current / c.max) * 100;
              const Icon = c.icon;
              return (
                <div key={c.label} className="rounded-lg border border-border bg-surface-2 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={cn("h-4 w-4", `text-${c.color}`)} />
                    <span className="text-xs font-medium text-muted-foreground">{c.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-2">
                    {c.label === "Max Daily Loss" ? `$${c.current}` : c.label === "Cooldown Timer" ? "None" : c.current}
                    <span className="text-sm text-muted-foreground"> / {c.label === "Max Daily Loss" ? `$${c.max}` : c.max}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
                    <div className={cn("h-full rounded-full", pct > 75 ? "bg-danger" : pct > 50 ? "bg-warning" : "bg-success")} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* News Block Windows */}
          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Newspaper className="h-4 w-4 text-warning" />
              <h3 className="text-sm font-semibold">Upcoming News Blocks</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { event: "CPI Report", time: "8:30 AM ET", block: "8:25 - 8:35 AM", status: "Upcoming" },
                { event: "Fed Speech", time: "11:00 AM ET", block: "10:55 - 11:05 AM", status: "Upcoming" },
                { event: "Oil Inventories", time: "10:30 AM ET", block: "10:25 - 10:35 AM", status: "Upcoming" },
              ].map((n) => (
                <div key={n.event} className="rounded-lg border border-warning/20 bg-warning/5 p-3">
                  <div className="text-xs font-semibold text-foreground">{n.event}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">{n.time}</div>
                  <div className="text-[10px] text-warning mt-1">Block: {n.block}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Kill Switch */}
          <div className="rounded-lg border-2 border-danger/30 bg-danger/5 p-6 text-center">
            <Octagon className="h-8 w-8 text-danger mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-danger mb-1">Emergency Kill Switch</h3>
            <p className="text-xs text-muted-foreground mb-3">Cancel all orders, close all positions, halt all agents</p>
            <button className="rounded-lg bg-danger px-8 py-3 text-sm font-bold text-danger-foreground hover:bg-danger/90 transition-colors">
              STOP ALL TRADING
            </button>
          </div>

          {/* Risk Events Log */}
          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <h3 className="text-sm font-semibold mb-3">Risk Events</h3>
            <div className="space-y-2">
              {riskEvents.map((e, i) => (
                <div key={i} className="flex items-start gap-3 rounded-md p-2 hover:bg-surface-3">
                  <span className="text-price text-[10px] text-muted-foreground whitespace-nowrap mt-0.5">{e.time}</span>
                  <div className={cn("mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                    e.type === "danger" ? "bg-danger" : e.type === "warning" ? "bg-warning" : e.type === "success" ? "bg-success" : "bg-info"
                  )} />
                  <div>
                    <div className="text-xs font-medium text-foreground">{e.event}</div>
                    <div className="text-[10px] text-muted-foreground">{e.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rule Editor */}
        <div className="w-72 border-l border-border p-4 overflow-y-auto scrollbar-thin">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Risk Rules</h3>
          <div className="space-y-3">
            {riskRules.map((r) => (
              <div key={r.name} className="flex items-center justify-between rounded-lg border border-border bg-surface-1 p-3">
                <div>
                  <div className="text-xs font-medium text-foreground">{r.name}</div>
                  <div className="text-[10px] text-muted-foreground">{r.value}</div>
                </div>
                <div className={cn(
                  "h-5 w-9 rounded-full relative cursor-pointer transition-colors",
                  r.enabled ? "bg-success" : "bg-surface-3"
                )}>
                  <div className={cn(
                    "absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition-transform",
                    r.enabled ? "translate-x-4" : "translate-x-0.5"
                  )} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
