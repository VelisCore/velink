# Ubuntu Deployment Guide for Velink

## Prerequisites

### System Requirements
- Ubuntu 18.04+ or compatible Linux distribution
- At least 1GB RAM
- At least 2GB free disk space
- Internet connection for updates

### Quick Setup Commands

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget tar gzip build-essential

# Install Node.js 18+ (using NodeSource repository)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management (optional)
sudo npm install -g pm2

# Install SQLite3 for database management (optional)
sudo apt install -y sqlite3
```

## Deployment Options

### Option 1: Direct Deployment
```bash
# Clone repository
git clone https://github.com/Velyzo/velink.git /opt/velink
cd /opt/velink

# Run automated setup
./update.sh --install-deps --update-system --auto-start

# Or step by step:
./update.sh --install-deps    # Install system dependencies
./update.sh --backup-only     # Create initial backup
./update.sh                   # Run full update
./update.sh --auto-start      # Start application
```

### Option 2: Systemd Service
```bash
# Copy service file
sudo cp velink.service /etc/systemd/system/
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable velink
sudo systemctl start velink

# Check status
sudo systemctl status velink
```

### Option 3: PM2 Process Manager
```bash
# Install PM2 globally
sudo npm install -g pm2

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save
pm2 startup
```

## Update Script Features

### Basic Usage
```bash
./update.sh                    # Standard update
./update.sh --help             # Show help
./update.sh --auto-start       # Update and start automatically
```

### Advanced Options
```bash
./update.sh --backup-only      # Create backup only
./update.sh --restore          # Restore from backup
./update.sh --health-check     # System health check
./update.sh --cleanup          # Clean old files
./update.sh --install-deps     # Install system dependencies
./update.sh --update-system    # Update Ubuntu packages first
./update.sh --force            # Force update even if checks fail
./update.sh --verbose --debug  # Detailed output
```

### Maintenance Commands
```bash
./update.sh --health-check     # Check system health
./update.sh --cleanup          # Remove old logs and backups
./update.sh --force --cleanup  # Deep cleanup including node_modules
```

## Ubuntu-Specific Optimizations

### Performance Tuning
```bash
# Increase file descriptors limit
echo "fs.file-max = 65536" | sudo tee -a /etc/sysctl.conf

# Optimize TCP settings
echo "net.core.somaxconn = 1024" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.tcp_tw_reuse = 1" | sudo tee -a /etc/sysctl.conf

# Apply changes
sudo sysctl -p
```

### Security Hardening
```bash
# Create dedicated user
sudo useradd -r -s /bin/false velink

# Set proper permissions
sudo chown -R velink:velink /opt/velink
sudo chmod -R 755 /opt/velink
sudo chmod 644 /opt/velink/server/velink.db

# Configure firewall
sudo ufw allow 3000/tcp  # If using UFW
```

### Log Management
```bash
# Configure logrotate
sudo tee /etc/logrotate.d/velink << EOF
/opt/velink/server/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF
```

### Backup Strategy
```bash
# Create backup directory
sudo mkdir -p /var/backups/velink

# Add to crontab for automated backups
echo "0 2 * * * cd /opt/velink && ./update.sh --backup-only" | sudo crontab -
```

## Monitoring and Health Checks

### System Monitoring
```bash
# Check service status
sudo systemctl status velink

# View logs
sudo journalctl -u velink -f

# Check resource usage
htop
sudo netstat -tuln | grep 3000
```

### Health Check Endpoint
```bash
# Manual health check
./update.sh --health-check

# Automated monitoring (add to cron)
echo "*/5 * * * * cd /opt/velink && ./update.sh --health-check > /dev/null" | crontab -
```

## Troubleshooting

### Common Issues
1. **Permission denied**: Run `sudo chmod +x update.sh`
2. **Node.js not found**: Run `./update.sh --install-deps`
3. **Port already in use**: Check `sudo netstat -tuln | grep 3000`
4. **Database locked**: Stop service and check for stale processes

### Recovery Procedures
```bash
# Restore from backup
./update.sh --restore

# Force update with cleanup
./update.sh --force --cleanup

# Complete reset (dangerous)
./update.sh --force --cleanup
sudo rm -rf node_modules server/node_modules client/node_modules
./update.sh --install-deps
```

## Environment Configuration

### Production Environment Variables
Create `/opt/velink/.env`:
```bash
NODE_ENV=production
PORT=3000
DATABASE_PATH=./server/velink.db
LOG_LEVEL=info
MAX_LOG_SIZE=10MB
BACKUP_RETENTION_DAYS=30
```

### Development Environment
```bash
NODE_ENV=development
PORT=3001
DEBUG=true
LOG_LEVEL=debug
```

## Performance Optimization

### Database Optimization
```bash
# SQLite optimization
sqlite3 /opt/velink/server/velink.db "PRAGMA journal_mode=WAL;"
sqlite3 /opt/velink/server/velink.db "PRAGMA synchronous=NORMAL;"
sqlite3 /opt/velink/server/velink.db "PRAGMA cache_size=10000;"
```

### Node.js Optimization
```bash
# Set Node.js environment variables
export NODE_OPTIONS="--max-old-space-size=1024"
export UV_THREADPOOL_SIZE=16
```

This guide provides comprehensive Ubuntu deployment instructions optimized for production use.
