@echo off
setlocal

for /f "tokens=5" %%P in ('netstat -ano ^| findstr /r /c:":3000 .*LISTENING"') do (
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$targetPid = %%P; Stop-Process -Id $targetPid -Force -ErrorAction SilentlyContinue; for ($i = 0; $i -lt 20; $i++) { if ($null -eq (Get-Process -Id $targetPid -ErrorAction SilentlyContinue)) { exit 0 }; Start-Sleep -Milliseconds 250 }; exit 1"
  if errorlevel 1 (
    echo MoonAP server process %%P did not stop in time.
    exit /b 1
  )
  echo Stopped MoonAP server process %%P.
  exit /b 0
)

echo No MoonAP server is listening on port 3000.
