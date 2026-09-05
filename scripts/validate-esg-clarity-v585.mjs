import fs from 'node:fs';

const esg = fs.readFileSync('src/routes/esg.tsx', 'utf8');
const css = fs.readFileSync('src/styles.css', 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const checks = [
  [pkg.version === '5.8.5', 'versão 5.8.5'],
  [esg.includes('Carbono sem complicação'), 'painel de carbono em linguagem simples'],
  [esg.includes('Como chegamos nesse número?'), 'fórmula visual do carbono'],
  [esg.includes('CO₂ evitado vs. Meta CAG'), 'emissões evitadas explicadas vs meta'],
  [esg.includes('Quanto CO₂ está associado a cada TRh de frio produzido. Quanto menor, melhor.'), 'intensidade explicada'],
  [esg.includes('Não é uma emissão direta de fumaça do shopping.'), 'distinção entre emissão associada e direta'],
  [esg.includes('Leitura rápida do período'), 'leitura rápida para usuário leigo'],
  [esg.includes('Entenda os indicadores'), 'glossário operacional'],
  [esg.includes('factorKgCo2Mwh = emissionFactor * 1000'), 'conversão explícita de fator kWh→MWh'],
  [esg.includes('Math.max(0, targetEnergyKwh - energyKwh)'), 'CO2 evitado calculado somente quando abaixo da referência'],
  [css.includes('.compact-esg-page > .esg-kpi-grid'), 'grid KPI ESG específico'],
  [css.includes('.compact-esg-page .esg-main-grid'), 'grid principal ESG específico'],
  [css.includes('.compact-esg-page .esg-bottom-grid'), 'grid inferior ESG específico'],
  [!css.includes('.compact-alerts-page > .grid,\n  .compact-esg-page > .grid'), 'override genérico que quebrava layout removido'],
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
if (!process.exitCode) console.log(`VALIDAÇÃO ENERGIA & CARBONO V5.8.5: ${passed}/${checks.length} PASS`);
