@echo off
echo Building React client...
cd client
call npm ci
call npm run build
cd ..

echo Copying client build to server...
if not exist "server\public" mkdir "server\public"
xcopy "client\build\*" "server\public\" /E /Y

echo Installing server dependencies...
cd server
call npm ci --only=production

echo Deployment preparation complete!
echo Ready for DigitalOcean App Platform deployment
pause
