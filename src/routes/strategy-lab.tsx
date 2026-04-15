import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { strategies } from "@/data/placeholder";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/strategy-lab")({
  head: () => ({
    meta: [
      { title: "Strategy Lab — AI Trading Office" },
      { name: "description", content: "Build, test, and compare trading strategies" },
    ],
  }),
  component: StrategyLabPage,
});

const strategyStats: Record<string, { winRate: number; avgR: number; sharpe: number; maxDD: number; trades: number }> = {
  "Sweep Long": { winRate: 68, avgR: 1.8, sharpe: 1.42, maxDD: 820, trades: 124 },
  "Sweep Short": { winRate: 62, avgR: 1.5, sharpe: 1.15, maxDD: 1100, trades: 87 },
  "ORB Break": { winRate: 55, avgR: 2.1, sharpe: 0.98, maxDD: 1450, trades: 203 },
  "Hourly Zone Trend": { winRate: 71, avgR: 1.3, sharpe: 1.65, maxDD: 540, trades: 156 },
  "VWAP Reclaim": { winRate: 64, avgR: 1.6, sharpe: 1.28, maxDD: 780, trades: 98 },
  "Failed Breakdown": { winRate: 59, avgR: 2.4, sharpe: 1.08, maxDD: 1200, trades: 62 },
};

const recentTrades = Array.from({ length: 20 }, (_, i) => ({
  trade: i + 1,
  pnl: Math.round((Math.random() - 0.35) * 500),
}));

function StrategyLabPage() {
  const [selected, setSelected] = useState("Sweep Long");
  const stats = strategyStats[selected];

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Strategy List */}
        <div className="w-56 border-r border-border p-3 space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Strategies</h2>
          {strategies.map((s) => (
            <button
              key={s}
              onClick={() => setSelected(s)}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                s === selected ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-muted-foreground hover:bg-surface-3 hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
          <div className="pt-4">
            <button className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-muted-foreground hover:bg-surface-3">
              + New Strategy
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">{selected}</h1>
            <button className="rounded-lg border border-primary bg-primary/10 px-4 py-2 text-xs font-medium text-primary">
              Compare Strategies
            </button>
          </div>

          {/* Parameters */}
          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <h3 className="text-sm font-semibold mb-3">Parameters</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Min Confidence", value: 55, max: 100 },
                { label: "Max Risk per Trade ($)", value: 200, max: 500 },
                { label: "Stop Distance (ticks)", value: 8, max: 20 },
                { label: "Target Multiple (R)", value: 2.0, max: 5 },
                { label: "Max Trades/Session", value: 6, max: 15 },
                { label: "Cooldown (minutes)", value: 5, max: 30 },
              ].map((p) => (
                <div key={p.label} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-muted-foreground">{p.label}</label>
                    <span className="text-price text-xs">{p.value}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={p.max}
                    defaultValue={p.value}
                    className="w-full h-1 rounded-full bg-surface-3 accent-primary"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <h3 className="text-sm font-semibold mb-3">Rules</h3>
            <div className="grid grid-cols-2 gap-3">
              {["Require volume confirmation", "News block active", "Session filter (NY only)", "Trend alignment required", "Auto scale-in enabled", "Trailing stop enabled"].map((rule) => (
                <label key={rule} className="flex items-center gap-2 text-xs">
                  <input type="checkbox" defaultChecked={Math.random() > 0.3} className="rounded accent-primary" />
                  <span className="text-muted-foreground">{rule}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="w-72 border-l border-border p-4 space-y-4 overflow-y-auto scrollbar-thin">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Paper Test Results</h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-surface-2 p-3 text-center">
              <div className="text-lg font-bold text-success">{stats.winRate}%</div>
              <div className="text-[10px] text-muted-foreground">Win Rate</div>
            </div>
            <div className="rounded-lg bg-surface-2 p-3 text-center">
              <div className="text-lg font-bold text-primary">{stats.avgR}R</div>
              <div className="text-[10px] text-muted-foreground">Avg R</div>
            </div>
            <div className="rounded-lg bg-surface-2 p-3 text-center">
              <div className="text-lg font-bold text-foreground">{stats.sharpe}</div>
              <div className="text-[10px] text-muted-foreground">Sharpe</div>
            </div>
            <div className="rounded-lg bg-surface-2 p-3 text-center">
              <div className="text-lg font-bold text-danger">${stats.maxDD}</div>
              <div className="text-[10px] text-muted-foreground">Max DD</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center">{stats.trades} trades analyzed</div>

          {/* Recent P&L chart */}
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentTrades}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="trade" tick={false} />
                <YAxis tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} width={35} />
                <Bar dataKey="pnl" fill="var(--primary)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
