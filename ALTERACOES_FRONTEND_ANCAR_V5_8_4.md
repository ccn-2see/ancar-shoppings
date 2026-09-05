# ANCAR Frontend V5.8.4 — correção efetiva das cores dos indicadores

## Diagnóstico
A V5.8.3 adicionava classes Tailwind de cor (`text-[var(--accent-red)]` / `text-[var(--accent-green)]`) aos dois primeiros indicadores, mas o componente `Metric` também mantinha `text-foreground`. Como ambas possuem a mesma especificidade, a ordem do CSS gerado podia deixar `text-foreground` prevalecer no build de produção. Por isso a regra existia no código, mas visualmente os números continuavam neutros.

## Correção
- A cor passou a ser fornecida por `deviationColor` no helper central de performance.
- `ShoppingCard` aplica a cor dos dois primeiros valores via `style={{ color: ... }}`, eliminando disputa com classes Tailwind.
- `Custo acima` permanece neutro.
- A tabela da aba Shoppings usa a mesma cor inline para `kW/TR` e `Vs meta`; custo permanece neutro.
- A regra continua centralizada e vale para todos os shoppings.

## Regra visual
- acima da meta: vermelho nos indicadores `Eficiência` e `Desempenho`;
- na meta ou abaixo: verde nos mesmos indicadores;
- desligado / sem medição / sem meta: cinza;
- custo: neutro.

Nenhum workflow foi alterado.
