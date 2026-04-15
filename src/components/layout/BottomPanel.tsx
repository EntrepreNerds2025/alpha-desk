import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { TradeLog } from "@/components/trading/TradeLog";
import { SetupBoard } from "@/components/trading/SetupBoard";
import { cn } from "@/lib/utils";

const tabs = ["Trade Log", "Setup Board", "News Timeline", "Risk Panel", "Journal", "Agent Audit", "Cost Monitor"] as const;

export function BottomPanel() {
  const [activeTab, setActiveTab] = useState<string>("Trade Log");
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={cn("border-t border-border bg-surface-1 transition-all", collapsed ? "h-10" : "h-[280px]")}>
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-border px-2">
        <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-thin">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setCollapsed(false); }}
              className={cn(
                "whitespace-nowrap px-3 py-2.5 text-xs font-medium transition-colors",
                activeTab === tab
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="h-[calc(100%-38px)] overflow-y-auto scrollbar-thin">
          {activeTab === "Trade Log" && <TradeLog />}
          {activeTab === "Setup Board" && <SetupBoard />}
          {activeTab !== "Trade Log" && activeTab !== "Setup Board" && (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              {activeTab} — Coming soon
            </div>
          )}
        </div>
      )}
    </div>
  );
}
