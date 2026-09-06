import type { HistoryPeriod } from "@/types";

export function getComparisonLabel(period: HistoryPeriod) {
  if (period === "24h") return "vs ontem";
  if (period === "7d") return "vs 7 dias anteriores";
  return "vs 30 dias anteriores";
}

export function percentageChange(
  current?: number | null,
  previous?: number | null,
  minimumPreviousAbs = 0,
) {
  if (current === null || current === undefined || previous === null || previous === undefined) return null;
  const minimumBase = Math.max(Math.abs(minimumPreviousAbs), 1e-9);
  if (!Number.isFinite(current) || !Number.isFinite(previous) || Math.abs(previous) < minimumBase) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

export function absoluteChange(current?: number | null, previous?: number | null) {
  if (current === null || current === undefined || previous === null || previous === undefined) return null;
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return null;
  return current - previous;
}

export function utilizationChangePp(
  currentAverageActive?: number | null,
  previousAverageActive?: number | null,
  totalChillers?: number | null,
) {
  if (
    currentAverageActive === null || currentAverageActive === undefined ||
    previousAverageActive === null || previousAverageActive === undefined ||
    totalChillers === null || totalChillers === undefined ||
    !Number.isFinite(currentAverageActive) || !Number.isFinite(previousAverageActive) ||
    !Number.isFinite(totalChillers) || totalChillers <= 0
  ) return null;
  return ((currentAverageActive - previousAverageActive) / totalChillers) * 100;
}

export function targetDeviationPct(current?: number | null, target?: number | null) {
  if (current === null || current === undefined || target === null || target === undefined) return null;
  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) return null;
  return ((current - target) / target) * 100;
}
