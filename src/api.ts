import { invoke } from "@tauri-apps/api/core";
import type { AideenRunMetrics, ParseResult } from "./types/metrics";

export interface ImportLogsResult {
  imported: number;
  skipped: number;
  warnings: string[];
}

function isTauriRuntime(): boolean {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function parseLog(
  text: string,
  fileName?: string,
  displayName?: string
): Promise<ParseResult> {
  return invoke<ParseResult>("parse_log", {
    text,
    fileName: fileName ?? null,
    displayName: displayName ?? null,
  });
}

export async function saveRun(run: AideenRunMetrics): Promise<void> {
  return invoke("save_run", { run });
}

export async function loadRuns(): Promise<AideenRunMetrics[]> {
  if (!isTauriRuntime()) return [];
  return invoke<AideenRunMetrics[]>("load_runs");
}

export async function loadRunDetail(
  id: string
): Promise<AideenRunMetrics | null> {
  return invoke<AideenRunMetrics | null>("load_run_detail", { id });
}

export async function deleteRun(id: string): Promise<void> {
  return invoke("delete_run", { id });
}

export async function clearRuns(): Promise<void> {
  return invoke("clear_runs");
}

export async function importLogsFromDir(
  rootPath: string,
  maxFiles = 80
): Promise<ImportLogsResult> {
  return invoke<ImportLogsResult>("import_logs_from_dir", {
    rootPath,
    maxFiles,
  });
}

/** Start watching a log file for changes */
export async function watchLogFile(
  path: string,
  displayName?: string
): Promise<void> {
  return invoke("watch_log_file", {
    path,
    displayName: displayName ?? null,
  });
}

/** Stop watching a specific log file */
export async function stopWatchLogFile(path: string): Promise<void> {
  return invoke("stop_watch_log_file", { path });
}

/** Stop all active file watchers */
export async function stopAllWatchers(): Promise<void> {
  return invoke("stop_all_watchers");
}
