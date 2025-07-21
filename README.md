# Velink - Beautiful Link Shortener 🔗

A modern, fast, and beautiful link shortening platform built with React and Node.js.

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

## 🤝 Contributing

Feel free to submit issues and pull requests!

## 📄 License

MIT License
