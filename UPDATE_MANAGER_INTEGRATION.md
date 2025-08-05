# Velink Update Manager - Linux Integration & Admin Panel

## 🎯 Project Summary

Successfully integrated a cross-platform update manager with the Velink admin panel, providing comprehensive update functionality for both Windows and Linux environments.

## ✅ Completed Features

### 1. Cross-Platform Update Manager
- **File**: `server/update-manager.js`
- **Platform Detection**: Automatically detects Windows, Linux, and macOS
- **Linux Optimizations**: Improved memory detection using `free -m` with fallback compatibility
- **System Health Monitoring**: Uptime, memory usage, disk usage, load averages
- **Backup Management**: Automated and manual backup creation with retention policies

### 2. Platform-Specific Scripts
- **Windows**: `scripts/update-windows.bat` - PowerShell-based update script
- **Linux/Unix**: `scripts/update-unix.sh` - Bash-based update script with proper path resolution
- **Script Directory**: `scripts/` - Organized platform-specific update utilities

### 3. Admin Panel Integration
- **Authentication**: Secure token-based admin authentication
- **Update Endpoints**: Full REST API for update management
- **Real-time Status**: Live update progress monitoring
- **Backup Control**: Create, list, and manage system backups
- **Maintenance Mode**: Toggle system maintenance with custom messages

### 4. Database Enhancements
- **Pagination**: Enhanced `getAllLinks()` with pagination, sorting, and search
- **Admin Queries**: Optimized admin link management with filtering capabilities

### 5. Environment Configuration
- **Template**: `templates/.env.example` - Comprehensive environment configuration
- **Security**: Secure admin token configuration with recommendations

## 🔧 Technical Implementation

### Admin API Endpoints
All endpoints require `Authorization: Bearer <token>` header:

```
POST /api/admin/verify          - Verify admin token (body: {token})
GET  /api/admin/update/check    - Check for available updates
GET  /api/admin/update/status   - Get current update status
GET  /api/admin/update/backups  - List available backups
POST /api/admin/update/perform  - Start system update
POST /api/admin/update/cancel   - Cancel ongoing update
POST /api/admin/update/backup   - Create manual backup
GET  /api/admin/links           - Get paginated links with search
DELETE /api/admin/links/:id     - Delete specific link
GET  /api/health                - System health check (no auth)
```

### Linux-Specific Improvements
- **Memory Detection**: Uses `free -m | awk 'NR==2{print $7"/"$2}'` with fallback to column 4
- **Script Path Resolution**: Fixed PROJECT_DIR to properly reference parent directory
- **Health Check URL**: Updated from `/api/stats` to `/api/health` for consistency
- **Process Management**: Improved service restart and health verification

### Update Process Flow
1. **Pre-update**: System health check and backup creation
2. **Git Operations**: Fetch latest changes and verify integrity
3. **Dependency Management**: Update npm packages for server and client
4. **Build Process**: Rebuild client application with production optimizations
5. **Service Management**: Graceful service restart with health verification
6. **Post-update**: Cleanup, verification, and status reporting

## 🚀 How to Use

### 1. Environment Setup
```bash
# Copy and configure environment
cp templates/.env.example server/.env
# Edit server/.env and set your ADMIN_TOKEN
```

### 2. Admin Panel Access
The admin panel is accessible through the frontend with proper authentication. Use the update manager endpoints to:
- Monitor system health
- Check for updates
- Perform automated updates
- Manage backups
- Control maintenance mode

### 3. Manual Updates
For manual updates or troubleshooting:
```bash
# Linux/Unix
./scripts/update-unix.sh

# Windows
scripts\update-windows.bat
```

## 🔒 Security Features
- **Token Authentication**: Secure admin token with configurable length
- **Rate Limiting**: Protection against brute force attacks
- **Maintenance Mode**: Graceful degradation during updates
- **Backup Verification**: Integrity checks for backup files
- **Health Monitoring**: Continuous system health assessment

## 📊 System Monitoring
The update manager provides comprehensive system monitoring:
- **Platform**: OS detection and architecture
- **Resources**: Memory and disk usage tracking
- **Performance**: Load averages and uptime monitoring
- **Services**: Health checks and status verification
- **Git**: Repository status and version tracking

## 🔄 Update Features
- **Automatic Detection**: Checks for new commits and versions
- **Safe Updates**: Pre-update backups and rollback capabilities
- **Progress Tracking**: Real-time update progress with step-by-step status
- **Error Handling**: Comprehensive error recovery and reporting
- **Timeout Protection**: Prevents hanging updates with configurable timeouts

## 📝 Configuration Options
Environment variables for customization:
- `ADMIN_TOKEN`: Secure authentication token
- `UPDATE_BACKUP_RETENTION_DAYS`: Backup retention policy (default: 30)
- `UPDATE_MAX_RETRIES`: Maximum retry attempts (default: 3)
- `UPDATE_TIMEOUT_MINUTES`: Update timeout (default: 30)
- `MAINTENANCE_MODE_FILE`: Maintenance lock file location

## 🎉 Benefits
1. **Cross-Platform**: Works seamlessly on Windows and Linux
2. **User-Friendly**: Web-based admin interface for easy management
3. **Reliable**: Comprehensive error handling and rollback capabilities
4. **Secure**: Token-based authentication and secure update process
5. **Monitoring**: Real-time system health and update status
6. **Automated**: Self-updating system with minimal manual intervention

## 🔮 Future Enhancements
- Scheduled updates with cron-like functionality
- Email notifications for update status
- Multiple backup profiles and strategies
- Integration with CI/CD pipelines
- Advanced rollback scenarios
- Performance metrics and analytics

---

*Last updated: August 2025*
*Status: Production Ready ✅*
