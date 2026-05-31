import React from "react";
import type { AideenRunMetrics } from "../types/metrics";

export function RawJsonPanel({ run }: { run: AideenRunMetrics }) {
  const json = JSON.stringify(run, null, 2);

  return (
    <div className="panel">
      <h3 className="panel-title">Raw Parsed JSON</h3>
      <pre className="raw-json">{json}</pre>
    </div>
  );
}
