import React from "react";
import { useRunStore } from "../state/useRunStore";
import * as api from "../api";
import type { AideenRunMetrics } from "../types/metrics";
import { fmt } from "../utils/format";

// Draw a bar chart directly on jsPDF
function drawBarChart(
  pdf: any,
  data: { label: string; value: number | null }[],
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  color: [number, number, number],
  highlightBest: "min" | "max" | null = null
) {
  const validData = data.filter((d) => d.value !== null && d.value !== undefined) as {
    label: string;
    value: number;
  }[];

  if (validData.length === 0) return;

  const values = validData.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  // Title
  pdf.setFontSize(9);
  pdf.setTextColor(200, 200, 200);
  pdf.text(title, x, y - 2);

  const barW = Math.min(12, (w - 10) / validData.length - 2);
  const chartH = h - 20;
  const chartY = y + 5;

  // Y axis
  pdf.setDrawColor(100, 100, 100);
  pdf.line(x, chartY, x, chartY + chartH);
  pdf.line(x, chartY + chartH, x + w - 5, chartY + chartH);

  // Y axis labels
  pdf.setFontSize(5);
  pdf.setTextColor(150, 150, 150);
  pdf.text(maxVal.toFixed(2), x - 8, chartY + 2);
  pdf.text(minVal.toFixed(2), x - 8, chartY + chartH + 2);

  // Bars
  validData.forEach((d, i) => {
    const barH = ((d.value - minVal) / range) * (chartH - 5) + 2;
    const bx = x + 5 + i * (barW + 2);
    const by = chartY + chartH - barH;

    // Highlight best bar
    let barColor = color;
    if (highlightBest === "min" && d.value === minVal) {
      barColor = [100, 255, 100] as [number, number, number];
    } else if (highlightBest === "max" && d.value === maxVal) {
      barColor = [100, 255, 100] as [number, number, number];
    }

    pdf.setFillColor(barColor[0], barColor[1], barColor[2]);
    pdf.rect(bx, by, barW, barH, "F");

    // Label
    pdf.setFontSize(4);
    pdf.setTextColor(180, 180, 180);
    const label = d.label.length > 8 ? d.label.substring(0, 8) + ".." : d.label;
    pdf.text(label, bx, chartY + chartH + 4, { angle: 45 });
  });
}

// Draw a line chart directly on jsPDF
function drawLineChart(
  pdf: any,
  data: { step: number; value: number }[],
  x: number,
  y: number,
  w: number,
  h: number,
  title: string,
  color: [number, number, number]
) {
  if (data.length < 2) return;

  const values = data.map((d) => d.value);
  const steps = data.map((d) => d.step);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;
  const minStep = Math.min(...steps);
  const maxStep = Math.max(...steps);
  const stepRange = maxStep - minStep || 1;

  // Title
  pdf.setFontSize(9);
  pdf.setTextColor(200, 200, 200);
  pdf.text(title, x, y - 2);

  const chartW = w - 15;
  const chartH = h - 20;
  const chartX = x + 10;
  const chartY = y + 5;

  // Axes
  pdf.setDrawColor(100, 100, 100);
  pdf.line(chartX, chartY, chartX, chartY + chartH);
  pdf.line(chartX, chartY + chartH, chartX + chartW, chartY + chartH);

  // Y axis labels
  pdf.setFontSize(5);
  pdf.setTextColor(150, 150, 150);
  pdf.text(maxVal.toExponential(1), chartX - 12, chartY + 2);
  pdf.text(minVal.toExponential(1), chartX - 12, chartY + chartH + 2);

  // X axis labels (first, middle, last)
  pdf.text(String(minStep), chartX, chartY + chartH + 4);
  pdf.text(String(Math.floor((minStep + maxStep) / 2)), chartX + chartW / 2 - 3, chartY + chartH + 4);
  pdf.text(String(maxStep), chartX + chartW - 5, chartY + chartH + 4);

  // Line
  pdf.setDrawColor(color[0], color[1], color[2]);
  pdf.setLineWidth(0.5);

  for (let i = 0; i < data.length - 1; i++) {
    const x1 = chartX + ((data[i].step - minStep) / stepRange) * chartW;
    const y1 = chartY + chartH - ((data[i].value - minVal) / range) * chartH;
    const x2 = chartX + ((data[i + 1].step - minStep) / stepRange) * chartW;
    const y2 = chartY + chartH - ((data[i + 1].value - minVal) / range) * chartH;
    pdf.line(x1, y1, x2, y2);
  }
}

