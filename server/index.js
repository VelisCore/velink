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
        customOptions
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
        <title>Redirecting... - VeLink</title>
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

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  // Check both potential build locations
  let clientBuildPath;
  
  if (fs.existsSync(path.resolve(__dirname, '../client/build'))) {
    clientBuildPath = path.resolve(__dirname, '../client/build');
  } else if (fs.existsSync(path.resolve(__dirname, 'public'))) {
    clientBuildPath = path.resolve(__dirname, 'public');
  } else {
    console.warn('Warning: Could not find client build directory');
    clientBuildPath = path.resolve(__dirname, '../client/build'); // Default fallback
  }
  
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
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

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
    console.log(`🚀 VeLink HTTP server running on port ${PORT}`);
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
      console.log(`🔒 VeLink HTTPS server running on port ${HTTPS_PORT}`);
    });
  } else {
    console.log('⚠️ SSL certificates not found. HTTPS server not started.');
    console.log('To enable HTTPS, set SSL_KEY_PATH and SSL_CERT_PATH environment variables.');
  }
};

startServer();
