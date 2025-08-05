# Enhanced Update System Documentation

## Overview

The Velink update system has been completely redesigned to provide a seamless integration between the admin panel and the Ubuntu-optimized update script. This system offers comprehensive update management with real-time monitoring, progress tracking, and robust error handling.

## Architecture

### Components

1. **Ubuntu-Optimized Update Script** (`update.sh`)
   - Comprehensive system validation and health checks
   - Automated backup and restore functionality
   - Progress monitoring and detailed logging
   - Ubuntu package management integration
   - Service management (systemd, PM2)

2. **Enhanced Admin Panel UI**
   - Real-time update monitoring
   - Progress visualization
   - Update options configuration
   - Health status dashboard
   - Backup/restore management

3. **API Integration** (`server/index.js`)
   - Update status endpoints
   - Progress tracking
   - Log streaming
   - Maintenance mode management

## Features

### Admin Panel Features

#### Update Dashboard
- **System Health Monitoring**: Real-time health status with color-coded indicators
- **Version Information**: Current and latest version comparison with commit details
- **Update Options**: Configurable update parameters
  - Skip backup creation (dangerous but faster)
  - Force update (bypass safety checks)
  - Auto-restart after update
  - Update system packages (Ubuntu)

#### Progress Monitoring
- **Real-time Progress Bar**: Visual progress indication during updates
- **Live Log Streaming**: Real-time update logs with color-coded severity levels
- **Status Updates**: Current operation status and estimated completion time

#### Backup Management
- **One-click Backup Creation**: Create manual backups before risky operations
- **Restore Functionality**: Quickly restore from the latest backup
- **Backup Verification**: Integrity checks ensure backup reliability

#### Safety Features
- **Maintenance Mode**: Automatically enables during updates
- **Update Cancellation**: Ability to cancel running updates
- **Automatic Rollback**: Restore from backup if update fails
- **Health Checks**: Pre and post-update system validation

### Update Script Features

#### Comprehensive Validation
```bash
# System requirements checking
- Ubuntu version compatibility
- Node.js version validation
- Disk space verification (minimum 2GB)
- Memory requirements (minimum 1GB)
- Internet connectivity testing
- Directory structure validation
```

#### Advanced Backup System
```bash
# Multi-format backup support
- Compressed tar.gz archives
- Backup integrity verification
- Automatic cleanup (keeps last 10)
- Metadata tracking with timestamps
- Size optimization with exclusions
```

#### Service Integration
```bash
# Multiple service management options
- Systemd service detection and control
- PM2 process manager support
- Traditional process management fallback
- Graceful shutdown and startup procedures
```

#### Progress Tracking
```bash
# 7-step update process with progress reporting
1. Prerequisites check (14%)
2. Backup creation (28%)
3. Dependencies update (42%)
4. Application build (56%)
5. Database update (70%)
6. Health check (84%)
7. Cleanup (100%)
```

## Usage Guide

### Admin Panel Usage

1. **Access Update Panel**
   - Navigate to Admin Panel → Update tab
   - System automatically checks for updates

2. **Configure Update Options**
   - Review update options based on your needs
   - **Skip Backup**: Only if you have recent manual backups
   - **Force Update**: Use when health checks are overly cautious
   - **Auto-restart**: Recommended for automated updates
   - **System Update**: Include Ubuntu package updates

3. **Perform Update**
   - Click "Update System" to start the process
   - Monitor progress in real-time
   - Review logs for detailed information
   - System will restart automatically if configured

4. **Emergency Procedures**
   - **Cancel Update**: Use if update is stuck or problematic
   - **Restore Backup**: Immediately restore if something goes wrong
   - **Create Backup**: Manually backup before risky operations

### Command Line Usage

#### Basic Operations
```bash
# Standard update
./update.sh

# Check system health
./update.sh --health-check

# Create backup only
./update.sh --backup-only

# Restore from backup
./update.sh --restore
```

#### Advanced Operations
```bash
# Force update with system packages
./update.sh --force --update-system --verbose

# Update without backup (risky)
./update.sh --skip-backup --auto-start

# Debug mode with detailed output
./update.sh --debug --verbose
```

