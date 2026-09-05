# ANCAR Frontend V5.8.5 — Energia & Carbono mais clara

Base: V5.8.4.

## Objetivo
Reformular a tela **Energia & Carbono** para melhorar a leitura por usuários não técnicos, eliminar espaços vazios e tornar o significado dos indicadores de carbono autoexplicativo, sem alterar os workflows ou a persistência de dados.

## Principais alterações

### Hierarquia visual
- Redução de 6 KPIs concorrentes para 4 KPIs principais no topo:
  - Energia consumida;
  - Custo estimado;
  - CO₂ associado ao consumo;
  - Custo acima da meta.
- Correção do CSS que forçava todo `grid` da página ESG para 4 colunas e quebrava a composição interna.
- Novo workspace interno rolável, preservando o conceito de dashboard compacto por viewport.
- Gráfico e painel de carbono passam a ocupar a largura útil em composição equilibrada.

### Carbono em linguagem simples
Novo painel **Carbono sem complicação** com:
- valor principal de CO₂ associado ao consumo;
- explicação explícita de que se trata de emissão associada à eletricidade, não emissão direta do shopping;
- fórmula visual:
  `Energia consumida (MWh) × fator (kgCO₂/MWh) = emissões associadas (kgCO₂)`;
- indicação de desempenho acima/abaixo da referência da Meta CAG;
- CO₂ evitado vs. Meta CAG;
- intensidade de carbono em kgCO₂/TRh com texto “quanto menor, melhor”;
- fator aplicado, fonte e ano de referência;
- link direto para editar o fator em Configurações.

### CO₂ evitado
Para a apresentação “vs. Meta CAG”, a tela usa a mesma referência energética do conceito econômico:
- energia de referência = TRh × Meta CAG;
- energia evitada = `max(0, energia de referência - energia consumida)`;
- CO₂ evitado = energia evitada × fator de emissão.

Se não houver Meta CAG disponível, a tela informa que não há referência de meta em vez de sugerir economia.

### Leitura rápida
Adicionada seção com três mensagens em linguagem operacional:
- consumo e custo;
- desempenho frente à meta;
- impacto climático.

### Glossário
Adicionada seção **Entenda os indicadores** com definições curtas de:
- emissões associadas;
- CO₂ evitado vs. meta;
- intensidade de carbono;
- fator de emissão.

### Gráfico
- título e subtítulo mais claros;
- legenda visível;
- barras de energia e linhas de custo total/custo acima da meta;
- layout preserva histórico real 24h/7d/30d.

## Não alterado
- workflows n8n;
- endpoints;
- regras de outlier;
- polling de 5 minutos;
- autenticação;
- configuração do fator de emissão;
- regras dos cards de Portfólio/Shoppings;
- cálculos de custo persistidos no backend.
