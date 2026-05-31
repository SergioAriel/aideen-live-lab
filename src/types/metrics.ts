export type NumericValue = number | null;

export interface AideenRunSummary {
  avg_loss: NumericValue;
  ppl_proxy: NumericValue;
  best_val_loss: NumericValue;
  final_val_loss: NumericValue;
  best_val_step: number | null;
  frozen_delta_off_minus_on: NumericValue;
  loss_fpm_on: NumericValue;
  loss_fpm_off: NumericValue;
  // Config fields extracted from first line
  block_len: number | null;
  d: number | null;
  slots: number | null;
}

export interface AideenRoutingMetrics {
  delta_when_fpm_pos: NumericValue;
  delta_when_fpm_neg: NumericValue;
  delta_good_minus_bad: NumericValue;
  delta_when_fast_pos: NumericValue;
  delta_when_fast_neg: NumericValue;
}

export interface FpmPipelineCounts {
  projected_per_step: NumericValue;
  admitted_per_step: NumericValue;
  admit_rate: NumericValue;
  feed_size_avg: NumericValue;
  consolidated_per_step: NumericValue;
  cons_accept_rate: NumericValue;
}

export interface FpmPipelineScores {
  write_score_avg: NumericValue;
  replay_util_avg: NumericValue;
  retrieval_sim_avg: NumericValue;
  retrieval_loss_avg: NumericValue;
  utility_avg: NumericValue;
}

export interface FpmPipelineShapes {
  target_rms_avg: NumericValue;
  conditioning_rms_avg: NumericValue;
  cond_to_target_rms: NumericValue;
  raw_op_rms_avg: NumericValue;
  raw_to_cond_rms: NumericValue;
  op_rms_avg: NumericValue;
  op_to_target_rms: NumericValue;
  interference_avg: NumericValue;
  gate_mean_avg: NumericValue;
}

export interface FpmSignalFlow {
  raw_op_rms: NumericValue;
  retrieved_rms: NumericValue;
  gated_rms: NumericValue;
  memory_component_rms: NumericValue;
  memory_rms: NumericValue;
}

export interface FpmSignalRatios {
  gated_to_retrieved: NumericValue;
  component_to_memory: NumericValue;
  ce_gain_no_fpm: NumericValue;
}

export interface UtilityAlignment {
  target_cosine: NumericValue;
  norm_mse: NumericValue;
  useful_high_mse_rate: NumericValue;
}

export interface PreDeqInputMetrics {
  mode: string | null;
  input_rms: NumericValue;
  input_raw_cosine: NumericValue;
  input_shift_rms: NumericValue;
  alpha_entity: NumericValue;
  train_loss: NumericValue;
}

export interface PreDeqEntityMetrics {
  entropy: NumericValue;
  util_std: NumericValue;
  collapse: NumericValue;
  top1: NumericValue;
  readback_cosine: NumericValue;
  delta_rms: NumericValue;
}

