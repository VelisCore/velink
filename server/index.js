// Load environment variables
require('dotenv').config({ path: './.env' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const Database = require('./database');
const SitemapGenerator = require('./sitemap');
const setupApiRoutes = require('./routes/api');
const { generateShortCode, isValidUrl } = require('./utils');

// Initialize the enhanced update manager
const UpdateManager = require('./update-manager');
const updateManager = new UpdateManager();

// Set timezone to German/Berlin
process.env.TZ = 'Europe/Berlin';

// Logging system
const logLevels = ['debug', 'info', 'warn', 'error'];
const logs = [];
const MAX_LOGS_IN_MEMORY = 10000;
const LOG_RETENTION_DAYS = 7;

const log = (level, message, metadata = {}) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...metadata
  };
  
  // Add to in-memory logs
  logs.unshift(logEntry);
  if (logs.length > MAX_LOGS_IN_MEMORY) {
    logs.pop();
  }
  
  // Write to file
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(logDir, `${today}.log`);
  const logLine = `[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}${metadata.ip ? ` (${metadata.ip})` : ''}\n`;
  
  fs.appendFileSync(logFile, logLine);
  
  // Console output
  console.log(logLine.trim());
  
  // Emit to SSE clients
  if (sseClients.length > 0) {
    const sseData = `data: ${JSON.stringify(logEntry)}\n\n`;
    sseClients.forEach(client => {
      try {
        client.write(sseData);
      } catch (error) {
        // Remove dead clients
        const index = sseClients.indexOf(client);
        if (index > -1) sseClients.splice(index, 1);
      }
    });
  }
};

// SSE clients for live logs
const sseClients = [];

// Clean old logs daily
const cleanOldLogs = () => {
  const logDir = path.join(__dirname, 'logs');
  if (!fs.existsSync(logDir)) return;
  
  const files = fs.readdirSync(logDir);
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - LOG_RETENTION_DAYS);
  
  files.forEach(file => {
    const filePath = path.join(logDir, file);
    const fileDate = new Date(file.replace('.log', ''));
    
    if (fileDate < cutoffDate) {
      fs.unlinkSync(filePath);
      log('info', `Deleted old log file: ${file}`);
    }
  });
};

// Clean logs daily at midnight
setInterval(cleanOldLogs, 24 * 60 * 60 * 1000);

// Setup update manager event listeners
updateManager.on('updateLog', (data) => {
  log(data.level, `Update ${data.updateId}: ${data.message}`);
});

updateManager.on('updateComplete', (data) => {
  log('info', `Update ${data.updateId} completed ${data.success ? 'successfully' : 'with errors'} in ${data.duration}ms`);
});

updateManager.on('updateError', (data) => {
  log('error', `Update error: ${data.error}`);
});

updateManager.on('updateCancelled', (data) => {
  log('warn', `Update ${data.updateId} cancelled: ${data.reason}`);
});
cleanOldLogs(); // Clean on startup

