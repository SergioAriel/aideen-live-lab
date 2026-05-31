import React from "react";
import { LogImporter } from "./LogImporter";
import { PasteImporter } from "./PasteImporter";
import { RunList } from "./RunList";
import { ExportPanel } from "./ExportPanel";
import { FutureLiveControlsPanel } from "./FutureLiveControlsPanel";
import { useRunStore } from "../state/useRunStore";

export function Sidebar() {
  const clearAllRuns = useRunStore((s) => s.clearAllRuns);
  const runs = useRunStore((s) => s.runs);

  return (
    <aside className="sidebar">
      <LogImporter />
      <PasteImporter />
      <RunList />
      {runs.length > 0 && (
        <div className="panel">
          <button className="btn btn-danger" onClick={clearAllRuns}>
            Clear All Runs
          </button>
        </div>
      )}
      <ExportPanel />
      <FutureLiveControlsPanel />
    </aside>
  );
}
