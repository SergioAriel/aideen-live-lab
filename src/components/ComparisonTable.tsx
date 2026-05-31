import React, { useMemo } from "react";
import { useRunStore } from "../state/useRunStore";
import { fmt } from "../utils/format";
import type { AideenRunMetrics } from "../types/metrics";
import { getVarDesc } from "../utils/variableDescriptions";
import { avg, extractSeed, extractTarget, fullValLoss, std } from "../utils/runMetrics";

// ── Helpers ──

function extractConfig(run: AideenRunMetrics): { K: number | null; D: number | null; slots: number | null } {
  return {
    K: run.summary.block_len ?? null,
    D: run.summary.d ?? null,
    slots: run.summary.slots ?? null,
  };
}

function configKey(run: AideenRunMetrics): string {
  const { K, D, slots } = extractConfig(run);
  return `K${K ?? "?"}_D${D ?? "?"}_S${slots ?? "?"}`;
}

// ── ConfigGroup: runs grouped by (K, D, slots) ──

interface ConfigGroup {
  key: string;
  K: number | null;
  D: number | null;
  slots: number | null;
  runs: AideenRunMetrics[];
}

function groupByConfig(runs: AideenRunMetrics[]): ConfigGroup[] {
  const groups = new Map<string, AideenRunMetrics[]>();
  for (const run of runs) {
    const key = configKey(run);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(run);
  }
  return Array.from(groups.entries())
    .map(([key, runs]) => {
      const { K, D, slots } = extractConfig(runs[0]);
      return { key, K, D, slots, runs };
    })
    .sort((a, b) => {
      const ka = a.K ?? 0;
      const kb = b.K ?? 0;
      if (ka !== kb) return ka - kb;
      const da = a.D ?? 0;
      const db = b.D ?? 0;
      return da - db;
    });
}

function HeaderCell({ label, varKey }: { label: string; varKey?: string }) {
  const desc = varKey ? getVarDesc(varKey) : null;
  return <th title={desc ? `${desc.label}: ${desc.description}` : undefined}>{label}</th>;
}

// ── Component ──

export function ComparisonTable() {
  const runs = useRunStore((s) => s.runs);

  const groups = useMemo(() => groupByConfig(runs), [runs]);

  if (groups.length === 0) return null;

  return (
    <div className="panel">
      <h3 className="panel-title">Config Comparison</h3>
      <p className="panel-subtitle">
        Runs grouped by (K, D, slots). Loss columns use full validation loss, not training loss.
      </p>
      <div className="table-wrapper">
        <table className="comparison-table">
          <thead>
            <tr>
              <HeaderCell label="K" varKey="block_len" />
              <HeaderCell label="D" varKey="d" />
              <HeaderCell label="Slots" varKey="slots" />
              <HeaderCell label="D/slot" varKey="d_per_slot" />
              <HeaderCell label="K/slot" varKey="k_per_slot" />
              <HeaderCell label="avg_fullval_loss" varKey="final_val_loss" />
              <HeaderCell label="std_loss" varKey="std_loss" />
              <HeaderCell label="avg_frozen_delta" varKey="frozen_delta_off_minus_on" />
              <HeaderCell label="best_val_loss" varKey="best_val_loss" />
              <HeaderCell label="Seeds" />
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const dPerSlot = g.D != null && g.slots != null && g.slots > 0 ? g.D / g.slots : null;
              const kPerSlot = g.K != null && g.slots != null && g.slots > 0 ? g.K / g.slots : null;

              const lossVals = g.runs.map(fullValLoss);
              const deltaVals = g.runs.map((r) => r.summary.frozen_delta_off_minus_on);
              const bestLossVals = g.runs.map((r) => r.summary.best_val_loss);

              const avgLoss = avg(lossVals);
              const stdLoss = std(lossVals);
              const avgDelta = avg(deltaVals);
              const avgBestLoss = avg(bestLossVals);

              const seeds = g.runs
                .map((r) => extractSeed(r))
                .filter((s): s is number => s != null)
                .sort((a, b) => a - b);

              return (
                <tr key={g.key}>
                  <td>{g.K ?? "—"}</td>
                  <td>{g.D ?? "—"}</td>
                  <td>{g.slots ?? "—"}</td>
                  <td>{dPerSlot != null ? dPerSlot.toFixed(1) : "—"}</td>
                  <td>{kPerSlot != null ? kPerSlot.toFixed(1) : "—"}</td>
                  <td>{avgLoss != null ? fmt(avgLoss) : "—"}</td>
                  <td>{stdLoss != null ? fmt(stdLoss) : "—"}</td>
                  <td className={
                    avgDelta != null && avgDelta > 0.001 ? "highlight-green" :
                    avgDelta != null && avgDelta < -0.001 ? "highlight-red" : ""
                  }>
                    {avgDelta != null ? fmt(avgDelta) : "—"}
                  </td>
                  <td className={
                    avgBestLoss != null && avgBestLoss === Math.min(...groups.map((gg) => avg(gg.runs.map((r) => r.summary.best_val_loss)) ?? Infinity)) ? "highlight-green" : ""
                  }>
                    {avgBestLoss != null ? fmt(avgBestLoss) : "—"}
                  </td>
                  <td className="seeds-cell">
                    {seeds.length > 0 ? seeds.join(", ") : g.runs.length.toString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail per run */}
      <details className="config-details">
        <summary>Show per-run details ({runs.length} runs)</summary>
        <div className="table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <HeaderCell label="Run" />
                <HeaderCell label="K" varKey="block_len" />
                <HeaderCell label="D" varKey="d" />
                <HeaderCell label="Slots" varKey="slots" />
                <HeaderCell label="Seed" />
                <HeaderCell label="Target" />
                <HeaderCell label="fullval_loss" varKey="final_val_loss" />
                <HeaderCell label="best_val_loss" varKey="best_val_loss" />
                <HeaderCell label="final_val_loss" varKey="final_val_loss" />
                <HeaderCell label="frozen_delta" varKey="frozen_delta_off_minus_on" />
              </tr>
            </thead>
            <tbody>
              {[...runs]
                .sort((a, b) => {
                  const ka = a.summary.block_len ?? 0;
                  const kb = b.summary.block_len ?? 0;
                  if (ka !== kb) return ka - kb;
                  const da = a.summary.d ?? 0;
                  const db = b.summary.d ?? 0;
                  if (da !== db) return da - db;
                  return (extractSeed(a) ?? 0) - (extractSeed(b) ?? 0);
                })
                .map((run) => {
                  const seed = extractSeed(run);
                  const target = extractTarget(run);
                  const delta = run.summary.frozen_delta_off_minus_on;
                  return (
                    <tr key={run.id}>
                      <td className="run-name-cell">{run.display_name}</td>
                      <td>{run.summary.block_len ?? "—"}</td>
                      <td>{run.summary.d ?? "—"}</td>
                      <td>{run.summary.slots ?? "—"}</td>
                      <td>{seed != null ? seed : "—"}</td>
                      <td>{target}</td>
                      <td>{fullValLoss(run) != null ? fmt(fullValLoss(run)) : "—"}</td>
                      <td className={run.summary.best_val_loss != null ? "highlight-green" : ""}>
                        {run.summary.best_val_loss != null ? fmt(run.summary.best_val_loss) : "—"}
                      </td>
                      <td>{run.summary.final_val_loss != null ? fmt(run.summary.final_val_loss) : "—"}</td>
                      <td className={
                        delta != null && delta > 0.001 ? "highlight-green" :
                        delta != null && delta < -0.001 ? "highlight-red" : ""
                      }>
                        {delta != null ? fmt(delta) : "—"}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
