const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    // Use environment variable for database path or default to local
    const dbDir = process.env.DB_PATH || __dirname;
    
    // Ensure the directory exists
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    const dbPath = path.join(dbDir, 'velink.db');
    console.log(`Using database at: ${dbPath}`);
    
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  init() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS short_urls (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_code TEXT UNIQUE NOT NULL,
        original_url TEXT NOT NULL,
        clicks INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME DEFAULT NULL,
        ip_address TEXT,
        user_agent TEXT,
        custom_options TEXT
      )
    `;

    const createClicksTableSQL = `
      CREATE TABLE IF NOT EXISTS clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_code TEXT NOT NULL,
        clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT,
        FOREIGN KEY (short_code) REFERENCES short_urls(short_code)
      )
    `;

    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_short_code ON short_urls(short_code);
      CREATE INDEX IF NOT EXISTS idx_original_url ON short_urls(original_url);
      CREATE INDEX IF NOT EXISTS idx_created_at ON short_urls(created_at);
      CREATE INDEX IF NOT EXISTS idx_clicks_short_code ON clicks(short_code);
      CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at);
    `;

    this.db.serialize(() => {
      this.db.run(createTableSQL);
      this.db.run(createClicksTableSQL);
      this.db.run(createIndexSQL);
    });
  }

  createShortUrl(data) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO short_urls (short_code, original_url, expires_at, ip_address, user_agent, custom_options)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [
        data.shortCode, 
        data.originalUrl, 
        data.expiresAt || null, 
        data.ip, 
        data.userAgent, 
        data.customOptions ? JSON.stringify(data.customOptions) : null
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            created_at: new Date().toISOString()
          });
        }
      });
    });
  }

  findByShortCode(shortCode) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM short_urls WHERE short_code = ?';
      this.db.get(sql, [shortCode], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  findByUrl(url) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM short_urls WHERE original_url = ? ORDER BY created_at DESC LIMIT 1';
      this.db.get(sql, [url], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  incrementClicks(shortCode) {
    return new Promise((resolve, reject) => {
      // Start a transaction
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');
        
        // Update click count in short_urls
        this.db.run('UPDATE short_urls SET clicks = clicks + 1 WHERE short_code = ?', [shortCode], function(err) {
          if (err) {
            this.db.run('ROLLBACK');
            reject(err);
            return;
          }
          
          // Insert click record
          const clickSql = `
            INSERT INTO clicks (short_code, ip_address, user_agent)
            VALUES (?, ?, ?)
          `;
          
          this.db.run(clickSql, [shortCode, '', ''], (err) => {
            if (err) {
              this.db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            this.db.run('COMMIT');
            resolve(true);
          });
        }.bind(this));
      });
    });
  }

  getStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as total_links,
          SUM(clicks) as total_clicks,
          MAX(created_at) as latest_created
        FROM short_urls
      `;
      
      this.db.get(sql, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            totalLinks: row.total_links || 0,
            totalClicks: row.total_clicks || 0,
            latestCreated: row.latest_created
          });
        }
      });
    });
  }

  // Get all active links (non-expired) for sitemap
  getActiveLinks() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM short_urls 
        WHERE (expires_at IS NULL OR expires_at > datetime('now'))
        ORDER BY created_at DESC
      `;
      
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Clean up old entries (optional, for database maintenance)
  cleanOldEntries(daysOld = 30) {
    return new Promise((resolve, reject) => {
      const sql = `
        DELETE FROM short_urls 
        WHERE created_at < datetime('now', '-${daysOld} days')
        AND clicks = 0
      `;
      
      this.db.run(sql, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  getLinkAnalytics(shortCode) {
    return new Promise((resolve, reject) => {
      // First get the basic link info
      this.findByShortCode(shortCode)
        .then(link => {
          if (!link) {
            reject(new Error('Link not found'));
            return;
          }

          // Get click data by date
          const clickSql = `
            SELECT 
              date(clicked_at) as date,
              COUNT(*) as clicks
            FROM clicks
            WHERE short_code = ?
            GROUP BY date(clicked_at)
            ORDER BY date(clicked_at) DESC
            LIMIT 30
          `;

          // Get browser stats
          const browserSql = `
            SELECT 
              CASE
                WHEN user_agent LIKE '%Chrome%' THEN 'Chrome'
                WHEN user_agent LIKE '%Firefox%' THEN 'Firefox'
                WHEN user_agent LIKE '%Safari%' THEN 'Safari'
                WHEN user_agent LIKE '%Edge%' THEN 'Edge'
                WHEN user_agent LIKE '%Opera%' THEN 'Opera'
                ELSE 'Other'
              END as browser,
              COUNT(*) as count
            FROM clicks
            WHERE short_code = ?
            GROUP BY browser
            ORDER BY count DESC
          `;

          // Get device stats
          const deviceSql = `
            SELECT 
              CASE
                WHEN user_agent LIKE '%Mobile%' OR user_agent LIKE '%Android%' THEN 'Mobile'
                ELSE 'Desktop'
              END as device,
              COUNT(*) as count
            FROM clicks
            WHERE short_code = ?
            GROUP BY device
            ORDER BY count DESC
          `;

          // Get referrer stats if available
          const referrerSql = `
            SELECT 
              'Unknown' as domain,
              COUNT(*) as count
            FROM clicks
            WHERE short_code = ?
            LIMIT 5
          `;

          // Execute all queries in parallel using Promise.all
          Promise.all([
            new Promise((res, rej) => {
              this.db.all(clickSql, [shortCode], (err, rows) => {
                if (err) return rej(err);
                res(rows.map(row => ({
                  date: row.date,
                  clicks: row.clicks
                })));
              });
            }),
            new Promise((res, rej) => {
              this.db.all(browserSql, [shortCode], (err, rows) => {
                if (err) return rej(err);
                const browsers = {};
                rows.forEach(row => {
                  browsers[row.browser] = row.count;
                });
                res(browsers);
              });
            }),
            new Promise((res, rej) => {
              this.db.all(deviceSql, [shortCode], (err, rows) => {
                if (err) return rej(err);
                const devices = {};
                rows.forEach(row => {
                  devices[row.device] = row.count;
                });
                res(devices);
              });
            }),
            new Promise((res, rej) => {
              this.db.all(referrerSql, [shortCode], (err, rows) => {
                if (err) return rej(err);
                res(rows);
              });
            })
          ])
          .then(([clickData, browserStats, deviceStats, referrers]) => {
            resolve({
              shortCode: link.short_code,
              originalUrl: link.original_url,
              totalClicks: link.clicks,
              createdAt: link.created_at,
              expiresAt: link.expires_at,
              clickData,
              browserStats,
              deviceStats,
              referrers
            });
          })
          .catch(error => {
            reject(error);
          });
        })
        .catch(reject);
    });
  }
  
  // Get detailed stats for the API
  getDetailedStats() {
    return new Promise((resolve, reject) => {
      const basicStatsSql = `
        SELECT 
          COUNT(*) as total_links,
          SUM(clicks) as total_clicks,
          MAX(created_at) as latest_created
        FROM short_urls
      `;

      const topDomainsSql = `
        SELECT 
          substr(original_url, instr(original_url, '://') + 3, 
                 case when instr(substr(original_url, instr(original_url, '://') + 3), '/') = 0
                      then length(substr(original_url, instr(original_url, '://') + 3))
                      else instr(substr(original_url, instr(original_url, '://') + 3), '/') - 1
                 end) as domain,
          COUNT(*) as count
        FROM short_urls
        GROUP BY domain
        ORDER BY count DESC
        LIMIT 10
      `;

      const clicksByDaySql = `
        SELECT 
          date(clicked_at) as date,
          COUNT(*) as clicks
        FROM clicks
        GROUP BY date(clicked_at)
        ORDER BY date DESC
        LIMIT 30
      `;

      Promise.all([
        new Promise((res, rej) => {
          this.db.get(basicStatsSql, [], (err, row) => {
            if (err) return rej(err);
            res(row || {});
          });
        }),
        new Promise((res, rej) => {
          this.db.all(topDomainsSql, [], (err, rows) => {
            if (err) return rej(err);
            res(rows);
          });
        }),
        new Promise((res, rej) => {
          this.db.all(clicksByDaySql, [], (err, rows) => {
            if (err) return rej(err);
            res(rows);
          });
        })
      ])
        .then(([basicStats, topDomains, clicksByDay]) => {
          resolve({
            totalLinks: basicStats.total_links || 0,
            totalClicks: basicStats.total_clicks || 0,
            latestCreated: basicStats.latest_created,
            topDomains,
            clicksByDay
          });
        })
        .catch(reject);
    });
  }

  // Delete a link
  deleteLink(shortCode) {
    return new Promise((resolve, reject) => {
      // First delete clicks
      const deleteClicksSql = 'DELETE FROM clicks WHERE short_code = ?';
      this.db.run(deleteClicksSql, [shortCode], (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Then delete the link
        const deleteLinkSql = 'DELETE FROM short_urls WHERE short_code = ?';
        this.db.run(deleteLinkSql, [shortCode], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ deletedCount: this.changes });
          }
        });
      });
    });
  }

  // Get links with pagination
  getLinks(limit = 100, offset = 0) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          short_code, 
          original_url, 
          clicks, 
          created_at, 
          expires_at,
          custom_options
        FROM short_urls
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;

      this.db.all(sql, [limit, offset], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            shortCode: row.short_code,
            originalUrl: row.original_url,
            clicks: row.clicks,
            createdAt: row.created_at,
            expiresAt: row.expires_at,
            customOptions: row.custom_options ? JSON.parse(row.custom_options) : {}
          })));
        }
      });
    });
  }

  // Get total count of links
  getTotalLinkCount() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT COUNT(*) as count FROM short_urls';
      
      this.db.get(sql, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }
}

module.exports = Database;
