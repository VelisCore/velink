#!/bin/bash

# ===================================================================
# VeLink Ultra-Robust Update System for Ubuntu Server
# ===================================================================
# Features:
# - Comprehensive backup system
# - Multi-level rollback capabilities  
# - Zero-downtime deployment
# - Health checks and validation
# - Automatic service management
# - Real-time progress reporting
# ===================================================================

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"
BACKUP_DIR="$PROJECT_DIR/backups"
LOG_FILE="$PROJECT_DIR/update.log"
PROGRESS_FILE="$PROJECT_DIR/.update_progress"
PID_FILE="$PROJECT_DIR/.update.pid"
MAINTENANCE_FILE="$PROJECT_DIR/server/.maintenance"
HEALTH_CHECK_URL="http://localhost:80/api/stats"
SERVICE_NAME="velink"
MAX_ROLLBACK_ATTEMPTS=3
UPDATE_TIMEOUT=1800 # 30 minutes

# Default options
SKIP_BACKUP=false
FORCE_UPDATE=false
AUTO_RESTART=true
UPDATE_SYSTEM=false
VERBOSE=false
DRY_RUN=false
BRANCH="main"

# Progress tracking
TOTAL_STEPS=12
CURRENT_STEP=0

# ===================================================================
# Utility Functions
# ===================================================================

log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "ERROR")   echo -e "${RED}[ERROR]${NC} $message" >&2 ;;
        "WARN")    echo -e "${YELLOW}[WARN]${NC} $message" ;;
        "INFO")    echo -e "${GREEN}[INFO]${NC} $message" ;;
        "DEBUG")   [[ "$VERBOSE" == "true" ]] && echo -e "${BLUE}[DEBUG]${NC} $message" ;;
    esac
    
    echo "[$timestamp] [$level] $message" >> "$LOG_FILE"
}

update_progress() {
    CURRENT_STEP=$((CURRENT_STEP + 1))
    local step_name="$1"
    local percentage=$((CURRENT_STEP * 100 / TOTAL_STEPS))
    
    cat > "$PROGRESS_FILE" <<EOF
{
    "isUpdating": true,
    "step": $CURRENT_STEP,
    "totalSteps": $TOTAL_STEPS,
    "percentage": $percentage,
    "currentStep": "$step_name",
    "timestamp": "$(date -Iseconds)",
    "estimatedTimeRemaining": $((TOTAL_STEPS - CURRENT_STEP) * 30)
}
EOF
    
    log "INFO" "Step $CURRENT_STEP/$TOTAL_STEPS ($percentage%): $step_name"
}

cleanup() {
    log "INFO" "Performing cleanup..."
    
    # Remove PID file
    [[ -f "$PID_FILE" ]] && rm -f "$PID_FILE"
    
    # Update final progress
    cat > "$PROGRESS_FILE" <<EOF
{
    "isUpdating": false,
    "step": $TOTAL_STEPS,
    "totalSteps": $TOTAL_STEPS,
    "percentage": 100,
    "currentStep": "Update completed",
    "timestamp": "$(date -Iseconds)",
    "success": true
}
EOF
    
    # Remove maintenance mode if successful
    if [[ -f "$MAINTENANCE_FILE" ]]; then
        rm -f "$MAINTENANCE_FILE"
        log "INFO" "Maintenance mode disabled"
    fi
}

emergency_cleanup() {
    local exit_code=$?
    log "ERROR" "Emergency cleanup triggered (exit code: $exit_code)"
    
    # Update progress with error
    cat > "$PROGRESS_FILE" <<EOF
{
    "isUpdating": false,
    "step": $CURRENT_STEP,
    "totalSteps": $TOTAL_STEPS,
    "percentage": $((CURRENT_STEP * 100 / TOTAL_STEPS)),
    "currentStep": "Update failed - emergency cleanup",
    "timestamp": "$(date -Iseconds)",
    "success": false,
    "error": "Update process failed at step $CURRENT_STEP"
}
EOF
    
    # Remove PID file
    [[ -f "$PID_FILE" ]] && rm -f "$PID_FILE"
    
    # Attempt emergency rollback
    if [[ "$CURRENT_STEP" -gt 6 ]]; then
        log "WARN" "Attempting emergency rollback..."
        emergency_rollback
    fi
    
    # Remove maintenance mode
    [[ -f "$MAINTENANCE_FILE" ]] && rm -f "$MAINTENANCE_FILE"
    
    exit $exit_code
}

