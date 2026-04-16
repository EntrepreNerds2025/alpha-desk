import { useEffect, useMemo, useState } from "react";
import { getClientEnv } from "@/lib/config/client-env";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

export interface SetupConditionView {
  label: string;
  met: boolean;
}

export interface SetupBoardCard {
  id: string;
  name: string;
  conditions: SetupConditionView[];
  confidence: number;
}

const fallbackSetups: SetupBoardCard[] = [
  {
    id: "fallback-sweep-long-nq",
    name: "Sweep Long on NQ",
    conditions: [
      { label: "Overnight low swept", met: true },
      { label: "Volume spike > 1.5x avg", met: true },
      { label: "Reclaim candle (5m close inside)", met: false },
      { label: "Bid absorption on tape", met: false },
    ],
    confidence: 62,
  },
  {
    id: "fallback-orb-es",
    name: "ORB Break on ES",
    conditions: [
      { label: "Opening range defined (9:30-9:45)", met: true },
      { label: "Break above ORB high", met: true },
      { label: "Volume confirmation", met: true },
      { label: "Hold above break level 2m", met: false },
    ],
    confidence: 74,
  },
  {
    id: "fallback-vwap-cl",
    name: "VWAP Reclaim on CL",
    conditions: [
      { label: "Price below VWAP", met: true },
      { label: "Reversal candle pattern", met: false },
      { label: "Volume on reclaim", met: false },
    ],
    confidence: 38,
  },
];

interface SetupCandidateRow {
  id: string;
  symbol: string;
  direction: "long" | "short";
  confidence: number;
  conditions_met: unknown;
  metadata: Record<string, unknown> | null;
  status: "forming" | "ready" | "invalidated" | "taken" | "skipped";
  first_detected_at: string;
}

function normalizeLabel(raw: string) {
  return raw
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function mapConditions(raw: unknown): SetupConditionView[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const shape = item as Record<string, unknown>;
      const fallbackId = typeof shape.condition_id === "string" ? shape.condition_id : "condition";
      const label =
        typeof shape.label === "string" && shape.label.trim().length > 0
          ? shape.label
          : normalizeLabel(fallbackId);
      const met = Boolean(shape.met);

      return { label, met };
    })
    .filter((value): value is SetupConditionView => value !== null);
}

function mapRowToCard(row: SetupCandidateRow): SetupBoardCard {
  const strategyName =
    typeof row.metadata?.strategy_name === "string" ? row.metadata.strategy_name : "Setup";

  const conditions = mapConditions(row.conditions_met);

  return {
    id: row.id,
    name: `${strategyName} ${row.direction.toUpperCase()} on ${row.symbol}`,
    conditions:
      conditions.length > 0 ? conditions : [{ label: "Signal context unavailable", met: false }],
    confidence: Math.max(0, Math.min(100, Math.round(row.confidence))),
  };
}

export function useLiveSetupBoard() {
  const [cards, setCards] = useState<SetupBoardCard[]>(fallbackSetups);
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

    const load = async () => {
      const { data } = await supabase
        .from("setup_candidates")
        .select("id,symbol,direction,confidence,conditions_met,metadata,status,first_detected_at")
        .eq("workspace_id", workspaceId)
        .neq("status", "invalidated")
        .order("first_detected_at", { ascending: false })
        .limit(6);

      if (disposed || !data?.length) {
        return;
      }

      setCards((data as SetupCandidateRow[]).map(mapRowToCard));
      setSource("supabase");
    };

    load();

    const channel = supabase
      .channel(`setup-board-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "setup_candidates",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          const row = payload.new as SetupCandidateRow | undefined;
          if (!row?.id || row.status === "invalidated") {
            return;
          }

          setCards((current) => {
            const mapped = mapRowToCard(row);
            const without = current.filter((card) => card.id !== row.id);
            return [mapped, ...without].slice(0, 6);
          });
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
    cards,
    connected,
    source,
  };
}
