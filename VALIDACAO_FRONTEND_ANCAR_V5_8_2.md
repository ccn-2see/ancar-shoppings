# ANCAR Frontend V5.8.2 — Validação

Base: V5.8.1 Loading Resilience + backend Outlier Guard V1 sem alteração de contrato frontend.

## Regra de performance dos cards

Validação sintética da nova regra única usada na Home e em `/shoppings`:

- 10% abaixo da meta → **Ótimo** + bolinha verde — PASS
- 3% abaixo da meta → **Bom** + bolinha verde — PASS
- na meta → **Bom** + bolinha verde — PASS
- 3% acima da meta → **Atenção** + bolinha laranja — PASS
- 7% acima da meta → **Crítico** + bolinha laranja — PASS
- 10% acima da meta → **Crítico** + bolinha vermelha — PASS
- desligado → bolinha cinza — PASS
- sem medição → bolinha cinza — PASS
- sem meta → bolinha cinza — PASS
- texto acima da meta em vermelho — PASS
- texto abaixo da meta em verde — PASS

Observação: como o vermelho da bolinha começa apenas em 10%, a faixa de 5% a <10% fica com status textual **Crítico** e bolinha **laranja**.

## Regressão completa

`npm run validate`: PASS.

- TS/TSX: 105 arquivos, 0 erros
- Histórico 24h/7d/30d: PASS
- Comparativos: PASS
- KPI layout: 8 viewports — PASS
- Portfólio: 9 viewports — PASS
- Polling silencioso 5 min: PASS
- Resiliência de histórico: 12/12 PASS
- Ranking/meta: PASS
- Saúde da aquisição: 10/10 PASS
- Conceito econômico: PASS
- Relatórios: 5 viewports — PASS
- Login: 7 cenários — PASS
- Temas: 40 cenários — PASS
- NSM/status-power: 9/9 PASS
- Performance dos cards: 11/11 PASS

## Escopo de implantação

Somente frontend. Nenhum workflow n8n precisa ser substituído para esta alteração visual/regra de classificação.
