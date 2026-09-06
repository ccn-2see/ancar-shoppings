# ANCAR Frontend V5.8.7 — Status do tanque nos cards

## Alteração homologada

A Visão do Portfólio e a aba Shoppings passam a priorizar o estado operacional do tanque de água gelada na faixa inferior dos cards:

- `tank_charging` → **Carregando**, azul.
- `tank_discharging` → **Descarregando**, roxo.
- demais estados → mantém a classificação de desempenho já existente (`Ótimo`, `Bom`, `Atenção`, `Crítico`, `Desligado`, etc.).

A bolinha superior acompanha azul/roxo durante carga/descarga, conforme o conceito visual homologado. Fora desses dois modos, mantém as regras anteriores de meta/medição.

A visualização em tabela da aba Shoppings também exibe `Carregando`/`Descarregando` no campo Status.

## Dados

Nenhum workflow foi alterado. O frontend utiliza `thermalStorage.systemOperatingMode` já fornecido pela API V8.4, com fallback para `latest.kpis.sistema_modo_operacional`.

## Preservado

- cores e regras de eficiência vs meta;
- custo acima da meta neutro;
- polling de 5 minutos;
- layout e paginação atuais;
- tela Energia & Carbono V5.8.6;
- rotas, autenticação e integrações existentes.
