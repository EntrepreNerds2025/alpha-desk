import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { PnlDisplay } from "@/components/trading/StatusChip";
import { equityCurve, trades } from "@/data/placeholder";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — AI Trading Office" },
      { name: "description", content: "Track performance and review trading patterns" },
    ],
  }),
  component: JournalPage,
});

const summaryCards = [
  { label: "Today P&L", value: 1455, type: "pnl" },
  { label: "Week P&L", value: 3820, type: "pnl" },
  { label: "Month P&L", value: 8240, type: "pnl" },
  { label: "Total Trades", value: 47, type: "number" },
  { label: "Win Rate", value: "68%", type: "text" },
  { label: "Avg R", value: "1.6R", type: "text" },
];

const mistakes = [
  { pattern: "Overtrading after a loss", frequency: 6, sessions: 12 },
  { pattern: "Entering before confirmation candle", frequency: 4, sessions: 12 },
  { pattern: "Moving stop to breakeven too early", frequency: 3, sessions: 12 },
  { pattern: "Ignoring session time filters", frequency: 2, sessions: 12 },
];

const sessionRecaps = [
  { date: "Apr 14", grade: "B+", pnl: 1455, trades: 7, bestTrade: "GC Long +$790", worstTrade: "ES Short -$165" },
  { date: "Apr 11", grade: "A-", pnl: 2180, trades: 5, bestTrade: "NQ Long +$1,240", worstTrade: "CL Short -$90" },
  { date: "Apr 10", grade: "C", pnl: -340, trades: 8, bestTrade: "ES Long +$280", worstTrade: "NQ Short -$420" },
  { date: "Apr 9", grade: "A", pnl: 1920, trades: 4, bestTrade: "NQ Long +$980", worstTrade: "None" },
  { date: "Apr 8", grade: "B", pnl: 680, trades: 6, bestTrade: "CL Short +$540", worstTrade: "GC Long -$120" },
];

function JournalPage() {
  return (
    <AppLayout>
      <div className="p-4 space-y-4 overflow-y-auto scrollbar-thin">
        {/* Summary Cards */}
        <div className="grid grid-cols-6 gap-3">
          {summaryCards.map((c) => (
            <div key={c.label} className="rounded-lg border border-border bg-surface-2 p-4">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{c.label}</div>
              {c.type === "pnl" ? (
                <PnlDisplay value={c.value as number} className="text-xl font-bold" />
              ) : (
                <div className="text-xl font-bold text-foreground">{c.value}</div>
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Equity Curve */}
          <div className="col-span-2 rounded-lg border border-border bg-surface-2 p-4">
            <h3 className="text-sm font-semibold mb-3">Equity Curve</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityCurve}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={45} />
                  <Tooltip contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="cumulative" stroke="var(--primary)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="h-24 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={equityCurve}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={45} />
                  <Bar dataKey="pnl" radius={[2, 2, 0, 0]}>
                    {equityCurve.map((entry, i) => (
                      <rect key={i} fill={entry.pnl >= 0 ? "var(--success)" : "var(--danger)"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recurring Mistakes */}
          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <h3 className="text-sm font-semibold mb-3">Recurring Mistakes</h3>
            <div className="space-y-3">
              {mistakes.map((m) => (
                <div key={m.pattern}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground">{m.pattern}</span>
                    <span className="text-[10px] text-danger">{m.frequency}x</span>
                  </div>
                  <div className="h-1 rounded-full bg-surface-3 overflow-hidden">
                    <div className="h-full rounded-full bg-danger/60" style={{ width: `${(m.frequency / m.sessions) * 100}%` }} />
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-0.5">in {m.sessions} sessions</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Session Recaps */}
        <div className="rounded-lg border border-border bg-surface-2 p-4">
          <h3 className="text-sm font-semibold mb-3">Recent Sessions</h3>
          <div className="grid grid-cols-5 gap-3">
            {sessionRecaps.map((s) => (
              <div key={s.date} className="rounded-lg border border-border bg-surface-1 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium">{s.date}</span>
                  <span className={cn(
                    "text-lg font-bold",
                    s.grade.startsWith("A") ? "text-success" : s.grade.startsWith("B") ? "text-primary" : "text-warning"
                  )}>{s.grade}</span>
                </div>
                <PnlDisplay value={s.pnl} className="text-sm font-bold" />
                <div className="mt-2 space-y-1 text-[10px] text-muted-foreground">
                  <div>{s.trades} trades</div>
                  <div className="text-success">Best: {s.bestTrade}</div>
                  <div className="text-danger">Worst: {s.worstTrade}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
