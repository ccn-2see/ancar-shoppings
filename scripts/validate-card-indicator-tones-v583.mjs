import fs from 'node:fs';

const card = fs.readFileSync(new URL('../src/components/ShoppingCard.tsx', import.meta.url), 'utf8');
const shops = fs.readFileSync(new URL('../src/routes/shoppings.tsx', import.meta.url), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

assert(card.includes('label="Eficiência" className={performance.deviationToneClass}'), 'Card: eficiência não usa tom da meta');
assert(card.includes('label="Desempenho" className={performance.deviationToneClass}'), 'Card: desempenho não usa tom da meta');
assert(card.includes('label="Custo acima"'), 'Card: custo acima ausente');
assert(!card.includes('label="Custo acima" className={performance.deviationToneClass}'), 'Card: custo não deve herdar cor da meta');
assert(shops.includes('metric-value text-right ${performance.deviationToneClass}'), 'Tabela Shoppings: kW/TR não usa tom da meta');
assert(shops.includes('text-xs font-semibold ${performance.deviationToneClass}'), 'Tabela Shoppings: vs meta não usa tom da meta');
assert(shops.includes('<TableCell className="metric-value text-right">{formatBRL2(shopping.costAboveTargetTodayBrl)}</TableCell>'), 'Tabela Shoppings: custo deve permanecer neutro');
console.log('VALIDAÇÃO TONS DOS 2 PRIMEIROS INDICADORES V5.8.3: 7/7 PASS');
