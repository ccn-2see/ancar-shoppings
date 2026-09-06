# Validação — ANCAR Frontend V5.8.7

## Objetivo

Validar a implementação homologada dos estados operacionais do tanque de água gelada nos cards da Visão do Portfólio e da aba Shoppings.

## Regras implementadas

- `tank_charging` → **Carregando**, azul (`--accent-blue`).
- `tank_discharging` → **Descarregando**, roxo (`--accent-purple`).
- Fora destes estados, o card mantém a classificação de desempenho já existente.
- A bolinha superior acompanha azul/roxo somente durante carga/descarga.
- A tabela da aba Shoppings também mostra Carregando/Descarregando.
- O custo permanece neutro e as cores de eficiência/meta permanecem inalteradas.
- Nenhum workflow foi alterado.

## Resultado dos testes

`npm run validate`: **PASS**.

Principais validações:

- 106 arquivos TS/TSX analisados, 0 erros de sintaxe/transpilação.
- Histórico 24h/7d/30d: PASS.
- Comparativos: PASS.
- Layout KPIs: PASS em 8 viewports.
- Layout Portfólio: PASS em 9 viewports.
- Polling silencioso de 5 minutos: PASS.
- Resiliência do histórico: 12/12 PASS.
- Ranking/meta: PASS.
- Saúde de aquisição: 10/10 PASS.
- Conceito econômico: 12/12 PASS.
- Relatórios: PASS em 5 viewports.
- Login: PASS.
- Temas: PASS em 40 cenários.
- NSM/status-power: 9/9 PASS.
- Regras de desempenho dos cards: PASS.
- Tons dos dois primeiros indicadores: 10/10 PASS.
- Energia & Carbono homologada: 18/18 PASS.
- Status do tanque V5.8.7: **11/11 PASS**.

## Integração de dados

O frontend consome `thermalStorage.systemOperatingMode` retornado pela API, com fallback para `latest.kpis.sistema_modo_operacional`.

Valores reconhecidos nesta alteração:

- `tank_charging`
- `tank_discharging`

Outros modos continuam usando o comportamento visual já existente.
