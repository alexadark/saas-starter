@echo off
setlocal enabledelayedexpansion

echo Starting Natural Language SQL Interface...
echo.

REM Get the script's directory
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..

REM Check if .env exists in server directory
if not exist "%PROJECT_ROOT%\app\server\.env" (
    echo [ERROR] No .env file found in app\server\
    echo.
    echo Please:
    echo   1. cd app\server
    echo   2. copy .env.sample .env
    echo   3. Edit .env and add your API keys
    echo.
    pause
    exit /b 1
)

echo [OK] Starting backend server...
cd /d "%PROJECT_ROOT%\app\server"
start "Backend Server" cmd /k "python -m uv run python server.py"

echo [OK] Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo [OK] Starting frontend server...
cd /d "%PROJECT_ROOT%\app\client"
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ========================================
echo Services started successfully!
echo ========================================
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo ========================================
echo.
echo Close the server windows to stop the services
echo.
pause
