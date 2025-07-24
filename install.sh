#!/bin/bash
# Velink Einfache Installation auf DigitalOcean
# Diese Datei entpacken und als root ausführen

set -e

echo "🚀 Velink Installation startet..."
echo "================================="

# System aktualisieren
echo "📦 System wird aktualisiert..."
apt update && apt upgrade -y

# Node.js installieren
echo "🟢 Node.js wird installiert..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# PM2 installieren
echo "⚙️ PM2 wird installiert..."
npm install -g pm2

# Nginx und andere Tools installieren
echo "📥 Nginx und Tools werden installiert..."
apt-get install -y nginx certbot python3-certbot-nginx

# Velink User erstellen
echo "👤 Velink User wird erstellt..."
if ! id "velink" &>/dev/null; then
    adduser --system --group --home /home/velink --shell /bin/bash velink
fi

# Projektordner erstellen
echo "📁 Projektordner wird erstellt..."
mkdir -p /home/velink/velink
cd /home/velink/velink

# Alle Dateien hierher kopieren
echo "📂 Dateien werden kopiert..."
cp -r /tmp/velink-deploy/* .

# Berechtigungen setzen
chown -R velink:velink /home/velink

# Server Dependencies installieren
echo "📦 Server Dependencies werden installiert..."
cd server
sudo -u velink npm install --production --silent
cd ..

# Nginx konfigurieren
echo "🌐 Nginx wird konfiguriert..."
cp nginx-velink.conf /etc/nginx/sites-available/velink
ln -sf /etc/nginx/sites-available/velink /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Nginx testen und starten
nginx -t && systemctl restart nginx

# Firewall konfigurieren
echo "🔥 Firewall wird konfiguriert..."
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443

# Management Script kopieren
cp velink-manage.sh /usr/local/bin/
chmod +x /usr/local/bin/velink-manage.sh

# PM2 starten
echo "🚀 Velink wird gestartet..."
sudo -u velink pm2 start ecosystem.config.js
sudo -u velink pm2 save

# PM2 Autostart konfigurieren
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u velink --hp /home/velink

# Status anzeigen
echo "✅ Installation abgeschlossen!"
echo "================================="
sudo -u velink pm2 status

SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')
echo ""
echo "🎉 Velink läuft jetzt!"
echo "Zugriff über: http://$SERVER_IP"
echo "Admin Panel: http://$SERVER_IP/admin"
echo ""
echo "Admin Token: Velink-DigitalOcean-2025-SecureToken-ChangeMe"
echo "WICHTIG: Ändere das Admin Token in /home/velink/velink/.env"
echo ""
echo "Befehle:"
echo "  Status: velink-manage.sh status"
echo "  Neustart: velink-manage.sh restart"
echo "  Logs: velink-manage.sh logs"
