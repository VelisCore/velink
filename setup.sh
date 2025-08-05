#!/bin/bash

# ===================================================================
# Velink Cross-Platform Setup Script
# ===================================================================

set -e

echo "========================================"
echo "Velink Cross-Platform Setup"
echo "========================================"
echo

# Detect platform
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    PLATFORM="Linux"
    NPM_CMD="npm"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    PLATFORM="macOS"
    NPM_CMD="npm"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    PLATFORM="Windows"
    NPM_CMD="npm.cmd"
else
    PLATFORM="Unknown"
    NPM_CMD="npm"
fi

echo "Platform detected: $PLATFORM"
echo

cd "$(dirname "$0")"

echo "[1/6] Setting up project structure..."
mkdir -p ssl server/logs backups

echo "[2/6] Copying environment templates..."
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
    cp ".env.example" ".env"
    echo "Environment file created from template"
fi

if [ ! -f "server/.env" ] && [ -f "server/.env.example" ]; then
    cp "server/.env.example" "server/.env"
    echo "Server environment file created from template"
fi

if [ ! -f "client/.env" ]; then
    cat > client/.env << EOF
DANGEROUSLY_DISABLE_HOST_CHECK=true
WATCHPACK_POLLING=true
WDS_SOCKET_HOST=0.0.0.0
WDS_SOCKET_PORT=0
EOF
    echo "Client development environment created"
fi

echo "[3/6] Installing root dependencies..."
$NPM_CMD install --no-audit --no-fund

echo "[4/6] Installing server dependencies..."
cd server
$NPM_CMD install --no-audit --no-fund
cd ..

echo "[5/6] Installing client dependencies..."
cd client
$NPM_CMD install --no-audit --no-fund
cd ..

echo "[6/6] Building client..."
cd client
$NPM_CMD run build
cd ..

echo
echo "========================================"
echo "Velink setup completed successfully!"
echo "========================================"
echo
echo "Quick start:"
echo "  npm run dev     - Start development server"
echo "  npm run server  - Start production server"
echo "  npm run client  - Start client only"
echo
echo "Admin panel: http://localhost/admin"
echo "API docs: http://localhost/api-docs"
echo "========================================"