// Privacy and maintenance middleware
const checkPrivacyAndMaintenance = (req, res, next) => {
    // Check if maintenance mode is enabled (file-based)
    const maintenanceFile = path.join(__dirname, '.maintenance');
    const isMaintenanceMode = fs.existsSync(maintenanceFile) || process.env.MAINTENANCE_MODE === 'true';
    
    if (isMaintenanceMode) {
        // Allow admin routes during maintenance
        if (req.path.startsWith('/api/admin') || req.path === '/health') {
            return next();
        }
        
        // Allow static assets
        if (req.path.match(/\.(css|js|png|jpg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
            return next();
        }
        
        // Check if request expects JSON (API call)
        const acceptsJson = req.headers.accept && req.headers.accept.includes('application/json');
        const isApiCall = req.path.startsWith('/api/') || req.xhr || acceptsJson;
        
        if (isApiCall) {
            // For API calls, return JSON response
            return res.status(503).json({
                error: 'Service Temporarily Unavailable',
                message: 'System is currently under maintenance. Please try again later.',
                maintenanceMode: true,
                retryAfter: 3600 // 1 hour in seconds
            });
        }
        
        // For browser requests, serve the React app which will handle maintenance mode
        const indexPath = path.join(__dirname, 'public', 'index.html');
        if (fs.existsSync(indexPath)) {
            return res.sendFile(indexPath);
        }
        
        // Fallback maintenance HTML if React app not available
        const maintenanceHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <title>Velink - Under Maintenance</title>
            <meta name="robots" content="noindex, nofollow" />
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                       margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                       color: white; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
                .container { text-align: center; max-width: 500px; }
                h1 { font-size: 2.5rem; margin-bottom: 1rem; }
                p { font-size: 1.1rem; margin-bottom: 2rem; opacity: 0.9; }
                .spinner { border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid white; 
                          border-radius: 50%; width: 40px; height: 40px; margin: 20px auto;
                          animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>?? Under Maintenance</h1>
                <p>Velink is currently undergoing scheduled maintenance to improve your experience.</p>
                <div class="spinner"></div>
                <p>We'll be back shortly!</p>
            </div>
        </body>
        </html>`;
        
        return res.status(503).send(maintenanceHtml);
    }
    
    // Check if website is private
    if (process.env.WEBSITE_PRIVATE === 'true') {
        // Allow admin routes and password check
        if (req.path.startsWith('/api/admin') || req.path === '/api/check-password') {
            return next();
        }
        
        // Allow static assets
        if (req.path.match(/\.(css|js|png|jpg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
            return next();
        }
        
        // Check for privacy password in header or query
        const providedPassword = req.headers['x-website-password'] || req.query.password;
        if (providedPassword !== process.env.WEBSITE_PASSWORD) {
            // Check if request expects JSON (API call)
            const acceptsJson = req.headers.accept && req.headers.accept.includes('application/json');
            const isApiCall = req.path.startsWith('/api/') || req.xhr || acceptsJson;
            
            if (isApiCall) {
                return res.status(401).json({
                    error: 'Authentication Required',
                    message: 'Access to this resource requires authentication.',
                    requiresPassword: true
                });
            }
            
            // For browser requests, serve the React app which will handle the privacy gate
            const indexPath = path.join(__dirname, 'public', 'index.html');
            if (fs.existsSync(indexPath)) {
                return res.sendFile(indexPath);
            }
            
            return res.status(401).json({
                error: 'Private Website',
                message: 'This website is private. Please provide the correct password.',
                requiresPassword: true
            });
        }
    }
    
    next();
};

const app = express();
const PORT = process.env.PORT || 80;

// Trust proxy for accurate IP detection (required for DigitalOcean)
app.set('trust proxy', 1);

// Initialize database
const db = new Database();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Rate limiting: 1 request per minute per IP for shortening
const shortenLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // limit each IP to 1 request per windowMs
  message: {
    error: 'Too many requests. You can only shorten 1 link per minute.',
    resetTime: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
});

// General rate limiting: 100 requests per minute per IP
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    error: 'Too many requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  },
});

// Apply privacy and maintenance middleware before other middleware
app.use(checkPrivacyAndMaintenance);

app.use(generalLimiter);

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'error' : res.statusCode >= 300 ? 'warn' : 'info';
    
    log(logLevel, `${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`, {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });
  });
  
  next();
});

// Password check endpoint for private mode
app.post('/api/check-password', (req, res) => {
    const { password } = req.body;
    
    if (process.env.WEBSITE_PRIVATE !== 'true') {
        return res.json({ valid: true, message: 'Website is not private' });
    }
    
    if (password === process.env.WEBSITE_PASSWORD) {
        res.json({ valid: true, message: 'Password correct' });
    } else {
        res.status(401).json({ valid: false, message: 'Invalid password' });
    }
});

// Routes

// Health check with maintenance mode detection
app.get('/health', (req, res) => {
  const maintenanceFile = path.join(__dirname, '.maintenance');
  const isMaintenanceMode = fs.existsSync(maintenanceFile);
  
  if (isMaintenanceMode) {
    res.status(503).json({ 
      status: 'MAINTENANCE', 
      message: 'Server is in maintenance mode',
      timestamp: new Date().toISOString() 
    });
  } else {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0'
    });
  }
});

// Legacy health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get detailed statistics (v1 API)
app.get('/api/v1/stats', async (req, res) => {
  try {
    const stats = await db.getDetailedStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching detailed stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Shorten URL
app.post('/api/shorten', 
  shortenLimiter,
  [
    body('url')
      .isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('Please provide a valid URL with http:// or https://')
      .isLength({ max: 2048 })
      .withMessage('URL is too long (max 2048 characters)'),
    body('expiresIn')
      .optional()
      .isIn(['1d', '7d', '30d', '365d', 'never'])
      .withMessage('Invalid expiration option'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: errors.array()[0].msg 
        });
      }

      const { url, expiresIn, customOptions } = req.body;
      const ip = req.ip || req.connection.remoteAddress;
      
      // Calculate expiration date if provided
      let expiresAt = null;
      if (expiresIn && expiresIn !== 'never') {
        const days = {
          '1d': 1,
          '7d': 7,
          '30d': 30,
          '365d': 365
        };
        
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + days[expiresIn]);
        expiresAt = expireDate.toISOString();
      }

      // Check if URL already exists (optimization) - but skip if custom alias is provided
      // Generate or use custom short code
      // Generate unique short code
      let shortCode;
      let attempts = 0;
      do {
        shortCode = generateShortCode();
        attempts++;
        if (attempts > 10) {
          throw new Error('Failed to generate unique short code');
        }
      } while (await db.findByShortCode(shortCode));
      // Save to database
      const result = await db.createShortUrl({
        shortCode,
        originalUrl: url,
        expiresAt,
        ip,
        userAgent: req.get('User-Agent') || '',
        customOptions,
        description: req.body.description
      });

      // Generate sitemap after creating new link
      sitemapGenerator.generateSitemap().catch(err => {
        console.error('Failed to update sitemap after link creation:', err);
      });

      res.status(201).json({
        shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
        shortCode,
        originalUrl: url,
        expiresAt,
        clicks: 0,
        createdAt: result.created_at,
        customOptions
      });

    } catch (error) {
      console.error('Error shortening URL:', error);
      res.status(500).json({ error: 'Failed to shorten URL' });
    }
  }
);

// Get URL info
app.get('/api/info/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const urlData = await db.findByShortCode(shortCode);
    
    if (!urlData) {
      return res.status(404).json({ error: 'Short URL not found' });
    }

    res.json({
      shortCode: urlData.short_code,
      originalUrl: urlData.original_url,
      clicks: urlData.clicks,
      createdAt: urlData.created_at
    });
  } catch (error) {
    console.error('Error fetching URL info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analytics for a specific link
app.get('/api/analytics/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const analytics = await db.getLinkAnalytics(shortCode);
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching link analytics:', error);
    if (error.message === 'Link not found') {
      return res.status(404).json({ error: 'Link not found' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin token for authentication
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'velink-admin-2025-secure-token-v2';
console.log('🔑 Admin token loaded:', ADMIN_TOKEN ? 'Yes (length: ' + ADMIN_TOKEN.length + ')' : 'No');

// Admin middleware to verify token
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  // For EventSource requests, also check query parameter
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

// Admin route to verify token
app.post('/api/admin/verify', (req, res) => {
  const { token } = req.body;
  
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  res.json({ success: true });
});

// Admin route to get all links
app.get('/api/admin/links', verifyAdminToken, async (req, res) => {
  try {
    const links = await db.getAllLinks();
    res.json(links);
  } catch (error) {
    console.error('Error fetching admin links:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route to get stats
app.get('/api/admin/stats', verifyAdminToken, async (req, res) => {
  try {
    const stats = await db.getAdminStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route to delete a link
app.delete('/api/admin/links/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // The id parameter could be either the database ID or shortCode
    // We need to find the shortCode first if we have a database ID
    let shortCode = id;
    
    // If the id looks like a number, it might be a database ID
    if (/^\d+$/.test(id)) {
      // Get the link by database ID to find the shortCode
      const links = await db.getLinks();
      const link = links.find(l => l._id?.toString() === id || l.id?.toString() === id);
      if (link) {
        shortCode = link.shortCode;
      } else {
        return res.status(404).json({ error: 'Link not found' });
      }
    }
    
    // Delete using shortCode
    await db.deleteLink(shortCode);
    
    // Generate sitemap after deleting link
    sitemapGenerator.generateSitemap().catch(err => {
      console.error('Failed to update sitemap after link deletion:', err);
    });
    
    log('info', `Link deleted: ${shortCode}`, { ip: req.ip });
    res.json({ success: true, message: 'Link deleted successfully' });
  } catch (error) {
    log('error', 'Error deleting link', { error: error.message, ip: req.ip });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route to bulk delete links
app.delete('/api/admin/links/bulk', verifyAdminToken, async (req, res) => {
  try {
    const { linkIds } = req.body;
    if (!Array.isArray(linkIds)) {
      return res.status(400).json({ error: 'linkIds must be an array' });
    }
    
    for (const id of linkIds) {
      await db.deleteLink(id);
    }
    
    // Generate sitemap after bulk deleting links
    sitemapGenerator.generateSitemap().catch(err => {
      console.error('Failed to update sitemap after bulk link deletion:', err);
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error bulk deleting links:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route to toggle link status
app.patch('/api/admin/links/:id/toggle', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.toggleLinkStatus(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error toggling link status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route to update link
app.patch('/api/admin/links/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, isActive } = req.body;
    await db.updateLink(id, { description, isActive });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route to get system information
app.get('/api/admin/system', verifyAdminToken, async (req, res) => {
  try {
    const os = require('os');
    const fs = require('fs');
    const path = require('path');
    
    const systemInfo = {
      uptime: process.uptime(),
      memoryUsage: {
        used: process.memoryUsage().heapUsed,
        total: os.totalmem()
      },
      diskUsage: {
        used: 0,
        total: 0
      },
      dbSize: 0,
      activeConnections: 1, // Simple implementation
      version: process.version
    };
    
    // Get database size
    try {
      const dbPath = process.env.DB_PATH || 'velink.db';
      const stats = fs.statSync(dbPath);
      systemInfo.dbSize = stats.size;
    } catch (err) {
      // Database file might not exist yet
    }
    
    // Get disk usage (simplified)
    try {
      const stats = fs.statSync('./');
      systemInfo.diskUsage.used = stats.size || 0;
      systemInfo.diskUsage.total = os.totalmem(); // Approximation
    } catch (err) {
      // Ignore errors
    }
    
    res.json(systemInfo);
  } catch (error) {
    console.error('Error fetching system info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route to get analytics data
app.get('/api/admin/analytics', verifyAdminToken, async (req, res) => {
  try {
    const analytics = await db.getAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route to export data
app.get('/api/admin/export/:type', verifyAdminToken, async (req, res) => {
  try {
    const { type } = req.params;
    
    if (type === 'links') {
      const links = await db.getAllLinks();
      
      // Convert to CSV
      const csvHeader = 'Short Code,Original URL,Created,Clicks,Description,Status\n';
      const csvData = links.map(link => 
        `"${link.shortCode}","${link.originalUrl}","${link.createdAt}","${link.clicks}","${link.description || ''}","${link.isActive !== false ? 'Active' : 'Inactive'}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="velink-links.csv"');
      res.send(csvHeader + csvData);
      
    } else if (type === 'analytics') {
      const analytics = await db.getAnalytics();
      
      // Convert analytics to CSV (simplified)
      const csvHeader = 'Type,Data,Count\n';
      let csvData = '';
      
      if (analytics.topReferrers) {
        csvData += analytics.topReferrers.map(r => `"Referrer","${r.domain}","${r.clicks}"`).join('\n') + '\n';
      }
      if (analytics.deviceStats) {
        csvData += analytics.deviceStats.map(d => `"Device","${d.device}","${d.count}"`).join('\n') + '\n';
      }
      if (analytics.browserStats) {
        csvData += analytics.browserStats.map(b => `"Browser","${b.browser}","${b.count}"`).join('\n');
      }
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="velink-analytics.csv"');
      res.send(csvHeader + csvData);
      
    } else {
      res.status(400).json({ error: 'Invalid export type' });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin endpoint: Get logs
app.get('/api/admin/logs', verifyAdminToken, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const logFile = path.join(__dirname, 'logs', `${targetDate}.log`);
    
    if (fs.existsSync(logFile)) {
      const logContent = fs.readFileSync(logFile, 'utf8');
      const logLines = logContent.split('\n').filter(line => line.trim());
      
      const parsedLogs = logLines.map(line => {
        const match = line.match(/\[(.*?)\] (\w+): (.*?)(?:\s\((.*?)\))?$/);
        if (match) {
          return {
            timestamp: match[1],
            level: match[2].toLowerCase(),
            message: match[3],
            ip: match[4] || null
          };
        }
        return {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: line,
          ip: null
        };
      });
      
      res.json(parsedLogs);
    } else {
      res.json([]);
    }
  } catch (error) {
    log('error', `Error loading logs: ${error.message}`);
    res.status(500).json({ error: 'Failed to load logs' });
  }
});

// Admin endpoint: Download logs
app.get('/api/admin/logs/download', verifyAdminToken, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    
    const logFile = path.join(__dirname, 'logs', `${targetDate}.log`);
    
    if (fs.existsSync(logFile)) {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="velink-logs-${targetDate}.log"`);
      res.sendFile(logFile);
    } else {
      res.status(404).json({ error: 'Log file not found' });
    }
  } catch (error) {
    log('error', `Error downloading logs: ${error.message}`);
    res.status(500).json({ error: 'Failed to download logs' });
  }
});

// Admin endpoint: Live logs stream
app.get('/api/admin/logs/stream', verifyAdminToken, (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  sseClients.push(res);
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'info',
    message: 'Live log streaming started'
  })}\n\n`);

  // Clean up on disconnect
  req.on('close', () => {
    const index = sseClients.indexOf(res);
    if (index > -1) sseClients.splice(index, 1);
  });
});

// Admin endpoint: Get databases info
app.get('/api/admin/databases', verifyAdminToken, async (req, res) => {
  try {
    const databases = [];
    
    // Main database info
    const dbPath = path.join(__dirname, 'velink.db');
    if (fs.existsSync(dbPath)) {
      const stats = fs.statSync(dbPath);
      const allLinks = await db.getAllLinks();
      
      databases.push({
        id: 'main',
        name: 'Velink Main Database',
        size: stats.size,
        tables: [
          {
            name: 'links',
            records: allLinks.length,
            size: Math.round(stats.size * 0.8) // Estimate
          },
          {
            name: 'analytics',
            records: allLinks.reduce((sum, link) => sum + link.clicks, 0),
            size: Math.round(stats.size * 0.2) // Estimate
          }
        ],
        lastModified: stats.mtime.toISOString()
      });
    }
    
    // Check for log databases
    const logDir = path.join(__dirname, 'logs');
    if (fs.existsSync(logDir)) {
      const logFiles = fs.readdirSync(logDir).filter(f => f.endsWith('.log'));
      
      let totalLogSize = 0;
      let totalLogEntries = 0;
      
      logFiles.forEach(file => {
        const filePath = path.join(logDir, file);
        const fileStats = fs.statSync(filePath);
        totalLogSize += fileStats.size;
        
        // Estimate log entries (rough calculation)
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        totalLogEntries += lines.length;
      });
      
      if (totalLogSize > 0) {
        databases.push({
          id: 'logs',
          name: 'System Logs',
          size: totalLogSize,
          tables: [
            {
              name: 'daily_logs',
              records: totalLogEntries,
              size: totalLogSize
            }
          ],
          lastModified: new Date().toISOString()
        });
      }
    }
    
    res.json(databases);
  } catch (error) {
    log('error', `Error loading databases: ${error.message}`);
    res.status(500).json({ error: 'Failed to load databases' });
  }
});

// Admin endpoint: Get database content
app.get('/api/admin/databases/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === 'main') {
      const allLinks = await db.getAllLinks();
      const analytics = await db.getAnalytics();
      
      res.json({
        tables: [
          {
            name: 'links',
            records: allLinks.length,
            size: JSON.stringify(allLinks).length
          },
          {
            name: 'analytics',
            records: analytics.clicksByDay?.length || 0,
            size: JSON.stringify(analytics).length
          }
        ],
        sampleData: {
          recentLinks: allLinks.slice(0, 5).map(link => ({
            shortCode: link.shortCode,
            originalUrl: link.originalUrl.substring(0, 50) + '...',
            clicks: link.clicks,
            createdAt: link.createdAt
          })),
          analytics: {
            totalClicks: analytics.clicksByDay?.reduce((sum, day) => sum + day.clicks, 0) || 0,
            topReferrers: analytics.topReferrers?.slice(0, 3) || []
          }
        }
      });
    } else if (id === 'logs') {
      const logDir = path.join(__dirname, 'logs');
      const logFiles = fs.existsSync(logDir) ? fs.readdirSync(logDir).filter(f => f.endsWith('.log')) : [];
      
      let sampleLogs = [];
      if (logFiles.length > 0) {
        const latestLogFile = path.join(logDir, logFiles[logFiles.length - 1]);
        const content = fs.readFileSync(latestLogFile, 'utf8');
        const lines = content.split('\n').filter(line => line.trim()).slice(0, 10);
        
        sampleLogs = lines.map(line => {
          const match = line.match(/\[(.*?)\] (\w+): (.*)/);
          return match ? {
            timestamp: match[1],
            level: match[2],
            message: match[3].substring(0, 100) + '...'
          } : line.substring(0, 100) + '...';
        });
      }
      
      res.json({
        tables: [
          {
            name: 'daily_logs',
            records: logs.length,
            size: JSON.stringify(logs).length
          }
        ],
        sampleData: {
          recentLogs: sampleLogs,
          logFiles: logFiles.map(f => ({
            filename: f,
            date: f.replace('.log', '')
          }))
        }
      });
    } else {
      res.status(404).json({ error: 'Database not found' });
    }
  } catch (error) {
    log('error', `Error loading database content: ${error.message}`);
    res.status(500).json({ error: 'Failed to load database content' });
  }
});

