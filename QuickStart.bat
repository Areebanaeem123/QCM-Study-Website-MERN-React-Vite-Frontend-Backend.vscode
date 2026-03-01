@echo off
REM Quick Start Script for QCM Study Platform
REM This script helps you start both Backend and Frontend

echo.
echo ========================================
echo  QCM Study Platform - Quick Start
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.9+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Python %python --version% is installed
echo [OK] Node %node --version% is installed
echo.

REM Ask user which service to start
echo What would you like to do?
echo 1. Start Backend (FastAPI)
echo 2. Start Frontend (Next.js)
echo 3. Start Both (requires 2 terminals)
echo 4. Setup Backend (install deps + init DB)
echo 5. Setup Frontend (install deps)
echo 6. Exit
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" (
    goto start_backend
) else if "%choice%"=="2" (
    goto start_frontend
) else if "%choice%"=="3" (
    goto start_both
) else if "%choice%"=="4" (
    goto setup_backend
) else if "%choice%"=="5" (
    goto setup_frontend
) else if "%choice%"=="6" (
    exit /b 0
) else (
    echo Invalid choice
    pause
    exit /b 1
)

:start_backend
echo.
echo Starting Backend (FastAPI)...
echo.
cd Backend
echo Checking if .env file exists...
if not exist .env (
    echo.
    echo [WARNING] .env file not found!
    echo Please create Backend\.env with:
    echo   DATABASE_URL=postgresql://user:password@localhost:5432/qcm_study_db
    echo   SECRET_KEY=your-secret-key-minimum-32-characters
    echo   ALGORITHM=HS256
    echo   ACCESS_TOKEN_EXPIRE_MINUTES=30
    echo   REFRESH_TOKEN_EXPIRE_DAYS=7
    echo   CORS_ORIGINS=http://localhost:3000
    echo.
    pause
    exit /b 1
)
echo [OK] .env file found
echo.
echo Starting uvicorn server...
uvicorn app.main:app --reload --port 8000
pause
exit /b 0

:start_frontend
echo.
echo Starting Frontend (Next.js)...
echo.
cd Frontend
if not exist node_modules (
    echo Installing dependencies...
    pnpm install
    if %errorlevel% neq 0 npm install
)
echo Starting development server...
pnpm dev
pause
exit /b 0

:start_both
echo.
echo To start both services, you need 2 terminals:
echo.
echo Terminal 1 (Backend):
echo   cd Backend
echo   uvicorn app.main:app --reload --port 8000
echo.
echo Terminal 2 (Frontend):
echo   cd Frontend
echo   pnpm dev
echo.
echo Backend will run on: http://localhost:8000
echo Frontend will run on: http://localhost:3000
echo.
pause
exit /b 0

:setup_backend
echo.
echo Setting up Backend...
echo.
cd Backend
echo Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.
if not exist .env (
    echo [WARNING] .env file not found. Creating template...
    (
        echo DATABASE_URL=postgresql://user:password@localhost:5432/qcm_study_db
        echo SECRET_KEY=your-secret-key-minimum-32-characters
        echo ALGORITHM=HS256
        echo ACCESS_TOKEN_EXPIRE_MINUTES=30
        echo REFRESH_TOKEN_EXPIRE_DAYS=7
        echo CORS_ORIGINS=http://localhost:3000
    ) > .env
    echo [OK] Template .env created - please update with your database credentials
)
echo.
echo Initializing database...
python init_db.py
if %errorlevel% neq 0 (
    echo [WARNING] Database initialization may have issues
    echo Check your DATABASE_URL in .env file
) else (
    echo [OK] Database initialized
)
echo.
echo Backend setup complete!
pause
exit /b 0

:setup_frontend
echo.
echo Setting up Frontend...
echo.
cd Frontend
echo Installing Node dependencies...
if exist pnpm (
    pnpm install
) else (
    npm install
)
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.
if not exist .env.local (
    echo Creating .env.local...
    (
        echo NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
        echo NEXT_PUBLIC_API_ENDPOINT=http://localhost:8000/api/v1
        echo NEXT_PUBLIC_JWT_STORAGE_KEY=qcm_study_auth_token
        echo NEXT_PUBLIC_REFRESH_TOKEN_KEY=qcm_study_refresh_token
    ) > .env.local
    echo [OK] .env.local created
)
echo.
echo Frontend setup complete!
pause
exit /b 0
