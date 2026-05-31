import type { AideenRunMetrics } from "../types/metrics";
import { extractTarget, runLabel } from "../utils/runMetrics";
import { Tooltip } from "./Tooltip";

interface Props {
  run: AideenRunMetrics;
}

function fmt(v: number | null | undefined, decimals = 4): string {
  if (v == null) return "—";
  return v.toFixed(decimals);
}

function fpmVerdict(delta: number | null | undefined): { text: string; cls: string } {
  if (delta == null) return { text: "unknown", cls: "yellow" };
  if (delta > 0.002) return { text: "functional", cls: "green" };
  if (delta > 0) return { text: "weak positive", cls: "yellow" };
  if (delta > -0.001) return { text: "neutral", cls: "yellow" };
  return { text: "hurting", cls: "red" };
}

function valLossVerdict(loss: number | null | undefined): { text: string; cls: string } {
  if (loss == null) return { text: "—", cls: "yellow" };
  if (loss < 2.0) return { text: "good", cls: "green" };
  if (loss < 3.0) return { text: "ok", cls: "yellow" };
  return { text: "high", cls: "red" };
}

function gateVerdict(gate: number | null | undefined): { text: string; cls: string } {
  if (gate == null) return { text: "—", cls: "yellow" };
  if (gate > 0.3) return { text: "active", cls: "green" };
  if (gate > 0.05) return { text: "partial", cls: "yellow" };
  return { text: "closed", cls: "red" };
}

function retrievalVerdict(sim: number | null | undefined): { text: string; cls: string } {
  if (sim == null) return { text: "—", cls: "yellow" };
  if (sim > 0.8) return { text: "stable", cls: "green" };
  if (sim > 0.5) return { text: "moderate", cls: "yellow" };
  return { text: "poor", cls: "red" };
}

function functionalVerdict(targetRms: number | null | undefined, lossGain: number | null | undefined): { text: string; cls: string } {
  if (targetRms == null || targetRms <= 0) return { text: "inactive", cls: "yellow" };
  if (lossGain != null && lossGain > 0) return { text: "active", cls: "green" };
  return { text: "active but no gain", cls: "yellow" };
}

function Indicator({ cls }: { cls: string }) {
  return <span className={`indicator-dot ${cls}`} />;
}

