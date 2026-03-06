import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const scoredPath = path.join(root, 'data', 'opportunities.scored.json');
const outPath = path.join(root, 'web', 'index.html');

const items = JSON.parse(await fs.readFile(scoredPath, 'utf8'));

const rows = items.map(x => `
  <tr data-tier="${(x.tier || '').toLowerCase()}" data-source="${String(x.source || '').toLowerCase()}" data-title="${String(x.title || '').toLowerCase()}">
    <td>${x.tier.toUpperCase()}</td>
    <td>${x.title}${x.is_stale ? ' <em style="color:#ffb3b3">(stale)</em>' : ''}</td>
    <td>${x.source}</td>
    <td>${x.deadline || ''}${Number.isFinite(x.deadline_days) && x.deadline_days < 999 ? ` <small>(${x.deadline_days}d)</small>` : ''}</td>
    <td>${x.score_total}</td>
    <td>${x.score_confidence ?? ''}</td>
    <td><a href="${x.url}" target="_blank" rel="noreferrer">Open</a></td>
  </tr>`).join('');

const generatedAt = new Date();
const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>CentralPA Opportunity Radar</title>
  <style>
    body{font-family:Arial,sans-serif;margin:20px;background:#0f1115;color:#e8ebf0}
    h1{margin-top:0}
    .meta{margin:0 0 12px;color:#b8c1d1;font-size:14px}
    .pill{display:inline-block;padding:3px 8px;border:1px solid #33405a;border-radius:999px;margin-right:8px}
    table{width:100%;border-collapse:collapse;background:#171a21}
    th,td{border:1px solid #2a2f3a;padding:8px;font-size:14px}
    th{background:#202534}
    a{color:#8cc8ff}
    .footerLinks{margin-top:14px;font-size:13px;color:#b8c1d1}
    .footerLinks a{margin-right:12px}
  </style>
</head>
<body>
  <h1>CentralPA Opportunity Radar</h1>
  <div class="meta">
    <span class="pill">Items: ${items.length}</span>
    <span class="pill">Last Updated: ${generatedAt.toLocaleString()}</span>
  </div>
  <div id="kpis" style="display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px;">
    <span id="kpiNewToday" class="pill">New today: 0</span>
    <span id="kpiDueSoon" class="pill">Due ≤7d: 0</span>
    <span id="kpiPriority" class="pill">Priority: 0</span>
    <span id="kpiSourceHealth" class="pill">Sources active: 0</span>
  </div>
  <p>Top ranked opportunities (MVP feed)</p>
  <div style="margin:0 0 14px;padding:10px;border:1px solid #2a2f3a;background:#151924;border-radius:8px;max-width:700px;">
    <strong>Subscribe for daily email digest</strong>
    <div style="font-size:13px;color:#b8c1d1;margin:6px 0 10px;">Free = top 10 daily. Pro = full ranked digest + richer detail.</div>
    <form id="subscribeForm" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <input id="subEmail" type="email" placeholder="you@example.com" required style="padding:8px;border-radius:6px;border:1px solid #3a4254;background:#0f1320;color:#e8ebf0;min-width:240px;" />
      <select id="subTier" style="padding:8px;border-radius:6px;border:1px solid #3a4254;background:#0f1320;color:#e8ebf0;">
        <option value="free">Free</option>
        <option value="pro">Pro</option>
      </select>
      <button type="submit" style="padding:8px 12px;border-radius:6px;border:1px solid #3a4254;background:#1f6feb;color:#fff;">Request Access</button>
      <span id="subStatus" style="font-size:12px;color:#b8c1d1"></span>
    </form>
  </div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin:0 0 10px;align-items:center;">
    <input id="q" placeholder="Search title/source" style="padding:8px;border-radius:6px;border:1px solid #3a4254;background:#0f1320;color:#e8ebf0;min-width:220px;" />
    <select id="tierFilter" style="padding:8px;border-radius:6px;border:1px solid #3a4254;background:#0f1320;color:#e8ebf0;">
      <option value="">All tiers</option>
      <option value="priority">Priority</option>
      <option value="strong">Strong</option>
      <option value="optional">Optional</option>
    </select>
    <select id="sourceFilter" style="padding:8px;border-radius:6px;border:1px solid #3a4254;background:#0f1320;color:#e8ebf0;">
      <option value="">All sources</option>
    </select>
    <select id="deadlineFilter" style="padding:8px;border-radius:6px;border:1px solid #3a4254;background:#0f1320;color:#e8ebf0;">
      <option value="">Any deadline</option>
      <option value="7">Due in 7 days</option>
      <option value="14">Due in 14 days</option>
      <option value="30">Due in 30 days</option>
    </select>
    <span id="visibleCount" class="pill">Visible: ${items.length}</span>
  </div>
  <table>
    <thead><tr><th>Tier</th><th>Opportunity</th><th>Source</th><th>Deadline</th><th>Score</th><th>Confidence</th><th>Link</th></tr></thead>
    <tbody id="rows">${rows}</tbody>
  </table>
  <div id="runSummary" class="meta" style="margin-top:10px;"></div>
  <div id="healthSummary" class="meta" style="margin-top:4px;"></div>
  <div class="footerLinks">
    <a href="./terms.html">Terms</a>
    <a href="./privacy.html">Privacy</a>
    <a href="./sources.html">Sources</a>
    <a href="./health.html">Health</a>
    <a href="./status.json">Status JSON</a>
  </div>
  <script>
    const q = document.getElementById('q');
    const tierFilter = document.getElementById('tierFilter');
    const sourceFilter = document.getElementById('sourceFilter');
    const deadlineFilter = document.getElementById('deadlineFilter');
    const visibleCount = document.getElementById('visibleCount');
    const runSummary = document.getElementById('runSummary');
    const healthSummary = document.getElementById('healthSummary');
    const kpiNewToday = document.getElementById('kpiNewToday');
    const kpiDueSoon = document.getElementById('kpiDueSoon');
    const kpiPriority = document.getElementById('kpiPriority');
    const kpiSourceHealth = document.getElementById('kpiSourceHealth');
    const rows = Array.from(document.querySelectorAll('#rows tr'));

    const sources = [...new Set(rows.map(r => r.dataset.source || '').filter(Boolean))].sort();
    if (sourceFilter) {
      sourceFilter.innerHTML = '<option value="">All sources</option>' + sources.map(s => '<option value="' + s + '">' + s + '</option>').join('');
    }

    function parseDeadlineDays(r) {
      const text = r.children?.[3]?.innerText || '';
      const m = text.match(/\(([-\d]+)d\)/);
      return m ? Number(m[1]) : 999;
    }

    function rowDateIsToday(r) {
      const text = r.children?.[3]?.innerText || '';
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      return text.includes(yyyy + '-' + mm + '-' + dd);
    }

    function applyFilters() {
      const query = (q?.value || '').toLowerCase().trim();
      const tier = (tierFilter?.value || '').toLowerCase();
      const sourceSel = (sourceFilter?.value || '').toLowerCase();
      const dwin = Number(deadlineFilter?.value || 0);
      let visible = 0;

      let dueSoon = 0;
      let priority = 0;
      let newToday = 0;
      const visibleSources = new Set();

      rows.forEach(r => {
        const title = r.dataset.title || '';
        const source = r.dataset.source || '';
        const rtier = r.dataset.tier || '';
        const d = parseDeadlineDays(r);

        const passQ = !query || title.includes(query) || source.includes(query);
        const passTier = !tier || rtier === tier;
        const passSource = !sourceSel || source === sourceSel;
        const passDeadline = !dwin || (Number.isFinite(d) && d >= 0 && d <= dwin);

        const show = passQ && passTier && passSource && passDeadline;
        r.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
          if (Number.isFinite(d) && d >= 0 && d <= 7) dueSoon += 1;
          if (rtier === 'priority') priority += 1;
          if (rowDateIsToday(r)) newToday += 1;
          if (source) visibleSources.add(source);
        }
      });

      if (visibleCount) visibleCount.textContent = 'Visible: ' + visible;
      if (kpiNewToday) kpiNewToday.textContent = 'New today: ' + newToday;
      if (kpiDueSoon) kpiDueSoon.textContent = 'Due ≤7d: ' + dueSoon;
      if (kpiPriority) kpiPriority.textContent = 'Priority: ' + priority;
      if (kpiSourceHealth) kpiSourceHealth.textContent = 'Sources active: ' + visibleSources.size;
      if (runSummary) runSummary.textContent = 'Filtered view • query=' + (query || 'none') + ' • tier=' + (tier || 'all') + ' • source=' + (sourceSel || 'all') + (dwin ? (' • deadline<=' + dwin + 'd') : '');
    }

    q?.addEventListener('input', applyFilters);
    tierFilter?.addEventListener('change', applyFilters);
    sourceFilter?.addEventListener('change', applyFilters);
    deadlineFilter?.addEventListener('change', applyFilters);

    const form = document.getElementById('subscribeForm');
    const status = document.getElementById('subStatus');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('subEmail')?.value?.trim();
      const tier = document.getElementById('subTier')?.value || 'free';
      if (!email) return;
      status.textContent = 'Submitting...';
      try {
        const res = await fetch('https://adjusted-bluejay-gratefully.ngrok-free.app/radar-subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
          body: JSON.stringify({ email, tier })
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.error || ('HTTP ' + res.status));
        status.textContent = 'Request received. Pending approval.';
        form.reset();
      } catch (err) {
        status.textContent = 'Failed: ' + err.message;
      }
    });

    fetch('./status.json').then(r => r.json()).then(s => {
      if (!healthSummary) return;
      const active = s?.collect?.activeAdapters ?? 0;
      const failed = s?.collect?.failedAdapters ?? 0;
      const pending = s?.subscribers?.pending ?? 0;
      healthSummary.textContent = 'System • adapters active: ' + active + ' • failed: ' + failed + ' • pending signups: ' + pending;
    }).catch(() => {
      if (healthSummary) healthSummary.textContent = 'System summary unavailable';
    });

    applyFilters();
  </script>
</body>
</html>`;

await fs.writeFile(outPath, html);
console.log(`Built dashboard: ${outPath}`);
