import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const emailCfgPath = path.join(root, 'config.email.json');
const subsPath = path.join(root, 'data', 'subscribers.json');
const pendingPath = path.join(root, 'data', 'subscribers.pending.json');
const runSummaryPath = path.join(root, 'data', 'run-summary.json');

const cfg = JSON.parse(await fs.readFile(emailCfgPath, 'utf8'));
const subs = JSON.parse(await fs.readFile(subsPath, 'utf8'));
const pending = JSON.parse(await fs.readFile(pendingPath, 'utf8'));
const runSummary = JSON.parse(await fs.readFile(runSummaryPath, 'utf8'));

const checks = [
  { name: 'email_enabled', ok: cfg.enabled === true },
  { name: 'email_not_dry_run', ok: cfg.dryRun === false },
  { name: 'smtp_user_set', ok: cfg.smtp?.user && !String(cfg.smtp.user).includes('REPLACE_') },
  { name: 'smtp_pass_set', ok: cfg.smtp?.pass && !String(cfg.smtp.pass).includes('REPLACE_') },
  { name: 'at_least_one_subscriber', ok: Array.isArray(subs) && subs.length > 0 },
  { name: 'run_summary_exists', ok: !!runSummary.generatedAt },
  { name: 'adapters_active', ok: Number(runSummary?.collect?.activeAdapters || 0) > 0 }
];

console.log('Go-live readiness checks:');
for (const c of checks) {
  console.log(`- ${c.name}: ${c.ok ? 'PASS' : 'FAIL'}`);
}
console.log(`Subscribers: ${subs.length} | Pending: ${pending.length}`);

const failed = checks.filter(c => !c.ok).length;
process.exit(failed > 0 ? 2 : 0);
