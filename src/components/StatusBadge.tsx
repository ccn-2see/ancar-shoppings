import type { ShoppingStatus } from "@/types";
import { statusLabel } from "@/utils/format";
import { cn } from "@/lib/utils";

const dotClass: Record<ShoppingStatus, string> = {
  otimo: "bg-[var(--accent-green)]",
  bom: "bg-[var(--accent-cyan)]",
  atencao: "bg-[var(--accent-yellow)]",
  critico: "bg-[var(--accent-red)]",
  offline: "bg-muted-foreground",
};

const badgeClass: Record<ShoppingStatus, string> = {
  otimo: "bg-[var(--accent-green)]/15 text-[var(--accent-green)] border-[var(--accent-green)]/30",
  bom: "bg-[var(--accent-green)]/12 text-[var(--accent-green)] border-[var(--accent-green)]/28",
  atencao:
    "bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] border-[var(--accent-orange)]/30",
  critico: "bg-[var(--accent-red)]/15 text-[var(--accent-red)] border-[var(--accent-red)]/30",
  offline: "bg-muted/40 text-muted-foreground border-border",
};

export function StatusDot({ status, className, color }: { status: ShoppingStatus; className?: string; color?: string }) {
  return <span className={cn("inline-block h-2 w-2 rounded-full", color ? undefined : dotClass[status], className)} style={color ? { backgroundColor: color } : undefined} />;
}

export function StatusBadge({ status, label, dotColor }: { status: ShoppingStatus; label?: string; dotColor?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium",
        badgeClass[status],
      )}
    >
      <StatusDot status={status} color={dotColor} /> {label ?? statusLabel(status)}
    </span>
  );
}
