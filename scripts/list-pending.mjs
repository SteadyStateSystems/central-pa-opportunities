import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const pendingPath = path.join(root, 'data', 'subscribers.pending.json');

let pending = [];
try {
  pending = JSON.parse(await fs.readFile(pendingPath, 'utf8'));
} catch {
  pending = [];
}

if (!Array.isArray(pending) || pending.length === 0) {
  console.log('No pending subscribers.');
  process.exit(0);
}

console.log(`Pending subscribers: ${pending.length}`);
for (const p of pending) {
  console.log(`- ${p.email || '(missing email)'} | tier=${p.tier || 'free'} | createdAt=${p.createdAt || 'n/a'} | id=${p.id || 'n/a'}`);
}
