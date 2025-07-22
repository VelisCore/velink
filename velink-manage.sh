#!/bin/bash
# VeLink Maintenance Script
# Provides easy commands for managing your VeLink installation

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${BLUE}VeLink Management Script${NC}"
    echo -e "${BLUE}=======================${NC}"
    echo ""
    echo -e "${YELLOW}Usage: ./velink-manage.sh [command]${NC}"
    echo ""
    echo -e "${BLUE}Available Commands:${NC}"
    echo -e "  ${GREEN}status${NC}     - Show VeLink service status"
    echo -e "  ${GREEN}start${NC}      - Start VeLink service"
    echo -e "  ${GREEN}stop${NC}       - Stop VeLink service"
    echo -e "  ${GREEN}restart${NC}    - Restart VeLink service"
    echo -e "  ${GREEN}logs${NC}       - Show live logs"
    echo -e "  ${GREEN}logs-error${NC} - Show error logs"
    echo -e "  ${GREEN}update${NC}     - Update VeLink (pull from git and rebuild)"
    echo -e "  ${GREEN}backup${NC}     - Create database backup"
    echo -e "  ${GREEN}maintenance-on${NC}  - Enable maintenance mode"
    echo -e "  ${GREEN}maintenance-off${NC} - Disable maintenance mode"
    echo -e "  ${GREEN}ssl-renew${NC}  - Manually renew SSL certificates"
    echo -e "  ${GREEN}info${NC}       - Show system information"
    echo -e "  ${GREEN}monitor${NC}    - Start monitoring dashboard"
    echo ""
}

show_status() {
    echo -e "${BLUE}📊 VeLink Service Status${NC}"
    echo -e "${BLUE}======================${NC}"
    pm2 status velink
    echo ""
    
    echo -e "${BLUE}🔗 Access Information${NC}"
    if [ -f "/etc/letsencrypt/live/velink.me/privkey.pem" ]; then
        echo -e "   Production: ${GREEN}https://velink.me${NC}"
        echo -e "   Admin Panel: ${GREEN}https://velink.me/admin${NC}"
    else
        SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "localhost")
        echo -e "   Production: ${GREEN}http://$SERVER_IP:5002${NC}"
        echo -e "   Admin Panel: ${GREEN}http://$SERVER_IP:5002/admin${NC}"
    fi
    echo ""
    
    echo -e "${BLUE}📈 Resource Usage${NC}"
    pm2 monit --no-interaction | grep -A 5 velink || echo "   Run 'pm2 monit' for detailed monitoring"
}

start_service() {
    echo -e "${BLUE}🚀 Starting VeLink service...${NC}"
    pm2 start ecosystem.config.js
    pm2 save
    echo -e "${GREEN}✅ VeLink started${NC}"
}

stop_service() {
    echo -e "${BLUE}🛑 Stopping VeLink service...${NC}"
    pm2 stop velink
    echo -e "${GREEN}✅ VeLink stopped${NC}"
}

restart_service() {
    echo -e "${BLUE}🔄 Restarting VeLink service...${NC}"
    pm2 restart velink
    echo -e "${GREEN}✅ VeLink restarted${NC}"
}

show_logs() {
    echo -e "${BLUE}📝 VeLink Live Logs (Ctrl+C to exit)${NC}"
    echo -e "${BLUE}=================================${NC}"
    pm2 logs velink --lines 50
}

show_error_logs() {
    echo -e "${BLUE}❌ VeLink Error Logs${NC}"
    echo -e "${BLUE}==================${NC}"
    pm2 logs velink --err --lines 50
}

