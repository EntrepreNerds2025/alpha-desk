import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { ChartPlaceholder } from "@/components/trading/ChartPlaceholder";
import { KanbanBoard } from "@/components/trading/KanbanBoard";

export const Route = createFileRoute("/desk")({
  head: () => ({
    meta: [
      { title: "Trading Desk — AI Trading Office" },
      { name: "description", content: "Professional futures trading cockpit with AI-powered analysis" },
    ],
  }),
  component: DeskPage,
});

function DeskPage() {
  return (
    <AppLayout rightSidebar={<RightSidebar collapsed={false} />}>
      <div className="flex h-full flex-col p-3 gap-3">
        {/* Chart Area */}
        <div className="flex-[6] min-h-0">
          <ChartPlaceholder />
        </div>

        {/* Kanban Board */}
        <div className="flex-[4] min-h-0">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              AI Trading Office — Agent Board
            </h2>
            <span className="text-[10px] text-muted-foreground">8 agents · 6 active · $0.86 today</span>
          </div>
          <KanbanBoard />
        </div>
      </div>
    </AppLayout>
  );
}
