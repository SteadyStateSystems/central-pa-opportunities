import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const scoredPath = path.join(root, 'data', 'opportunities.scored.json');
const tiersPath = path.join(root, 'config.tiers.json');
const outFree = path.join(root, 'data', 'daily-digest.free.txt');
const outPro = path.join(root, 'data', 'daily-digest.pro.txt');
const outLegacy = path.join(root, 'data', 'daily-digest.txt');

const items = JSON.parse(await fs.readFile(scoredPath, 'utf8'));
const tiers = JSON.parse(await fs.readFile(tiersPath, 'utf8'));

function buildDigest(label, maxItems, detailed = false) {
  const top = items.slice(0, maxItems);
  const lines = [];
  lines.push(`CentralPA Opportunity Radar — ${label} Digest`);
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push('');

  if (!top.length) {
    lines.push('No opportunities found today.');
    return lines.join('\n');
  }

  top.forEach((x, i) => {
    lines.push(`${i + 1}) [${String(x.tier || '').toUpperCase()}] ${x.title}`);
    lines.push(`   Source: ${x.source} | Score: ${x.score_total}`);
    if (x.deadline) lines.push(`   Deadline: ${x.deadline}${Number.isFinite(x.deadline_days) && x.deadline_days < 999 ? ` (${x.deadline_days}d)` : ''}`);
    if (detailed) {
      if (x.category) lines.push(`   Category: ${x.category}`);
      if (x.location) lines.push(`   Location: ${x.location}`);
      if (x.is_stale) lines.push('   ⚠ Stale listing (older posting signal)');
      if (x.summary) lines.push(`   Summary: ${x.summary}`);
    }
    lines.push(`   Link: ${x.url}`);
    lines.push('');
  });

  return lines.join('\n');
}

const freeTxt = buildDigest(tiers.free.name, tiers.free.maxItems, false);
const proTxt = buildDigest(tiers.pro.name, tiers.pro.maxItems, true);

await fs.writeFile(outFree, freeTxt);
await fs.writeFile(outPro, proTxt);
await fs.writeFile(outLegacy, freeTxt);

console.log(`Built free digest: ${outFree}`);
console.log(`Built pro digest: ${outPro}`);
console.log(`Built legacy digest: ${outLegacy}`);
