import { trades } from "@/data/placeholder";
import { PnlDisplay } from "@/components/trading/StatusChip";
import { cn } from "@/lib/utils";

export function TradeLog() {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border text-left">
            {["Time", "Symbol", "Side", "Entry", "Stop", "Target", "Size", "P&L", "Status", "Strategy", "Conf", "Reason"].map((h) => (
              <th key={h} className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {trades.map((t) => (
            <tr key={t.id} className="border-b border-border/50 hover:bg-surface-3 transition-colors">
              <td className="px-3 py-2 text-price whitespace-nowrap">{t.time}</td>
              <td className="px-3 py-2 font-semibold">{t.symbol}</td>
              <td className="px-3 py-2">
                <span className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium",
                  t.side === "Long" ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
                )}>
                  {t.side}
                </span>
              </td>
              <td className="px-3 py-2 text-price text-right">{t.entry.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-3 py-2 text-price text-right text-danger">{t.stop.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-3 py-2 text-price text-right text-success">{t.target.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
              <td className="px-3 py-2 text-price text-right">{t.size}</td>
              <td className="px-3 py-2 text-right"><PnlDisplay value={t.pnl} className="text-xs" /></td>
              <td className="px-3 py-2">
                <span className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium",
                  t.status === "Filled" ? "bg-success/10 text-success" :
                  t.status === "Open" ? "bg-primary/10 text-primary" :
                  t.status === "Stopped" ? "bg-danger/10 text-danger" :
                  "bg-muted text-muted-foreground"
                )}>
                  {t.status}
                </span>
              </td>
              <td className="px-3 py-2 text-muted-foreground whitespace-nowrap">{t.strategy}</td>
              <td className="px-3 py-2 text-price text-right">{t.confidence}%</td>
              <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">{t.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
