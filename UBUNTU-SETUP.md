# VeLink Ubuntu Server Installation Guide

## 🚀 Quick Installation

### Prerequisites
- Ubuntu 20.04+ server
- Root access (sudo)
- Domain pointing to your server (for SSL)

### Step 1: Upload Files
Upload your VeLink files to your Ubuntu server:
```bash
# Using scp
scp -r /path/to/velink user@your-server:/home/user/

# Or clone from git
git clone https://github.com/Velyzo/velink.git
cd velink
```

### Step 2: Run Setup Script
```bash
# Make script executable
chmod +x ubuntu-setup.sh

# Run the installation script as root
sudo ./ubuntu-setup.sh
```

## 📋 What the Script Does

### System Setup
- ✅ Updates Ubuntu packages
- ✅ Installs Node.js 20 LTS
- ✅ Installs PM2 process manager
- ✅ Creates dedicated user (optional)
- ✅ Configures firewall (UFW)

### VeLink Installation
- ✅ Installs server dependencies
- ✅ Builds client application
- ✅ Creates production environment file
- ✅ Sets up database permissions

### SSL & Security
- ✅ Installs Certbot
- ✅ Generates Let's Encrypt certificates
- ✅ Configures auto-renewal
- ✅ Updates firewall rules

### Service Management
- ✅ Creates PM2 ecosystem configuration
- ✅ Starts VeLink as system service
- ✅ Enables auto-startup on boot
- ✅ Sets up log rotation

## 🛠️ Management Commands

After installation, use the management script:

```bash
# Make management script executable
chmod +x velink-manage.sh

# Show all available commands
./velink-manage.sh help

# Common commands
./velink-manage.sh status    # Check service status
./velink-manage.sh logs      # View live logs
./velink-manage.sh restart   # Restart service
./velink-manage.sh backup    # Create database backup
./velink-manage.sh update    # Update VeLink
```

## 🔗 Access Your VeLink

### With SSL (Recommended)
- **Production**: https://velink.me
- **Admin Panel**: https://velink.me/admin

### Without SSL (Development)
- **Production**: http://your-server-ip:5002
- **Admin Panel**: http://your-server-ip:5002/admin

## 📊 Monitoring

### PM2 Dashboard
```bash
pm2 monit                    # Interactive monitoring
pm2 status                   # Service status
pm2 logs velink             # View logs
pm2 restart velink          # Restart service
```

### System Logs
```bash
journalctl -u pm2-root      # System service logs
tail -f /home/user/velink/logs/combined.log  # Application logs
```

## 🔒 Security Configuration

### Environment Variables
The script generates secure random tokens in `.env`:
- `ADMIN_TOKEN`: For admin panel access
- `PRIVACY_ACCESS_PASSWORD`: For privacy page access

### SSL Certificates
- Automatically renews every 60 days
- Cron job: `0 12 * * * /usr/bin/certbot renew --quiet && pm2 restart velink`

### Firewall Rules
- SSH (22): Allowed
- HTTP (80): Allowed (for Let's Encrypt)
- HTTPS (443): Allowed
- VeLink (5002): Allowed (fallback)

## 🔧 Troubleshooting

### Service Not Starting
```bash
./velink-manage.sh logs-error    # Check error logs
pm2 describe velink              # Detailed process info
```

### SSL Issues
```bash
sudo certbot certificates       # Check certificate status
./velink-manage.sh ssl-renew    # Manually renew certificates
```

### Database Issues
```bash
./velink-manage.sh backup       # Create backup before fixes
ls -la server/velink.db         # Check database permissions
```

### Port Conflicts
```bash
sudo netstat -tulpn | grep :5002    # Check what's using port
sudo lsof -i :443                   # Check HTTPS port
```

## 📈 Performance Optimization

### PM2 Configuration
The script automatically configures:
- Memory limit: 1GB
- Auto-restart on crashes
- Log rotation (10MB, 30 days)
- Cluster mode ready

### System Resources
- Minimum: 1GB RAM, 1 CPU core
- Recommended: 2GB RAM, 2 CPU cores
- Storage: 10GB+ (depends on usage)

## 🔄 Updates

### Automatic Updates
```bash
./velink-manage.sh update    # Pulls git, rebuilds, restarts
```

### Manual Updates
```bash
git pull origin main         # Update code
npm install --production     # Update dependencies
cd client && npm run build   # Rebuild client
pm2 restart velink          # Restart service
```

## 💾 Backup Strategy

### Automatic Backups
```bash
# Add to crontab for daily backups
0 2 * * * /path/to/velink/velink-manage.sh backup
```

### Manual Backup
```bash
./velink-manage.sh backup    # Creates timestamped backup
```

### Backup Locations
- Database: `backups/velink_backup_YYYYMMDD_HHMMSS.db`
- Logs: `logs/` directory
- Configuration: `.env` file

## 🎯 Production Checklist

- [ ] Domain DNS configured
- [ ] SSL certificates working
- [ ] Admin panel accessible
- [ ] Link creation/shortening working
- [ ] Analytics tracking
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Firewall properly configured
- [ ] Environment variables secured

## 📞 Support

If you encounter issues:
1. Check logs: `./velink-manage.sh logs-error`
2. Verify status: `./velink-manage.sh status`
3. Review system info: `./velink-manage.sh info`
4. Create backup: `./velink-manage.sh backup`

Your VeLink installation should now be running smoothly in production! 🚀