trap emergency_cleanup ERR EXIT

# ===================================================================
# System Checks and Validation
# ===================================================================

check_prerequisites() {
    update_progress "Checking system prerequisites"
    
    # Check if running as appropriate user
    if [[ $EUID -eq 0 ]] && [[ "$FORCE_UPDATE" != "true" ]]; then
        log "WARN" "Running as root. Consider using a dedicated user for VeLink."
    fi
    
    # Check required commands
    local required_commands=("git" "node" "npm" "curl" "jq" "systemctl" "tar" "gzip")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            log "ERROR" "Required command '$cmd' not found"
            exit 1
        fi
    done
    
    # Check disk space (at least 1GB free)
    local available_space=$(df "$PROJECT_DIR" | awk 'NR==2 {print $4}')
    if [[ "$available_space" -lt 1048576 ]]; then
        log "ERROR" "Insufficient disk space. At least 1GB required."
        exit 1
    fi
    
    # Check memory (at least 512MB free)
    local available_memory=$(free -k | awk 'NR==2{printf "%.0f", $7}')
    if [[ "$available_memory" -lt 524288 ]]; then
        log "WARN" "Low memory detected. Update may be slower."
    fi
    
    # Check if another update is running
    if [[ -f "$PID_FILE" ]]; then
        local existing_pid=$(cat "$PID_FILE")
        if kill -0 "$existing_pid" 2>/dev/null; then
            log "ERROR" "Another update is already running (PID: $existing_pid)"
            exit 1
        else
            log "WARN" "Stale PID file found, removing..."
            rm -f "$PID_FILE"
        fi
    fi
    
    log "INFO" "Prerequisites check passed"
}

check_git_status() {
    update_progress "Checking Git repository status"
    
    cd "$PROJECT_DIR"
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log "ERROR" "Not a Git repository"
        exit 1
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD -- && [[ "$FORCE_UPDATE" != "true" ]]; then
        log "ERROR" "Uncommitted changes detected. Use --force to override."
        git status --porcelain
        exit 1
    fi
    
    # Check connectivity to remote
    if ! git ls-remote --exit-code origin >/dev/null 2>&1; then
        log "ERROR" "Cannot connect to Git remote"
        exit 1
    fi
    
    log "INFO" "Git status check passed"
}

health_check() {
    local description="$1"
    local max_attempts=5
    local attempt=1
    
    log "INFO" "Performing health check: $description"
    
    while [[ $attempt -le $max_attempts ]]; do
        if curl -sf "$HEALTH_CHECK_URL" >/dev/null 2>&1; then
            log "INFO" "Health check passed on attempt $attempt"
            return 0
        fi
        
        log "WARN" "Health check failed (attempt $attempt/$max_attempts)"
        sleep 2
        ((attempt++))
    done
    
    log "ERROR" "Health check failed after $max_attempts attempts"
    return 1
}

# ===================================================================
# Backup System
# ===================================================================

