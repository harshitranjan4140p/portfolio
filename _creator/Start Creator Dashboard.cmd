@echo off
cd /d "%~dp0"
python server.py
if errorlevel 1 (
  echo.
  echo The Creator Dashboard could not start.
  echo Make sure Python is installed, then try again.
  pause
)

