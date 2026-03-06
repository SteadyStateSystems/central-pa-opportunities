import fs from 'node:fs/promises';
import path from 'node:path';
import { collectDced } from './adapters/dced.mjs';
import { collectDauphin } from './adapters/dauphin.mjs';
import { collectPaEMarketplace } from './adapters/pa_emarketplace.mjs';
import { collectGrantsGov } from './adapters/grants_gov.mjs';
import { collectCumberland } from './adapters/cumberland.mjs';
import { collectYork } from './adapters/york.mjs';

const root = path.resolve(process.cwd());
const samplePath = path.join(root, 'data', 'opportunities.sample.json');
const outPath = path.join(root, 'data', 'opportunities.raw.json');
const runLogPath = path.join(root, 'data', 'collect.run.json');

const sample = JSON.parse(await fs.readFile(samplePath, 'utf8'));

const results = [];
const run = { startedAt: new Date().toISOString(), adapters: [] };

async function runAdapter(name, fn) {
  try {
    const items = await fn();
    run.adapters.push({ name, ok: true, count: items.length });
    return items;
  } catch (err) {
    run.adapters.push({ name, ok: false, error: String(err?.message || err) });
    return [];
  }
}

results.push(...await runAdapter('dced', collectDced));
results.push(...await runAdapter('dauphin', collectDauphin));
results.push(...await runAdapter('cumberland', collectCumberland));
results.push(...await runAdapter('york', collectYork));
results.push(...await runAdapter('pa_emarketplace', collectPaEMarketplace));
results.push(...await runAdapter('grants_gov', collectGrantsGov));

const byUrl = new Map();
for (const item of [...results, ...sample]) {
  if (!item?.url) continue;
  if (!byUrl.has(item.url)) byUrl.set(item.url, item);
}

const merged = [...byUrl.values()];
run.total = merged.length;
run.finishedAt = new Date().toISOString();

await fs.writeFile(outPath, JSON.stringify(merged, null, 2));
await fs.writeFile(runLogPath, JSON.stringify(run, null, 2));

console.log(`Collected ${merged.length} items -> ${outPath}`);
console.log(`Run log -> ${runLogPath}`);
