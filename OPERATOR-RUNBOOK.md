# CentralPA Opportunity Radar — Operator Runbook

## A) Daily operations
1) Manual pipeline run:
```bat
C:\Users\asshole\Desktop\centralpa-opportunity-radar\run-radar-pipeline.bat
```

2) Verify health artifacts:
- `data/run-summary.json`
- `data/subscribers.report.json`
- Public: `https://steadystatesystems.github.io/Dispatch/opportunity-radar/status.json`
- Public: `https://steadystatesystems.github.io/Dispatch/opportunity-radar/health.html`

## B) Subscriber queue operations
1) List pending:
```bat
C:\Users\asshole\Desktop\centralpa-opportunity-radar\list-pending.bat
```

2) Approve all:
```bat
C:\Users\asshole\Desktop\centralpa-opportunity-radar\approve-all-pending.bat
```

3) Reject one:
```bat
C:\Users\asshole\Desktop\centralpa-opportunity-radar\reject-pending-email.bat someone@example.com
```

4) Cleanup duplicates/invalid:
```bat
C:\Users\asshole\Desktop\centralpa-opportunity-radar\cleanup-subscribers.bat
```

## C) Email go-live
1) Edit `config.email.json`
- `enabled: true`
- `dryRun: false`
- set SMTP host/user/pass

2) Test send:
```bat
C:\Users\asshole\Desktop\centralpa-opportunity-radar\send-test-email.bat you@example.com
```

## D) Stripe webhook go-live
1) Set env var before backend start:
- `RADAR_STRIPE_WEBHOOK_TOKEN=<strong-random-token>`

2) Stripe -> webhook endpoint:
- `POST /radar-stripe-webhook`
- Header: `x-radar-webhook-token: <same-token>`

3) Supported event types:
- `checkout.session.completed`
- `invoice.paid`
- `customer.subscription.deleted`
- `invoice.payment_failed`

## E) Public endpoints
- Dashboard: `https://steadystatesystems.github.io/Dispatch/opportunity-radar/`
- Free JSON: `https://steadystatesystems.github.io/Dispatch/opportunity-radar/feed.free.json`
- Free RSS: `https://steadystatesystems.github.io/Dispatch/opportunity-radar/feed.free.rss.xml`
- Health: `https://steadystatesystems.github.io/Dispatch/opportunity-radar/health.html`
