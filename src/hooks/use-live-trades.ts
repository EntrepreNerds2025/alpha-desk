import { useEffect, useMemo, useState } from "react";
import { trades as fallbackTrades, type TradeEntry } from "@/data/placeholder";
import { getClientEnv } from "@/lib/config/client-env";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";

interface TradeRow {
  id: string;
  symbol: string;
  side: "long" | "short";
  entry_time: string;
  entry_price: number;
  stop_price: number;
  target_price: number;
  size: number;
  pnl_dollars: number | null;
  status: "open" | "closed" | "cancelled" | "partially_filled";
  notes: string | null;
  exit_reason: string | null;
}

function formatTimeLabel(isoTs: string) {
  const date = new Date(isoTs);
  if (!Number.isFinite(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

function mapTradeStatus(status: TradeRow["status"], pnl: number | null): TradeEntry["status"] {
  if (status === "cancelled") {
    return "Cancelled";
  }
  if (status === "open" || status === "partially_filled") {
    return "Open";
  }
  if (status === "closed" && (pnl ?? 0) < 0) {
    return "Stopped";
  }

  return "Filled";
}

function mapRowToTrade(row: TradeRow): TradeEntry {
  return {
    id: row.id,
    time: formatTimeLabel(row.entry_time),
    symbol: row.symbol,
    side: row.side === "long" ? "Long" : "Short",
    entry: row.entry_price,
    stop: row.stop_price,
    target: row.target_price,
    size: row.size,
    pnl: row.pnl_dollars ?? 0,
    status: mapTradeStatus(row.status, row.pnl_dollars),
    strategy: row.notes?.trim() || "Rule-Based",
    confidence: 0,
    reason: row.exit_reason ?? "Execution lifecycle update",
  };
}

export function useLiveTrades() {
  const [items, setItems] = useState<TradeEntry[]>(fallbackTrades);
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
        .from("trades")
        .select(
          "id,symbol,side,entry_time,entry_price,stop_price,target_price,size,pnl_dollars,status,notes,exit_reason",
        )
        .eq("workspace_id", workspaceId)
        .order("entry_time", { ascending: false })
        .limit(50);

      if (disposed || !data?.length) {
        return;
      }

      setItems((data as TradeRow[]).map(mapRowToTrade));
      setSource("supabase");
    };

    load();

    const channel = supabase
      .channel(`trade-log-${workspaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "trades",
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => {
          const row = payload.new as TradeRow | undefined;
          if (!row?.id) {
            return;
          }

          const mapped = mapRowToTrade(row);
          setItems((current) => {
            const without = current.filter((trade) => trade.id !== mapped.id);
            return [mapped, ...without].slice(0, 50);
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
    trades: items,
    connected,
    source,
  };
}
