import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const subsPath = path.join(root, 'data', 'subscribers.json');
const pendingPath = path.join(root, 'data', 'subscribers.pending.json');

const subs = JSON.parse(await fs.readFile(subsPath, 'utf8'));
const pending = JSON.parse(await fs.readFile(pendingPath, 'utf8'));

const seen = new Set();
const cleanSubs = [];
let removedSubs = 0;

for (const s of subs) {
  const email = String(s.email || '').toLowerCase().trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { removedSubs += 1; continue; }
  if (seen.has(email)) { removedSubs += 1; continue; }
  seen.add(email);
  cleanSubs.push({ ...s, email });
}

const seenPending = new Set();
const cleanPending = [];
let removedPending = 0;

for (const p of pending) {
  const email = String(p.email || '').toLowerCase().trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { removedPending += 1; continue; }
  if (seen.has(email)) { removedPending += 1; continue; }
  if (seenPending.has(email)) { removedPending += 1; continue; }
  seenPending.add(email);
  cleanPending.push({ ...p, email });
}

await fs.writeFile(subsPath, JSON.stringify(cleanSubs, null, 2));
await fs.writeFile(pendingPath, JSON.stringify(cleanPending, null, 2));

console.log(`Cleanup complete. removedSubs=${removedSubs} removedPending=${removedPending} keptSubs=${cleanSubs.length} keptPending=${cleanPending.length}`);
