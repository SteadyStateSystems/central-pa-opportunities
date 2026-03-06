import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const preferredShell = process.env.ComSpec || 'powershell.exe';
const run = (cmd) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: root, shell: preferredShell });
};

run('node scripts/collect.mjs');
run('node scripts/score.mjs');
run('node scripts/build-web.mjs');
run('node scripts/build-feeds.mjs');
run('node scripts/digest.mjs');
run('node scripts/build-outbound.mjs');
run('node scripts/subscribers-report.mjs');
run('node scripts/build-run-summary.mjs');
run('node scripts/build-health-page.mjs');
run('node scripts/qa-validate.mjs');
