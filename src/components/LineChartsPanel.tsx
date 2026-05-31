import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { AideenRunMetrics, MetricsPoint } from "../types/metrics";

interface Props {
  run: AideenRunMetrics;
}

type ChartField = keyof MetricsPoint | "val_loss" | "train_loss_pre";

function fieldValue(point: MetricsPoint, field: ChartField): number | undefined {
  if (field === "val_loss") {
    return point.ppl_proxy != null && point.loss_pre != null ? point.loss_pre : undefined;
  }
  if (field === "train_loss_pre") {
    return point.ppl_proxy == null && point.loss_pre != null ? point.loss_pre : undefined;
  }
  const value = point[field];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function hasField(points: MetricsPoint[], field: ChartField): boolean {
  return points.some((point) => fieldValue(point, field) != null);
}

function countNonNull(points: MetricsPoint[], field: ChartField): number {
  return points.filter((point) => fieldValue(point, field) != null).length;
}

function sanitizePoints(points: MetricsPoint[]): Record<string, unknown>[] {
  return points.map((p) => {
    const out: Record<string, unknown> = { step: p.step };
    for (const [key, val] of Object.entries(p)) {
      if (key === "step") continue;
      (out as Record<string, unknown>)[key] = val === null ? undefined : val;
    }
    out.val_loss = fieldValue(p, "val_loss");
    out.train_loss_pre = fieldValue(p, "train_loss_pre");
    return out;
  });
}

function hasChartValue(row: Record<string, unknown>, fields: ChartField[]): boolean {
  return fields.some((field) => typeof row[field] === "number" && Number.isFinite(row[field] as number));
}

function allValuesSame(points: MetricsPoint[], fields: ChartField[]): boolean {
  const vals = fields.flatMap((field) =>
    points
      .map((point) => fieldValue(point, field))
      .filter((value): value is number => value != null)
  );
  if (vals.length < 2) return true;
  return vals.every((value) => value === vals[0]);
}

interface ChartGroup {
  title: string;
  description?: string;
  fields: ChartField[];
  colors: string[];
}

// ── Core Charts (always shown if data exists) ──

const CORE_CHARTS: ChartGroup[] = [
  {
    title: "Validation Loss",
    description: "val_loss from val step loss_pre. Lower is better.",
    fields: ["val_loss"],
    colors: ["#4fc3f7"],
  },
  {
    title: "PPL Proxy",
    description: "ppl_proxy: perplexity proxy by step. Lower is better.",
    fields: ["ppl_proxy"],
    colors: ["#81c784"],
  },
  {
    title: "Gate / Control",
    description: "gate: train-step gate · gate_mean: validation average · desired/cap: control targets.",
    fields: ["gate", "gate_mean", "desired", "learned_cap"],
    colors: ["#ffb74d", "#ffd166", "#64b5f6", "#ba68c8"],
  },
  {
    title: "Training Loss",
    description: "train_loss_pre: train-step loss_pre, separate from validation loss.",
    fields: ["train_loss_pre", "loss_post"],
    colors: ["#56d4dd", "#a371f7"],
  },
  {
    title: "Signal RMS",
    description: "gated_rms: after gate · memory_rms: memory magnitude · op_rms: operator output",
    fields: ["gated_rms", "memory_rms", "op_rms"],
    colors: ["#ba68c8", "#64b5f6", "#e57373"],
  },
  {
    title: "Retrieval Similarity",
    description: "fpm_retrieval_sim: how well FPM retrieves coherent prototypes. Higher is better.",
    fields: ["fpm_retrieval_sim"],
    colors: ["#f06292"],
  },
  {
    title: "Consolidation",
    description: "consolidated: prototypes consolidated per step · cons_rate: consolidation rate",
    fields: ["consolidated", "cons_rate"],
    colors: ["#aed581", "#8bc34a"],
  },
];

// ── Deep Diagnostics (collapsible) ──

const DEEP_CHARTS: ChartGroup[] = [
  {
    title: "FPM Utility",
    description: "fpm_utility: instant FPM utility · util: delta loss with/without FPM",
    fields: ["fpm_utility", "util"],
    colors: ["#ce93d8", "#9c27b0"],
  },
  {
    title: "FPM Retrieval Loss",
    description: "fpm_retrieval_loss: retrieval error (lower=better)",
    fields: ["fpm_retrieval_loss"],
    colors: ["#e57373"],
  },
  {
    title: "Pipeline Counts",
    description: "projected · candidates · feed_entries · consolidated (counts per step)",
    fields: ["projected", "candidates", "feed_entries", "consolidated"],
    colors: ["#aed581", "#8bc34a", "#7cb342", "#689f38"],
  },
  {
    title: "Pipeline Rates",
    description: "accept_rate · cons_rate (ratios 0-1)",
    fields: ["accept_rate", "cons_rate"],
    colors: ["#558b2f", "#33691e"],
  },
  {
    title: "Signal Alignment",
    description: "target_cosine: alignment with target · useful_high_mse: useful high MSE rate",
    fields: ["target_cosine", "useful_high_mse"],
    colors: ["#7986cb", "#5c6bc0"],
  },
  {
    title: "Functional Residual",
    description: "loss_gain: loss diff with/without FPM (positive=helps) · usefulness: residual weight",
    fields: ["loss_gain", "usefulness", "bootstrap_active"],
    colors: ["#4db6ac", "#26a69a", "#009688"],
  },
  {
    title: "Functional Target",
    description: "target_rms: target magnitude · residual_rms: residual magnitude",
    fields: ["target_rms", "residual_rms"],
    colors: ["#e57373", "#f06292"],
  },
  {
    title: "Pre-DEQ",
    description: "train_loss: loss before DEQ · alpha_entity: entity context usage",
    fields: ["train_loss", "alpha_entity"],
    colors: ["#4fc3f7", "#29b6f6"],
  },
  {
    title: "Performance",
    description: "steps_per_sec: speed · elapsed_s: elapsed time",
    fields: ["steps_per_sec", "elapsed_s"],
    colors: ["#4fc3f7", "#29b6f6"],
  },
];

export function LineChartsPanel({ run }: Props) {
  const { points } = run;
  if (points.length === 0) return null;

  const data = sanitizePoints(points);

  // Filter core charts that have data
  const activeCore = CORE_CHARTS.filter((g) => g.fields.some((f) => hasField(points, f)));
  // Filter deep charts that have data
  const activeDeep = DEEP_CHARTS.filter((g) => g.fields.some((f) => hasField(points, f)));

  if (activeCore.length === 0 && activeDeep.length === 0) return null;

  const renderChart = (group: ChartGroup) => {
    const hasData = group.fields.some((f) => countNonNull(points, f) > 0);
    if (!hasData) {
      return (
        <div key={group.title} className="chart-card chart-card--empty">
          <h4 className="chart-title">{group.title}</h4>
          {group.description && <p className="chart-description">{group.description}</p>}
          <p className="chart-empty-msg">No data parsed for this chart</p>
        </div>
      );
    }

    const stats = group.fields.map((f) => {
      const vals = points.map((point) => fieldValue(point, f)).filter((v) => v != null) as number[];
      if (vals.length === 0) return null;
      return {
        field: f,
        n: vals.length,
        last: vals[vals.length - 1],
        min: Math.min(...vals),
        max: Math.max(...vals),
      };
    }).filter(Boolean);
    const chartData = data.filter((row) => hasChartValue(row, group.fields));
    const useDots = chartData.length <= 40 || allValuesSame(points, group.fields);
    const isConstant = allValuesSame(points, group.fields);

    return (
      <div key={group.title} className="chart-card">
        <h4 className="chart-title">{group.title}</h4>
        {group.description && <p className="chart-description">{group.description}</p>}
        <div className="chart-stats">
          {stats.map((s) => s && (
            <span key={s.field} className="chart-stat">
              {s.field}: n={s.n} last={s.last.toFixed(4)} min={s.min.toFixed(4)} max={s.max.toFixed(4)}
            </span>
          ))}
        </div>
        {isConstant && <p className="chart-note">Constant or near-empty signal; shown as points instead of a trend.</p>}
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis dataKey="step" stroke="#8b949e" tick={{ fontSize: 10 }} />
            <YAxis stroke="#8b949e" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{ background: "#1a1a2e", border: "1px solid #30363d", borderRadius: 6, fontSize: 12 }}
              labelStyle={{ color: "#e6edf3" }}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {group.fields.map((field, i) => (
              <Line
                key={field}
                type="monotone"
                dataKey={field}
                stroke={group.colors[i % group.colors.length]}
                dot={useDots ? { r: 2 } : false}
                strokeWidth={isConstant ? 0 : 1.8}
                name={field}
                connectNulls={true}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <div className="panel">
      <h3 className="panel-title">Charts</h3>

      {/* Core Charts */}
      {activeCore.length > 0 && (
        <div className="chart-section">
          <div className="chart-section-header">
            <span className="chart-section-title">Core Metrics</span>
            <span className="chart-section-badge core">Required</span>
          </div>
          <div className="charts-grid">{activeCore.map(renderChart)}</div>
        </div>
      )}

      {/* Deep Diagnostics */}
      {activeDeep.length > 0 && (
        <div className="chart-section">
          <div className="chart-section-header">
            <span className="chart-section-title">Deep Diagnostics</span>
            <span className="chart-section-badge deep">Optional</span>
          </div>
          <details>
            <summary className="deep-diagnostics-toggle">Show deep diagnostics ({activeDeep.length} charts)</summary>
            <div className="deep-diagnostics-content">
              <div className="charts-grid">{activeDeep.map(renderChart)}</div>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}