update_velink() {
    echo -e "${BLUE}🔄 Starting VeLink Update Process...${NC}"
    echo -e "${BLUE}===================================${NC}"
    
    # Create maintenance mode
    echo -e "${YELLOW}🚧 Enabling maintenance mode...${NC}"
    enable_maintenance_mode
    
    # Create backup first
    echo -e "${BLUE}💾 Creating database backup...${NC}"
    create_backup
    
    # Stop the service gracefully
    echo -e "${BLUE}🛑 Stopping VeLink service...${NC}"
    pm2 stop velink 2>/dev/null || echo "Service not running"
    
    # Stash any local changes
    echo -e "${BLUE}📦 Stashing local changes...${NC}"
    git stash push -m "Auto-stash before update $(date)"
    
    # Pull latest code
    echo -e "${BLUE}📥 Pulling latest code from repository...${NC}"
    git fetch origin
    git reset --hard origin/main
    
    # Ensure we have the client/public/index.html file
    if [ ! -f "client/public/index.html" ]; then
        echo -e "${YELLOW}⚠️  Creating missing client/public/index.html...${NC}"
        mkdir -p client/public
        create_index_html
    fi
    
    # Install server dependencies
    echo -e "${BLUE}📦 Installing server dependencies...${NC}"
    npm install --production --silent
    cd server
    npm install --production --silent
    cd ..
    
    # Build client
    if [ -d "client" ]; then
        echo -e "${BLUE}🏗️  Building client application...${NC}"
        cd client
        
        # Clean install to avoid conflicts
        rm -rf node_modules package-lock.json 2>/dev/null
        npm install --silent
        
        # Build with error handling
        npm run build
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Client build failed!${NC}"
            disable_maintenance_mode
            exit 1
        fi
        cd ..
    fi
    
    # Disable maintenance mode
    echo -e "${BLUE}� Disabling maintenance mode...${NC}"
    disable_maintenance_mode
    
    # Start the service
    echo -e "${BLUE}🚀 Starting VeLink service...${NC}"
    pm2 start ecosystem.config.js || pm2 restart velink
    pm2 save
    
    # Wait a moment for service to start
    sleep 3
    
    # Verify service is running
    if pm2 status velink | grep -q "online"; then
        echo -e "${GREEN}✅ VeLink updated and restarted successfully!${NC}"
        echo -e "${GREEN}📊 Service is running and healthy${NC}"
    else
        echo -e "${RED}❌ Service failed to start after update${NC}"
        echo -e "${YELLOW}🔧 Check logs with: ./velink-manage.sh logs${NC}"
    fi
}

create_backup() {
    echo -e "${BLUE}💾 Creating database backup...${NC}"
    
    BACKUP_DIR="backups"
    mkdir -p $BACKUP_DIR
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="$BACKUP_DIR/velink_backup_$TIMESTAMP.db"
    
    if [ -f "server/velink.db" ]; then
        cp server/velink.db "$BACKUP_FILE"
        echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
    else
        echo -e "${RED}❌ Database file not found: server/velink.db${NC}"
    fi
}

