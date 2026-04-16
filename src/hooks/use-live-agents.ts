import { useEffect, useMemo, useState } from "react";
import { agents as fallbackAgents, type AgentData } from "@/data/placeholder";
import { getClientEnv } from "@/lib/config/client-env";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

type AgentStatusColumn = AgentData["column"];
type AgentStatus = AgentData["status"];

interface AgentStatusEventRow {
  agent_id: string;
  status: AgentStatus | "idle";
  current_task: string;
  priority: AgentData["priority"];
  confidence: number | null;
  occurred_at: string;
}

const statusToColumnMap: Record<AgentStatusEventRow["status"], AgentStatusColumn> = {
  watching: "Watching",
  analyzing: "Analyzing",
  waiting: "Waiting",
  acting: "Acting",
  review: "Review",
  idle: "Waiting",
};

const agentIdMap: Record<string, AgentData["id"]> = {
  market_watch: "a1",
  setup_scout: "a2",
  news_desk: "a3",
  risk_manager: "a4",
  execution_desk: "a5",
  journal_desk: "a6",
  coach: "a7",
  strategy_analyst: "a8",
};

function formatRelativeTime(isoTs: string) {
  const eventTs = new Date(isoTs).getTime();
  if (!Number.isFinite(eventTs)) {
    return "just now";
  }

  const elapsedSec = Math.max(0, Math.floor((Date.now() - eventTs) / 1000));
  if (elapsedSec < 60) {
    return `${elapsedSec}s ago`;
  }
  if (elapsedSec < 3600) {
    return `${Math.floor(elapsedSec / 60)}m ago`;
  }

  return `${Math.floor(elapsedSec / 3600)}h ago`;
}

function mergeAgentEvent(existing: AgentData, row: AgentStatusEventRow): AgentData {
  const normalizedStatus: AgentData["status"] = row.status === "idle" ? "waiting" : row.status;
  return {
    ...existing,
    status: normalizedStatus,
    column: statusToColumnMap[row.status],
    task: row.current_task,
    priority: row.priority,
    confidence: row.confidence ?? undefined,
    lastUpdate: formatRelativeTime(row.occurred_at),
  };
}

export function useLiveAgents() {
  const [data, setData] = useState<AgentData[]>(fallbackAgents);
  const [connected, setConnected] = useState(false);
  const [source, setSource] = useState<"placeholder" | "supabase">("placeholder");

  const workspaceId = useMemo(() => getClientEnv().VITE_DEFAULT_WORKSPACE_ID, []);

  useEffect(() => {
    if (!isSupabaseConfigured() || !workspaceId) {
      setConnected(false);
      setSource("placeholder");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setConnected(false);
      setSource("placeholder");
      return;
    }

    let disposed = false;

    const bootstrap = async () => {
      const { data: rows } = await supabase
        .from("agent_status_events")
        .select("agent_id,status,current_task,priority,confidence,occurred_at")
        .eq("workspace_id", workspaceId)
        .order("occurred_at", { ascending: false })
        .limit(40);

      if (disposed || !rows?.length) {
        return;
      }

      setData((current) => {
        const next = [...current];

        for (const rawRow of rows.reverse()) {
          const row = rawRow as AgentStatusEventRow;
          const mappedId = agentIdMap[row.agent_id];
          if (!mappedId) {
            continue;
          }

          const index = next.findIndex((agent) => agent.id === mappedId);
          if (index < 0) {
            continue;
          }

          next[index] = mergeAgentEvent(next[index], row);
        }

        return next;
      });
    };

    bootstrap();

    const channel = supabase
      .channel(`agent-status-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "agent_status_events",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          const row = payload.new as AgentStatusEventRow | undefined;
          if (!row?.agent_id) {
            return;
          }

          const mappedId = agentIdMap[row.agent_id];
          if (!mappedId) {
            return;
          }

          setData((current) =>
            current.map((agent) => {
              if (agent.id !== mappedId) {
                return agent;
              }

              return mergeAgentEvent(agent, row);
            }),
          );
          setSource("supabase");
        },
      )
      .subscribe((status) => {
        setConnected(status === "SUBSCRIBED");
      });

    return () => {
      disposed = true;
      setConnected(false);
      supabase.removeChannel(channel);
    };
  }, [workspaceId]);

  return {
    agents: data,
    connected,
    source,
  };
}
