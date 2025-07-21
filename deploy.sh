# VeLink Deployment

# Build client
echo "Building React client..."
cd client
npm ci
npm run build
cd ..

# Create data directory for persistent storage
echo "Creating database directory..."
mkdir -p data

# Copy client build to server public directory
echo "Copying client build to server..."
mkdir -p server/public
cp -r client/build/* server/public/

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm ci --only=production
cd ..

# Create environment file
echo "Creating necessary environment files..."
echo "DB_PATH=../data" > server/.env
echo "NODE_ENV=production" >> server/.env

echo "Deployment preparation complete!"
echo "Ready for DigitalOcean App Platform or Heroku deployment"
