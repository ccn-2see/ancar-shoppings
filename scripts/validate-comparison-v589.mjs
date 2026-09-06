import fs from 'node:fs';
const comparisonSource=fs.readFileSync(new URL('../src/utils/comparison.ts',import.meta.url),'utf8');
const index=fs.readFileSync(new URL('../src/routes/index.tsx',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
let passed=0; const checks=[];
function check(ok,msg){checks.push([!!ok,msg]); if(ok) passed++; else {console.error('FAIL',msg); process.exitCode=1;}}
check(pkg.version==='5.8.9','versão frontend 5.8.9');
check(comparisonSource.includes('return "vs ontem"'),'24h rotulado vs ontem');
check(comparisonSource.includes('return "vs 7 dias anteriores"'),'7d preservado');
check(comparisonSource.includes('return "vs 30 dias anteriores"'),'30d preservado');
check(index.includes('hoje até o horário atual contra ontem até o mesmo horário'),'descrição explícita hoje vs ontem mesmo horário');
check(index.includes('média em operação'),'base operacional preservada');
check(index.includes('eficiência do período'),'eficiência consolidada preservada');
check(index.includes('minimumOperationalSamples = 6'),'mínimo de amostras operacionais preservado');
check(index.includes('minimumCoveragePct = 70'),'cobertura mínima preservada');
console.log(`VALIDAÇÃO COMPARATIVO HOJE VS ONTEM V5.8.9: ${passed}/${checks.length} PASS`);
