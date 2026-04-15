import { useState } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { LeftSidebar } from "@/components/layout/LeftSidebar";
import { BottomPanel } from "@/components/layout/BottomPanel";
import { Wifi, Monitor, Bot, Cpu } from "lucide-react";

export function AppLayout({ children, rightSidebar }: { children: React.ReactNode; rightSidebar?: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 overflow-y-auto scrollbar-thin">
              {children}
            </main>
            {rightSidebar}
          </div>
          <BottomPanel />
        </div>
      </div>
      {/* Status Bar */}
      <div className="flex h-6 items-center justify-between border-t border-border bg-surface-1 px-4">
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Monitor className="h-2.5 w-2.5" />
            TradingView: <span className="text-success">Connected</span>
          </span>
          <span className="flex items-center gap-1">
            <Wifi className="h-2.5 w-2.5" />
            Broker: <span className="text-warning">Paper (Tradovate)</span>
          </span>
          <span className="flex items-center gap-1">
            <Bot className="h-2.5 w-2.5" />
            AI: <span className="text-success">OpenAI+Anthropic</span>
          </span>
          <span className="flex items-center gap-1">
            <Cpu className="h-2.5 w-2.5" />
            Worker: <span className="text-success">Online</span>
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">v0.1.0-alpha</span>
      </div>
    </div>
  );
}
