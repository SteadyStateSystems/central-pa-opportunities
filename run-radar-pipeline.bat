@echo off
setlocal
cd /d C:\Users\asshole\Desktop\centralpa-opportunity-radar

node scripts\collect.mjs || goto :eof
node scripts\score.mjs || goto :eof
node scripts\build-web.mjs || goto :eof
node scripts\build-feeds.mjs || goto :eof
node scripts\digest.mjs || goto :eof
node scripts\build-outbound.mjs || goto :eof
node scripts\send-outbound.mjs || goto :eof
node scripts\expire-pending.mjs 14 || goto :eof
node scripts\subscribers-report.mjs || goto :eof
node scripts\build-run-summary.mjs || goto :eof
node scripts\build-health-page.mjs || goto :eof

rem Publish latest dashboard + feeds to GitHub Pages path
copy /Y "C:\Users\asshole\Desktop\centralpa-opportunity-radar\web\index.html" "C:\Users\asshole\Desktop\Project-Management\opportunity-radar\index.html" >nul
copy /Y "C:\Users\asshole\Desktop\centralpa-opportunity-radar\web\feed.free.json" "C:\Users\asshole\Desktop\Project-Management\opportunity-radar\feed.free.json" >nul
copy /Y "C:\Users\asshole\Desktop\centralpa-opportunity-radar\web\feed.free.rss.xml" "C:\Users\asshole\Desktop\Project-Management\opportunity-radar\feed.free.rss.xml" >nul
copy /Y "C:\Users\asshole\Desktop\centralpa-opportunity-radar\web\status.json" "C:\Users\asshole\Desktop\Project-Management\opportunity-radar\status.json" >nul
copy /Y "C:\Users\asshole\Desktop\centralpa-opportunity-radar\web\health.html" "C:\Users\asshole\Desktop\Project-Management\opportunity-radar\health.html" >nul

git -C "C:\Users\asshole\Desktop\Project-Management" add opportunity-radar\index.html opportunity-radar\feed.free.json opportunity-radar\feed.free.rss.xml opportunity-radar\status.json opportunity-radar\health.html

git -C "C:\Users\asshole\Desktop\Project-Management" diff --cached --quiet
if %errorlevel%==0 goto :eof

git -C "C:\Users\asshole\Desktop\Project-Management" commit -m "Auto-publish Opportunity Radar dashboard update"
git -C "C:\Users\asshole\Desktop\Project-Management" push origin main