// Admin endpoint: Get privacy settings
app.get('/api/admin/privacy-settings', verifyAdminToken, (req, res) => {
  try {
    const privacySettings = {
      isPrivate: process.env.WEBSITE_PRIVATE === 'true',
      password: process.env.WEBSITE_PASSWORD || '',
      isMaintenanceMode: process.env.MAINTENANCE_MODE === 'true',
      maintenanceMessage: process.env.MAINTENANCE_MESSAGE || 'Website is temporarily under maintenance. Please check back later.'
    };
    
    res.json(privacySettings);
  } catch (error) {
    log('error', `Error getting privacy settings: ${error.message}`);
    res.status(500).json({ error: 'Failed to get privacy settings' });
  }
});

// Admin endpoint: Update privacy settings
app.post('/api/admin/privacy-settings', verifyAdminToken, (req, res) => {
  try {
    const { isPrivate, password, isMaintenanceMode, maintenanceMessage } = req.body;
    
    // Update environment variables (note: this won't persist across restarts without updating .env file)
    if (typeof isPrivate === 'boolean') {
      process.env.WEBSITE_PRIVATE = isPrivate.toString();
    }
    
    if (typeof password === 'string') {
      process.env.WEBSITE_PASSWORD = password;
    }
    
    if (typeof isMaintenanceMode === 'boolean') {
      process.env.MAINTENANCE_MODE = isMaintenanceMode.toString();
    }
    
    if (typeof maintenanceMessage === 'string') {
      process.env.MAINTENANCE_MESSAGE = maintenanceMessage;
    }
    
    // Write to .env file to persist changes
    const envPath = path.join(__dirname, '.env');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add environment variables in .env file
    const updateEnvVar = (key, value) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const line = `${key}=${value}`;
      
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, line);
      } else {
        envContent += `\n${line}`;
      }
    };
    
    if (typeof isPrivate === 'boolean') {
      updateEnvVar('WEBSITE_PRIVATE', isPrivate);
    }
    
    if (typeof password === 'string') {
      updateEnvVar('WEBSITE_PASSWORD', password);
    }
    
    if (typeof isMaintenanceMode === 'boolean') {
      updateEnvVar('MAINTENANCE_MODE', isMaintenanceMode);
    }
    
    if (typeof maintenanceMessage === 'string') {
      updateEnvVar('MAINTENANCE_MESSAGE', maintenanceMessage);
    }
    
    fs.writeFileSync(envPath, envContent.trim() + '\n');
    
    log('info', `Privacy settings updated by admin`);
    res.json({ success: true, message: 'Privacy settings updated successfully' });
    
  } catch (error) {
    log('error', `Error updating privacy settings: ${error.message}`);
    res.status(500).json({ error: 'Failed to update privacy settings' });
  }
});

