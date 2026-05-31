# Lista completa de variables mostradas en la UI

## SummaryCards.tsx
| Variable | Ruta de acceso |
|---|---|
| avg_loss | run.summary.avg_loss |
| utility_avg | run.fpm_pipeline_scores.utility_avg |
| interference_avg | run.fpm_pipeline_shapes.interference_avg |
| delta_good_minus_bad | run.routing.delta_good_minus_bad |
| target_cosine | run.utility_alignment.target_cosine |

## BarChartsPanel.tsx
| Variable | Ruta de acceso |
|---|---|
| avg_loss | run.summary.avg_loss |
| utility_avg | run.fpm_pipeline_scores.utility_avg |
| interference_avg | run.fpm_pipeline_shapes.interference_avg |
| delta_good_minus_bad | run.routing.delta_good_minus_bad |
| target_cosine | run.utility_alignment.target_cosine |
| entity_entropy | run.pre_deq_entity.entropy |
| entity_collapse | run.pre_deq_entity.collapse |

## LineChartsPanel.tsx (per-step)
| Variable | Ruta |
|---|---|
| loss_pre | point.loss_pre |
| loss_train | point.loss_train |
| loss_post | point.loss_post |
| fpm_utility | point.fpm_utility |
| fast_utility | point.fast_utility |
| memory_utility | point.memory_utility |
| fpm_interference | point.fpm_interference |
| fpm_gate_mean | point.fpm_gate_mean |
| fast_gate_mean | point.fast_gate_mean |
| entity_entropy | point.entity_entropy |
| entity_collapse | point.entity_collapse |
| deq_residual | point.deq_residual |
| h_rms | point.h_rms |
| grad_z_rms | point.grad_z_rms |
| embed_grad_rms | point.embed_grad_rms |
| fpm_replay_utility | point.fpm_replay_utility |
| fast_retrieval_loss | point.fast_retrieval_loss |
| fpm_retrieval_loss | point.fpm_retrieval_loss |
| fused_memory_loss | point.fused_memory_loss |
| fast_retrieval_similarity | point.fast_retrieval_similarity |
| fpm_retrieval_similarity | point.fpm_retrieval_similarity |
| entity_top1 | point.entity_top1 |
| entity_readback_cosine | point.entity_readback_cosine |
| entity_delta_rms | point.entity_delta_rms |
| mem_write_score | point.mem_write_score |
| fpm_write_score | point.fpm_write_score |
| fast_entries | point.fast_entries |
| fpm_feed | point.fpm_feed |
| fpm_proto | point.fpm_proto |
| fast_usage | point.fast_usage |
| fast_util | point.fast_util |
| fast_merge | point.fast_merge |
| key_sim | point.key_sim |
| fpm_usage | point.fpm_usage |
| fpm_stab | point.fpm_stab |
| trans_cons | point.trans_cons |
| deq_loss | point.deq_loss |
| state_loss | point.state_loss |
| mem_proj_loss | point.mem_proj_loss |
| fpm_proj | point.fpm_proj |
| fpm_feed_count | point.fpm_feed_count |
| fpm_cand | point.fpm_cand |
| fpm_acc | point.fpm_acc |
| fpm_cons | point.fpm_cons |
| fpm_cons_rate | point.fpm_cons_rate |
| fast_ws_mean | point.fast_ws_mean |
| feed_s_mean | point.feed_s_mean |
| fpm_tgt_rms | point.fpm_tgt_rms |
| fpm_cond_rms | point.fpm_cond_rms |
| fpm_raw_op_rms | point.fpm_raw_op_rms |
| fpm_op_rms | point.fpm_op_rms |

## FpmPipelinePanel.tsx
### Counts
| Variable | Ruta |
|---|---|
| projected_per_step | run.fpm_pipeline_counts.projected_per_step |
| admitted_per_step | run.fpm_pipeline_counts.admitted_per_step |
| admit_rate | run.fpm_pipeline_counts.admit_rate |
| feed_size_avg | run.fpm_pipeline_counts.feed_size_avg |
| consolidated_per_step | run.fpm_pipeline_counts.consolidated_per_step |
| cons_accept_rate | run.fpm_pipeline_counts.cons_accept_rate |

### Scores
| Variable | Ruta |
|---|---|
| write_score_avg | run.fpm_pipeline_scores.write_score_avg |
| replay_util_avg | run.fpm_pipeline_scores.replay_util_avg |
| retrieval_sim_avg | run.fpm_pipeline_scores.retrieval_sim_avg |
| retrieval_loss_avg | run.fpm_pipeline_scores.retrieval_loss_avg |
| utility_avg | run.fpm_pipeline_scores.utility_avg |

### Shapes
| Variable | Ruta |
|---|---|
| target_rms_avg | run.fpm_pipeline_shapes.target_rms_avg |
| conditioning_rms_avg | run.fpm_pipeline_shapes.conditioning_rms_avg |
| cond_to_target_rms | run.fpm_pipeline_shapes.cond_to_target_rms |
| raw_op_rms_avg | run.fpm_pipeline_shapes.raw_op_rms_avg |
| raw_to_cond_rms | run.fpm_pipeline_shapes.raw_to_cond_rms |
| op_rms_avg | run.fpm_pipeline_shapes.op_rms_avg |
| op_to_target_rms | run.fpm_pipeline_shapes.op_to_target_rms |
| interference_avg | run.fpm_pipeline_shapes.interference_avg |
| gate_mean_avg | run.fpm_pipeline_shapes.gate_mean_avg |