export function SummaryCards({ run }: Props) {
  const { summary, points } = run;
  const last = points[points.length - 1];
  const target = extractTarget(run);
  const displayLabel = runLabel(run);

  // ── Executive Summary ──
  const delta = summary.frozen_delta_off_minus_on;
  const deltaVerdict = fpmVerdict(delta);
  const valVerdict = valLossVerdict(summary.final_val_loss);

  // ── Run Config (from parser) ──
  const configCards = [
    { label: "K (block_len)", value: summary.block_len != null ? String(summary.block_len) : "—", varKey: "block_len" },
    { label: "D", value: summary.d != null ? String(summary.d) : "—", varKey: "d" },
    { label: "Slots", value: summary.slots != null ? String(summary.slots) : "—", varKey: "slots" },
    { label: "avg_loss", value: fmt(summary.avg_loss, 4), varKey: "avg_loss" },
    { label: "ppl_proxy", value: fmt(summary.ppl_proxy, 2), varKey: "ppl_proxy" },
    { label: "Points", value: points.length.toLocaleString(), varKey: "avg_loss" },
  ];

  // ── Decision ──
  const decisionCards = [
    { label: "final_val_loss", value: fmt(summary.final_val_loss, 4), verdict: valVerdict, varKey: "final_val_loss" },
    { label: "best_val_loss", value: fmt(summary.best_val_loss, 4), verdict: valLossVerdict(summary.best_val_loss), varKey: "best_val_loss" },
    { label: "best_val_step", value: summary.best_val_step != null ? summary.best_val_step.toLocaleString() : "—", varKey: "best_val_step" },
    { label: "frozen_delta", value: fmt(delta, 4), verdict: deltaVerdict, varKey: "frozen_delta_off_minus_on" },
    { label: "loss_fpm_on", value: fmt(summary.loss_fpm_on, 4), varKey: "loss_fpm_on" },
    { label: "loss_fpm_off", value: fmt(summary.loss_fpm_off, 4), varKey: "loss_fpm_off" },
    { label: "loss_train (last)", value: last?.loss_train != null ? fmt(last.loss_train, 4) : "—", varKey: "loss_train" },
    { label: "loss_pre (last)", value: last?.loss_pre != null ? fmt(last.loss_pre, 4) : "—", varKey: "loss_pre" },
    { label: "loss_post (last)", value: last?.loss_post != null ? fmt(last.loss_post, 4) : "—", varKey: "loss_post" },
  ];

  // ── FPM / Memory ──
  const fpmCards = [
    { label: "fpm.utility", value: fmt(last?.fpm_utility, 4), varKey: "fpm_utility" },
    { label: "gate.mean", value: fmt(last?.gate_mean, 4), verdict: gateVerdict(last?.gate_mean), varKey: "gate_mean" },
    { label: "gated_rms", value: fmt(last?.gated_rms, 4), varKey: "gated_rms" },
    { label: "memory_rms", value: fmt(last?.memory_rms, 4), varKey: "memory_rms" },
    { label: "retrieval_loss", value: fmt(last?.fpm_retrieval_loss, 4), varKey: "fpm_retrieval_loss" },
    { label: "retrieval_sim", value: fmt(last?.fpm_retrieval_sim, 4), verdict: retrievalVerdict(last?.fpm_retrieval_sim), varKey: "fpm_retrieval_sim" },
  ];

  // ── Functional ──
  const functionalCards = [
    { label: "loss_gain", value: fmt(last?.loss_gain, 4), varKey: "loss_gain" },
    { label: "usefulness", value: fmt(last?.usefulness, 4), varKey: "usefulness" },
    { label: "target_rms", value: fmt(last?.target_rms, 4), verdict: functionalVerdict(last?.target_rms, last?.loss_gain), varKey: "target_rms" },
    { label: "residual_rms", value: fmt(last?.residual_rms, 4), varKey: "residual_rms" },
    { label: "bootstrap_active", value: fmt(last?.bootstrap_active, 4), varKey: "bootstrap_active" },
  ];

  // ── Stability ──
  const stabilityCards = [
    { label: "alpha_entity", value: fmt(last?.alpha_entity, 4), varKey: "alpha_entity" },
    { label: "train_loss (pre-deq)", value: fmt(last?.train_loss, 4), varKey: "train_loss" },
    { label: "steps/sec", value: fmt(last?.steps_per_sec, 1), varKey: "steps_per_sec" },
    { label: "elapsed_s", value: last?.elapsed_s != null ? last.elapsed_s.toFixed(0) : "—", varKey: "elapsed_s" },
  ];

  const renderCards = (cards: { label: string; value: string; verdict?: { text: string; cls: string }; varKey: string }[]) => (
    <div className="summary-cards">
      {cards.map((c) => (
        <Tooltip key={c.label} varKey={c.varKey} label={c.label}>
          <div className="summary-card">
            <span className="summary-label">{c.label}</span>
            <span className="summary-value">
              {c.value}
              {c.verdict && (
                <span className="summary-verdict">
                  <Indicator cls={c.verdict.cls} />
                  {c.verdict.text}
                </span>
              )}
            </span>
          </div>
        </Tooltip>
      ))}
    </div>
  );

  return (
    <div className="summary-cards-container">
      {/* Executive Summary */}
      <div className="summary-executive">
        <div className="summary-executive-title">Executive Summary</div>
        <div className="summary-executive-grid">
          <div className="summary-executive-item">
            <span className="summary-executive-label">Best Config</span>
            <span className="summary-executive-value accent" title={run.display_name}>
              {target}
            </span>
          </div>
          <div className="summary-executive-item">
            <span className="summary-executive-label">Best Individual Run</span>
            <span className="summary-executive-value" title={run.display_name}>{displayLabel}</span>
          </div>
          <div className="summary-executive-item">
            <span className="summary-executive-label">loss_fpm_on</span>
            <span className="summary-executive-value">{fmt(summary.loss_fpm_on, 4)}</span>
          </div>
          <div className="summary-executive-item">
            <span className="summary-executive-label">loss_fpm_off</span>
            <span className="summary-executive-value">{fmt(summary.loss_fpm_off, 4)}</span>
          </div>
          <div className="summary-executive-item">
            <span className="summary-executive-label">Delta loss</span>
            <span className={`summary-executive-value ${delta != null && delta > 0 ? "green" : delta != null && delta < 0 ? "red" : ""}`}>
              {delta != null ? (delta > 0 ? "+" : "") + fmt(delta, 4) : "—"}
            </span>
          </div>
          <div className="summary-executive-item">
            <span className="summary-executive-label">Frozen delta avg</span>
            <span className={`summary-executive-value ${delta != null && delta > 0.001 ? "green" : delta != null && delta < -0.001 ? "red" : ""}`}>
              {delta != null ? (delta > 0 ? "+" : "") + fmt(delta, 4) : "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Config */}
      <div className="summary-layer">
        <h4 className="layer-title">Config</h4>
        {renderCards(configCards)}
      </div>

      {/* Decision */}
      <div className="summary-layer">
        <h4 className="layer-title">Decision</h4>
        {renderCards(decisionCards)}
      </div>

      {/* FPM / Memory */}
      <div className="summary-layer">
        <h4 className="layer-title">FPM / Memory</h4>
        {renderCards(fpmCards)}
      </div>

      {/* Functional */}
      <div className="summary-layer">
        <h4 className="layer-title">Functional Residual</h4>
        {renderCards(functionalCards)}
      </div>

      {/* Stability */}
      <div className="summary-layer">
        <h4 className="layer-title">Internal Stability</h4>
        {renderCards(stabilityCards)}
      </div>
    </div>
  );
}
