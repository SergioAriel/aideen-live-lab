import React, { useState } from "react";
import type { AideenRunMetrics } from "../types/metrics";

export function RawTextPanel({ run }: { run: AideenRunMetrics }) {
  const [expanded, setExpanded] = useState(false);

  if (!run.raw_text) {
    return (
      <div className="panel">
        <h3 className="panel-title">Raw Text</h3>
        <p className="text-muted">No raw text stored.</p>
      </div>
    );
  }

  const lines = run.raw_text.split("\n");
  const preview = lines.slice(0, 20).join("\n");

  return (
    <div className="panel">
      <h3 className="panel-title">Raw Text Preview</h3>
      <pre className="raw-text">
        {expanded ? run.raw_text : preview}
      </pre>
      {lines.length > 20 && (
        <button
          className="btn btn-secondary"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : `Show all (${lines.length} lines)`}
        </button>
      )}
    </div>
  );
}
