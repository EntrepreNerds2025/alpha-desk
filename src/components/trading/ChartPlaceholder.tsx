import { candleData } from "@/data/placeholder";
import { cn } from "@/lib/utils";

export function ChartPlaceholder() {
  const maxHigh = Math.max(...candleData.map((c) => c.high));
  const minLow = Math.min(...candleData.map((c) => c.low));
  const range = maxHigh - minLow;

  const toY = (price: number) => ((maxHigh - price) / range) * 280;
  const barWidth = 8;
  const gap = 2;

  return (
    <div className="relative h-full w-full rounded-lg border border-border bg-surface-2 overflow-hidden">
      {/* Shimmer overlay */}
      <div className="absolute inset-0 animate-shimmer opacity-5 pointer-events-none" />

      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        {[0.2, 0.4, 0.6, 0.8].map((pct) => (
          <line
            key={pct}
            x1="0"
            y1={`${pct * 100}%`}
            x2="100%"
            y2={`${pct * 100}%`}
            stroke="var(--border)"
            strokeWidth="0.5"
            strokeDasharray="4 4"
          />
        ))}
      </svg>

      {/* Candlesticks */}
      <svg
        viewBox={`0 0 ${candleData.length * (barWidth + gap)} 300`}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        {candleData.map((c, i) => {
          const x = i * (barWidth + gap);
          const bullish = c.close >= c.open;
          const bodyTop = toY(Math.max(c.open, c.close));
          const bodyHeight = Math.max(1, Math.abs(toY(c.open) - toY(c.close)));
          const color = bullish ? "var(--success)" : "var(--danger)";

          return (
            <g key={i}>
              {/* Wick */}
              <line
                x1={x + barWidth / 2}
                y1={toY(c.high) + 10}
                x2={x + barWidth / 2}
                y2={toY(c.low) + 10}
                stroke={color}
                strokeWidth="1"
              />
              {/* Body */}
              <rect
                x={x}
                y={bodyTop + 10}
                width={barWidth}
                height={bodyHeight}
                fill={bullish ? color : color}
                opacity={bullish ? 0.9 : 0.9}
                rx="0.5"
              />
            </g>
          );
        })}
      </svg>

      {/* Price axis labels */}
      <div className="absolute right-2 top-0 bottom-0 flex flex-col justify-between py-4 pointer-events-none">
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <span key={pct} className="text-price text-[10px] text-muted-foreground">
            {(maxHigh - pct * range).toFixed(2)}
          </span>
        ))}
      </div>

      {/* Setup overlay chip */}
      <div className="absolute top-3 right-14 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-glow" />
        <span className="text-[11px] font-medium text-primary">
          Setup: Sweep Long Forming · 2/4 conditions · 62%
        </span>
      </div>

      {/* Symbol + timeframe label */}
      <div className="absolute top-3 left-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground/60">NQ</span>
        <span className="text-xs text-muted-foreground">1m</span>
        <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[10px] text-muted-foreground">TradingView</span>
      </div>

      {/* VWAP line (approximate) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
        <line
          x1="0"
          y1={`${((maxHigh - 21465) / range) * 100}%`}
          x2="100%"
          y2={`${((maxHigh - 21465) / range) * 100}%`}
          stroke="var(--info)"
          strokeWidth="1"
          strokeDasharray="6 3"
          opacity="0.4"
        />
      </svg>
      <div className="absolute left-2 text-[9px] text-info/60" style={{ top: `${((maxHigh - 21465) / range) * 100}%` }}>
        VWAP 21,465
      </div>
    </div>
  );
}