## SignalFlowPanel.tsx
### Signal Flow
| Variable | Ruta |
|---|---|
| raw_op_rms | run.fpm_signal_flow.raw_op_rms |
| retrieved_rms | run.fpm_signal_flow.retrieved_rms |
| gated_rms | run.fpm_signal_flow.gated_rms |
| memory_component_rms | run.fpm_signal_flow.memory_component_rms |
| memory_rms | run.fpm_signal_flow.memory_rms |

### Signal Ratios
| Variable | Ruta |
|---|---|
| gated_to_retrieved | run.fpm_signal_ratios.gated_to_retrieved |
| component_to_memory | run.fpm_signal_ratios.component_to_memory |
| ce_gain_no_fpm | run.fpm_signal_ratios.ce_gain_no_fpm |

## UtilityAlignmentPanel.tsx
| Variable | Ruta |
|---|---|
| target_cosine | run.utility_alignment.target_cosine |
| norm_mse | run.utility_alignment.norm_mse |
| useful_high_mse_rate | run.utility_alignment.useful_high_mse_rate |

## PreDeqPanel.tsx
### Input Context
| Variable | Ruta |
|---|---|
| mode | run.pre_deq_input.mode |
| input_rms | run.pre_deq_input.input_rms |
| input_raw_cosine | run.pre_deq_input.input_raw_cosine |
| input_shift_rms | run.pre_deq_input.input_shift_rms |
| alpha_entity | run.pre_deq_input.alpha_entity |
| train_loss | run.pre_deq_input.train_loss |

### Entity
| Variable | Ruta |
|---|---|
| entropy | run.pre_deq_entity.entropy |
| util_std | run.pre_deq_entity.util_std |
| collapse | run.pre_deq_entity.collapse |
| top1 | run.pre_deq_entity.top1 |
| readback_cosine | run.pre_deq_entity.readback_cosine |
| delta_rms | run.pre_deq_entity.delta_rms |

## ComparisonTable.tsx
| Variable | Ruta |
|---|---|
| avg_loss | run.summary.avg_loss |
| ppl_proxy | run.summary.ppl_proxy |
| utility_avg | run.fpm_pipeline_scores.utility_avg |
| ce_gain_no_fpm | run.fpm_signal_ratios.ce_gain_no_fpm |
| interference_avg | run.fpm_pipeline_shapes.interference_avg |
| gate_mean_avg | run.fpm_pipeline_shapes.gate_mean_avg |
| delta_good_minus_bad | run.routing.delta_good_minus_bad |
| target_cosine | run.utility_alignment.target_cosine |
| norm_mse | run.utility_alignment.norm_mse |
| entity_entropy | run.pre_deq_entity.entropy |
| entity_collapse | run.pre_deq_entity.collapse |
| input_raw_cosine | run.pre_deq_input.input_raw_cosine |

## RunList.tsx
| Variable | Ruta |
|---|---|
| display_name | run.display_name |
| avg_loss | run.summary.avg_loss |
| utility_avg | run.fpm_pipeline_scores.utility_avg |

## ExportPanel.tsx (CSV)
| Variable | Ruta |
|---|---|
| avg_loss | run.summary.avg_loss |
| ppl_proxy | run.summary.ppl_proxy |
| utility_avg | run.fpm_pipeline_scores.utility_avg |
| ce_gain_no_fpm | run.fpm_signal_ratios.ce_gain_no_fpm |
| interference_avg | run.fpm_pipeline_shapes.interference_avg |
| gate_mean_avg | run.fpm_pipeline_shapes.gate_mean_avg |
| delta_good_minus_bad | run.routing.delta_good_minus_bad |
| target_cosine | run.utility_alignment.target_cosine |
| norm_mse | run.utility_alignment.norm_mse |
| entity_entropy | run.pre_deq_entity.entropy |
| entity_collapse | run.pre_deq_entity.collapse |
| input_raw_cosine | run.pre_deq_input.input_raw_cosine |

## PdfExportPanel.tsx
Incluye TODAS las variables anteriores en secciones de texto, más gráficos de barras y líneas. Variables adicionales en gráficos de líneas del PDF:

| Variable | Ruta |
|---|---|
| loss_pre | point.loss_pre |
| loss_train | point.loss_train |
| loss_post | point.loss_post |
| fpm_utility | point.fpm_utility |
| fast_utility | point.fast_utility |
| fpm_interference | point.fpm_interference |
| fpm_gate_mean | point.fpm_gate_mean |
| entity_entropy | point.entity_entropy |
| entity_collapse | point.entity_collapse |
| deq_residual | point.deq_residual |
| h_rms | point.h_rms |
| grad_z_rms | point.grad_z_rms |
| fpm_replay_utility | point.fpm_replay_utility |
| fast_retrieval_similarity | point.fast_retrieval_similarity |
| fpm_retrieval_similarity | point.fpm_retrieval_similarity |
| mem_write_score | point.mem_write_score |
| fpm_write_score | point.fpm_write_score |
| fast_entries | point.fast_entries |
| fpm_feed | point.fpm_feed |
| key_sim | point.key_sim |
| trans_cons | point.trans_cons |
| deq_loss | point.deq_loss |
| state_loss | point.state_loss |
| fpm_acc | point.fpm_acc |
| fpm_tgt_rms | point.fpm_tgt_rms |
| fpm_op_rms | point.fpm_op_rms |
