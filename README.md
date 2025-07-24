<div align="center">
  <img src="client/public/logo512.png" alt="Velink Logo" width="120" height="120" />
  
  # 🔗 Velink
  ### Professional URL Shortener & Analytics Platform
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  [![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/React-19+-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Express](https://img.shields.io/badge/Express-4+-000000.svg?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

  **Transform long URLs into powerful, trackable short links with enterprise-grade analytics**
  
  [🚀 Quick Start](#-quick-start) • [📖 Documentation](#-api--documentation) • [🎯 Features](#-features) • [🛡️ Security](#-security--privacy)
</div>

---

## ✨ Why Choose Velink?

<table>
<tr>
<td width="50%">

### 🎯 **Powerful Features**
- **Smart URL Shortening** with custom aliases
- **Real-time Analytics** & comprehensive dashboards  
- **QR Code Generation** for every short link
- **Bulk Operations** for enterprise workflows
- **Advanced Admin Panel** with full control
- **RESTful API** with interactive documentation

</td>
<td width="50%">

### 🛡️ **Enterprise Ready**
- **GDPR Compliant** with privacy controls
- **Rate Limiting** & abuse protection
- **Secure Authentication** with bearer tokens
- **Comprehensive Logging** & audit trails
- **Backup & Restore** automation
- **SSL Support** & security headers

</td>
</tr>
</table>

---

## 🚀 Quick Start

### � Prerequisites
```bash
# Required
Node.js 18+    # JavaScript runtime
npm/yarn       # Package manager
Git            # Version control

# Optional
SSL Certificates  # For HTTPS (production)
```

### ⚡ Installation & Setup

```bash
# 1️⃣ Clone the repository
git clone https://github.com/velyzo/velink.git
cd velink

# 2️⃣ Install dependencies
npm install

# 3️⃣ Configure environment (see configuration section)
cp server/.env.example server/.env
# Edit server/.env with your settings

# 4️⃣ Start development servers
npm run dev

# 🎉 You're ready!
# Frontend: http://localhost:3000
# Backend:  http://localhost:80
# Admin:    http://localhost:3000/admin
```

### 🔑 Admin Access
```bash
# Default admin token (change in production!)
velink-admin-2025-secure-token-v2

# Access admin panel at: /admin
# API authentication: Authorization: Bearer YOUR_TOKEN
```

---

## 🎯 Features

<details>
<summary><b>🔗 Core URL Management</b></summary>

| Feature | Description | Status |
|---------|-------------|--------|
| **URL Shortening** | Transform long URLs into short, memorable links | ✅ |
| **Custom Aliases** | Create branded short links with custom names | ✅ |
| **Bulk Operations** | Shorten multiple URLs simultaneously | ✅ |
| **Link Expiration** | Set automatic expiration dates for links | ✅ |
| **Password Protection** | Secure links with password requirements | ✅ |
| **QR Code Generation** | Automatic QR codes for all short links | ✅ |

</details>

<details>
<summary><b>📊 Analytics & Reporting</b></summary>

| Feature | Description | Status |
|---------|-------------|--------|
| **Real-time Dashboard** | Live statistics and performance metrics | ✅ |
| **Click Tracking** | Detailed analytics for every click | ✅ |
| **Geographic Data** | Location-based click analytics | ✅ |
| **Referrer Analysis** | Track traffic sources and referrers | ✅ |
| **Device & Browser Stats** | Comprehensive device analytics | ✅ |
| **Export Capabilities** | JSON/CSV export for all data | ✅ |

</details>

<details>
<summary><b>🔄 Automated Update System</b></summary>

| Feature | Description | Status |
|---------|-------------|--------|
| **One-Click Updates** | Automated system updates via admin panel | ✅ |
| **Update Monitoring** | Real-time progress tracking with live logs | ✅ |
| **Backup & Restore** | Automatic backups before updates with restore capability | ✅ |
| **Ubuntu Optimization** | Specially optimized for Ubuntu/Linux environments | ✅ |
| **Service Management** | Automatic service restart and health validation | ✅ |
| **Maintenance Mode** | Automatic maintenance mode during updates | ✅ |
| **Rollback Protection** | Automatic rollback on failed updates | ✅ |
| **Health Monitoring** | Comprehensive system health checks | ✅ |

</details>

<details>
<summary><b>🛡️ Security & Privacy</b></summary>

| Feature | Description | Status |
|---------|-------------|--------|
| **GDPR Compliance** | Privacy-first with consent management | ✅ |
| **Rate Limiting** | Configurable request limiting | ✅ |
| **Admin Authentication** | Secure bearer token authentication | ✅ |
| **Security Headers** | Helmet.js security headers | ✅ |
| **SSL Support** | HTTPS with custom certificates | ✅ |
| **Audit Logging** | Comprehensive activity logging | ✅ |

</details>

<details>
<summary><b>🔧 Admin & Management</b></summary>

| Feature | Description | Status |
|---------|-------------|--------|
| **Advanced Admin Panel** | Complete management interface | ✅ |
| **User Management** | Monitor and manage user activity | ✅ |
| **System Monitoring** | Real-time system health metrics | ✅ |
| **Log Management** | View and download system logs | ✅ |
| **Bug Report System** | Built-in issue tracking | ✅ |
| **Database Management** | Backup, restore, and maintenance | ✅ |

</details>

---

## ⚙️ Configuration

### 🔧 Environment Variables

Create `server/.env` with your configuration:

<details>
<summary><b>📝 Complete Configuration Template</b></summary>

```env
# 🔐 Admin Authentication
ADMIN_TOKEN=velink-admin-2025-secure-token-v2

# 🚀 Server Configuration
PORT=80
NODE_ENV=development

# 💾 Database Configuration
DATABASE_PATH=./velink.db

# 🛡️ Security Configuration
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # Max requests per window

# 🌐 CORS Configuration
CORS_ORIGIN=http://localhost:3000

# 🔒 SSL Configuration (Production)
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt

# 📝 Logging Configuration
LOG_LEVEL=info
LOG_RETENTION_DAYS=7
MAX_LOGS_IN_MEMORY=10000

# ⚡ Features Configuration
ENABLE_ANALYTICS=true
ENABLE_SITEMAP=true
ENABLE_QR_CODES=true

# 🔧 Performance Configuration
COMPRESSION_ENABLED=true
STATIC_CACHE_MAX_AGE=86400

# 🚧 Maintenance Mode
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE=Velink is currently under maintenance.
```

</details>

### 📊 Configuration Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| **Development** | Full logging, auto-reload, debugging | Local development |
| **Testing** | In-memory DB, mock services | Automated testing |
| **Production** | Optimized performance, SSL, caching | Live deployment |

---

## 🚀 API & Documentation

### 📖 Interactive Documentation
Visit `/api-docs` for complete interactive API documentation with:
- **Live API playground** - Test endpoints directly  
- **Comprehensive code examples** in multiple languages
- **Authentication guide** with bearer token setup
- **Complete response schemas** for all endpoints
- **Update system management** with real-time monitoring

### 🎯 API Categories

| Category | Endpoints | Features |
|----------|-----------|----------|
| **🌐 Public API** | 5 endpoints | URL shortening, analytics, link management |
| **🛡️ Admin API** | 10+ endpoints | Full system control, user management, analytics |
| **🔄 Update System** | 8 endpoints | Automated updates, backup/restore, maintenance |
| **📊 System Health** | 3 endpoints | Real-time monitoring, performance metrics |

### 🔥 Quick API Examples

<details>
<summary><b>🌐 Basic URL Shortening - JavaScript/Fetch</b></summary>

```javascript
// Shorten URL
const response = await fetch('http://localhost:80/api/shorten', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://example.com/very-long-url',
    expiresIn: '30d'
  })
});

const data = await response.json();
console.log('Short URL:', data.shortUrl);
console.log('QR Code:', data.qrCode);
```

</details>

<details>
<summary><b>� System Update Management - JavaScript</b></summary>

```javascript
// Check for system updates
const updateCheck = await fetch('http://localhost:80/api/admin/update/check', {
  headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' }
});

const updateData = await updateCheck.json();
if (updateData.updateAvailable) {
  console.log(`Update available: v${updateData.latestVersion}`);
  
  // Start update process
  const updateResponse = await fetch('http://localhost:80/api/admin/update/perform', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_ADMIN_TOKEN',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      createBackup: true,
      maintenanceMode: true,
      restartServices: true
    })
  });
  
  const updateResult = await updateResponse.json();
  console.log('Update started:', updateResult.updateId);
}
```

</details>

<details>
<summary><b>📊 System Health Monitoring - JavaScript</b></summary>

```javascript
// Get comprehensive system health
const healthResponse = await fetch('http://localhost:80/api/admin/system/health', {
  headers: { 'Authorization': 'Bearer YOUR_ADMIN_TOKEN' }
});

const health = await healthResponse.json();
console.log(`System Status: ${health.status}`);
console.log(`Uptime: ${health.uptime}`);
console.log(`Memory Usage: ${health.system.memory.used}/${health.system.memory.total}`);
console.log(`CPU Usage: ${health.system.cpu.usage}%`);
console.log(`Disk Usage: ${health.system.disk.percentage}%`);
```

</details>

<details>
<summary><b>🐍 Python SDK Example</b></summary>

```python
import requests

class VelinkAPI:
    def __init__(self, base_url, admin_token=None):
        self.base_url = base_url
        self.admin_token = admin_token
    
    def shorten_url(self, url, expires_in="30d"):
        response = requests.post(f"{self.base_url}/api/shorten", json={
            'url': url,
            'expiresIn': expires_in
        })
        return response.json()
    
    def check_system_health(self):
        headers = {'Authorization': f'Bearer {self.admin_token}'}
        response = requests.get(f"{self.base_url}/api/admin/system/health", 
                              headers=headers)
        return response.json()
    
    def start_system_update(self, options=None):
        if options is None:
            options = {
                'createBackup': True,
                'maintenanceMode': True,
                'restartServices': True
            }
        
        headers = {
            'Authorization': f'Bearer {self.admin_token}',
            'Content-Type': 'application/json'
        }
        response = requests.post(f"{self.base_url}/api/admin/update/perform",
                               json=options, headers=headers)
        return response.json()

# Usage
api = VelinkAPI("http://localhost:80", "your-admin-token")

# Basic usage
result = api.shorten_url("https://example.com/long-url")
print(f"Short URL: {result['shortUrl']}")

# Admin usage
health = api.check_system_health()
print(f"System Status: {health['status']}")
```

</details>

<details>
<summary><b>💻 cURL Commands</b></summary>

```bash
# Shorten URL
curl -X POST "http://localhost:80/api/shorten" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/very-long-url", "expiresIn": "30d"}'

# Check system health (Admin)
curl -X GET "http://localhost:80/api/admin/system/health" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Start system update (Admin)
curl -X POST "http://localhost:80/api/admin/update/perform" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"createBackup": true, "maintenanceMode": true, "restartServices": true}'

# Monitor update progress (Admin)
curl -X GET "http://localhost:80/api/admin/update/status" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Get statistics
curl "http://localhost:80/api/info/abc123"

# Admin operations
curl -X GET "http://localhost:80/api/admin/links" \
  -H "Authorization: Bearer velink-admin-2025-secure-token-v2"
```

</details>

### 🔗 API Endpoints Overview

| Endpoint | Method | Description | Auth |
|----------|--------|-------------|------|
| `/api/shorten` | POST | Create short URL | ❌ |
| `/api/info/:code` | GET | Get link information | ❌ |
| `/api/stats` | GET | Global statistics | ❌ |
| `/api/admin/links` | GET | List all links | ✅ |
| `/api/admin/stats` | GET | Detailed analytics | ✅ |

---

## 📋 Available Scripts

<div align="center">

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run dev` | 🚀 Start development servers | Development |
| `npm run build` | 📦 Build for production | Deployment |
| `npm run start` | ▶️ Start production server | Production |
| `.\update.bat` | 🔄 Update with backup | Maintenance |

</div>

### 🛠️ Advanced Scripts

<details>
<summary><b>🔄 Update & Maintenance</b></summary>

```bash
# Windows
.\update.bat               # Full update with backup
.\update.bat --start       # Update and auto-start
.\update.bat --backup-only # Create backup only
.\update.bat --restore     # Restore from backup
.\update.bat --health-check # System health check

# Linux/macOS
./update.sh               # Full update with backup
./update.sh --start       # Update and auto-start
./update.sh --backup-only # Create backup only
./update.sh --restore     # Restore from backup
```

</details>

---

## 🛡️ Security & Privacy

### 🔒 Security Features

<table>
<tr>
<td width="33%">

**🛡️ Protection**
- Rate limiting
- CORS protection
- Security headers
- Input validation
- SQL injection prevention

</td>
<td width="33%">

**🔐 Authentication**
- Bearer token auth
- Secure admin access
- Session management
- Token validation
- Role-based access

</td>
<td width="33%">

**📊 Privacy**
- GDPR compliance
- Data anonymization
- Consent management
- Privacy controls
- Data retention

</td>
</tr>
</table>

### 🔧 Security Configuration

```env
# Rate limiting
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # Max requests

# SSL Configuration
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt

# Security headers automatically applied via Helmet.js
```

---

## 🚀 Deployment

### 🐳 Docker Deployment

<details>
<summary><b>📦 Docker Setup</b></summary>

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 80
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t velink .
docker run -p 80:80 -v $(pwd)/data:/app/server velink
```

</details>

### 🌐 Manual Deployment

<details>
<summary><b>⚙️ Production Setup</b></summary>

```bash
# 1. Build application
npm run build

# 2. Configure environment
cp server/.env.example server/.env
# Edit production settings

# 3. Start production server
npm start

# 4. Configure reverse proxy (nginx example)
server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

</details>

### ☁️ Cloud Deployment

| Platform | Guide | Difficulty |
|----------|-------|------------|
| **Vercel** | One-click deploy | 🟢 Easy |
| **Netlify** | Git integration | 🟢 Easy |
| **Railway** | Auto-deploy | 🟡 Medium |
| **AWS** | EC2/ECS setup | 🔴 Advanced |
| **DigitalOcean** | Droplet setup | 🟡 Medium |

---

## 📈 Performance & Monitoring

### ⚡ Performance Features

<div align="center">

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Compression** | Gzip/Brotli compression | 📉 Reduced bandwidth |
| **Caching** | Static file caching | ⚡ Faster load times |
| **Database Optimization** | Indexed queries | 🚀 Quick responses |
| **CDN Ready** | Optimized assets | 🌍 Global performance |

</div>

### 📊 Monitoring & Metrics

```bash
# Health endpoint
GET /api/health

# Response:
{
  "status": "healthy",
  "uptime": 86400,
  "memory": { "used": 45.2, "total": 512 },
  "database": "connected"
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

<details>
<summary><b>🛠️ Development Workflow</b></summary>

```bash
# 1. Fork the repository
git fork https://github.com/velyzo/velink.git

# 2. Create feature branch
git checkout -b feature/amazing-feature

# 3. Make changes and test
npm run dev
npm test

# 4. Commit changes
git commit -m "feat: add amazing feature"

# 5. Push and create PR
git push origin feature/amazing-feature
```

</details>

### 🐛 Bug Reports

Found a bug? Use our built-in bug report system:
- 🌐 **Web Interface**: Visit `/bug-report`
- 📧 **Email**: [mail@velyzo.de](mailto:mail@velyzo.de)
- 🐛 **GitHub Issues**: [Create Issue](https://github.com/velyzo/velink/issues)

---

## 📄 License & Support

<div align="center">

### 📜 License
This project is licensed under the **MIT License** - see [LICENSE](LICENSE) for details.

### 🆘 Get Help

<table>
<tr>
<td align="center" width="25%">
  <img src="https://img.icons8.com/color/48/000000/api.png" width="32" /><br>
  <b>API Docs</b><br>
  <a href="/api-docs">Interactive Docs</a>
</td>
<td align="center" width="25%">
  <img src="https://img.icons8.com/color/48/000000/bug.png" width="32" /><br>
  <b>Bug Reports</b><br>
  <a href="/bug-report">Report Issues</a>
</td>
<td align="center" width="25%">
  <img src="https://img.icons8.com/color/48/000000/email.png" width="32" /><br>
  <b>Email Support</b><br>
  <a href="mailto:mail@velyzo.de">Contact Us</a>
</td>
<td align="center" width="25%">
  <img src="https://img.icons8.com/color/48/000000/github.png" width="32" /><br>
  <b>GitHub</b><br>
  <a href="https://github.com/velyzo/velink">View Source</a>
</td>
</tr>
</table>

</div>

---

## 🎉 Changelog

<details>
<summary><b>🔄 Version History</b></summary>

### 🚀 v2.0.0 (Current)
- ✅ Complete .env configuration system
- ✅ Advanced update scripts with fallbacks  
- ✅ Enhanced bug reporting system
- ✅ Improved admin panel with fixed actions
- ✅ Better error handling and logging
- ✅ Performance optimizations
- ✅ Professional README with better styling
- ✅ Fixed link deletion and admin actions

### 📦 v1.0.0
- ✅ Initial release
- ✅ Basic URL shortening
- ✅ Admin panel
- ✅ API documentation

</details>

---

<div align="center">
  
### 🌟 Star us on GitHub if Velink helped you!

**Built with ❤️ by [Velyzo](https://github.com/velyzo)**

*Transform your URLs, amplify your reach* 🚀

---

[![GitHub Stars](https://img.shields.io/github/stars/velyzo/velink?style=social)](https://github.com/velyzo/velink)
[![GitHub Forks](https://img.shields.io/github/forks/velyzo/velink?style=social)](https://github.com/velyzo/velink)
[![GitHub Issues](https://img.shields.io/github/issues/velyzo/velink?style=social)](https://github.com/velyzo/velink/issues)

</div>

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# SSL Configuration (optional)
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt

# Logging Configuration
LOG_LEVEL=info
LOG_RETENTION_DAYS=7
MAX_LOGS_IN_MEMORY=10000

# Features Configuration
ENABLE_ANALYTICS=true
ENABLE_SITEMAP=true
ENABLE_QR_CODES=true

# Performance Configuration
COMPRESSION_ENABLED=true
STATIC_CACHE_MAX_AGE=86400

# Maintenance Mode
MAINTENANCE_MODE=false
MAINTENANCE_MESSAGE=Velink is currently under maintenance.
```

### Admin Access

The admin token is configured in your `.env` file. Use this token to access:
- **Admin Panel**: Enter the token at `/admin`
- **API Calls**: Use as `Authorization: Bearer YOUR_TOKEN`

## 📋 Scripts

### Development
```bash
npm run dev          # Start both frontend and backend
npm run server       # Start only backend server
npm run client       # Start only frontend client
```

### Production
```bash
npm run build        # Build for production
npm run start        # Start production server
```

### Updates & Maintenance
```bash
# Windows
.\update.bat         # Full update with backup
.\update.bat --start # Update and auto-start

# Linux/macOS
./update.sh          # Full update with backup
./update.sh --start  # Update and auto-start
```

### Utility Scripts
```bash
# Backup only
.\update.bat --backup-only

# Restore from backup
.\update.bat --restore

# Health check
.\update.bat --health-check

# Cleanup old files
.\update.bat --cleanup
```

## 🔧 API Usage

### Basic Examples

#### Create Short URL
```bash
curl -X POST "http://localhost:80/api/shorten" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/very-long-url",
    "expiresIn": "30d"
  }'
```

#### Get Link Statistics
```bash
curl "http://localhost:80/api/info/abc123"
```

#### Admin Operations
```bash
curl -X GET "http://localhost:80/api/admin/links" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### JavaScript SDK
```javascript
const VelinkAPI = {
  baseUrl: 'http://localhost:80',
  
  async shortenUrl(url, options = {}) {
    const response = await fetch(`${this.baseUrl}/api/shorten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, ...options })
    });
    return response.json();
  }
};

// Usage
const result = await VelinkAPI.shortenUrl('https://example.com');
console.log(result.shortUrl);
```

## 📊 Features Overview

### Dashboard
- Real-time statistics
- Click analytics
- Performance monitoring
- User activity tracking

### Link Management
- Bulk operations
- Custom aliases
- Expiration settings
- Password protection
- Active/inactive toggling

### Analytics
- Geographic data
- Referrer tracking
- Device statistics
- Browser analytics
- Time-based metrics

### Admin Panel
- **System Monitoring** - Real-time health metrics and performance data
- **Update Management** - One-click system updates with progress monitoring
- **Backup & Restore** - Automated backup creation and restore capabilities
- **User Management** - Complete user and link administration
- **Log Viewing** - Real-time log streaming and historical log access
- **Database Management** - Database operations and maintenance
- **Configuration Updates** - Dynamic system configuration management
- **Maintenance Mode** - System maintenance mode control with custom messaging
- **Service Management** - Service status monitoring and restart capabilities

## 🛡️ Security Features

### Rate Limiting
- Configurable request limits
- Per-IP tracking
- Sliding window algorithm
- Graceful degradation

### Authentication
- Bearer token authentication
- Secure admin access
- Session management
- Token validation

### Privacy
- GDPR compliance
- Data anonymization
- Privacy controls
- Consent management

## 🚀 Deployment

### Docker Deployment
```dockerfile
# Dockerfile included for easy deployment
docker build -t velink .
docker run -p 80:80 velink
```

### Manual Deployment
1. Build the application: `npm run build`
2. Configure environment variables
3. Start the server: `npm start`
4. Configure reverse proxy (nginx/Apache)

### Environment-Specific Configurations
- **Development**: Auto-reload, detailed logging
- **Production**: Compression, caching, SSL
- **Testing**: In-memory database, mock services

## 📈 Performance

### Optimizations
- **Compression**: Gzip/Brotli compression
- **Caching**: Static file caching
- **Database**: SQLite with optimized queries
- **CDN Ready**: Static asset optimization

### Monitoring
- **Health Endpoints**: `/api/health`
- **Metrics**: Response times, error rates
- **Logging**: Structured logging with rotation
- **Alerts**: Error tracking and notifications

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Bug Reports
Use the built-in bug report system at `/bug-report` or create a GitHub issue.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Complete API docs at `/api-docs`
- **Bug Reports**: Built-in system at `/bug-report`
- **Email**: [mail@velyzo.de](mailto:mail@velyzo.de)
- **GitHub**: [Issues](https://github.com/velyzo/velink/issues)

## 🔄 Changelog

### v2.0.0 (Latest)
- ✅ Complete .env configuration system
- ✅ Advanced update scripts with fallbacks
- ✅ Improved bug reporting system
- ✅ Enhanced admin panel
- ✅ Better error handling and logging
- ✅ Performance optimizations

### v1.0.0
- ✅ Initial release
- ✅ Basic URL shortening
- ✅ Admin panel
- ✅ API documentation

---

<div align="center">
  <strong>Built with ❤️ by <a href="https://github.com/velyzo">Velyzo</a></strong>
</div>
