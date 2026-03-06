import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const pendingPath = path.join(root, 'data', 'subscribers.pending.json');
const subsPath = path.join(root, 'data', 'subscribers.json');

const mode = (process.argv[2] || 'all').toLowerCase(); // all | email
const arg = process.argv[3] || '';

const pending = JSON.parse(await fs.readFile(pendingPath, 'utf8'));
const subs = JSON.parse(await fs.readFile(subsPath, 'utf8'));

const existingEmails = new Set(subs.map(s => String(s.email || '').toLowerCase()));
let approved = 0;
const remaining = [];

for (const p of pending) {
  const email = String(p.email || '').toLowerCase();
  const match = mode === 'all' || (mode === 'email' && email === arg.toLowerCase());

  if (!match) {
    remaining.push(p);
    continue;
  }

  if (!email || existingEmails.has(email)) {
    continue;
  }

  subs.push({
    id: `sub-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
    email,
    tier: ['free', 'pro', 'pro_alerts'].includes(String(p.tier || '').toLowerCase()) ? String(p.tier).toLowerCase() : 'free',
    enabled: true,
    createdAt: new Date().toISOString(),
    source: 'pending-approval'
  });
  existingEmails.add(email);
  approved += 1;
}

await fs.writeFile(subsPath, JSON.stringify(subs, null, 2));
await fs.writeFile(pendingPath, JSON.stringify(remaining, null, 2));

console.log(`Approved ${approved}. Pending remaining: ${remaining.length}.`);
