# ANCAR Frontend V5.8.4 — Validação

## Escopo
Correção efetiva da coloração dos dois primeiros indicadores nos cards de shopping da Visão Geral e da aba Shoppings, além da tabela de Shoppings.

## Diagnóstico confirmado
Na V5.8.3, `ShoppingCard` aplicava simultaneamente `text-foreground` e a classe dinâmica de cor da meta. Como as classes possuem a mesma especificidade, a ordem final do CSS gerado podia fazer `text-foreground` vencer no build de produção. O teste anterior validava apenas a presença da classe no código, portanto não detectava a disputa de CSS.

## Correção
- cor centralizada em `performance.deviationColor`;
- os valores `Eficiência` e `Desempenho` usam `style={{ color: ... }}`;
- `Custo acima` segue neutro;
- a tabela de Shoppings usa a mesma regra inline em `kW/TR` e `Vs meta`;
- desligado / sem medição / sem meta continuam cinza;
- cache-bust / marcador de UI atualizado para V5.8.4.

## Validações executadas
`npm run validate` concluído com sucesso.

- fonte TS/TSX: 105 arquivos, 0 erros;
- histórico 24h/7d/30d: PASS;
- comparativos: PASS;
- layout KPIs: 8 viewports PASS;
- layout portfólio: 9 viewports PASS;
- polling silencioso 5 min: PASS;
- resiliência de histórico: 12/12 PASS;
- ranking/meta: PASS;
- saúde de aquisição: 10/10 PASS;
- conceito econômico: PASS;
- relatórios: 5 viewports PASS;
- login: 7 cenários PASS;
- temas: 40/40 PASS;
- NSM/status-power: 9/9 PASS;
- regra de performance dos cards: PASS;
- teste específico de cor visível V5.8.4: 10/10 PASS.

## Regra final
- acima da meta: os 2 primeiros valores em vermelho;
- na meta ou abaixo: os 2 primeiros valores em verde;
- sem medição / desligado / sem meta: cinza;
- custo acima: neutro;
- bolinha e faixa inferior permanecem conforme V5.8.2.

Nenhum workflow foi alterado.
