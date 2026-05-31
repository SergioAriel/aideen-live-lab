import type { AideenRunMetrics, NumericValue } from "../types/metrics";
import { Tooltip } from "./Tooltip";

function v(val: NumericValue | undefined): number | null {
  return val ?? null;
}

interface Props {
  run: AideenRunMetrics;
}

export function FpmPipelinePanel({ run }: Props) {
  const last = run.points[run.points.length - 1];
  if (!last) return null;

  const rows: { label: string; value: number | null; varKey: string }[] = [
    { label: "FPM Loss", value: v(last.fpm_loss), varKey: "fpm_loss" },
    { label: "FPM Utility", value: v(last.fpm_utility), varKey: "fpm_utility" },
    { label: "Replay Utility", value: v(last.fpm_replay_utility), varKey: "fpm_replay_utility" },
    { label: "Retrieval Loss", value: v(last.fpm_retrieval_loss), varKey: "fpm_retrieval_loss" },
    { label: "Retrieval Sim", value: v(last.fpm_retrieval_sim), varKey: "fpm_retrieval_sim" },
    { label: "Projected", value: v(last.projected), varKey: "projected" },
    { label: "Candidates", value: v(last.candidates), varKey: "candidates" },
    { label: "Feed Entries", value: v(last.feed_entries), varKey: "feed_entries" },
    { label: "Consolidated", value: v(last.consolidated), varKey: "consolidated" },
    { label: "Accept Rate", value: v(last.accept_rate), varKey: "accept_rate" },
    { label: "Cons Rate", value: v(last.cons_rate), varKey: "cons_rate" },
  ];

  const hasData = rows.some((r) => r.value != null);
  if (!hasData) return null;

  return (
    <div className="panel">
      <h3 className="panel-title">FPM Pipeline</h3>
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
