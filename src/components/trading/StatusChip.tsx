import { cn } from "@/lib/utils";

type StatusType = "watching" | "analyzing" | "waiting" | "acting" | "review";

const statusStyles: Record<StatusType, string> = {
  watching: "bg-primary/10 text-primary",
  analyzing: "bg-info/10 text-info",
  waiting: "bg-warning/10 text-warning",
  acting: "bg-success/10 text-success",
  review: "bg-muted text-muted-foreground",
};

export function StatusChip({ status, className }: { status: StatusType; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium capitalize",
        statusStyles[status],
        status === "watching" && "animate-pulse-glow",
        className
      )}
    >
      {status === "watching" && (
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
      )}
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: "low" | "normal" | "high" | "critical" }) {
  const styles = {
    low: "text-muted-foreground",
    normal: "text-foreground",
    high: "text-warning",
    critical: "text-danger",
  };
  return (
    <span className={cn("text-[10px] font-medium uppercase tracking-wider", styles[priority])}>
      {priority}
    </span>
  );
}

export function PnlDisplay({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("text-price", value >= 0 ? "text-positive" : "text-negative", className)}>
      {value >= 0 ? "+" : ""}{value < 0 ? "-" : ""}${Math.abs(value).toLocaleString()}
    </span>
  );
}

export function ModeIndicator({ mode }: { mode: string }) {
  if (mode === "Auto Paper" || mode === "Auto Live") {
    const color = mode === "Auto Paper" ? "bg-warning/15 text-warning border-warning/30" : "bg-danger/15 text-danger border-danger/30";
    return (
      <span className={cn("fixed top-16 right-4 z-50 rounded-md border px-3 py-1 text-xs font-bold uppercase tracking-wider", color)}>
        {mode === "Auto Paper" ? "PAPER MODE" : "LIVE MODE"}
      </span>
    );
  }
  return null;
}
