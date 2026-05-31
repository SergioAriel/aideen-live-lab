import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import * as api from "../api";
import { useRunStore } from "../state/useRunStore";
import type { AideenRunMetrics, MetricsPoint } from "../types/metrics";
import { runLabel } from "../utils/runMetrics";

const COLORS = ["#4fc3f7", "#3fb950", "#f85149", "#d29922", "#a371f7", "#ff7b72", "#56d4dd", "#f0883e"];

type RunChartMetric = keyof MetricsPoint | "val_loss";

function metricValue(point: MetricsPoint, metric: RunChartMetric): number | undefined {
  if (metric === "val_loss") {
    return point.ppl_proxy != null && point.loss_pre != null ? point.loss_pre : undefined;
  }
  const value = point[metric];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function buildData(runs: AideenRunMetrics[], metric: RunChartMetric) {
  const byStep = new Map<number, Record<string, number>>();
  const series: { key: string; name: string }[] = [];

  runs.forEach((run, index) => {
    const key = `run_${index}`;
    const points = run.points.filter((point) => metricValue(point, metric) != null);
    if (points.length === 0) return;

    series.push({ key, name: runLabel(run) });
    for (const point of points) {
      if (!byStep.has(point.step)) byStep.set(point.step, { step: point.step });
      byStep.get(point.step)![key] = metricValue(point, metric)!;
    }
  });

  return {
    series,
    rows: Array.from(byStep.values()).sort((a, b) => Number(a.step) - Number(b.step)),
  };
}

function selectedRuns(runs: AideenRunMetrics[], selectedRunIds: string[]): AideenRunMetrics[] {
  const base = selectedRunIds.length > 0 ? runs.filter((run) => selectedRunIds.includes(run.id)) : runs;
  return base.slice(0, 12);
}

export function MultiRunChartsPanel() {
  const runs = useRunStore((s) => s.runs);
  const selectedRunIds = useRunStore((s) => s.selectedRunIds);
  const watchedRun = useRunStore((s) => s.watchedRun);
  const [detailedRuns, setDetailedRuns] = useState<AideenRunMetrics[]>([]);

  const baseRuns = useMemo(() => selectedRuns(runs, selectedRunIds), [runs, selectedRunIds]);

  useEffect(() => {
    let alive = true;

    async function loadDetails() {
      const loaded = await Promise.all(
        baseRuns.map(async (run) => {
          if (watchedRun?.run.id === run.id) return watchedRun.run;
          if (run.points.length > 0) return run;
          return (await api.loadRunDetail(run.id)) ?? run;
        })
      );
      if (alive) setDetailedRuns(loaded);
    }

    loadDetails().catch(() => {
      if (alive) setDetailedRuns(baseRuns);
    });

    return () => {
      alive = false;
    };
  }, [baseRuns, watchedRun]);

  const valLoss = useMemo(() => buildData(detailedRuns, "val_loss"), [detailedRuns]);
  const pplProxy = useMemo(() => buildData(detailedRuns, "ppl_proxy"), [detailedRuns]);

  if (detailedRuns.length === 0 || (valLoss.series.length === 0 && pplProxy.series.length === 0)) return null;

  const renderChart = (
    title: string,
    yLabel: string,
    data: ReturnType<typeof buildData>
  ) => (
    <div className="wide-chart-card">
      <h4 className="chart-title">{title}</h4>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data.rows} margin={{ top: 8, right: 16, left: 4, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
          <XAxis dataKey="step" stroke="#8b949e" tick={{ fontSize: 11 }} />
          <YAxis stroke="#8b949e" tick={{ fontSize: 11 }} label={{ value: yLabel, angle: -90, position: "insideLeft", fill: "#8b949e", fontSize: 11 }} />
          <RechartsTooltip
            contentStyle={{ background: "#1a1a2e", border: "1px solid #30363d", borderRadius: 6, fontSize: 12 }}
            labelStyle={{ color: "#e6edf3" }}
          />
          <Legend wrapperStyle={{ fontSize: 11, lineHeight: "18px" }} />
          {data.series.map((item, index) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.name}
              stroke={COLORS[index % COLORS.length]}
              dot={false}
              strokeWidth={1.8}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="panel">
      <h3 className="panel-title">Loss Metrics</h3>
      <div className="wide-charts-grid">
        {valLoss.series.length > 0 && renderChart("Validation Loss by Step", "val loss", valLoss)}
        {pplProxy.series.length > 0 && renderChart("PPL Proxy by Step", "ppl proxy", pplProxy)}
      </div>
    </div>
  );
}
