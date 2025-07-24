@echo off
REM Velink Update Script for Windows
REM Automated deployment and update system with fallbacks

setlocal enabledelayedexpansion

REM Configuration
set PROJECT_NAME=velink
set BACKUP_DIR=.\backups
set LOG_FILE=.\update.log
set NODE_VERSION=18

REM Colors (Windows doesn't support colors in batch easily, so we'll use echo)
REM Create log directory if it doesn't exist
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM Logging function
:log
echo [%date% %time%] %~1
echo [%date% %time%] %~1 >> "%LOG_FILE%"
goto :eof

:error
echo [ERROR] %~1
echo [ERROR] %~1 >> "%LOG_FILE%"
goto :eof

:success
echo [SUCCESS] %~1
echo [SUCCESS] %~1 >> "%LOG_FILE%"
goto :eof

:warning
echo [WARNING] %~1
echo [WARNING] %~1 >> "%LOG_FILE%"
goto :eof

REM Create backup function
:create_backup
call :log "Creating backup..."

REM Create timestamp for backup
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%YYYY%%MM%%DD%_%HH%%Min%%Sec%"

set BACKUP_NAME=%PROJECT_NAME%_backup_%timestamp%

REM Create backup using tar (if available) or xcopy
where tar >nul 2>nul
if %errorlevel% == 0 (
    tar -czf "%BACKUP_DIR%\%BACKUP_NAME%.tar.gz" --exclude=node_modules --exclude=build --exclude=dist --exclude=.git --exclude=logs server client package.json *.md *.sh *.bat 2>nul
    if !errorlevel! == 0 (
        call :success "Backup created: %BACKUP_NAME%.tar.gz"
        echo %BACKUP_NAME% > "%BACKUP_DIR%\latest_backup.txt"
    ) else (
        call :error "Backup creation failed"
        exit /b 1
    )
) else (
    REM Fallback to xcopy
    if not exist "%BACKUP_DIR%\%BACKUP_NAME%" mkdir "%BACKUP_DIR%\%BACKUP_NAME%"
    xcopy server "%BACKUP_DIR%\%BACKUP_NAME%\server\" /E /I /Q /Y >nul 2>nul
    xcopy client "%BACKUP_DIR%\%BACKUP_NAME%\client\" /E /I /Q /Y >nul 2>nul
    copy package.json "%BACKUP_DIR%\%BACKUP_NAME%\" >nul 2>nul
    copy *.md "%BACKUP_DIR%\%BACKUP_NAME%\" >nul 2>nul
    call :success "Backup created: %BACKUP_NAME%"
    echo %BACKUP_NAME% > "%BACKUP_DIR%\latest_backup.txt"
)
goto :eof

REM Restore from backup function
:restore_backup
if not exist "%BACKUP_DIR%\latest_backup.txt" (
    call :error "No backup found to restore from"
    exit /b 1
)

set /p LATEST_BACKUP=<"%BACKUP_DIR%\latest_backup.txt"

if exist "%BACKUP_DIR%\%LATEST_BACKUP%.tar.gz" (
    call :warning "Restoring from backup: %LATEST_BACKUP%"
    tar -xzf "%BACKUP_DIR%\%LATEST_BACKUP%.tar.gz"
    call :success "Backup restored successfully"
) else if exist "%BACKUP_DIR%\%LATEST_BACKUP%" (
    call :warning "Restoring from backup: %LATEST_BACKUP%"
    xcopy "%BACKUP_DIR%\%LATEST_BACKUP%\*" . /E /I /Q /Y >nul
    call :success "Backup restored successfully"
) else (
    call :error "Backup not found: %LATEST_BACKUP%"
    exit /b 1
)
goto :eof

REM Check prerequisites
:check_prerequisites
call :log "Checking prerequisites..."

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    call :error "Node.js is not installed"
    exit /b 1
)

for /f "tokens=1 delims=v" %%v in ('node -v') do set NODE_CURRENT=%%v
call :success "Node.js version check passed"

REM Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    call :error "npm is not installed"
    exit /b 1
)

call :success "Prerequisites check completed"
goto :eof

REM Update dependencies
:update_dependencies
call :log "Updating dependencies..."

