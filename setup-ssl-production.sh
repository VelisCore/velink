#!/bin/bash
# Let's Encrypt SSL Certificate Setup for velink.me
# Run this script on your production server as root

echo "🔐 Setting up Let's Encrypt SSL certificates for velink.me"
echo "========================================================"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Please run this script as root (use sudo)"
    exit 1
fi

# Update system packages
echo "📦 Updating system packages..."
apt update

# Install Certbot
echo "🔧 Installing Certbot..."
apt install -y certbot

# Stop any services using port 80/443
echo "🛑 Stopping web services temporarily..."
systemctl stop nginx apache2 2>/dev/null || true
pkill -f "node.*server" || true

# Generate certificates
echo "🔐 Generating SSL certificates..."
certbot certonly --standalone \
    --agree-tos \
    --no-eff-email \
    --email admin@velink.me \
    -d velink.me \
    -d www.velink.me

if [ $? -eq 0 ]; then
    echo "✅ SSL certificates generated successfully!"
    echo ""
    echo "📍 Certificate files located at:"
    echo "   Private Key: /etc/letsencrypt/live/velink.me/privkey.pem"
    echo "   Certificate: /etc/letsencrypt/live/velink.me/fullchain.pem"
    echo ""
    echo "🔄 Update your .env file with:"
    echo "SSL_KEY_PATH=/etc/letsencrypt/live/velink.me/privkey.pem"
    echo "SSL_CERT_PATH=/etc/letsencrypt/live/velink.me/fullchain.pem"
    echo ""
    
    # Set up auto-renewal
    echo "⚙️  Setting up automatic certificate renewal..."
    (crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet") | crontab -
    
    echo "✅ Auto-renewal configured!"
    echo "📅 Certificates will auto-renew every day at 12:00 PM"
    
else
    echo "❌ Certificate generation failed!"
    echo "🔍 Please check:"
    echo "   - Domain DNS points to this server"
    echo "   - Port 80 is accessible from internet"
    echo "   - No firewall blocking port 80"
    exit 1
fi

echo ""
echo "🚀 SSL setup complete! Your VeLink is ready for HTTPS."
echo "🔗 Access your site at: https://velink.me"
