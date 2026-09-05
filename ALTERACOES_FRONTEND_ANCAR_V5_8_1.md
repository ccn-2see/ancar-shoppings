# ANCAR Frontend V5.8.1 — correção de flash de indisponibilidade

## Objetivo
Eliminar a mensagem transitória de falha/indisponibilidade que podia aparecer durante a carga inicial e desaparecer logo depois, sem mascarar falhas reais.

## Alterações
- `src/routes/index.tsx`: a Visão Geral usa a primeira unidade do portfólio como fallback visual enquanto `selectedShoppingCode` é propagado pelo contexto.
- Estados transitórios de seleção não exibem mais `Visão Geral indisponível`; permanecem em loading silencioso.
- `src/routes/__root.tsx`: o Error Boundary aguarda 1,6 s antes de exibir a mensagem fatal. Erros transitórios que se resolvem no próprio ciclo do router mostram somente `Carregando painel...`.
- Erros persistentes continuam exibindo `Não foi possível carregar esta página` e os botões de recuperação.
- Nenhuma URL de API, regra de negócio, polling ou workflow foi alterado.

## Versão
Marcadores de UI e cache bust atualizados de 5.8.0 para 5.8.1.