// ==========================================
// ENHANCED UPDATE SYSTEM ENDPOINTS
// ==========================================

// Enhanced update check endpoint
app.get('/api/admin/update/check', verifyAdminToken, async (req, res) => {
  try {
    const updateInfo = await updateManager.checkForUpdates();
    res.json(updateInfo);
  } catch (error) {
    log('error', `Error checking for updates: ${error.message}`);
    res.status(500).json({ 
      success: false,
      error: 'Failed to check for updates',
      message: error.message 
    });
  }
});

// Enhanced update status endpoint
app.get('/api/admin/update/status', verifyAdminToken, async (req, res) => {
  try {
    const status = await updateManager.getUpdateStatus();
    res.json(status);
  } catch (error) {
    log('error', `Error getting update status: ${error.message}`);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get update status',
      message: error.message 
    });
  }
});

// Enhanced update perform endpoint
app.post('/api/admin/update/perform', verifyAdminToken, async (req, res) => {
  try {
    const options = {
      createBackup: req.body.createBackup !== false,
      restartServices: req.body.restartServices !== false,
      skipDependencyCheck: req.body.skipDependencyCheck === true,
      updateBranch: req.body.updateBranch || 'main',
      maintenanceMode: req.body.maintenanceMode !== false,
      notifyUsers: req.body.notifyUsers !== false,
      updateSystem: req.body.updateSystem === true,
      force: req.body.force === true,
      verbose: true
    };

    log('info', 'Admin initiated enhanced system update', { 
      ip: req.ip, 
      options 
    });

    const result = await updateManager.performUpdate(options);
    res.json(result);
  } catch (error) {
    log('error', `Error performing update: ${error.message}`, { ip: req.ip });
    res.status(500).json({ 
      success: false,
      error: 'Failed to start update',
      message: error.message 
    });
  }
});

// Cancel update endpoint
app.post('/api/admin/update/cancel', verifyAdminToken, async (req, res) => {
  try {
    const { reason = 'User cancelled' } = req.body;
    
    log('info', 'Admin cancelled update', { ip: req.ip, reason });
    
    const result = await updateManager.cancelUpdate(reason);
    res.json(result);
  } catch (error) {
    log('error', `Error cancelling update: ${error.message}`, { ip: req.ip });
    res.status(500).json({ 
      success: false,
      error: 'Failed to cancel update',
      message: error.message 
    });
  }
});

// Create backup endpoint
app.post('/api/admin/update/backup', verifyAdminToken, async (req, res) => {
  try {
    const options = {
      name: req.body.name,
      includeDatabase: req.body.includeDatabase !== false,
      includeLogs: req.body.includeLogs === true,
      description: req.body.description || 'Manual backup'
    };

    log('info', 'Admin created manual backup', { ip: req.ip, options });

    const result = await updateManager.createBackup(options);
    res.json(result);
  } catch (error) {
    log('error', `Error creating backup: ${error.message}`, { ip: req.ip });
    res.status(500).json({ 
      success: false,
      error: 'Failed to create backup',
      message: error.message 
    });
  }
});

// List backups endpoint
app.get('/api/admin/update/backups', verifyAdminToken, async (req, res) => {
  try {
    const result = await updateManager.listBackups();
    res.json(result);
  } catch (error) {
    log('error', `Error listing backups: ${error.message}`, { ip: req.ip });
    res.status(500).json({ 
      success: false,
      error: 'Failed to list backups',
      message: error.message 
    });
  }
});

// Restore from backup endpoint
app.post('/api/admin/update/restore', verifyAdminToken, async (req, res) => {
  try {
    const { backupId } = req.body;
    if (!backupId) {
      return res.status(400).json({ 
        success: false,
        error: 'Backup ID is required' 
      });
    }

    const options = {
      restoreDatabase: req.body.restoreDatabase !== false,
      restartServices: req.body.restartServices !== false,
      maintenanceMode: req.body.maintenanceMode !== false
    };

    log('info', 'Admin initiated restore from backup', { 
      ip: req.ip, 
      backupId, 
      options 
    });

    const result = await updateManager.restoreFromBackup(backupId, options);
    res.json(result);
  } catch (error) {
    log('error', `Error restoring from backup: ${error.message}`, { ip: req.ip });
    res.status(500).json({ 
      success: false,
      error: 'Failed to restore from backup',
      message: error.message 
    });
  }
});

// Maintenance mode toggle endpoint
app.post('/api/admin/maintenance', verifyAdminToken, async (req, res) => {
  try {
    const { enabled } = req.body;
    const options = {
      message: req.body.message || 'System maintenance in progress. Please try again later.',
      estimatedDuration: req.body.estimatedDuration || 600,
      allowAdminAccess: req.body.allowAdminAccess !== false
    };

    log('info', `Admin ${enabled ? 'enabled' : 'disabled'} maintenance mode`, { 
      ip: req.ip, 
      options 
    });

    const result = await updateManager.toggleMaintenanceMode(enabled, options);
    res.json(result);
  } catch (error) {
    log('error', `Error toggling maintenance mode: ${error.message}`, { ip: req.ip });
    res.status(500).json({ 
      success: false,
      error: 'Failed to toggle maintenance mode',
      message: error.message 
    });
  }
});

// System health endpoint
app.get('/api/admin/system/health', verifyAdminToken, async (req, res) => {
  try {
    const health = await updateManager.getSystemHealth();
    
    res.json({
      success: true,
      ...health,
      lastCheck: new Date().toISOString()
    });
  } catch (error) {
    log('error', `Error getting system health: ${error.message}`, { ip: req.ip });
    res.status(500).json({ 
      success: false,
      error: 'Failed to get system health',
      message: error.message 
    });
  }
});

// Enhanced update endpoints using UpdateManager
if (updateManager) {
  // Enhanced update endpoints are defined later in the file
}

// Get update progress/status
app.get('/api/admin/update/status', verifyAdminToken, async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const maintenanceFile = path.join(__dirname, '.maintenance');
    const updateLogPath = path.join(__dirname, '../update.log');
    const pidFile = path.join(__dirname, '../.update.pid');
    
    let isUpdating = fs.existsSync(pidFile);
    let maintenanceMode = fs.existsSync(maintenanceFile);
    let logs = [];
    let progress = 0;
    
    // Read recent update logs
    if (fs.existsSync(updateLogPath)) {
      try {
        const logContent = fs.readFileSync(updateLogPath, 'utf8');
        const lines = logContent.split('\n').filter(line => line.trim());
        
        // Get last 20 log entries
        logs = lines.slice(-20).map(line => {
          const timeMatch = line.match(/\[([\d-\s:]+)\]/);
          const levelMatch = line.match(/\[(\w+)\]/g);
          const level = levelMatch && levelMatch[1] ? levelMatch[1].replace(/[\[\]]/g, '') : 'INFO';
          const message = line.replace(/\[[\d-\s:]+\]\s*\[\w+\]\s*/, '');
          
          return {
            timestamp: timeMatch ? timeMatch[1] : new Date().toISOString(),
            level: level,
            message: message
          };
        });
        
        // Calculate progress based on log content
        const totalSteps = 7; // From our update script
        let completedSteps = 0;
        
        if (lines.some(line => line.includes('Prerequisites check completed'))) completedSteps++;
        if (lines.some(line => line.includes('Backup created'))) completedSteps++;
        if (lines.some(line => line.includes('Dependencies update completed'))) completedSteps++;
        if (lines.some(line => line.includes('Application build completed'))) completedSteps++;
        if (lines.some(line => line.includes('Database update completed'))) completedSteps++;
        if (lines.some(line => line.includes('Health check completed'))) completedSteps++;
        if (lines.some(line => line.includes('Update completed successfully'))) completedSteps++;
        
        progress = Math.round((completedSteps / totalSteps) * 100);
        
      } catch (logError) {
        log('warn', `Failed to read update logs: ${logError.message}`);
      }
    }
    
    res.json({
      isUpdating,
      maintenanceMode,
      progress,
      logs,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    log('error', `Error getting update status: ${error.message}`);
    res.status(500).json({ error: 'Failed to get update status' });
  }
});

