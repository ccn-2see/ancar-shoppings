# ANCAR Frontend V5.8.5 — Validação

## Resultado
`npm run validate`: **PASS**.

## Cobertura geral
- TS/TSX analisados: **105**;
- erros de transpile/sintaxe: **0**;
- histórico 24h/7d/30d: PASS;
- comparativos: PASS;
- layout KPI: PASS em 8 viewports;
- portfólio: PASS em 9 viewports;
- polling silencioso de 5 min: PASS;
- resiliência de histórico: 12/12 PASS;
- ranking/meta: PASS;
- saúde de aquisição: 10/10 PASS;
- conceitos econômicos: PASS;
- relatórios: PASS em 5 viewports;
- login: PASS;
- temas: 40/40 PASS;
- status/power: 9/9 PASS;
- performance dos cards: PASS;
- cores dos dois primeiros indicadores: 10/10 PASS.

## Validação específica Energia & Carbono V5.8.5
**14/14 PASS**:
1. versão V5.8.5;
2. painel “Carbono sem complicação”;
3. fórmula visual do carbono;
4. CO₂ evitado vs. Meta CAG;
5. explicação de intensidade de carbono;
6. distinção entre emissão associada e emissão direta;
7. leitura rápida do período;
8. glossário operacional;
9. conversão do fator kgCO₂/kWh para kgCO₂/MWh;
10. CO₂ evitado somente quando consumo fica abaixo da referência;
11. grid KPI específico;
12. grid principal específico;
13. grid inferior específico;
14. remoção do override genérico que quebrava o layout da página ESG.

## Workflows
Nenhum workflow precisa ser substituído para esta versão. A alteração é exclusivamente de frontend/apresentação.
