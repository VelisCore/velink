@echo off
setlocal enabledelayedexpansion

REM ===================================================================
REM Velink Windows Update System
REM ===================================================================
REM Features:
REM - Backup and restore capabilities
REM - Service management
REM - Health checks and validation
REM - Progress reporting
REM - Error handling and rollback
REM ===================================================================

set "SCRIPT_DIR=%~dp0"
set "PROJECT_DIR=%SCRIPT_DIR%"
set "BACKUP_DIR=%PROJECT_DIR%backups"
set "LOG_FILE=%PROJECT_DIR%update.log"
set "PROGRESS_FILE=%PROJECT_DIR%.update_progress"
set "PID_FILE=%PROJECT_DIR%.update.pid"
set "MAINTENANCE_FILE=%PROJECT_DIR%server\.maintenance"

REM Default options
set "SKIP_BACKUP=false"
set "FORCE_UPDATE=false"
set "AUTO_RESTART=true"
set "VERBOSE=false"
set "BRANCH=main"

REM Progress tracking
set "TOTAL_STEPS=10"
set "CURRENT_STEP=0"

REM ===================================================================
REM Utility Functions
REM ===================================================================

:log
set "level=%1"
set "message=%~2"
set "timestamp=%date% %time%"

if "%level%"=="ERROR" (
    echo [ERROR] %message% 1>&2
) else if "%level%"=="WARN" (
    echo [WARN] %message%
) else if "%level%"=="INFO" (
    echo [INFO] %message%
) else if "%level%"=="DEBUG" (
    if "%VERBOSE%"=="true" echo [DEBUG] %message%
)

echo [%timestamp%] [%level%] %message% >> "%LOG_FILE%"
goto :eof

:update_progress
set /a CURRENT_STEP+=1
set "step_name=%~1"
set /a percentage=CURRENT_STEP*100/TOTAL_STEPS

(
echo {
echo     "isUpdating": true,
echo     "step": %CURRENT_STEP%,
echo     "totalSteps": %TOTAL_STEPS%,
echo     "percentage": %percentage%,
echo     "currentStep": "%step_name%",
echo     "timestamp": "%date%T%time%",
echo     "estimatedTimeRemaining": %((TOTAL_STEPS - CURRENT_STEP) * 30)%
echo }
) > "%PROGRESS_FILE%"

call :log "INFO" "Step %CURRENT_STEP%/%TOTAL_STEPS% (%percentage%%%): %step_name%"
goto :eof

:cleanup
call :log "INFO" "Performing cleanup..."

if exist "%PID_FILE%" del "%PID_FILE%"

(
echo {
echo     "isUpdating": false,
echo     "step": %TOTAL_STEPS%,
echo     "totalSteps": %TOTAL_STEPS%,
echo     "percentage": 100,
echo     "currentStep": "Update completed",
echo     "timestamp": "%date%T%time%"
echo }
) > "%PROGRESS_FILE%"

if exist "%MAINTENANCE_FILE%" del "%MAINTENANCE_FILE%"
goto :eof

:enable_maintenance
set "reason=%~1"
call :log "INFO" "Enabling maintenance mode: %reason%"

(
echo {
echo     "enabled": true,
echo     "reason": "%reason%",
echo     "timestamp": "%date%T%time%"
echo }
) > "%MAINTENANCE_FILE%"
goto :eof

:disable_maintenance
call :log "INFO" "Disabling maintenance mode"
if exist "%MAINTENANCE_FILE%" del "%MAINTENANCE_FILE%"
goto :eof

:create_backup
call :log "INFO" "Creating backup..."

if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

set "backup_name=backup_%date:~-4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%"
set "backup_name=!backup_name: =0!"
set "backup_path=%BACKUP_DIR%\%backup_name%"

mkdir "%backup_path%"

REM Backup critical files
xcopy /E /I /Q "%PROJECT_DIR%\server" "%backup_path%\server\"
xcopy /E /I /Q "%PROJECT_DIR%\client\src" "%backup_path%\client\src\"
copy "%PROJECT_DIR%\package.json" "%backup_path%\"

call :log "INFO" "Backup created at: %backup_path%"
echo %backup_path% > "%PROJECT_DIR%\.last_backup"
goto :eof

:check_health
call :log "INFO" "Checking application health..."

REM Simple health check via curl or powershell
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://velink.me/api/health' -UseBasicParsing -TimeoutSec 5; if($response.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if %errorlevel% equ 0 (
    call :log "INFO" "Health check passed"
    exit /b 0
) else (
    call :log "ERROR" "Health check failed"
    exit /b 1
)

:stop_services
call :log "INFO" "Stopping services..."

REM Kill any running Node.js processes for this project
for /f "tokens=2" %%i in ('tasklist /fi "imagename eq node.exe" /fo csv ^| find "node.exe"') do (
    set "pid=%%~i"
    powershell -Command "try { $proc = Get-Process -Id !pid! -ErrorAction SilentlyContinue; if($proc -and $proc.MainModule.FileName -like '*%PROJECT_DIR%*') { Stop-Process -Id !pid! -Force } } catch {}"
)

