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
    echo -e "${BLUE}🔄 Updating VeLink...${NC}"
    
    # Create backup first
    create_backup
    
    echo -e "${BLUE}📥 Pulling latest code...${NC}"
    git pull origin main
    
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install --production
    
    if [ -d "client" ]; then
        echo -e "${BLUE}🏗️  Rebuilding client...${NC}"
        cd client
        npm install
        npm run build
        cd ..
    fi
    
    echo -e "${BLUE}🔄 Restarting service...${NC}"
    pm2 restart velink
    
    echo -e "${GREEN}✅ VeLink updated successfully${NC}"
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
