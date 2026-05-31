import type { AideenRunMetrics, NumericValue } from "../types/metrics";
import { Tooltip } from "./Tooltip";

function v(val: NumericValue | undefined): number | null {
  return val ?? null;
}

interface Props {
  run: AideenRunMetrics;
}

export function PreDeqPanel({ run }: Props) {
  const last = run.points[run.points.length - 1];
  if (!last) return null;

  const rows: { label: string; value: number | null; varKey: string }[] = [
    { label: "Train Loss", value: v(last.train_loss), varKey: "train_loss" },
    { label: "Alpha Entity", value: v(last.alpha_entity), varKey: "alpha_entity" },
  ];

  const hasData = rows.some((r) => r.value != null);
  if (!hasData) return null;

  return (
    <div className="panel">
      <h3 className="panel-title">Pre-DEQ</h3>
      <div className="detail-grid">
        {rows.map(
          (r) =>
            r.value != null && (
              <div key={r.label} className="metric-row">
                <Tooltip varKey={r.varKey}>
                  <span>{r.label}</span>
                </Tooltip>
                <span>{r.value.toFixed(4)}</span>
              </div>
            )
        )}
      </div>
    </div>
  );
}
