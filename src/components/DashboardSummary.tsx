import { useMemo } from "react";
import { useRunStore } from "../state/useRunStore";
import type { AideenRunMetrics } from "../types/metrics";
import { avg, extractTarget, fullValLoss, runLabel } from "../utils/runMetrics";

function fmt(value: number | null | undefined, decimals = 4): string {
  return value == null ? "-" : value.toFixed(decimals);
}

function selectedRuns(runs: AideenRunMetrics[], selectedRunIds: string[]): AideenRunMetrics[] {
  return selectedRunIds.length > 0 ? runs.filter((run) => selectedRunIds.includes(run.id)) : runs;
}

export function DashboardSummary() {
  const runs = useRunStore((s) => s.runs);
  const selectedRunIds = useRunStore((s) => s.selectedRunIds);

  const data = useMemo(() => {
    const activeRuns = selectedRuns(runs, selectedRunIds);
    const byConfig = new Map<string, AideenRunMetrics[]>();

    for (const run of activeRuns) {
      const target = extractTarget(run);
      if (!byConfig.has(target)) byConfig.set(target, []);
      byConfig.get(target)!.push(run);
    }

    const configStats = Array.from(byConfig.entries())
      .map(([config, configRuns]) => ({
        config,
        loss: avg(configRuns.map(fullValLoss)),
        frozenDelta: avg(configRuns.map((run) => run.summary.frozen_delta_off_minus_on)),
      }))
      .filter((item) => item.loss != null)
      .sort((a, b) => (a.loss ?? Infinity) - (b.loss ?? Infinity));

    const bestRun = [...activeRuns]
      .filter((run) => fullValLoss(run) != null)
      .sort((a, b) => (fullValLoss(a) ?? Infinity) - (fullValLoss(b) ?? Infinity))[0];

    const fpmRuns = activeRuns.filter((run) => extractTarget(run) !== "no_fpm");
    const noFpmRuns = activeRuns.filter((run) => extractTarget(run) === "no_fpm");
    const fpmAvg = avg(fpmRuns.map(fullValLoss));
    const noFpmAvg = avg(noFpmRuns.map(fullValLoss));
    const delta = fpmAvg != null && noFpmAvg != null ? fpmAvg - noFpmAvg : null;

    return {
      count: activeRuns.length,
      bestConfig: configStats[0]?.config ?? "-",
      bestRun: bestRun ? runLabel(bestRun) : "-",
      bestRunLoss: bestRun ? fullValLoss(bestRun) : null,
      avgFinalValLoss: avg(activeRuns.map((run) => run.summary.final_val_loss)),
      avgBestValLoss: avg(activeRuns.map((run) => run.summary.best_val_loss)),
      avgPplProxy: avg(activeRuns.map((run) => run.summary.ppl_proxy)),
      fpmAvg,
      noFpmAvg,
      delta,
      frozenDeltaAvg: avg(activeRuns.map((run) => run.summary.frozen_delta_off_minus_on)),
    };
  }, [runs, selectedRunIds]);

  if (runs.length === 0) return null;

  return (
    <div className="panel dashboard-summary">
      <div className="dashboard-summary-title">
        Dashboard Summary
        <span>{data.count} run{data.count === 1 ? "" : "s"}</span>
      </div>
      <div className="dashboard-summary-grid">
        <div>
          <span>Best config</span>
          <strong>{data.bestConfig}</strong>
        </div>
        <div>
          <span>Best individual run</span>
          <strong>{data.bestRun}</strong>
          <small>{fmt(data.bestRunLoss)}</small>
        </div>
        <div>
          <span>Avg final val loss</span>
          <strong>{fmt(data.avgFinalValLoss)}</strong>
        </div>
        <div>
          <span>Avg best val loss</span>
          <strong>{fmt(data.avgBestValLoss)}</strong>
        </div>
        <div>
          <span>Avg ppl proxy</span>
          <strong>{fmt(data.avgPplProxy, 2)}</strong>
        </div>
        <div>
          <span>FPM avg fullval</span>
          <strong>{fmt(data.fpmAvg)}</strong>
        </div>
        <div>
          <span>no-FPM avg fullval</span>
          <strong>{fmt(data.noFpmAvg)}</strong>
        </div>
        <div>
          <span>Delta loss</span>
          <strong className={data.delta != null && data.delta < 0 ? "green" : data.delta != null && data.delta > 0 ? "red" : ""}>
            {data.delta != null && data.delta > 0 ? "+" : ""}
            {fmt(data.delta)}
          </strong>
        </div>
        <div>
          <span>Frozen delta avg</span>
          <strong className={data.frozenDeltaAvg != null && data.frozenDeltaAvg > 0 ? "green" : data.frozenDeltaAvg != null && data.frozenDeltaAvg < 0 ? "red" : ""}>
            {data.frozenDeltaAvg != null && data.frozenDeltaAvg > 0 ? "+" : ""}
            {fmt(data.frozenDeltaAvg)}
          </strong>
        </div>
      </div>
    </div>
  );
}
