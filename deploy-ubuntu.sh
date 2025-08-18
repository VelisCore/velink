#!/bin/bash

# Ubuntu Deployment Automation Script for Velink
# This script automates the complete deployment process on Ubuntu servers

set -euo pipefail

# Configuration
DEPLOY_USER="velink"
DEPLOY_PATH="/opt/velink"
SERVICE_NAME="velink"
NGINX_CONFIG="/etc/nginx/sites-available/velink"
SSL_DOMAIN="velink.me"
USE_SSL=false
INSTALL_NGINX=true
INSTALL_CERTBOT=false
SETUP_FIREWALL=true

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "This script must be run as root (use sudo)"
        exit 1
    fi
}

# System preparation
prepare_system() {
    log "Preparing Ubuntu system..."
    
    # Update system
    apt update && apt upgrade -y
    
    # Install essential packages
    apt install -y curl wget git tar gzip build-essential software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    
    success "System preparation completed"
}

# Install Node.js
install_nodejs() {
    log "Installing Node.js 18..."
    
    # Remove existing Node.js
    apt remove -y nodejs npm 2>/dev/null || true
    
    # Add NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    # Verify installation
    node_version=$(node -v)
    npm_version=$(npm -v)
    
    success "Node.js installed: $node_version, npm: $npm_version"
}

# Install PM2
install_pm2() {
    log "Installing PM2 process manager..."
    
    npm install -g pm2
    
    # Setup PM2 startup
    pm2 startup systemd -u $DEPLOY_USER --hp /home/$DEPLOY_USER
    
    success "PM2 installed and configured"
}

# Create deployment user
create_user() {
    log "Creating deployment user: $DEPLOY_USER"
    
    if ! id "$DEPLOY_USER" &>/dev/null; then
        useradd -r -m -s /bin/bash $DEPLOY_USER
        usermod -aG sudo $DEPLOY_USER
        success "User $DEPLOY_USER created"
    else
        warning "User $DEPLOY_USER already exists"
    fi
}

# Setup deployment directory
setup_deployment() {
    log "Setting up deployment directory: $DEPLOY_PATH"
    
    # Create directory
    mkdir -p $DEPLOY_PATH
    chown -R $DEPLOY_USER:$DEPLOY_USER $DEPLOY_PATH
    chmod 755 $DEPLOY_PATH
    
    # Clone repository
    if [[ ! -d "$DEPLOY_PATH/.git" ]]; then
        sudo -u $DEPLOY_USER git clone https://github.com/Velyzo/velink.git $DEPLOY_PATH
        success "Repository cloned"
    else
        warning "Repository already exists, pulling updates..."
        cd $DEPLOY_PATH
        sudo -u $DEPLOY_USER git pull origin main
    fi
    
    # Make scripts executable
    chmod +x $DEPLOY_PATH/update.sh
    chmod +x $DEPLOY_PATH/validate-update.sh
    
    success "Deployment directory configured"
}

# Install Nginx
install_nginx() {
    if [[ "$INSTALL_NGINX" != "true" ]]; then
        return 0
    fi
    
    log "Installing and configuring Nginx..."
    
    apt install -y nginx
    
    # Create Nginx configuration
    cat > $NGINX_CONFIG << EOF
server {
    listen 80;
    server_name velink.me;
    
    # Security headers for Cloudflare
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Real IP from Cloudflare
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    set_real_ip_from 2400:cb00::/32;
    set_real_ip_from 2606:4700::/32;
    set_real_ip_from 2803:f800::/32;
    set_real_ip_from 2405:b500::/32;
    set_real_ip_from 2405:8100::/32;
    set_real_ip_from 2c0f:f248::/32;
    set_real_ip_from 2a06:98c0::/29;
    real_ip_header CF-Connecting-IP;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;
    
    # Static files from build
    location / {
        root $DEPLOY_PATH/client/build;
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:80/health;
        access_log off;
    }
}
EOF
    
    # Enable site
    ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    nginx -t
    systemctl restart nginx
    systemctl enable nginx
    
    success "Nginx installed and configured"
}

# Setup SSL with Certbot
setup_ssl() {
    if [[ "$INSTALL_CERTBOT" != "true" || -z "$SSL_DOMAIN" ]]; then
        log "Skipping SSL setup - using Cloudflare for HTTPS termination"
        return 0
    fi
    
    log "Setting up SSL with Let's Encrypt..."
    
    # Install Certbot
    apt install -y certbot python3-certbot-nginx
    
    # Obtain certificate
    certbot --nginx -d $SSL_DOMAIN --non-interactive --agree-tos --email admin@$SSL_DOMAIN
    
    # Setup auto-renewal
    systemctl enable certbot.timer
    
    success "SSL certificate installed for $SSL_DOMAIN"
}

# Configure firewall
setup_firewall() {
    if [[ "$SETUP_FIREWALL" != "true" ]]; then
        return 0
    fi
    
    log "Configuring UFW firewall..."
    
    # Install UFW if not present
    apt install -y ufw
    
    # Configure rules
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH (be careful!)
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Enable firewall
    ufw --force enable
    
    success "Firewall configured"
}

