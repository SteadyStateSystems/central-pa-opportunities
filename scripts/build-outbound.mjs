import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const subsPath = path.join(root, 'data', 'subscribers.json');
const freeDigestPath = path.join(root, 'data', 'daily-digest.free.txt');
const proDigestPath = path.join(root, 'data', 'daily-digest.pro.txt');
const outPath = path.join(root, 'data', 'outbound.queue.json');

const subscribers = JSON.parse(await fs.readFile(subsPath, 'utf8'));
const freeDigest = await fs.readFile(freeDigestPath, 'utf8');
const proDigest = await fs.readFile(proDigestPath, 'utf8');

const now = new Date().toISOString();
const queue = [];

for (const s of subscribers) {
  if (!s.enabled || !s.email) continue;
  const tier = (s.tier || 'free').toLowerCase();
  const body = tier === 'pro' || tier === 'pro_alerts' ? proDigest : freeDigest;

  queue.push({
    id: `mail-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    to: s.email,
    tier,
    subject: `CentralPA Opportunity Radar — ${tier.toUpperCase()} Daily Digest`,
    text: body,
    createdAt: now,
    status: 'queued'
  });
}

await fs.writeFile(outPath, JSON.stringify(queue, null, 2));
console.log(`Built outbound queue: ${outPath} (${queue.length} messages)`);
