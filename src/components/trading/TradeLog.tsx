import { PnlDisplay } from "@/components/trading/StatusChip";
import { useLiveTrades } from "@/hooks/use-live-trades";
import { cn } from "@/lib/utils";

export function TradeLog() {
  const { trades, connected, source } = useLiveTrades();

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 px-2 pt-2">
        <span className="rounded bg-surface-3 px-2 py-0.5 text-[10px] text-muted-foreground">
          Source: {source === "supabase" ? "Supabase Realtime" : "Placeholder"}
        </span>
        <span className={`text-[10px] ${connected ? "text-success" : "text-muted-foreground"}`}>
          {connected ? "Realtime connected" : "Realtime idle"}
        </span>
      </div>
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border text-left">
              {[
                "Time",
                "Symbol",
                "Side",
                "Entry",
                "Stop",
                "Target",
                "Size",
                "P&L",
                "Status",
                "Strategy",
                "Conf",
                "Reason",
              ].map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr
                key={trade.id}
                className="border-b border-border/50 transition-colors hover:bg-surface-3"
              >
                <td className="whitespace-nowrap px-3 py-2 text-price">{trade.time}</td>
                <td className="px-3 py-2 font-semibold">{trade.symbol}</td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium",
                      trade.side === "Long"
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger",
                    )}
                  >
                    {trade.side}
                  </span>
                </td>
                <td className="px-3 py-2 text-right text-price">
                  {trade.entry.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-2 text-right text-price text-danger">
                  {trade.stop.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-2 text-right text-price text-success">
                  {trade.target.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="px-3 py-2 text-right text-price">{trade.size}</td>
                <td className="px-3 py-2 text-right">
                  <PnlDisplay value={trade.pnl} className="text-xs" />
                </td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-medium",
                      trade.status === "Filled"
                        ? "bg-success/10 text-success"
                        : trade.status === "Open"
                          ? "bg-primary/10 text-primary"
                          : trade.status === "Stopped"
                            ? "bg-danger/10 text-danger"
                            : "bg-muted text-muted-foreground",
                    )}
                  >
                    {trade.status}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2 text-muted-foreground">
                  {trade.strategy}
                </td>
                <td className="px-3 py-2 text-right text-price">
                  {trade.confidence > 0 ? `${trade.confidence}%` : "--"}
                </td>
                <td className="max-w-[220px] truncate px-3 py-2 text-muted-foreground">
                  {trade.reason}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
