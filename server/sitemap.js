const Database = require('./database');
const fs = require('fs');
const path = require('path');

class SitemapGenerator {
  constructor(baseUrl = 'https://velink.me') {
    this.baseUrl = baseUrl;
    this.db = new Database();
    this.sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
  }

  async generateSitemap() {
    try {
      // Ensure the public directory exists
      if (!fs.existsSync(path.join(__dirname, 'public'))) {
        fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });
      }

      // Get all active links (non-expired and non-private)
      const links = await this.db.getActiveLinks();
      
      // Static pages
      const staticPages = [
        '',                 // Home page
        '/api-docs',        // API Documentation
        '/terms',           // Terms of Service
        '/privacy',         // Privacy Policy
        '/impressum'        // Impressum
      ];

      // XML header
      let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
      
      // Add static pages
      staticPages.forEach(page => {
        xml += `
  <url>
    <loc>${this.baseUrl}${page}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`;
      });
      
      // Add link pages (if not private)
      links.forEach(link => {
        // Skip private links
        if (link.custom_options && JSON.parse(link.custom_options).isPrivate) {
          return;
        }
        
        xml += `
  <url>
    <loc>${this.baseUrl}/${link.short_code}</loc>
    <lastmod>${new Date(link.created_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      });
      
      // Close XML
      xml += `
</urlset>`;
      
      // Write to file
      fs.writeFileSync(this.sitemapPath, xml, 'utf8');
      
      console.log(`Sitemap generated at ${this.sitemapPath}`);
      return true;
    } catch (error) {
      console.error('Error generating sitemap:', error);
      return false;
    }
  }
}

module.exports = SitemapGenerator;