// Perform system update with enhanced options
app.post('/api/admin/update/perform', verifyAdminToken, async (req, res) => {
  try {
    const { spawn } = require('child_process');
    const path = require('path');
    const fs = require('fs');
    
    const { 
      skipBackup = false, 
      forceUpdate = false, 
      autoRestart = true,
      updateSystem = false 
    } = req.body;
    
    log('info', 'Admin initiated system update with options:', { skipBackup, forceUpdate, autoRestart, updateSystem });
    
    // Check if update script exists
    const updateScript = path.join(__dirname, '../update.sh');
    if (!fs.existsSync(updateScript)) {
      return res.status(400).json({ 
        error: 'Update script not found. Make sure update.sh exists in the project root.' 
      });
    }
    
    // Check if another update is already running
    const pidFile = path.join(__dirname, '../.update.pid');
    if (fs.existsSync(pidFile)) {
      return res.status(409).json({
        error: 'Another update is already in progress. Please wait for it to complete.'
      });
    }
    
    // Enable maintenance mode
    const maintenanceFile = path.join(__dirname, '.maintenance');
    fs.writeFileSync(maintenanceFile, JSON.stringify({
      enabled: true,
      reason: 'System update in progress',
      startTime: new Date().toISOString(),
      estimatedDuration: '5-10 minutes'
    }));
    log('info', 'Maintenance mode enabled for update');
    
    // Build update command with options
    let updateArgs = [];
    
    if (skipBackup) updateArgs.push('--skip-backup');
    if (forceUpdate) updateArgs.push('--force');
    if (autoRestart) updateArgs.push('--auto-start');
    if (updateSystem) updateArgs.push('--update-system');
    updateArgs.push('--verbose'); // Always use verbose for admin updates
    
    res.json({ 
      message: 'Update started successfully. Velink is now in maintenance mode.',
      status: 'Update in progress - Maintenance mode active',
      maintenanceMode: true,
      options: { skipBackup, forceUpdate, autoRestart, updateSystem }
    });
    
    // Run update in background
    setTimeout(() => {
      const updateProcess = spawn('bash', [updateScript, ...updateArgs], {
        cwd: path.join(__dirname, '..'),
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { 
          ...process.env, 
          ADMIN_UPDATE: 'true',
          UPDATE_SOURCE: 'admin_panel'
        }
      });
      
      // Create update log specifically for this admin update
      const adminUpdateLog = path.join(__dirname, '../admin-update.log');
      const logStream = fs.createWriteStream(adminUpdateLog, { flags: 'a' });
      
      // Log update output
      updateProcess.stdout.on('data', (data) => {
        const output = data.toString().trim();
        log('info', `Update output: ${output}`);
        logStream.write(`${new Date().toISOString()} [STDOUT] ${output}\n`);
      });
      
      updateProcess.stderr.on('data', (data) => {
        const output = data.toString().trim();
        log('error', `Update error: ${output}`);
        logStream.write(`${new Date().toISOString()} [STDERR] ${output}\n`);
      });
      
      updateProcess.on('close', (code) => {
        logStream.end();
        
        if (code === 0) {
          log('info', 'Update completed successfully');
          
          // Update maintenance mode with completion status
          if (fs.existsSync(maintenanceFile)) {
            fs.writeFileSync(maintenanceFile, JSON.stringify({
              enabled: false,
              reason: 'Update completed successfully',
              completedTime: new Date().toISOString(),
              autoRestart: autoRestart
            }));
          }
          
          if (autoRestart) {
            log('info', 'Auto-restart enabled, exiting for restart...');
            setTimeout(() => {
              process.exit(0);
            }, 2000);
          } else {
            // Remove maintenance mode if not auto-restarting
            try {
              fs.unlinkSync(maintenanceFile);
              log('info', 'Maintenance mode disabled - manual restart required');
            } catch (err) {
              log('error', `Failed to remove maintenance file: ${err.message}`);
            }
          }
        } else {
          log('error', `Update failed with exit code: ${code}`);
          
          // Remove maintenance mode if update fails
          try {
            fs.unlinkSync(maintenanceFile);
            log('info', 'Maintenance mode disabled due to update failure');
          } catch (err) {
            log('error', `Failed to remove maintenance file: ${err.message}`);
          }
        }
      });
      
      updateProcess.unref();
      log('info', 'Update process started in background');
      
    }, 1000);
    
  } catch (error) {
    // Remove maintenance mode on error
    try {
      const maintenanceFile = path.join(__dirname, '.maintenance');
      if (fs.existsSync(maintenanceFile)) {
        fs.unlinkSync(maintenanceFile);
      }
    } catch (err) {
      log('error', `Failed to remove maintenance file: ${err.message}`);
    }
    
    log('error', `Error performing update: ${error.message}`);
    res.status(500).json({ 
      error: 'Failed to perform update: ' + error.message,
      maintenanceMode: false
    });
  }
});

// Cancel ongoing update
app.post('/api/admin/update/cancel', verifyAdminToken, async (req, res) => {
  try {
    const { execSync } = require('child_process');
    const fs = require('fs');
    const path = require('path');
    
    const pidFile = path.join(__dirname, '../.update.pid');
    const maintenanceFile = path.join(__dirname, '.maintenance');
    
    if (fs.existsSync(pidFile)) {
      try {
        // Kill update process
        execSync(`pkill -f "update.sh"`, { stdio: 'pipe' });
        fs.unlinkSync(pidFile);
        log('info', 'Update process cancelled by admin');
      } catch (killError) {
        log('warn', `Failed to kill update process: ${killError.message}`);
      }
    }
    
    // Remove maintenance mode
    if (fs.existsSync(maintenanceFile)) {
      fs.unlinkSync(maintenanceFile);
      log('info', 'Maintenance mode disabled - update cancelled');
    }
    
    res.json({
      message: 'Update cancelled successfully',
      maintenanceMode: false
    });
    
  } catch (error) {
    log('error', `Error cancelling update: ${error.message}`);
    res.status(500).json({ error: 'Failed to cancel update' });
  }
});