export interface MetricsPoint {
  step: number;
  // Loss metrics
  loss_pre?: NumericValue;
  loss_train?: NumericValue;
  loss_post?: NumericValue;
  ppl_proxy?: NumericValue;
  fpm_loss?: NumericValue;
  train_loss?: NumericValue;
  // FPM Pipeline
  fpm_utility?: NumericValue;
  fpm_replay_utility?: NumericValue;
  fpm_retrieval_loss?: NumericValue;
  fpm_retrieval_sim?: NumericValue;
  projected?: NumericValue;
  candidates?: NumericValue;
  feed_entries?: NumericValue;
  consolidated?: NumericValue;
  accept_rate?: NumericValue;
  cons_rate?: NumericValue;
  // Gate / Signal
  gate?: NumericValue;
  gate_mean?: NumericValue;
  learned_cap?: NumericValue;
  desired?: NumericValue;
  policy_reward?: NumericValue;
  raw_op_rms?: NumericValue;
  op_rms?: NumericValue;
  gated_rms?: NumericValue;
  memory_rms?: NumericValue;
  target_cosine?: NumericValue;
  useful_high_mse?: NumericValue;
  // Functional / Utility
  util?: NumericValue;
  loss_gain?: NumericValue;
  usefulness?: NumericValue;
  residual_rms?: NumericValue;
  target_rms?: NumericValue;
  bootstrap_active?: NumericValue;
  // Pre-DEQ
  alpha_entity?: NumericValue;
  // Performance
  elapsed_s?: NumericValue;
  steps_per_sec?: NumericValue;
  // Original fields (restored)
  memory_utility?: NumericValue;
  fast_utility?: NumericValue;
  fast_retrieval_loss?: NumericValue;
  fused_memory_loss?: NumericValue;
  fast_retrieval_similarity?: NumericValue;
  fpm_retrieval_similarity?: NumericValue;
  fast_gate_mean?: NumericValue;
  fpm_gate_mean?: NumericValue;
  fpm_interference?: NumericValue;
  deq_residual?: NumericValue;
  deq_iterations?: number | null;
  h_rms?: NumericValue;
  grad_z_rms?: NumericValue;
  embed_grad_rms?: NumericValue;
  entity_entropy?: NumericValue;
  entity_collapse?: NumericValue;
  entity_top1?: NumericValue;
  entity_readback_cosine?: NumericValue;
  entity_delta_rms?: NumericValue;
  mem_write_score?: NumericValue;
  fpm_write_score?: NumericValue;
  fast_entries?: NumericValue;
  fpm_feed?: NumericValue;
  fpm_proto?: NumericValue;
  fast_usage?: NumericValue;
  fast_util?: NumericValue;
  fast_merge?: NumericValue;
  key_sim?: NumericValue;
  fpm_usage?: NumericValue;
  fpm_stab?: NumericValue;
  trans_cons?: NumericValue;
  deq_loss?: NumericValue;
  state_loss?: NumericValue;
  mem_proj_loss?: NumericValue;
  fpm_proj?: NumericValue;
  fpm_feed_count?: NumericValue;
  fpm_cand?: NumericValue;
  fpm_acc?: NumericValue;
  fpm_cons?: NumericValue;
  fpm_cons_rate?: NumericValue;
  fast_ws_mean?: NumericValue;
  feed_s_mean?: NumericValue;
  fpm_tgt_rms?: NumericValue;
  fpm_cond_rms?: NumericValue;
  fpm_raw_op_rms?: NumericValue;
  fpm_op_rms?: NumericValue;
}

export interface AideenRunMetrics {
  id: string;
  file_name?: string;
  display_name: string;
  created_at: string;
  raw_text?: string;
  summary: AideenRunSummary;
  routing: AideenRoutingMetrics;
  fpm_pipeline_counts: FpmPipelineCounts;
  fpm_pipeline_scores: FpmPipelineScores;
  fpm_pipeline_shapes: FpmPipelineShapes;
  fpm_signal_flow: FpmSignalFlow;
  fpm_signal_ratios: FpmSignalRatios;
  utility_alignment: UtilityAlignment;
  pre_deq_input: PreDeqInputMetrics;
  pre_deq_entity: PreDeqEntityMetrics;
  points: MetricsPoint[];
}

export interface ParseResult {
  run: AideenRunMetrics;
  warnings: string[];
}

/** Incremental update from the file watcher */
export interface IncrementalUpdate {
  new_points: MetricsPoint[];
  summary?: Partial<AideenRunSummary>;
  fpm_pipeline_counts?: Partial<FpmPipelineCounts>;
  fpm_pipeline_scores?: Partial<FpmPipelineScores>;
  fpm_pipeline_shapes?: Partial<FpmPipelineShapes>;
  fpm_signal_flow?: Partial<FpmSignalFlow>;
  fpm_signal_ratios?: Partial<FpmSignalRatios>;
  utility_alignment?: Partial<UtilityAlignment>;
  pre_deq_input?: Partial<PreDeqInputMetrics>;
  pre_deq_entity?: Partial<PreDeqEntityMetrics>;
  total_lines: number;
  eof: boolean;
}