enable_maintenance_mode() {
    echo -e "${YELLOW}🚧 Enabling maintenance mode...${NC}"
    
    # Create maintenance page
    mkdir -p server/public/maintenance
    cat > server/public/maintenance/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VeLink - Under Maintenance</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            text-align: center;
        }
        .container {
            max-width: 500px;
            padding: 2rem;
        }
        .logo {
            font-size: 3rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }
        .spinner {
            border: 4px solid rgba(255,255,255,0.3);
            border-radius: 50%;
            border-top: 4px solid white;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            margin: 2rem auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .message {
            font-size: 1.2rem;
            margin-bottom: 1rem;
        }
        .details {
            opacity: 0.8;
            font-size: 0.9rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">VeLink</div>
        <div class="spinner"></div>
        <div class="message">We're updating VeLink</div>
        <div class="details">
            We're currently performing maintenance to improve your experience.<br>
            All your data and shortened links are safe.<br>
            We'll be back online shortly!
        </div>
    </div>
    <script>
        // Auto-refresh every 30 seconds during maintenance
        setTimeout(() => {
            window.location.reload();
        }, 30000);
    </script>
</body>
</html>
EOF
    
    # Create maintenance flag
    touch server/.maintenance
    echo -e "${GREEN}✅ Maintenance mode enabled${NC}"
}

disable_maintenance_mode() {
    echo -e "${BLUE}🚧 Disabling maintenance mode...${NC}"
    
    # Remove maintenance flag and page
    rm -f server/.maintenance
    rm -rf server/public/maintenance
    
    echo -e "${GREEN}✅ Maintenance mode disabled${NC}"
}

create_index_html() {
    cat > client/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" sizes="32x32" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.svg" type="image/svg+xml" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#3b82f6" />
    
    <!-- SEO Meta Tags -->
    <meta name="description" content="Velink - Beautiful, fast, and secure URL shortening platform. Transform your long links into powerful short URLs with detailed analytics. No registration required." />
    <meta name="keywords" content="url shortener, link shortener, short links, analytics, free, no registration, fast, secure" />
    <meta name="author" content="Velink Team" />
    <meta name="robots" content="index, follow" />
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="Velink - Beautiful URL Shortener" />
    <meta property="og:description" content="Transform your long URLs into powerful, trackable short links. Beautiful, fast, and completely free." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://velink.me" />
    <meta property="og:image" content="%PUBLIC_URL%/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="Velink" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Velink - Beautiful URL Shortener" />
    <meta name="twitter:description" content="Transform your long URLs into powerful, trackable short links. Beautiful, fast, and completely free." />
    <meta name="twitter:image" content="%PUBLIC_URL%/og-image.png" />
    
    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Velink - Beautiful URL Shortener</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF
}

renew_ssl() {
    echo -e "${BLUE}🔒 Renewing SSL certificates...${NC}"
    
    if [ -f "/etc/letsencrypt/live/velink.me/privkey.pem" ]; then
        sudo certbot renew --quiet
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ SSL certificates renewed${NC}"
            pm2 restart velink
        else
            echo -e "${RED}❌ SSL renewal failed${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  No SSL certificates found. Run setup-ssl-production.sh first.${NC}"
    fi
}

show_info() {
    echo -e "${BLUE}📋 System Information${NC}"
    echo -e "${BLUE}===================${NC}"
    echo -e "   OS: $(lsb_release -d | cut -f2)"
    echo -e "   Node.js: $(node --version)"
    echo -e "   npm: $(npm --version)"
    echo -e "   PM2: $(pm2 --version)"
    echo ""
    
    echo -e "${BLUE}💾 Disk Usage${NC}"
    df -h . | tail -1 | awk '{print "   Available: " $4 " / " $2 " (" $5 " used)"}'
    echo ""
    
    echo -e "${BLUE}🔒 SSL Certificate${NC}"
    if [ -f "/etc/letsencrypt/live/velink.me/privkey.pem" ]; then
        EXPIRY=$(openssl x509 -in /etc/letsencrypt/live/velink.me/fullchain.pem -text -noout | grep "Not After" | cut -d: -f2-)
        echo -e "   Expires:$EXPIRY"
    else
        echo -e "   Status: ${YELLOW}Not configured${NC}"
    fi
    echo ""
    
    echo -e "${BLUE}🗄️  Database${NC}"
    if [ -f "server/velink.db" ]; then
        DB_SIZE=$(du -h server/velink.db | cut -f1)
        echo -e "   Size: $DB_SIZE"
    else
        echo -e "   Status: ${RED}Not found${NC}"
    fi
}

start_monitor() {
    echo -e "${BLUE}📊 Starting PM2 monitoring dashboard...${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo -e "${YELLOW}Press Ctrl+C to exit monitoring${NC}"
    pm2 monit
}

# Main script logic
case "$1" in
    "status")
        show_status
        ;;
    "start")
        start_service
        ;;
    "stop")
        stop_service
        ;;
    "restart")
        restart_service
        ;;
    "logs")
        show_logs
        ;;
    "logs-error")
        show_error_logs
        ;;
    "update")
        update_velink
        ;;
    "backup")
        create_backup
        ;;
    "maintenance-on")
        enable_maintenance_mode
        ;;
    "maintenance-off")
        disable_maintenance_mode
        ;;
    "ssl-renew")
        renew_ssl
        ;;
    "info")
        show_info
        ;;
    "monitor")
        start_monitor
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    "")
        show_help
        ;;
    *)
        echo -e "${RED}❌ Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac
