import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  BadgeDollarSign,
  Car,
  CircleGauge,
  Fuel,
  Info,
  Leaf,
  Settings2,
  Target,
  TreePine,
  Zap,
} from "lucide-react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { liveDashboardService } from "@/services/liveDashboardService";
import type { HistoryPeriod, LiveShoppingSummary, ShoppingApiResponse } from "@/types";
import { EmptyState, LoadingBlock, PageHeader } from "@/components/ui-helpers";
import {
  FilterBar,
  InternalPage,
  SectionPanel,
  chartTooltipStyle,
} from "@/components/InternalPage";
import { formatBRL2, formatNumber } from "@/utils/format";
import { useDashboardRuntime } from "@/contexts/dashboard-runtime-context";
import {
  buildChartHistory,
  formatHistoryTick,
  formatHistoryTooltip,
  getHistoryTimeDomain,
  historyTickCount,
} from "@/utils/history";

const DEFAULT_EMISSION_FACTOR = 0.0461;
const DEFAULT_EMISSION_SOURCE = "MCTI/SIRENE - Fator Médio de Emissão do SIN";
const DEFAULT_EMISSION_YEAR = 2025;

// Equivalências exclusivamente didáticas para dar escala ao número de CO₂.
// Elas não substituem o cálculo oficial do inventário de emissões.
const GASOLINE_KG_CO2_PER_LITER = 2.31;
const CAR_KG_CO2_PER_KM = 0.232;
const TREE_KG_CO2_PER_YEAR = 22;

const PERIOD_LABEL: Record<HistoryPeriod, string> = {
  "24h": "últimas 24 horas",
  "7d": "últimos 7 dias",
  "30d": "últimos 30 dias",
};

export const Route = createFileRoute("/esg")({
  head: () => ({ meta: [{ title: "Energia & Carbono" }] }),
  component: EnergyCarbonPage,
});

