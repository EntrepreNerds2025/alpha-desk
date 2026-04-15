import { useState } from "react";
import { Send, Bot, User, Lightbulb, AlertTriangle, TrendingUp } from "lucide-react";
import { chatMessages, quickActions, marketNarrative, suggestedActions } from "@/data/placeholder";
import { cn } from "@/lib/utils";

export function RightSidebar({ collapsed }: { collapsed: boolean }) {
  const [message, setMessage] = useState("");

  if (collapsed) return null;

  return (
    <aside className="flex h-full w-[360px] flex-col border-l border-border bg-surface-1">
      {/* AI Chat */}
      <div className="flex flex-1 flex-col" style={{ maxHeight: "50%" }}>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Desk Assistant</span>
          </div>
          <span className="flex items-center gap-1 text-[10px] text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Online
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
          {chatMessages.map((msg, i) => (
            <div key={i} className={cn("flex gap-2", msg.role === "user" && "justify-end")}>
              {msg.role === "ai" && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Bot className="h-3 w-3 text-primary" />
                </div>
              )}
              <div className={cn(
                "rounded-lg px-3 py-2 text-xs leading-relaxed max-w-[85%]",
                msg.role === "ai" ? "bg-surface-2 text-foreground" : "bg-primary/15 text-foreground"
              )}>
                {msg.text}
              </div>
              {msg.role === "user" && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-3">
                  <User className="h-3 w-3 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-border p-3">
          <div className="flex flex-wrap gap-1.5 mb-2">
            {quickActions.map((a) => (
              <button key={a} className="rounded-md bg-surface-2 px-2 py-1 text-[10px] text-muted-foreground hover:bg-surface-3 hover:text-foreground transition-colors">
                {a}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask the desk..."
              className="flex-1 rounded-md bg-surface-2 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
            />
            <button className="rounded-md bg-primary p-1.5 text-primary-foreground hover:bg-primary/90 transition-colors">
              <Send className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Market Narrative */}
      <div className="border-t border-border" style={{ maxHeight: "25%" }}>
        <div className="px-4 py-2.5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider">Right Now</span>
          </div>
          <div className="space-y-1.5">
            {marketNarrative.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested Actions */}
      <div className="border-t border-border flex-1 overflow-y-auto scrollbar-thin">
        <div className="px-4 py-2.5">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-3.5 w-3.5 text-warning" />
            <span className="text-xs font-semibold uppercase tracking-wider">Suggested</span>
          </div>
          <div className="space-y-2">
            {suggestedActions.map((action, i) => {
              const Icon = action.urgency === "warning" ? AlertTriangle : action.urgency === "info" ? Bot : TrendingUp;
              const color = action.urgency === "warning" ? "border-warning/30" : action.urgency === "info" ? "border-info/30" : "border-success/30";
              return (
                <div key={i} className={cn("rounded-lg border bg-surface-2 p-3", color)}>
                  <div className="flex items-start gap-2">
                    <Icon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0",
                      action.urgency === "warning" ? "text-warning" : action.urgency === "info" ? "text-info" : "text-success"
                    )} />
                    <div>
                      <div className="text-xs font-medium text-foreground">{action.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{action.detail}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}
