@echo off
setlocal

set "ROOT=%~dp0.."

call "%~dp0stop-moonap-server.cmd"
if errorlevel 1 exit /b %errorlevel%

call "%~dp0moon-msvc.cmd" build cmd/server --target native --release
if not "%ERRORLEVEL%"=="0" exit /b %ERRORLEVEL%

call "%~dp0start-moonap-bg.cmd"
if not "%ERRORLEVEL%"=="0" exit /b %ERRORLEVEL%

exit /b 0
