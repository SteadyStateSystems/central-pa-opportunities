# Cloudflare Pages Deployment Guide

## Current deployment posture
- Frontend/dashboard output directory: `web/`
- Build pipeline: `node scripts/run-pipeline.mjs` then feed/health/summary builders
- Current blocker for full go-live automation: SMTP credentials not configured (`config.email.json`)

## 1) Create Pages project
1. Open Cloudflare Dashboard → **Workers & Pages** → **Create application**.
2. Choose **Pages** → **Connect to Git**.
3. Select repo: `SteadyStateSystems/central-pa-opportunities`.

## 2) Build settings
- **Framework preset:** None
- **Build command:**
  `node scripts/run-pipeline.mjs && node scripts/build-feeds.mjs && node scripts/build-health-page.mjs && node scripts/build-run-summary.mjs`
- **Build output directory:**
  `web`
- **Root directory:**
  `/` (repo root)

## 3) Environment variables (if needed)
If/when enabling email sender:
- `RADAR_SMTP_HOST`
- `RADAR_SMTP_PORT`
- `RADAR_SMTP_USER`
- `RADAR_SMTP_PASS`
- `RADAR_FROM`

(Use these via secure config strategy before flipping email to enabled.)

## 4) Custom domain
1. In Pages project, go to **Custom domains**.
2. Add your domain (e.g., `opportunities.yourdomain.com`).
3. Follow Cloudflare DNS prompts.

## 5) Post-deploy validation
- Open `/index.html`
- Open `/health.html`
- Verify feed endpoints:
  - `/feed.free.json`
  - `/feed.free.rss.xml`
- Confirm `run-summary.json` timestamp is current.

## 6) Final go-live checklist
Run locally before each release:
```powershell
node scripts/run-pipeline.mjs
node scripts/build-feeds.mjs
node scripts/build-health-page.mjs
node scripts/build-run-summary.mjs
node scripts/check-go-live.mjs
```

Expected current FAILs (until SMTP configured):
- email_enabled
- email_not_dry_run
- smtp_user_set
- smtp_pass_set
