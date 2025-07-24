#!/bin/bash
# Velink Ubuntu Server Setup Script
# Installs Node.js, sets up Velink as a service, configures SSL, and starts the server
# Run as root: sudo ./ubuntu-setup.sh

set -e  # Exit on any error

echo "🚀 Velink Ubuntu Server Setup"
echo "============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run this script as root (use sudo)${NC}"
    exit 1
fi

# Get the actual user (not root when using sudo)
ACTUAL_USER=${SUDO_USER:-$USER}
if [ "$ACTUAL_USER" = "root" ]; then
    echo -e "${YELLOW}⚠️  Running as root user. Consider creating a dedicated user for Velink.${NC}"
    ACTUAL_USER="root"
fi

echo -e "${BLUE}📋 Setup Information:${NC}"
echo -e "   User: $ACTUAL_USER"
echo -e "   Working Directory: $(pwd)"
echo -e "   Domain: velink.me"
echo ""

# Update system packages
echo -e "${BLUE}📦 Updating system packages...${NC}"
apt update && apt upgrade -y

# Install essential packages
echo -e "${BLUE}🔧 Installing essential packages...${NC}"
apt install -y curl wget git unzip software-properties-common ufw

# Install Node.js 20 LTS
echo -e "${BLUE}📦 Installing Node.js 20 LTS...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify installations
echo -e "${BLUE}✅ Verifying installations...${NC}"
node_version=$(node --version)
npm_version=$(npm --version)
echo -e "   Node.js: $node_version"
echo -e "   npm: $npm_version"

# Install PM2 globally for process management
echo -e "${BLUE}🔄 Installing PM2 process manager...${NC}"
npm install -g pm2

# Create velink user if it doesn't exist and we're not using root
if [ "$ACTUAL_USER" != "root" ] && ! id "velink" &>/dev/null; then
    echo -e "${BLUE}👤 Creating velink user...${NC}"
    useradd -m -s /bin/bash velink
    usermod -aG sudo velink
    VELINK_USER="velink"
    VELINK_HOME="/home/velink"
else
    VELINK_USER="$ACTUAL_USER"
    if [ "$ACTUAL_USER" = "root" ]; then
        VELINK_HOME="/root"
    else
        VELINK_HOME="/home/$ACTUAL_USER"
    fi
fi

# Set up Velink directory
VELINK_DIR="$VELINK_HOME/velink"
echo -e "${BLUE}📁 Setting up Velink directory: $VELINK_DIR${NC}"

# If we're in a velink directory, use current directory
if [[ $(basename $(pwd)) == "velink" ]]; then
    VELINK_DIR=$(pwd)
    echo -e "${YELLOW}📍 Using current directory: $VELINK_DIR${NC}"
else
    # Create directory if it doesn't exist
    if [ ! -d "$VELINK_DIR" ]; then
        mkdir -p "$VELINK_DIR"
        echo -e "${YELLOW}📂 Created directory: $VELINK_DIR${NC}"
        echo -e "${YELLOW}⚠️  Please upload your Velink files to: $VELINK_DIR${NC}"
        echo -e "${YELLOW}   Then run this script again.${NC}"
        exit 1
    fi
fi

cd "$VELINK_DIR"

# Check if this is a Velink directory
if [ ! -f "package.json" ] || [ ! -f "server/index.js" ]; then
    echo -e "${RED}❌ This doesn't appear to be a Velink directory.${NC}"
    echo -e "${RED}   Missing package.json or server/index.js${NC}"
    echo -e "${YELLOW}   Please ensure you're in the correct directory with Velink files.${NC}"
    exit 1
fi

# Install server dependencies
echo -e "${BLUE}📦 Installing server dependencies...${NC}"
npm install --production

# Install client dependencies and build
if [ -d "client" ]; then
    echo -e "${BLUE}🏗️  Building client application...${NC}"
    cd client
    npm install
    npm run build
    cd ..
fi

# Set up environment file
echo -e "${BLUE}⚙️  Setting up environment configuration...${NC}"
if [ ! -f ".env" ]; then
    if [ -f ".env.production" ]; then
        cp .env.production .env
        echo -e "${GREEN}✅ Copied .env.production to .env${NC}"
    else
        cat > .env << EOF
# Velink Production Environment Configuration
ADMIN_TOKEN=$(openssl rand -hex 32)
PORT=5002
NODE_ENV=production
DATABASE_PATH=./server/velink.db
SSL_KEY_PATH=/etc/letsencrypt/live/velink.me/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/velink.me/fullchain.pem
PRIVACY_ACCESS_PASSWORD=$(openssl rand -hex 16)
REQUIRE_PRIVACY_ACCEPTANCE=true
ENABLE_COOKIE_NOTICE=true
ENABLE_SITEMAP=true
EOF
        echo -e "${GREEN}✅ Created .env file with random tokens${NC}"
    fi
fi

# Set correct ownership
chown -R $VELINK_USER:$VELINK_USER "$VELINK_DIR"

# Install Certbot for SSL
echo -e "${BLUE}🔒 Installing Certbot for SSL certificates...${NC}"
apt install -y certbot

# Configure firewall
echo -e "${BLUE}🛡️  Configuring firewall...${NC}"
ufw --force enable
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5002/tcp
echo -e "${GREEN}✅ Firewall configured${NC}"

