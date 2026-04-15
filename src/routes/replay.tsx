import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { cn } from "@/lib/utils";
import { Calendar, Play, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/replay")({
  head: () => ({
    meta: [
      { title: "Replay Center — AI Trading Office" },
      { name: "description", content: "Review and analyze past trading sessions" },
    ],
  }),
  component: ReplayPage,
});

const scores = [
  { label: "Session Grade", value: "B+", color: "text-success" },
  { label: "Market Opportunity", value: "78", suffix: "/100", color: "text-primary" },
  { label: "Bot Execution", value: "82", suffix: "/100", color: "text-primary" },
  { label: "User Execution", value: "65", suffix: "/100", color: "text-warning" },
  { label: "Strategy Discipline", value: "71", suffix: "/100", color: "text-primary" },
  { label: "News Disruption", value: "34", suffix: "/100", color: "text-success" },
];

const lessons = [
  "Missed the initial ORB break at 9:35 — next time set alerts for the first 5m close above range",
  "Held NQ long through the 10:15 chop zone — consider time-based exit rules during first pullback",
  "Good discipline on CL short — patience on entry confirmation paid off with 2R win",
  "Overtraded during the 10:30-11:00 window — stick to max 2 trades per 30-min block",
  "Overall session was positive but could improve entry timing on sweep setups",
];

function ReplayPage() {
  return (
    <AppLayout>
      <div className="p-4 space-y-4">
        {/* Session Selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Replay Center</h1>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-3 py-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-sm">April 14, 2026</span>
            </div>
            <button className="rounded-md p-1.5 hover:bg-surface-3"><ChevronLeft className="h-4 w-4" /></button>
            <button className="rounded-md p-1.5 hover:bg-surface-3"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground">
            <Play className="h-3 w-3" /> Play Session
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div className="rounded-lg border border-border bg-surface-2 p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] text-muted-foreground">9:30 AM</span>
            <div className="flex-1 relative h-6">
              <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-surface-3" />
              <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary" style={{ width: "65%" }} />
              {/* Trade markers */}
              {[15, 28, 38, 48, 55, 62, 68].map((pos) => (
                <div key={pos} className="absolute top-1/2 -translate-y-1/2 h-3 w-1 rounded-full bg-primary/60 cursor-pointer hover:bg-primary" style={{ left: `${pos}%` }} />
              ))}
              {/* News markers */}
              {[42, 72].map((pos) => (
                <div key={`n${pos}`} className="absolute top-0 h-2 w-2 rounded-full bg-warning" style={{ left: `${pos}%` }} />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">4:00 PM</span>
          </div>
        </div>

        {/* Assessment Scores */}
        <div className="grid grid-cols-6 gap-3">
          {scores.map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-surface-2 p-4 text-center">
              <div className={cn("text-2xl font-bold", s.color)}>
                {s.value}<span className="text-sm text-muted-foreground">{s.suffix}</span>
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* What happened vs What we did */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <h3 className="text-sm font-semibold mb-3">What Happened</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• NQ gapped up 0.4% at open, swept overnight low at 21,420 by 9:42</p>
              <p>• ES followed with a weaker structure, struggled at VWAP</p>
              <p>• CL broke below hourly support at 74.50 with strong selling</p>
              <p>• CPI data rumors caused pre-release volatility at 10:30</p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-4">
            <h3 className="text-sm font-semibold mb-3">What We Did</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Took 7 trades: 5 wins, 2 stops. Net +$1,455</p>
              <p>• Best trade: GC long at 2,632.40 → +$790 (VWAP reclaim)</p>
              <p>• Worst trade: ES short at 5,848.50 → -$165 (ORB false break)</p>
              <p>• Reduced size before CPI window per risk rules</p>
            </div>
          </div>
        </div>

        {/* Lessons */}
        <div className="rounded-lg border border-border bg-surface-2 p-4">
          <h3 className="text-sm font-semibold mb-3">Lessons for Next Session</h3>
          <div className="space-y-2">
            {lessons.map((l, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded bg-primary/10 text-[9px] text-primary font-bold">{i + 1}</span>
                <span>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
