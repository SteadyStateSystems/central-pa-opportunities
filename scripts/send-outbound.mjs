import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(process.cwd());
const cfgPath = path.join(root, 'config.email.json');
const queuePath = path.join(root, 'data', 'outbound.queue.json');
const sentLogPath = path.join(root, 'data', 'outbound.sent.json');

const cfg = JSON.parse(await fs.readFile(cfgPath, 'utf8'));
const queue = JSON.parse(await fs.readFile(queuePath, 'utf8'));

let sentLog = [];
try {
  sentLog = JSON.parse(await fs.readFile(sentLogPath, 'utf8'));
} catch {
  sentLog = [];
}

async function sendSmtp(msg) {
  const mod = await import('nodemailer');
  const transporter = mod.default.createTransport({
    host: cfg.smtp.host,
    port: cfg.smtp.port,
    secure: cfg.smtp.secure,
    auth: {
      user: cfg.smtp.user,
      pass: cfg.smtp.pass
    }
  });

  const info = await transporter.sendMail({
    from: cfg.from,
    to: msg.to,
    subject: msg.subject,
    text: msg.text
  });
  return info?.messageId || null;
}

let sentCount = 0;
let failCount = 0;

for (const msg of queue) {
  if (msg.status && msg.status !== 'queued') continue;

  try {
    if (!cfg.enabled || cfg.dryRun) {
      msg.status = 'dry_run';
      msg.sentAt = new Date().toISOString();
      msg.providerMessageId = null;
    } else {
      if (cfg.provider !== 'smtp') throw new Error(`Unsupported provider: ${cfg.provider}`);
      const id = await sendSmtp(msg);
      msg.status = 'sent';
      msg.sentAt = new Date().toISOString();
      msg.providerMessageId = id;
      sentCount += 1;
    }

    sentLog.push({
      id: msg.id,
      to: msg.to,
      tier: msg.tier,
      subject: msg.subject,
      status: msg.status,
      sentAt: msg.sentAt,
      providerMessageId: msg.providerMessageId || null
    });
  } catch (err) {
    msg.status = 'failed';
    msg.error = String(err?.message || err);
    msg.failedAt = new Date().toISOString();
    failCount += 1;
  }
}

await fs.writeFile(queuePath, JSON.stringify(queue, null, 2));
await fs.writeFile(sentLogPath, JSON.stringify(sentLog.slice(-1000), null, 2));

console.log(`Outbound processed. sent=${sentCount} failed=${failCount} mode=${cfg.enabled ? (cfg.dryRun ? 'dry-run' : 'live') : 'disabled'}`);
