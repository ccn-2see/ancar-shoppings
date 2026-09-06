import fs from 'node:fs';

const esg = fs.readFileSync('src/routes/esg.tsx', 'utf8');
const css = fs.readFileSync('src/styles.css', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const checks = [
  [pkg.version === '5.8.9', 'versão 5.8.9'],
  [esg.includes('O que isso representa?'), 'faixa de equivalências didáticas'],
  [esg.includes('de carro a gasolina'), 'equivalência em km de carro'],
  [esg.includes('de gasolina queimados'), 'equivalência em litros de gasolina'],
  [esg.includes('absorvendo CO₂ por 1 ano'), 'equivalência em árvore-ano'],
  [esg.includes('Equivalências didáticas para facilitar a interpretação'), 'ressalva metodológica das equivalências'],
  [esg.includes('Evolução de Energia, Custo e Carbono'), 'gráfico principal aprovado'],
  [esg.includes('emissionsKgCo2'), 'série de carbono derivada da energia'],
  [esg.includes('Detalhes de Carbono'), 'painel de detalhes de carbono'],
  [esg.includes('Leitura rápida'), 'painel de leitura rápida'],
  [esg.includes('Fator de emissão'), 'fator visível na barra de filtros'],
  [esg.includes('to="/configuracoes"'), 'atalho funcional para configurar fator'],
  [esg.includes('Não representa fumaça ou emissão direta do shopping.'), 'distinção emissão associada vs direta'],
  [esg.includes('GASOLINE_KG_CO2_PER_LITER = 2.31'), 'constante de equivalência gasolina centralizada'],
  [esg.includes('CAR_KG_CO2_PER_KM = 0.232'), 'constante de equivalência automóvel centralizada'],
  [esg.includes('TREE_KG_CO2_PER_YEAR = 22'), 'constante de equivalência árvore-ano centralizada'],
  [css.includes('.compact-esg-page .esg-dashboard-grid'), 'grid principal ESG V5.8.9'],
  [css.includes('.compact-esg-page .esg-equivalence-grid'), 'grid de equivalências ESG V5.8.9'],
];

let passed = 0;
for (const [ok, label] of checks) {
  if (!ok) {
    console.error(`FAIL: ${label}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${label}`);
    passed += 1;
  }
}
if (!process.exitCode) console.log(`VALIDAÇÃO CONCEITO ENERGIA & CARBONO V5.8.9: ${passed}/${checks.length} PASS`);
