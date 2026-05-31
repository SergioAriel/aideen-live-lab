use regex::Regex;
use serde::{Deserialize, Serialize};

// ──────────────────────────────────────────────
// Structs (shared with frontend via Tauri)
// ──────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AideenRunSummary {
    pub avg_loss: Option<f64>,
    pub ppl_proxy: Option<f64>,
    pub best_val_loss: Option<f64>,
    pub final_val_loss: Option<f64>,
    pub best_val_step: Option<i64>,
    pub frozen_delta_off_minus_on: Option<f64>,
    pub loss_fpm_on: Option<f64>,
    pub loss_fpm_off: Option<f64>,
    // Config fields extracted from first line
    pub block_len: Option<i64>,
    pub d: Option<i64>,
    pub slots: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AideenRoutingMetrics {
    pub delta_when_fpm_pos: Option<f64>,
    pub delta_when_fpm_neg: Option<f64>,
    pub delta_good_minus_bad: Option<f64>,
    pub delta_when_fast_pos: Option<f64>,
    pub delta_when_fast_neg: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FpmPipelineCounts {
    pub projected_per_step: Option<f64>,
    pub admitted_per_step: Option<f64>,
    pub admit_rate: Option<f64>,
    pub feed_size_avg: Option<f64>,
    pub consolidated_per_step: Option<f64>,
    pub cons_accept_rate: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FpmPipelineScores {
    pub write_score_avg: Option<f64>,
    pub replay_util_avg: Option<f64>,
    pub retrieval_sim_avg: Option<f64>,
    pub retrieval_loss_avg: Option<f64>,
    pub utility_avg: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FpmPipelineShapes {
    pub target_rms_avg: Option<f64>,
    pub conditioning_rms_avg: Option<f64>,
    pub cond_to_target_rms: Option<f64>,
    pub raw_op_rms_avg: Option<f64>,
    pub raw_to_cond_rms: Option<f64>,
    pub op_rms_avg: Option<f64>,
    pub op_to_target_rms: Option<f64>,
    pub interference_avg: Option<f64>,
    pub gate_mean_avg: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FpmSignalFlow {
    pub raw_op_rms: Option<f64>,
    pub retrieved_rms: Option<f64>,
    pub gated_rms: Option<f64>,
    pub memory_component_rms: Option<f64>,
    pub memory_rms: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct FpmSignalRatios {
    pub gated_to_retrieved: Option<f64>,
    pub component_to_memory: Option<f64>,
    pub ce_gain_no_fpm: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct UtilityAlignment {
    pub target_cosine: Option<f64>,
    pub norm_mse: Option<f64>,
    pub useful_high_mse_rate: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PreDeqInputMetrics {
    pub mode: Option<String>,
    pub input_rms: Option<f64>,
    pub input_raw_cosine: Option<f64>,
    pub input_shift_rms: Option<f64>,
    pub alpha_entity: Option<f64>,
    pub train_loss: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct PreDeqEntityMetrics {
    pub entropy: Option<f64>,
    pub util_std: Option<f64>,
    pub collapse: Option<f64>,
    pub top1: Option<f64>,
    pub readback_cosine: Option<f64>,
    pub delta_rms: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct MetricsPoint {
    pub step: i64,
    // Loss metrics
    pub loss_pre: Option<f64>,
    pub loss_train: Option<f64>,
    pub loss_post: Option<f64>,
    pub ppl_proxy: Option<f64>,
    pub fpm_loss: Option<f64>,
    pub train_loss: Option<f64>,
    // FPM Pipeline
    pub fpm_utility: Option<f64>,
    pub fpm_replay_utility: Option<f64>,
    pub fpm_retrieval_loss: Option<f64>,
    pub fpm_retrieval_sim: Option<f64>,
    pub projected: Option<f64>,
    pub candidates: Option<f64>,
    pub feed_entries: Option<f64>,
    pub consolidated: Option<f64>,
    pub accept_rate: Option<f64>,
    pub cons_rate: Option<f64>,
    // Gate / Signal
    pub gate: Option<f64>,
    pub gate_mean: Option<f64>,
    pub learned_cap: Option<f64>,
    pub desired: Option<f64>,
    pub policy_reward: Option<f64>,
    pub raw_op_rms: Option<f64>,
    pub op_rms: Option<f64>,
    pub gated_rms: Option<f64>,
    pub memory_rms: Option<f64>,
    pub target_cosine: Option<f64>,
    pub useful_high_mse: Option<f64>,
    // Functional / Utility
    pub util: Option<f64>,
    pub loss_gain: Option<f64>,
    pub usefulness: Option<f64>,
    pub residual_rms: Option<f64>,
    pub target_rms: Option<f64>,
    pub bootstrap_active: Option<f64>,
    // Pre-DEQ
    pub alpha_entity: Option<f64>,
    // Performance
    pub elapsed_s: Option<f64>,
    pub steps_per_sec: Option<f64>,
    // Original fields (restored)
    pub memory_utility: Option<f64>,
    pub fast_utility: Option<f64>,
    pub fast_retrieval_loss: Option<f64>,
    pub fused_memory_loss: Option<f64>,
    pub fast_retrieval_similarity: Option<f64>,
    pub fpm_retrieval_similarity: Option<f64>,
    pub fast_gate_mean: Option<f64>,
    pub fpm_gate_mean: Option<f64>,
    pub fpm_interference: Option<f64>,
    pub deq_residual: Option<f64>,
    pub deq_iterations: Option<i64>,
    pub h_rms: Option<f64>,
    pub grad_z_rms: Option<f64>,
    pub embed_grad_rms: Option<f64>,
    pub entity_entropy: Option<f64>,
    pub entity_collapse: Option<f64>,
    pub entity_top1: Option<f64>,
    pub entity_readback_cosine: Option<f64>,
    pub entity_delta_rms: Option<f64>,
    pub mem_write_score: Option<f64>,
    pub fpm_write_score: Option<f64>,
    pub fast_entries: Option<f64>,
    pub fpm_feed: Option<f64>,
    pub fpm_proto: Option<f64>,
    pub fast_usage: Option<f64>,
    pub fast_util: Option<f64>,
    pub fast_merge: Option<f64>,
    pub key_sim: Option<f64>,
    pub fpm_usage: Option<f64>,
    pub fpm_stab: Option<f64>,
    pub trans_cons: Option<f64>,
    pub deq_loss: Option<f64>,
    pub state_loss: Option<f64>,
    pub mem_proj_loss: Option<f64>,
    pub fpm_proj: Option<f64>,
    pub fpm_feed_count: Option<f64>,
    pub fpm_cand: Option<f64>,
    pub fpm_acc: Option<f64>,
    pub fpm_cons: Option<f64>,
    pub fpm_cons_rate: Option<f64>,
    pub fast_ws_mean: Option<f64>,
    pub feed_s_mean: Option<f64>,
    pub fpm_tgt_rms: Option<f64>,
    pub fpm_cond_rms: Option<f64>,
    pub fpm_raw_op_rms: Option<f64>,
    pub fpm_op_rms: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AideenRun {
    pub id: String,
    pub file_name: Option<String>,
    pub display_name: String,
    pub created_at: String,
    pub raw_text: Option<String>,
    pub summary: AideenRunSummary,
    pub routing: AideenRoutingMetrics,
    pub fpm_pipeline_counts: FpmPipelineCounts,
    pub fpm_pipeline_scores: FpmPipelineScores,
    pub fpm_pipeline_shapes: FpmPipelineShapes,
    pub fpm_signal_flow: FpmSignalFlow,
    pub fpm_signal_ratios: FpmSignalRatios,
    pub utility_alignment: UtilityAlignment,
    pub pre_deq_input: PreDeqInputMetrics,
    pub pre_deq_entity: PreDeqEntityMetrics,
    pub points: Vec<MetricsPoint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParseResult {
    pub run: AideenRun,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IncrementalUpdate {
    pub new_points: Vec<MetricsPoint>,
    pub summary: Option<AideenRunSummary>,
    pub fpm_pipeline_counts: Option<FpmPipelineCounts>,
    pub fpm_pipeline_scores: Option<FpmPipelineScores>,
    pub fpm_pipeline_shapes: Option<FpmPipelineShapes>,
    pub fpm_signal_flow: Option<FpmSignalFlow>,
    pub fpm_signal_ratios: Option<FpmSignalRatios>,
    pub utility_alignment: Option<UtilityAlignment>,
    pub pre_deq_input: Option<PreDeqInputMetrics>,
    pub pre_deq_entity: Option<PreDeqEntityMetrics>,
    pub total_lines: usize,
    pub eof: bool,
}

// ──────────────────────────────────────────────
// Helper: parse a single metric key=value
// ──────────────────────────────────────────────

fn parse_metric(line: &str, key: &str) -> Option<f64> {
    // Handles: key=value, key=+value, key=-value
    let re = Regex::new(&format!(
        r"{}=([+-]?\d+(?:\.\d+)?(?:e[+-]?\d+)?)",
        regex::escape(key)
    ))
    .ok()?;
    let cap = re.captures(line)?;
    let val: f64 = cap[1].parse().ok()?;
    if val.is_finite() { Some(val) } else { None }
}

fn is_step_start(line: &str) -> bool {
    line.starts_with("step=") || line.starts_with("val step=")
}

fn is_summary_start(line: &str) -> bool {
    line.starts_with("train_summary")
        || line.starts_with("val_summary")
        || line.starts_with("best_val_summary")
        || line.starts_with("frozen_fpm_ablation_summary")
        || line.starts_with("best_frozen_fpm_ablation_summary")
        || line.starts_with("final_frozen_fpm_ablation_summary")
}

// fn parse_string_metric(line: &str, key: &str) -> Option<String> {
//     let re = Regex::new(&format!(r"{}=(\S+)", regex::escape(key))).ok()?;
//     let cap = re.captures(line)?;
//     Some(cap[1].to_string())
// }


// ──────────────────────────────────────────────
// Parse a single step line (regular or val step)
// ──────────────────────────────────────────────

fn parse_step_line(line: &str) -> Option<MetricsPoint> {
    let step = parse_metric(line, "step")?;
    let step_i = step as i64;

    let mut p = MetricsPoint {
        step: step_i,
        ..Default::default()
    };

    // Common metrics
    p.loss_pre = parse_metric(line, "loss_pre");
    p.loss_train = parse_metric(line, "loss_train");
    p.loss_post = parse_metric(line, "loss_post");

    // Regular step line metrics
    p.elapsed_s = parse_metric(line, "elapsed_s");
    p.steps_per_sec = parse_metric(line, "steps_per_sec");
    p.fpm_loss = parse_metric(line, "fpm_loss");
    p.gate = parse_metric(line, "gate");
    p.desired = parse_metric(line, "desired");
    p.util = parse_metric(line, "util");

    // Val step metrics
    p.ppl_proxy = parse_metric(line, "ppl_proxy");

    Some(p)
}

// ──────────────────────────────────────────────
// Parse continuation lines (fpm:, pipeline:, gate:, signal:, functional:, pre_deq:)
// ──────────────────────────────────────────────

fn parse_continuation_lines(lines: &[&str]) -> MetricsPoint {
    let mut p = MetricsPoint::default();

    for line in lines {
        let trimmed = line.trim();

        if trimmed.starts_with("fpm:") || trimmed.starts_with("  fpm:") {
            p.fpm_utility = parse_metric(trimmed, "utility");
            p.fpm_replay_utility = parse_metric(trimmed, "replay_utility");
            p.fpm_retrieval_loss = parse_metric(trimmed, "retrieval_loss");
            p.fpm_retrieval_sim = parse_metric(trimmed, "retrieval_sim");
        } else if trimmed.starts_with("pipeline:") || trimmed.starts_with("  pipeline:") {
            p.projected = parse_metric(trimmed, "projected");
            p.candidates = parse_metric(trimmed, "candidates");
            p.feed_entries = parse_metric(trimmed, "feed_entries");
            p.consolidated = parse_metric(trimmed, "consolidated");
            p.accept_rate = parse_metric(trimmed, "accept_rate");
            p.cons_rate = parse_metric(trimmed, "cons_rate");
        } else if trimmed.starts_with("gate:") || trimmed.starts_with("  gate:") {
            p.gate_mean = parse_metric(trimmed, "mean");
            p.learned_cap = parse_metric(trimmed, "learned_cap");
            p.desired = parse_metric(trimmed, "desired");
            p.policy_reward = parse_metric(trimmed, "policy_reward");
        } else if trimmed.starts_with("signal:") || trimmed.starts_with("  signal:") {
            p.raw_op_rms = parse_metric(trimmed, "raw_op_rms");
            p.op_rms = parse_metric(trimmed, "op_rms");
            p.gated_rms = parse_metric(trimmed, "gated_rms");
            p.memory_rms = parse_metric(trimmed, "memory_rms");
            p.target_cosine = parse_metric(trimmed, "target_cosine");
            p.useful_high_mse = parse_metric(trimmed, "useful_high_mse");
        } else if trimmed.starts_with("functional:") || trimmed.starts_with("  functional:") {
            p.loss_gain = parse_metric(trimmed, "loss_gain");
            p.usefulness = parse_metric(trimmed, "usefulness");
            p.residual_rms = parse_metric(trimmed, "residual_rms");
            p.target_rms = parse_metric(trimmed, "target_rms");
            p.bootstrap_active = parse_metric(trimmed, "bootstrap_active");
        } else if trimmed.starts_with("pre_deq:") || trimmed.starts_with("  pre_deq:") {
            p.train_loss = parse_metric(trimmed, "train_loss");
            p.alpha_entity = parse_metric(trimmed, "alpha_entity");
        }
    }

    p
}

// ──────────────────────────────────────────────
// Parse a batch of lines incrementally (for file watching)
// ──────────────────────────────────────────────

pub fn parse_incremental_lines(lines: &[String], total_lines: usize, eof: bool) -> IncrementalUpdate {
    let mut update = IncrementalUpdate {
        new_points: Vec::new(),
        summary: None,
        fpm_pipeline_counts: None,
        fpm_pipeline_scores: None,
        fpm_pipeline_shapes: None,
        fpm_signal_flow: None,
        fpm_signal_ratios: None,
        utility_alignment: None,
        pre_deq_input: None,
        pre_deq_entity: None,
        total_lines,
        eof,
    };

    // We need to look at lines in groups: a step line followed by continuation lines
    let mut i = 0;
    while i < lines.len() {
        let trimmed = lines[i].trim();

        if is_step_start(trimmed) {
            // Collect continuation lines (indented lines after the step line)
            let mut continuation: Vec<&str> = Vec::new();
            let mut j = i + 1;
            while j < lines.len() {
                let next = lines[j].trim();
                if is_step_start(next) || is_summary_start(next) {
                    break;
                }
                if next.starts_with("fpm:") || next.starts_with("pipeline:") || next.starts_with("gate:")
                    || next.starts_with("signal:") || next.starts_with("functional:") || next.starts_with("pre_deq:")
                {
                    continuation.push(lines[j].as_str());
                }
                j += 1;
            }

            if let Some(mut point) = parse_step_line(trimmed) {
                // Merge continuation data
                let cont = parse_continuation_lines(&continuation);
                merge_point(&mut point, &cont);
                update.new_points.push(point);
            }

            i = j;
        } else {
            i += 1;
        }
    }

    update
}

fn merge_point(target: &mut MetricsPoint, source: &MetricsPoint) {
    // Only overwrite if source has a value
    macro_rules! merge_opt {
        ($field:ident) => {
            if source.$field.is_some() {
                target.$field = source.$field;
            }
        };
    }
    merge_opt!(loss_pre);
    merge_opt!(loss_train);
    merge_opt!(loss_post);
    merge_opt!(fpm_utility);
    merge_opt!(fpm_replay_utility);
    merge_opt!(fpm_retrieval_loss);
    merge_opt!(fpm_retrieval_sim);
    merge_opt!(projected);
    merge_opt!(candidates);
    merge_opt!(feed_entries);
    merge_opt!(consolidated);
    merge_opt!(accept_rate);
    merge_opt!(cons_rate);
    merge_opt!(gate_mean);
    merge_opt!(learned_cap);
    merge_opt!(desired);
    merge_opt!(policy_reward);
    merge_opt!(raw_op_rms);
    merge_opt!(op_rms);
    merge_opt!(gated_rms);
    merge_opt!(memory_rms);
    merge_opt!(target_cosine);
    merge_opt!(useful_high_mse);
    merge_opt!(loss_gain);
    merge_opt!(usefulness);
    merge_opt!(residual_rms);
    merge_opt!(target_rms);
    merge_opt!(bootstrap_active);
    merge_opt!(train_loss);
    merge_opt!(alpha_entity);
    merge_opt!(fpm_loss);
    merge_opt!(gate);
    merge_opt!(util);
    merge_opt!(elapsed_s);
    merge_opt!(steps_per_sec);
}

// ──────────────────────────────────────────────
// Parse summary blocks (train_summary, val_summary, best_val_summary, etc.)
// ──────────────────────────────────────────────

fn parse_summary_block(lines: &[&str]) -> (MetricsPoint, AideenRunSummary, FpmPipelineCounts, FpmPipelineScores, FpmPipelineShapes, FpmSignalFlow, FpmSignalRatios, UtilityAlignment, PreDeqInputMetrics, PreDeqEntityMetrics) {
    let mut point = MetricsPoint::default();
    let mut summary = AideenRunSummary::default();
    let mut counts = FpmPipelineCounts::default();
    let mut scores = FpmPipelineScores::default();
    let mut shapes = FpmPipelineShapes::default();
    let mut signal_flow = FpmSignalFlow::default();
    let signal_ratios = FpmSignalRatios::default();
    let mut alignment = UtilityAlignment::default();
    let mut pre_deq_input = PreDeqInputMetrics::default();
    let pre_deq_entity = PreDeqEntityMetrics::default();

    for line in lines {
        let trimmed = line.trim();

        // First line: e.g. "train_summary steps=16000 loss_pre=2.6928 ..."
        if trimmed.starts_with("train_summary") {
            point.step = parse_metric(trimmed, "step").unwrap_or(0.0) as i64;
            point.loss_pre = parse_metric(trimmed, "loss_pre");
            point.loss_train = parse_metric(trimmed, "loss_train");
            point.loss_post = parse_metric(trimmed, "loss_post");
            point.ppl_proxy = parse_metric(trimmed, "ppl_proxy");
            summary.avg_loss = point.loss_post;
            summary.ppl_proxy = point.ppl_proxy;
        }

        if trimmed.starts_with("val_summary") {
            point.step = parse_metric(trimmed, "step").unwrap_or(0.0) as i64;
            point.loss_pre = parse_metric(trimmed, "loss_pre");
            point.loss_train = parse_metric(trimmed, "loss_train");
            point.loss_post = parse_metric(trimmed, "loss_post");
            point.ppl_proxy = parse_metric(trimmed, "ppl_proxy");
            summary.final_val_loss = point.loss_pre;
            summary.ppl_proxy = point.ppl_proxy;
        }

        if trimmed.starts_with("best_val_summary") {
            point.step = parse_metric(trimmed, "step").unwrap_or(0.0) as i64;
            point.loss_pre = parse_metric(trimmed, "loss_pre");
            point.loss_train = parse_metric(trimmed, "loss_train");
            point.loss_post = parse_metric(trimmed, "loss_post");
            point.ppl_proxy = parse_metric(trimmed, "ppl_proxy");
            summary.best_val_loss = point.loss_pre;
            summary.best_val_step = Some(point.step);
            summary.ppl_proxy = point.ppl_proxy;
        }

        // Ablation summary lines
        if trimmed.starts_with("frozen_fpm_ablation_summary")
            || trimmed.starts_with("best_frozen_fpm_ablation_summary")
            || trimmed.starts_with("final_frozen_fpm_ablation_summary")
        {
            summary.loss_fpm_on = parse_metric(trimmed, "loss_fpm_on");
            summary.loss_fpm_off = parse_metric(trimmed, "loss_fpm_off");
            summary.frozen_delta_off_minus_on = parse_metric(trimmed, "delta_off_minus_on");
        }

        // Continuation: fpm:
        if trimmed.starts_with("fpm:") || trimmed.starts_with("  fpm:") {
            point.fpm_utility = parse_metric(trimmed, "utility");
            point.fpm_replay_utility = parse_metric(trimmed, "replay_utility");
            point.fpm_retrieval_loss = parse_metric(trimmed, "retrieval_loss");
            point.fpm_retrieval_sim = parse_metric(trimmed, "retrieval_sim");
            scores.utility_avg = point.fpm_utility;
            scores.replay_util_avg = point.fpm_replay_utility;
            scores.retrieval_loss_avg = point.fpm_retrieval_loss;
            scores.retrieval_sim_avg = point.fpm_retrieval_sim;
        }

        // Continuation: pipeline:
        if trimmed.starts_with("pipeline:") || trimmed.starts_with("  pipeline:") {
            point.projected = parse_metric(trimmed, "projected");
            point.candidates = parse_metric(trimmed, "candidates");
            point.feed_entries = parse_metric(trimmed, "feed_entries");
            point.consolidated = parse_metric(trimmed, "consolidated");
            point.accept_rate = parse_metric(trimmed, "accept_rate");
            point.cons_rate = parse_metric(trimmed, "cons_rate");
            counts.projected_per_step = point.projected;
            counts.admitted_per_step = point.feed_entries;
            counts.admit_rate = point.accept_rate;
            counts.feed_size_avg = point.candidates;
            counts.consolidated_per_step = point.consolidated;
            counts.cons_accept_rate = point.cons_rate;
        }

        // Continuation: gate:
        if trimmed.starts_with("gate:") || trimmed.starts_with("  gate:") {
            point.gate_mean = parse_metric(trimmed, "mean");
            point.learned_cap = parse_metric(trimmed, "learned_cap");
            point.desired = parse_metric(trimmed, "desired");
            point.policy_reward = parse_metric(trimmed, "policy_reward");
            shapes.gate_mean_avg = point.gate_mean;
        }

        // Continuation: signal:
        if trimmed.starts_with("signal:") || trimmed.starts_with("  signal:") {
            point.raw_op_rms = parse_metric(trimmed, "raw_op_rms");
            point.op_rms = parse_metric(trimmed, "op_rms");
            point.gated_rms = parse_metric(trimmed, "gated_rms");
            point.memory_rms = parse_metric(trimmed, "memory_rms");
            point.target_cosine = parse_metric(trimmed, "target_cosine");
            point.useful_high_mse = parse_metric(trimmed, "useful_high_mse");
            signal_flow.raw_op_rms = point.raw_op_rms;
            signal_flow.gated_rms = point.gated_rms;
            signal_flow.memory_rms = point.memory_rms;
            alignment.target_cosine = point.target_cosine;
            alignment.useful_high_mse_rate = point.useful_high_mse;
            shapes.raw_op_rms_avg = point.raw_op_rms;
            shapes.op_rms_avg = point.op_rms;
        }

        // Continuation: functional:
        if trimmed.starts_with("functional:") || trimmed.starts_with("  functional:") {
            point.loss_gain = parse_metric(trimmed, "loss_gain");
            point.usefulness = parse_metric(trimmed, "usefulness");
            point.residual_rms = parse_metric(trimmed, "residual_rms");
            point.target_rms = parse_metric(trimmed, "target_rms");
            point.bootstrap_active = parse_metric(trimmed, "bootstrap_active");
            shapes.target_rms_avg = point.target_rms;
            shapes.conditioning_rms_avg = point.residual_rms;
        }

        // Continuation: pre_deq:
        if trimmed.starts_with("pre_deq:") || trimmed.starts_with("  pre_deq:") {
            point.train_loss = parse_metric(trimmed, "train_loss");
            point.alpha_entity = parse_metric(trimmed, "alpha_entity");
            pre_deq_input.train_loss = point.train_loss;
            pre_deq_input.alpha_entity = point.alpha_entity;
        }

        // Continuation: frozen_fpm:
        if trimmed.starts_with("frozen_fpm:") || trimmed.starts_with("  frozen_fpm:") {
            point.gate_mean = parse_metric(trimmed, "gate_on");
            point.gated_rms = parse_metric(trimmed, "gated_rms_on");
            point.memory_rms = parse_metric(trimmed, "memory_rms_on");
            point.fpm_retrieval_sim = parse_metric(trimmed, "retrieval_sim_on");
        }
    }

    (point, summary, counts, scores, shapes, signal_flow, signal_ratios, alignment, pre_deq_input, pre_deq_entity)
}

// ──────────────────────────────────────────────
// Full log parser (for file import)
// ──────────────────────────────────────────────

pub fn parse_aideen_log(text: &str, file_name: Option<String>, display_name: Option<String>) -> ParseResult {
    let mut warnings = Vec::new();
    let mut summary = AideenRunSummary::default();
    let mut points = Vec::new();
    let routing = AideenRoutingMetrics::default();
    let mut fpm_pipeline_counts = FpmPipelineCounts::default();
    let mut fpm_pipeline_scores = FpmPipelineScores::default();
    let mut fpm_pipeline_shapes = FpmPipelineShapes::default();
    let mut fpm_signal_flow = FpmSignalFlow::default();
    let fpm_signal_ratios = FpmSignalRatios::default();
    let mut utility_alignment = UtilityAlignment::default();
    let mut pre_deq_input = PreDeqInputMetrics::default();
    let pre_deq_entity = PreDeqEntityMetrics::default();

    let name = display_name.unwrap_or_else(|| {
        file_name
            .clone()
            .unwrap_or_else(|| "Unnamed Run".to_string())
    });

    let lines: Vec<&str> = text.lines().collect();
    let mut i = 0;

    // Parse config from the first config line. Recent logs may start with Rust warnings.
    if let Some(config_line) = lines
        .iter()
        .find(|line| line.trim().starts_with("block_deq") || line.trim().starts_with("block_deq_train"))
    {
        summary.block_len = parse_metric(config_line, "block_len").map(|v| v as i64);
        summary.d = parse_metric(config_line, "d").map(|v| v as i64);
        summary.slots = parse_metric(config_line, "slots").map(|v| v as i64);
    }

    while i < lines.len() {
        let trimmed = lines[i].trim();

        if is_step_start(trimmed) {
            // Collect continuation lines
            let mut continuation: Vec<&str> = Vec::new();
            let mut j = i + 1;
            while j < lines.len() {
                let next = lines[j].trim();
                if is_step_start(next) || is_summary_start(next) {
                    break;
                }
                if next.starts_with("fpm:") || next.starts_with("pipeline:") || next.starts_with("gate:")
                    || next.starts_with("signal:") || next.starts_with("functional:") || next.starts_with("pre_deq:")
                    || next.starts_with("frozen_fpm:")
                {
                    continuation.push(lines[j]);
                }
                j += 1;
            }

            if let Some(mut point) = parse_step_line(trimmed) {
                let cont = parse_continuation_lines(&continuation);
                merge_point(&mut point, &cont);
                points.push(point);
            }

            i = j;
        } else if is_summary_start(trimmed)
        {
            // Collect continuation lines for summary block
            let mut block_lines: Vec<&str> = Vec::new();
            let mut j = i;
            while j < lines.len() {
                let next = lines[j].trim();
                if is_step_start(next) || is_summary_start(next)
                {
                    if j > i {
                        break;
                    }
                }
                block_lines.push(lines[j]);
                j += 1;
            }

            let (point, s, counts, scores, shapes, signal_flow, _signal_ratios, alignment, pre_in, _pre_ent) = parse_summary_block(&block_lines);

            // Merge summary data
            if s.avg_loss.is_some() { summary.avg_loss = s.avg_loss; }
            if s.ppl_proxy.is_some() { summary.ppl_proxy = s.ppl_proxy; }
            if s.final_val_loss.is_some() { summary.final_val_loss = s.final_val_loss; }
            if s.best_val_step.is_some() { summary.best_val_step = s.best_val_step; }
            if s.loss_fpm_on.is_some() { summary.loss_fpm_on = s.loss_fpm_on; }
            if s.loss_fpm_off.is_some() { summary.loss_fpm_off = s.loss_fpm_off; }
            if s.frozen_delta_off_minus_on.is_some() { summary.frozen_delta_off_minus_on = s.frozen_delta_off_minus_on; }
            if s.best_val_loss.is_some() { summary.best_val_loss = s.best_val_loss; }

            // Merge pipeline counts
            if counts.projected_per_step.is_some() { fpm_pipeline_counts.projected_per_step = counts.projected_per_step; }
            if counts.admitted_per_step.is_some() { fpm_pipeline_counts.admitted_per_step = counts.admitted_per_step; }
            if counts.admit_rate.is_some() { fpm_pipeline_counts.admit_rate = counts.admit_rate; }
            if counts.feed_size_avg.is_some() { fpm_pipeline_counts.feed_size_avg = counts.feed_size_avg; }
            if counts.consolidated_per_step.is_some() { fpm_pipeline_counts.consolidated_per_step = counts.consolidated_per_step; }
            if counts.cons_accept_rate.is_some() { fpm_pipeline_counts.cons_accept_rate = counts.cons_accept_rate; }

            // Merge pipeline scores
            if scores.write_score_avg.is_some() { fpm_pipeline_scores.write_score_avg = scores.write_score_avg; }
            if scores.replay_util_avg.is_some() { fpm_pipeline_scores.replay_util_avg = scores.replay_util_avg; }
            if scores.retrieval_sim_avg.is_some() { fpm_pipeline_scores.retrieval_sim_avg = scores.retrieval_sim_avg; }
            if scores.retrieval_loss_avg.is_some() { fpm_pipeline_scores.retrieval_loss_avg = scores.retrieval_loss_avg; }
            if scores.utility_avg.is_some() { fpm_pipeline_scores.utility_avg = scores.utility_avg; }

            // Merge pipeline shapes
            if shapes.target_rms_avg.is_some() { fpm_pipeline_shapes.target_rms_avg = shapes.target_rms_avg; }
            if shapes.conditioning_rms_avg.is_some() { fpm_pipeline_shapes.conditioning_rms_avg = shapes.conditioning_rms_avg; }
            if shapes.raw_op_rms_avg.is_some() { fpm_pipeline_shapes.raw_op_rms_avg = shapes.raw_op_rms_avg; }
            if shapes.op_rms_avg.is_some() { fpm_pipeline_shapes.op_rms_avg = shapes.op_rms_avg; }
            if shapes.interference_avg.is_some() { fpm_pipeline_shapes.interference_avg = shapes.interference_avg; }
            if shapes.gate_mean_avg.is_some() { fpm_pipeline_shapes.gate_mean_avg = shapes.gate_mean_avg; }

            // Merge signal flow
            if signal_flow.raw_op_rms.is_some() { fpm_signal_flow.raw_op_rms = signal_flow.raw_op_rms; }
            if signal_flow.gated_rms.is_some() { fpm_signal_flow.gated_rms = signal_flow.gated_rms; }
            if signal_flow.memory_rms.is_some() { fpm_signal_flow.memory_rms = signal_flow.memory_rms; }

            // Merge utility alignment
            if alignment.target_cosine.is_some() { utility_alignment.target_cosine = alignment.target_cosine; }
            if alignment.useful_high_mse_rate.is_some() { utility_alignment.useful_high_mse_rate = alignment.useful_high_mse_rate; }

            // Merge pre-deq
            if pre_in.train_loss.is_some() { pre_deq_input.train_loss = pre_in.train_loss; }
            if pre_in.alpha_entity.is_some() { pre_deq_input.alpha_entity = pre_in.alpha_entity; }

            // Also add the point if it has step data
            if point.step > 0 {
                points.push(point);
            }

            i = j;
        } else {
            i += 1;
        }
    }

    // Parse frozen_delta_off_minus_on, loss_fpm_on, loss_fpm_off from raw text (fallback)
    if summary.frozen_delta_off_minus_on.is_none() {
        summary.frozen_delta_off_minus_on = parse_metric(text, "frozen_delta_off_minus_on");
    }
    if summary.loss_fpm_on.is_none() {
        summary.loss_fpm_on = parse_metric(text, "loss_fpm_on");
    }
    if summary.loss_fpm_off.is_none() {
        summary.loss_fpm_off = parse_metric(text, "loss_fpm_off");
    }
    if summary.best_val_loss.is_none() {
        summary.best_val_loss = parse_metric(text, "best_val_loss");
    }
    if summary.best_val_step.is_none() {
        if let Some(bv) = parse_metric(text, "best_val_step") {
            summary.best_val_step = Some(bv as i64);
        }
    }

    if summary.avg_loss.is_none() {
        warnings.push("No step metrics found in log.".to_string());
    }

    let id = uuid::Uuid::new_v4().to_string();
    let created_at = chrono::Utc::now().to_rfc3339();

    let run = AideenRun {
        id,
        file_name,
        display_name: name,
        created_at,
        raw_text: Some(text.to_string()),
        summary,
        routing,
        fpm_pipeline_counts,
        fpm_pipeline_scores,
        fpm_pipeline_shapes,
        fpm_signal_flow,
        fpm_signal_ratios,
        utility_alignment,
        pre_deq_input,
        pre_deq_entity,
        points,
    };

    ParseResult { run, warnings }
}

#[cfg(test)]
mod tests {
    use super::parse_aideen_log;

    #[test]
    fn parses_recent_logs_with_warnings_and_plain_frozen_ablation() {
        let text = r#"
warning: unused import: `loss`
block_deq_train corpus=tiny.txt block_len=32 d=32 slots=4 steps=16000
val step=16000 steps=64 loss_pre=2.5503 loss_train=2.5503 loss_post=2.5503 ppl_proxy=12.8105
  fpm: utility=+0.001263 replay_utility=+0.001263 retrieval_loss=0.019018 retrieval_sim=0.776308
  pipeline: projected=64.000 candidates=61.906 feed_entries=512.000 consolidated=85.172 accept_rate=0.967 cons_rate=0.166
  gate: mean=0.185438 learned_cap=0.200000 desired=0.175412 policy_reward=+0.000000
  signal: raw_op_rms=0.185235 op_rms=0.145181 gated_rms=0.026916 memory_rms=0.068450 target_cosine=+0.350930 useful_high_mse=0.593750
val_summary steps=64 loss_pre=2.5503 loss_train=2.5503 loss_post=2.5503 ppl_proxy=12.8105
frozen_fpm_ablation_summary steps=64 loss_fpm_on=2.5493 ppl_fpm_on=12.7985 loss_fpm_off=2.5499 ppl_fpm_off=12.8057 delta_off_minus_on=+0.000557
  frozen_fpm: gate_on=0.187644 gated_rms_on=0.027769 memory_rms_on=0.071567 retrieval_sim_on=0.779057
"#;

        let parsed = parse_aideen_log(text, None, Some("sample".to_string())).run;
        assert_eq!(parsed.summary.block_len, Some(32));
        assert_eq!(parsed.summary.d, Some(32));
        assert_eq!(parsed.summary.slots, Some(4));
        assert_eq!(parsed.summary.final_val_loss, Some(2.5503));
        assert_eq!(parsed.summary.loss_fpm_on, Some(2.5493));
        assert_eq!(parsed.summary.loss_fpm_off, Some(2.5499));
        assert_eq!(parsed.summary.frozen_delta_off_minus_on, Some(0.000557));
    }
}
