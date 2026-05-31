use rusqlite::{Connection, params};
use std::path::PathBuf;
use std::sync::Mutex;

use crate::parser::{AideenRun, MetricsPoint};

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new(app_data_dir: PathBuf) -> Result<Self, String> {
        std::fs::create_dir_all(&app_data_dir).map_err(|e| e.to_string())?;
        let db_path = app_data_dir.join("aideen_live_lab.db");
        let conn = Connection::open(&db_path).map_err(|e| e.to_string())?;

        conn.execute_batch(
            "
            CREATE TABLE IF NOT EXISTS runs (
                id TEXT PRIMARY KEY,
                file_name TEXT,
                display_name TEXT NOT NULL,
                created_at TEXT NOT NULL,
                raw_text TEXT,
                avg_loss REAL,
                ppl_proxy REAL,
                best_val_loss REAL,
                final_val_loss REAL,
                best_val_step INTEGER,
                frozen_delta_off_minus_on REAL,
                loss_fpm_on REAL,
                loss_fpm_off REAL,
                block_len INTEGER,
                d INTEGER,
                slots INTEGER
            );

            CREATE TABLE IF NOT EXISTS points (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
                step INTEGER NOT NULL,
                loss_pre REAL, loss_train REAL, loss_post REAL,
                ppl_proxy REAL, fpm_loss REAL, train_loss REAL,
                fpm_utility REAL, fpm_replay_utility REAL, fpm_retrieval_loss REAL, fpm_retrieval_sim REAL,
                projected REAL, candidates REAL, feed_entries REAL, consolidated REAL,
                accept_rate REAL, cons_rate REAL,
                gate REAL, gate_mean REAL, learned_cap REAL, desired REAL, policy_reward REAL,
                raw_op_rms REAL, op_rms REAL, gated_rms REAL, memory_rms REAL,
                target_cosine REAL, useful_high_mse REAL,
                util REAL, loss_gain REAL, usefulness REAL, residual_rms REAL, target_rms REAL, bootstrap_active REAL,
                alpha_entity REAL,
                elapsed_s REAL, steps_per_sec REAL,
                memory_utility REAL, fast_utility REAL, fast_retrieval_loss REAL, fused_memory_loss REAL,
                fast_retrieval_similarity REAL, fpm_retrieval_similarity REAL, fast_gate_mean REAL, fpm_gate_mean REAL,
                fpm_interference REAL, deq_residual REAL, deq_iterations INTEGER,
                h_rms REAL, grad_z_rms REAL, embed_grad_rms REAL,
                entity_entropy REAL, entity_collapse REAL, entity_top1 REAL, entity_readback_cosine REAL, entity_delta_rms REAL,
                mem_write_score REAL, fpm_write_score REAL, fast_entries REAL, fpm_feed REAL, fpm_proto REAL,
                fast_usage REAL, fast_util REAL, fast_merge REAL, key_sim REAL,
                fpm_usage REAL, fpm_stab REAL, trans_cons REAL,
                deq_loss REAL, state_loss REAL, mem_proj_loss REAL,
                fpm_proj REAL, fpm_feed_count REAL, fpm_cand REAL, fpm_acc REAL, fpm_cons REAL, fpm_cons_rate REAL,
                fast_ws_mean REAL, feed_s_mean REAL,
                fpm_tgt_rms REAL, fpm_cond_rms REAL, fpm_raw_op_rms REAL, fpm_op_rms REAL
            );

            CREATE INDEX IF NOT EXISTS idx_points_run_id ON points(run_id);
            ",
        )
        .map_err(|e| e.to_string())?;

        Self::ensure_column(&conn, "runs", "block_len", "INTEGER")?;
        Self::ensure_column(&conn, "runs", "d", "INTEGER")?;
        Self::ensure_column(&conn, "runs", "slots", "INTEGER")?;

        Ok(Database {
            conn: Mutex::new(conn),
        })
    }

    fn ensure_column(conn: &Connection, table: &str, column: &str, column_type: &str) -> Result<(), String> {
        let mut stmt = conn
            .prepare(&format!("PRAGMA table_info({})", table))
            .map_err(|e| e.to_string())?;
        let exists = stmt
            .query_map([], |row| row.get::<_, String>(1))
            .map_err(|e| e.to_string())?
            .filter_map(|name| name.ok())
            .any(|name| name == column);

        if !exists {
            conn.execute(
                &format!("ALTER TABLE {} ADD COLUMN {} {}", table, column, column_type),
                [],
            )
            .map_err(|e| e.to_string())?;
        }

        Ok(())
    }

    pub fn save_run(&self, run: &AideenRun) -> Result<(), String> {
        let mut conn = self.conn.lock().map_err(|e| e.to_string())?;
        let tx = conn.transaction().map_err(|e| e.to_string())?;

        tx.execute(
            "INSERT OR REPLACE INTO runs (id, file_name, display_name, created_at, raw_text, avg_loss, ppl_proxy, best_val_loss, final_val_loss, best_val_step, frozen_delta_off_minus_on, loss_fpm_on, loss_fpm_off, block_len, d, slots)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16)",
            params![
                run.id, run.file_name, run.display_name, run.created_at, run.raw_text,
                run.summary.avg_loss, run.summary.ppl_proxy,
                run.summary.best_val_loss, run.summary.final_val_loss, run.summary.best_val_step,
                run.summary.frozen_delta_off_minus_on, run.summary.loss_fpm_on, run.summary.loss_fpm_off,
                run.summary.block_len, run.summary.d, run.summary.slots,
            ],
        )
        .map_err(|e| e.to_string())?;

        tx.execute("DELETE FROM points WHERE run_id = ?1", params![run.id])
            .map_err(|e| e.to_string())?;

        for point in &run.points {
            tx.execute(
                "INSERT INTO points (
                    run_id, step,
                    loss_pre, loss_train, loss_post, ppl_proxy, fpm_loss, train_loss,
                    fpm_utility, fpm_replay_utility, fpm_retrieval_loss, fpm_retrieval_sim,
                    projected, candidates, feed_entries, consolidated, accept_rate, cons_rate,
                    gate, gate_mean, learned_cap, desired, policy_reward,
                    raw_op_rms, op_rms, gated_rms, memory_rms, target_cosine, useful_high_mse,
                    util, loss_gain, usefulness, residual_rms, target_rms, bootstrap_active,
                    alpha_entity, elapsed_s, steps_per_sec,
                    memory_utility, fast_utility, fast_retrieval_loss, fused_memory_loss,
                    fast_retrieval_similarity, fpm_retrieval_similarity, fast_gate_mean, fpm_gate_mean,
                    fpm_interference, deq_residual, deq_iterations,
                    h_rms, grad_z_rms, embed_grad_rms,
                    entity_entropy, entity_collapse, entity_top1, entity_readback_cosine, entity_delta_rms,
                    mem_write_score, fpm_write_score, fast_entries, fpm_feed, fpm_proto,
                    fast_usage, fast_util, fast_merge, key_sim,
                    fpm_usage, fpm_stab, trans_cons,
                    deq_loss, state_loss, mem_proj_loss,
                    fpm_proj, fpm_feed_count, fpm_cand, fpm_acc, fpm_cons, fpm_cons_rate,
                    fast_ws_mean, feed_s_mean,
                    fpm_tgt_rms, fpm_cond_rms, fpm_raw_op_rms, fpm_op_rms
                ) VALUES (
                    ?1, ?2,
                    ?3, ?4, ?5, ?6, ?7, ?8,
                    ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18,
                    ?19, ?20, ?21, ?22, ?23, ?24, ?25, ?26, ?27, ?28, ?29,
                    ?30, ?31, ?32, ?33, ?34, ?35, ?36, ?37, ?38,
                    ?39, ?40, ?41, ?42, ?43, ?44, ?45, ?46,
                    ?47, ?48, ?49,
                    ?50, ?51, ?52,
                    ?53, ?54, ?55, ?56, ?57,
                    ?58, ?59, ?60, ?61, ?62,
                    ?63, ?64, ?65, ?66,
                    ?67, ?68, ?69,
                    ?70, ?71, ?72,
                    ?73, ?74, ?75, ?76, ?77, ?78,
                    ?79, ?80,
                    ?81, ?82, ?83, ?84
                )",
                params![
                    run.id, point.step,
                    point.loss_pre, point.loss_train, point.loss_post, point.ppl_proxy, point.fpm_loss, point.train_loss,
                    point.fpm_utility, point.fpm_replay_utility, point.fpm_retrieval_loss, point.fpm_retrieval_sim,
                    point.projected, point.candidates, point.feed_entries, point.consolidated, point.accept_rate, point.cons_rate,
                    point.gate, point.gate_mean, point.learned_cap, point.desired, point.policy_reward,
                    point.raw_op_rms, point.op_rms, point.gated_rms, point.memory_rms, point.target_cosine, point.useful_high_mse,
                    point.util, point.loss_gain, point.usefulness, point.residual_rms, point.target_rms, point.bootstrap_active,
                    point.alpha_entity, point.elapsed_s, point.steps_per_sec,
                    point.memory_utility, point.fast_utility, point.fast_retrieval_loss, point.fused_memory_loss,
                    point.fast_retrieval_similarity, point.fpm_retrieval_similarity, point.fast_gate_mean, point.fpm_gate_mean,
                    point.fpm_interference, point.deq_residual, point.deq_iterations,
                    point.h_rms, point.grad_z_rms, point.embed_grad_rms,
                    point.entity_entropy, point.entity_collapse, point.entity_top1, point.entity_readback_cosine, point.entity_delta_rms,
                    point.mem_write_score, point.fpm_write_score, point.fast_entries, point.fpm_feed, point.fpm_proto,
                    point.fast_usage, point.fast_util, point.fast_merge, point.key_sim,
                    point.fpm_usage, point.fpm_stab, point.trans_cons,
                    point.deq_loss, point.state_loss, point.mem_proj_loss,
                    point.fpm_proj, point.fpm_feed_count, point.fpm_cand, point.fpm_acc, point.fpm_cons, point.fpm_cons_rate,
                    point.fast_ws_mean, point.feed_s_mean,
                    point.fpm_tgt_rms, point.fpm_cond_rms, point.fpm_raw_op_rms, point.fpm_op_rms,
                ],
            )
            .map_err(|e| e.to_string())?;
        }

        tx.commit().map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn load_runs(&self) -> Result<Vec<AideenRun>, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        let mut stmt = conn
            .prepare("SELECT id, file_name, display_name, created_at, raw_text, avg_loss, ppl_proxy, best_val_loss, final_val_loss, best_val_step, frozen_delta_off_minus_on, loss_fpm_on, loss_fpm_off, block_len, d, slots FROM runs ORDER BY created_at DESC")
            .map_err(|e| e.to_string())?;

        let runs: Vec<AideenRun> = stmt
            .query_map([], |row| {
                Ok(AideenRun {
                    id: row.get(0)?,
                    file_name: row.get(1)?,
                    display_name: row.get(2)?,
                    created_at: row.get(3)?,
                    raw_text: row.get(4)?,
                    summary: crate::parser::AideenRunSummary {
                        avg_loss: row.get(5)?,
                        ppl_proxy: row.get(6)?,
                        best_val_loss: row.get(7)?,
                        final_val_loss: row.get(8)?,
                        best_val_step: row.get(9)?,
                        frozen_delta_off_minus_on: row.get(10)?,
                        loss_fpm_on: row.get(11)?,
                        loss_fpm_off: row.get(12)?,
                        block_len: row.get(13)?,
                        d: row.get(14)?,
                        slots: row.get(15)?,
                    },
                    routing: crate::parser::AideenRoutingMetrics::default(),
                    fpm_pipeline_counts: crate::parser::FpmPipelineCounts::default(),
                    fpm_pipeline_scores: crate::parser::FpmPipelineScores::default(),
                    fpm_pipeline_shapes: crate::parser::FpmPipelineShapes::default(),
                    fpm_signal_flow: crate::parser::FpmSignalFlow::default(),
                    fpm_signal_ratios: crate::parser::FpmSignalRatios::default(),
                    utility_alignment: crate::parser::UtilityAlignment::default(),
                    pre_deq_input: crate::parser::PreDeqInputMetrics::default(),
                    pre_deq_entity: crate::parser::PreDeqEntityMetrics::default(),
                    points: Vec::new(),
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok(runs)
    }

    pub fn load_run_detail(&self, id: &str) -> Result<Option<AideenRun>, String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare("SELECT id, file_name, display_name, created_at, raw_text, avg_loss, ppl_proxy, best_val_loss, final_val_loss, best_val_step, frozen_delta_off_minus_on, loss_fpm_on, loss_fpm_off, block_len, d, slots FROM runs WHERE id = ?1")
            .map_err(|e| e.to_string())?;

        let run_result = stmt.query_row(params![id], |row| {
            Ok(AideenRun {
                id: row.get(0)?,
                file_name: row.get(1)?,
                display_name: row.get(2)?,
                created_at: row.get(3)?,
                raw_text: row.get(4)?,
                summary: crate::parser::AideenRunSummary {
                    avg_loss: row.get(5)?,
                    ppl_proxy: row.get(6)?,
                    best_val_loss: row.get(7)?,
                    final_val_loss: row.get(8)?,
                    best_val_step: row.get(9)?,
                    frozen_delta_off_minus_on: row.get(10)?,
                    loss_fpm_on: row.get(11)?,
                    loss_fpm_off: row.get(12)?,
                    block_len: row.get(13)?,
                    d: row.get(14)?,
                    slots: row.get(15)?,
                },
                routing: crate::parser::AideenRoutingMetrics::default(),
                fpm_pipeline_counts: crate::parser::FpmPipelineCounts::default(),
                fpm_pipeline_scores: crate::parser::FpmPipelineScores::default(),
                fpm_pipeline_shapes: crate::parser::FpmPipelineShapes::default(),
                fpm_signal_flow: crate::parser::FpmSignalFlow::default(),
                fpm_signal_ratios: crate::parser::FpmSignalRatios::default(),
                utility_alignment: crate::parser::UtilityAlignment::default(),
                pre_deq_input: crate::parser::PreDeqInputMetrics::default(),
                pre_deq_entity: crate::parser::PreDeqEntityMetrics::default(),
                points: Vec::new(),
            })
        });

        match run_result {
            Ok(mut run) => {
                let mut point_stmt = conn
                    .prepare("SELECT step,
                        loss_pre, loss_train, loss_post, ppl_proxy, fpm_loss, train_loss,
                        fpm_utility, fpm_replay_utility, fpm_retrieval_loss, fpm_retrieval_sim,
                        projected, candidates, feed_entries, consolidated, accept_rate, cons_rate,
                        gate, gate_mean, learned_cap, desired, policy_reward,
                        raw_op_rms, op_rms, gated_rms, memory_rms, target_cosine, useful_high_mse,
                        util, loss_gain, usefulness, residual_rms, target_rms, bootstrap_active,
                        alpha_entity, elapsed_s, steps_per_sec,
                        memory_utility, fast_utility, fast_retrieval_loss, fused_memory_loss,
                        fast_retrieval_similarity, fpm_retrieval_similarity, fast_gate_mean, fpm_gate_mean,
                        fpm_interference, deq_residual, deq_iterations,
                        h_rms, grad_z_rms, embed_grad_rms,
                        entity_entropy, entity_collapse, entity_top1, entity_readback_cosine, entity_delta_rms,
                        mem_write_score, fpm_write_score, fast_entries, fpm_feed, fpm_proto,
                        fast_usage, fast_util, fast_merge, key_sim,
                        fpm_usage, fpm_stab, trans_cons,
                        deq_loss, state_loss, mem_proj_loss,
                        fpm_proj, fpm_feed_count, fpm_cand, fpm_acc, fpm_cons, fpm_cons_rate,
                        fast_ws_mean, feed_s_mean,
                        fpm_tgt_rms, fpm_cond_rms, fpm_raw_op_rms, fpm_op_rms
                        FROM points WHERE run_id = ?1 ORDER BY step")
                    .map_err(|e| e.to_string())?;

                let points: Vec<MetricsPoint> = point_stmt
                    .query_map(params![id], |row| {
                        Ok(MetricsPoint {
                            step: row.get(0)?,
                            loss_pre: row.get(1)?, loss_train: row.get(2)?, loss_post: row.get(3)?,
                            ppl_proxy: row.get(4)?, fpm_loss: row.get(5)?, train_loss: row.get(6)?,
                            fpm_utility: row.get(7)?, fpm_replay_utility: row.get(8)?, fpm_retrieval_loss: row.get(9)?, fpm_retrieval_sim: row.get(10)?,
                            projected: row.get(11)?, candidates: row.get(12)?, feed_entries: row.get(13)?, consolidated: row.get(14)?,
                            accept_rate: row.get(15)?, cons_rate: row.get(16)?,
                            gate: row.get(17)?, gate_mean: row.get(18)?, learned_cap: row.get(19)?, desired: row.get(20)?, policy_reward: row.get(21)?,
                            raw_op_rms: row.get(22)?, op_rms: row.get(23)?, gated_rms: row.get(24)?, memory_rms: row.get(25)?,
                            target_cosine: row.get(26)?, useful_high_mse: row.get(27)?,
                            util: row.get(28)?, loss_gain: row.get(29)?, usefulness: row.get(30)?, residual_rms: row.get(31)?, target_rms: row.get(32)?, bootstrap_active: row.get(33)?,
                            alpha_entity: row.get(34)?, elapsed_s: row.get(35)?, steps_per_sec: row.get(36)?,
                            memory_utility: row.get(37)?, fast_utility: row.get(38)?, fast_retrieval_loss: row.get(39)?, fused_memory_loss: row.get(40)?,
                            fast_retrieval_similarity: row.get(41)?, fpm_retrieval_similarity: row.get(42)?, fast_gate_mean: row.get(43)?, fpm_gate_mean: row.get(44)?,
                            fpm_interference: row.get(45)?, deq_residual: row.get(46)?, deq_iterations: row.get(47)?,
                            h_rms: row.get(48)?, grad_z_rms: row.get(49)?, embed_grad_rms: row.get(50)?,
                            entity_entropy: row.get(51)?, entity_collapse: row.get(52)?, entity_top1: row.get(53)?, entity_readback_cosine: row.get(54)?, entity_delta_rms: row.get(55)?,
                            mem_write_score: row.get(56)?, fpm_write_score: row.get(57)?, fast_entries: row.get(58)?, fpm_feed: row.get(59)?, fpm_proto: row.get(60)?,
                            fast_usage: row.get(61)?, fast_util: row.get(62)?, fast_merge: row.get(63)?, key_sim: row.get(64)?,
                            fpm_usage: row.get(65)?, fpm_stab: row.get(66)?, trans_cons: row.get(67)?,
                            deq_loss: row.get(68)?, state_loss: row.get(69)?, mem_proj_loss: row.get(70)?,
                            fpm_proj: row.get(71)?, fpm_feed_count: row.get(72)?, fpm_cand: row.get(73)?, fpm_acc: row.get(74)?, fpm_cons: row.get(75)?, fpm_cons_rate: row.get(76)?,
                            fast_ws_mean: row.get(77)?, feed_s_mean: row.get(78)?,
                            fpm_tgt_rms: row.get(79)?, fpm_cond_rms: row.get(80)?, fpm_raw_op_rms: row.get(81)?, fpm_op_rms: row.get(82)?,
                        })
                    })
                    .map_err(|e| e.to_string())?
                    .filter_map(|r| r.ok())
                    .collect();

                run.points = points;
                Ok(Some(run))
            }
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(e.to_string()),
        }
    }

    pub fn delete_run(&self, id: &str) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM points WHERE run_id = ?1", params![id])
            .map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM runs WHERE id = ?1", params![id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn clear_runs(&self) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| e.to_string())?;
        conn.execute_batch("DELETE FROM points; DELETE FROM runs;")
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}
