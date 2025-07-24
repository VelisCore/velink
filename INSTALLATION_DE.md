# Velink DigitalOcean Installation

## Was ist in dieser ZIP-Datei?

- **Komplett gebaute React App** (client/build/)
- **Server-Code** mit allen Dependencies
- **Automatisches Installations-Script**
- **Nginx Konfiguration**
- **PM2 Konfiguration**
- **Management Scripts**

## Installation auf DigitalOcean

### Schritt 1: Datei hochladen
```bash
# Mit deinem Droplet verbinden
ssh root@159.89.29.21

# ZIP-Datei hochladen (z.B. mit WinSCP oder scp)
# Die Datei nach /tmp/velink.zip hochladen
```

### Schritt 2: Entpacken und installieren
```bash
# ZIP entpacken
cd /tmp
unzip velink.zip

# Installation starten
cd velink-deploy
chmod +x install.sh
./install.sh
```

### Schritt 3: Fertig!
Nach der Installation ist Velink verfügbar unter:
- **Website:** http://DEINE-SERVER-IP
- **Admin Panel:** http://DEINE-SERVER-IP/admin

## Nach der Installation

### Admin Token ändern (WICHTIG!)
```bash
nano /home/velink/velink/.env
# Ändere ADMIN_TOKEN zu einem sicheren Wert
velink-manage.sh restart
```

### SSL für deine Domain einrichten
```bash
# Erst DNS von velink.me auf deine Server IP zeigen lassen
# Dann SSL installieren:
certbot --nginx -d velink.me -d www.velink.me
```

## Management Befehle

```bash
# Status prüfen
velink-manage.sh status

# Neustart
velink-manage.sh restart

# Logs anzeigen
velink-manage.sh logs

# Backup erstellen
velink-manage.sh backup

# Update
velink-manage.sh update
```

## Troubleshooting

### Wenn Velink nicht läuft:
```bash
sudo -u velink pm2 status
sudo -u velink pm2 restart all
```

### Wenn Nginx nicht läuft:
```bash
systemctl status nginx
systemctl restart nginx
```

### Logs prüfen:
```bash
sudo -u velink pm2 logs
tail -f /home/velink/velink/server/logs/*.log
```

## Ordnerstruktur auf dem Server

```
/home/velink/velink/
├── server/           # Node.js Backend
├── client/build/     # React Frontend (gebaut)
├── .env             # Konfiguration
├── ecosystem.config.js  # PM2 Konfiguration
├── velink-manage.sh # Management Script
└── logs/            # Log Dateien
```

## Standard Zugangsdaten

- **Admin Token:** `Velink-DigitalOcean-2025-SecureToken-ChangeMe`
- **Port:** 5002 (intern), 80/443 (extern über Nginx)

**WICHTIG:** Ändere das Admin Token nach der Installation!
