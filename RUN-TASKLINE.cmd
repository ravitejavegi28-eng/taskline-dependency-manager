@echo off
setlocal
cd /d "%~dp0"
set "TASKLINE_NODE=node"
where node >nul 2>nul
if errorlevel 1 set "TASKLINE_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist node_modules\mongoose (
  echo First install dependencies with npm install or pnpm install.
  pause
  exit /b 1
)
echo.
echo Taskline - Project Dependency Manager
echo Open http://127.0.0.1:4173 in your browser after the ready message.
echo Keep this window open while using Taskline. Press Ctrl+C to stop.
echo.
"%TASKLINE_NODE%" server\index.js --production
if errorlevel 1 pause

