import { cn } from "@/lib/utils";

const setupConditions = [
  {
    name: "Sweep Long on NQ",
    conditions: [
      { label: "Overnight low swept", met: true },
      { label: "Volume spike > 1.5x avg", met: true },
      { label: "Reclaim candle (5m close inside)", met: false },
      { label: "Bid absorption on tape", met: false },
    ],
    confidence: 62,
  },
  {
    name: "ORB Break on ES",
    conditions: [
      { label: "Opening range defined (9:30-9:45)", met: true },
      { label: "Break above ORB high", met: true },
      { label: "Volume confirmation", met: true },
      { label: "Hold above break level 2m", met: false },
    ],
    confidence: 74,
  },
  {
    name: "VWAP Reclaim on CL",
    conditions: [
      { label: "Price below VWAP", met: true },
      { label: "Reversal candle pattern", met: false },
      { label: "Volume on reclaim", met: false },
    ],
    confidence: 38,
  },
];

export function SetupBoard() {
  return (
    <div className="flex gap-3 overflow-x-auto p-1 scrollbar-thin">
      {setupConditions.map((setup) => {
        const metCount = setup.conditions.filter((c) => c.met).length;
        return (
          <div key={setup.name} className="min-w-[240px] rounded-lg border border-border bg-surface-2 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-foreground">{setup.name}</span>
              <span className="text-price text-[10px] text-muted-foreground">
                {metCount}/{setup.conditions.length}
              </span>
            </div>
            <div className="space-y-1.5 mb-3">
              {setup.conditions.map((c) => (
                <div key={c.label} className="flex items-center gap-2 text-xs">
                  <span className={cn(
                    "flex h-3.5 w-3.5 items-center justify-center rounded text-[8px]",
                    c.met ? "bg-success/20 text-success" : "bg-surface-3 text-muted-foreground"
                  )}>
                    {c.met ? "✓" : "○"}
                  </span>
                  <span className={c.met ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-surface-3 overflow-hidden">
                <div
                  className={cn("h-full rounded-full", setup.confidence >= 60 ? "bg-primary" : "bg-muted-foreground")}
                  style={{ width: `${setup.confidence}%` }}
                />
              </div>
              <span className="text-price text-[10px]">{setup.confidence}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
