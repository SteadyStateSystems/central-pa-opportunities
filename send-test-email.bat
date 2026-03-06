@echo off
cd /d C:\Users\asshole\Desktop\centralpa-opportunity-radar
if "%~1"=="" (
  echo Usage: send-test-email.bat you@example.com
  exit /b 1
)
node scripts\send-test-email.mjs %1
