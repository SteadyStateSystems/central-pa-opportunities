@echo off
cd /d C:\Users\asshole\Desktop\centralpa-opportunity-radar
set DAYS=%1
if "%DAYS%"=="" set DAYS=14
node scripts\expire-pending.mjs %DAYS%
