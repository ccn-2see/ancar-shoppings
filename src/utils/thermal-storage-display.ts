import type { Shopping } from "@/types";

export interface ThermalStorageDisplayState {
  mode: "charging" | "discharging";
  label: "Carregando" | "Descarregando";
  color: string;
  background: string;
  border: string;
}

export function getThermalStorageDisplayState(shopping: Shopping): ThermalStorageDisplayState | null {
  if (shopping.thermalStorageAvailable !== true) return null;

  if (shopping.systemOperatingMode === "tank_charging") {
    return {
      mode: "charging",
      label: "Carregando",
      color: "var(--accent-blue)",
      background: "color-mix(in oklab, var(--accent-blue) 12%, transparent)",
      border: "color-mix(in oklab, var(--accent-blue) 42%, transparent)",
    };
  }

  if (shopping.systemOperatingMode === "tank_discharging") {
    return {
      mode: "discharging",
      label: "Descarregando",
      color: "var(--accent-purple)",
      background: "color-mix(in oklab, var(--accent-purple) 12%, transparent)",
      border: "color-mix(in oklab, var(--accent-purple) 42%, transparent)",
    };
  }

  return null;
}