# Generate SSL certificates
echo -e "${BLUE}🔐 Setting up SSL certificates...${NC}"
echo -e "${YELLOW}⚠️  Make sure your domain velink.me points to this server's IP address.${NC}"
read -p "Do you want to generate SSL certificates now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Stop any services that might be using port 80
    systemctl stop nginx apache2 2>/dev/null || true
    pkill -f "node.*server" 2>/dev/null || true
    
    # Generate certificates
    certbot certonly --standalone \
        --agree-tos \
        --no-eff-email \
        --email admin@velink.me \
        -d velink.me \
        -d www.velink.me
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SSL certificates generated successfully!${NC}"
        # Update .env with correct SSL paths
        sed -i 's|SSL_KEY_PATH=.*|SSL_KEY_PATH=/etc/letsencrypt/live/velink.me/privkey.pem|' .env
        sed -i 's|SSL_CERT_PATH=.*|SSL_CERT_PATH=/etc/letsencrypt/live/velink.me/fullchain.pem|' .env
        sed -i 's|PORT=.*|PORT=443|' .env
    else
        echo -e "${YELLOW}⚠️  SSL certificate generation failed. Using port 5002 for now.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping SSL certificate generation. Using port 5002.${NC}"
fi

# Create PM2 ecosystem file
echo -e "${BLUE}🔄 Creating PM2 configuration...${NC}"
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'velink',
    script: 'server/index.js',
    cwd: '$VELINK_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    },
    error_file: '$VELINK_DIR/logs/err.log',
    out_file: '$VELINK_DIR/logs/out.log',
    log_file: '$VELINK_DIR/logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs
chown -R $VELINK_USER:$VELINK_USER logs

# Start Velink with PM2 as the correct user
echo -e "${BLUE}🚀 Starting Velink service...${NC}"
if [ "$VELINK_USER" != "root" ]; then
    sudo -u $VELINK_USER pm2 start ecosystem.config.js
    sudo -u $VELINK_USER pm2 save
    
    # Generate startup script
    PM2_STARTUP=$(sudo -u $VELINK_USER pm2 startup systemd -u $VELINK_USER --hp $VELINK_HOME | tail -n 1)
    eval $PM2_STARTUP
else
    pm2 start ecosystem.config.js
    pm2 save
    pm2 startup systemd -u root --hp /root
fi

# Set up log rotation
echo -e "${BLUE}📝 Setting up log rotation...${NC}"
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

# Set up auto-renewal for SSL certificates
if [ -f "/etc/letsencrypt/live/velink.me/privkey.pem" ]; then
    echo -e "${BLUE}🔄 Setting up SSL certificate auto-renewal...${NC}"
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && pm2 restart velink") | crontab -
fi

# Create a simple status check script
cat > check-velink.sh << 'EOF'
#!/bin/bash
echo "Velink Status Check"
echo "=================="
echo "PM2 Status:"
pm2 status velink
echo ""
echo "SSL Certificate Status:"
if [ -f "/etc/letsencrypt/live/velink.me/privkey.pem" ]; then
    openssl x509 -in /etc/letsencrypt/live/velink.me/fullchain.pem -text -noout | grep "Not After"
else
    echo "No SSL certificate found"
fi
echo ""
echo "Service URL:"
if [ -f "/etc/letsencrypt/live/velink.me/privkey.pem" ]; then
    echo "https://velink.me"
else
    echo "http://$(curl -s ifconfig.me):5002"
fi
EOF

chmod +x check-velink.sh
chown $VELINK_USER:$VELINK_USER check-velink.sh

# Final setup summary
echo ""
echo -e "${GREEN}🎉 Velink Setup Complete!${NC}"
echo -e "${GREEN}=========================${NC}"
echo ""
echo -e "${BLUE}📊 Service Information:${NC}"
echo -e "   User: $VELINK_USER"
echo -e "   Directory: $VELINK_DIR"
echo -e "   Process Manager: PM2"
echo -e "   Auto-start: Enabled"
echo ""

if [ -f "/etc/letsencrypt/live/velink.me/privkey.pem" ]; then
    echo -e "${BLUE}🔗 Access URLs:${NC}"
    echo -e "   Production: ${GREEN}https://velink.me${NC}"
    echo -e "   Admin Panel: ${GREEN}https://velink.me/admin${NC}"
else
    SERVER_IP=$(curl -s ifconfig.me || echo "YOUR_SERVER_IP")
    echo -e "${BLUE}🔗 Access URLs:${NC}"
    echo -e "   Production: ${GREEN}http://$SERVER_IP:5002${NC}"
    echo -e "   Admin Panel: ${GREEN}http://$SERVER_IP:5002/admin${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  To enable HTTPS, run: sudo ./setup-ssl-production.sh${NC}"
fi

echo ""
echo -e "${BLUE}🛠️  Management Commands:${NC}"
echo -e "   Check Status: ${YELLOW}./check-velink.sh${NC}"
echo -e "   View Logs: ${YELLOW}pm2 logs velink${NC}"
echo -e "   Restart: ${YELLOW}pm2 restart velink${NC}"
echo -e "   Stop: ${YELLOW}pm2 stop velink${NC}"
echo ""

echo -e "${BLUE}🔑 Security Notes:${NC}"
echo -e "   Admin Token: Check .env file"
echo -e "   Privacy Password: Check .env file"
echo -e "   Database: $VELINK_DIR/server/velink.db"
echo ""

echo -e "${GREEN}✅ Velink is now running and ready for production!${NC}"

# Show final status
echo -e "${BLUE}📊 Current Status:${NC}"
pm2 status velink
