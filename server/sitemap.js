const Database = require('./database');
const fs = require('fs');
const path = require('path');

class SitemapGenerator {
  constructor(baseUrl = 'https://velink.me') {
    this.baseUrl = baseUrl;
    this.db = new Database();
    this.sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
    this.lastGenerated = null;
    this.isGenerating = false;
  }

  async generateSitemap() {
    // Prevent concurrent generation
    if (this.isGenerating) {
      console.log('📋 Sitemap generation already in progress, skipping...');
      return false;
    }

    this.isGenerating = true;
    const startTime = Date.now();

    try {
      console.log('📋 Starting sitemap generation...');
      
      // Ensure the public directory exists
      const publicDir = path.join(__dirname, 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
        console.log('📁 Created public directory for sitemap');
      }

      // Get all active, non-private links
      const links = await this.getActivePublicLinks();
      console.log(`📋 Found ${links.length} active public links for sitemap`);
      
      // Static pages with priority and change frequency
      const staticPages = [
        { path: '', changefreq: 'daily', priority: '1.0' },      // Home page
        { path: '/docs', changefreq: 'weekly', priority: '0.9' },  // API Documentation
        { path: '/terms', changefreq: 'monthly', priority: '0.7' }, // Terms of Service
        { path: '/privacy', changefreq: 'monthly', priority: '0.7' }, // Privacy Policy
        { path: '/impressum', changefreq: 'monthly', priority: '0.6' } // Impressum
      ];

      // Generate XML content
      const xml = this.buildSitemapXML(staticPages, links);
      
      // Write to file atomically (write to temp file first, then rename)
      const tempPath = this.sitemapPath + '.tmp';
      fs.writeFileSync(tempPath, xml, 'utf8');
      fs.renameSync(tempPath, this.sitemapPath);
      
      this.lastGenerated = new Date();
      const duration = Date.now() - startTime;
      
      console.log(`✅ Sitemap generated successfully in ${duration}ms`);
      console.log(`📍 Location: ${this.sitemapPath}`);
      console.log(`📊 Contains: ${staticPages.length} static pages + ${links.length} short links`);
      
      return true;
    } catch (error) {
      console.error('❌ Error generating sitemap:', error);
      return false;
    } finally {
      this.isGenerating = false;
    }
  }

  async getActivePublicLinks() {
    try {
      // Get all active links (non-expired and active)
      const allLinks = await this.db.getActiveLinks();
      
      // Filter out private links
      const publicLinks = allLinks.filter(link => {
        // Skip inactive links
        if (link.is_active === false || link.is_active === 0) {
          return false;
        }

        // Skip private links
        if (link.custom_options) {
          try {
            const options = JSON.parse(link.custom_options);
            if (options.isPrivate === true) {
              return false;
            }
          } catch (e) {
            // If JSON parsing fails, include the link (no custom options)
          }
        }

        return true;
      });

      return publicLinks;
    } catch (error) {
      console.error('❌ Error fetching active public links:', error);
      return [];
    }
  }

  buildSitemapXML(staticPages, links) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;
    
    // Add static pages
    staticPages.forEach(page => {
      const lastmod = page.path === '' ? new Date().toISOString().split('T')[0] : '';
      xml += `
  <url>
    <loc>${this.baseUrl}${page.path}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });
    
    // Add short link pages
    links.forEach(link => {
      const lastmod = new Date(link.created_at).toISOString().split('T')[0];
      const priority = link.clicks > 10 ? '0.8' : link.clicks > 0 ? '0.7' : '0.6';
      
      xml += `
  <url>
    <loc>${this.baseUrl}/${link.short_code}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });
    
    // Close XML
    xml += `
</urlset>`;

    return xml;
  }

  // Get sitemap stats for logging/monitoring
  getSitemapStats() {
    try {
      if (!fs.existsSync(this.sitemapPath)) {
        return null;
      }

      const stats = fs.statSync(this.sitemapPath);
      const content = fs.readFileSync(this.sitemapPath, 'utf8');
      const urlCount = (content.match(/<url>/g) || []).length;

      return {
        size: stats.size,
        lastModified: stats.mtime,
        urlCount: urlCount,
        lastGenerated: this.lastGenerated
      };
    } catch (error) {
      console.error('❌ Error getting sitemap stats:', error);
      return null;
    }
  }

  // Validate sitemap XML
  validateSitemap() {
    try {
      if (!fs.existsSync(this.sitemapPath)) {
        return { valid: false, error: 'Sitemap file does not exist' };
      }

      const content = fs.readFileSync(this.sitemapPath, 'utf8');
      
      // Basic XML validation
      if (!content.includes('<?xml version="1.0"')) {
        return { valid: false, error: 'Missing XML declaration' };
      }
      
      if (!content.includes('<urlset')) {
        return { valid: false, error: 'Missing urlset element' };
      }
      
      if (!content.includes('</urlset>')) {
        return { valid: false, error: 'Missing closing urlset element' };
      }

      const urlCount = (content.match(/<url>/g) || []).length;
      const locCount = (content.match(/<loc>/g) || []).length;
      
      if (urlCount !== locCount) {
        return { valid: false, error: 'URL and loc count mismatch' };
      }

      return { 
        valid: true, 
        urlCount: urlCount,
        size: content.length 
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

module.exports = SitemapGenerator;
