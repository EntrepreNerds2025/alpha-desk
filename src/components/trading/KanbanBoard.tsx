import { agents, type AgentData } from "@/data/placeholder";
import { StatusChip, PriorityBadge } from "@/components/trading/StatusChip";
import {
  Eye, Search, Newspaper, Shield, Zap, BookOpen, GraduationCap, BarChart3
} from "lucide-react";
import { cn } from "@/lib/utils";

const agentIcons: Record<string, React.ElementType> = {
  Eye, Search, Newspaper, Shield, Zap, BookOpen, GraduationCap, BarChart3,
};

const columns = ["Watching", "Analyzing", "Waiting", "Acting", "Review"] as const;

function AgentCard({ agent }: { agent: AgentData }) {
  const Icon = agentIcons[agent.icon] || Eye;

  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3 hover:bg-surface-3 transition-colors cursor-pointer group">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">{agent.name}</div>
            <PriorityBadge priority={agent.priority} />
          </div>
        </div>
        <StatusChip status={agent.status} />
      </div>
      <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">{agent.task}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{agent.lastUpdate}</span>
        <div className="flex items-center gap-2">
          {agent.confidence !== undefined && (
            <div className="flex items-center gap-1">
              <div className="h-1 w-8 rounded-full bg-surface-3 overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${agent.confidence}%` }} />
              </div>
              <span className="text-[10px] text-muted-foreground">{agent.confidence}%</span>
            </div>
          )}
          <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">{agent.provider}</span>
          <span className="text-[10px] text-muted-foreground">{agent.cost}</span>
        </div>
      </div>
    </div>
  );
}

export function KanbanBoard() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
      {columns.map((col) => {
        const colAgents = agents.filter((a) => a.column === col);
        return (
          <div key={col} className="min-w-[220px] flex-1">
            <div className="flex items-center gap-2 mb-2 px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{col}</span>
              <span className="flex h-4 w-4 items-center justify-center rounded bg-surface-3 text-[10px] text-muted-foreground">
                {colAgents.length}
              </span>
            </div>
            <div className="space-y-2">
              {colAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
