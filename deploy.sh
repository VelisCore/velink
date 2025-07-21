# VeLink Deployment

# Build client
echo "Building React client..."
cd client
npm ci
npm run build
cd ..

# Copy client build to server public directory
echo "Copying client build to server..."
mkdir -p server/public
cp -r client/build/* server/public/

# Install server dependencies
echo "Installing server dependencies..."
cd server
npm ci --only=production

echo "Deployment preparation complete!"
echo "Ready for DigitalOcean App Platform deployment"
