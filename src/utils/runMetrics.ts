import type { AideenRunMetrics } from "../types/metrics";

export function runName(run: AideenRunMetrics): string {
  return run.display_name || run.file_name || "run";
}

export function extractSeed(run: AideenRunMetrics): number | null {
  const match = runName(run).match(/seed(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export function extractTarget(run: AideenRunMetrics): string {
  const name = runName(run);
  if (name.includes("no_fpm")) return "no_fpm";
  if (name.includes("utility_aligned_delta")) return "utility_aligned_delta";
  if (name.includes("functional_residual")) return "functional_residual";
  if (name.includes("mix0.25")) return "mix0.25";
  if (name.includes("mix0.50")) return "mix0.50";
  if (name.includes("fpm_on") || name.includes("_fpm_")) return "fpm_on";
  return "other";
}

export function runLabel(run: AideenRunMetrics): string {
  const target = extractTarget(run);
  const seed = extractSeed(run);
  return seed == null ? target : `${target} s${seed}`;
}

export function fullValLoss(run: AideenRunMetrics): number | null {
  return run.summary.final_val_loss ?? run.summary.loss_fpm_on ?? run.summary.best_val_loss ?? null;
}

export function avg(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => v != null && Number.isFinite(v));
  if (nums.length === 0) return null;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}

export function std(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => v != null && Number.isFinite(v));
  if (nums.length < 2) return null;
  const mean = avg(nums) ?? 0;
  const variance = nums.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (nums.length - 1);
  return Math.sqrt(variance);
}