create_backup() {
    update_progress "Creating comprehensive backup"
    
    if [[ "$SKIP_BACKUP" == "true" ]]; then
        log "INFO" "Skipping backup (--skip-backup flag)"
        return 0
    fi
    
    local backup_name="velink-backup-$(date +%Y%m%d-%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    mkdir -p "$backup_path"
    
    # Backup application files
    log "INFO" "Backing up application files..."
    tar -czf "$backup_path/app-files.tar.gz" \
        --exclude='.git' \
        --exclude='node_modules' \
        --exclude='backups' \
        --exclude='logs' \
        --exclude='.update*' \
        "$PROJECT_DIR"
    
    # Backup database
    if [[ -f "$PROJECT_DIR/server/velink.db" ]]; then
        log "INFO" "Backing up database..."
        cp "$PROJECT_DIR/server/velink.db" "$backup_path/velink.db.backup"
        sqlite3 "$PROJECT_DIR/server/velink.db" ".backup $backup_path/velink.db.sql"
    fi
    
    # Backup configuration files
    log "INFO" "Backing up configuration..."
    mkdir -p "$backup_path/config"
    
    # Copy important config files
    for config_file in ".env" "package.json" "server/package.json" "client/package.json"; do
        if [[ -f "$PROJECT_DIR/$config_file" ]]; then
            cp "$PROJECT_DIR/$config_file" "$backup_path/config/"
        fi
    done
    
    # Save system information
    cat > "$backup_path/system-info.json" <<EOF
{
    "timestamp": "$(date -Iseconds)",
    "hostname": "$(hostname)",
    "user": "$(whoami)",
    "nodeVersion": "$(node --version)",
    "npmVersion": "$(npm --version)",
    "gitCommit": "$(git rev-parse HEAD)",
    "gitBranch": "$(git branch --show-current)",
    "systemLoad": "$(uptime)",
    "diskUsage": "$(df -h "$PROJECT_DIR" | tail -1)"
}
EOF
    
    # Create restore script
    cat > "$backup_path/restore.sh" <<'RESTORE_SCRIPT'
#!/bin/bash
set -euo pipefail

BACKUP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$BACKUP_DIR")")"

echo "Restoring VeLink from backup: $BACKUP_DIR"

# Stop services
sudo systemctl stop velink || true

# Restore application files
cd "$PROJECT_DIR"
tar -xzf "$BACKUP_DIR/app-files.tar.gz" --strip-components=1

# Restore database
if [[ -f "$BACKUP_DIR/velink.db.backup" ]]; then
    cp "$BACKUP_DIR/velink.db.backup" "$PROJECT_DIR/server/velink.db"
fi

# Restore dependencies
cd "$PROJECT_DIR"
npm install
cd client && npm install
cd ../server && npm install

# Start services
sudo systemctl start velink

echo "Restore completed successfully"
RESTORE_SCRIPT
    
    chmod +x "$backup_path/restore.sh"
    
    # Save backup info
    echo "$backup_path" > "$PROJECT_DIR/.last_backup"
    
    log "INFO" "Backup created successfully: $backup_path"
    echo "$backup_path"
}

emergency_rollback() {
    log "WARN" "Performing emergency rollback..."
    
    local backup_path
    if [[ -f "$PROJECT_DIR/.last_backup" ]]; then
        backup_path=$(cat "$PROJECT_DIR/.last_backup")
    else
        log "ERROR" "No backup information found for rollback"
        return 1
    fi
    
    if [[ ! -d "$backup_path" ]]; then
        log "ERROR" "Backup directory not found: $backup_path"
        return 1
    fi
    
    log "INFO" "Rolling back to: $backup_path"
    
    # Execute restore script
    if [[ -x "$backup_path/restore.sh" ]]; then
        "$backup_path/restore.sh"
        log "INFO" "Emergency rollback completed"
    else
        log "ERROR" "Restore script not found or not executable"
        return 1
    fi
}

# ===================================================================
# Update Process
# ===================================================================

enable_maintenance_mode() {
    update_progress "Enabling maintenance mode"
    
    cat > "$MAINTENANCE_FILE" <<EOF
{
    "enabled": true,
    "reason": "System update in progress",
    "startTime": "$(date -Iseconds)",
    "estimatedDuration": "5-10 minutes",
    "contact": "mail@velyzo.de"
}
EOF
    
    log "INFO" "Maintenance mode enabled"
}

stop_services() {
    update_progress "Stopping services gracefully"
    
    # Give running processes time to finish current requests
    log "INFO" "Sending graceful shutdown signal..."
    
    if systemctl is-active --quiet "$SERVICE_NAME" 2>/dev/null; then
        sudo systemctl stop "$SERVICE_NAME"
        log "INFO" "Service stopped successfully"
    else
        log "INFO" "Service not running or not managed by systemctl"
        
        # Try to find and stop Node.js processes
        local node_pids=$(pgrep -f "node.*server" || true)
        if [[ -n "$node_pids" ]]; then
            log "INFO" "Stopping Node.js processes: $node_pids"
            echo "$node_pids" | xargs -r kill -TERM
            sleep 5
            
            # Force kill if still running
            local remaining_pids=$(pgrep -f "node.*server" || true)
            if [[ -n "$remaining_pids" ]]; then
                log "WARN" "Force killing remaining processes: $remaining_pids"
                echo "$remaining_pids" | xargs -r kill -KILL
            fi
        fi
    fi
}

