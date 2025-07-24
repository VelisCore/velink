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
ADMIN_LOG_FILE="./admin-update.log"
NODE_VERSION="18"
SCRIPT_VERSION="2.0.0"
PID_FILE="./.update.pid"
TEMP_DIR="./temp_update"
LOCK_FILE="/tmp/velink_update.lock"

# Admin panel integration
ADMIN_UPDATE="${ADMIN_UPDATE:-false}"
UPDATE_SOURCE="${UPDATE_SOURCE:-manual}"
API_PORT="${PORT:-3000}"

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
    local message="$1"
    echo -e "${BLUE}[${timestamp}]${NC} ${WHITE}[INFO]${NC} $message" | tee -a "$LOG_FILE"
    
    # Also log to admin log if this is an admin-initiated update
    if [[ "$ADMIN_UPDATE" == "true" ]]; then
        echo "[${timestamp}] [INFO] $message" >> "$ADMIN_LOG_FILE"
    fi
}

error() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local message="$1"
    echo -e "${RED}[${timestamp}] [ERROR]${NC} $message" | tee -a "$LOG_FILE"
    export LAST_ERROR="$message"
    
    # Also log to admin log if this is an admin-initiated update
    if [[ "$ADMIN_UPDATE" == "true" ]]; then
        echo "[${timestamp}] [ERROR] $message" >> "$ADMIN_LOG_FILE"
    fi
}

success() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local message="$1"
    echo -e "${GREEN}[${timestamp}] [SUCCESS]${NC} $message" | tee -a "$LOG_FILE"
    
    # Also log to admin log if this is an admin-initiated update
    if [[ "$ADMIN_UPDATE" == "true" ]]; then
        echo "[${timestamp}] [SUCCESS] $message" >> "$ADMIN_LOG_FILE"
    fi
}

warning() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local message="$1"
    echo -e "${YELLOW}[${timestamp}] [WARNING]${NC} $message" | tee -a "$LOG_FILE"
    
    # Also log to admin log if this is an admin-initiated update
    if [[ "$ADMIN_UPDATE" == "true" ]]; then
        echo "[${timestamp}] [WARNING] $message" >> "$ADMIN_LOG_FILE"
    fi
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

# ========================================
# Backup and Restore Functions
# ========================================

# Enhanced backup creation with multiple formats
create_backup() {
    if [[ "$SKIP_BACKUP" == "true" ]]; then
        warning "Skipping backup creation (--skip-backup flag used)"
        return 0
    fi
    
    log "Creating comprehensive backup..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Create timestamp for backup
    local timestamp=$(date '+%Y%m%d_%H%M%S')
    local backup_name="${PROJECT_NAME}_backup_${timestamp}"
    local backup_path="${BACKUP_DIR}/${backup_name}"
    
    debug "Creating backup: $backup_name"
    
    # Verify source directories exist
    if [[ ! -d "./server" ]] || [[ ! -d "./client" ]]; then
        error "Project structure not found. Cannot create backup."
        return 1
    fi
    
    # Create compressed backup with optimized compression
    verbose "Creating compressed archive..."
    if tar -czf "${backup_path}.tar.gz" \
        --exclude=node_modules \
        --exclude=build \
        --exclude=dist \
        --exclude=.git \
        --exclude=logs \
        --exclude="*.log" \
        --exclude="*.db-journal" \
        --exclude="*.tmp" \
        --exclude=".cache" \
        --exclude="coverage" \
        --exclude=".nyc_output" \
        ./server ./client package.json *.md *.sh *.bat 2>/dev/null; then
        
        local backup_size=$(du -h "${backup_path}.tar.gz" | cut -f1)
        success "Compressed backup created: ${backup_name}.tar.gz (${backup_size})"
        
        # Save backup info
        echo "$backup_name" > "${BACKUP_DIR}/latest_backup.txt"
        echo "$(date '+%Y-%m-%d %H:%M:%S')" > "${BACKUP_DIR}/${backup_name}.info"
        echo "Size: $backup_size" >> "${BACKUP_DIR}/${backup_name}.info"
        echo "Type: tar.gz" >> "${BACKUP_DIR}/${backup_name}.info"
        
        # Verify backup integrity
        if tar -tzf "${backup_path}.tar.gz" >/dev/null 2>&1; then
            success "Backup integrity verified"
        else
            error "Backup integrity check failed"
            return 1
        fi
        
    else
        error "Backup creation failed"
        return 1
    fi
    
    # Clean old backups (keep last 10)
    verbose "Cleaning old backups..."
    find "$BACKUP_DIR" -name "*.tar.gz" -type f -print0 | \
        xargs -0 ls -t | \
        tail -n +11 | \
        xargs rm -f 2>/dev/null || true
    
    debug "Backup creation completed"
}

