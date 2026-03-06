import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const subsPath = path.join(root, 'data', 'subscribers.json');
const pendingPath = path.join(root, 'data', 'subscribers.pending.json');
const outPath = path.join(root, 'data', 'subscribers.report.json');

const subs = JSON.parse(await fs.readFile(subsPath, 'utf8'));
const pending = JSON.parse(await fs.readFile(pendingPath, 'utf8'));

const byTier = subs.reduce((acc, s) => {
  const t = String(s.tier || 'free');
  acc[t] = (acc[t] || 0) + 1;
  return acc;
}, {});

const byBilling = subs.reduce((acc, s) => {
  const b = String(s.billingStatus || 'unknown');
  acc[b] = (acc[b] || 0) + 1;
  return acc;
}, {});

const report = {
  generatedAt: new Date().toISOString(),
  approvedTotal: subs.length,
  pendingTotal: pending.length,
  byTier,
  byBilling,
  enabledCount: subs.filter(s => s.enabled === true).length,
  disabledCount: subs.filter(s => s.enabled !== true).length
};

await fs.writeFile(outPath, JSON.stringify(report, null, 2));
console.log(`Built subscriber report: ${outPath}`);
