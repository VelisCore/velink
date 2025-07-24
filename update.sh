#!/bin/bash

# Velink Update Script
# Automated deployment and update system with fallbacks

set -e  # Exit on any error

# Configuration
PROJECT_NAME="velink"
BACKUP_DIR="./backups"
LOG_FILE="./update.log"
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Create backup function
create_backup() {
    log "Creating backup..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Create timestamp for backup
    TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
    BACKUP_NAME="${PROJECT_NAME}_backup_${TIMESTAMP}"
    
    # Create backup
    if [ -d "./server" ] && [ -d "./client" ]; then
        tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
            --exclude=node_modules \
            --exclude=build \
            --exclude=dist \
            --exclude=.git \
            --exclude=logs \
            --exclude="*.log" \
            --exclude="*.db-journal" \
            ./server ./client package.json *.md *.sh *.bat 2>/dev/null || true
        
        success "Backup created: ${BACKUP_NAME}.tar.gz"
        echo "$BACKUP_NAME" > "${BACKUP_DIR}/latest_backup.txt"
    else
        error "Project structure not found. Cannot create backup."
        return 1
    fi
}

# Restore from backup function
restore_backup() {
    if [ ! -f "${BACKUP_DIR}/latest_backup.txt" ]; then
        error "No backup found to restore from"
        return 1
    fi
    
    LATEST_BACKUP=$(cat "${BACKUP_DIR}/latest_backup.txt")
    
    if [ -f "${BACKUP_DIR}/${LATEST_BACKUP}.tar.gz" ]; then
        warning "Restoring from backup: $LATEST_BACKUP"
        tar -xzf "${BACKUP_DIR}/${LATEST_BACKUP}.tar.gz"
        success "Backup restored successfully"
    else
        error "Backup file not found: ${LATEST_BACKUP}.tar.gz"
        return 1
    fi
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
        return 1
    fi
    
    NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_CURRENT" -lt "$NODE_VERSION" ]; then
        warning "Node.js version $NODE_CURRENT detected. Recommended: $NODE_VERSION+"
    else
        success "Node.js version check passed"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        error "npm is not installed"
        return 1
    fi
    
    success "Prerequisites check completed"
}

# Update dependencies
update_dependencies() {
    log "Updating dependencies..."
    
    # Server dependencies
    if [ -d "./server" ]; then
        cd server
        if [ -f "package.json" ]; then
            log "Installing server dependencies..."
            npm ci --production=false || npm install
            cd ..
            success "Server dependencies updated"
        else
            warning "No server package.json found"
            cd ..
        fi
    fi
    
    # Client dependencies
    if [ -d "./client" ]; then
        cd client
        if [ -f "package.json" ]; then
            log "Installing client dependencies..."
            npm ci --production=false || npm install
            cd ..
            success "Client dependencies updated"
        else
            warning "No client package.json found"
            cd ..
        fi
    fi
}

# Build application
build_application() {
    log "Building application..."
    
    # Build client
    if [ -d "./client" ]; then
        cd client
        log "Building React application..."
        if npm run build; then
            success "Client build completed"
        else
            error "Client build failed"
            cd ..
            return 1
        fi
        cd ..
    fi
    
    success "Application build completed"
}

# Database migration/update
update_database() {
    log "Checking database..."
    
    if [ -f "./server/velink.db" ]; then
        # Create database backup
        cp "./server/velink.db" "./server/velink.db.backup.$(date '+%Y%m%d_%H%M%S')"
        success "Database backup created"
    fi
    
    # Run any database migrations here
    # This would be where you'd run database update scripts
    
    success "Database check completed"
}

# Health check
health_check() {
    log "Performing health check..."
    
    # Check if server files exist
    if [ ! -f "./server/index.js" ]; then
        error "Server entry point not found"
        return 1
    fi
    
    # Check if client build exists
    if [ ! -d "./client/build" ]; then
        warning "Client build directory not found"
    fi
    
    # Check environment file
    if [ ! -f "./server/.env" ]; then
        warning "Environment file not found - using defaults"
    fi
    
    success "Health check completed"
}

# Cleanup old files
cleanup() {
    log "Cleaning up..."
    
    # Remove old logs (keep last 7 days)
    find ./server/logs -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
    
    # Remove old backups (keep last 10)
    if [ -d "$BACKUP_DIR" ]; then
        ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    fi
    
    success "Cleanup completed"
}

# Main update function
main_update() {
    log "Starting Velink update process..."
    
    # Stop any running processes
    log "Stopping running processes..."
    pkill -f "node.*index.js" 2>/dev/null || true
    pkill -f "npm.*dev" 2>/dev/null || true
    sleep 2
    
    # Run update steps
    if check_prerequisites && \
       create_backup && \
       update_dependencies && \
       build_application && \
       update_database && \
       health_check; then
        
        cleanup
        success "Update completed successfully!"
        log "You can now start the application with: npm run dev"
        
        # Optionally auto-start
        if [ "$1" = "--start" ]; then
            log "Auto-starting application..."
            npm run dev &
            sleep 5
            log "Application started in background"
        fi
        
    else
        error "Update failed! Attempting to restore from backup..."
        restore_backup
        error "Update process failed. Please check the logs."
        exit 1
    fi
}

# Handle script arguments
case "$1" in
    --backup-only)
        create_backup
        ;;
    --restore)
        restore_backup
        ;;
    --health-check)
        health_check
        ;;
    --cleanup)
        cleanup
        ;;
    *)
        main_update "$1"
        ;;
esac
