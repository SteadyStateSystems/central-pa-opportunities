import { execSync } from 'node:child_process';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'centralpa-opportunity-radar');
const run = (cmd) => {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', cwd: root, shell: true });
};

run('node scripts/collect.mjs');
run('node scripts/score.mjs');
run('node scripts/build-web.mjs');
run('node scripts/digest.mjs');
