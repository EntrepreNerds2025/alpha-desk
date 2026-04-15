import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard, PlayCircle, FlaskConical, BookOpen, Shield, Settings,
  Eye, TrendingUp, TrendingDown, ChevronDown, ChevronRight, Clock
} from "lucide-react";
import { symbols, economicEvents } from "@/data/placeholder";
import { PnlDisplay } from "@/components/trading/StatusChip";
import { cn } from "@/lib/utils";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const navIcons: Record<string, React.ElementType> = {
  LayoutDashboard, PlayCircle, FlaskConical, BookOpen, Shield, Settings,
};

const navItems = [
  { name: "Trading Desk", icon: "LayoutDashboard", path: "/desk" },
  { name: "Replay", icon: "PlayCircle", path: "/replay" },
  { name: "Strategy Lab", icon: "FlaskConical", path: "/strategy-lab" },
  { name: "Journal", icon: "BookOpen", path: "/journal" },
  { name: "Risk", icon: "Shield", path: "/risk" },
  { name: "Settings", icon: "Settings", path: "/settings" },
];

export function LeftSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const [watchlistOpen, setWatchlistOpen] = useState(true);
  const [eventsOpen, setEventsOpen] = useState(true);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-surface-1 transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Navigation */}
      <nav className="flex flex-col gap-0.5 p-2">
        {navItems.map((item) => {
          const Icon = navIcons[item.icon];
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary border-l-2 border-primary"
                  : "text-muted-foreground hover:bg-surface-3 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Watchlist */}
          <div className="border-t border-border px-3 py-2">
            <button
              onClick={() => setWatchlistOpen(!watchlistOpen)}
              className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Watchlist
              {watchlistOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
            {watchlistOpen && (
              <div className="mt-2 space-y-1">
                {symbols.slice(0, 6).map((s) => (
                  <div key={s.symbol} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-surface-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-foreground">{s.symbol}</span>
                      <div className="h-4 w-12">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={s.sparkline.map((v, i) => ({ v, i }))}>
                            <Line
                              type="monotone"
                              dataKey="v"
                              stroke={s.change >= 0 ? "var(--success)" : "var(--danger)"}
                              strokeWidth={1}
                              dot={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-price text-xs">{s.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                      <div className={cn("text-[10px] font-medium", s.change >= 0 ? "text-positive" : "text-negative")}>
                        {s.change >= 0 ? "+" : ""}{s.changePct.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Market Sessions */}
          <div className="border-t border-border px-3 py-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Sessions</div>
            <div className="flex gap-1.5">
              {(["Tokyo", "London", "NY"] as const).map((session, i) => (
                <span
                  key={session}
                  className={cn(
                    "rounded-md px-2 py-1 text-[10px] font-medium",
                    i === 2 ? "bg-success/10 text-success" : "bg-surface-3 text-muted-foreground"
                  )}
                >
                  {session}
                </span>
              ))}
            </div>
          </div>

          {/* Economic Events */}
          <div className="border-t border-border px-3 py-2">
            <button
              onClick={() => setEventsOpen(!eventsOpen)}
              className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Events
              {eventsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            </button>
            {eventsOpen && (
              <div className="mt-2 space-y-1.5">
                {economicEvents.map((ev) => (
                  <div key={ev.name} className="flex items-center justify-between rounded-md px-2 py-1.5 bg-surface-2">
                    <div>
                      <div className="text-xs font-medium text-foreground">{ev.name}</div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-2.5 w-2.5" />
                        {ev.countdown}
                      </div>
                    </div>
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-bold",
                      ev.impact === "HIGH" ? "bg-danger/10 text-danger" : "bg-warning/10 text-warning"
                    )}>
                      {ev.impact}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Risk Mini Panel */}
          <div className="mt-auto border-t border-border px-3 py-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Today</div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">P&L</span>
                <PnlDisplay value={1455} className="text-xs" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Trades</span>
                <span className="text-price">7</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Max Loss Left</span>
                <span className="text-price text-warning">$580</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Bot</span>
                <span className="flex items-center gap-1 text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" />
                  Online
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
