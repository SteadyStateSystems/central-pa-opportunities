import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const pendingPath = path.join(root, 'data', 'subscribers.pending.json');

const mode = (process.argv[2] || 'email').toLowerCase(); // email | all
const arg = process.argv[3] || '';

const pending = JSON.parse(await fs.readFile(pendingPath, 'utf8'));

let removed = 0;
let remaining = pending;

if (mode === 'all') {
  removed = pending.length;
  remaining = [];
} else if (mode === 'email') {
  const target = arg.toLowerCase();
  remaining = pending.filter(p => String(p.email || '').toLowerCase() !== target);
  removed = pending.length - remaining.length;
} else {
  console.log('Usage: node scripts/reject-pending.mjs email <email> | all');
  process.exit(1);
}

await fs.writeFile(pendingPath, JSON.stringify(remaining, null, 2));
console.log(`Rejected/removed ${removed}. Pending remaining: ${remaining.length}.`);
