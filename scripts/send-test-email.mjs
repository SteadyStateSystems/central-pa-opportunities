import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const cfgPath = path.join(root, 'config.email.json');
const cfg = JSON.parse(await fs.readFile(cfgPath, 'utf8'));

const to = process.argv[2];
if (!to) {
  console.log('Usage: node scripts/send-test-email.mjs you@example.com');
  process.exit(1);
}

if (!cfg.enabled || cfg.dryRun) {
  console.log('Email provider is not live-enabled. Set enabled=true and dryRun=false in config.email.json.');
  process.exit(1);
}
if (cfg.provider !== 'smtp') {
  console.log(`Unsupported provider: ${cfg.provider}`);
  process.exit(1);
}

const mod = await import('nodemailer');
const transporter = mod.default.createTransport({
  host: cfg.smtp.host,
  port: cfg.smtp.port,
  secure: cfg.smtp.secure,
  auth: { user: cfg.smtp.user, pass: cfg.smtp.pass }
});

const info = await transporter.sendMail({
  from: cfg.from,
  to,
  subject: 'CentralPA Opportunity Radar Test',
  text: 'Test email from CentralPA Opportunity Radar sender pipeline.'
});

console.log(`Test email sent: ${info?.messageId || 'ok'}`);
