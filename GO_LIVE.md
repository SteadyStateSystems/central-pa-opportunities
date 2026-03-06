# CentralPA Opportunity Radar — Go Live Checklist

## 1) Email Sending (SMTP)
Edit `config.email.json`:

- Set real SMTP credentials:
  - `smtp.host`
  - `smtp.port`
  - `smtp.secure`
  - `smtp.user`
  - `smtp.pass`
- Set:
  - `"enabled": true`
  - `"dryRun": false`

Run a test send:

```bat
send-test-email.bat you@example.com
```

---

## 2) Stripe Webhook Tier Updates
Set backend env var before starting server:

- `RADAR_STRIPE_WEBHOOK_TOKEN=<strong-random-token>`

Webhook endpoint:

- `POST /radar-stripe-webhook`

Required auth header:

- `x-radar-webhook-token: <same-token>`

Supported event `type` values:

- `checkout.session.completed`
- `invoice.paid`
- `customer.subscription.deleted`
- `invoice.payment_failed`

---

## 3) Public vs Paid Feed Safety
Publicly published artifacts should be only:

- `opportunity-radar/index.html`
- `opportunity-radar/feed.free.json`
- `opportunity-radar/feed.free.rss.xml`

Do **not** publish `feed.pro.json` publicly.

---

## 4) Scheduler / Daily Automation
Task name:

- `CentralPA Opportunity Radar Daily`

Expected run:

- Daily at `06:30 AM`

Pipeline order:

1. collect
2. score
3. build web
4. build feeds
5. build digests
6. build outbound queue
7. send outbound
8. publish dashboard/feed artifacts

---

## 5) Subscriber Operations
Review pending:

```bat
list-pending.bat
```

Approve all pending:

```bat
approve-all-pending.bat
```

Reject one pending email:

```bat
reject-pending-email.bat someone@example.com
```

Reject all pending:

```bat
reject-all-pending.bat
```

---

## 6) Quick Health Checks
Backend:

- `/health`
- `/radar-subscribe` (POST test)
- `/radar-stripe-webhook` (test event + token)

Public page:

- `https://steadystatesystems.github.io/Dispatch/opportunity-radar/`

Feeds:

- `https://steadystatesystems.github.io/Dispatch/opportunity-radar/feed.free.json`
- `https://steadystatesystems.github.io/Dispatch/opportunity-radar/feed.free.rss.xml`