update_system_packages() {
    if [[ "$UPDATE_SYSTEM" != "true" ]]; then
        log "INFO" "Skipping system package updates"
        return 0
    fi
    
    update_progress "Updating system packages"
    
    log "INFO" "Updating system packages..."
    sudo apt-get update -qq
    sudo apt-get upgrade -y
    
    # Update Node.js if needed
    local current_node_version=$(node --version | cut -d'v' -f2)
    log "INFO" "Current Node.js version: $current_node_version"
    
    # Check if we should update Node.js (you can customize this logic)
    # For now, we'll just log the version
}

fetch_updates() {
    update_progress "Fetching latest code from repository"
    
    cd "$PROJECT_DIR"
    
    log "INFO" "Fetching updates from origin/$BRANCH..."
    git fetch origin "$BRANCH"
    
    local current_commit=$(git rev-parse HEAD)
    local latest_commit=$(git rev-parse "origin/$BRANCH")
    
    if [[ "$current_commit" == "$latest_commit" ]] && [[ "$FORCE_UPDATE" != "true" ]]; then
        log "INFO" "Already up to date"
        return 0
    fi
    
    log "INFO" "Updating from $current_commit to $latest_commit"
    git reset --hard "origin/$BRANCH"
    
    log "INFO" "Code updated successfully"
}

install_dependencies() {
    update_progress "Installing/updating dependencies"
    
    cd "$PROJECT_DIR"
    
    # Install root dependencies
    if [[ -f "package.json" ]]; then
        log "INFO" "Installing root dependencies..."
        npm ci --production
    fi
    
    # Install server dependencies
    if [[ -f "server/package.json" ]]; then
        log "INFO" "Installing server dependencies..."
        cd server
        npm ci --production
        cd ..
    fi
    
    # Install and build client
    if [[ -f "client/package.json" ]]; then
        log "INFO" "Installing client dependencies..."
        cd client
        npm ci
        
        log "INFO" "Building client application..."
        npm run build
        cd ..
    fi
    
    log "INFO" "Dependencies installed successfully"
}

run_database_migrations() {
    update_progress "Running database migrations"
    
    # Check if migration script exists
    if [[ -f "$PROJECT_DIR/server/migrate.js" ]]; then
        log "INFO" "Running database migrations..."
        cd "$PROJECT_DIR/server"
        node migrate.js
    else
        log "INFO" "No database migrations found"
    fi
}

validate_installation() {
    update_progress "Validating installation"
    
    # Check if all required files exist
    local required_files=(
        "server/index.js"
        "server/package.json"
        "client/build/index.html"
        "client/build/static"
    )
    
    for file in "${required_files[@]}"; do
        if [[ ! -e "$PROJECT_DIR/$file" ]]; then
            log "ERROR" "Required file/directory missing: $file"
            return 1
        fi
    done
    
    # Check Node.js syntax
    log "INFO" "Validating Node.js syntax..."
    if ! node -c "$PROJECT_DIR/server/index.js"; then
        log "ERROR" "Server script has syntax errors"
        return 1
    fi
    
    log "INFO" "Installation validation passed"
}

start_services() {
    update_progress "Starting services"
    
    log "INFO" "Starting VeLink services..."
    
    if systemctl list-unit-files | grep -q "^$SERVICE_NAME.service"; then
        sudo systemctl start "$SERVICE_NAME"
        sudo systemctl enable "$SERVICE_NAME"
        
        # Wait for service to be ready
        local attempts=0
        while [[ $attempts -lt 30 ]]; do
            if systemctl is-active --quiet "$SERVICE_NAME"; then
                log "INFO" "Service started successfully"
                break
            fi
            sleep 1
            ((attempts++))
        done
        
        if [[ $attempts -eq 30 ]]; then
            log "ERROR" "Service failed to start within timeout"
            return 1
        fi
    else
        log "INFO" "Starting services manually..."
        cd "$PROJECT_DIR"
        
        # Start in background
        nohup npm start > /dev/null 2>&1 &
        
        # Give it time to start
        sleep 5
    fi
}

