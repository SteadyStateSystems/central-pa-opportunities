import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const inputPath = path.join(root, 'data', 'opportunities.raw.json');
const outPath = path.join(root, 'data', 'opportunities.scored.json');

const TARGET_KEYWORDS = ['it', 'construction', 'facility', 'services', 'community', 'maintenance'];

function parseDeadline(item) {
  if (item.deadline) return item.deadline;
  const blob = `${item.title} ${item.summary}`;
  const m = blob.match(/(20\d{2}[-\/]\d{1,2}[-\/]\d{1,2})/);
  if (m) {
    const dt = new Date(m[1].replace(/\//g, '-'));
    if (!Number.isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
  }
  return null;
}

function daysUntil(deadline) {
  if (!deadline) return 999;
  const d = new Date(deadline);
  if (Number.isNaN(d.getTime())) return 999;
  const now = new Date();
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

function ageDays(postedAt) {
  if (!postedAt) return null;
  const d = new Date(postedAt);
  if (Number.isNaN(d.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)));
}

function scoreFit(item) {
  const blob = `${item.title} ${item.summary} ${item.category} ${item.eligibility_text}`.toLowerCase();
  const hits = TARGET_KEYWORDS.filter(k => blob.includes(k)).length;
  return Math.min(100, 30 + hits * 15);
}

function scoreUrgency(item) {
  const d = daysUntil(item.deadline);
  if (d <= 3) return 100;
  if (d <= 7) return 90;
  if (d <= 14) return 75;
  if (d <= 30) return 55;
  return 35;
}

function scoreValue(item) {
  const max = Number(item.amount_max || item.amount_min || 0);
  if (max >= 250000) return 100;
  if (max >= 100000) return 85;
  if (max >= 50000) return 70;
  if (max >= 20000) return 55;
  return 40;
}

function scoreTotal(fit, urgency, value) {
  return Math.round((0.45 * fit + 0.35 * urgency + 0.2 * value) * 10) / 10;
}

function confidence(item) {
  let c = 30;
  if (item.deadline) c += 20;
  if (item.amount_max || item.amount_min) c += 15;
  if (item.summary && item.summary.length > 40) c += 10;
  if (item.location) c += 10;
  if (item.category) c += 5;
  if (/dced|emarketplace|grants\.gov/i.test(String(item.source || ''))) c += 10;
  return Math.min(100, c);
}

const raw = await fs.readFile(inputPath, 'utf8');
const items = JSON.parse(raw);

const scored = items.map(item => {
  const normalizedDeadline = parseDeadline(item);
  const withDeadline = { ...item, deadline: normalizedDeadline || item.deadline || null };
  const fit = scoreFit(withDeadline);
  const urgency = scoreUrgency(withDeadline);
  const value = scoreValue(withDeadline);
  const total = scoreTotal(fit, urgency, value);
  const tier = total >= 80 ? 'priority' : total >= 60 ? 'strong' : 'optional';
  const deadlineDays = daysUntil(withDeadline.deadline);
  const postedAgeDays = ageDays(withDeadline.posted_at);
  const isStale = postedAgeDays != null ? postedAgeDays > 45 : false;
  const isExpired = Number.isFinite(deadlineDays) && deadlineDays < 0;

  const scoreConfidence = confidence(withDeadline);
  return {
    ...withDeadline,
    score_fit: fit,
    score_urgency: urgency,
    score_value: value,
    score_total: total,
    score_confidence: scoreConfidence,
    tier,
    deadline_days: deadlineDays,
    posted_age_days: postedAgeDays,
    is_stale: isStale,
    is_expired: isExpired
  };
}).filter(x => !x.is_expired).sort((a, b) => b.score_total - a.score_total);

await fs.writeFile(outPath, JSON.stringify(scored, null, 2));
console.log(`Scored ${scored.length} opportunities -> ${outPath}`);
