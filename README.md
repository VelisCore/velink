# Velink - Beautiful Link Shortener## � Quick Start

### Development Setup

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Start development:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

### 🐧 Ubuntu Server Deployment

For production deployment on Ubuntu server:

1. **Upload your VeLink files to the server**
2. **Run the automated setup script:**
   ```bash
   chmod +x ubuntu-setup.sh
   sudo ./ubuntu-setup.sh
   ```

3. **Manage your VeLink installation:**
   ```bash
   chmod +x velink-manage.sh
   ./velink-manage.sh status    # Check status
   ./velink-manage.sh logs      # View logs
   ./velink-manage.sh restart   # Restart service
   ```

The setup script automatically:
- ✅ Installs Node.js 20 LTS
- ✅ Sets up PM2 process manager
- ✅ Configures SSL with Let's Encrypt
- ✅ Creates system service with auto-startup
- ✅ Sets up firewall and security
- ✅ Configures log rotation and monitoring

📖 **Full Ubuntu Setup Guide**: See [UBUNTU-SETUP.md](UBUNTU-SETUP.md) fast, and beautiful link shortening platform built with React and Node.js.

## ✨ Features

- 🎨 Beautiful, responsive UI with smooth animations
- ⚡ Fast link shortening with minimal database footprint
- 🛡️ Rate limiting (1 link per minute per IP)
- 🔍 SEO-optimized shortened links
- 📱 Mobile-friendly design
- 🌙 Clean, modern interface
- 🔐 **NEW**: Comprehensive Admin Panel
- 📊 **NEW**: Advanced Analytics & Reporting
- 🚨 **NEW**: Security Enhancements & Vulnerability Fixes
- 📤 **NEW**: Data Export Capabilities
- 🍪 **NEW**: GDPR-Compliant Cookie Management
- ⚖️ **NEW**: Complete Legal Framework

## 🔐 Security & Compliance

### Security Features
- ✅ **Vulnerability Assessment**: All packages scanned and secured
- ✅ **Admin Authentication**: Token-based admin panel access
- ✅ **Rate Limiting**: IP-based request throttling
- ✅ **Data Validation**: Input sanitization and validation
- ✅ **HTTPS Ready**: SSL/TLS configuration support

### Legal Compliance
- ✅ **GDPR Compliant**: Complete privacy policy and data handling
- ✅ **Cookie Consent**: Interactive cookie management system
- ✅ **Data Retention**: Automatic 12-month data deletion policy
- ✅ **German Legal**: TMG § 5 compliant Impressum
- ✅ **Terms of Service**: Comprehensive user agreements

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm run install-all
   ```

2. **Start development:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 🏗️ Project Structure

```
velink/
├── client/          # React frontend
├── server/          # Node.js backend
├── README.md
└── package.json
```

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, SQLite
- **Security**: JWT tokens, Rate limiting, Input validation
- **Analytics**: Custom tracking, Export capabilities
- **Legal**: GDPR compliance, Cookie management

## 🔧 Admin Panel

Access the powerful admin panel at `/admin` with your admin token.

### Admin Features
- 📊 **Dashboard**: Overview of links, clicks, and system health
- 🔗 **Link Management**: Search, filter, edit, and delete links
- 📈 **Analytics**: Detailed statistics and data visualization
- 🖥️ **System Monitor**: Server health, memory usage, database size
- ⚙️ **Settings**: Export data, manage preferences
- 🗑️ **Bulk Actions**: Multi-select and batch operations

### Setting Up Admin Access
1. Set your admin token in environment variables:
   ```bash
   ADMIN_TOKEN=your-secure-admin-token-here
   ```
2. Access the admin panel at: `https://yoursite.com/admin`
3. Enter your admin token to authenticate

## 🔒 Security Vulnerabilities Fixed

### Client-Side Security
- ✅ **nth-check vulnerability**: Updated regex processing library
- ✅ **PostCSS vulnerability**: Fixed line return parsing errors
- ✅ **webpack-dev-server**: Patched source code exposure risks
- ✅ **SVG processing**: Updated vulnerable SVGO dependencies
- ✅ **CSS processing**: Resolved PostCSS security issues

### Server-Side Security
- ✅ **No vulnerabilities found**: All server packages are secure
- ✅ **Input validation**: Comprehensive data sanitization
- ✅ **SQL injection protection**: Parameterized queries
- ✅ **XSS protection**: Output escaping and validation

### Security Best Practices Implemented
- 🔐 **Authentication**: Secure token-based admin access
- 🚫 **Rate Limiting**: Prevents abuse and DOS attacks
- 🛡️ **HTTPS Ready**: SSL/TLS configuration support
- 📝 **Audit Logging**: Track admin actions and system events
- 🔍 **Regular Scans**: Automated vulnerability monitoring

## 📱 Screenshots

Coming soon...

## 🔧 Admin Panel

Velink includes a secure admin panel for managing links and viewing statistics.

### Access
- Visit `/admin` on your deployed instance
- Enter your admin token to authenticate
- The admin panel provides full control over shortened links

### Setup
1. **Set Admin Token**: 
   ```bash
   # Create .env file based on .env.example
   cp .env.example .env
   
   # Set your secure admin token
   ADMIN_TOKEN=your-super-secure-token-here
   ```

