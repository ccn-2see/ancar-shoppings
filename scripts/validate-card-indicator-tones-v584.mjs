import fs from 'node:fs';

const card = fs.readFileSync(new URL('../src/components/ShoppingCard.tsx', import.meta.url), 'utf8');
const shops = fs.readFileSync(new URL('../src/routes/shoppings.tsx', import.meta.url), 'utf8');
const helper = fs.readFileSync(new URL('../src/utils/shopping-performance.ts', import.meta.url), 'utf8');

function assert(cond, msg) { if (!cond) throw new Error(msg); }

assert(helper.includes('deviationColor: string'), 'Helper: deviationColor ausente');
assert(helper.includes('deviationPct > 0 ? "var(--accent-red)" : "var(--accent-green)"'), 'Helper: cores meta não centralizadas');
assert(card.includes('label="Eficiência" color={performance.deviationColor}'), 'Card: eficiência não usa cor inline da meta');
assert(card.includes('label="Desempenho" color={performance.deviationColor}'), 'Card: desempenho não usa cor inline da meta');
assert(card.includes('style={{ color: color ?? "var(--foreground)" }}'), 'Card: Metric não aplica cor inline');
assert(card.includes('<Metric value={formatBRL2(shopping.costAboveTargetTodayBrl)} unit="hoje" label="Custo acima"/>'), 'Card: custo deve permanecer neutro');
assert(shops.includes('className="metric-value text-right" style={{color:performance.deviationColor}}'), 'Tabela: kW/TR não aplica cor inline');
assert(shops.includes('className="text-right text-xs font-semibold" style={{color:performance.deviationColor}}'), 'Tabela: vs meta não aplica cor inline');
assert(shops.includes('<TableCell className="metric-value text-right">{formatBRL2(shopping.costAboveTargetTodayBrl)}</TableCell>'), 'Tabela: custo deve permanecer neutro');
assert(!card.includes('leading-none text-foreground ${className}'), 'Card: conflito text-foreground antigo ainda presente');
console.log('VALIDAÇÃO TONS VISÍVEIS DOS 2 PRIMEIROS INDICADORES V5.8.4: 10/10 PASS');
