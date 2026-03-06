import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const pendingPath = path.join(root, 'data', 'subscribers.pending.json');
const expiredLogPath = path.join(root, 'data', 'subscribers.pending.expired.json');

const maxAgeDays = Number(process.argv[2] || 14);
const maxAgeMs = maxAgeDays * 24 * 60 * 60 * 1000;

const pending = JSON.parse(await fs.readFile(pendingPath, 'utf8'));
let expiredLog = [];
try {
  expiredLog = JSON.parse(await fs.readFile(expiredLogPath, 'utf8'));
} catch {
  expiredLog = [];
}

const now = Date.now();
const keep = [];
const expired = [];

for (const p of pending) {
  const created = new Date(p.createdAt || 0).getTime();
  const ageMs = Number.isFinite(created) ? (now - created) : Number.MAX_SAFE_INTEGER;
  if (ageMs > maxAgeMs) {
    expired.push({ ...p, expiredAt: new Date().toISOString(), reason: `older than ${maxAgeDays} days` });
  } else {
    keep.push(p);
  }
}

const mergedExpired = [...expiredLog, ...expired].slice(-5000);

await fs.writeFile(pendingPath, JSON.stringify(keep, null, 2));
await fs.writeFile(expiredLogPath, JSON.stringify(mergedExpired, null, 2));

console.log(`Expired pending: ${expired.length}. Remaining pending: ${keep.length}.`);