# Enhanced restore function with verification
restore_backup() {
    log "Attempting to restore from backup..."
    
    if [[ ! -f "${BACKUP_DIR}/latest_backup.txt" ]]; then
        error "No backup found to restore from"
        error "Available backups:"
        ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "No backups available"
        return 1
    fi
    
    local latest_backup=$(cat "${BACKUP_DIR}/latest_backup.txt")
    local backup_file="${BACKUP_DIR}/${latest_backup}.tar.gz"
    
    if [[ ! -f "$backup_file" ]]; then
        error "Backup file not found: $backup_file"
        return 1
    fi
    
    # Verify backup before restore
    log "Verifying backup integrity..."
    if ! tar -tzf "$backup_file" >/dev/null 2>&1; then
        error "Backup file is corrupted: $backup_file"
        return 1
    fi
    
    warning "Restoring from backup: $latest_backup"
    
    # Create temporary restore directory
    local restore_temp="${TEMP_DIR}/restore_$$"
    mkdir -p "$restore_temp"
    
    # Extract to temporary location first
    if tar -xzf "$backup_file" -C "$restore_temp"; then
        # Stop running processes before restore
        stop_processes
        
        # Move current files to temporary backup
        local current_backup="${TEMP_DIR}/current_before_restore_$$"
        mkdir -p "$current_backup"
        
        [[ -d "./server" ]] && mv "./server" "$current_backup/" 2>/dev/null || true
        [[ -d "./client" ]] && mv "./client" "$current_backup/" 2>/dev/null || true
        [[ -f "./package.json" ]] && mv "./package.json" "$current_backup/" 2>/dev/null || true
        
        # Restore from backup
        if cp -r "$restore_temp"/* . 2>/dev/null; then
            success "Backup restored successfully from: $latest_backup"
            
            # Clean up
            rm -rf "$restore_temp" "$current_backup"
            
            # Show restore info
            if [[ -f "${BACKUP_DIR}/${latest_backup}.info" ]]; then
                verbose "Restore info:"
                cat "${BACKUP_DIR}/${latest_backup}.info"
            fi
            
        else
            error "Failed to restore files - attempting to recover"
            # Attempt to recover original files
            cp -r "$current_backup"/* . 2>/dev/null || true
            rm -rf "$restore_temp" "$current_backup"
            return 1
        fi
    else
        error "Failed to extract backup: $backup_file"
        rm -rf "$restore_temp"
        return 1
    fi
}

# List available backups
list_backups() {
    log "Available backups:"
    
    if [[ ! -d "$BACKUP_DIR" ]] || [[ -z "$(ls -A "$BACKUP_DIR"/*.tar.gz 2>/dev/null)" ]]; then
        warning "No backups found in $BACKUP_DIR"
        return 0
    fi
    
    echo
    printf "%-30s %-15s %-20s\n" "Backup Name" "Size" "Date Created"
    printf "%-30s %-15s %-20s\n" "----------" "----" "------------"
    
    for backup in "$BACKUP_DIR"/*.tar.gz; do
        if [[ -f "$backup" ]]; then
            local name=$(basename "$backup" .tar.gz)
            local size=$(du -h "$backup" | cut -f1)
            local date=$(stat -c %y "$backup" | cut -d' ' -f1,2 | cut -d'.' -f1)
            printf "%-30s %-15s %-20s\n" "$name" "$size" "$date"
        fi
    done
    echo
}

# ========================================
# System Checks and Prerequisites
# ========================================

# Check Ubuntu/Linux system information
check_system_info() {
    log "Checking system information..."
    
    # Check OS
    if [[ -f "/etc/os-release" ]]; then
        source /etc/os-release
        log "Operating System: $PRETTY_NAME"
        verbose "Version ID: $VERSION_ID"
        
        # Check if Ubuntu
        if [[ "$ID" == "ubuntu" ]]; then
            success "Ubuntu detected - optimal compatibility"
        else
            warning "Non-Ubuntu system detected: $ID - some features may vary"
        fi
    else
        warning "Cannot determine OS version"
    fi
    
    # Check architecture
    local arch=$(uname -m)
    log "Architecture: $arch"
    
    # Check kernel version
    local kernel=$(uname -r)
    verbose "Kernel version: $kernel"
    
    # Check available memory
    local mem_total=$(grep MemTotal /proc/meminfo | awk '{print int($2/1024/1024)}')
    log "Available RAM: ${mem_total}GB"
    
    if [[ $mem_total -lt $MIN_MEMORY_GB ]]; then
        warning "Low memory detected: ${mem_total}GB (recommended: ${MIN_MEMORY_GB}GB+)"
    fi
    
    # Check available disk space
    local disk_free=$(df . | awk 'NR==2 {print int($4/1024/1024)}')
    log "Free disk space: ${disk_free}GB"
    
    if [[ $disk_free -lt $MIN_DISK_GB ]]; then
        error "Insufficient disk space: ${disk_free}GB (required: ${MIN_DISK_GB}GB+)"
        return 1
    fi
    
    success "System information check completed"
}

# Install system dependencies
install_system_dependencies() {
    log "Installing system dependencies..."
    
    # Update package list
    if command -v apt-get >/dev/null 2>&1; then
        log "Updating package list..."
        sudo apt-get update -qq
        
        # Install required packages
        local missing_packages=()
        for package in "${REQUIRED_PACKAGES[@]}"; do
            if ! dpkg -l "$package" >/dev/null 2>&1; then
                missing_packages+=("$package")
            fi
        done
        
        if [[ ${#missing_packages[@]} -gt 0 ]]; then
            log "Installing missing packages: ${missing_packages[*]}"
            sudo apt-get install -y "${missing_packages[@]}"
            success "System packages installed"
        else
            success "All required packages already installed"
        fi
        
        # Install build essentials if needed
        if ! dpkg -l "build-essential" >/dev/null 2>&1; then
            log "Installing build essentials..."
            sudo apt-get install -y build-essential
        fi
        
    else
        warning "apt-get not available - manual package installation may be required"
    fi
}

# Install Node.js if needed
install_nodejs() {
    if ! command -v node >/dev/null 2>&1; then
        log "Node.js not found - installing..."
        
        # Install NodeSource repository
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
        sudo apt-get install -y nodejs
        
        success "Node.js installed"
    else
        local node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ $node_version -lt $NODE_VERSION ]]; then
            log "Upgrading Node.js from version $node_version to $NODE_VERSION..."
            
            # Remove old Node.js
            sudo apt-get remove -y nodejs npm
            
            # Install new version
            curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
            sudo apt-get install -y nodejs
            
            success "Node.js upgraded"
        else
            success "Node.js version check passed: v$(node -v)"
        fi
    fi
}

# Comprehensive prerequisite checking
check_prerequisites() {
    log "Checking system prerequisites..."
    
    # Check system info first
    check_system_info
    
    # Check internet connectivity
    if ! ping -c 1 8.8.8.8 >/dev/null 2>&1; then
        if [[ "$FORCE" != "true" ]]; then
            error "No internet connectivity detected"
            error "Internet is required for updates. Use --force to bypass this check."
            return 1
        else
            warning "No internet connectivity - proceeding with --force flag"
        fi
    else
        success "Internet connectivity verified"
    fi
    
    # Install dependencies if requested
    if [[ "$INSTALL_DEPS" == "true" ]]; then
        install_system_dependencies
        install_nodejs
    fi
    
    # Check Node.js installation
    if ! command -v node >/dev/null 2>&1; then
        error "Node.js is not installed"
        error "Run with --install-deps to install automatically, or install manually:"
        error "curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -"
        error "sudo apt-get install -y nodejs"
        return 1
    fi
    
    # Check Node.js version
    local node_version=$(node -v)
    local node_major=$(echo "$node_version" | cut -d'v' -f2 | cut -d'.' -f1)
    log "Found Node.js version: $node_version"
    
    if [[ $node_major -lt $NODE_VERSION ]]; then
        if [[ "$FORCE" != "true" ]]; then
            error "Node.js version $node_major detected. Required: $NODE_VERSION+"
            error "Run with --install-deps to upgrade automatically"
            return 1
        else
            warning "Node.js version $node_major is below recommended $NODE_VERSION+ - proceeding with --force"
        fi
    fi
    
    # Check npm
    if ! command -v npm >/dev/null 2>&1; then
        error "npm is not installed or not accessible"
        error "npm should be installed with Node.js. Try reinstalling Node.js."
        return 1
    fi
    
    local npm_version=$(npm -v)
    log "Found npm version: $npm_version"
    
    # Check Git (optional but recommended)
    if ! command -v git >/dev/null 2>&1; then
        warning "Git is not installed - some features may be limited"
        verbose "Install with: sudo apt-get install git"
    else
        local git_version=$(git --version)
        verbose "Found Git: $git_version"
    fi
    
    # Check if we're in the correct directory
    if [[ ! -f "package.json" ]]; then
        error "package.json not found - are you in the correct directory?"
        error "Current directory: $(pwd)"
        return 1
    fi
    
    if [[ ! -d "server" ]]; then
        error "server directory not found - are you in the correct directory?"
        return 1
    fi
    
    if [[ ! -d "client" ]]; then
        error "client directory not found - are you in the correct directory?"
        return 1
    fi
    
    # Check process permissions
    if [[ ! -w "." ]]; then
        error "No write permission in current directory"
        error "Make sure you have write access to: $(pwd)"
        return 1
    fi
    
    # Check systemctl availability (for service management)
    if command -v systemctl >/dev/null 2>&1; then
        verbose "systemctl available for service management"
    else
        verbose "systemctl not available - manual process management will be used"
    fi
    
    success "Prerequisites check completed successfully"
}

# ========================================
# Process Management
# ========================================

# Enhanced process stopping with service detection
stop_processes() {
    log "Stopping running processes..."
    
    local stopped_any=false
    
    # Check for systemd service first
    if command -v systemctl >/dev/null 2>&1; then
        if systemctl is-active --quiet velink 2>/dev/null; then
            log "Stopping velink systemd service..."
            sudo systemctl stop velink
            stopped_any=true
            verbose "Systemd service stopped"
        fi
    fi
    
    # Stop Node.js processes related to this project
    local node_pids=$(pgrep -f "node.*index.js" 2>/dev/null || true)
    if [[ -n "$node_pids" ]]; then
        log "Stopping Node.js processes: $node_pids"
        kill -TERM $node_pids 2>/dev/null || true
        stopped_any=true
        
        # Wait for graceful shutdown
        sleep 3
        
        # Force kill if still running
        local remaining_pids=$(pgrep -f "node.*index.js" 2>/dev/null || true)
        if [[ -n "$remaining_pids" ]]; then
            warning "Force killing remaining Node.js processes: $remaining_pids"
            kill -KILL $remaining_pids 2>/dev/null || true
        fi
    fi
    
    # Stop npm dev processes
    local npm_pids=$(pgrep -f "npm.*dev" 2>/dev/null || true)
    if [[ -n "$npm_pids" ]]; then
        log "Stopping npm dev processes: $npm_pids"
        kill -TERM $npm_pids 2>/dev/null || true
        stopped_any=true
    fi
    
    # Stop PM2 processes if PM2 is available
    if command -v pm2 >/dev/null 2>&1; then
        local pm2_processes=$(pm2 list | grep -c "online" 2>/dev/null || echo "0")
        if [[ "$pm2_processes" -gt 0 ]]; then
            log "Stopping PM2 processes..."
            pm2 stop all >/dev/null 2>&1 || true
            stopped_any=true
            verbose "PM2 processes stopped"
        fi
    fi
    
    if [[ "$stopped_any" == "true" ]]; then
        success "Processes stopped successfully"
        sleep 2  # Allow time for cleanup
    else
        verbose "No running processes found"
    fi
}

# Start application with multiple methods
start_application() {
    log "Starting Velink application..."
    
    # Check for systemd service first
    if command -v systemctl >/dev/null 2>&1 && [[ -f "/etc/systemd/system/velink.service" ]]; then
        log "Starting via systemd service..."
        sudo systemctl start velink
        sleep 3
        
        if systemctl is-active --quiet velink; then
            success "Application started via systemd"
            return 0
        else
            warning "Systemd service failed to start, trying alternative methods..."
        fi
    fi
    
    # Check for PM2
    if command -v pm2 >/dev/null 2>&1; then
        if [[ -f "ecosystem.config.js" ]] || [[ -f "pm2.config.js" ]]; then
            log "Starting via PM2..."
            pm2 start ecosystem.config.js 2>/dev/null || pm2 start pm2.config.js 2>/dev/null || pm2 start server/index.js --name velink
            success "Application started via PM2"
            return 0
        fi
    fi
    
    # Fallback to npm/node
    if [[ "$AUTO_START" == "true" ]]; then
        log "Starting via npm (background mode)..."
        cd "$(pwd)"
        nohup npm run dev > /dev/null 2>&1 &
        local npm_pid=$!
        
        sleep 3
        
        if kill -0 $npm_pid 2>/dev/null; then
            success "Application started via npm (PID: $npm_pid)"
            echo "Access the application at: http://localhost:3000"
        else
            error "Failed to start application via npm"
            return 1
        fi
    else
        success "Application ready to start"
        echo "To start the application manually, run: npm run dev"
    fi
}

# ========================================
# Update Functions
# ========================================

# Update system packages (Ubuntu)
update_system_packages() {
    if [[ "$UPDATE_SYSTEM" != "true" ]]; then
        return 0
    fi
    
    log "Updating Ubuntu system packages..."
    
    if ! command -v apt-get >/dev/null 2>&1; then
        warning "apt-get not available - skipping system update"
        return 0
    fi
    
    # Update package list
    log "Updating package list..."
    sudo apt-get update -qq
    
    # Upgrade packages
    log "Upgrading system packages..."
    sudo apt-get upgrade -y
    
    # Clean up
    sudo apt-get autoremove -y
    sudo apt-get autoclean
    
    success "System packages updated"
}

# Enhanced dependency updates with error recovery
update_dependencies() {
    log "Updating project dependencies..."
    
    local failed_updates=()
    
    # Server dependencies
    if [[ -d "./server" && -f "./server/package.json" ]]; then
        log "Updating server dependencies..."
        cd server || return 1
        
        # Clear npm cache if needed
        if [[ "$FORCE" == "true" ]]; then
            verbose "Clearing npm cache..."
            npm cache clean --force
        fi
        
        # Try npm ci first (faster for production)
        if npm ci --production=false 2>/dev/null; then
            success "Server dependencies installed via npm ci"
        elif npm install 2>/dev/null; then
            success "Server dependencies installed via npm install"
        else
            error "Failed to install server dependencies"
            failed_updates+=("server")
        fi
        
        # Update dependencies if requested
        if [[ "$FORCE" == "true" ]]; then
            verbose "Force updating server dependencies..."
            npm update 2>/dev/null || warning "Some server dependencies failed to update"
        fi
        
        cd .. || return 1
    else
        warning "No server package.json found - skipping server dependencies"
    fi
    
    # Client dependencies  
    if [[ -d "./client" && -f "./client/package.json" ]]; then
        log "Updating client dependencies..."
        cd client || return 1
        
        # Clear npm cache if needed
        if [[ "$FORCE" == "true" ]]; then
            verbose "Clearing npm cache..."
            npm cache clean --force
        fi
        
        # Try npm ci first (faster for production)
        if npm ci --production=false 2>/dev/null; then
            success "Client dependencies installed via npm ci"
        elif npm install 2>/dev/null; then
            success "Client dependencies installed via npm install"
        else
            error "Failed to install client dependencies"
            failed_updates+=("client")
        fi
        
        # Update dependencies if requested
        if [[ "$FORCE" == "true" ]]; then
            verbose "Force updating client dependencies..."
            npm update 2>/dev/null || warning "Some client dependencies failed to update"
        fi
        
        cd .. || return 1
    else
        warning "No client package.json found - skipping client dependencies"
    fi
    
    # Check for failures
    if [[ ${#failed_updates[@]} -gt 0 ]]; then
        error "Failed to update dependencies for: ${failed_updates[*]}"
        if [[ "$FORCE" != "true" ]]; then
            return 1
        else
            warning "Continuing despite dependency failures due to --force flag"
        fi
    fi
    
    success "Dependencies update completed"
}

# Enhanced build with optimization
build_application() {
    log "Building application..."
    
    # Build client
    if [[ -d "./client" ]]; then
        cd client || return 1
        
        log "Building React application..."
        verbose "Running npm run build..."
        
        # Set production environment
        export NODE_ENV=production
        
        if npm run build; then
            local build_size=$(du -sh build 2>/dev/null | cut -f1 || echo "unknown")
            success "Client build completed (Size: $build_size)"
            
            # Verify build output
            if [[ -d "build" && -f "build/index.html" ]]; then
                verbose "Build verification successful"
            else
                error "Build output verification failed"
                cd .. || return 1
                return 1
            fi
        else
            error "Client build failed"
            cd .. || return 1
            return 1
        fi
        
        cd .. || return 1
    else
        warning "No client directory found - skipping client build"
    fi
    
    # Build server (if build script exists)
    if [[ -d "./server" && -f "./server/package.json" ]]; then
        cd server || return 1
        
        if npm run build >/dev/null 2>&1; then
            success "Server build completed"
        else
            verbose "No server build script found or build not needed"
        fi
        
        cd .. || return 1
    fi
    
    success "Application build completed successfully"
}

# Database migration and updates
update_database() {
    log "Checking and updating database..."
    
    local db_backup_created=false
    
    # Check for database files
    if [[ -f "./server/velink.db" ]]; then
        log "SQLite database found"
        
        # Create database backup
        local db_backup="./server/velink.db.backup.$(date '+%Y%m%d_%H%M%S')"
        if cp "./server/velink.db" "$db_backup"; then
            success "Database backup created: $(basename "$db_backup")"
            db_backup_created=true
        else
            warning "Failed to create database backup"
        fi
        
        # Check database integrity
        if command -v sqlite3 >/dev/null 2>&1; then
            if sqlite3 "./server/velink.db" "PRAGMA integrity_check;" | grep -q "ok"; then
                success "Database integrity check passed"
            else
                error "Database integrity check failed"
                if [[ "$db_backup_created" == "true" ]]; then
                    warning "Database backup is available: $db_backup"
                fi
                return 1
            fi
        else
            verbose "sqlite3 not available - skipping integrity check"
        fi
    else
        verbose "No SQLite database found - database will be created on first run"
    fi
    
    # Run database migrations if script exists
    if [[ -f "./server/migrate.js" ]]; then
        log "Running database migrations..."
        cd server || return 1
        
        if node migrate.js; then
            success "Database migrations completed"
        else
            error "Database migration failed"
            cd .. || return 1
            return 1
        fi
        
        cd .. || return 1
    elif [[ -f "./migrate.js" ]]; then
        log "Running database migrations..."
        if node migrate.js; then
            success "Database migrations completed"
        else
            error "Database migration failed"
            return 1
        fi
    else
        verbose "No migration script found - assuming no migrations needed"
    fi
    
    success "Database update completed"
}

# ========================================
# Health Check and Monitoring
# ========================================

# Comprehensive health check
health_check() {
    log "Performing comprehensive health check..."
    
    local health_issues=()
    local health_score=0
    local max_score=10
    
    # Check server files
    if [[ -f "./server/index.js" ]]; then
        success "✓ Server entry point found"
        ((health_score++))
    else
        error "✗ Server entry point not found"
        health_issues+=("missing server/index.js")
    fi
    
    # Check client build
    if [[ -d "./client/build" && -f "./client/build/index.html" ]]; then
        success "✓ Client build directory exists and valid"
        ((health_score++))
    else
        warning "✗ Client build directory not found or invalid"
        health_issues+=("missing or invalid client build")
    fi
    
    # Check package.json files
    if [[ -f "./package.json" ]]; then
        success "✓ Root package.json found"
        ((health_score++))
    else
        error "✗ Root package.json not found"
        health_issues+=("missing root package.json")
    fi
    
    if [[ -f "./server/package.json" ]]; then
        success "✓ Server package.json found"
        ((health_score++))
    else
        warning "✗ Server package.json not found"
        health_issues+=("missing server package.json")
    fi
    
    if [[ -f "./client/package.json" ]]; then
        success "✓ Client package.json found"
        ((health_score++))
    else
        warning "✗ Client package.json not found"
        health_issues+=("missing client package.json")
    fi
    
    # Check environment configuration
    if [[ -f "./server/.env" ]] || [[ -f "./.env" ]]; then
        success "✓ Environment configuration found"
        ((health_score++))
    else
        warning "✗ Environment file not found - using defaults"
        health_issues+=("missing environment configuration")
    fi
    
    # Check database
    if [[ -f "./server/velink.db" ]]; then
        success "✓ Database file exists"
        ((health_score++))
        
        # Check database integrity if sqlite3 is available
        if command -v sqlite3 >/dev/null 2>&1; then
            if sqlite3 "./server/velink.db" "PRAGMA integrity_check;" | grep -q "ok"; then
                success "✓ Database integrity verified"
                ((health_score++))
            else
                error "✗ Database integrity check failed"
                health_issues+=("database corruption detected")
            fi
        else
            verbose "sqlite3 not available - skipping database integrity check"
            ((health_score++))  # Assume OK if we can't check
        fi
    else
        verbose "Database file not found - will be created on first run"
        ((health_score++))  # Not an error for new installations
    fi
    
    # Check node_modules
    local missing_deps=()
    if [[ -d "./server" && -f "./server/package.json" ]]; then
        if [[ ! -d "./server/node_modules" ]]; then
            missing_deps+=("server")
        fi
    fi
    
    if [[ -d "./client" && -f "./client/package.json" ]]; then
        if [[ ! -d "./client/node_modules" ]]; then
            missing_deps+=("client")
        fi
    fi
    
    if [[ ${#missing_deps[@]} -eq 0 ]]; then
        success "✓ Dependencies are installed"
        ((health_score++))
    else
        warning "✗ Missing dependencies for: ${missing_deps[*]}"
        health_issues+=("missing dependencies")
    fi
    
    # Check port availability (if server is not running)
    local port=3000
    if ! netstat -tuln 2>/dev/null | grep -q ":$port "; then
        success "✓ Port $port is available"
        ((health_score++))
    else
        warning "✗ Port $port is in use"
        verbose "Current port usage:"
        netstat -tuln 2>/dev/null | grep ":$port " || true
    fi
    
    # Calculate health percentage
    local health_percentage=$((health_score * 100 / max_score))
    
    echo
    log "Health Check Summary:"
    log "Score: $health_score/$max_score ($health_percentage%)"
    
    if [[ $health_percentage -ge 90 ]]; then
        success "System health: EXCELLENT"
    elif [[ $health_percentage -ge 70 ]]; then
        success "System health: GOOD"
    elif [[ $health_percentage -ge 50 ]]; then
        warning "System health: FAIR"
    else
        error "System health: POOR"
    fi
    
    if [[ ${#health_issues[@]} -gt 0 ]]; then
        echo
        warning "Issues detected:"
        for issue in "${health_issues[@]}"; do
            echo "  - $issue"
        done
        echo
        
        if [[ $health_percentage -lt 70 ]]; then
            error "Health check failed - system may not function properly"
            return 1
        fi
    fi
    
    success "Health check completed"
}

# Performance diagnostics
performance_check() {
    log "Running performance diagnostics..."
    
    # Check CPU usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    verbose "CPU usage: ${cpu_usage}%"
    
    # Check memory usage
    local mem_info=$(free -h | grep "^Mem:")
    local mem_used=$(echo "$mem_info" | awk '{print $3}')
    local mem_total=$(echo "$mem_info" | awk '{print $2}')
    verbose "Memory usage: $mem_used / $mem_total"
    
    # Check disk I/O
    if command -v iostat >/dev/null 2>&1; then
        local disk_io=$(iostat -x 1 1 | tail -n +4 | head -1 | awk '{print $10}')
        verbose "Disk I/O utilization: ${disk_io}%"
    fi
    
    success "Performance diagnostics completed"
}

# ========================================
# Cleanup and Maintenance
# ========================================

# Comprehensive cleanup
cleanup() {
    log "Running comprehensive cleanup..."
    
    local cleaned_items=0
    
    # Remove old logs (keep last 7 days)
    if [[ -d "./server/logs" ]]; then
        local old_logs=$(find ./server/logs -name "*.log" -type f -mtime +7 2>/dev/null | wc -l)
        if [[ $old_logs -gt 0 ]]; then
            find ./server/logs -name "*.log" -type f -mtime +7 -delete 2>/dev/null || true
            verbose "Removed $old_logs old log files"
            ((cleaned_items += old_logs))
        fi
    fi
    
    # Remove old backups (keep last 10)
    if [[ -d "$BACKUP_DIR" ]]; then
        local old_backups=$(find "$BACKUP_DIR" -name "*.tar.gz" -type f | wc -l)
        if [[ $old_backups -gt 10 ]]; then
            find "$BACKUP_DIR" -name "*.tar.gz" -type f -print0 | \
                xargs -0 ls -t | tail -n +11 | xargs rm -f 2>/dev/null || true
            local removed_backups=$((old_backups - 10))
            verbose "Removed $removed_backups old backup files"
            ((cleaned_items += removed_backups))
        fi
    fi
    
    # Clean npm cache
    if [[ "$FORCE" == "true" ]]; then
        verbose "Cleaning npm cache..."
        npm cache clean --force >/dev/null 2>&1 || true
        ((cleaned_items++))
    fi
    
    # Remove temporary files
    if [[ -d "$TEMP_DIR" ]]; then
        rm -rf "$TEMP_DIR"
        mkdir -p "$TEMP_DIR"
        verbose "Cleaned temporary directory"
        ((cleaned_items++))
    fi
    
    # Remove node_modules if force cleanup
    if [[ "$FORCE" == "true" && "$CLEANUP_ONLY" == "true" ]]; then
        warning "Force cleaning node_modules directories..."
        [[ -d "./server/node_modules" ]] && rm -rf "./server/node_modules" && ((cleaned_items++))
        [[ -d "./client/node_modules" ]] && rm -rf "./client/node_modules" && ((cleaned_items++))
    fi
    
    # Clean database journal files
    find . -name "*.db-journal" -type f -delete 2>/dev/null || true
    
    # Clean old database backups (keep last 5)
    local old_db_backups=$(find ./server -name "velink.db.backup.*" -type f 2>/dev/null | wc -l)
    if [[ $old_db_backups -gt 5 ]]; then
        find ./server -name "velink.db.backup.*" -type f -print0 | \
            xargs -0 ls -t | tail -n +6 | xargs rm -f 2>/dev/null || true
        local removed_db_backups=$((old_db_backups - 5))
        verbose "Removed $removed_db_backups old database backups"
        ((cleaned_items += removed_db_backups))
    fi
    
    if [[ $cleaned_items -gt 0 ]]; then
        success "Cleanup completed - $cleaned_items items cleaned"
    else
        success "Cleanup completed - system already clean"
    fi
}

# ========================================
# Main Update Function
# ========================================

# Comprehensive update process
main_update() {
    log "Starting Velink update process v${SCRIPT_VERSION}..."
    log "Update initiated at: $(date)"
    log "Working directory: $(pwd)"
    
    # Create lock to prevent multiple instances
    create_lock
    
    # Setup directories
    setup_directories
    
    # Update system packages if requested
    update_system_packages
    
    # Stop running processes
    stop_processes
    
    # Initialize update steps counter
    local step=1
    local total_steps=7
    
    # Step 1: Prerequisites
    log "[$step/$total_steps] Checking prerequisites..."
    if ! check_prerequisites; then
        error "Prerequisites check failed"
        return 1
    fi
    ((step++))
    
    # Step 2: Backup (unless skipped)
    if [[ "$SKIP_BACKUP" != "true" ]]; then
        log "[$step/$total_steps] Creating backup..."
        if ! create_backup; then
            error "Backup creation failed"
            return 1
        fi
    else
        log "[$step/$total_steps] Skipping backup (--skip-backup flag)"
    fi
    ((step++))
    
    # Step 3: Dependencies
    log "[$step/$total_steps] Updating dependencies..."
    if ! update_dependencies; then
        error "Dependency update failed! Attempting to restore from backup..."
        restore_backup
        return 1
    fi
    ((step++))
    
    # Step 4: Build
    log "[$step/$total_steps] Building application..."
    if ! build_application; then
        error "Application build failed! Attempting to restore from backup..."
        restore_backup
        return 1
    fi
    ((step++))
    
    # Step 5: Database
    log "[$step/$total_steps] Updating database..."
    if ! update_database; then
        error "Database update failed! Attempting to restore from backup..."
        restore_backup
        return 1
    fi
    ((step++))
    
    # Step 6: Health Check
    log "[$step/$total_steps] Performing health check..."
    if ! health_check; then
        if [[ "$FORCE" != "true" ]]; then
            error "Health check failed! Attempting to restore from backup..."
            restore_backup
            return 1
        else
            warning "Health check failed but continuing due to --force flag"
        fi
    fi
    ((step++))
    
    # Step 7: Cleanup
    log "[$step/$total_steps] Running cleanup..."
    cleanup
    
    # Update completed successfully
    success "Update completed successfully!"
    success "Update finished at: $(date)"
    
    # Performance check
    performance_check
    
    # Auto-start if requested
    if [[ "$AUTO_START" == "true" ]]; then
        log "Auto-starting application..."
        start_application
    else
        echo
        log "To start the application, run one of the following:"
        log "  npm run dev              # Development mode"
        log "  npm start                # Production mode"
        if command -v pm2 >/dev/null 2>&1; then
            log "  pm2 start ecosystem.config.js  # PM2 process manager"
        fi
        if command -v systemctl >/dev/null 2>&1; then
            log "  sudo systemctl start velink    # Systemd service"
        fi
    fi
    
    echo
    success "Velink update process completed successfully!"
}

# ========================================
# Signal Handlers and Error Recovery
# ========================================

# Handle update failures with recovery
handle_update_failure() {
    local exit_code=$1
    error "Update process failed with exit code: $exit_code"
    
    if [[ "$SKIP_BACKUP" != "true" ]]; then
        log "Attempting automatic recovery from backup..."
        if restore_backup; then
            warning "System restored from backup"
            log "Please check the logs and try the update again"
        else
            error "Failed to restore from backup"
            error "Manual intervention may be required"
        fi
    else
        error "No backup available for recovery (--skip-backup was used)"
        error "Manual intervention required"
    fi
    
    cleanup_lock
    exit $exit_code
}

# ========================================
# Main Execution Logic
# ========================================

# Main script execution
main() {
    # Parse command line arguments
    parse_arguments "$@"
    
    # Handle specific commands
    if [[ "$BACKUP_ONLY" == "true" ]]; then
        setup_directories
        create_backup
        exit $?
    elif [[ "$RESTORE" == "true" ]]; then
        setup_directories
        restore_backup
        exit $?
    elif [[ "$HEALTH_CHECK_ONLY" == "true" ]]; then
        health_check
        performance_check
        exit $?
    elif [[ "$CLEANUP_ONLY" == "true" ]]; then
        cleanup
        exit $?
    elif [[ "$INSTALL_DEPS" == "true" && "$UPDATE_SYSTEM" != "true" && "$BACKUP_ONLY" != "true" ]]; then
        # Only install dependencies, don't run full update
        install_system_dependencies
        install_nodejs
        exit $?
    else
        # Run full update process
        if ! main_update; then
            handle_update_failure $?
        fi
    fi
}

# Execute main function with all arguments
main "$@"
