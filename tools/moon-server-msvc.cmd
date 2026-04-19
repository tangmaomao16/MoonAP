@echo off
setlocal
call "%~dp0moon-msvc.cmd" run cmd/server --target native
