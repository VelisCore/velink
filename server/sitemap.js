const fs = require('fs');
const path = require('path');

class SitemapGenerator {
  constructor(db, baseUrl = 'https://velink.de') {
    this.db = db;
    this.baseUrl = baseUrl;
    this.sitemapPath = path.join(__dirname, 'public', 'sitemap.xml');
    this.sitemapIndexPath = path.join(__dirname, 'public', 'sitemap-index.xml');
    this.lastGenerated = null;
    this.isGenerating = false;
    this.maxUrlsPerSitemap = 40000; // SEO best practice: keep under 50k URLs per sitemap
  }

  // Enhanced static pages with comprehensive link shortener SEO
  getStaticPages() {
    return [
      {
        path: '',
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        path: '/features',
        changefreq: 'weekly',
        priority: '0.9'
      },
      {
        path: '/api-docs',
        changefreq: 'weekly',
        priority: '0.8'
      },
      {
        path: '/api/documentation',
        changefreq: 'weekly',
        priority: '0.8'
      },
      {
        path: '/privacy',
        changefreq: 'monthly',
        priority: '0.7'
      },
      {
        path: '/terms',
        changefreq: 'monthly',
        priority: '0.7'
      },
      {
        path: '/impressum',
        changefreq: 'monthly',
        priority: '0.6'
      },
      {
        path: '/admin',
        changefreq: 'weekly',
        priority: '0.5'
      },
      {
        path: '/stats',
        changefreq: 'daily',
        priority: '0.8'
      }
    ];
  }

  async generateSitemap() {
    if (this.isGenerating) {
      console.log('⏳ Sitemap generation already in progress...');
      return false;
    }

    try {
      this.isGenerating = true;
      console.log('🗺️ Generating enhanced sitemap for VeLink...');

      const [staticPages, links] = await Promise.all([
        this.getStaticPages(),
        this.getActivePublicLinks()
      ]);

      console.log(`📄 Found ${staticPages.length} static pages and ${links.length} public links`);

      // Enhanced: Check if we need a sitemap index for large sites
      const totalUrls = staticPages.length + links.length;
      
      if (totalUrls > 40000) {
        // Generate sitemap index for very large sites
        await this.generateSitemapIndex(staticPages, links);
      } else {
        // Generate single sitemap
        const sitemapXML = this.buildSitemapXML(staticPages, links);
        await this.writeSitemap(sitemapXML);
      }

      this.lastGenerated = new Date();
      console.log(`✅ Sitemap generated successfully with ${totalUrls} URLs`);
      
      // Enhanced: Validate the generated sitemap
      const validation = this.validateSitemap();
      if (validation.valid) {
        console.log(`✅ Sitemap validation passed: ${validation.urlCount} URLs, ${validation.sizeKB}KB`);
      } else {
        console.error(`❌ Sitemap validation failed: ${validation.error}`);
      }

      return true;
    } catch (error) {
      console.error('❌ Error generating sitemap:', error);
      return false;
    } finally {
      this.isGenerating = false;
    }
  }

