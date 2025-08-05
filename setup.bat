@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Velink Cross-Platform Setup
echo ========================================
echo.

echo Detecting platform...
echo Platform: Windows
echo.

echo [1/6] Setting up project structure...
if not exist "ssl" mkdir ssl
if not exist "server\logs" mkdir server\logs
if not exist "backups" mkdir backups

echo [2/6] Copying environment templates...
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo Environment file created from template
    ) else (
        echo Warning: No .env.example found
    )
)

if not exist "server\.env" (
    if exist "server\.env.example" (
        copy "server\.env.example" "server\.env"
        echo Server environment file created from template
    )
)

if not exist "client\.env" (
    echo DANGEROUSLY_DISABLE_HOST_CHECK=true > client\.env
    echo WATCHPACK_POLLING=true >> client\.env
    echo WDS_SOCKET_HOST=0.0.0.0 >> client\.env
    echo WDS_SOCKET_PORT=0 >> client\.env
    echo Client development environment created
)

echo [3/6] Installing root dependencies...
call npm install --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ERROR: Failed to install root dependencies
    exit /b 1
)

echo [4/6] Installing server dependencies...
cd server
call npm install --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ERROR: Failed to install server dependencies
    exit /b 1
)
cd ..

echo [5/6] Installing client dependencies...
cd client
call npm install --no-audit --no-fund
if %errorlevel% neq 0 (
    echo ERROR: Failed to install client dependencies
    exit /b 1
)
cd ..

echo [6/6] Building client...
cd client
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Failed to build client
    exit /b 1
)
cd ..

echo.
echo ========================================
echo Velink setup completed successfully!
echo ========================================
echo.
echo Quick start:
echo   npm run dev     - Start development server
echo   npm run server  - Start production server
echo   npm run client  - Start client only
echo.
echo Admin panel: https://velink.me/admin
echo API docs: https://velink.me/api-docs
echo ========================================

pause