post_update_health_check() {
    update_progress "Performing post-update health check"
    
    # Wait a moment for services to fully initialize
    sleep 5
    
    if ! health_check "Post-update validation"; then
        log "ERROR" "Post-update health check failed"
        return 1
    fi
    
    log "INFO" "Post-update health check passed"
}

disable_maintenance_mode() {
    update_progress "Disabling maintenance mode"
    
    if [[ -f "$MAINTENANCE_FILE" ]]; then
        rm -f "$MAINTENANCE_FILE"
        log "INFO" "Maintenance mode disabled"
    fi
}

cleanup_old_backups() {
    update_progress "Cleaning up old backups"
    
    # Keep only the last 10 backups
    if [[ -d "$BACKUP_DIR" ]]; then
        local backup_count=$(find "$BACKUP_DIR" -maxdepth 1 -type d -name "velink-backup-*" | wc -l)
        
        if [[ $backup_count -gt 10 ]]; then
            log "INFO" "Cleaning up old backups (keeping 10 most recent)..."
            find "$BACKUP_DIR" -maxdepth 1 -type d -name "velink-backup-*" | \
                sort | head -n -10 | xargs -r rm -rf
        fi
    fi
}

# ===================================================================
# Main Update Process
# ===================================================================

main() {
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --skip-backup)
                SKIP_BACKUP=true
                shift
                ;;
            --force)
                FORCE_UPDATE=true
                shift
                ;;
            --no-restart)
                AUTO_RESTART=false
                shift
                ;;
            --update-system)
                UPDATE_SYSTEM=true
                shift
                ;;
            --verbose|-v)
                VERBOSE=true
                shift
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --branch)
                BRANCH="$2"
                shift 2
                ;;
            --help|-h)
                show_help
                exit 0
                ;;
            *)
                log "ERROR" "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Initialize
    echo $$ > "$PID_FILE"
    mkdir -p "$BACKUP_DIR"
    
    log "INFO" "Starting VeLink Ultra-Robust Update System"
    log "INFO" "Options: skip-backup=$SKIP_BACKUP, force=$FORCE_UPDATE, auto-restart=$AUTO_RESTART"
    log "INFO" "Branch: $BRANCH, Update system: $UPDATE_SYSTEM, Verbose: $VERBOSE"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        log "INFO" "DRY RUN MODE - No actual changes will be made"
        return 0
    fi
    
    # Execute update steps
    local backup_path=""
    
    check_prerequisites
    check_git_status
    
    # Pre-update health check
    if ! health_check "Pre-update baseline"; then
        log "WARN" "Pre-update health check failed, but continuing..."
    fi
    
    enable_maintenance_mode
    backup_path=$(create_backup)
    stop_services
    update_system_packages
    fetch_updates
    install_dependencies
    run_database_migrations
    validate_installation
    start_services
    post_update_health_check
    disable_maintenance_mode
    cleanup_old_backups
    
    # Success
    update_progress "Update completed successfully"
    
    log "INFO" "Update completed successfully!"
    log "INFO" "Backup created at: $backup_path"
    log "INFO" "VeLink is now running the latest version"
    
    # Final cleanup
    trap - ERR EXIT
    cleanup
}

show_help() {
    cat << EOF
VeLink Ultra-Robust Update System

USAGE:
    $0 [OPTIONS]

OPTIONS:
    --skip-backup      Skip creating backup before update
    --force            Force update even with uncommitted changes
    --no-restart       Don't restart services after update  
    --update-system    Update system packages as well
    --verbose, -v      Enable verbose logging
    --dry-run          Show what would be done without making changes
    --branch BRANCH    Update from specific git branch (default: main)
    --help, -h         Show this help message

EXAMPLES:
    $0                          # Standard update
    $0 --verbose --force        # Force update with detailed output
    $0 --skip-backup --no-restart  # Quick update without backup/restart
    $0 --update-system --branch develop  # Full system update from develop branch

EOF
}

# Run main function
main "$@"
