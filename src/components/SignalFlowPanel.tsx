import type { AideenRunMetrics, NumericValue } from "../types/metrics";
import { Tooltip } from "./Tooltip";

function v(val: NumericValue | undefined): number | null {
  return val ?? null;
}

interface Props {
  run: AideenRunMetrics;
}

export function SignalFlowPanel({ run }: Props) {
  const last = run.points[run.points.length - 1];
  if (!last) return null;

  const rows: { label: string; value: number | null; varKey: string }[] = [
    { label: "Gate", value: v(last.gate), varKey: "gate" },
    { label: "Gate Mean", value: v(last.gate_mean), varKey: "gate_mean" },
    { label: "Learned Cap", value: v(last.learned_cap), varKey: "learned_cap" },
    { label: "Desired", value: v(last.desired), varKey: "desired" },
    { label: "Policy Reward", value: v(last.policy_reward), varKey: "policy_reward" },
    { label: "Raw Op RMS", value: v(last.raw_op_rms), varKey: "raw_op_rms" },
    { label: "Op RMS", value: v(last.op_rms), varKey: "op_rms" },
    { label: "Gated RMS", value: v(last.gated_rms), varKey: "gated_rms" },
    { label: "Memory RMS", value: v(last.memory_rms), varKey: "memory_rms" },
    { label: "Target Cosine", value: v(last.target_cosine), varKey: "target_cosine" },
    { label: "Useful High MSE", value: v(last.useful_high_mse), varKey: "useful_high_mse" },
  ];

  const hasData = rows.some((r) => r.value != null);
  if (!hasData) return null;

  return (
    <div className="panel">
      <h3 className="panel-title">Signal Flow</h3>
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
