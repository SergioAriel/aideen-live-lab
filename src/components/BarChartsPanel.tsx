import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ErrorBar,
} from "recharts";
import { useRunStore } from "../state/useRunStore";
import type { AideenRunMetrics } from "../types/metrics";
import { avg, extractSeed, extractTarget, fullValLoss, runLabel, std } from "../utils/runMetrics";

// ── Helpers ──

// ── Chart 1: FPM ON vs no-FPM by seed ──

function buildFpmVsNoFpmData(runs: AideenRunMetrics[]) {
  const seedMap = new Map<number, { seed: number; fpmOn: number | null; noFpm: number | null }>();

  for (const run of runs) {
    const seed = extractSeed(run);
    if (seed == null) continue;
    if (!seedMap.has(seed)) {
      seedMap.set(seed, { seed, fpmOn: null, noFpm: null });
    }
    const entry = seedMap.get(seed)!;
    const loss = fullValLoss(run);
    if (loss == null) continue;
    const target = extractTarget(run);
    if (target === "no_fpm") {
      entry.noFpm = loss;
    } else if (target === "utility_aligned_delta") {
      entry.fpmOn = loss;
    } else if (entry.fpmOn == null && target !== "other") {
      entry.fpmOn = loss;
    }
  }

  return Array.from(seedMap.values()).sort((a, b) => a.seed - b.seed);
}

// ── Chart 2: Frozen delta by seed ──

function buildFrozenDeltaData(runs: AideenRunMetrics[]) {
  return runs
    .map((run) => ({
      seed: extractSeed(run),
      label: runLabel(run),
      delta: run.summary.frozen_delta_off_minus_on,
    }))
    .filter((d) => d.delta != null)
    .sort((a, b) => (a.seed ?? 0) - (b.seed ?? 0));
}

// ── Chart 3: Avg loss by config with error bars ──

function buildAvgByConfigData(runs: AideenRunMetrics[]) {
  const configMap = new Map<string, number[]>();

  for (const run of runs) {
    const target = extractTarget(run);
    const loss = fullValLoss(run);
    if (loss == null) continue;
    if (!configMap.has(target)) configMap.set(target, []);
    configMap.get(target)!.push(loss);
  }

  return Array.from(configMap.entries())
    .map(([target, losses]) => ({
      target,
      avg: avg(losses) ?? 0,
      std: std(losses) ?? 0,
      n: losses.length,
    }))
    .sort((a, b) => a.avg - b.avg);
}

// ── Component ──

export function BarChartsPanel() {
  const runs = useRunStore((s) => s.runs);
  const selectedRunIds = useRunStore((s) => s.selectedRunIds);

  const displayRuns = useMemo(
    () => (selectedRunIds.length > 0 ? runs.filter((r) => selectedRunIds.includes(r.id)) : runs),
    [runs, selectedRunIds]
  );

  const fpmVsNoFpmData = useMemo(() => buildFpmVsNoFpmData(displayRuns), [displayRuns]);
  const frozenDeltaData = useMemo(() => buildFrozenDeltaData(displayRuns), [displayRuns]);
  const avgByConfigData = useMemo(() => buildAvgByConfigData(displayRuns), [displayRuns]);

  if (displayRuns.length === 0) return null;

  const hasFpmOnOff = fpmVsNoFpmData.length > 0 && fpmVsNoFpmData.some((d) => d.fpmOn != null && d.noFpm != null);
  const hasFrozenDelta = frozenDeltaData.length > 0;
  const hasAvgConfig = avgByConfigData.length > 0;

  return (
    <div className="panel">
      <h3 className="panel-title">Key Comparisons</h3>
      <div className="bar-charts-grid">
        {/* Chart 1: FPM ON vs no-FPM */}
        {hasFpmOnOff && (
          <div className="bar-chart-card">
            <h4 className="bar-chart-title">Full Validation Loss: UtilityAlignedDelta vs no-FPM</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={fpmVsNoFpmData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="seed" stroke="#8b949e" tick={{ fontSize: 12 }} label={{ value: "Seed", position: "insideBottom", offset: -5, fill: "#8b949e", fontSize: 11 }} />
                <YAxis stroke="#8b949e" tick={{ fontSize: 12 }} label={{ value: "Loss", angle: -90, position: "insideLeft", fill: "#8b949e", fontSize: 11 }} />
                <RechartsTooltip
                  contentStyle={{ background: "#1a1a2e", border: "1px solid #30363d", borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: "#e6edf3" }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="fpmOn" fill="#4fc3f7" name="FPM ON" radius={[4, 4, 0, 0]} />
                <Bar dataKey="noFpm" fill="#f85149" name="no-FPM" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart 2: Frozen delta by seed */}
        {hasFrozenDelta && (
          <div className="bar-chart-card">
            <h4 className="bar-chart-title">Frozen FPM Ablation Delta by Seed</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={frozenDeltaData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="label" stroke="#8b949e" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" height={48} />
                <YAxis stroke="#8b949e" tick={{ fontSize: 12 }} label={{ value: "Delta (off - on)", angle: -90, position: "insideLeft", fill: "#8b949e", fontSize: 11 }} />
                <RechartsTooltip
                  contentStyle={{ background: "#1a1a2e", border: "1px solid #30363d", borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: "#e6edf3" }}
                  formatter={(value: number) => [value.toFixed(4), "delta"]}
                />
                <ReferenceLine y={0} stroke="#666" strokeDasharray="4 4" />
                <Bar dataKey="delta" radius={[4, 4, 0, 0]} name="delta_off_minus_on">
                  {frozenDeltaData.map((entry, index) => (
                    <Cell key={index} fill={entry.delta != null && entry.delta > 0 ? "#3fb950" : "#f85149"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart 3: Avg loss by config with error bars */}
        {hasAvgConfig && (
          <div className="bar-chart-card">
            <h4 className="bar-chart-title">Average Full Validation Loss by Config</h4>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={avgByConfigData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="target" stroke="#8b949e" tick={{ fontSize: 11 }} label={{ value: "Config", position: "insideBottom", offset: -5, fill: "#8b949e", fontSize: 11 }} />
                <YAxis stroke="#8b949e" tick={{ fontSize: 12 }} label={{ value: "Avg Loss", angle: -90, position: "insideLeft", fill: "#8b949e", fontSize: 11 }} />
                <RechartsTooltip
                  contentStyle={{ background: "#1a1a2e", border: "1px solid #30363d", borderRadius: 6, fontSize: 12 }}
                  labelStyle={{ color: "#e6edf3" }}
                  formatter={(value: number) => [value.toFixed(4), "avg fullval loss"]}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="avg" fill="#4fc3f7" name="avg fullval loss" radius={[4, 4, 0, 0]}>
                  <ErrorBar dataKey="std" stroke="#8b949e" strokeWidth={1.5} width={6} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