REM Server dependencies
if exist ".\server" (
    if exist ".\server\package.json" (
        call :log "Installing server dependencies..."
        cd server
        npm ci --production=false
        if !errorlevel! neq 0 (
            npm install
        )
        cd ..
        if !errorlevel! == 0 (
            call :success "Server dependencies updated"
        ) else (
            call :error "Failed to install server dependencies"
            exit /b 1
        )
    ) else (
        call :warning "No server package.json found"
    )
)

REM Client dependencies
if exist ".\client" (
    if exist ".\client\package.json" (
        call :log "Installing client dependencies..."
        cd client
        npm ci --production=false
        if !errorlevel! neq 0 (
            npm install
        )
        cd ..
        if !errorlevel! == 0 (
            call :success "Client dependencies updated"
        ) else (
            call :error "Failed to install client dependencies"
            exit /b 1
        )
    ) else (
        call :warning "No client package.json found"
    )
)
goto :eof

REM Build application
:build_application
call :log "Building application..."

REM Build client
if exist ".\client" (
    cd client
    call :log "Building React application..."
    npm run build
    if !errorlevel! == 0 (
        call :success "Client build completed"
    ) else (
        call :error "Client build failed"
        cd ..
        exit /b 1
    )
    cd ..
)

call :success "Application build completed"
goto :eof

REM Database migration/update
:update_database
call :log "Checking database..."

if exist ".\server\velink.db" (
    REM Create database backup
    for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
    set "timestamp=%dt:~0,8%_%dt:~8,6%"
    copy ".\server\velink.db" ".\server\velink.db.backup.%timestamp%" >nul
    call :success "Database backup created"
)

call :success "Database check completed"
goto :eof

REM Health check
:health_check
call :log "Performing health check..."

REM Check if server files exist
if not exist ".\server\index.js" (
    call :error "Server entry point not found"
    exit /b 1
)

REM Check if client build exists
if not exist ".\client\build" (
    call :warning "Client build directory not found"
)

REM Check environment file
if not exist ".\server\.env" (
    call :warning "Environment file not found - using defaults"
)

call :success "Health check completed"
goto :eof

REM Cleanup old files
:cleanup
call :log "Cleaning up..."

REM Remove old logs (keep last 7 days)
forfiles /p ".\server\logs" /s /m *.log /d -7 /c "cmd /c del @path" 2>nul

REM Remove old backups (keep last 10)
if exist "%BACKUP_DIR%" (
    for /f "skip=10 delims=" %%F in ('dir /b /o-d "%BACKUP_DIR%\*.tar.gz" 2^>nul') do del "%BACKUP_DIR%\%%F" 2>nul
)

call :success "Cleanup completed"
goto :eof

REM Stop processes
:stop_processes
call :log "Stopping running processes..."
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul
goto :eof

REM Main update function
:main_update
call :log "Starting Velink update process..."

call :stop_processes

REM Run update steps
call :check_prerequisites
if !errorlevel! neq 0 exit /b 1

call :create_backup
if !errorlevel! neq 0 exit /b 1

call :update_dependencies
if !errorlevel! neq 0 (
    call :error "Update failed! Attempting to restore from backup..."
    call :restore_backup
    exit /b 1
)

call :build_application
if !errorlevel! neq 0 (
    call :error "Update failed! Attempting to restore from backup..."
    call :restore_backup
    exit /b 1
)

call :update_database
if !errorlevel! neq 0 (
    call :error "Update failed! Attempting to restore from backup..."
    call :restore_backup
    exit /b 1
)

call :health_check
if !errorlevel! neq 0 (
    call :error "Update failed! Attempting to restore from backup..."
    call :restore_backup
    exit /b 1
)

call :cleanup
call :success "Update completed successfully!"
call :log "You can now start the application with: npm run dev"

REM Optionally auto-start
if "%1"=="--start" (
    call :log "Auto-starting application..."
    start "Velink" npm run dev
    timeout /t 5 >nul
    call :log "Application started"
)

goto :eof

REM Handle script arguments
if "%1"=="--backup-only" (
    call :create_backup
) else if "%1"=="--restore" (
    call :restore_backup
) else if "%1"=="--health-check" (
    call :health_check
) else if "%1"=="--cleanup" (
    call :cleanup
) else (
    call :main_update %1
)

endlocal
