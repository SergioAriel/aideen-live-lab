export const SAMPLE_LOG = `summary avg_loss=4.1066 ppl_proxy=60.7427
delta_when_fpm_pos=+0.026898
delta_when_fpm_neg=-0.038283
delta_good_minus_bad=+0.065181
delta_when_fast_pos=-0.020098
delta_when_fast_neg=+0.022669
--- FPM Pipeline Diagnostics ---
  pipeline_counts: projected_per_step=16.000 admitted_per_step=15.995 admit_rate=1.000 feed_size_avg=495.056 consolidated_per_step=143.294 cons_accept_rate=0.288
  pipeline_scores: write_score_avg=+0.362755 replay_util_avg=+0.071286 retrieval_sim_avg=0.938046 retrieval_loss_avg=0.327266 utility_avg=+0.071286
  pipeline_shapes: target_rms_avg=0.083645 conditioning_rms_avg=0.929155 cond_to_target_rms=11.108318 raw_op_rms_avg=0.848180 raw_to_cond_rms=0.912850 op_rms_avg=0.570062 op_to_target_rms=6.815255 interference_avg=0.100086 gate_mean_avg=0.462813
--- FPM Signal Flow Diagnostics ---
  signal_flow: raw_op_rms=0.848180 retrieved_rms=0.570062 gated_rms=0.309303 memory_component_rms=0.231309 memory_rms=0.242841
  signal_ratios: gated_to_retrieved=0.540203 component_to_memory=0.658171 ce_gain_no_fpm=+0.071286
--- FPM Utility Alignment Diagnostics ---
  utility_alignment: target_cosine=+0.130548 norm_mse=50.933456 useful_high_mse_rate=0.472000
--- Pre-DEQ Input Context Diagnostics ---
  pre_deq_input: mode=residual_competitive_entity input_rms=0.163565 input_raw_cosine=+0.997853 input_shift_rms=0.013308 alpha_entity=-0.267301 train_loss=4.176435
  pre_deq_entity: entropy=0.579449 util_std=0.116993 collapse=0.316938 top1=0.623211 readback_cosine=+0.969112 delta_rms=0.037516`;
