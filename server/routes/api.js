const express = require('express');
const { body, validationResult } = require('express-validator');

// Create API router
function setupApiRoutes(db) {
  const router = express.Router();

  // API Authentication middleware for protected routes
  const apiKeyAuth = (req, res, next) => {
    const apiKey = req.header('X-API-Key');
    if (!apiKey || apiKey !== process.env.API_KEY) {
      return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
    }
    next();
  };

  // Verify password for password-protected links
  router.post('/verify-password/:shortCode', [
    body('password').isString().notEmpty().withMessage('Password is required'),
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
      }

      const { shortCode } = req.params;
      const { password } = req.body;

      const urlData = await db.findByShortCode(shortCode);
      
      if (!urlData) {
        return res.status(404).json({ error: 'Link not found' });
      }

      // Check if link has expired
      if (urlData.expires_at && new Date(urlData.expires_at) < new Date()) {
        return res.status(410).json({ error: 'Link has expired' });
      }

      // Check if link is password protected
      const customOptions = urlData.custom_options ? JSON.parse(urlData.custom_options) : {};
      
      if (!customOptions.password) {
        return res.status(400).json({ error: 'This link is not password protected' });
      }

      // Verify password
      if (customOptions.password !== password) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      // Return success with the original URL
      res.json({
        success: true,
        originalUrl: urlData.original_url
      });
    } catch (error) {
      console.error('Error verifying password:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Delete link (requires API key)
  router.delete('/links/:shortCode', apiKeyAuth, async (req, res) => {
    try {
      const { shortCode } = req.params;
      
      const urlData = await db.findByShortCode(shortCode);
      if (!urlData) {
        return res.status(404).json({ error: 'Link not found' });
      }

      await db.deleteLink(shortCode);
      
      res.json({
        success: true,
        message: 'Link successfully deleted'
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get detailed statistics about the service
  router.get('/stats/detailed', async (req, res) => {
    try {
      const stats = await db.getDetailedStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching detailed stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Batch shorten URLs (requires API key)
  router.post('/batch-shorten', apiKeyAuth, [
    body('urls').isArray().withMessage('URLs must be an array'),
    body('urls.*').isURL({ protocols: ['http', 'https'], require_protocol: true })
      .withMessage('Each URL must be valid and include http:// or https://'),
    body('expiresIn')
      .optional()
      .isIn(['1d', '7d', '30d', '365d', 'never'])
      .withMessage('Invalid expiration option')
  ], async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: errors.array()[0].msg 
        });
      }

      const { urls, expiresIn, customOptions } = req.body;
      const ip = req.ip || req.connection.remoteAddress;
      
      // Calculate expiration date if provided
      let expiresAt = null;
      if (expiresIn && expiresIn !== 'never') {
        const days = {
          '1d': 1, '7d': 7, '30d': 30, '365d': 365
        };
        
        const expireDate = new Date();
        expireDate.setDate(expireDate.getDate() + days[expiresIn]);
        expiresAt = expireDate.toISOString();
      }

      // Process all URLs
      const results = [];
      for (const url of urls) {
        // Check if URL already exists (optimization)
        const existing = await db.findByUrl(url);
        if (existing) {
          // If the URL exists but we want a different expiration, create a new one
          if ((expiresAt && !existing.expires_at) || 
              (expiresAt && existing.expires_at && new Date(expiresAt).getTime() !== new Date(existing.expires_at).getTime())) {
            // Continue to create a new short URL with the new expiration
          } else {
            results.push({
              shortUrl: `${req.protocol}://${req.get('host')}/${existing.short_code}`,
              shortCode: existing.short_code,
              originalUrl: existing.original_url,
              clicks: existing.clicks,
              expiresAt: existing.expires_at,
              createdAt: existing.created_at,
              customOptions: existing.custom_options ? JSON.parse(existing.custom_options) : null
            });
            continue;
          }
        }

        // Generate unique short code
        let shortCode;
        let attempts = 0;
        do {
          shortCode = require('../utils').generateShortCode();
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

        results.push({
          shortUrl: `${req.protocol}://${req.get('host')}/${shortCode}`,
          shortCode,
          originalUrl: url,
          expiresAt,
          clicks: 0,
          createdAt: result.created_at,
          customOptions
        });
      }

      res.status(201).json(results);
    } catch (error) {
      console.error('Error batch shortening URLs:', error);
      res.status(500).json({ error: 'Failed to process batch shortening' });
    }
  });

  // GET /api/stats - Get detailed statistics
  router.get('/stats', apiKeyAuth, async (req, res) => {
    try {
      const stats = await db.getDetailedStats();
      res.json(stats);
    } catch (error) {
      console.error('Error getting detailed stats:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  });

  // DELETE /api/links/:shortCode - Delete a link
  router.delete('/links/:shortCode', apiKeyAuth, async (req, res) => {
    try {
      const { shortCode } = req.params;
      const result = await db.deleteLink(shortCode);
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Not found', message: 'Link not found' });
      }
      
      res.json({ 
        message: 'Link deleted successfully',
        shortCode
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      res.status(500).json({ error: 'Internal server error', message: error.message });
    }
  });

  return router;
}

module.exports = setupApiRoutes;
