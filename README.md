# 🚀 Velink - Professional URL Shortener

<div align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-blue?style=for-the-badge" alt="Version">
  <img src="https://img.shields.io/badge/Node.js-22+-green?style=for-the-badge" alt="Node.js">
  <img src="https://img.shields.io/badge/React-18+-blue?style=for-the-badge" alt="React">
  <img src="https://img.shields.io/badge/License-MIT-red?style=for-the-badge" alt="License">
</div>

<p align="center">
  <strong>The most advanced, secure, and beautiful URL shortening platform</strong><br>
  Built with modern web technologies for maximum performance and reliability
</p>

---

## ✨ **What Makes Velink Special?**

Velink isn't just another URL shortener – it's a **complete link management platform** designed for professionals, businesses, and developers who demand the best.

### 🎯 **Key Features**

| Feature | Description |
|---------|-------------|
| 🔗 **Smart URL Shortening** | Generate beautiful, memorable short URLs with custom options |
| 📊 **Advanced Analytics** | Real-time click tracking, geographic data, and performance insights |
| 🔐 **Enterprise Security** | Password protection, expiration dates, and access controls |
| 🎨 **Beautiful Interface** | Modern, responsive design with dark/light theme support |
| ⚡ **Lightning Fast** | Optimized for speed with caching and performance monitoring |
| 🛡️ **Admin Dashboard** | Comprehensive management tools with update system |
| 🌍 **SEO Optimized** | Automatic sitemaps, meta tags, and search engine friendly |
| 📱 **Mobile Ready** | Full responsive design with PWA capabilities |

---

## 🚀 **Quick Start**

### **Prerequisites**
- **Node.js 18+** (Latest LTS recommended)
- **npm** or **yarn**
- **Git**

### **Installation**

```bash
# Clone the repository
git clone https://github.com/Velyzo/velink.git
cd velink

# Install dependencies for both server and client
npm install
cd client && npm install && cd ..

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### **Production Deployment**

```bash
# Build the application
npm run build

# Start production server
npm start
```

**🎉 Your Velink instance is now running at `https://velink.me`**
---

## ⚙️ **Configuration**

Velink uses a single `.env` file for all configuration. Here are the key settings:

### **Essential Settings**
```env
# Security - CHANGE THIS!
ADMIN_TOKEN=your-super-secure-admin-token

# Server Configuration  
PORT=80
NODE_ENV=production
DOMAIN=velink.me

# Features
ENABLE_ANALYTICS=true
ENABLE_SITEMAP=true
ENABLE_QR_CODES=true
```

### **Advanced Configuration**
```env
# Rate Limiting
RATE_LIMIT_WINDOW_MS=500
RATE_LIMIT_MAX_REQUESTS=1
DAILY_LINK_LIMIT=500

# SSL (Optional)
SSL_KEY_PATH=./ssl/private.key
SSL_CERT_PATH=./ssl/certificate.crt

# Website Protection
WEBSITE_PRIVATE=false
WEBSITE_PASSWORD=your-password
```

---

## 🛠️ **Admin Dashboard**

Access the powerful admin dashboard at `/admin` with your admin token.

### **Admin Features:**
- 📊 **System Monitoring** - Real-time health and performance metrics
- 🔄 **Update Manager** - Automated system updates with backup/rollback
- 🗃️ **Link Management** - Bulk operations and advanced filtering
- 📈 **Analytics Dashboard** - Comprehensive usage statistics
- 🔧 **System Configuration** - Runtime settings and feature toggles
- 📝 **Log Management** - System logs and debugging tools

---

## 🏗️ **Architecture**

Velink is built with a modern, scalable architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │────│  Express Server │────│ SQLite Database │
│  (Frontend UI)  │    │   (Port 80)     │    │   (velink.db)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────│  Update Manager │──────────────┘
                        │ (Cross-Platform)│
                        └─────────────────┘
