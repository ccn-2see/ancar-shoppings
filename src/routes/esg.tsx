import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, BadgeDollarSign, Gauge, Leaf, Sprout, Zap } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { liveDashboardService } from "@/services/liveDashboardService";
import type { HistoryPeriod, LiveShoppingSummary, ShoppingApiResponse } from "@/types";
import { EmptyState, LoadingBlock, PageHeader } from "@/components/ui-helpers";
import { InternalPage, SectionPanel, StatCard, chartTooltipStyle } from "@/components/InternalPage";
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

  const chart = useMemo(() => buildChartHistory(data?.history ?? [], period), [data, period]);
  const domain = useMemo(
    () => getHistoryTimeDomain(period, data?.generatedAt),
    [period, data?.generatedAt],
  );
  const summary = data?.summary;
  const settings = data?.shopping?.settings;
  const emissionFactor = settings?.emissionFactorKgCo2Kwh ?? DEFAULT_EMISSION_FACTOR;
  const emissionSource = settings?.emissionFactorSource ?? DEFAULT_EMISSION_SOURCE;
  const emissionYear = settings?.emissionFactorReferenceYear ?? DEFAULT_EMISSION_YEAR;
  const associatedKgCo2 = summary?.energyKwh == null ? null : summary.energyKwh * emissionFactor;
  const avoidedKgCo2 = summary?.savedKwh == null ? summary?.avoidedKgCo2 ?? null : summary.savedKwh * emissionFactor;
  const carbonIntensityKgCo2Trh =
    associatedKgCo2 != null && summary?.thermalTrh != null && summary.thermalTrh > 0
      ? associatedKgCo2 / summary.thermalTrh
      : null;

  return (
    <InternalPage className="compact-page compact-esg-page">
      <PageHeader
        eyebrow="Energia, custos e impacto climático"
        title="Energia & Carbono"
        subtitle="Consolide consumo, custos e indicadores de carbono da CAG com fator de emissão configurável por shopping."
        icon={Leaf}
      />

      <div className="panel flex flex-wrap items-end gap-3 p-3">
        <label className="text-[10px] uppercase tracking-[.1em] text-muted-foreground">
          Shopping
          <select
            className="mt-1 block h-9 min-w-[240px] rounded-lg border border-border/60 bg-background/55 px-3 text-sm normal-case text-foreground"
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
        <div className="segmented-control">
          {(["24h", "7d", "30d"] as HistoryPeriod[]).map((p) => (
            <button type="button" key={p} data-active={period === p} onClick={() => setPeriod(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading && (!data || data.period !== period) ? (
        <LoadingBlock h={560} />
      ) : !data?.shopping ? (
        <EmptyState title="Sem dados de energia" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-6">
            <StatCard
              label="Energia"
              value={summary?.energyKwh == null ? "—" : formatNumber(summary.energyKwh / 1000, { maximumFractionDigits: 2 })}
              unit="MWh"
              icon={Zap}
              accent="blue"
            />
            <StatCard label="Custo energético" value={formatBRL2(summary?.energyCostBrl)} icon={BadgeDollarSign} accent="cyan" />
            <StatCard
              label="Emissões associadas"
              value={associatedKgCo2 == null ? "—" : formatNumber(associatedKgCo2, { maximumFractionDigits: 1 })}
              unit="kgCO₂"
              icon={Leaf}
              accent="yellow"
            />
            <StatCard
              label="Emissões evitadas"
              value={avoidedKgCo2 == null ? "—" : formatNumber(avoidedKgCo2, { maximumFractionDigits: 1 })}
              unit="kgCO₂"
              icon={Sprout}
              accent="green"
            />
            <StatCard
              label="Intensidade de carbono"
              value={carbonIntensityKgCo2Trh == null ? "—" : formatNumber(carbonIntensityKgCo2Trh, { maximumFractionDigits: 3 })}
              unit="kgCO₂/TRh"
              icon={Gauge}
              accent="green"
            />
            <StatCard label="Custo acima da meta" value={formatBRL2(summary?.costAboveTargetBrl)} icon={BadgeDollarSign} accent="yellow" />
          </div>

          <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,1.55fr)_390px]">
            <SectionPanel
              title="Evolução de Energia e Custo"
              subtitle={`Período ${period} · energia medida e valores econômicos pela tarifa configurada`}
              icon={Activity}
              className="compact-fill-panel"
            >
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chart}>
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
                    <YAxis yAxisId="energy" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
                    <YAxis yAxisId="cost" orientation="right" tick={{ fontSize: 9, fill: "var(--muted-foreground)" }} />
                    <Tooltip
                      contentStyle={chartTooltipStyle}
                      labelFormatter={(v) => formatHistoryTooltip(typeof v === "number" ? v : Number(v))}
                    />
                    <Bar isAnimationActive={false} yAxisId="energy" dataKey="energyKwh" name="Energia (kWh)" fill="var(--accent-blue)" />
                    <Line isAnimationActive={false} yAxisId="cost" type="linear" dataKey="energyCostBrl" name="Custo (R$)" stroke="var(--accent-yellow)" dot={false} strokeWidth={2} />
                    <Line isAnimationActive={false} yAxisId="cost" type="linear" dataKey="costAboveTargetBrl" name="Custo acima da meta (R$)" stroke="var(--accent-red)" dot={false} strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </SectionPanel>

            <aside className="space-y-3 compact-scroll-region overflow-y-auto pr-1">
              <SectionPanel title="Carbono" icon={Leaf}>
                <div className="space-y-2">
                  <Row label="Emissões associadas" value={formatKgCo2(associatedKgCo2)} />
                  <Row label="Energia evitada vs. referência" value={summary?.savedKwh == null ? "—" : `${formatNumber(summary.savedKwh, { maximumFractionDigits: 1 })} kWh`} />
                  <Row label="Emissões evitadas" value={formatKgCo2(avoidedKgCo2)} />
                  <Row label="Intensidade de carbono" value={carbonIntensityKgCo2Trh == null ? "—" : `${formatNumber(carbonIntensityKgCo2Trh, { maximumFractionDigits: 3 })} kgCO₂/TRh`} />
                  <Row label="Fator aplicado" value={`${formatNumber(emissionFactor, { minimumFractionDigits: 4, maximumFractionDigits: 6 })} kgCO₂/kWh`} />
                  <Row label="Ano de referência" value={String(emissionYear)} />
                </div>
              </SectionPanel>

              <SectionPanel title="Resumo econômico" icon={BadgeDollarSign}>
                <div className="space-y-2">
                  <Row label="Energia consumida" value={summary?.energyKwh == null ? "—" : `${formatNumber(summary.energyKwh / 1000, { maximumFractionDigits: 2 })} MWh`} />
                  <Row label="Custo energético" value={formatBRL2(summary?.energyCostBrl)} />
                  <Row label="Energia acima da meta" value={summary?.excessEnergyKwh == null ? "—" : `${formatNumber(summary.excessEnergyKwh, { maximumFractionDigits: 1 })} kWh`} />
                  <Row label="Custo acima da meta" value={formatBRL2(summary?.costAboveTargetBrl)} />
                  <Row label="Tempo dentro da meta" value={summary?.targetTimePct == null ? "—" : `${formatNumber(summary.targetTimePct, { maximumFractionDigits: 1 })}%`} />
                  <Row label="Tarifa aplicada" value={settings?.energyTariffBrlMwh == null ? "—" : `R$ ${formatNumber(settings.energyTariffBrlMwh, { maximumFractionDigits: 2 })}/MWh`} />
                </div>
              </SectionPanel>

              <SectionPanel title="Metodologia" icon={Gauge}>
                <div className="space-y-2 text-[10px] text-muted-foreground">
                  <p><b className="text-foreground">Emissões associadas:</b> energia consumida × fator de emissão vigente.</p>
                  <p><b className="text-foreground">Emissões evitadas:</b> energia economizada vs. referência × fator de emissão vigente.</p>
                  <p><b className="text-foreground">Intensidade:</b> kgCO₂ associados divididos pelo frio produzido em TRh.</p>
                  <p><b className="text-foreground">Referência:</b> {emissionSource}, ano {emissionYear}.</p>
                  <p>Indicadores representam estimativas operacionais de Escopo 2 location-based da eletricidade da CAG.</p>
                </div>
              </SectionPanel>
            </aside>
          </div>
        </>
      )}
    </InternalPage>
  );
}

function formatKgCo2(value: number | null | undefined) {
  if (value == null) return "—";
  if (value >= 1000) return `${formatNumber(value / 1000, { maximumFractionDigits: 3 })} tCO₂`;
  return `${formatNumber(value, { maximumFractionDigits: 1 })} kgCO₂`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}
