import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const ts=require('/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/lib/typescript.js');
const source=fs.readFileSync(new URL('../src/utils/shopping-performance.ts',import.meta.url),'utf8');
const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const module={exports:{}};
vm.runInNewContext(js,{module,exports:module.exports,require});
const { getShoppingPerformanceState }=module.exports;
const base={id:'x',code:'TST',name:'Teste',state:'SP',stateCode:'SP',city:'Teste',latitude:0,longitude:0,status:'otimo',lastUpdate:new Date().toISOString(),dataQuality:'alta',dataAvailability:{chillers:true,perifericos:true,temperaturas:true,coveragePct:100},powerKW:500,energyTodayKwh:0,efficiencyKWTR:1,thermalLoadTR:500,peripheralKW:0,temperatureC:25,activeChillers:1,chillersTotal:2,dataQualityPct:100,savedTodayKwh:0,avoidedTodayKgCo2:0,baselineKwTr:null,targetKwTr:1,targetChillerKwTr:null,energyTariffBrlMwh:500,energyCostTodayBrl:0,costAboveTargetTodayBrl:0,costPerTrhTodayBrl:0,balanceDeviationPct:null,peripheralsPct:null};
const cases=[
 ['10% abaixo = Ótimo + verde',0.90,'otimo','green'],
 ['3% abaixo = Bom + verde',0.97,'bom','green'],
 ['na meta = Bom + verde',1.00,'bom','green'],
 ['3% acima = Atenção + laranja',1.03,'atencao','orange'],
 ['7% acima = Crítico + laranja',1.07,'critico','orange'],
 ['10% acima = Crítico + vermelho',1.10,'critico','red'],
];
let fail=0;
for(const [name,eff,status,dot] of cases){const r=getShoppingPerformanceState({...base,efficiencyKWTR:eff});const ok=r.status===status&&r.dotTone===dot;console.log(`${ok?'PASS':'FAIL'} — ${name}`);if(!ok)fail++;}
for(const [name,patch,label] of [
 ['desligado = cinza',{activeChillers:0},'Desligado'],
 ['sem medição = cinza',{efficiencyKWTR:null},'Sem medição'],
 ['sem meta = cinza',{targetKwTr:null},'Sem meta'],
]){const r=getShoppingPerformanceState({...base,...patch});const ok=r.status==='offline'&&r.dotTone==='gray'&&r.label===label;console.log(`${ok?'PASS':'FAIL'} — ${name}`);if(!ok)fail++;}
const above=getShoppingPerformanceState({...base,efficiencyKWTR:1.03});
const below=getShoppingPerformanceState({...base,efficiencyKWTR:.97});
for(const [name,ok] of [
 ['texto acima da meta vermelho',above.deviationColor==='var(--accent-red)'],
 ['texto abaixo da meta verde',below.deviationColor==='var(--accent-green)'],
]){console.log(`${ok?'PASS':'FAIL'} — ${name}`);if(!ok)fail++;}
if(fail) process.exit(1);
console.log('VALIDAÇÃO PERFORMANCE DOS CARDS V5.8.5: PASS');
