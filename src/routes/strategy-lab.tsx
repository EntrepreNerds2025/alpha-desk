import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  evaluateStrategy,
  getMockContextForStrategy,
  strategyByName,
  strategyNames,
} from "@/lib/strategy";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";

export const Route = createFileRoute("/strategy-lab")({
  head: () => ({
    meta: [
      { title: "Strategy Lab — AI Trading Office" },
      { name: "description", content: "Build, test, and compare trading strategies" },
    ],
  }),
  component: StrategyLabPage,
});

const strategyStats: Record<
  string,
  { winRate: number; avgR: number; sharpe: number; maxDD: number; trades: number }
> = {
  "Sweep Long": strategyByName["Sweep Long"].stats,
  "Sweep Short": strategyByName["Sweep Short"].stats,
  "ORB Break": strategyByName["ORB Break"].stats,
  "Hourly Zone Trend": strategyByName["Hourly Zone Trend"].stats,
  "VWAP Reclaim": strategyByName["VWAP Reclaim"].stats,
  "Failed Breakdown": strategyByName["Failed Breakdown"].stats,
};

const recentTrades = [
  { trade: 1, pnl: 220 },
  { trade: 2, pnl: -90 },
  { trade: 3, pnl: 160 },
  { trade: 4, pnl: 240 },
  { trade: 5, pnl: -140 },
  { trade: 6, pnl: 310 },
  { trade: 7, pnl: 95 },
  { trade: 8, pnl: -65 },
  { trade: 9, pnl: 180 },
  { trade: 10, pnl: 75 },
  { trade: 11, pnl: -110 },
  { trade: 12, pnl: 285 },
  { trade: 13, pnl: 120 },
  { trade: 14, pnl: 190 },
  { trade: 15, pnl: -80 },
  { trade: 16, pnl: 260 },
  { trade: 17, pnl: -55 },
  { trade: 18, pnl: 145 },
  { trade: 19, pnl: 90 },
  { trade: 20, pnl: 205 },
];

function StrategyLabPage() {
  const [selected, setSelected] = useState(strategyNames[0] ?? "Sweep Long");
  const strategy = strategyByName[selected] ?? strategyByName["Sweep Long"];
  const stats = strategyStats[selected] ?? strategyStats["Sweep Long"];
  const evaluation = evaluateStrategy(strategy, getMockContextForStrategy(strategy.id));
  const cooldown = strategy.cooldowns[0]?.minutes ?? 5;

  return (
    <AppLayout>
      <div className="flex h-full">
        {/* Strategy List */}
        <div className="w-56 border-r border-border p-3 space-y-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Strategies
          </h2>
          {strategyNames.map((s) => (
            <button
              key={s}
              onClick={() => setSelected(s)}
              className={cn(
                "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                s === selected
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-surface-3 hover:text-foreground",
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
            <div className="space-y-1">
              <h1 className="text-lg font-semibold">{selected}</h1>
              <p className="text-xs text-muted-foreground">{strategy.description}</p>
            </div>
            <button className="rounded-lg border border-primary bg-primary/10 px-4 py-2 text-xs font-medium text-primary">
              Compare Strategies
            </button>
          </div>

          {/* Parameters */}
          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <h3 className="text-sm font-semibold mb-3">Parameters</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Min Confidence", value: strategy.confidence.minExecutionScore, max: 100 },
                { label: "Max Risk per Trade ($)", value: strategy.risk.maxRiskUsd, max: 1000 },
                { label: "Stop Value", value: strategy.exit.stopValue, max: 50 },
                { label: "Target Value", value: strategy.exit.targetValue, max: 100 },
                { label: "Max Trades/Session", value: strategy.risk.maxTradesPerSession, max: 15 },
                { label: "Cooldown (minutes)", value: cooldown, max: 30 },
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
            <h3 className="text-sm font-semibold mb-3">Condition Checklist</h3>
            <div className="grid grid-cols-2 gap-3">
              {evaluation.conditionResults.map((condition) => (
                <div
                  key={condition.conditionId}
                  className="rounded-md border border-border bg-surface-1 p-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        condition.passed ? "bg-success" : "bg-warning",
                      )}
                    />
                    <span className="text-xs font-medium">{condition.label}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">{condition.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="w-72 border-l border-border p-4 space-y-4 overflow-y-auto scrollbar-thin">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Evaluation Snapshot
          </h3>

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

          <div className="rounded-lg border border-border bg-surface-2 p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Conditions</span>
              <span className="font-medium">
                {evaluation.passedConditions}/{evaluation.totalConditions}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Confidence</span>
              <span
                className={cn(
                  "font-semibold",
                  evaluation.confidence >= strategy.confidence.minExecutionScore
                    ? "text-success"
                    : "text-warning",
                )}
              >
                {evaluation.confidence}%
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">Executable</span>
              <span
                className={cn(
                  "font-semibold",
                  evaluation.executable ? "text-success" : "text-danger",
                )}
              >
                {evaluation.executable ? "Yes" : "Blocked"}
              </span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground text-center">
            {stats.trades} trades analyzed
          </div>

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