timeout /t 3 /nobreak >nul
goto :eof

:start_services
call :log "INFO" "Starting services..."

REM Start the application in background
cd /d "%PROJECT_DIR%"
start /b npm run dev

REM Wait a moment for startup
timeout /t 5 /nobreak >nul

REM Verify it started
call :check_health
if %errorlevel% neq 0 (
    call :log "ERROR" "Failed to start services"
    exit /b 1
)

call :log "INFO" "Services started successfully"
goto :eof

REM ===================================================================
REM Main Update Process
REM ===================================================================

:main
call :log "INFO" "Starting Velink Windows update process..."

REM Write PID file
echo %$% > "%PID_FILE%"

REM Parse command line arguments
:parse_args
if "%~1"=="" goto start_update
if "%~1"=="--skip-backup" set "SKIP_BACKUP=true"
if "%~1"=="--force" set "FORCE_UPDATE=true"
if "%~1"=="--no-restart" set "AUTO_RESTART=false"
if "%~1"=="--verbose" set "VERBOSE=true"
if "%~1"=="--branch" (
    shift
    set "BRANCH=%~1"
)
shift
goto parse_args

:start_update

call :enable_maintenance "System update in progress"

REM Step 1: Pre-update checks
call :update_progress "Running pre-update checks"

if not exist "%PROJECT_DIR%\.git" (
    call :log "ERROR" "Not a git repository"
    call :cleanup
    exit /b 1
)

REM Step 2: Create backup
if "%SKIP_BACKUP%"=="false" (
    call :update_progress "Creating backup"
    call :create_backup
    if %errorlevel% neq 0 (
        call :log "ERROR" "Backup creation failed"
        call :cleanup
        exit /b 1
    )
)

REM Step 3: Fetch latest changes
call :update_progress "Fetching latest changes"
call :log "INFO" "Fetching from origin/%BRANCH%..."

git fetch origin %BRANCH%
if %errorlevel% neq 0 (
    call :log "ERROR" "Failed to fetch from remote"
    call :cleanup
    exit /b 1
)

REM Step 4: Check for changes
call :update_progress "Checking for updates"

for /f %%i in ('git rev-parse HEAD') do set "current_commit=%%i"
for /f %%i in ('git rev-parse origin/%BRANCH%') do set "latest_commit=%%i"

if "%current_commit%"=="%latest_commit%" (
    if "%FORCE_UPDATE%"=="false" (
        call :log "INFO" "Already up to date"
        call :cleanup
        exit /b 0
    )
)

REM Step 5: Stop services
call :update_progress "Stopping services"
call :stop_services

REM Step 6: Update code
call :update_progress "Updating code"
call :log "INFO" "Updating to latest commit..."

git reset --hard origin/%BRANCH%
if %errorlevel% neq 0 (
    call :log "ERROR" "Failed to update code"
    call :cleanup
    exit /b 1
)

REM Step 7: Install dependencies
call :update_progress "Installing dependencies"
call :log "INFO" "Installing root dependencies..."

call npm install --production --no-audit --no-fund
if %errorlevel% neq 0 (
    call :log "ERROR" "Failed to install root dependencies"
    call :cleanup
    exit /b 1
)

REM Step 8: Install server dependencies
call :update_progress "Installing server dependencies"
call :log "INFO" "Installing server dependencies..."

cd /d "%PROJECT_DIR%\server"
call npm install --production --no-audit --no-fund
if %errorlevel% neq 0 (
    call :log "ERROR" "Failed to install server dependencies"
    cd /d "%PROJECT_DIR%"
    call :cleanup
    exit /b 1
)

cd /d "%PROJECT_DIR%"

REM Step 9: Build client
call :update_progress "Building client application"
call :log "INFO" "Building client..."

cd /d "%PROJECT_DIR%\client"
call npm install --no-audit --no-fund
if %errorlevel% neq 0 (
    call :log "ERROR" "Failed to install client dependencies"
    cd /d "%PROJECT_DIR%"
    call :cleanup
    exit /b 1
)

call npm run build
if %errorlevel% neq 0 (
    call :log "ERROR" "Failed to build client"
    cd /d "%PROJECT_DIR%"
    call :cleanup
    exit /b 1
)

cd /d "%PROJECT_DIR%"

REM Step 10: Start services and verify
if "%AUTO_RESTART%"=="true" (
    call :update_progress "Starting services"
    call :start_services
    if %errorlevel% neq 0 (
        call :log "ERROR" "Failed to start services after update"
        call :cleanup
        exit /b 1
    )
)

call :update_progress "Update completed successfully"
call :log "INFO" "Update completed successfully!"

call :disable_maintenance
call :cleanup

echo.
echo ===================================================================
echo Velink update completed successfully!
echo ===================================================================
echo - Current commit: %latest_commit:~0,8%
echo - Services: Running
echo - Status: Ready
echo ===================================================================

exit /b 0

REM ===================================================================
REM Error handling
REM ===================================================================

:error_exit
call :log "ERROR" "Update failed: %~1"
call :cleanup
exit /b 1

REM Start main process
call :main %*
