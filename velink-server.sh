#!/bin/bash

# VeLink Ubuntu Server Startup and Management Script
# This script handles all server operations including updates

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Fix the dev server configuration issue first
fix_dev_server() {
    log "Fixing dev server configuration..."
    
    if [[ ! -f "$PROJECT_DIR/client/.env" ]]; then
        cat > "$PROJECT_DIR/client/.env" <<EOF
DANGEROUSLY_DISABLE_HOST_CHECK=true
WATCHPACK_POLLING=true
WDS_SOCKET_HOST=0.0.0.0
WDS_SOCKET_PORT=0
EOF
        log "Created client/.env with proper dev server configuration"
    fi
}

# Make update script executable
setup_permissions() {
    log "Setting up permissions..."
    
    if [[ -f "$PROJECT_DIR/update-ubuntu.sh" ]]; then
        chmod +x "$PROJECT_DIR/update-ubuntu.sh"
        log "Made update-ubuntu.sh executable"
    fi
    
    if [[ -f "$PROJECT_DIR/start-production.sh" ]]; then
        chmod +x "$PROJECT_DIR/start-production.sh"
        log "Made start-production.sh executable"
    fi
}

# Install dependencies if needed
install_dependencies() {
    log "Checking and installing dependencies..."
    
    cd "$PROJECT_DIR"
    
    # Root dependencies
    if [[ -f "package.json" ]] && [[ ! -d "node_modules" ]]; then
        log "Installing root dependencies..."
        npm install
    fi
    
    # Server dependencies
    if [[ -f "server/package.json" ]]; then
        cd server
        if [[ ! -d "node_modules" ]]; then
            log "Installing server dependencies..."
            npm install
        fi
        cd ..
    fi
    
    # Client dependencies and build
    if [[ -f "client/package.json" ]]; then
        cd client
        if [[ ! -d "node_modules" ]]; then
            log "Installing client dependencies..."
            npm install
        fi
        
        if [[ ! -d "build" ]]; then
            log "Building client application..."
            npm run build
        fi
        cd ..
    fi
}

# Start the development servers
start_dev() {
    log "Starting development servers..."
    
    fix_dev_server
    install_dependencies
    
    # Start both client and server in parallel
    cd "$PROJECT_DIR"
    npm run dev
}

# Start production server
start_production() {
    log "Starting production server..."
    
    setup_permissions
    install_dependencies
    
    # Build client for production
    cd "$PROJECT_DIR/client"
    npm run build
    
    # Start server
    cd "$PROJECT_DIR"
    NODE_ENV=production npm start
}

# Check system health
health_check() {
    log "Performing system health check..."
    
    # Check if server is running
    if curl -s http://localhost:80/api/stats >/dev/null 2>&1; then
        log "✅ Server is running and responding"
    else
        warn "❌ Server is not responding on port 80"
    fi
    
    # Check disk space
    local disk_usage=$(df "$PROJECT_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $disk_usage -lt 90 ]]; then
        log "✅ Disk space OK ($disk_usage% used)"
    else
        warn "❌ Disk space critical ($disk_usage% used)"
    fi
    
    # Check memory
    local mem_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [[ $mem_usage -lt 90 ]]; then
        log "✅ Memory usage OK ($mem_usage% used)"
    else
        warn "❌ Memory usage high ($mem_usage% used)"
    fi
    
    # Check if git is clean
    cd "$PROJECT_DIR"
    if git diff-index --quiet HEAD --; then
        log "✅ Git repository is clean"
    else
        warn "❌ Git repository has uncommitted changes"
    fi
}

# Quick update function
quick_update() {
    log "Performing quick update..."
    
    if [[ ! -f "$PROJECT_DIR/update-ubuntu.sh" ]]; then
        error "update-ubuntu.sh not found. Please create the update script first."
        return 1
    fi
    
    # Make it executable
    chmod +x "$PROJECT_DIR/update-ubuntu.sh"
    
    # Run update
    "$PROJECT_DIR/update-ubuntu.sh" --verbose
}

# Show usage
show_help() {
    cat << EOF
VeLink Ubuntu Server Management Script

USAGE:
    $0 <command>

COMMANDS:
    dev             Start development servers (client + server)
    production      Start production server
    health          Check system health
    update          Perform system update
    fix-dev         Fix development server configuration
    setup           Setup permissions and dependencies
    help            Show this help message

EXAMPLES:
    $0 dev          # Start development mode
    $0 production   # Start production mode
    $0 health       # Check system status
    $0 update       # Update the system

EOF
}

# Main command handler
main() {
    case "${1:-help}" in
        "dev"|"development")
            start_dev
            ;;
        "prod"|"production")
            start_production
            ;;
        "health"|"status")
            health_check
            ;;
        "update")
            quick_update
            ;;
        "fix-dev")
            fix_dev_server
            ;;
        "setup")
            setup_permissions
            install_dependencies
            ;;
        "help"|"--help"|"-h")
            show_help
            ;;
        *)
            error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

main "$@"
