# VeLink Production Deployment Guide

## 🚀 Production Deployment Checklist

### ✅ Completed Tasks
- [x] Custom alias support (3-50 chars, alphanumeric + hyphens/underscores)
- [x] Password protection with beautiful UI
- [x] Automatic sitemap synchronization
- [x] Production environment configuration
- [x] SSL certificates generated (self-signed for development)
- [x] Enhanced .gitignore with security patterns
- [x] VeLink branding assets updated
- [x] Build optimization completed
- [x] Security hardening (rate limiting, input validation)

### 🔧 Environment Configuration

Your `.env` file is configured for production:
```
# Authentication
ADMIN_TOKEN=your-secure-admin-token-here

# Server Configuration
PORT=5002
NODE_ENV=production

# Database
DATABASE_PATH=./server/velink.db

# SSL Configuration (for HTTPS)
SSL_KEY_PATH=./ssl/private-key.pem
SSL_CERT_PATH=./ssl/certificate.pem

# Privacy & Legal
PRIVACY_ACCESS_PASSWORD=your-privacy-password
REQUIRE_PRIVACY_ACCEPTANCE=true
ENABLE_COOKIE_NOTICE=true

# Features
ENABLE_SITEMAP=true
```

### 🔐 SSL Certificate Setup

**For Development (Windows):**
Run the PowerShell script:
```powershell
PowerShell -ExecutionPolicy Bypass -File generate-ssl-velink.ps1
```

**For Production (Linux Server):**
1. Upload your code to the server
2. Make the script executable:
   ```bash
   chmod +x setup-ssl-production.sh
   ```
3. Run the SSL setup script as root:
   ```bash
   sudo ./setup-ssl-production.sh
   ```

This will automatically run:
```bash
certbot certonly --standalone -d velink.me -d www.velink.me
```

**Certificate Locations:**
- Private Key: `/etc/letsencrypt/live/velink.me/privkey.pem`
- Certificate: `/etc/letsencrypt/live/velink.me/fullchain.pem`

**Auto-Renewal:**
The script automatically sets up certificate renewal via cron job.

### 🌐 Deployment Options

#### Option 1: VPS/Dedicated Server
1. Upload files to server
2. Install Node.js 18+
3. Run: `npm install --production`
4. Build client: `cd client && npm run build`
5. Start: `npm start` or use PM2

#### Option 2: Heroku
1. Add `Procfile` (already included)
2. Set environment variables in Heroku dashboard
3. Deploy via Git

#### Option 3: Docker
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN cd client && npm install && npm run build
EXPOSE 5002
CMD ["npm", "start"]
```

### 🔒 Security Recommendations

1. **Change Default Passwords**
   - Update `ADMIN_TOKEN` to a strong, unique value
   - Update `PRIVACY_ACCESS_PASSWORD`

2. **Firewall Configuration**
   - Only expose port 5002 (or your chosen port)
   - Block direct database access

3. **Regular Updates**
   - Keep Node.js and dependencies updated
   - Monitor for security vulnerabilities

4. **Backup Strategy**
   - Regular database backups
   - Environment configuration backups

### 📊 Monitoring

- Logs are stored in `server/logs/`
- Monitor disk space (database grows with links)
- Set up uptime monitoring
- Consider analytics integration

### 🎯 Performance Tips

- Enable gzip compression (handled by Express)
- Use CDN for static assets if needed
- Monitor database size and optimize queries
- Consider Redis for session management at scale

## 🚨 Pre-Launch Final Checks

1. Test custom alias creation
2. Verify password protection works
3. Check sitemap generation
4. Test admin panel functionality
5. Verify SSL certificate
6. Test link redirection
7. Check analytics tracking

## 📞 Support

Your VeLink installation is production-ready! The application includes:
- Professional admin interface
- Comprehensive link management
- Security features
- SEO optimization
- Performance optimizations

Remember to keep your environment variables secure and never commit them to version control.
