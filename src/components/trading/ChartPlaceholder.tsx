import { useEffect, useId, useRef, useState } from "react";

declare global {
  interface Window {
    TradingView?: {
      widget: (config: Record<string, unknown>) => void;
    };
  }
}

const tradingViewScriptSrc = "https://s3.tradingview.com/tv.js";

function ensureTradingViewScript() {
  return new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") {
      resolve();
      return;
    }

    if (window.TradingView?.widget) {
      resolve();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${tradingViewScriptSrc}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Failed to load TradingView script")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = tradingViewScriptSrc;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load TradingView script"));
    document.head.appendChild(script);
  });
}

export function ChartPlaceholder() {
  const [chartState, setChartState] = useState<"loading" | "ready" | "error">("loading");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetId = useId().replace(/:/g, "");

  useEffect(() => {
    let disposed = false;

    const initialize = async () => {
      try {
        await ensureTradingViewScript();
        if (disposed || !containerRef.current || !window.TradingView?.widget) {
          return;
        }

        containerRef.current.id = `tv-chart-${widgetId}`;

        window.TradingView.widget({
          container_id: containerRef.current.id,
          symbol: "CME_MINI:NQ1!",
          interval: "1",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#121418",
          enable_publishing: false,
          hide_top_toolbar: false,
          save_image: false,
          studies: ["VWAP@tv-basicstudies", "Volume@tv-basicstudies"],
          width: "100%",
          height: "100%",
        });

        setChartState("ready");
      } catch {
        if (!disposed) {
          setChartState("error");
        }
      }
    };

    initialize();

    return () => {
      disposed = true;
    };
  }, [widgetId]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-border bg-surface-2">
      <div ref={containerRef} className="absolute inset-0" />

      {chartState === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-2/80 text-xs text-muted-foreground">
          Loading TradingView chart...
        </div>
      )}

      {chartState === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-2/80 text-xs text-warning">
          TradingView failed to load. Check browser network/script policies.
        </div>
      )}

      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2">
        <span className="text-sm font-semibold text-foreground/70">NQ</span>
        <span className="text-xs text-muted-foreground">1m</span>
        <span className="rounded bg-surface-3 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          TradingView
        </span>
      </div>

      <div className="pointer-events-none absolute right-14 top-3 flex items-center gap-2 rounded-md border border-primary/30 bg-primary/10 px-3 py-1.5 backdrop-blur-sm">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
        <span className="text-[11px] font-medium text-primary">
          Setup: Sweep Long Forming - 2/4 conditions - 62%
        </span>
      </div>
    </div>
  );
}
