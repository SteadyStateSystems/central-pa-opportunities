# CentralPA Opportunity Radar

Automation-first opportunity intelligence for Central PA:
- Procurement (RFP/RFQ)
- Grants/Funding

## MVP Goals
1. Aggregate public opportunities from Central PA/state/federal sources
2. Normalize and score items by Fit/Urgency/Value
3. Publish dashboard (free tier: limited)
4. Prepare paid email alert pipeline (enabled later)

## Local Run
```powershell
node scripts\collect.mjs
node scripts\score.mjs
node scripts\build-web.mjs
node scripts\build-feeds.mjs
node scripts\digest.mjs
```
Then open `web/index.html`.

## Published feed artifacts
- `web/feed.free.json`
- `web/feed.pro.json` (internal/paid use; do not publish publicly)
- `web/feed.free.rss.xml`

## Email sender activation
1. Edit `config.email.json`
   - set `enabled: true`
   - set `dryRun: false`
   - fill SMTP host/user/pass
2. Send a test:
```powershell
send-test-email.bat you@example.com
```

## Stripe tier webhook (scaffold)
Backend endpoint: `POST /radar-stripe-webhook`
- Auth header: `x-radar-webhook-token`
- Set server env var: `RADAR_STRIPE_WEBHOOK_TOKEN`
- Supported event `type` values:
  - `checkout.session.completed`
  - `invoice.paid`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

## Data Policy
Public-source aggregation only. Respect robots/terms and throttle requests.