function EnergyCarbonPage() {
  const {
    tick,
    selectedShoppingCode,
    setSelectedShoppingCode,
    historyPeriod: period,
    setHistoryPeriod: setPeriod,
  } = useDashboardRuntime();
  const [portfolio, setPortfolio] = useState<LiveShoppingSummary[]>([]);
  const [data, setData] = useState<ShoppingApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const detailQueryRef = useRef("");

  useEffect(() => {
    let alive = true;
    liveDashboardService.getPortfolio().then((p) => {
      if (!alive) return;
      setPortfolio(p.shoppings);
      if (p.shoppings.length && !p.shoppings.some((s) => s.code === selectedShoppingCode)) {
        setSelectedShoppingCode(p.shoppings[0].code);
      }
    });
    return () => {
      alive = false;
    };
  }, [tick, selectedShoppingCode, setSelectedShoppingCode]);

  useEffect(() => {
    if (!selectedShoppingCode) return;
    let alive = true;
    const key = `${selectedShoppingCode}:${period}`;
    const queryChanged = detailQueryRef.current !== key;
    detailQueryRef.current = key;
    if (queryChanged && (!data || data.shopping?.code !== selectedShoppingCode || data.period !== period)) {
      setLoading(true);
    }
    liveDashboardService
      .getShopping(selectedShoppingCode, period)
      .then((r) => {
        if (alive) setData(r);
      })
      .catch(() => {})
      .finally(() => {
        if (alive && queryChanged) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [selectedShoppingCode, period, tick]);

  const baseChart = useMemo(() => buildChartHistory(data?.history ?? [], period), [data, period]);
  const domain = useMemo(
    () => getHistoryTimeDomain(period, data?.generatedAt),
    [period, data?.generatedAt],
  );
  const summary = data?.summary;
  const settings = data?.shopping?.settings;
  const emissionFactor = settings?.emissionFactorKgCo2Kwh ?? DEFAULT_EMISSION_FACTOR;
  const emissionSource = settings?.emissionFactorSource ?? DEFAULT_EMISSION_SOURCE;
  const emissionYear = settings?.emissionFactorReferenceYear ?? DEFAULT_EMISSION_YEAR;

  const chart = useMemo(
    () =>
      baseChart.map((point) => ({
        ...point,
        emissionsKgCo2:
          typeof point.energyKwh === "number" && Number.isFinite(point.energyKwh)
            ? point.energyKwh * emissionFactor
            : null,
      })),
    [baseChart, emissionFactor],
  );

  const energyKwh = finiteOrNull(summary?.energyKwh);
  const thermalTrh = finiteOrNull(summary?.thermalTrh);
  const targetKwTr = finitePositiveOrNull(settings?.targetKwTr);
  const targetEnergyKwh =
    finiteOrNull(summary?.targetEnergyKwh) ??
    (thermalTrh != null && targetKwTr != null ? thermalTrh * targetKwTr : null);

  const associatedKgCo2 = energyKwh == null ? null : energyKwh * emissionFactor;
  const savedVsTargetKwh =
    energyKwh != null && targetEnergyKwh != null
      ? Math.max(0, targetEnergyKwh - energyKwh)
      : finiteOrNull(summary?.savedKwh);
  const excessVsTargetKwh =
    finiteOrNull(summary?.excessEnergyKwh) ??
    (energyKwh != null && targetEnergyKwh != null ? Math.max(0, energyKwh - targetEnergyKwh) : null);
  const avoidedKgCo2 = savedVsTargetKwh == null ? null : savedVsTargetKwh * emissionFactor;
  const extraCarbonVsTargetKgCo2 = excessVsTargetKwh == null ? null : excessVsTargetKwh * emissionFactor;
  const carbonIntensityKgCo2Trh =
    associatedKgCo2 != null && thermalTrh != null && thermalTrh > 0
      ? associatedKgCo2 / thermalTrh
      : null;

  const gasolineLiters = associatedKgCo2 == null ? null : associatedKgCo2 / GASOLINE_KG_CO2_PER_LITER;
  const carKm = associatedKgCo2 == null ? null : associatedKgCo2 / CAR_KG_CO2_PER_KM;
  const treeYears = associatedKgCo2 == null ? null : associatedKgCo2 / TREE_KG_CO2_PER_YEAR;

  return (
    <InternalPage className="compact-page compact-esg-page">
      <PageHeader
        eyebrow="Energia, custos e impacto climático"
        title="Energia & Carbono"
        subtitle="Consolide consumo de energia, custos e o impacto climático da CAG em uma leitura simples e prática."
        icon={Leaf}
      />

      <FilterBar className="esg-filter-bar grid gap-3 lg:grid-cols-[minmax(240px,1fr)_auto_minmax(250px,.75fr)_auto] lg:items-end">
        <label className="text-[10px] uppercase tracking-[.1em] text-muted-foreground">
          Shopping
          <select
            className="mt-1 block h-9 w-full rounded-lg border border-border/60 bg-background/55 px-3 text-sm normal-case text-foreground"
            value={selectedShoppingCode}
            onChange={(e) => setSelectedShoppingCode(e.target.value)}
          >
            {portfolio.map((s) => (
              <option key={s.code} value={s.code}>
                {s.code} · {s.name}
              </option>
            ))}
          </select>
        </label>

        <div>
          <div className="mb-1 text-[10px] uppercase tracking-[.1em] text-muted-foreground">Período</div>
          <div className="segmented-control">
            {(["24h", "7d", "30d"] as HistoryPeriod[]).map((p) => (
              <button type="button" key={p} data-active={period === p} onClick={() => setPeriod(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-[.1em] text-muted-foreground">
            Fator de emissão
            <Info className="h-3 w-3" />
          </div>
          <div className="flex h-9 items-center rounded-lg border border-border/60 bg-background/55 px-3 text-sm font-semibold text-foreground">
            {formatNumber(emissionFactor, { minimumFractionDigits: 4, maximumFractionDigits: 6 })}
            <span className="ml-1 text-[10px] font-normal text-muted-foreground">kgCO₂/kWh</span>
          </div>
        </div>

        <Link
          to="/configuracoes"
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/[0.06] px-3 text-[11px] font-semibold text-primary transition hover:bg-primary/[0.1]"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Configurar
        </Link>
      </FilterBar>

      {loading && (!data || data.period !== period) ? (
        <LoadingBlock h={620} />
      ) : !data?.shopping ? (
        <EmptyState title="Sem dados de energia" />
      ) : (
        <>
          <div className="esg-kpi-grid grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <EsgKpiCard
              label="Energia consumida"
              value={energyKwh == null ? "—" : formatNumber(energyKwh / 1000, { maximumFractionDigits: 2 })}
              unit="MWh"
              description={`Consumo consolidado nas ${PERIOD_LABEL[period]}.`}
              icon={Zap}
              tone="blue"
            />
            <EsgKpiCard
              label="Custo energético"
              value={formatBRL2(summary?.energyCostBrl)}
              description="Estimativa pela tarifa configurada para o shopping."
              icon={BadgeDollarSign}
              tone="yellow"
            />
            <EsgKpiCard
              label="Emissões associadas"
              value={formatEmissionNumber(associatedKgCo2)}
              unit={associatedKgCo2 != null && associatedKgCo2 >= 1000 ? "tCO₂" : "kgCO₂"}
              description="CO₂ associado à eletricidade consumida pela CAG."
              icon={Leaf}
              tone="green"
            />
            <EsgKpiCard
              label="Custo acima da meta"
              value={formatBRL2(summary?.costAboveTargetBrl)}
              description="Parcela estimada ligada ao consumo acima da Meta CAG."
              icon={Target}
              tone="orange"
            />
          </div>

          <section className="esg-equivalence-panel rounded-2xl border border-[var(--accent-green)]/20 bg-[var(--accent-green)]/[0.045] p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--accent-green)]/10 text-[var(--accent-green)]">
                    <Leaf className="h-4 w-4" />
                  </span>
                  O que isso representa?
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {associatedKgCo2 == null
                    ? "Sem energia suficiente para estimar equivalências neste período."
                    : `Os ${formatKgCo2(associatedKgCo2)} associados ao consumo equivalem, de forma ilustrativa, a:`}
                </p>
              </div>
              <div className="text-[9px] leading-relaxed text-muted-foreground lg:max-w-[340px] lg:text-right">
                Equivalências didáticas para facilitar a interpretação. Não substituem o cálculo oficial de emissões.
              </div>
            </div>

            <div className="esg-equivalence-grid mt-3 grid gap-2 sm:grid-cols-3">
              <EquivalenceCard
                icon={Car}
                value={carKm == null ? "—" : `≈ ${formatNumber(carKm, { maximumFractionDigits: 0 })} km`}
                label="de carro a gasolina"
                detail="Referência ilustrativa de emissão por quilômetro."
                tone="blue"
              />
              <EquivalenceCard
                icon={Fuel}
                value={gasolineLiters == null ? "—" : `≈ ${formatNumber(gasolineLiters, { maximumFractionDigits: 0 })} L`}
                label="de gasolina queimados"
                detail="Equivalência aproximada de combustão."
                tone="purple"
              />
              <EquivalenceCard
                icon={TreePine}
                value={treeYears == null ? "—" : `≈ ${formatNumber(treeYears, { maximumFractionDigits: 0 })} árvores`}
                label="absorvendo CO₂ por 1 ano"
                detail="Estimativa ilustrativa; varia por espécie, idade e manejo."
                tone="green"
              />
            </div>
          </section>

          <div className="esg-workspace compact-scroll-region min-h-0 flex-1 pr-1">
            <div className="esg-dashboard-grid grid gap-3 pb-1 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.62fr)_minmax(300px,.62fr)]">
              <SectionPanel
                title="Evolução de Energia, Custo e Carbono"
                subtitle="Consumo de energia, custo energético e emissões associadas ao longo do tempo"
                icon={Activity}
                className="h-full"
              >
                <div className="h-[350px] xl:h-[390px] 2xl:h-[420px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chart} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                      <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="chartTimestamp"
                        type="number"
                        scale="time"
                        domain={domain}
                        tickCount={historyTickCount(period)}
                        tickFormatter={(v) => formatHistoryTick(Number(v), period)}
                        tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                        allowDataOverflow
                      />
                      <YAxis
                        yAxisId="energy"
                        tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                        width={44}
                        label={{ value: "Energia (kWh)", angle: -90, position: "insideLeft", fontSize: 9, fill: "var(--muted-foreground)" }}
                      />
                      <YAxis
                        yAxisId="cost"
                        orientation="right"
                        tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
                        width={48}
                        label={{ value: "Custo (R$)", angle: 90, position: "insideRight", fontSize: 9, fill: "var(--muted-foreground)" }}
                      />
                      <Tooltip
                        contentStyle={chartTooltipStyle}
                        labelFormatter={(v) => formatHistoryTooltip(typeof v === "number" ? v : Number(v))}
                        formatter={(value: number, name: string) => {
                          if (name === "Emissões (kgCO₂)") return [`${formatNumber(value, { maximumFractionDigits: 2 })} kgCO₂`, name];
                          if (name.includes("Custo")) return [formatBRL2(value), name];
                          return [`${formatNumber(value, { maximumFractionDigits: 2 })} kWh`, name];
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
                      <Bar
                        isAnimationActive={false}
                        yAxisId="energy"
                        dataKey="energyKwh"
                        name="Energia (kWh)"
                        fill="var(--accent-blue)"
                        radius={[2, 2, 0, 0]}
                      />
                      <Line
                        isAnimationActive={false}
                        yAxisId="cost"
                        type="linear"
                        dataKey="energyCostBrl"
                        name="Custo energético (R$)"
                        stroke="var(--accent-yellow)"
                        dot={false}
                        strokeWidth={2}
                      />
                      <Line
                        isAnimationActive={false}
                        yAxisId="energy"
                        type="linear"
                        dataKey="emissionsKgCo2"
                        name="Emissões (kgCO₂)"
                        stroke="var(--accent-green)"
                        dot={false}
                        strokeWidth={2}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </SectionPanel>

              <SectionPanel title="Detalhes de Carbono" subtitle="Como interpretar os indicadores" icon={Leaf} className="h-full">
                <div className="space-y-0.5">
                  <DetailRow label="Emissões associadas" value={formatKgCo2(associatedKgCo2)} />
                  <DetailRow
                    label="Energia evitada vs. referência"
                    value={savedVsTargetKwh != null && savedVsTargetKwh > 0 ? `${formatNumber(savedVsTargetKwh, { maximumFractionDigits: 1 })} kWh` : "—"}
                  />
                  <DetailRow
                    label="Emissões evitadas"
                    value={avoidedKgCo2 != null && avoidedKgCo2 > 0 ? formatKgCo2(avoidedKgCo2) : "—"}
                  />
                  <DetailRow
                    label="Intensidade de carbono"
                    value={carbonIntensityKgCo2Trh == null ? "—" : `${formatNumber(carbonIntensityKgCo2Trh, { maximumFractionDigits: 3 })} kgCO₂/TRh`}
                  />
                  <DetailRow
                    label="Fator aplicado"
                    value={`${formatNumber(emissionFactor, { minimumFractionDigits: 4, maximumFractionDigits: 6 })} kgCO₂/kWh`}
                  />
                  <DetailRow
                    label="Tarifa aplicada"
                    value={settings?.energyTariffBrlMwh == null ? "—" : `R$ ${formatNumber(settings.energyTariffBrlMwh, { maximumFractionDigits: 2 })}/MWh`}
                  />
                  <DetailRow
                    label="Tempo dentro da meta"
                    value={summary?.targetTimePct == null ? "—" : `${formatNumber(summary.targetTimePct, { maximumFractionDigits: 1 })}%`}
                  />
                  <DetailRow label="Ano de referência" value={String(emissionYear)} />
                </div>

                <div className="mt-3 rounded-xl border border-border/50 bg-muted/10 p-3 text-[10px] leading-relaxed text-muted-foreground">
                  <div className="mb-1 flex items-center gap-1.5 font-semibold text-foreground">
                    <Info className="h-3.5 w-3.5 text-primary" />
                    O que este número significa?
                  </div>
                  O CO₂ mostrado é associado à geração da eletricidade consumida pela CAG. Não representa fumaça ou emissão direta do shopping.
                  <div className="mt-2 text-[9px]">
                    Fonte do fator: <b className="text-foreground">{emissionSource}</b>.
                  </div>
                </div>
              </SectionPanel>

              <SectionPanel title="Leitura rápida" subtitle="O que merece atenção neste período" icon={CircleGauge} className="h-full">
                <div className="space-y-2">
                  <ReadingCard
                    icon={Zap}
                    title="Consumo do período"
                    text={
                      energyKwh == null
                        ? "Sem energia consolidada para este período."
                        : `A CAG consumiu ${formatNumber(energyKwh / 1000, { maximumFractionDigits: 2 })} MWh, com custo estimado de ${formatBRL2(summary?.energyCostBrl)}.`
                    }
                    tone="info"
                  />
                  <ReadingCard
                    icon={Leaf}
                    title="Impacto climático"
                    text={
                      associatedKgCo2 == null
                        ? "Sem energia suficiente para estimar o CO₂ associado."
                        : `${formatKgCo2(associatedKgCo2)} de CO₂ estão associados à eletricidade consumida neste período.`
                    }
                    tone="positive"
                  />
                  <ReadingCard
                    icon={Target}
                    title={excessVsTargetKwh != null && excessVsTargetKwh > 0 ? "Atenção à meta" : "Referência de eficiência"}
                    text={targetPerformanceText(summary?.targetTimePct, excessVsTargetKwh, summary?.costAboveTargetBrl, targetEnergyKwh != null)}
                    tone={excessVsTargetKwh != null && excessVsTargetKwh > 0 ? "warning" : targetEnergyKwh != null ? "positive" : "neutral"}
                  />
                  <ReadingCard
                    icon={Leaf}
                    title="Carbono vs. Meta CAG"
                    text={carbonImpactText(associatedKgCo2, avoidedKgCo2, extraCarbonVsTargetKgCo2, targetEnergyKwh != null)}
                    tone={savedVsTargetKwh != null && savedVsTargetKwh > 0 ? "positive" : extraCarbonVsTargetKgCo2 != null && extraCarbonVsTargetKgCo2 > 0 ? "warning" : "neutral"}
                  />
                </div>

                <Link
                  to="/analises"
                  className="mt-3 flex items-center justify-between rounded-xl border border-primary/20 bg-primary/[0.055] px-3 py-2.5 text-[11px] font-semibold text-primary transition hover:bg-primary/[0.1]"
                >
                  <span>Ver análise completa</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </SectionPanel>
            </div>
          </div>
        </>
      )}
    </InternalPage>
  );
}

function finiteOrNull(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function finitePositiveOrNull(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
}

function formatEmissionNumber(value: number | null | undefined) {
  if (value == null) return "—";
  if (value >= 1000) return formatNumber(value / 1000, { maximumFractionDigits: 3 });
  return formatNumber(value, { maximumFractionDigits: 1 });
}

function formatKgCo2(value: number | null | undefined) {
  if (value == null) return "—";
  if (value >= 1000) return `${formatNumber(value / 1000, { maximumFractionDigits: 3 })} tCO₂`;
  return `${formatNumber(value, { maximumFractionDigits: 1 })} kgCO₂`;
}

function targetPerformanceText(
  targetTimePct: number | null | undefined,
  excessEnergyKwh: number | null,
  costAboveTargetBrl: number | null | undefined,
  hasTargetReference: boolean,
) {
  if (!hasTargetReference) return "A Meta CAG ainda não está disponível para calcular uma referência de consumo.";
  const time = finiteOrNull(targetTimePct);
  const excess = excessEnergyKwh ?? 0;
  if (excess > 0) {
    const prefix = time == null ? "" : `${formatNumber(time, { maximumFractionDigits: 1 })}% do tempo ficou dentro da meta. `;
    return `${prefix}${formatNumber(excess, { maximumFractionDigits: 1 })} kWh ficaram acima da referência, equivalentes a ${formatBRL2(costAboveTargetBrl)}.`;
  }
  return time == null
    ? "O consumo consolidado ficou dentro da referência energética da Meta CAG."
    : `${formatNumber(time, { maximumFractionDigits: 1 })}% do tempo ficou dentro da meta e não houve energia consolidada acima da referência.`;
}

function carbonImpactText(
  associatedKgCo2: number | null,
  avoidedKgCo2: number | null,
  extraCarbonKgCo2: number | null,
  hasTargetReference: boolean,
) {
  if (associatedKgCo2 == null) return "Sem energia suficiente para estimar o impacto climático do período.";
  if (!hasTargetReference) return "Configure a Meta CAG para comparar o consumo e o carbono com uma referência operacional.";
  if (avoidedKgCo2 != null && avoidedKgCo2 > 0) {
    return `O desempenho abaixo da referência evitou aproximadamente ${formatKgCo2(avoidedKgCo2)} frente à Meta CAG.`;
  }
  if (extraCarbonKgCo2 != null && extraCarbonKgCo2 > 0) {
    return `O consumo acima da referência representa cerca de ${formatKgCo2(extraCarbonKgCo2)} adicionais frente à Meta CAG.`;
  }
  return "O consumo consolidado ficou alinhado à referência energética da Meta CAG.";
}

function EsgKpiCard({
  label,
  value,
  unit,
  description,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  description: string;
  icon: typeof Leaf;
  tone: "blue" | "yellow" | "green" | "orange";
}) {
  const toneColor = {
    blue: "var(--accent-blue)",
    yellow: "var(--accent-yellow)",
    green: "var(--accent-green)",
    orange: "var(--accent-orange, var(--accent-yellow))",
  }[tone];

  return (
    <div className="rounded-2xl border border-border/55 bg-card/75 px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border"
          style={{
            color: toneColor,
            borderColor: `color-mix(in oklab, ${toneColor} 28%, transparent)`,
            background: `color-mix(in oklab, ${toneColor} 9%, transparent)`,
          }}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <div className="text-[10px] font-medium text-muted-foreground">{label}</div>
          <div className="mt-0.5 flex items-baseline gap-1.5">
            <span className="metric-value text-[22px] leading-none text-foreground">{value}</span>
            {unit ? <span className="text-[10px] text-muted-foreground">{unit}</span> : null}
          </div>
          <div className="mt-1 line-clamp-1 text-[9px] text-muted-foreground">{description}</div>
        </div>
      </div>
    </div>
  );
}

function EquivalenceCard({
  icon: Icon,
  value,
  label,
  detail,
  tone,
}: {
  icon: typeof Leaf;
  value: string;
  label: string;
  detail: string;
  tone: "blue" | "purple" | "green";
}) {
  const toneColor = {
    blue: "var(--accent-blue)",
    purple: "var(--accent-purple)",
    green: "var(--accent-green)",
  }[tone];
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-border/55 bg-background/65 px-3 py-2.5">
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full"
        style={{ color: toneColor, background: `color-mix(in oklab, ${toneColor} 10%, transparent)` }}
      >
        <Icon className="h-4.5 w-4.5" />
      </span>
      <div className="min-w-0">
        <div className="text-base font-bold text-foreground">{value}</div>
        <div className="text-[10px] font-medium text-foreground/80">{label}</div>
        <div className="mt-0.5 line-clamp-1 text-[8px] text-muted-foreground">{detail}</div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/45 px-1 py-2 text-[10px] last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  );
}

function ReadingCard({
  icon: Icon,
  title,
  text,
  tone,
}: {
  icon: typeof Leaf;
  title: string;
  text: string;
  tone: "positive" | "warning" | "info" | "neutral";
}) {
  const colorByTone = {
    positive: "var(--accent-green)",
    warning: "var(--accent-orange, var(--accent-yellow))",
    info: "var(--accent-blue)",
    neutral: "var(--muted-foreground)",
  };
  const color = colorByTone[tone];

  return (
    <div className="flex gap-2.5 rounded-xl border border-border/45 bg-muted/10 p-2.5">
      <span
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full"
        style={{ color, background: `color-mix(in oklab, ${color} 10%, transparent)` }}
      >
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold text-foreground">{title}</div>
        <p className="mt-0.5 text-[9px] leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
