import { useLiveSetupBoard } from "@/hooks/use-live-setup-board";
import { cn } from "@/lib/utils";

export function SetupBoard() {
  const { cards, connected, source } = useLiveSetupBoard();

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 px-1">
        <span className="rounded bg-surface-3 px-2 py-0.5 text-[10px] text-muted-foreground">
          Source: {source === "supabase" ? "Supabase Realtime" : "Placeholder"}
        </span>
        <span className={`text-[10px] ${connected ? "text-success" : "text-muted-foreground"}`}>
          {connected ? "Realtime connected" : "Realtime idle"}
        </span>
      </div>
      <div className="scrollbar-thin flex gap-3 overflow-x-auto p-1">
        {cards.map((setup) => {
          const metCount = setup.conditions.filter((condition) => condition.met).length;
          return (
            <div
              key={setup.id}
              className="min-w-[240px] rounded-lg border border-border bg-surface-2 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">{setup.name}</span>
                <span className="text-price text-[10px] text-muted-foreground">
                  {metCount}/{setup.conditions.length}
                </span>
              </div>
              <div className="mb-3 space-y-1.5">
                {setup.conditions.map((condition) => (
                  <div key={condition.label} className="flex items-center gap-2 text-xs">
                    <span
                      className={cn(
                        "flex h-3.5 w-3.5 items-center justify-center rounded text-[8px]",
                        condition.met
                          ? "bg-success/20 text-success"
                          : "bg-surface-3 text-muted-foreground",
                      )}
                    >
                      {condition.met ? "OK" : "..."}
                    </span>
                    <span className={condition.met ? "text-foreground" : "text-muted-foreground"}>
                      {condition.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      setup.confidence >= 60 ? "bg-primary" : "bg-muted-foreground",
                    )}
                    style={{ width: `${setup.confidence}%` }}
                  />
                </div>
                <span className="text-price text-[10px]">{setup.confidence}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
