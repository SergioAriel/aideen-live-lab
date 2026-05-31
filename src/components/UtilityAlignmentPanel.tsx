import type { AideenRunMetrics, NumericValue } from "../types/metrics";
import { Tooltip } from "./Tooltip";

function v(val: NumericValue | undefined): number | null {
  return val ?? null;
}

interface Props {
  run: AideenRunMetrics;
}

export function UtilityAlignmentPanel({ run }: Props) {
  const last = run.points[run.points.length - 1];
  if (!last) return null;

  const rows: { label: string; value: number | null; varKey: string }[] = [
    { label: "Util", value: v(last.util), varKey: "util" },
    { label: "Loss Gain", value: v(last.loss_gain), varKey: "loss_gain" },
    { label: "Usefulness", value: v(last.usefulness), varKey: "usefulness" },
    { label: "Residual RMS", value: v(last.residual_rms), varKey: "residual_rms" },
    { label: "Target RMS", value: v(last.target_rms), varKey: "target_rms" },
    { label: "Bootstrap Active", value: v(last.bootstrap_active), varKey: "bootstrap_active" },
  ];

  const hasData = rows.some((r) => r.value != null);
  if (!hasData) return null;

  return (
    <div className="panel">
      <h3 className="panel-title">Functional / Utility</h3>
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
