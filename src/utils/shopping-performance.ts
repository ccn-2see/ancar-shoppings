import type { Shopping, ShoppingStatus } from "@/types";

export const SHOPPING_PERFORMANCE_RULES = {
  optimumBelowPct: 5,
  criticalAbovePct: 5,
  redDotAbovePct: 10,
} as const;

export type ShoppingIndicatorTone = "green" | "orange" | "red" | "gray";

export interface ShoppingPerformanceState {
  status: ShoppingStatus;
  label: string;
  deviationPct: number | null;
  deviationText: string;
  deviationColor: string;
  dotTone: ShoppingIndicatorTone;
  dotColor: string;
  unavailableReason: "offline" | "stopped" | "missing_measurement" | "missing_target" | null;
}

const DOT_COLOR: Record<ShoppingIndicatorTone, string> = {
  green: "var(--accent-green)",
  orange: "var(--accent-orange)",
  red: "var(--accent-red)",
  gray: "var(--muted-foreground)",
};

function finite(value: number | null): value is number {
  return value !== null && Number.isFinite(value);
}

function unavailable(label: string, reason: ShoppingPerformanceState["unavailableReason"]): ShoppingPerformanceState {
  return {
    status: "offline",
    label,
    deviationPct: null,
    deviationText: label,
    deviationColor: "var(--muted-foreground)",
    dotTone: "gray",
    dotColor: DOT_COLOR.gray,
    unavailableReason: reason,
  };
}

/**
 * Regra visual única para os cards de shopping (Home + aba Shoppings).
 *
 * Faixa textual:
 * - <= -5%: Ótimo
 * - entre -5% e a meta: Bom
 * - acima da meta e < 5%: Atenção
 * - >= 5%: Crítico
 *
 * Bolinha:
 * - desligado / sem medição / sem meta: cinza
 * - dentro ou abaixo da meta: verde
 * - acima da meta e < 10%: laranja
 * - >= 10% acima da meta: vermelha
 *
 * A faixa de 5% a <10% permanece laranja de propósito: o texto já é Crítico
 * a partir de 5%, enquanto a bolinha só passa a vermelho a partir de 10%.
 */
export function getShoppingPerformanceState(shopping: Shopping): ShoppingPerformanceState {
  if (shopping.status === "offline") return unavailable("Sem medição", "offline");

  if (shopping.activeChillers === 0) return unavailable("Desligado", "stopped");

  if (!finite(shopping.efficiencyKWTR)) return unavailable("Sem medição", "missing_measurement");

  if (!finite(shopping.targetKwTr) || shopping.targetKwTr <= 0) return unavailable("Sem meta", "missing_target");

  const deviationPct = ((shopping.efficiencyKWTR - shopping.targetKwTr) / shopping.targetKwTr) * 100;
  const absDeviation = Math.abs(deviationPct);
  const deviationText = absDeviation < 0.05
    ? "Na meta"
    : `${absDeviation.toFixed(1).replace(".", ",")}% ${deviationPct < 0 ? "abaixo" : "acima"}`;

  let status: ShoppingStatus;
  let label: string;
  if (deviationPct <= -SHOPPING_PERFORMANCE_RULES.optimumBelowPct) {
    status = "otimo";
    label = "Ótimo";
  } else if (deviationPct <= 0) {
    status = "bom";
    label = "Bom";
  } else if (deviationPct < SHOPPING_PERFORMANCE_RULES.criticalAbovePct) {
    status = "atencao";
    label = "Atenção";
  } else {
    status = "critico";
    label = "Crítico";
  }

  const dotTone: ShoppingIndicatorTone = deviationPct >= SHOPPING_PERFORMANCE_RULES.redDotAbovePct
    ? "red"
    : deviationPct > 0
      ? "orange"
      : "green";

  return {
    status,
    label,
    deviationPct,
    deviationText,
    deviationColor: deviationPct > 0 ? "var(--accent-red)" : "var(--accent-green)",
    dotTone,
    dotColor: DOT_COLOR[dotTone],
    unavailableReason: null,
  };
}
