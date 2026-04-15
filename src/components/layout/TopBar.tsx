import { useState } from "react";
import { Bell, ChevronDown, Lock, Octagon, User } from "lucide-react";
import { symbols, strategies, modes, type TradingMode } from "@/data/placeholder";
import { LiveClock } from "@/components/trading/LiveClock";
import { cn } from "@/lib/utils";

export function TopBar() {
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]);
  const [selectedStrategy, setSelectedStrategy] = useState(strategies[0]);
  const [mode, setMode] = useState<TradingMode>("Assist");
  const [symbolOpen, setSymbolOpen] = useState(false);
  const [strategyOpen, setStrategyOpen] = useState(false);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-surface-1 px-4">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
            <span className="text-xs font-bold text-primary-foreground">AI</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-foreground">Trading Office</span>
        </div>
      </div>

      {/* Center: Symbol + Strategy + Mode */}
      <div className="flex items-center gap-3">
        {/* Symbol Selector */}
        <div className="relative">
          <button
            onClick={() => { setSymbolOpen(!symbolOpen); setStrategyOpen(false); }}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm hover:bg-surface-3 transition-colors"
          >
            <span className="font-semibold text-foreground">{selectedSymbol.symbol}</span>
            <span className="text-price text-xs">{selectedSymbol.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            <span className={cn("text-xs font-medium", selectedSymbol.change >= 0 ? "text-positive" : "text-negative")}>
              {selectedSymbol.change >= 0 ? "+" : ""}{selectedSymbol.changePct.toFixed(2)}%
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {symbolOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-lg border border-border bg-surface-1 p-1 shadow-xl">
              {symbols.map((s) => (
                <button
                  key={s.symbol}
                  onClick={() => { setSelectedSymbol(s); setSymbolOpen(false); }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-surface-3",
                    s.symbol === selectedSymbol.symbol && "bg-primary/10"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{s.symbol}</span>
                    <span className="text-xs text-muted-foreground">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-price text-xs">{s.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    <span className={cn("text-xs", s.change >= 0 ? "text-positive" : "text-negative")}>
                      {s.change >= 0 ? "+" : ""}{s.changePct.toFixed(2)}%
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Strategy Selector */}
        <div className="relative">
          <button
            onClick={() => { setStrategyOpen(!strategyOpen); setSymbolOpen(false); }}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm hover:bg-surface-3 transition-colors"
          >
            <span className="text-muted-foreground text-xs">Strategy:</span>
            <span className="font-medium text-foreground">{selectedStrategy}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </button>
          {strategyOpen && (
            <div className="absolute top-full left-0 z-50 mt-1 w-48 rounded-lg border border-border bg-surface-1 p-1 shadow-xl">
              {strategies.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSelectedStrategy(s); setStrategyOpen(false); }}
                  className={cn(
                    "w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-3",
                    s === selectedStrategy && "bg-primary/10 text-primary"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center rounded-lg border border-border bg-surface-2 p-0.5">
          {modes.map((m) => {
            const active = m === mode;
            const isAutoLive = m === "Auto Live";
            const colorClass = active
              ? m === "Auto Paper" ? "bg-success/20 text-success" : m === "Auto Live" ? "bg-danger/20 text-danger" : "bg-primary/20 text-primary"
              : "text-muted-foreground hover:text-foreground";
            return (
              <button
                key={m}
                onClick={() => !isAutoLive && setMode(m)}
                disabled={isAutoLive}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  colorClass,
                  isAutoLive && "opacity-40 cursor-not-allowed"
                )}
              >
                {isAutoLive && <Lock className="h-2.5 w-2.5" />}
                {m}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Session + Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" />
          <span className="text-xs font-medium text-success">NY Open</span>
          <span className="text-xs text-muted-foreground">·</span>
          <LiveClock />
          <span className="text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">Active</span>
        </div>

        <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-surface-3 hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
        </button>

        <div className="h-7 w-7 rounded-full bg-surface-3 flex items-center justify-center">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        <button className="flex items-center gap-1.5 rounded-lg bg-danger px-3 py-1.5 text-xs font-bold text-danger-foreground hover:bg-danger/90 transition-colors">
          <Octagon className="h-3 w-3" />
          STOP ALL
        </button>
      </div>
    </header>
  );
}