  async writeSitemap(xml) {
    try {
      // Ensure the public directory exists
      const publicDir = path.dirname(this.sitemapPath);
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }

      // Write to file atomically (write to temp file first, then rename)
      const tempPath = this.sitemapPath + '.tmp';
      fs.writeFileSync(tempPath, xml, 'utf8');
      fs.renameSync(tempPath, this.sitemapPath);
      
      console.log(`📍 Sitemap written to: ${this.sitemapPath}`);
    } catch (error) {
      console.error('❌ Error writing sitemap:', error);
      throw error;
    }
  }

  async writeSitemapFile(filePath, xml) {
    try {
      // Ensure the directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Write to file atomically
      const tempPath = filePath + '.tmp';
      fs.writeFileSync(tempPath, xml, 'utf8');
      fs.renameSync(tempPath, filePath);
      
      console.log(`📍 Sitemap file written to: ${filePath}`);
    } catch (error) {
      console.error('❌ Error writing sitemap file:', error);
      throw error;
    }
  }

  // Enhanced sitemap index generation for large sites
  async generateSitemapIndex(staticPages, links) {
    console.log('🗂️ Generating sitemap index for large site...');
    
    const sitemaps = [];
    let currentSitemap = 1;
    
    // Generate static pages sitemap
    if (staticPages.length > 0) {
      const staticXml = this.buildSitemapXML(staticPages, []);
      const staticSitemapPath = path.join(__dirname, 'public', 'sitemap-static.xml');
      await this.writeSitemapFile(staticSitemapPath, staticXml);
      
      sitemaps.push({
        loc: `${this.baseUrl}/sitemap-static.xml`,
        lastmod: new Date().toISOString().split('T')[0]
      });
    }
    
    // Generate link sitemaps in batches
    for (let i = 0; i < links.length; i += this.maxUrlsPerSitemap) {
      const batch = links.slice(i, i + this.maxUrlsPerSitemap);
      const linksXml = this.buildSitemapXML([], batch);
      const linksSitemapPath = path.join(__dirname, 'public', `sitemap-links-${currentSitemap}.xml`);
      await this.writeSitemapFile(linksSitemapPath, linksXml);
      
      sitemaps.push({
        loc: `${this.baseUrl}/sitemap-links-${currentSitemap}.xml`,
        lastmod: new Date().toISOString().split('T')[0]
      });
      
      currentSitemap++;
    }

    // Generate sitemap index
    const indexXml = this.buildSitemapIndexXML(sitemaps);
    await this.writeSitemapFile(this.sitemapIndexPath, indexXml);
    
    console.log(`🗂️ Generated sitemap index with ${sitemaps.length} sitemaps`);
  }

  buildSitemapIndexXML(sitemaps) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    for (const sitemap of sitemaps) {
      xml += '  <sitemap>\n';
      xml += `    <loc>${sitemap.loc}</loc>\n`;
      xml += `    <lastmod>${sitemap.lastmod}</lastmod>\n`;
      xml += '  </sitemap>\n';
    }
    
    xml += '</sitemapindex>';
    return xml;
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
    
    // Add short link pages with enhanced SEO priorities
    links.forEach(link => {
      const lastmod = new Date(link.created_at).toISOString().split('T')[0];
      // Enhanced priority calculation based on link performance
      let priority = '0.6'; // Base priority for short links
      
      if (link.clicks > 100) priority = '0.9';
      else if (link.clicks > 50) priority = '0.8';
      else if (link.clicks > 10) priority = '0.7';
      else if (link.clicks > 0) priority = '0.6';
      
      // High-priority for custom branded links
      if (link.short_code && link.short_code.length > 6) {
        priority = '0.8';
      }
      
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

  // Enhanced sitemap validation
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

      // Enhanced validation: Check for proper URL format
      const urls = content.match(/<loc>(.*?)<\/loc>/g) || [];
      for (const url of urls) {
        const urlContent = url.replace(/<\/?loc>/g, '');
        if (!urlContent.startsWith(this.baseUrl)) {
          return { valid: false, error: `Invalid URL found: ${urlContent}` };
        }
      }

      return { 
        valid: true, 
        urlCount: urlCount,
        size: content.length,
        sizeKB: Math.round(content.length / 1024)
      };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  // Schedule automatic sitemap generation
  scheduleGeneration(intervalHours = 24) {
    console.log(`📅 Scheduling sitemap generation every ${intervalHours} hours`);
    
    // Initial generation
    this.generateSitemap();
    
    // Set up recurring generation
    setInterval(() => {
      console.log('⏰ Scheduled sitemap generation starting...');
      this.generateSitemap();
    }, intervalHours * 60 * 60 * 1000);
  }

  // Get last generation info
  getLastGenerationInfo() {
    return {
      lastGenerated: this.lastGenerated,
      isGenerating: this.isGenerating,
      stats: this.getSitemapStats()
    };
  }
}

module.exports = SitemapGenerator;
