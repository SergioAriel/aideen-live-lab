import React from "react";
import { useRunStore } from "../state/useRunStore";
import { fmt } from "../utils/format";
import { Tooltip } from "./Tooltip";
import { fullValLoss } from "../utils/runMetrics";

export function RunList() {
  const runs = useRunStore((s) => s.runs);
  const selectedRunId = useRunStore((s) => s.selectedRunId);
  const selectedRunIds = useRunStore((s) => s.selectedRunIds);
  const selectRun = useRunStore((s) => s.selectRun);
  const toggleRunSelection = useRunStore((s) => s.toggleRunSelection);
  const deleteRun = useRunStore((s) => s.deleteRun);

  if (runs.length === 0) {
    return (
      <div className="panel">
        <h3 className="panel-title">Runs</h3>
        <p className="text-muted">No runs loaded yet.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h3 className="panel-title">Runs ({runs.length})</h3>
      <div className="run-list">
        {runs.map((run) => (
          <div
            key={run.id}
            className={`run-item ${
              selectedRunId === run.id ? "run-item-selected" : ""
            }`}
          >
            <label className="run-checkbox-label">
              <input
                type="checkbox"
                checked={selectedRunIds.includes(run.id)}
                onChange={() => toggleRunSelection(run.id)}
                className="run-checkbox"
              />
            </label>
            <div
              className="run-item-content"
              onClick={() => selectRun(run.id)}
            >
              <span className="run-name">{run.display_name}</span>
              <span className="run-metrics">
                <Tooltip varKey="final_val_loss">
                  <span>fullval={fmt(fullValLoss(run))}</span>
                </Tooltip>{" "}
                <Tooltip varKey="utility_avg">
                  <span>util={fmt(run.fpm_pipeline_scores.utility_avg)}</span>
                </Tooltip>
              </span>
            </div>
            <button
              className="btn-delete"
              onClick={(e) => {
                e.stopPropagation();
                deleteRun(run.id);
              }}
              title="Delete run"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
