import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const collectRunPath = path.join(root, 'data', 'collect.run.json');
const scoredPath = path.join(root, 'data', 'opportunities.scored.json');
const queuePath = path.join(root, 'data', 'outbound.queue.json');
const sentPath = path.join(root, 'data', 'outbound.sent.json');
const subscribersPath = path.join(root, 'data', 'subscribers.json');
const pendingPath = path.join(root, 'data', 'subscribers.pending.json');
const outDataPath = path.join(root, 'data', 'run-summary.json');
const outWebPath = path.join(root, 'web', 'status.json');

const collectRun = JSON.parse(await fs.readFile(collectRunPath, 'utf8'));
const scored = JSON.parse(await fs.readFile(scoredPath, 'utf8'));
const queue = JSON.parse(await fs.readFile(queuePath, 'utf8'));
const sent = JSON.parse(await fs.readFile(sentPath, 'utf8').catch(() => '[]'));
const subscribers = JSON.parse(await fs.readFile(subscribersPath, 'utf8'));
const pending = JSON.parse(await fs.readFile(pendingPath, 'utf8'));

const adapters = Array.isArray(collectRun.adapters) ? collectRun.adapters : [];
const activeAdapters = adapters.filter(a => a.ok).length;
const failedAdapters = adapters.filter(a => !a.ok).length;
const priorityCount = scored.filter(x => x.tier === 'priority').length;
const due7Count = scored.filter(x => Number.isFinite(x.deadline_days) && x.deadline_days >= 0 && x.deadline_days <= 7).length;
const staleCount = scored.filter(x => x.is_stale === true).length;

const queueByStatus = queue.reduce((acc, q) => {
  const s = String(q.status || 'queued');
  acc[s] = (acc[s] || 0) + 1;
  return acc;
}, {});

const summary = {
  generatedAt: new Date().toISOString(),
  collect: {
    startedAt: collectRun.startedAt || null,
    finishedAt: collectRun.finishedAt || null,
    totalRaw: collectRun.total || 0,
    activeAdapters,
    failedAdapters,
    adapters
  },
  opportunities: {
    scoredTotal: scored.length,
    priorityCount,
    due7Count,
    staleCount
  },
  subscribers: {
    approved: subscribers.length,
    pending: pending.length
  },
  outbound: {
    queueByStatus,
    sentLogCount: sent.length
  }
};

await fs.writeFile(outDataPath, JSON.stringify(summary, null, 2));
await fs.writeFile(outWebPath, JSON.stringify(summary, null, 2));
console.log(`Built run summary: ${outDataPath}`);
