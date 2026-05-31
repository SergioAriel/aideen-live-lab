import React from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { SummaryCards } from "./SummaryCards";
import { ComparisonTable } from "./ComparisonTable";
import { ChartsPanel } from "./ChartsPanel";
import { RunDetail } from "./RunDetail";
import { BarChartsPanel } from "./BarChartsPanel";
import { DashboardSummary } from "./DashboardSummary";
import { MultiRunChartsPanel } from "./MultiRunChartsPanel";
import { useRunStore } from "../state/useRunStore";
import * as api from "../api";
import type { AideenRunMetrics } from "../types/metrics";

export function AppShell() {
  const selectedRunId = useRunStore((s) => s.selectedRunId);
  const runs = useRunStore((s) => s.runs);
  const watchedRun = useRunStore((s) => s.watchedRun);
  const [detailRun, setDetailRun] = React.useState<AideenRunMetrics | null>(null);
  const [loading, setLoading] = React.useState(false);

  // Load run detail when a run is selected (for non-watched runs)
  const isWatched = watchedRun !== null && watchedRun.run.id === selectedRunId;

  React.useEffect(() => {
    if (!selectedRunId || isWatched) {
      if (!isWatched) setDetailRun(null);
      return;
    }
    setLoading(true);
    api
      .loadRunDetail(selectedRunId)
      .then((r) => setDetailRun(r))
      .catch(() => setDetailRun(null))
      .finally(() => setLoading(false));
  }, [selectedRunId, isWatched]);

  // Determine the run to display in summary/charts
  const displayRun = isWatched ? watchedRun!.run : detailRun;

  return (
    <div className="app-shell">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          {loading && <div className="panel"><p className="text-muted">Loading run details...</p></div>}
          <DashboardSummary />
          <BarChartsPanel />
          <MultiRunChartsPanel />
          <ComparisonTable />
          {displayRun && <SummaryCards run={displayRun} />}
          {displayRun && <ChartsPanel run={displayRun} />}
          {selectedRunId && <RunDetail />}
        </main>
      </div>
    </div>
  );
}
