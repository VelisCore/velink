@echo off
echo Velink Update System - Cross-Platform Entry Point
echo Redirecting to appropriate platform script...

if exist "scripts\update-windows.bat" (
    call scripts\update-windows.bat %*
) else (
    echo ERROR: Windows update script not found at scripts\update-windows.bat
    exit /b 1
)