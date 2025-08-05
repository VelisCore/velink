# Velink Scripts Directory

This directory contains all platform-specific scripts and configuration files for Velink.

## Scripts Overview

### Setup Scripts
- **fix-velink.bat** - Windows development environment fix
- **fix-velink.sh** - Unix/Linux development environment fix  
- **update-windows.bat** - Windows update system
- **update-unix.sh** - Unix/Linux update system

### Configuration Files
- **ecosystem.config.js** - PM2 configuration for Linux production
- **velink.service** - Systemd service file for Linux

## Usage

### Initial Setup
From the project root:
```bash
# Windows
setup.bat

# Linux/macOS  
./setup.sh
```

### Updates
From the project root:
```bash
# Windows
update.bat

# Linux/macOS
./update.sh
```

### Development Fixes
If you encounter development issues:
```bash
# Windows
scripts\fix-velink.bat

# Linux/macOS
scripts/fix-velink.sh
```

## Platform Detection

The update system automatically detects your platform and uses the appropriate scripts:
- **Windows**: Uses `cmd /c` and `.bat` scripts
- **Linux/macOS**: Uses `bash` and `.sh` scripts

## Security

- SSL certificates are stored in `templates/ssl-example/` as templates
- Environment files with sensitive data are gitignored
- Update scripts include comprehensive backup and rollback capabilities
