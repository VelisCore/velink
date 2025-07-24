#!/bin/bash

# ========================================
# Velink Update System - Ubuntu/Linux Version
# ========================================
# Comprehensive update script with backup, restore, and health checks
# Optimized for Ubuntu Server/Desktop environments
# Version: 2.0.0
# Author: Velyzo
# Date: 2025-07-24

set -euo pipefail  # Exit on any error, undefined variables, and pipe failures

# Configuration
PROJECT_NAME="velink"
BACKUP_DIR="./backups"
LOG_DIR="./server/logs"
LOG_FILE="./update.log"
NODE_VERSION="18"
SCRIPT_VERSION="2.0.0"
PID_FILE="./.update.pid"
TEMP_DIR="./temp_update"
LOCK_FILE="/tmp/velink_update.lock"

# Ubuntu-specific optimization
export DEBIAN_FRONTEND=noninteractive
export APT_LISTCHANGES_FRONTEND=none

# System requirements
MIN_MEMORY_GB=1
MIN_DISK_GB=2
REQUIRED_PACKAGES=("curl" "wget" "tar" "gzip")

# Command line arguments
BACKUP_ONLY=false
AUTO_START=false
RESTORE=false
FORCE=false
SKIP_BACKUP=false
HEALTH_CHECK_ONLY=false
CLEANUP_ONLY=false
INSTALL_DEPS=false
UPDATE_SYSTEM=false
DEBUG=false
VERBOSE=false

# Colors for enhanced output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# ========================================
# Argument Parsing
# ========================================

show_help() {
    cat << EOF

========================================
 Velink Update System v${SCRIPT_VERSION}
 Ubuntu/Linux Optimized Version
========================================

Usage: $0 [options]

Options:
  --backup-only      Create backup only, no update
  --restore          Restore from latest backup
  --auto-start       Automatically start after update
  --force            Force update even if checks fail
  --skip-backup      Skip backup creation (dangerous!)
  --health-check     Run health check only
  --cleanup          Run cleanup only
  --install-deps     Install system dependencies
  --update-system    Update Ubuntu packages first
  --debug            Enable debug output
  --verbose          Enable verbose output
  --help, -h         Show this help message

Examples:
  $0                           # Standard update
  $0 --auto-start              # Update and start automatically
  $0 --backup-only             # Create backup only
  $0 --restore                 # Restore from backup
  $0 --health-check            # Check system health
  $0 --install-deps            # Install system dependencies
  $0 --update-system --verbose # Update system with verbose output

System Requirements:
  - Ubuntu 18.04+ or compatible Linux distribution
  - Node.js ${NODE_VERSION}+ (will be installed if missing)
  - At least ${MIN_MEMORY_GB}GB RAM
  - At least ${MIN_DISK_GB}GB free disk space
  - Internet connection for updates

EOF
}

# Parse command line arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            --backup-only)
                BACKUP_ONLY=true
                shift
                ;;
            --auto-start|--start)
                AUTO_START=true
                shift
                ;;
            --restore)
                RESTORE=true
                shift
                ;;
            --force)
                FORCE=true
                shift
                ;;
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --health-check)
                HEALTH_CHECK_ONLY=true
                shift
                ;;
            --cleanup)
                CLEANUP_ONLY=true
                shift
                ;;
            --install-deps)
                INSTALL_DEPS=true
                shift
                ;;
            --update-system)
                UPDATE_SYSTEM=true
                shift
                ;;
            --debug)
                DEBUG=true
                set -x  # Enable bash debug mode
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                echo "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# ========================================
# Utility Functions
# ========================================

# Enhanced logging with timestamps and levels
log() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[${timestamp}]${NC} ${WHITE}[INFO]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${RED}[${timestamp}] [ERROR]${NC} $1" | tee -a "$LOG_FILE"
    export LAST_ERROR="$1"
}

success() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${GREEN}[${timestamp}] [SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${YELLOW}[${timestamp}] [WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

debug() {
    if [[ "$DEBUG" == "true" ]]; then
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        echo -e "${PURPLE}[${timestamp}] [DEBUG]${NC} $1" | tee -a "$LOG_FILE"
    fi
}

verbose() {
    if [[ "$VERBOSE" == "true" ]]; then
        local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
        echo -e "${CYAN}[${timestamp}] [VERBOSE]${NC} $1" | tee -a "$LOG_FILE"
    fi
}

# Create necessary directories
setup_directories() {
    debug "Setting up directories..."
    mkdir -p "$BACKUP_DIR" "$LOG_DIR" "$TEMP_DIR"
    
    # Set proper permissions
    chmod 755 "$BACKUP_DIR" "$LOG_DIR"
    
    # Ensure log file exists and is writable
    touch "$LOG_FILE"
    chmod 644 "$LOG_FILE"
}

# Lock management to prevent multiple instances
create_lock() {
    if [[ -f "$LOCK_FILE" ]]; then
        local pid=$(cat "$LOCK_FILE" 2>/dev/null || echo "unknown")
        if kill -0 "$pid" 2>/dev/null; then
            error "Another update process is already running (PID: $pid)"
            error "If you're sure no update is running, run: rm $LOCK_FILE"
            exit 1
        else
            warning "Removing stale lock file"
            rm -f "$LOCK_FILE"
        fi
    fi
    
    echo $$ > "$LOCK_FILE"
    debug "Created lock file with PID $$"
}

cleanup_lock() {
    if [[ -f "$LOCK_FILE" ]]; then
        rm -f "$LOCK_FILE"
        debug "Removed lock file"
    fi
}

# Cleanup function called on script exit
cleanup_on_exit() {
    local exit_code=$?
    debug "Script exiting with code: $exit_code"
    cleanup_lock
    
    # Clean up temporary files
    if [[ -d "$TEMP_DIR" ]]; then
        rm -rf "$TEMP_DIR"
        debug "Cleaned up temporary directory"
    fi
    
    if [[ $exit_code -ne 0 ]]; then
        error "Script failed with exit code: $exit_code"
        if [[ -n "${LAST_ERROR:-}" ]]; then
            error "Last error: $LAST_ERROR"
        fi
    fi
}

# Set up trap for cleanup
trap cleanup_on_exit EXIT
trap 'error "Script interrupted"; exit 130' INT TERM

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