#### Ubuntu Deployment
```bash
# Complete automated deployment
sudo ./deploy-ubuntu.sh --domain yourdomain.com

# Deployment without SSL
sudo ./deploy-ubuntu.sh --no-ssl --no-firewall

# Custom deployment path
sudo ./deploy-ubuntu.sh --path /opt/custom-velink --user customuser
```

## API Endpoints

### Update Management
```javascript
// Check for updates
GET /api/admin/update/check
Response: {
  currentVersion: "1.0.0 (abc1234)",
  latestVersion: "1.0.1 (+3 commits)",
  updateAvailable: true,
  systemHealth: "Good",
  lastUpdateTime: "2025-01-20 14:30:00",
  pendingRestart: false,
  updateScriptAvailable: true
}

// Get update status and progress
GET /api/admin/update/status
Response: {
  isUpdating: true,
  maintenanceMode: true,
  progress: 42,
  logs: [
    {
      timestamp: "2025-01-20 14:30:15",
      level: "INFO",
      message: "Dependencies update completed"
    }
  ]
}

// Perform system update
POST /api/admin/update/perform
Body: {
  skipBackup: false,
  forceUpdate: false,
  autoRestart: true,
  updateSystem: false
}

// Create manual backup
POST /api/admin/update/backup

// Restore from backup
POST /api/admin/update/restore

// Cancel running update
POST /api/admin/update/cancel
```

## Configuration

### Environment Variables
```bash
# Update script configuration
ADMIN_UPDATE=true          # Indicates admin-initiated update
UPDATE_SOURCE=admin_panel  # Source of the update request
PORT=3000                 # API port for integration
DEBUG=true                # Enable debug mode
VERBOSE=true              # Enable verbose output
```

### PM2 Integration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'velink',
    script: './server/index.js',
    // ... other configuration
  }],
  deploy: {
    production: {
      'post-deploy': 'npm install && chmod +x update.sh && ./update.sh --skip-backup --force --auto-start && pm2 reload ecosystem.config.js --env production'
    }
  }
}
```

## Security Considerations

### Admin Panel Security
- All update endpoints require admin token authentication
- Update operations are logged with admin user identification
- Maintenance mode prevents unauthorized access during updates

### System Security
- Update script validates permissions before execution
- Lock files prevent multiple concurrent updates
- Backup verification prevents corrupted restore operations
- Health checks ensure system stability

### Network Security
- HTTPS recommended for admin panel access
- Firewall configuration included in deployment scripts
- SSL/TLS certificates automated via Let's Encrypt

## Troubleshooting

### Common Issues

1. **Update Script Not Found**
   ```bash
   # Ensure script exists and is executable
   ls -la update.sh
   chmod +x update.sh
   ```

2. **Permission Denied**
   ```bash
   # Fix permissions
   sudo chown -R $USER:$USER .
   chmod +x update.sh
   ```

3. **Health Check Failed**
   ```bash
   # Run manual health check
   ./update.sh --health-check --verbose
   
   # Force update if checks are overly strict
   ./update.sh --force
   ```

4. **Update Stuck or Failed**
   ```bash
   # Cancel via admin panel or CLI
   curl -X POST https://velink.me/api/admin/update/cancel \
        -H "Authorization: Bearer YOUR_TOKEN"
   
   # Or remove lock file manually
   rm -f .update.pid /tmp/velink_update.lock
   ```

5. **Restore Required**
   ```bash
   # Via admin panel or CLI
   ./update.sh --restore
   ```

### Log Analysis
```bash
# Check update logs
tail -f update.log

# Check admin-specific logs
tail -f admin-update.log

# Check service logs
sudo journalctl -u velink -f

# Check PM2 logs
pm2 logs velink
```

## Best Practices

### Before Updates
1. Create manual backup if dealing with important data
2. Verify system health status
3. Ensure adequate disk space and memory
4. Test in staging environment if possible

### During Updates
1. Monitor progress through admin panel
2. Avoid interrupting the process unless necessary
3. Keep browser tab open to see completion status
4. Check logs if progress seems stuck

### After Updates
1. Verify application functionality
2. Check system health status
3. Test critical features
4. Monitor logs for any issues

### Production Deployment
1. Use staging environment for testing
2. Schedule updates during low-traffic periods
3. Notify users of maintenance windows
4. Have rollback plan ready
5. Monitor system after updates

This enhanced update system provides enterprise-grade update management with comprehensive monitoring, safety features, and Ubuntu optimization for production deployments.
