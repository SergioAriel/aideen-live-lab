export function fmt(
  value: number | null | undefined,
  digits = 4
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return value.toFixed(digits);
}

export function fmtSigned(
  value: number | null | undefined,
  digits = 4
): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}`;
}
