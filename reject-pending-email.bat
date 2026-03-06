@echo off
cd /d C:\Users\asshole\Desktop\centralpa-opportunity-radar
if "%~1"=="" (
  echo Usage: reject-pending-email.bat someone@example.com
  exit /b 1
)
node scripts\reject-pending.mjs email %1
