import React from "react";
import { useRunStore } from "../state/useRunStore";
import { fmt } from "../utils/format";
import { PdfExportPanel } from "./PdfExportPanel";

function download(filename: string, content: string, mime = "application/json") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportPanel() {
  const runs = useRunStore((s) => s.runs);
  const selectedRunId = useRunStore((s) => s.selectedRunId);

  const selectedRun = runs.find((r) => r.id === selectedRunId);

  const exportSelectedJson = () => {
    if (!selectedRun) return;
    download(
      `${selectedRun.display_name.replace(/[^a-zA-Z0-9]/g, "_")}.json`,
      JSON.stringify(selectedRun, null, 2)
    );
  };

  const exportAllJson = () => {
    download("all_runs.json", JSON.stringify(runs, null, 2));
  };

  const exportCsv = () => {
    const headers = [
      "displayName",
      "avgLoss",
      "pplProxy",
      "utilityAvg",
      "ceGainNoFpm",
      "interferenceAvg",
      "gateMeanAvg",
      "deltaGoodMinusBad",
      "targetCosine",
      "normMse",
      "entityEntropy",
      "entityCollapse",
      "inputRawCosine",
    ];
    const rows = runs.map((r) => [
      r.display_name,
      fmt(r.summary.avg_loss),
      fmt(r.summary.ppl_proxy),
      fmt(r.fpm_pipeline_scores.utility_avg),
      fmt(r.fpm_signal_ratios.ce_gain_no_fpm),
      fmt(r.fpm_pipeline_shapes.interference_avg),
      fmt(r.fpm_pipeline_shapes.gate_mean_avg),
      fmt(r.routing.delta_good_minus_bad),
      fmt(r.utility_alignment.target_cosine),
      fmt(r.utility_alignment.norm_mse),
      fmt(r.pre_deq_entity.entropy),
      fmt(r.pre_deq_entity.collapse),
      fmt(r.pre_deq_input.input_raw_cosine),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    download("comparison.csv", csv, "text/csv");
  };

  return (
    <>
      <div className="panel">
        <h3 className="panel-title">Export</h3>
        <div className="button-row">
          <button
            className="btn btn-primary"
            onClick={exportSelectedJson}
            disabled={!selectedRun}
          >
            Export Selected Run JSON
          </button>
          <button
            className="btn btn-primary"
            onClick={exportAllJson}
            disabled={runs.length === 0}
          >
            Export All Runs JSON
          </button>
          <button
            className="btn btn-primary"
            onClick={exportCsv}
            disabled={runs.length === 0}
          >
            Export Comparison CSV
          </button>
        </div>
      </div>
      <PdfExportPanel />
    </>
  );
}
