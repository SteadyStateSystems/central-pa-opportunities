import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const statusPath = path.join(root, 'web', 'status.json');
const outPath = path.join(root, 'web', 'health.html');

const status = JSON.parse(await fs.readFile(statusPath, 'utf8').catch(() => '{}'));
const adapters = Array.isArray(status?.collect?.adapters) ? status.collect.adapters : [];

const rows = adapters.map(a => `
<tr>
  <td>${a.name || ''}</td>
  <td>${a.ok ? 'OK' : 'FAILED'}</td>
  <td>${a.count ?? ''}</td>
  <td>${a.error || ''}</td>
</tr>`).join('');

const html = `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Opportunity Radar Health</title>
<style>body{font-family:Arial,sans-serif;max-width:1000px;margin:24px auto;padding:0 14px;background:#0f1115;color:#e8ebf0}table{width:100%;border-collapse:collapse;background:#171a21}th,td{border:1px solid #2a2f3a;padding:8px}th{background:#202534}a{color:#8cc8ff}</style>
</head><body>
<h1>CentralPA Opportunity Radar — Health</h1>
<p>Generated: ${status.generatedAt || 'n/a'}</p>
<ul>
<li>Raw total: ${status?.collect?.totalRaw ?? 0}</li>
<li>Scored total: ${status?.opportunities?.scoredTotal ?? 0}</li>
<li>Priority: ${status?.opportunities?.priorityCount ?? 0}</li>
<li>Due 7d: ${status?.opportunities?.due7Count ?? 0}</li>
<li>Approved subs: ${status?.subscribers?.approved ?? 0}</li>
<li>Pending subs: ${status?.subscribers?.pending ?? 0}</li>
</ul>
<table><thead><tr><th>Adapter</th><th>Status</th><th>Count</th><th>Error</th></tr></thead><tbody>${rows}</tbody></table>
<p><a href="./index.html">Back to dashboard</a></p>
</body></html>`;

await fs.writeFile(outPath, html);
console.log(`Built health page: ${outPath}`);
