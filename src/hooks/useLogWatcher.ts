import { useEffect, useRef, useCallback } from "react";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import { useRunStore } from "../state/useRunStore";
import * as api from "../api";
import type { IncrementalUpdate, AideenRunMetrics } from "../types/metrics";

interface WatchStartPayload {
  path: string;
  display_name: string;
}

/**
 * Hook that manages the lifecycle of a log file watcher.
 * Listens for Tauri events and updates the store accordingly.
 */
export function useLogWatcher() {
  const unlistenRef = useRef<UnlistenFn[]>([]);
  const setWatchedRun = useRunStore((s) => s.setWatchedRun);
  const applyIncrementalUpdate = useRunStore((s) => s.applyIncrementalUpdate);
  const clearWatchedRun = useRunStore((s) => s.clearWatchedRun);

  useEffect(() => {
    const cleanups: UnlistenFn[] = [];

    // Listen for watch started
    listen<WatchStartPayload>("log-watch-started", (event) => {
      const { path, display_name } = event.payload;
      // Create an initial empty run
      const run: AideenRunMetrics = {
        id: `watch-${path.replace(/[^a-zA-Z0-9]/g, "-")}`,
        file_name: path,
        display_name,
        created_at: new Date().toISOString(),
        summary: { avg_loss: null, ppl_proxy: null, best_val_loss: null, final_val_loss: null, best_val_step: null, frozen_delta_off_minus_on: null, loss_fpm_on: null, loss_fpm_off: null, block_len: null, d: null, slots: null },
        routing: {
          delta_when_fpm_pos: null, delta_when_fpm_neg: null,
          delta_good_minus_bad: null, delta_when_fast_pos: null, delta_when_fast_neg: null,
        },
        fpm_pipeline_counts: {
          projected_per_step: null, admitted_per_step: null, admit_rate: null,
          feed_size_avg: null, consolidated_per_step: null, cons_accept_rate: null,
        },
        fpm_pipeline_scores: {
          write_score_avg: null, replay_util_avg: null, retrieval_sim_avg: null,
          retrieval_loss_avg: null, utility_avg: null,
        },
        fpm_pipeline_shapes: {
          target_rms_avg: null, conditioning_rms_avg: null, cond_to_target_rms: null,
          raw_op_rms_avg: null, raw_to_cond_rms: null, op_rms_avg: null,
          op_to_target_rms: null, interference_avg: null, gate_mean_avg: null,
        },
        fpm_signal_flow: {
          raw_op_rms: null, retrieved_rms: null, gated_rms: null,
          memory_component_rms: null, memory_rms: null,
        },
        fpm_signal_ratios: {
          gated_to_retrieved: null, component_to_memory: null, ce_gain_no_fpm: null,
        },
        utility_alignment: {
          target_cosine: null, norm_mse: null, useful_high_mse_rate: null,
        },
        pre_deq_input: {
          mode: null, input_rms: null, input_raw_cosine: null,
          input_shift_rms: null, alpha_entity: null, train_loss: null,
        },
        pre_deq_entity: {
          entropy: null, util_std: null, collapse: null,
          top1: null, readback_cosine: null, delta_rms: null,
        },
        points: [],
      };
      setWatchedRun(path, display_name, run);
    }).then((fn) => cleanups.push(fn));

    // Listen for incremental updates
    listen<IncrementalUpdate>("log-update", (event) => {
      applyIncrementalUpdate(event.payload);
    }).then((fn) => cleanups.push(fn));

    // Listen for errors
    listen<string>("log-watch-error", (event) => {
      console.error("Log watch error:", event.payload);
    }).then((fn) => cleanups.push(fn));

    unlistenRef.current = cleanups;

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [setWatchedRun, applyIncrementalUpdate, clearWatchedRun]);

  const startWatching = useCallback(async (path: string, displayName?: string) => {
    await api.watchLogFile(path, displayName);
  }, []);

  const stopWatching = useCallback(async (path: string) => {
    await api.stopWatchLogFile(path);
    clearWatchedRun();
  }, [clearWatchedRun]);

  return { startWatching, stopWatching };
}
