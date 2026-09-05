# ANCAR Frontend V5.8.6 — Energia & Carbono homologada

Base: V5.8.5 / regras de portfólio V5.8.4 preservadas.

## Escopo
Implementação do conceito visual aprovado para a aba **Energia & Carbono**, sem alteração nos workflows ou contratos de API.

## Principais alterações
- Barra superior da página reorganizada com Shopping, período, fator de emissão e atalho para Configurações.
- 4 KPIs principais: Energia consumida, Custo energético, Emissões associadas e Custo acima da meta.
- Nova faixa **“O que isso representa?”** traduzindo o CO₂ técnico para equivalências didáticas:
  - quilômetros de carro a gasolina;
  - litros de gasolina queimados;
  - árvores absorvendo CO₂ por um ano (árvore-ano).
- Equivalências são explicitamente rotuladas como ilustrativas e não substituem o inventário oficial.
- Gráfico principal passou a combinar Energia (barras), Custo energético (linha) e Emissões associadas (linha).
- Novo painel **Detalhes de Carbono** com emissões, energia/emissões evitadas, intensidade, fator, tarifa, tempo na meta e ano de referência.
- Novo painel **Leitura rápida** com interpretação operacional em linguagem simples.
- Mantida a explicação de que CO₂ associado à eletricidade é indireto e não representa emissão direta/fumaça do shopping.
- Layout desktop compacto e responsivo preservado com scroll interno quando necessário.

## Constantes didáticas usadas nas equivalências
- Gasolina: `2,31 kgCO₂/L`.
- Automóvel a gasolina: `0,232 kgCO₂/km`.
- Árvore-ano: `22 kgCO₂/ano`.

Essas constantes servem apenas para comunicação visual e não alteram o cálculo oficial de CO₂, que continua sendo:

`energia consumida (kWh) × fator de emissão configurado (kgCO₂/kWh)`

## Sem mudanças
- Aquisição WebCTRL.
- PostgreSQL / Redis.
- Workflow 01.
- Workflow 10.
- Workflow 11.
- Demais workflows.
- Regras de classificação dos cards de shoppings.
- Polling de 5 minutos.
