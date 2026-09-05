# Validação — ANCAR Frontend V5.8.6

## Resultado
**PASS**

## Validação completa
Executado `npm run validate` na base V5.8.6.

Resultados principais:
- 105 arquivos TS/TSX analisados, 0 erros de transpile.
- Histórico 24h / 7d / 30d: PASS.
- Comparativos: PASS.
- Layout KPI: PASS em 8 viewports.
- Portfólio: PASS em 9 viewports.
- Polling silencioso 5 min: PASS.
- Resiliência de histórico: 12/12 PASS.
- Ranking / metas: PASS.
- Saúde de aquisição: 10/10 PASS.
- Conceito econômico: PASS.
- Relatórios: PASS em 5 viewports.
- Login: PASS em 7 cenários.
- Temas: 40/40 PASS.
- NSM + status/power: 9/9 PASS.
- Performance dos cards: 11/11 PASS.
- Tons visíveis dos dois primeiros indicadores: 10/10 PASS.
- Conceito Energia & Carbono V5.8.6: **18/18 PASS**.

## Testes específicos da aba Energia & Carbono
- Faixa “O que isso representa?” presente.
- Equivalência em km de carro presente.
- Equivalência em litros de gasolina presente.
- Equivalência árvore-ano presente.
- Ressalva metodológica das equivalências presente.
- Gráfico Energia + Custo + Carbono presente.
- Série de carbono calculada a partir da energia e fator configurado.
- Painel Detalhes de Carbono presente.
- Painel Leitura rápida presente.
- Fator de emissão visível na barra de filtros.
- Atalho funcional para Configurações.
- Distinção entre emissão associada e emissão direta presente.
- Constantes didáticas centralizadas no código.
- Layout específico da página validado.

## Observação
O build Vite completo não foi usado como critério desta validação porque o pacote de entrega não contém `node_modules`. As validações estáticas e funcionais existentes do projeto passaram integralmente.
