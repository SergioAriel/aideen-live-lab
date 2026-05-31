import { create } from "zustand";
import type { AideenRunMetrics, IncrementalUpdate } from "../types/metrics";
import * as api from "../api";

interface WatchedRunInfo {
  path: string;
  displayName: string;
  run: AideenRunMetrics;
  totalLines: number;
}

interface RunStore {
  runs: AideenRunMetrics[];
  selectedRunId: string | null;
  selectedRunIds: string[];
  loading: boolean;
  error: string | null;
  /** Currently watched run (live tail) */
  watchedRun: WatchedRunInfo | null;
  loadAllRuns: () => Promise<void>;
  importRun: (run: AideenRunMetrics) => Promise<void>;
  deleteRun: (id: string) => Promise<void>;
  clearAllRuns: () => Promise<void>;
  selectRun: (id: string | null) => void;
  toggleRunSelection: (id: string) => void;
  /** Set the watched run (called when watch starts) */
  setWatchedRun: (path: string, displayName: string, run: AideenRunMetrics) => void;
  /** Apply an incremental update to the watched run */
  applyIncrementalUpdate: (update: IncrementalUpdate) => void;
  /** Clear the watched run (called when watch stops) */
  clearWatchedRun: () => void;
}

export const useRunStore = create<RunStore>((set, get) => ({
  runs: [],
  selectedRunId: null,
  selectedRunIds: [],
  loading: false,
  error: null,
  watchedRun: null,

  loadAllRuns: async () => {
    set({ loading: true, error: null });
    try {
      const runs = await api.loadRuns();
      set({ runs, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },

  importRun: async (run) => {
    try {
      await api.saveRun(run);
      const runs = await api.loadRuns();
      set({ runs });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  deleteRun: async (id) => {
    try {
      await api.deleteRun(id);
      const runs = await api.loadRuns();
      const { selectedRunId, selectedRunIds } = get();
      set({
        runs,
        selectedRunId: selectedRunId === id ? null : selectedRunId,
        selectedRunIds: selectedRunIds.filter((rid) => rid !== id),
      });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  clearAllRuns: async () => {
    try {
      await api.clearRuns();
      set({ runs: [], selectedRunId: null, selectedRunIds: [] });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  selectRun: (id) => {
    set({ selectedRunId: id });
  },

  toggleRunSelection: (id) => {
    const { selectedRunIds } = get();
    if (selectedRunIds.includes(id)) {
      set({ selectedRunIds: selectedRunIds.filter((rid) => rid !== id) });
    } else {
      set({ selectedRunIds: [...selectedRunIds, id] });
    }
  },

  setWatchedRun: (path, displayName, run) => {
    set({
      watchedRun: { path, displayName, run, totalLines: 0 },
      selectedRunId: run.id,
    });
  },

  applyIncrementalUpdate: (update) => {
    const { watchedRun } = get();
    if (!watchedRun) return;

    // Deep clone the run to ensure Zustand detects the change
    const run: AideenRunMetrics = JSON.parse(JSON.stringify(watchedRun.run));
    run.points = [...run.points, ...update.new_points];

    // Update summary metrics if provided
    if (update.summary) {
      run.summary = { ...run.summary, ...update.summary };
    }
    if (update.fpm_pipeline_counts) {
      run.fpm_pipeline_counts = { ...run.fpm_pipeline_counts, ...update.fpm_pipeline_counts };
    }
    if (update.fpm_pipeline_scores) {
      run.fpm_pipeline_scores = { ...run.fpm_pipeline_scores, ...update.fpm_pipeline_scores };
    }
    if (update.fpm_pipeline_shapes) {
      run.fpm_pipeline_shapes = { ...run.fpm_pipeline_shapes, ...update.fpm_pipeline_shapes };
    }
    if (update.fpm_signal_flow) {
      run.fpm_signal_flow = { ...run.fpm_signal_flow, ...update.fpm_signal_flow };
    }
    if (update.fpm_signal_ratios) {
      run.fpm_signal_ratios = { ...run.fpm_signal_ratios, ...update.fpm_signal_ratios };
    }
    if (update.utility_alignment) {
      run.utility_alignment = { ...run.utility_alignment, ...update.utility_alignment };
    }
    if (update.pre_deq_input) {
      run.pre_deq_input = { ...run.pre_deq_input, ...update.pre_deq_input };
    }
    if (update.pre_deq_entity) {
      run.pre_deq_entity = { ...run.pre_deq_entity, ...update.pre_deq_entity };
    }

    set({
      watchedRun: {
        ...watchedRun,
        run,
        totalLines: update.total_lines,
      },
    });
  },

  clearWatchedRun: () => {
    set({ watchedRun: null });
  },
}));
