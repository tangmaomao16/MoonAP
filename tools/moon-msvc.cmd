@echo off
setlocal

set "VSWHERE=%ProgramFiles(x86)%\Microsoft Visual Studio\Installer\vswhere.exe"
set "VSDEVCMD="

if exist "%VSWHERE%" (
  for /f "usebackq tokens=*" %%I in (`"%VSWHERE%" -latest -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath`) do (
    set "VSDEVCMD=%%I\Common7\Tools\VsDevCmd.bat"
  )
)

if not defined VSDEVCMD (
  if exist "%ProgramFiles%\Microsoft Visual Studio\18\Community\Common7\Tools\VsDevCmd.bat" (
    set "VSDEVCMD=%ProgramFiles%\Microsoft Visual Studio\18\Community\Common7\Tools\VsDevCmd.bat"
  )
)

if not exist "%VSDEVCMD%" (
  echo MoonAP could not find Visual Studio VsDevCmd.bat with MSVC C++ tools.
  echo Install the Visual Studio Desktop development with C++ workload, then retry.
  exit /b 1
)

if "%~1"=="" (
  echo Usage: tools\moon-msvc.cmd ^<moon-arguments^>
  echo Example: tools\moon-msvc.cmd test
  exit /b 2
)

call "%VSDEVCMD%" -arch=amd64 -host_arch=amd64 >nul
moon %*
