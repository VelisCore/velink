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

const app = express();
const PORT = process.env.PORT || 5000;

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

app.use(generalLimiter);

// Routes

// Health check
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
      .withMessage('Invalid expiration option')
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

      // Check if URL already exists (optimization)
      const existing = await db.findByUrl(url);
      if (existing) {
        // If the URL exists but we want a different expiration, create a new one
        if ((expiresAt && !existing.expires_at) || 
            (expiresAt && existing.expires_at && new Date(expiresAt).getTime() !== new Date(existing.expires_at).getTime())) {
          // Continue to create a new short URL with the new expiration
        } else {
          return res.json({
            shortUrl: `${req.protocol}://${req.get('host')}/${existing.short_code}`,
            shortCode: existing.short_code,
            originalUrl: existing.original_url,
            clicks: existing.clicks,
            expiresAt: existing.expires_at,
            createdAt: existing.created_at,
            customOptions: existing.custom_options ? JSON.parse(existing.custom_options) : null
          });
        }
      }

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

      res.status(201).json({
        shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
        shortCode,
        originalUrl: url,
        expiresAt,
        clicks: 0,
        createdAt: result.created_at,
        customOptions,
        creationSecret: result.creation_secret // Include the secret for ownership verification
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
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'velink-admin-2025-secure-token';

// Admin middleware to verify token
const verifyAdminToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

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
    await db.deleteLink(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting link:', error);
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
      const dbPath = process.env.DB_PATH || '../data/velink.db';
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

// ==========================================
// GDPR DATA ACCESS ENDPOINTS
// ==========================================

// Rate limiting for GDPR requests
const gdprLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute per IP
  message: {
    error: 'Too many GDPR requests. Please wait before trying again.',
    resetTime: 60
  }
});

// GDPR: Get user data by short codes they created
app.post('/api/gdpr/my-data', gdprLimiter, async (req, res) => {
  try {
    const { shortCodes } = req.body;
    
    if (!Array.isArray(shortCodes) || shortCodes.length === 0) {
      return res.status(400).json({ 
        error: 'Please provide an array of short codes you created' 
      });
    }

    if (shortCodes.length > 50) {
      return res.status(400).json({ 
        error: 'Maximum 50 short codes allowed per request' 
      });
    }

    const userData = await db.getUserDataByShortCodes(shortCodes);
    
    if (userData.links.length === 0) {
      return res.status(404).json({ 
        error: 'No data found for the provided short codes' 
      });
    }

    // Format response according to GDPR requirements
    const gdprResponse = {
      dataController: {
        name: 'Devin Oldenburg',
        email: 'devin.oldenburg@icloud.com',
        phone: '+49 15733791807'
      },
      dataSubject: {
        estimatedLinks: userData.links.length,
        totalClicks: userData.totalClicks,
        dataRetentionPolicy: '12 months automatic deletion'
      },
      personalData: {
        links: userData.links.map(link => ({
          shortCode: link.short_code,
          originalUrl: link.original_url,
          createdAt: link.created_at,
          expiresAt: link.expires_at,
          clicks: link.clicks,
          description: link.description,
          isActive: link.is_active !== false,
          lastAccessed: link.last_accessed
        })),
        analytics: userData.analytics.map(click => ({
          shortCode: click.short_code,
          clickedAt: click.clicked_at,
          referrer: click.referrer,
          country: click.country,
          deviceType: click.device_type,
          browser: click.browser,
          ipAddress: click.ip_address ? '[ANONYMIZED]' : null
        }))
      },
      rights: {
        access: 'You can request your data anytime using this endpoint',
        rectification: 'Contact us to correct any inaccurate information',
        erasure: 'Use the delete endpoint or contact us for immediate deletion',
        portability: 'Data provided in JSON format for easy export',
        objection: 'Contact us to object to data processing'
      },
      generatedAt: new Date().toISOString(),
      requestSource: req.ip || 'unknown'
    };

    res.json(gdprResponse);
    
  } catch (error) {
    console.error('Error fetching GDPR data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GDPR: Delete user data by short codes
app.delete('/api/gdpr/delete-my-data', gdprLimiter, async (req, res) => {
  try {
    const { shortCodes, creationSecrets, confirmDeletion } = req.body;
    
    if (!confirmDeletion) {
      return res.status(400).json({ 
        error: 'Please confirm deletion by setting confirmDeletion to true' 
      });
    }

    if (!Array.isArray(shortCodes) || shortCodes.length === 0) {
      return res.status(400).json({ 
        error: 'Please provide an array of short codes to delete' 
      });
    }

    if (!Array.isArray(creationSecrets) || creationSecrets.length === 0) {
      return res.status(400).json({ 
        error: 'Please provide creation secrets to verify ownership of the links' 
      });
    }

    if (shortCodes.length !== creationSecrets.length) {
      return res.status(400).json({ 
        error: 'Number of short codes must match number of creation secrets' 
      });
    }

    if (shortCodes.length > 50) {
      return res.status(400).json({ 
        error: 'Maximum 50 short codes allowed per request' 
      });
    }

    // Verify ownership before deletion
    const verification = await db.verifyShortCodeOwnership(shortCodes, creationSecrets);
    
    if (!verification.isFullyVerified) {
      return res.status(403).json({ 
        error: 'Ownership verification failed',
        details: `Could not verify ownership of: ${verification.unverified.join(', ')}`,
        verified: verification.verified,
        unverified: verification.unverified
      });
    }

    const deletionResults = await db.deleteUserDataByShortCodes(verification.verified);
    
    res.json({
      success: true,
      deleted: {
        links: deletionResults.linksDeleted,
        analytics: deletionResults.analyticsDeleted
      },
      verifiedCodes: verification.verified,
      message: 'Your data has been permanently deleted',
      deletedAt: new Date().toISOString(),
      dataRetentionCompliance: 'All associated data has been removed from our systems'
    });
    
  } catch (error) {
    console.error('Error deleting GDPR data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GDPR: Request data rectification
app.patch('/api/gdpr/rectify-data', gdprLimiter, async (req, res) => {
  try {
    const { shortCode, corrections } = req.body;
    
    if (!shortCode || !corrections) {
      return res.status(400).json({ 
        error: 'Please provide shortCode and corrections object' 
      });
    }

    // Only allow updating description and active status
    const allowedFields = ['description'];
    const updateData = {};
    
    for (const field of allowedFields) {
      if (corrections[field] !== undefined) {
        updateData[field] = corrections[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        error: 'No valid corrections provided. You can only update: description' 
      });
    }

    const updated = await db.rectifyUserData(shortCode, updateData);
    
    if (!updated) {
      return res.status(404).json({ 
        error: 'Short code not found or you do not have permission to modify it' 
      });
    }

    res.json({
      success: true,
      message: 'Data has been corrected',
      shortCode,
      correctedFields: Object.keys(updateData),
      correctedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error rectifying GDPR data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GDPR: Export user data in portable format
app.post('/api/gdpr/export-data', gdprLimiter, async (req, res) => {
  try {
    const { shortCodes, format = 'json' } = req.body;
    
    if (!Array.isArray(shortCodes) || shortCodes.length === 0) {
      return res.status(400).json({ 
        error: 'Please provide an array of short codes you created' 
      });
    }

    const userData = await db.getUserDataByShortCodes(shortCodes);
    
    if (userData.links.length === 0) {
      return res.status(404).json({ 
        error: 'No data found for the provided short codes' 
      });
    }

    if (format === 'csv') {
      // Export as CSV
      const csvHeader = 'Short Code,Original URL,Created At,Clicks,Description,Status\n';
      const csvData = userData.links.map(link => 
        `"${link.short_code}","${link.original_url}","${link.created_at}","${link.clicks}","${link.description || ''}","${link.is_active !== false ? 'Active' : 'Inactive'}"`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="velink-my-data-${Date.now()}.csv"`);
      res.send(csvHeader + csvData);
      
    } else {
      // Export as JSON (default)
      const exportData = {
        exportInfo: {
          dataController: 'Devin Oldenburg',
          exportedAt: new Date().toISOString(),
          totalLinks: userData.links.length,
          totalClicks: userData.totalClicks,
          format: 'JSON'
        },
        links: userData.links,
        analytics: userData.analytics,
        gdprCompliance: {
          dataRetentionPeriod: '12 months',
          automaticDeletion: true,
          rightsInformation: 'Contact devin.oldenburg@icloud.com for any questions'
        }
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="velink-my-data-${Date.now()}.json"`);
      res.json(exportData);
    }
    
  } catch (error) {
    console.error('Error exporting GDPR data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Redirect short URL
app.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;
    
    // Skip API routes
    if (shortCode.startsWith('api')) {
      return res.status(404).json({ error: 'Not found' });
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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                   text-align: center; padding: 50px; background: #f8fafc; }
            .container { max-width: 500px; margin: 0 auto; background: white; 
                        border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #e11d48; margin-bottom: 20px; }
            p { color: #64748b; margin-bottom: 30px; }
            a { color: #0ea5e9; text-decoration: none; font-weight: 600; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔗 Link Not Found</h1>
            <p>The short link you're looking for doesn't exist or has expired.</p>
            <a href="/">← Back to Velink</a>
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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                   text-align: center; padding: 50px; background: #f8fafc; }
            .container { max-width: 500px; margin: 0 auto; background: white; 
                        border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #e11d48; margin-bottom: 20px; }
            p { color: #64748b; margin-bottom: 30px; }
            a { color: #0ea5e9; text-decoration: none; font-weight: 600; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🔗 Link Expired</h1>
            <p>This short link has expired and is no longer available.</p>
            <a href="/">← Back to Velink</a>
          </div>
        </body>
        </html>
      `);
    }

    // Increment click count
    await db.incrementClicks(shortCode);

    // SEO-friendly redirect page
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redirecting... - Velink</title>
        <meta name="description" content="Redirecting to ${urlData.original_url}">
        <meta name="robots" content="noindex, nofollow">
        <meta http-equiv="refresh" content="0;url=${urlData.original_url}">
        <link rel="canonical" href="${urlData.original_url}">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
                 text-align: center; padding: 50px; background: #f8fafc; }
          .container { max-width: 500px; margin: 0 auto; background: white; 
                      border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .spinner { width: 40px; height: 40px; border: 4px solid #e2e8f0; 
                    border-top: 4px solid #0ea5e9; border-radius: 50%; 
                    animation: spin 1s linear infinite; margin: 20px auto; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          h1 { color: #1e293b; margin-bottom: 20px; }
          p { color: #64748b; margin-bottom: 20px; }
          a { color: #0ea5e9; text-decoration: none; word-break: break-all; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="spinner"></div>
          <h1>🔗 Redirecting...</h1>
          <p>You're being redirected to:</p>
          <a href="${urlData.original_url}" target="_blank">${urlData.original_url}</a>
          <p style="margin-top: 30px; font-size: 14px;">
            If you're not redirected automatically, <a href="${urlData.original_url}">click here</a>
          </p>
        </div>
        <script>
          setTimeout(() => {
            window.location.href = '${urlData.original_url}';
          }, 1000);
        </script>
      </body>
      </html>
    `);

  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).send('Internal server error');
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

// Set up API routes
app.use('/api/v1', setupApiRoutes(db));

// Serve static files
app.use(express.static(clientBuildPath));

// For all routes except API and short URLs, serve the React app
app.get('*', (req, res, next) => {
  // Skip API routes and short URLs (which are handled by the redirect logic)
  if (req.path.startsWith('/api/') || req.path.length <= 8) {
    return next();
  }
  const indexPath = path.join(clientBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not found. Please build the client first.');
  }
});

// Initialize and generate sitemap
const sitemapGenerator = new SitemapGenerator(
  process.env.NODE_ENV === 'production' 
    ? 'https://velink.me' 
    : `http://localhost:${PORT}`
);

// Generate sitemap on startup
sitemapGenerator.generateSitemap();

// Sitemap route
app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
  
  if (fs.existsSync(sitemapPath)) {
    res.header('Content-Type', 'application/xml');
    res.sendFile(sitemapPath);
  } else {
    // Generate sitemap on the fly if it doesn't exist
    sitemapGenerator.generateSitemap()
      .then(() => {
        res.header('Content-Type', 'application/xml');
        res.sendFile(sitemapPath);
      })
      .catch(err => {
        console.error('Error generating sitemap:', err);
        res.status(500).send('Error generating sitemap');
      });
  }
});

// Regenerate sitemap every hour
setInterval(() => {
  sitemapGenerator.generateSitemap();
}, 60 * 60 * 1000);

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