export function PdfExportPanel() {
  const selectedRunIds = useRunStore((s) => s.selectedRunIds);
  const runs = useRunStore((s) => s.runs);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("");

  const handleExportPdf = async () => {
    const idsToExport = selectedRunIds.length > 0 ? selectedRunIds : runs.map((r) => r.id);
    if (idsToExport.length === 0) {
      setStatus("No runs to export.");
      return;
    }

    setLoading(true);
    setStatus("Loading run details...");

    try {
      // Load full details for selected runs
      const details: AideenRunMetrics[] = [];
      for (const id of idsToExport) {
        const detail = await api.loadRunDetail(id);
        if (detail) details.push(detail);
      }

      if (details.length === 0) {
        setStatus("No run data found.");
        setLoading(false);
        return;
      }

      setStatus("Generating PDF with charts...");

      const { default: jsPDF } = await import("jspdf");

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - 2 * margin;

      let currentPage = 0;

      const addPage = () => {
        if (currentPage > 0) pdf.addPage();
        currentPage++;
        pdf.setFontSize(16);
        pdf.setTextColor(200, 200, 200);
        pdf.text("AIDEEN Live Lab — Report", margin, 15);
        pdf.setFontSize(8);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, 21);
        pdf.setDrawColor(100, 100, 100);
        pdf.line(margin, 23, pageWidth - margin, 23);
      };

      addPage();

      let yPos = 30;

      // ==========================================
      // SECTION 1: Per-run text summary
      // ==========================================
      for (let i = 0; i < details.length; i++) {
        const run = details[i];

        if (yPos > pageHeight - 60) {
          addPage();
          yPos = 30;
        }

        // Run title
        pdf.setFontSize(14);
        pdf.setTextColor(100, 180, 255);
        pdf.text(`Run: ${run.display_name}`, margin, yPos);
        yPos += 7;

        // Summary metrics
        pdf.setFontSize(10);
        pdf.setTextColor(200, 200, 200);
        const summaryItems = [
          `avg_loss: ${fmt(run.summary.avg_loss)}`,
          `ppl_proxy: ${fmt(run.summary.ppl_proxy)}`,
          `utility_avg: ${fmt(run.fpm_pipeline_scores.utility_avg)}`,
          `interference_avg: ${fmt(run.fpm_pipeline_shapes.interference_avg)}`,
          `gate_mean_avg: ${fmt(run.fpm_pipeline_shapes.gate_mean_avg)}`,
          `delta_good_minus_bad: ${fmt(run.routing.delta_good_minus_bad)}`,
          `target_cosine: ${fmt(run.utility_alignment.target_cosine)}`,
          `ce_gain_no_fpm: ${fmt(run.fpm_signal_ratios.ce_gain_no_fpm)}`,
          `entity_entropy: ${fmt(run.pre_deq_entity.entropy)}`,
          `entity_collapse: ${fmt(run.pre_deq_entity.collapse)}`,
          `input_raw_cosine: ${fmt(run.pre_deq_input.input_raw_cosine)}`,
          `norm_mse: ${fmt(run.utility_alignment.norm_mse)}`,
        ];

        const colW = contentWidth / 2;
        summaryItems.forEach((item, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const x = margin + col * colW;
          const y = yPos + row * 5;
          pdf.text(item, x, y);
        });

        yPos += Math.ceil(summaryItems.length / 2) * 5 + 5;

        // Pipeline diagnostics
        if (yPos > pageHeight - 40) {
          addPage();
          yPos = 30;
        }

        pdf.setFontSize(11);
        pdf.setTextColor(255, 200, 100);
        pdf.text("FPM Pipeline", margin, yPos);
        yPos += 5;
        pdf.setFontSize(8);
        pdf.setTextColor(180, 180, 180);

        const pipelineItems = [
          `projected/step: ${fmt(run.fpm_pipeline_counts.projected_per_step)}`,
          `admitted/step: ${fmt(run.fpm_pipeline_counts.admitted_per_step)}`,
          `admit_rate: ${fmt(run.fpm_pipeline_counts.admit_rate)}`,
          `feed_size_avg: ${fmt(run.fpm_pipeline_counts.feed_size_avg)}`,
          `consolidated/step: ${fmt(run.fpm_pipeline_counts.consolidated_per_step)}`,
          `cons_accept_rate: ${fmt(run.fpm_pipeline_counts.cons_accept_rate)}`,
          `write_score_avg: ${fmt(run.fpm_pipeline_scores.write_score_avg)}`,
          `replay_util_avg: ${fmt(run.fpm_pipeline_scores.replay_util_avg)}`,
          `retrieval_sim_avg: ${fmt(run.fpm_pipeline_scores.retrieval_sim_avg)}`,
          `retrieval_loss_avg: ${fmt(run.fpm_pipeline_scores.retrieval_loss_avg)}`,
          `target_rms_avg: ${fmt(run.fpm_pipeline_shapes.target_rms_avg)}`,
          `conditioning_rms_avg: ${fmt(run.fpm_pipeline_shapes.conditioning_rms_avg)}`,
          `raw_op_rms_avg: ${fmt(run.fpm_pipeline_shapes.raw_op_rms_avg)}`,
          `op_rms_avg: ${fmt(run.fpm_pipeline_shapes.op_rms_avg)}`,
          `interference_avg: ${fmt(run.fpm_pipeline_shapes.interference_avg)}`,
          `gate_mean_avg: ${fmt(run.fpm_pipeline_shapes.gate_mean_avg)}`,
        ];

        pipelineItems.forEach((item, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const x = margin + col * colW;
          const y = yPos + row * 4;
          pdf.text(item, x, y);
        });

        yPos += Math.ceil(pipelineItems.length / 2) * 4 + 5;

        // Signal flow & alignment
        if (yPos > pageHeight - 40) {
          addPage();
          yPos = 30;
        }

        pdf.setFontSize(11);
        pdf.setTextColor(100, 255, 150);
        pdf.text("Signal Flow & Alignment", margin, yPos);
        yPos += 5;
        pdf.setFontSize(8);
        pdf.setTextColor(180, 180, 180);

        const signalItems = [
          `raw_op_rms: ${fmt(run.fpm_signal_flow.raw_op_rms)}`,
          `retrieved_rms: ${fmt(run.fpm_signal_flow.retrieved_rms)}`,
          `gated_rms: ${fmt(run.fpm_signal_flow.gated_rms)}`,
          `memory_component_rms: ${fmt(run.fpm_signal_flow.memory_component_rms)}`,
          `memory_rms: ${fmt(run.fpm_signal_flow.memory_rms)}`,
          `gated_to_retrieved: ${fmt(run.fpm_signal_ratios.gated_to_retrieved)}`,
          `component_to_memory: ${fmt(run.fpm_signal_ratios.component_to_memory)}`,
          `ce_gain_no_fpm: ${fmt(run.fpm_signal_ratios.ce_gain_no_fpm)}`,
          `target_cosine: ${fmt(run.utility_alignment.target_cosine)}`,
          `norm_mse: ${fmt(run.utility_alignment.norm_mse)}`,
          `useful_high_mse_rate: ${fmt(run.utility_alignment.useful_high_mse_rate)}`,
        ];

        signalItems.forEach((item, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const x = margin + col * colW;
          const y = yPos + row * 4;
          pdf.text(item, x, y);
        });

        yPos += Math.ceil(signalItems.length / 2) * 4 + 5;

        // Pre-DEQ
        if (yPos > pageHeight - 40) {
          addPage();
          yPos = 30;
        }

        pdf.setFontSize(11);
        pdf.setTextColor(255, 150, 150);
        pdf.text("Pre-DEQ Diagnostics", margin, yPos);
        yPos += 5;
        pdf.setFontSize(8);
        pdf.setTextColor(180, 180, 180);

        const preDeqItems = [
          `mode: ${run.pre_deq_input.mode || "—"}`,
          `input_rms: ${fmt(run.pre_deq_input.input_rms)}`,
          `input_raw_cosine: ${fmt(run.pre_deq_input.input_raw_cosine)}`,
          `input_shift_rms: ${fmt(run.pre_deq_input.input_shift_rms)}`,
          `alpha_entity: ${fmt(run.pre_deq_input.alpha_entity)}`,
          `train_loss: ${fmt(run.pre_deq_input.train_loss)}`,
          `entropy: ${fmt(run.pre_deq_entity.entropy)}`,
          `util_std: ${fmt(run.pre_deq_entity.util_std)}`,
          `collapse: ${fmt(run.pre_deq_entity.collapse)}`,
          `top1: ${fmt(run.pre_deq_entity.top1)}`,
          `readback_cosine: ${fmt(run.pre_deq_entity.readback_cosine)}`,
          `delta_rms: ${fmt(run.pre_deq_entity.delta_rms)}`,
        ];

        preDeqItems.forEach((item, idx) => {
          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const x = margin + col * colW;
          const y = yPos + row * 4;
          pdf.text(item, x, y);
        });

        yPos += Math.ceil(preDeqItems.length / 2) * 4 + 10;

        // Step count info
        if (run.points && run.points.length > 0) {
          pdf.setFontSize(9);
          pdf.setTextColor(150, 150, 255);
          pdf.text(
            `Per-step points: ${run.points.length} (step 0 to ${run.points[run.points.length - 1].step})`,
            margin,
            yPos
          );
          yPos += 7;
        }
      }

      // ==========================================
      // SECTION 2: Bar Charts (summary comparison)
      // ==========================================
      addPage();
      yPos = 30;

      pdf.setFontSize(14);
      pdf.setTextColor(100, 180, 255);
      pdf.text("Bar Charts — Summary Metrics Comparison", margin, yPos);
      yPos += 12;

      const barChartDefs = [
        {
          key: "avg_loss",
          label: "avg_loss by Run",
          getValue: (r: AideenRunMetrics) => r.summary.avg_loss,
          color: [255, 107, 107] as [number, number, number],
          best: "min" as const,
        },
        {
          key: "utility_avg",
          label: "utility_avg by Run",
          getValue: (r: AideenRunMetrics) => r.fpm_pipeline_scores.utility_avg,
          color: [79, 195, 247] as [number, number, number],
          best: "max" as const,
        },
        {
          key: "interference_avg",
          label: "interference_avg by Run",
          getValue: (r: AideenRunMetrics) => r.fpm_pipeline_shapes.interference_avg,
          color: [253, 121, 168] as [number, number, number],
          best: "min" as const,
        },
        {
          key: "delta_good_minus_bad",
          label: "delta_good_minus_bad by Run",
          getValue: (r: AideenRunMetrics) => r.routing.delta_good_minus_bad,
          color: [46, 213, 115] as [number, number, number],
          best: "max" as const,
        },
        {
          key: "target_cosine",
          label: "target_cosine by Run",
          getValue: (r: AideenRunMetrics) => r.utility_alignment.target_cosine,
          color: [108, 92, 231] as [number, number, number],
          best: "max" as const,
        },
        {
          key: "entity_entropy",
          label: "entity_entropy by Run",
          getValue: (r: AideenRunMetrics) => r.pre_deq_entity.entropy,
          color: [0, 206, 201] as [number, number, number],
          best: null,
        },
        {
          key: "entity_collapse",
          label: "entity_collapse by Run",
          getValue: (r: AideenRunMetrics) => r.pre_deq_entity.collapse,
          color: [225, 112, 85] as [number, number, number],
          best: null,
        },
        {
          key: "gate_mean_avg",
          label: "gate_mean_avg by Run",
          getValue: (r: AideenRunMetrics) => r.fpm_pipeline_shapes.gate_mean_avg,
          color: [253, 203, 110] as [number, number, number],
          best: null,
        },
      ];

      const chartW = contentWidth;
      const chartH = 50;

      for (const def of barChartDefs) {
        if (yPos + chartH > pageHeight - 15) {
          addPage();
          yPos = 30;
        }

        const barData = details.map((r) => ({
          label: r.display_name,
          value: def.getValue(r),
        }));

        drawBarChart(pdf, barData, margin, yPos, chartW, chartH, def.label, def.color, def.best);
        yPos += chartH + 8;
      }

      // ==========================================
      // SECTION 3: Line Charts (per-step)
      // ==========================================
      const runsWithPoints = details.filter((r) => r.points && r.points.length > 1);

      if (runsWithPoints.length > 0) {
        addPage();
        yPos = 30;

        pdf.setFontSize(14);
        pdf.setTextColor(100, 180, 255);
        pdf.text("Line Charts — Per-Step Metrics", margin, yPos);
        yPos += 12;

        const lineChartDefs = [
          {
            key: "loss_pre",
            label: "loss_pre over step",
            getValue: (p: any) => p.loss_pre,
            color: [255, 107, 107] as [number, number, number],
          },
          {
            key: "loss_train",
            label: "loss_train over step",
            getValue: (p: any) => p.loss_train,
            color: [255, 165, 2] as [number, number, number],
          },
          {
            key: "loss_post",
            label: "loss_post over step",
            getValue: (p: any) => p.loss_post,
            color: [46, 213, 115] as [number, number, number],
          },
          {
            key: "fpm_utility",
            label: "fpm_utility over step",
            getValue: (p: any) => p.fpm_utility,
            color: [79, 195, 247] as [number, number, number],
          },
          {
            key: "fast_utility",
            label: "fast_utility over step",
            getValue: (p: any) => p.fast_utility,
            color: [162, 155, 254] as [number, number, number],
          },
          {
            key: "fpm_interference",
            label: "fpm_interference over step",
            getValue: (p: any) => p.fpm_interference,
            color: [253, 121, 168] as [number, number, number],
          },
          {
            key: "fpm_gate_mean",
            label: "fpm_gate_mean over step",
            getValue: (p: any) => p.fpm_gate_mean,
            color: [253, 203, 110] as [number, number, number],
          },
          {
            key: "entity_entropy",
            label: "entity_entropy over step",
            getValue: (p: any) => p.entity_entropy,
            color: [0, 206, 201] as [number, number, number],
          },
          {
            key: "entity_collapse",
            label: "entity_collapse over step",
            getValue: (p: any) => p.entity_collapse,
            color: [225, 112, 85] as [number, number, number],
          },
          {
            key: "deq_residual",
            label: "deq_residual over step",
            getValue: (p: any) => p.deq_residual,
            color: [108, 92, 231] as [number, number, number],
          },
          {
            key: "h_rms",
            label: "h_rms over step",
            getValue: (p: any) => p.h_rms,
            color: [184, 233, 148] as [number, number, number],
          },
          {
            key: "grad_z_rms",
            label: "grad_z_rms over step",
            getValue: (p: any) => p.grad_z_rms,
            color: [243, 166, 131] as [number, number, number],
          },
          {
            key: "fpm_replay_utility",
            label: "fpm_replay_utility over step",
            getValue: (p: any) => p.fpm_replay_utility,
            color: [231, 127, 103] as [number, number, number],
          },
          {
            key: "fast_retrieval_similarity",
            label: "fast_retrieval_similarity over step",
            getValue: (p: any) => p.fast_retrieval_similarity,
            color: [61, 193, 211] as [number, number, number],
          },
          {
            key: "fpm_retrieval_similarity",
            label: "fpm_retrieval_similarity over step",
            getValue: (p: any) => p.fpm_retrieval_similarity,
            color: [225, 95, 65] as [number, number, number],
          },
          {
            key: "mem_write_score",
            label: "mem_write_score over step",
            getValue: (p: any) => p.mem_write_score,
            color: [99, 205, 218] as [number, number, number],
          },
          {
            key: "fpm_write_score",
            label: "fpm_write_score over step",
            getValue: (p: any) => p.fpm_write_score,
            color: [59, 59, 152] as [number, number, number],
          },
          {
            key: "fast_entries",
            label: "fast_entries over step",
            getValue: (p: any) => p.fast_entries,
            color: [252, 92, 101] as [number, number, number],
          },
          {
            key: "fpm_feed",
            label: "fpm_feed over step",
            getValue: (p: any) => p.fpm_feed,
            color: [69, 170, 242] as [number, number, number],
          },
          {
            key: "key_sim",
            label: "key_sim over step",
            getValue: (p: any) => p.key_sim,
            color: [75, 123, 236] as [number, number, number],
          },
          {
            key: "trans_cons",
            label: "trans_cons over step",
            getValue: (p: any) => p.trans_cons,
            color: [250, 130, 49] as [number, number, number],
          },
          {
            key: "deq_loss",
            label: "deq_loss over step",
            getValue: (p: any) => p.deq_loss,
            color: [136, 84, 208] as [number, number, number],
          },
          {
            key: "state_loss",
            label: "state_loss over step",
            getValue: (p: any) => p.state_loss,
            color: [75, 101, 132] as [number, number, number],
          },
          {
            key: "fpm_acc",
            label: "fpm_acc over step",
            getValue: (p: any) => p.fpm_acc,
            color: [106, 176, 76] as [number, number, number],
          },
          {
            key: "fpm_tgt_rms",
            label: "fpm_tgt_rms over step",
            getValue: (p: any) => p.fpm_tgt_rms,
            color: [19, 15, 64] as [number, number, number],
          },
          {
            key: "fpm_op_rms",
            label: "fpm_op_rms over step",
            getValue: (p: any) => p.fpm_op_rms,
            color: [224, 86, 253] as [number, number, number],
          },
        ];

        const lineChartW = contentWidth;
        const lineChartH = 45;

        for (const def of lineChartDefs) {
          // Collect data from all runs with points
          for (const run of runsWithPoints) {
            const lineData = run.points
              .filter((p: any) => def.getValue(p) !== null && def.getValue(p) !== undefined)
              .map((p: any) => ({
                step: p.step,
                value: def.getValue(p) as number,
              }));

            if (lineData.length < 2) continue;

            if (yPos + lineChartH > pageHeight - 15) {
              addPage();
              yPos = 30;
            }

            drawLineChart(
              pdf,
              lineData,
              margin,
              yPos,
              lineChartW,
              lineChartH,
              `${def.label} — ${run.display_name}`,
              def.color
            );
            yPos += lineChartH + 6;
          }
        }
      }

      // ==========================================
      // SECTION 4: Comparison Table
      // ==========================================
      addPage();
      yPos = 30;

      pdf.setFontSize(14);
      pdf.setTextColor(100, 180, 255);
      pdf.text("Run Comparison", margin, yPos);
      yPos += 10;

      const cols = [
        { label: "Run", width: 35 },
        { label: "avg_loss", width: 20 },
        { label: "utility", width: 20 },
        { label: "interf.", width: 18 },
        { label: "gate", width: 18 },
        { label: "delta_gmb", width: 22 },
        { label: "cosine", width: 18 },
        { label: "entropy", width: 18 },
        { label: "collapse", width: 18 },
      ];

      pdf.setFontSize(7);
      pdf.setTextColor(200, 200, 200);
      let xPos = margin;
      cols.forEach((col) => {
        pdf.text(col.label, xPos, yPos);
        xPos += col.width;
      });
      yPos += 4;

      pdf.setFontSize(6);
      const sortedRuns = [...runs].sort(
        (a, b) => (a.summary.avg_loss ?? Infinity) - (b.summary.avg_loss ?? Infinity)
      );

      for (const run of sortedRuns) {
        if (yPos > pageHeight - 10) {
          addPage();
          yPos = 30;
        }

        xPos = margin;
        const rowData = [
          run.display_name.substring(0, 20),
          fmt(run.summary.avg_loss, 3),
          fmt(run.fpm_pipeline_scores.utility_avg, 3),
          fmt(run.fpm_pipeline_shapes.interference_avg, 3),
          fmt(run.fpm_pipeline_shapes.gate_mean_avg, 3),
          fmt(run.routing.delta_good_minus_bad, 3),
          fmt(run.utility_alignment.target_cosine, 3),
          fmt(run.pre_deq_entity.entropy, 3),
          fmt(run.pre_deq_entity.collapse, 3),
        ];

        rowData.forEach((val, idx) => {
          pdf.text(val, xPos, yPos);
          xPos += cols[idx].width;
        });
        yPos += 4;
      }

      // Save PDF
      const fileName = `aideen-live-lab-report-${Date.now()}.pdf`;
      pdf.save(fileName);
      setStatus(`PDF saved: ${fileName}`);
    } catch (err) {
      console.error("PDF export error:", err);
      setStatus(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h3 className="panel-title">Export PDF Report</h3>
      <p className="text-muted" style={{ fontSize: "0.85rem", marginBottom: "8px" }}>
        Generates a PDF with all metrics, charts (bar + line), and comparison table for{" "}
        {selectedRunIds.length > 0
          ? `${selectedRunIds.length} selected run(s)`
          : "all runs"}
        .
      </p>
      <button
        className="btn btn-primary"
        onClick={handleExportPdf}
        disabled={loading}
      >
        {loading ? "Generating..." : "📄 Export PDF Report"}
      </button>
      {status && (
        <p
          className="text-muted"
          style={{
            fontSize: "0.8rem",
            marginTop: "6px",
            color: status.startsWith("Error") ? "#ff6b6b" : "#aaa",
          }}
        >
          {status}
        </p>
      )}
    </div>
  );
}
