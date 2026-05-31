import React from "react";
import { useRunStore } from "../state/useRunStore";
import * as api from "../api";
import type { AideenRunMetrics } from "../types/metrics";
import { FpmPipelinePanel } from "./FpmPipelinePanel";
import { SignalFlowPanel } from "./SignalFlowPanel";
import { UtilityAlignmentPanel } from "./UtilityAlignmentPanel";
import { PreDeqPanel } from "./PreDeqPanel";
import { RawJsonPanel } from "./RawJsonPanel";
import { RawTextPanel } from "./RawTextPanel";

export function RunDetail() {
  const selectedRunId = useRunStore((s) => s.selectedRunId);
  const watchedRun = useRunStore((s) => s.watchedRun);
  const [run, setRun] = React.useState<AideenRunMetrics | null>(null);
  const [loading, setLoading] = React.useState(false);

  // If there's a watched run selected, use it directly (no DB loading needed)
  const isWatched = watchedRun !== null && watchedRun.run.id === selectedRunId;

  React.useEffect(() => {
    if (!selectedRunId || isWatched) {
      if (!isWatched) setRun(null);
      return;
    }
    setLoading(true);
    api
      .loadRunDetail(selectedRunId)
      .then((r) => setRun(r))
      .catch(() => setRun(null))
      .finally(() => setLoading(false));
  }, [selectedRunId, isWatched]);

  // Use watched run data directly if it's the selected run
  const displayRun = isWatched ? watchedRun.run : run;

  if (!selectedRunId) return null;
  if (loading) return <div className="panel"><p className="text-muted">Loading run details...</p></div>;
  if (!displayRun) return <div className="panel"><p className="text-muted">Run not found.</p></div>;

  return (
    <div className="run-detail">
      <h2 className="run-detail-title">
        {displayRun.display_name}
        {isWatched && <span className="live-badge">LIVE</span>}
      </h2>
      {isWatched && (
        <p className="text-muted">
          Watching file: {watchedRun.path} | Lines: {watchedRun.totalLines} | Steps: {displayRun.points.length}
        </p>
      )}
      <FpmPipelinePanel run={displayRun} />
      <SignalFlowPanel run={displayRun} />
      <UtilityAlignmentPanel run={displayRun} />
      <PreDeqPanel run={displayRun} />
      <RawJsonPanel run={displayRun} />
      <RawTextPanel run={displayRun} />
    </div>
  );
}
