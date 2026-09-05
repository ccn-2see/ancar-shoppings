# Validação ANCAR Frontend V5.8.1

## Objetivo
Remover o flash transitório de indisponibilidade/erro durante a carga inicial sem esconder falhas persistentes.

## Causa tratada
Foram identificados dois pontos no frontend capazes de exibir uma mensagem negativa durante transições curtas:

1. A Visão Geral podia ficar com `portfolio` já carregado enquanto `selectedShoppingCode` ainda estava sendo propagado pelo contexto, produzindo momentaneamente `selectedShopping === null`.
2. O Error Boundary raiz exibia a mensagem fatal imediatamente, inclusive para erros transitórios de hidratação/navegação que podem desaparecer no ciclo seguinte do router.

## Correções
- Fallback visual para o primeiro shopping do portfólio durante a propagação da seleção inicial.
- Estado transitório de seleção usa `LoadingBlock`, não `Visão Geral indisponível`.
- Error Boundary aplica grace period de 1,6 s com `Carregando painel...` antes de mostrar a mensagem fatal.
- Falhas persistentes continuam mostrando erro e ações de recuperação.
- Nenhuma alteração em URLs, API, polling, regras de negócio ou workflows.

## Validações executadas
- Parser/inspeção de fonte TS/TSX: 104 arquivos, 0 erros.
- Histórico: PASS.
- Comparativos: PASS.
- Polling silencioso 5 min: PASS.
- Resiliência de histórico: 12/12 PASS.
- Ranking/meta: PASS.
- Saúde de aquisição: 10/10 PASS.
- Conceito econômico/carbono: PASS.
- NSM + status/power: 9/9 PASS.
- Resiliência visual de carga V5.8.1: 6/6 PASS.
- Layout KPI: PASS em 8 viewports.
- Layout portfólio: PASS em 9 viewports.
- Relatórios: PASS em 5 viewports.
- Login: 7 cenários, 0 falhas.
- Temas: 40 cenários, 0 falhas.

## Domínios conferidos
- Frontend permitido: `ancar-shoppings.2see.io`.
- API n8n: `https://ancar-n8n.gpfgqx.easypanel.host/webhook`.
- Nenhuma referência ativa a `n8n.facilities-ai.com.br` ou `ancar-shoppings.facilities-ai.com.br` no código de runtime.

## Observação
O build Vite completo não foi executado porque este ambiente não possui as dependências npm instaladas. A suíte offline de fonte e regressão passou.
