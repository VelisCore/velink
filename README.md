# 🔗 Velink - Advanced URL Shortener

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19+-blue.svg)](https://reactjs.org/)

A powerful, feature-rich URL shortener with advanced analytics, admin panel, and comprehensive API.

## ✨ Features

### 🎯 Core Features
- **URL Shortening** - Create short, memorable links
- **QR Code Generation** - Automatic QR codes for all short links
- **Custom Aliases** - Create branded short links
- **Bulk Operations** - Shorten multiple URLs at once
- **Link Expiration** - Set custom expiration dates
- **Password Protection** - Secure links with passwords

### 📊 Analytics & Reporting
- **Real-time Analytics** - Track clicks, referrers, and locations
- **Comprehensive Dashboard** - Visual charts and statistics
- **Click Tracking** - Detailed click analytics
- **Export Data** - Export analytics in JSON/CSV formats
- **Performance Metrics** - Server and database monitoring

### 🛡️ Security & Privacy
- **Rate Limiting** - Protect against abuse
- **GDPR Compliance** - Privacy-first approach
- **Admin Authentication** - Secure admin panel access
- **Content Security** - Helmet.js security headers
- **Environment Configuration** - Secure .env-based configuration

### 🔧 Admin Features
- **Advanced Admin Panel** - Complete control interface
- **Bug Report System** - Built-in issue tracking
- **User Management** - Monitor and manage users
- **System Monitoring** - Real-time system health
- **Log Management** - Comprehensive logging system

### 🚀 API & Integration
- **RESTful API** - Complete API with documentation
- **Interactive Playground** - Test API endpoints live
- **Multiple SDKs** - JavaScript, Python, cURL examples
- **Webhook Support** - Real-time notifications

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/velyzo/velink.git
   cd velink
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   # Copy and edit the environment file
   cp server/.env.example server/.env
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - **Frontend**: http://localhost:3000
   - **Backend**: http://localhost:80
   - **Admin Panel**: http://localhost:3000/admin
   - **API Docs**: http://localhost:3000/api-docs

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```env
# Admin Authentication
ADMIN_TOKEN=your-secure-admin-token-here

# Server Configuration
PORT=80
NODE_ENV=development

# Database Configuration
DATABASE_PATH=./velink.db

# Security Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

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
- System monitoring
- User management
- Log viewing
- Database management
- Configuration updates

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