# Setup systemd service
setup_systemd_service() {
    log "Setting up systemd service..."
    
    cat > /etc/systemd/system/$SERVICE_NAME.service << EOF
[Unit]
Description=Velink URL Shortener Service
Documentation=https://github.com/Velyzo/velink
After=network.target network-online.target
Wants=network-online.target

[Service]
Type=simple
User=$DEPLOY_USER
Group=$DEPLOY_USER
WorkingDirectory=$DEPLOY_PATH
ExecStart=/usr/bin/node server/index.js
ExecReload=/bin/kill -HUP \$MAINPID
Restart=always
RestartSec=5
StartLimitInterval=60s
StartLimitBurst=3

# Environment variables
Environment=NODE_ENV=production
Environment=PORT=80
EnvironmentFile=-$DEPLOY_PATH/.env

# Security settings
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$DEPLOY_PATH
CapabilityBoundingSet=CAP_NET_BIND_SERVICE
AmbientCapabilities=CAP_NET_BIND_SERVICE

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=$SERVICE_NAME

# Process management
KillMode=mixed
KillSignal=SIGTERM
TimeoutStopSec=30

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable $SERVICE_NAME
    
    success "Systemd service configured"
}

# Deploy application
deploy_application() {
    log "Deploying Velink application..."
    
    cd $DEPLOY_PATH
    
    # Run update script as deploy user
    sudo -u $DEPLOY_USER ./update.sh --install-deps --update-system --force
    
    success "Application deployed"
}

# Setup monitoring and logging
setup_monitoring() {
    log "Setting up monitoring and logging..."
    
    # Install logrotate configuration
    cat > /etc/logrotate.d/velink << EOF
$DEPLOY_PATH/server/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
    su $DEPLOY_USER $DEPLOY_USER
}
EOF
    
    # Setup cron for automated backups
    (crontab -u $DEPLOY_USER -l 2>/dev/null; echo "0 2 * * * cd $DEPLOY_PATH && ./update.sh --backup-only") | crontab -u $DEPLOY_USER -
    
    # Setup health check monitoring
    (crontab -u $DEPLOY_USER -l 2>/dev/null; echo "*/5 * * * * cd $DEPLOY_PATH && ./update.sh --health-check > /dev/null") | crontab -u $DEPLOY_USER -
    
    success "Monitoring and logging configured"
}

# Start services
start_services() {
    log "Starting services..."
    
    # Start application
    systemctl start $SERVICE_NAME
    
    # Check status
    if systemctl is-active --quiet $SERVICE_NAME; then
        success "Velink service started successfully"
    else
        error "Failed to start Velink service"
        systemctl status $SERVICE_NAME
        exit 1
    fi
    
    # Start Nginx
    systemctl start nginx
    
    success "All services started"
}

# Display deployment summary
show_summary() {
    echo
    success "🎉 Velink deployment completed successfully!"
    echo
    log "Deployment Summary:"
    log "==================="
    log "Application Path: $DEPLOY_PATH"
    log "Service Name: $SERVICE_NAME"
    log "User: $DEPLOY_USER"
    log "Node.js Version: $(node -v)"
    log "PM2 Version: $(pm2 -v)"
    
    if [[ "$INSTALL_NGINX" == "true" ]]; then
        log "Nginx: Installed and configured"
        log "Domain: velink.me"
        log "HTTPS: Provided by Cloudflare"
    fi
    
    if [[ "$USE_SSL" == "true" && -n "$SSL_DOMAIN" ]]; then
        log "SSL: Handled by Cloudflare"
    fi
    
    echo
    log "Service Commands:"
    log "  Start:   sudo systemctl start $SERVICE_NAME"
    log "  Stop:    sudo systemctl stop $SERVICE_NAME"
    log "  Restart: sudo systemctl restart $SERVICE_NAME"
    log "  Status:  sudo systemctl status $SERVICE_NAME"
    log "  Logs:    sudo journalctl -u $SERVICE_NAME -f"
    
    echo
    log "Application Commands:"
    log "  Update:      cd $DEPLOY_PATH && sudo -u $DEPLOY_USER ./update.sh"
    log "  Health Check: cd $DEPLOY_PATH && sudo -u $DEPLOY_USER ./update.sh --health-check"
    log "  Backup:      cd $DEPLOY_PATH && sudo -u $DEPLOY_USER ./update.sh --backup-only"
    log "  Restore:     cd $DEPLOY_PATH && sudo -u $DEPLOY_USER ./update.sh --restore"
    
    echo
    if [[ -n "$SSL_DOMAIN" ]]; then
        success "🌐 Access your application at: https://velink.me (via Cloudflare)"
        log "Note: Make sure Cloudflare is configured to proxy traffic to your server IP on port 80"
    else
        success "🌐 Access your application at: http://velink.me"
    fi
}

# Main deployment process
main() {
    echo "🚀 Starting Ubuntu deployment for Velink..."
    echo
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --domain)
                SSL_DOMAIN="$2"
                USE_SSL=true
                shift 2
                ;;
            --no-nginx)
                INSTALL_NGINX=false
                shift
                ;;
            --no-ssl)
                INSTALL_CERTBOT=false
                USE_SSL=false
                shift
                ;;
            --no-firewall)
                SETUP_FIREWALL=false
                shift
                ;;
            --user)
                DEPLOY_USER="$2"
                shift 2
                ;;
            --path)
                DEPLOY_PATH="$2"
                shift 2
                ;;
            *)
                echo "Unknown option: $1"
                echo "Usage: $0 [--domain example.com] [--no-nginx] [--no-ssl] [--no-firewall] [--user username] [--path /path]"
                exit 1
                ;;
        esac
    done
    
    # Check requirements
    check_root
    
    # Run deployment steps
    prepare_system
    install_nodejs
    install_pm2
    create_user
    setup_deployment
    install_nginx
    setup_ssl
    setup_firewall
    setup_systemd_service
    deploy_application
    setup_monitoring
    start_services
    show_summary
    
    success "✅ Deployment completed successfully!"
}

# Execute main function with all arguments
main "$@"
