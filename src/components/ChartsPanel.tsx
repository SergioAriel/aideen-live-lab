import React from "react";
import { LineChartsPanel } from "./LineChartsPanel";
import type { AideenRunMetrics } from "../types/metrics";

interface Props {
  run: AideenRunMetrics;
}

export function ChartsPanel({ run }: Props) {
  return (
    <div>
      <LineChartsPanel run={run} />
    </div>
  );
}
