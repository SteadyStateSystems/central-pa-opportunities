import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const web = path.join(root, 'web');
const data = path.join(root, 'data');

const requiredFiles = [
  path.join(web, 'index.html'),
  path.join(web, 'health.html'),
  path.join(web, 'status.json'),
  path.join(web, 'feed.free.json'),
  path.join(web, 'feed.free.rss.xml'),
  path.join(data, 'run-summary.json'),
  path.join(data, 'opportunities.scored.json')
];

const errors = [];
const warns = [];

for (const f of requiredFiles) {
  try { await fs.access(f); } catch { errors.push(`missing file: ${path.relative(root, f)}`); }
}

async function parseJson(file) {
  const txt = await fs.readFile(file, 'utf8');
  try { return JSON.parse(txt); } catch { errors.push(`invalid json: ${path.relative(root, file)}`); return null; }
}

const status = await parseJson(path.join(web, 'status.json'));
const summary = await parseJson(path.join(data, 'run-summary.json'));
const feed = await parseJson(path.join(web, 'feed.free.json'));

if (Array.isArray(feed) && feed.length === 0) warns.push('feed.free.json has 0 items');
if (status?.collect?.activeAdapters === 0) warns.push('no active adapters in status');
if (!status?.generatedAt) warns.push('status.generatedAt missing');
if (!summary?.generatedAt) warns.push('run-summary.generatedAt missing');

const html = await fs.readFile(path.join(web, 'index.html'), 'utf8');
if (html.includes('adjusted-bluejay-gratefully.ngrok-free.app')) {
  errors.push('index.html contains deprecated ngrok endpoint');
}

const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(m => m[1]).filter(h => h && !h.startsWith('http') && !h.startsWith('#') && !h.startsWith('mailto:'));
for (const h of hrefs) {
  const target = path.join(web, h.split('?')[0]);
  try { await fs.access(target); } catch { warns.push(`broken local href target: ${h}`); }
}

if (errors.length) {
  console.error('QA FAIL');
  errors.forEach(e => console.error(' -', e));
  if (warns.length) {
    console.error('QA WARNINGS');
    warns.forEach(w => console.error(' -', w));
  }
  process.exit(1);
}

console.log('QA PASS');
if (warns.length) {
  console.log('QA WARNINGS');
  warns.forEach(w => console.log(' -', w));
}