2. **Admin Features**:
   - 📊 Real-time statistics dashboard
   - 🔗 View all shortened links
   - 🗑️ Delete unwanted links
   - 📈 Monitor click analytics
   - 📋 Copy links to clipboard

### Security
- Token-based authentication
- Admin access only
- No user registration required
- Environment variable configuration

## 🍪 Cookie Compliance

Velink includes GDPR-compliant cookie management:

- **Essential Cookies**: Required for service functionality
- **Analytics Cookies**: Optional, for usage insights
- **User Control**: Users can accept all or essential only
- **Data Retention**: 12-month automatic deletion policy
- **IP Anonymization**: After 30 days

## 📋 Legal Compliance

- **GDPR Compliant**: Full European data protection compliance
- **German Law**: Complies with TMG § 5 (Impressum)
- **Data Deletion**: Automatic deletion after 12 months
- **Privacy Policy**: Comprehensive data handling documentation
- **Terms of Service**: Clear usage guidelines and contact information

## 🌐 API Documentation

Velink provides a comprehensive REST API for link management and analytics.

### Public Endpoints

#### Shorten Link
```bash
POST /api/shorten
Content-Type: application/json

{
  "url": "https://example.com",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "shortCode": "abc123",
  "originalUrl": "https://example.com",
  "shortUrl": "https://yourdomain.com/abc123",
  "description": "Optional description",
  "createdAt": "2025-07-21T21:50:00.000Z"
}
```

#### Get Link Info
```bash
GET /api/info/:shortCode
```

**Response:**
```json
{
  "shortCode": "abc123",
  "originalUrl": "https://example.com",
  "description": "Optional description",
  "clicks": 42,
  "createdAt": "2025-07-21T21:50:00.000Z",
  "lastClicked": "2025-07-21T22:30:00.000Z"
}
```

#### Get Public Statistics
```bash
GET /api/stats
GET /api/v1/stats
```

**Response:**
```json
{
  "totalLinks": 1234,
  "totalClicks": 5678,
  "linksToday": 12,
  "clicksToday": 89
}
```

### Admin Endpoints

All admin endpoints require the `Authorization: Bearer <token>` header.

#### Admin Authentication
```bash
POST /api/admin/verify
Content-Type: application/json

{
  "token": "your-admin-token"
}
```

#### Get All Links
```bash
GET /api/admin/links
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "unique-id",
    "shortCode": "abc123",
    "originalUrl": "https://example.com",
    "description": "Optional description",
    "clicks": 42,
    "createdAt": "2025-07-21T21:50:00.000Z",
    "lastClicked": "2025-07-21T22:30:00.000Z",
    "isActive": true
  }
]
```

#### Update Link
```bash
PUT /api/admin/links/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Updated description",
  "isActive": true
}
```

#### Delete Link
```bash
DELETE /api/admin/links/:id
Authorization: Bearer <token>
```

#### Get Analytics
```bash
GET /api/admin/analytics
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalLinks": 1234,
  "totalClicks": 5678,
  "activeLinks": 890,
  "linksToday": 12,
  "clicksByDay": [
    {
      "date": "2025-07-21",
      "links_created": 5,
      "total_clicks": 23
    }
  ],
  "topLinks": [
    {
      "shortCode": "abc123",
      "originalUrl": "https://example.com",
      "clicks": 42
    }
  ],
  "referrerStats": [
    {
      "browser": "Chrome",
      "count": 150
    }
  ],
  "countryStats": [
    {
      "country": "Germany",
      "count": 89
    }
  ]
}
```

#### Get System Information
```bash
GET /api/admin/system
Authorization: Bearer <token>
```

**Response:**
```json
{
  "uptime": 3600000,
  "memoryUsage": {
    "used": 123456789,
    "total": 987654321
  },
  "diskUsage": {
    "used": 1234567890,
    "total": 9876543210
  },
  "dbSize": 1048576,
  "activeConnections": 10,
  "version": "1.0.0"
}
```

#### Get Logs
```bash
GET /api/admin/logs?date=2025-07-21
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "timestamp": "2025-07-21T21:50:00.000Z",
    "level": "info",
    "message": "GET /api/stats - 200 (2ms)",
    "method": "GET",
    "url": "/api/stats",
    "ip": "127.0.0.1"
  }
]
```

#### Export Data
```bash
GET /api/admin/export/links
GET /api/admin/export/analytics
Authorization: Bearer <token>
```

Returns CSV formatted data for download.

#### Database Management
```bash
GET /api/admin/databases
GET /api/admin/databases/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "main",
  "name": "Main Database",
  "size": 1048576,
  "tables": [
    {
      "name": "short_urls",
      "records": 1234,
      "size": 524288
    }
  ]
}
```

### Rate Limiting

- **Public endpoints**: 1 request per minute per IP
- **Admin endpoints**: 100 requests per minute per token
- **Static files**: No limits

### Error Responses

All endpoints return standardized error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-07-21T21:50:00.000Z"
}
```

**Common Error Codes:**
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid admin token
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## 🤝 Contributing

Feel free to submit issues and pull requests!

## 📄 License

MIT License
