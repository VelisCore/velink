@echo off
echo Building React client...
cd client
call npm ci
call npm run build
cd ..

echo Creating database directory...
if not exist "data" mkdir "data"

echo Copying client build to server...
if not exist "server\public" mkdir "server\public"
xcopy "client\build\*" "server\public\" /E /Y

echo Installing server dependencies...
cd server
call npm ci --only=production
cd ..

echo Creating necessary environment files...
echo DB_PATH=../data > server/.env
echo NODE_ENV=production >> server/.env

echo Deployment preparation complete!
echo Ready for DigitalOcean App Platform or Heroku deployment
pause
