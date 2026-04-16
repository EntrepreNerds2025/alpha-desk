import { type AgentData } from "@/data/placeholder";
import { useLiveAgents } from "@/hooks/use-live-agents";
import { StatusChip, PriorityBadge } from "@/components/trading/StatusChip";
import {
  Eye,
  Search,
  Newspaper,
  Shield,
  Zap,
  BookOpen,
  GraduationCap,
  BarChart3,
} from "lucide-react";

const agentIcons: Record<string, React.ElementType> = {
  Eye,
  Search,
  Newspaper,
  Shield,
  Zap,
  BookOpen,
  GraduationCap,
  BarChart3,
};

const columns = ["Watching", "Analyzing", "Waiting", "Acting", "Review"] as const;

function AgentCard({ agent }: { agent: AgentData }) {
  const Icon = agentIcons[agent.icon] || Eye;

  return (
    <div className="group cursor-pointer rounded-lg border border-border bg-surface-2 p-3 transition-colors hover:bg-surface-3">
      <div className="mb-2 flex items-start justify-between">
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
      <p className="mb-2 text-[11px] leading-relaxed text-muted-foreground">{agent.task}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{agent.lastUpdate}</span>
        <div className="flex items-center gap-2">
          {agent.confidence !== undefined && (
            <div className="flex items-center gap-1">
              <div className="h-1 w-8 overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${agent.confidence}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">{agent.confidence}%</span>
            </div>
          )}
          <span className="text-[10px] text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {agent.provider}
          </span>
          <span className="text-[10px] text-muted-foreground">{agent.cost}</span>
        </div>
      </div>
    </div>
  );
}

export function KanbanBoard() {
  const { agents, connected, source } = useLiveAgents();

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
      <div className="scrollbar-thin flex gap-3 overflow-x-auto pb-2">
        {columns.map((column) => {
          const colAgents = agents.filter((agent) => agent.column === column);
          return (
            <div key={column} className="min-w-[220px] flex-1">
              <div className="mb-2 flex items-center gap-2 px-1">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {column}
                </span>
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
    </div>
  );
}
