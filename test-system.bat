@echo off
echo ========================================
echo Testing Velink Sitemap and Update System
echo ========================================
echo.

echo [1/4] Testing sitemap.xml...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://velink.me/sitemap.xml' -UseBasicParsing; Write-Host 'SUCCESS: sitemap.xml returns HTTP' $response.StatusCode; Write-Host 'Content length:' $response.Content.Length 'characters' } catch { Write-Host 'ERROR: sitemap.xml failed -' $_.Exception.Message }"

echo.
echo [2/4] Testing robots.txt...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'https://velink.me/robots.txt' -UseBasicParsing; Write-Host 'SUCCESS: robots.txt returns HTTP' $response.StatusCode; Write-Host 'Content length:' $response.Content.Length 'characters' } catch { Write-Host 'ERROR: robots.txt failed -' $_.Exception.Message }"

echo.
echo [3/4] Checking if Windows update script exists...
if exist "update-windows.bat" (
    echo SUCCESS: Windows update script found
) else (
    echo ERROR: Windows update script not found
)

echo.
echo [4/4] Testing update manager platform detection...
node -e "
const UpdateManager = require('./server/update-manager.js');
const manager = new UpdateManager();
console.log('Platform detected:', process.platform);
console.log('Is Windows:', process.platform === 'win32');
console.log('Update script path:', manager.updateScript);
"

echo.
echo ========================================
echo Test completed!
echo ========================================

pause