```

### **Technology Stack:**
- **Frontend:** React 18, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express, SQLite, JWT Authentication
- **DevOps:** Cross-platform update system, automated backups
- **Security:** Rate limiting, CORS, Helmet, input validation

---

## 📊 **API Documentation**

Velink provides a comprehensive REST API for all operations:

### **Core Endpoints:**
```http
POST /api/shorten          # Create short URL
GET  /:shortCode           # Redirect to original URL
POST /api/verify-password  # Verify password-protected links
GET  /api/stats            # Get link statistics
```

### **Admin Endpoints:**
```http
POST /api/admin/verify           # Verify admin token
GET  /api/admin/links            # Get all links (paginated)
GET  /api/admin/update/check     # Check for updates
POST /api/admin/update/perform   # Perform system update
GET  /api/admin/system           # System information
```

**📚 Full API documentation available at `/api-docs`**

---

## 🔄 **Update System**

Velink features an advanced update management system:

### **Features:**
- ✅ **Automatic Updates** - Check and apply updates seamlessly
- 🔄 **Backup & Rollback** - Automatic backups before updates
- 🖥️ **Cross-Platform** - Works on Windows, Linux, and macOS
- 🎛️ **Admin Control** - Web-based update management
- 📊 **Health Monitoring** - System health checks during updates

### **Update Process:**
1. **Health Check** - Verify system status
2. **Backup Creation** - Automatic backup before changes
3. **Download Updates** - Fetch latest changes from repository
4. **Dependency Update** - Update npm packages
5. **Build Process** - Rebuild client application
6. **Service Restart** - Graceful service restart
7. **Verification** - Post-update health check

---

## 🛡️ **Security Features**

Velink is built with security in mind:

### **Security Measures:**
- 🔐 **Token Authentication** - Secure admin access
- 🚫 **Rate Limiting** - Protection against abuse
- 🛡️ **Input Validation** - Comprehensive input sanitization
- 🔒 **CORS Protection** - Cross-origin request filtering
- 🔑 **Password Protection** - Optional link password protection
- 📝 **Audit Logging** - Comprehensive activity logging

---

## 📈 **Performance Optimization**

Velink is optimized for maximum performance:

### **Optimizations:**
- ⚡ **Compression** - Gzip compression for all responses
- 🗄️ **Caching** - Intelligent caching strategies
- 📱 **Responsive Images** - Optimized image delivery
- 🔄 **Service Worker** - Offline functionality and caching
- 📊 **Performance Monitoring** - Real-time performance tracking
- 🎯 **Core Web Vitals** - Optimized for Google's performance metrics

---

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

### **Development Setup:**
```bash
# Fork the repository
git clone https://github.com/yourusername/velink.git
cd velink

# Create feature branch
git checkout -b feature/amazing-feature

# Install dependencies
npm install
cd client && npm install && cd ..

# Start development
npm run dev
```

### **Code Standards:**
- 📝 **TypeScript** for type safety
- 🎨 **ESLint & Prettier** for code formatting
- ✅ **Testing** required for new features
- 📚 **Documentation** for all public APIs

---

## 📄 **License**

Velink is open source software licensed under the **MIT License**.

```
MIT License - Feel free to use, modify, and distribute!
```

---

## 🆘 **Support & Documentation**

### **Getting Help:**
- 📖 **Documentation:** [Full documentation](./docs/)
- 🐛 **Issues:** [GitHub Issues](https://github.com/Velyzo/velink/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/Velyzo/velink/discussions)
- 📧 **Email:** support@velink.app

### **Resources:**
- 🎯 **Live Demo:** [demo.velink.app](https://demo.velink.app)
- 📚 **API Docs:** [api.velink.app](https://api.velink.app)
- 🎥 **Video Tutorials:** [YouTube Channel](https://youtube.com/@velink)

---

## 🌟 **Why Choose Velink?**

| Velink | Other Solutions |
|--------|-----------------|
| ✅ **Complete Solution** | ❌ Basic URL shortening only |
| ✅ **Self-Hosted** | ❌ Vendor lock-in |
| ✅ **Advanced Analytics** | ❌ Limited tracking |
| ✅ **Admin Dashboard** | ❌ No management tools |
| ✅ **Update System** | ❌ Manual updates |
| ✅ **Enterprise Security** | ❌ Basic protection |
| ✅ **Open Source** | ❌ Proprietary |
| ✅ **No Limits** | ❌ Usage restrictions |

---

<div align="center">
  <h3>⭐ Star us on GitHub if Velink helps you! ⭐</h3>
  <p>Made with ❤️ by the Velink Team</p>
  <p>
    <a href="https://github.com/Velyzo/velink">GitHub</a> •
    <a href="https://velink.app">Website</a> •
    <a href="./docs/">Documentation</a> •
    <a href="https://github.com/Velyzo/velink/issues">Support</a>
  </p>
</div>
