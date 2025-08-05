#!/bin/bash

# ===================================================================
# Velink Cross-Platform Fix Script
# Fixes common development issues and ensures proper setup
# ===================================================================

set -e

echo "========================================="
echo "Fixing Velink for development..."
echo "========================================="

# Detect platform
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    PLATFORM="windows"
    NPM_CMD="npm.cmd"
else
    PLATFORM="unix"
    NPM_CMD="npm"
fi

echo "Platform detected: $PLATFORM"

# Navigate to project directory
cd "$(dirname "$0")/.."

echo "Fixing client development server configuration..."
if [ ! -f "client/.env" ]; then
    cat > client/.env << EOF
DANGEROUSLY_DISABLE_HOST_CHECK=true
WATCHPACK_POLLING=true
WDS_SOCKET_HOST=0.0.0.0
WDS_SOCKET_PORT=0
EOF
    echo "Client .env created"
else
    echo "Client .env already exists"
fi

echo "Installing root dependencies..."
$NPM_CMD install --no-audit --no-fund

echo "Installing server dependencies..."
cd server
$NPM_CMD install --no-audit --no-fund
cd ..

echo "Installing client dependencies..."
cd client
$NPM_CMD install --no-audit --no-fund
cd ..

echo "Testing server syntax..."
node -c server/index.js
if [ $? -ne 0 ]; then
    echo "Server has syntax issues!"
    exit 1
fi

echo "Building client..."
cd client
$NPM_CMD run build
cd ..

echo "========================================="
echo "Velink fix completed successfully!"
echo "You can now run: npm run dev"
echo "========================================="
