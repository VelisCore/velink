@echo off
echo Fixing Velink for Windows development...

cd /d "%~dp0"

echo Fixing client dev server configuration...
if not exist "client\.env" (
    echo DANGEROUSLY_DISABLE_HOST_CHECK=true > client\.env
    echo WATCHPACK_POLLING=true >> client\.env
    echo WDS_SOCKET_HOST=0.0.0.0 >> client\.env
    echo WDS_SOCKET_PORT=0 >> client\.env
    echo Client .env created
)

echo Installing dependencies...
call npm install --no-audit --no-fund

cd server
call npm install --no-audit --no-fund
cd ..

cd client
call npm install --no-audit --no-fund
cd ..

echo Testing server syntax...
node -c server\index.js
if %errorlevel% neq 0 (
    echo Server has syntax issues, restoring from backup...
    if exist "server\index.js.backup" (
        copy "server\index.js.backup" "server\index.js"
        echo Server restored from backup
    )
)

echo Velink Windows fix completed!
echo You can now run: npm run dev

pause