// Create backup manually
app.post('/api/admin/update/backup', verifyAdminToken, async (req, res) => {
  try {
    const { spawn } = require('child_process');
    const path = require('path');
    const fs = require('fs');
    
    const updateScript = path.join(__dirname, '../update.sh');
    if (!fs.existsSync(updateScript)) {
      return res.status(400).json({ 
        error: 'Update script not found' 
      });
    }
    
    log('info', 'Admin initiated manual backup');
    
    const backupProcess = spawn('bash', [updateScript, '--backup-only'], {
      cwd: path.join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let output = '';
    let error = '';
    
    backupProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    backupProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    backupProcess.on('close', (code) => {
      if (code === 0) {
        log('info', 'Manual backup completed successfully');
        res.json({
          message: 'Backup created successfully',
          output: output.trim()
        });
      } else {
        log('error', `Manual backup failed with code: ${code}`);
        res.status(500).json({
          error: 'Backup failed',
          details: error.trim() || output.trim()
        });
      }
    });
    
    // Set timeout for backup process
    setTimeout(() => {
      if (!backupProcess.killed) {
        backupProcess.kill();
        res.status(408).json({ error: 'Backup process timed out' });
      }
    }, 120000); // 2 minutes timeout
    
  } catch (error) {
    log('error', `Error creating backup: ${error.message}`);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Restore from backup
app.post('/api/admin/update/restore', verifyAdminToken, async (req, res) => {
  try {
    const { spawn } = require('child_process');
    const path = require('path');
    const fs = require('fs');
    
    const updateScript = path.join(__dirname, '../update.sh');
    if (!fs.existsSync(updateScript)) {
      return res.status(400).json({ 
        error: 'Update script not found' 
      });
    }
    
    log('info', 'Admin initiated backup restoration');
    
    const restoreProcess = spawn('bash', [updateScript, '--restore'], {
      cwd: path.join(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let output = '';
    let error = '';
    
    restoreProcess.stdout.on('data', (data) => {
      output += data.toString();
    });
    
    restoreProcess.stderr.on('data', (data) => {
      error += data.toString();
    });
    
    restoreProcess.on('close', (code) => {
      if (code === 0) {
        log('info', 'Backup restoration completed successfully');
        res.json({
          message: 'Backup restored successfully. Please restart the service.',
          output: output.trim(),
          requiresRestart: true
        });
      } else {
        log('error', `Backup restoration failed with code: ${code}`);
        res.status(500).json({
          error: 'Backup restoration failed',
          details: error.trim() || output.trim()
        });
      }
    });
    
    // Set timeout for restore process
    setTimeout(() => {
      if (!restoreProcess.killed) {
        restoreProcess.kill();
        res.status(408).json({ error: 'Restore process timed out' });
      }
    }, 120000); // 2 minutes timeout
    
  } catch (error) {
    log('error', `Error restoring backup: ${error.message}`);
    res.status(500).json({ error: 'Failed to restore backup' });
  }
});

// Track click endpoint for confirmation page
app.post('/api/track/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    const urlData = await db.findByShortCode(shortCode);
    
    if (!urlData) {
      return res.status(404).json({ error: 'Short code not found' });
    }

    // Increment click count
    await db.incrementClicks(shortCode);
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from React app
let clientBuildPath;

if (fs.existsSync(path.resolve(__dirname, '../client/build'))) {
  clientBuildPath = path.resolve(__dirname, '../client/build');
} else if (fs.existsSync(path.resolve(__dirname, 'public'))) {
  clientBuildPath = path.resolve(__dirname, 'public');
} else {
  console.warn('Warning: Could not find client build directory');
  clientBuildPath = path.resolve(__dirname, '../client/build'); // Default fallback
}

console.log(`Serving static files from: ${clientBuildPath}`);

// Enhanced Update System Endpoints (if available)
try {
  const UpdateManager = require('./update-manager');
  const updateManager = new UpdateManager();
  
  // Enhanced update check endpoint
  app.get('/api/admin/update/enhanced/check', verifyAdminToken, async (req, res) => {
    try {
      const updateInfo = await updateManager.checkForUpdates();
      res.json(updateInfo);
    } catch (error) {
      log('error', `Enhanced update check failed: ${error.message}`);
      res.status(500).json({ 
        success: false,
        error: 'Enhanced update check failed',
        message: error.message 
      });
    }
  });

  // Enhanced update status endpoint
  app.get('/api/admin/update/enhanced/status', verifyAdminToken, async (req, res) => {
    try {
      const status = await updateManager.getUpdateStatus();
      res.json(status);
    } catch (error) {
      log('error', `Enhanced update status failed: ${error.message}`);
      res.status(500).json({ 
        success: false,
        error: 'Failed to get enhanced update status',
        message: error.message 
      });
    }
  });

  // Enhanced update perform endpoint
  app.post('/api/admin/update/enhanced/perform', verifyAdminToken, async (req, res) => {
    try {
      const options = {
        createBackup: req.body.createBackup !== false,
        restartServices: req.body.restartServices !== false,
        updateSystem: req.body.updateSystem === true,
        force: req.body.force === true,
        verbose: true
      };

      log('info', 'Enhanced update initiated', { ip: req.ip, options });
      const result = await updateManager.performUpdate(options);
      res.json(result);
    } catch (error) {
      log('error', `Enhanced update failed: ${error.message}`, { ip: req.ip });
      res.status(500).json({ 
        success: false,
        error: 'Enhanced update failed',
        message: error.message 
      });
    }
  });

  // System health endpoint
  app.get('/api/admin/system/enhanced/health', verifyAdminToken, async (req, res) => {
    try {
      const health = await updateManager.getSystemHealth();
      res.json({
        success: true,
        ...health,
        lastCheck: new Date().toISOString()
      });
    } catch (error) {
      log('error', `Enhanced health check failed: ${error.message}`);
      res.status(500).json({ 
        success: false,
        error: 'Enhanced health check failed',
        message: error.message 
      });
    }
  });

  log('info', 'Enhanced update system endpoints registered');
} catch (error) {
  log('warn', `Enhanced update system not available: ${error.message}`);
}

// Set up API routes
app.use('/api/v1', setupApiRoutes(db));

// Special routes that must be handled before static files
// Sitemap route
app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
  
  if (fs.existsSync(sitemapPath)) {
    res.set({
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Last-Modified': fs.statSync(sitemapPath).mtime.toUTCString()
    });
    res.sendFile(sitemapPath);
  } else {
    // Generate sitemap on the fly if it doesn't exist
    sitemapGenerator.generateSitemap()
      .then(() => {
        if (fs.existsSync(sitemapPath)) {
          res.set({
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600',
            'Last-Modified': fs.statSync(sitemapPath).mtime.toUTCString()
          });
          res.sendFile(sitemapPath);
        } else {
          res.status(404).send('Sitemap not found');
        }
      })
      .catch(err => {
        console.error('Error generating sitemap:', err);
        res.status(500).send('Error generating sitemap');
      });
  }
});

// Robots.txt route
app.get('/robots.txt', (req, res) => {
  res.set('Content-Type', 'text/plain; charset=utf-8');
  res.send(`User-agent: *
Allow: /
Allow: /features
Allow: /api-docs
Allow: /privacy
Allow: /terms
Allow: /impressum

# Disallow admin and analytics pages
Disallow: /admin
Disallow: /analytics/

# Sitemap location
Sitemap: https://velink.me/sitemap.xml

# Crawl delay for bots
Crawl-delay: 1`);
});

// Serve static files
app.use(express.static(clientBuildPath));

// Redirect short URL (placed after static files to avoid conflicts with React routes)
app.get('/:shortCode', async (req, res, next) => {
  try {
    const { shortCode } = req.params;
    
    // Skip API routes and sitemap
    if (shortCode.startsWith('api') || shortCode === 'sitemap.xml') {
      return next();
    }

    // Skip known React routes
    const knownRoutes = ['admin', 'privacy', 'terms', 'impressum', 'analytics', 'docs'];
    if (knownRoutes.includes(shortCode)) {
      return next();
    }

    const urlData = await db.findByShortCode(shortCode);
    
    if (!urlData) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Link Not Found - Velink</title>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
              background: #f8fafc; 
              color: #1e293b; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh;
            }
            .container { 
              max-width: 450px; 
              margin: 20px auto; 
              background: white; 
              border-radius: 16px; 
              padding: 48px 32px; 
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
              text-align: center;
            }
              font-size: 1.125rem;
              line-height: 1.6;
            }
            .back-link { 
              display: inline-flex;
              align-items: center;
              gap: 8px;
              color: #3b82f6; 
              text-decoration: none; 
              font-weight: 600;
              font-size: 1rem;
              padding: 12px 24px;
              border-radius: 8px;
              background: #eff6ff;
              border: 1px solid #dbeafe;
              transition: all 0.2s ease;
            }
            .back-link:hover { 
              background: #dbeafe;
              border-color: #93c5fd;
              transform: translateY(-1px);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <span class="icon">🔗</span>
            <h1>Link Not Found</h1>
            <p>The short link you're looking for doesn't exist or has expired.</p>
            <a href="/" class="back-link">
              ← Back to Velink
            </a>
          </div>
        </body>
        </html>
      `);
    }

    // Check if the link has expired
    if (urlData.expires_at && new Date(urlData.expires_at) < new Date()) {
      return res.status(410).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Link Expired - Velink</title>
          <style>
            body { 
              margin: 0; 
              padding: 0; 
              font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
              background: #f8fafc; 
              color: #1e293b; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh;
            }
            .container { 
              max-width: 450px; 
              margin: 20px auto; 
              background: white; 
              border-radius: 16px; 
              padding: 48px 32px; 
              box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
              text-align: center;
            }
            .icon {
              font-size: 4rem;
              margin-bottom: 24px;
              color: #f59e0b;
              display: block;
            }
            h1 { 
              font-size: 1.875rem;
              font-weight: 700;
              color: #1e293b; 
              margin: 0 0 16px 0;
              line-height: 1.25;
            }
            p { 
              color: #64748b; 
              margin: 0 0 32px 0;
              font-size: 1.125rem;
              line-height: 1.6;
            }
            .back-link { 
              display: inline-flex;
              align-items: center;
              gap: 8px;
              color: #3b82f6; 
              text-decoration: none; 
              font-weight: 600;
              font-size: 1rem;
              padding: 12px 24px;
              border-radius: 8px;
              background: #eff6ff;
              border: 1px solid #dbeafe;
              transition: all 0.2s ease;
            }
            .back-link:hover { 
              background: #dbeafe;
              border-color: #93c5fd;
              transform: translateY(-1px);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <span class="icon">⏰</span>
            <h1>Link Expired</h1>
            <p>This short link has expired and is no longer accessible.</p>
            <a href="/" class="back-link">
              <span>←</span>
              Back to Velink
            </a>
          </div>
        </body>
        </html>
      `);
    }

    // Increment click count and redirect
    await db.incrementClicks(shortCode);
    res.redirect(302, urlData.original_url);

  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).send('Internal server error');
  }
});

// For all routes except API and short URLs, serve the React app
app.get('*', (req, res, next) => {
  // Skip API routes and sitemap
  if (req.path.startsWith('/api/') || req.path === '/sitemap.xml') {
    return next();
  }
  
  // Skip if it looks like a short URL (no special characters, reasonable length)
  // But allow known React routes like /admin, /privacy, /terms
  const knownRoutes = ['/admin', '/privacy', '/terms', '/impressum', '/analytics', '/docs'];
  const isKnownRoute = knownRoutes.some(route => req.path.startsWith(route));
  const looksLikeShortUrl = req.path.length <= 8 && req.path.match(/^\/[a-zA-Z0-9\-_]+$/) && !isKnownRoute;
  
  if (looksLikeShortUrl) {
    return next();
  }
  
  const indexPath = path.join(clientBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not found. Please build the client first.');
  }
});

// Initialize and generate sitemap with forced production URL
const sitemapGenerator = new SitemapGenerator(
  db,
  'https://velink.me' // Always use production URL for sitemap
);

// Generate sitemap on startup
sitemapGenerator.generateSitemap();

// Regenerate sitemap every hour
setInterval(() => {
  sitemapGenerator.generateSitemap();
}, 60 * 60 * 1000);

// Admin authentication middleware
const adminAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const adminToken = process.env.ADMIN_TOKEN || 'admin';
  
  if (!token || token !== adminToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// Admin token verification endpoint
app.post('/api/admin/verify', (req, res) => {
  const { token } = req.body;
  const adminToken = process.env.ADMIN_TOKEN || 'admin';
  
  if (token === adminToken) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Admin - Get all links
app.get('/api/admin/links', adminAuth, async (req, res) => {
  try {
    const links = await db.getAllLinks();
    const transformedLinks = links.map(link => ({
      _id: link.id,
      shortCode: link.short_code,
      originalUrl: link.original_url,
      createdAt: link.created_at,
      clicks: link.clicks || 0,
      lastClicked: link.last_clicked,
      isActive: link.is_active !== 0,
      description: link.description,
      expiresAt: link.expires_at,
      password: link.custom_options ? JSON.parse(link.custom_options).password : null
    }));
    res.json(transformedLinks);
  } catch (error) {
    log('error', 'Error fetching admin links', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Get stats
app.get('/api/admin/stats', adminAuth, async (req, res) => {
  try {
    const stats = await db.getStats();
    res.json(stats);
  } catch (error) {
    log('error', 'Error fetching admin stats', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Get system info
app.get('/api/admin/system', adminAuth, (req, res) => {
  try {
    const stats = process.memoryUsage();
    const systemInfo = {
      uptime: process.uptime(),
      memoryUsage: {
        used: stats.heapUsed,
        total: stats.heapTotal
      },
      diskUsage: {
        used: 0, // Would need disk usage library
        total: 1000000000 // 1GB placeholder
      },
      dbSize: fs.existsSync(path.join(__dirname, 'velink.db')) ? 
        fs.statSync(path.join(__dirname, 'velink.db')).size : 0,
      activeConnections: 1, // Placeholder
      version: require('../package.json').version || '1.0.0'
    };
    res.json(systemInfo);
  } catch (error) {
    log('error', 'Error fetching system info', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Get analytics
app.get('/api/admin/analytics', adminAuth, async (req, res) => {
  try {
    const analytics = await db.getAnalytics();
    res.json(analytics);
  } catch (error) {
    log('error', 'Error fetching analytics', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Get logs
app.get('/api/admin/logs', adminAuth, (req, res) => {
  try {
    const { date } = req.query;
    
    if (date) {
      // Read logs from file for specific date
      const logFile = path.join(__dirname, 'logs', `${date}.log`);
      if (fs.existsSync(logFile)) {
        const logContent = fs.readFileSync(logFile, 'utf8');
        const logEntries = logContent.split('\n')
          .filter(line => line.trim())
          .map(line => {
            const match = line.match(/\[(.*?)\] (.*?): (.*)/);
            if (match) {
              return {
                timestamp: match[1],
                level: match[2].toLowerCase(),
                message: match[3]
              };
            }
            return null;
          })
          .filter(entry => entry)
          .reverse();
        
        res.json(logEntries);
      } else {
        res.json([]);
      }
    } else {
      // Return recent in-memory logs
      res.json(logs.slice(0, 1000));
    }
  } catch (error) {
    log('error', 'Error fetching logs', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Live log streaming
app.get('/api/admin/logs/stream', (req, res) => {
  const token = req.query.token;
  const adminToken = process.env.ADMIN_TOKEN || 'admin';
  
  if (!token || token !== adminToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });
  
  // Send existing logs first
  logs.slice(0, 50).forEach(logEntry => {
    res.write(`data: ${JSON.stringify(logEntry)}\n\n`);
  });
  
  // Set up log streaming (simplified for this example)
  const interval = setInterval(() => {
    if (logs.length > 0) {
      const latestLog = logs[0];
      res.write(`data: ${JSON.stringify(latestLog)}\n\n`);
    }
  }, 1000);
  
  req.on('close', () => {
    clearInterval(interval);
  });
});

// Admin - Download logs
app.get('/api/admin/logs/download', adminAuth, (req, res) => {
  try {
    const { date } = req.query;
    const logFile = path.join(__dirname, 'logs', `${date}.log`);
    
    if (fs.existsSync(logFile)) {
      res.download(logFile, `velink-logs-${date}.txt`);
    } else {
      res.status(404).json({ error: 'Log file not found' });
    }
  } catch (error) {
    log('error', 'Error downloading logs', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Get databases
app.get('/api/admin/databases', adminAuth, (req, res) => {
  try {
    const databases = [{
      id: 'main',
      name: 'Velink Database',
      size: fs.existsSync(path.join(__dirname, 'velink.db')) ? 
        fs.statSync(path.join(__dirname, 'velink.db')).size : 0,
      tables: [
        { name: 'urls', records: 0, size: 0 },
        { name: 'clicks', records: 0, size: 0 }
      ],
      lastModified: fs.existsSync(path.join(__dirname, 'velink.db')) ? 
        fs.statSync(path.join(__dirname, 'velink.db')).mtime.toISOString() : new Date().toISOString()
    }];
    
    res.json(databases);
  } catch (error) {
    log('error', 'Error fetching databases', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Get database content
app.get('/api/admin/databases/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === 'main') {
      const links = await db.getAllLinks();
      res.json({
        name: 'Velink Database',
        tables: {
          urls: links.slice(0, 50), // Limit for performance
          meta: {
            total_links: links.length,
            total_clicks: links.reduce((sum, link) => sum + (link.clicks || 0), 0)
          }
        }
      });
    } else {
      res.status(404).json({ error: 'Database not found' });
    }
  } catch (error) {
    log('error', 'Error fetching database content', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Delete link
app.delete('/api/admin/links/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find link by ID first
    const link = await db.findById(id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    await db.deleteLink(link.short_code);
    
    // Generate sitemap after deleting link
    sitemapGenerator.generateSitemap().catch(err => {
      console.error('Failed to update sitemap after admin link deletion:', err);
    });
    
    log('info', `Admin deleted link: ${link.short_code}`);
    res.json({ success: true });
  } catch (error) {
    log('error', 'Error deleting link', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Bulk delete links
app.delete('/api/admin/links/bulk', adminAuth, async (req, res) => {
  try {
    const { linkIds } = req.body;
    
    for (const id of linkIds) {
      const link = await db.findById(id);
      if (link) {
        await db.deleteLink(link.short_code);
      }
    }
    
    // Generate sitemap after bulk deleting links
    sitemapGenerator.generateSitemap().catch(err => {
      console.error('Failed to update sitemap after admin bulk link deletion:', err);
    });
    
    log('info', `Admin bulk deleted ${linkIds.length} links`);
    res.json({ success: true });
  } catch (error) {
    log('error', 'Error bulk deleting links', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Toggle link status
app.patch('/api/admin/links/:id/toggle', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const link = await db.findById(id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    await db.toggleLinkStatus(link.short_code);
    log('info', `Admin toggled link status: ${link.short_code}`);
    res.json({ success: true });
  } catch (error) {
    log('error', 'Error toggling link status', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Update link
app.patch('/api/admin/links/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;
    
    const link = await db.findById(id);
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }
    
    await db.updateLinkDescription(link.short_code, description);
    log('info', `Admin updated link description: ${link.short_code}`);
    res.json({ success: true });
  } catch (error) {
    log('error', 'Error updating link', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin - Export data
app.get('/api/admin/export/:type', adminAuth, async (req, res) => {
  try {
    const { type } = req.params;
    
    if (type === 'links') {
      const links = await db.getAllLinks();
      const csv = 'Short Code,Original URL,Created At,Clicks,Last Clicked\n' +
        links.map(link => 
          `"${link.short_code}","${link.original_url}","${link.created_at}","${link.clicks || 0}","${link.last_clicked || ''}"`
        ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="velink-links.csv"');
      res.send(csv);
    } else if (type === 'analytics') {
      const analytics = await db.getAnalytics();
      const csv = 'Date,Links Created,Total Clicks\n' +
        (analytics.clicksByDay || []).map(day => 
          `"${day.date}","${day.links_created}","${day.total_clicks}"`
        ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="velink-analytics.csv"');
      res.send(csv);
    } else {
      res.status(400).json({ error: 'Invalid export type' });
    }
  } catch (error) {
    log('error', 'Error exporting data', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Privacy settings endpoints
app.get('/api/admin/privacy-settings', adminAuth, (req, res) => {
  try {
    const envPath = path.join(__dirname, '..', '.env');
    const settings = {
      isPrivate: process.env.WEBSITE_PRIVATE === 'true',
      password: process.env.WEBSITE_PASSWORD || '',
      isMaintenanceMode: process.env.MAINTENANCE_MODE === 'true',
      maintenanceMessage: process.env.MAINTENANCE_MESSAGE || 'Website is under maintenance'
    };
    res.json(settings);
  } catch (error) {
    log('error', 'Error fetching privacy settings', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/admin/privacy-settings', adminAuth, (req, res) => {
  try {
    const { isPrivate, password, isMaintenanceMode, maintenanceMessage } = req.body;
    const envPath = path.join(__dirname, '..', '.env');
    
    // Read current .env file
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }
    
    // Update or add environment variables
    const updateEnvVar = (content, key, value) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      const line = `${key}=${value}`;
      
      if (regex.test(content)) {
        return content.replace(regex, line);
      } else {
        return content + (content.endsWith('\n') ? '' : '\n') + line + '\n';
      }
    };
    
    if (isPrivate !== undefined) {
      envContent = updateEnvVar(envContent, 'WEBSITE_PRIVATE', isPrivate.toString());
      process.env.WEBSITE_PRIVATE = isPrivate.toString();
    }
    
    if (password !== undefined) {
      envContent = updateEnvVar(envContent, 'WEBSITE_PASSWORD', password);
      process.env.WEBSITE_PASSWORD = password;
    }
    
    if (isMaintenanceMode !== undefined) {
      envContent = updateEnvVar(envContent, 'MAINTENANCE_MODE', isMaintenanceMode.toString());
      process.env.MAINTENANCE_MODE = isMaintenanceMode.toString();
    }
    
    if (maintenanceMessage !== undefined) {
      envContent = updateEnvVar(envContent, 'MAINTENANCE_MESSAGE', maintenanceMessage);
      process.env.MAINTENANCE_MESSAGE = maintenanceMessage;
    }
    
    // Write back to .env file
    fs.writeFileSync(envPath, envContent);
    
    log('info', 'Admin updated privacy settings');
    res.json({ success: true });
  } catch (error) {
    log('error', 'Error updating privacy settings', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bug Report Endpoints
app.post('/api/bug-reports', [
  body('title').notEmpty().trim().isLength({ min: 5, max: 200 }),
  body('description').notEmpty().trim().isLength({ min: 10, max: 2000 }),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('type').optional().isIn(['bug', 'feature', 'improvement', 'question']),
  body('email').optional().isEmail(),
  body('steps').optional().isLength({ max: 1000 }),
  body('expected').optional().isLength({ max: 1000 }),
  body('actual').optional().isLength({ max: 1000 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const clientIp = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress || 
                     (req.connection.socket ? req.connection.socket.remoteAddress : null);

    const bugReportData = {
      title: req.body.title,
      description: req.body.description,
      severity: req.body.severity || 'medium',
      type: req.body.type || 'bug',
      email: req.body.email || null,
      steps: req.body.steps || null,
      expected: req.body.expected || null,
      actual: req.body.actual || null,
      ip_address: clientIp,
      user_agent: req.headers['user-agent']
    };

    const result = await db.createBugReport(bugReportData);
    
    log('info', `Bug report created: ${req.body.title}`, { 
      id: result.id, 
      type: req.body.type,
      severity: req.body.severity,
      ip: clientIp 
    });

    res.status(201).json({
      success: true,
      id: result.id,
      message: 'Bug report submitted successfully'
    });
  } catch (error) {
    log('error', 'Error creating bug report', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route to get bug reports
app.get('/api/admin/bug-reports', verifyAdminToken, async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      type: req.query.type,
      severity: req.query.severity,
      limit: req.query.limit ? parseInt(req.query.limit) : undefined
    };

    const bugReports = await db.getBugReports(filters);
    res.json(bugReports);
  } catch (error) {
    log('error', 'Error fetching bug reports', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route to update bug report status
app.patch('/api/admin/bug-reports/:id', verifyAdminToken, [
  body('status').isIn(['open', 'in_progress', 'closed', 'resolved'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await db.updateBugReportStatus(id, status);
    
    if (updated) {
      log('info', `Bug report ${id} status updated to ${status}`);
      res.json({ success: true, message: 'Bug report status updated' });
    } else {
      res.status(404).json({ error: 'Bug report not found' });
    }
  } catch (error) {
    log('error', 'Error updating bug report status', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin route to get bug report statistics
app.get('/api/admin/bug-report-stats', verifyAdminToken, async (req, res) => {
  try {
    const stats = await db.getBugReportStats();
    res.json(stats);
  } catch (error) {
    log('error', 'Error fetching bug report stats', { error: error.message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ 
      error: 'API endpoint not found',
      path: req.path,
      method: req.method 
    });
  } else {
    // For non-API routes, let React handle the 404
    const indexPath = path.join(clientBuildPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Application not found. Please build the client first.');
    }
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Don't log stack trace for 404s
  if (error.status !== 404) {
    console.error(error.stack);
  }
  
  // API error responses
  if (req.path.startsWith('/api/')) {
    const status = error.status || 500;
    const message = error.message || 'Internal Server Error';
    
    res.status(status).json({
      error: message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  } else {
    // For non-API routes, send generic error page
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Server Error - Velink</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #e74c3c; margin-bottom: 20px; }
          p { color: #666; line-height: 1.6; }
          .button { display: inline-block; background: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 20px; }
          .button:hover { background: #2980b9; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚨 Server Error</h1>
          <p>Something went wrong on our servers. We're working to fix this issue.</p>
          <p>Please try refreshing the page or come back later.</p>
          <a href="/" class="button">← Go Home</a>
        </div>
      </body>
      </html>
    `);
  }
});

// Start the server
const startServer = () => {
  // Start HTTP server
  http.createServer(app).listen(PORT, () => {
    console.log(`🚀 Velink HTTP server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  });

  // Start HTTPS server if SSL certificates are available
  const sslOptions = {
    key: process.env.SSL_KEY_PATH ? fs.readFileSync(process.env.SSL_KEY_PATH) : null,
    cert: process.env.SSL_CERT_PATH ? fs.readFileSync(process.env.SSL_CERT_PATH) : null
  };

  if (sslOptions.key && sslOptions.cert) {
    const HTTPS_PORT = process.env.HTTPS_PORT || 443;
    https.createServer(sslOptions, app).listen(HTTPS_PORT, () => {
      console.log(`🔒 Velink HTTPS server running on port ${HTTPS_PORT}`);
    });
  } else {
    console.log('⚠️ SSL certificates not found. HTTPS server not started.');
    console.log('To enable HTTPS, set SSL_KEY_PATH and SSL_CERT_PATH environment variables.');
  }
};

startServer();








