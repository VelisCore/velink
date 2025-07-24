const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

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
        custom_options TEXT,
        description TEXT,
        is_active BOOLEAN DEFAULT 1,
        last_accessed DATETIME,
        updated_at DATETIME,
        creation_secret TEXT
      )
    `;

    const createClicksTableSQL = `
      CREATE TABLE IF NOT EXISTS clicks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        short_code TEXT NOT NULL,
        clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        ip_address TEXT,
        user_agent TEXT,
        referrer TEXT,
        country TEXT,
        device_type TEXT,
        browser TEXT,
        FOREIGN KEY (short_code) REFERENCES short_urls(short_code)
      )
    `;

    const createBugReportsTableSQL = `
      CREATE TABLE IF NOT EXISTS bug_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'medium',
        type TEXT NOT NULL DEFAULT 'bug',
        email TEXT,
        steps TEXT,
        expected TEXT,
        actual TEXT,
        status TEXT DEFAULT 'open',
        ip_address TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME
      )
    `;

    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_short_code ON short_urls(short_code);
      CREATE INDEX IF NOT EXISTS idx_original_url ON short_urls(original_url);
      CREATE INDEX IF NOT EXISTS idx_created_at ON short_urls(created_at);
      CREATE INDEX IF NOT EXISTS idx_clicks_short_code ON clicks(short_code);
      CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at);
      CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON bug_reports(created_at);
      CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON bug_reports(status);
    `;

    // Add new columns to existing tables if they don't exist
    const addColumnsSQL = `
      ALTER TABLE short_urls ADD COLUMN description TEXT;
      ALTER TABLE short_urls ADD COLUMN is_active BOOLEAN DEFAULT 1;
      ALTER TABLE short_urls ADD COLUMN last_accessed DATETIME;
      ALTER TABLE short_urls ADD COLUMN updated_at DATETIME;
      ALTER TABLE short_urls ADD COLUMN creation_secret TEXT;
      ALTER TABLE clicks ADD COLUMN referrer TEXT;
      ALTER TABLE clicks ADD COLUMN country TEXT;
      ALTER TABLE clicks ADD COLUMN device_type TEXT;
      ALTER TABLE clicks ADD COLUMN browser TEXT;
    `;

    this.db.serialize(() => {
      this.db.run(createTableSQL);
      this.db.run(createClicksTableSQL);
      this.db.run(createBugReportsTableSQL);
      this.db.run(createIndexSQL);
      
      // Add new columns if they don't exist (ignore errors for existing columns)
      const statements = addColumnsSQL.split(';').filter(stmt => stmt.trim());
      statements.forEach(stmt => {
        this.db.run(stmt.trim(), (err) => {
          // Ignore errors for existing columns
          if (err && !err.message.includes('duplicate column name')) {
            console.log('Database update note:', err.message);
          }
        });
      });
    });
  }

  createShortUrl(data) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO short_urls (short_code, original_url, expires_at, ip_address, user_agent, custom_options, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [
        data.shortCode, 
        data.originalUrl, 
        data.expiresAt || null, 
        data.ip, 
        data.userAgent, 
        data.customOptions ? JSON.stringify(data.customOptions) : null,
        data.description || null
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
        WHERE (custom_options IS NULL OR custom_options NOT LIKE '%"isPrivate":true%')
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

  // Get detailed statistics with enhanced analytics
  getDetailedStats() {
    return new Promise((resolve, reject) => {
      // Get basic stats first (excluding private links)
      const basicStatsSQL = `
        SELECT 
          COUNT(*) as total_links,
          SUM(clicks) as total_clicks,
          MAX(created_at) as latest_created,
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_links,
          COUNT(CASE WHEN created_at >= date('now', '-24 hours') THEN 1 END) as links_today,
          AVG(clicks) as avg_clicks_per_link
        FROM short_urls
        WHERE (custom_options IS NULL OR custom_options NOT LIKE '%"isPrivate":true%')
      `;

      this.db.get(basicStatsSQL, [], (err, basicStats) => {
        if (err) {
          reject(err);
          return;
        }

        // Get top domains (excluding private links)
        const topDomainsSQL = `
          SELECT 
            CASE 
              WHEN instr(substr(original_url, instr(original_url, '://') + 3), '/') > 0 
              THEN substr(substr(original_url, instr(original_url, '://') + 3), 1, instr(substr(original_url, instr(original_url, '://') + 3), '/') - 1)
              ELSE substr(original_url, instr(original_url, '://') + 3)
            END as domain,
            COUNT(*) as count,
            SUM(clicks) as total_clicks
          FROM short_urls 
          WHERE domain != '' AND (custom_options IS NULL OR custom_options NOT LIKE '%"isPrivate":true%')
          GROUP BY domain 
          ORDER BY count DESC 
          LIMIT 10
        `;

        this.db.all(topDomainsSQL, [], (err, topDomains) => {
          if (err) {
            reject(err);
            return;
          }

          // Get clicks by day for the last 30 days (excluding private links)
          const clicksByDaySQL = `
            SELECT 
              date(created_at) as date,
              COUNT(*) as links_created,
              SUM(clicks) as total_clicks
            FROM short_urls 
            WHERE created_at >= date('now', '-30 days')
              AND (custom_options IS NULL OR custom_options NOT LIKE '%"isPrivate":true%')
            GROUP BY date(created_at)
            ORDER BY date DESC
          `;

          this.db.all(clicksByDaySQL, [], (err, clicksByDay) => {
            if (err) {
              reject(err);
              return;
            }

            // Get hourly stats for today (excluding private links)
            const hourlyStatsSQL = `
              SELECT 
                strftime('%H', created_at) as hour,
                COUNT(*) as links_created
              FROM short_urls 
              WHERE date(created_at) = date('now')
                AND (custom_options IS NULL OR custom_options NOT LIKE '%"isPrivate":true%')
              GROUP BY strftime('%H', created_at)
              ORDER BY hour
            `;

            this.db.all(hourlyStatsSQL, [], (err, hourlyStats) => {
              if (err) {
                reject(err);
                return;
              }

              // Get recent activity (last 10 links)
              const recentActivitySQL = `
                SELECT 
                  short_code,
                  original_url,
                  clicks,
                  created_at,
                  description
                FROM short_urls 
                ORDER BY created_at DESC 
                LIMIT 10
              `;

              this.db.all(recentActivitySQL, [], (err, recentActivity) => {
                if (err) {
                  reject(err);
                  return;
                }

                // Calculate weekly activity (links created in the last 7 days)
                const weeklyActivity = clicksByDay.length > 0 
                  ? clicksByDay.slice(0, 7).reduce((sum, day) => sum + (day.links_created || 0), 0)
                  : 0;

                // Calculate monthly growth (compare this month to last month)
                const thisMonthLinks = clicksByDay.filter(day => {
                  const dayDate = new Date(day.date);
                  const today = new Date();
                  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  return dayDate >= startOfMonth;
                }).reduce((sum, day) => sum + (day.links_created || 0), 0);

                const lastMonthLinks = clicksByDay.filter(day => {
                  const dayDate = new Date(day.date);
                  const today = new Date();
                  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                  return dayDate >= startOfLastMonth && dayDate <= endOfLastMonth;
                }).reduce((sum, day) => sum + (day.links_created || 0), 0);

                const monthlyGrowth = lastMonthLinks > 0 
                  ? (((thisMonthLinks - lastMonthLinks) / lastMonthLinks) * 100).toFixed(1)
                  : thisMonthLinks > 0 ? 100 : 0;

                // Calculate daily average
                const dailyAverage = clicksByDay.length > 0 
                  ? Math.round(clicksByDay.slice(0, 7).reduce((sum, day) => sum + (day.total_clicks || 0), 0) / Math.min(7, clicksByDay.length))
                  : 0;

                resolve({
                  totalLinks: basicStats.total_links || 0,
                  totalClicks: basicStats.total_clicks || 0,
                  activeLinks: basicStats.active_links || 0,
                  linksToday: basicStats.links_today || 0,
                  avgClicksPerLink: Math.round(basicStats.avg_clicks_per_link || 0),
                  latestCreated: basicStats.latest_created,
                  dailyAverage,
                  weeklyActivity,
                  monthlyGrowth,
                  topDomains: topDomains || [],
                  clicksByDay: clicksByDay || [],
                  hourlyStats: hourlyStats || [],
                  recentActivity: recentActivity || []
                });
              });
            });
          });
        });
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

  // ==========================================
  // GDPR DATA ACCESS METHODS
  // ==========================================

  // Get user data by short codes they created
  getUserDataByShortCodes(shortCodes) {
    return new Promise((resolve, reject) => {
      const placeholders = shortCodes.map(() => '?').join(',');
      
      // Get links data
      const linksSQL = `
        SELECT id, short_code, original_url, clicks, created_at, expires_at, 
               description, is_active, last_accessed
        FROM short_urls 
        WHERE short_code IN (${placeholders})
        ORDER BY created_at DESC
      `;
      
      this.db.all(linksSQL, shortCodes, (err, links) => {
        if (err) {
          reject(err);
          return;
        }

        // Get analytics data for these short codes
        const analyticsSQL = `
          SELECT short_code, clicked_at, ip_address, referrer, country, 
                 device_type, browser
          FROM clicks 
          WHERE short_code IN (${placeholders})
          ORDER BY clicked_at DESC
        `;
        
        this.db.all(analyticsSQL, shortCodes, (err, analytics) => {
          if (err) {
            reject(err);
            return;
          }

          // Calculate total clicks
          const totalClicks = analytics.length;

          resolve({
            links: links || [],
            analytics: analytics || [],
            totalClicks
          });
        });
      });
    });
  }

  // Delete user data by short codes (GDPR Right to Erasure)
  deleteUserDataByShortCodes(shortCodes) {
    return new Promise((resolve, reject) => {
      const placeholders = shortCodes.map(() => '?').join(',');
      const db = this.db; // Store reference to avoid scope issues
      
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        let linksDeleted = 0;
        let analyticsDeleted = 0;
        
        // Delete analytics data first (foreign key constraint)
        const deleteAnalyticsSQL = `DELETE FROM clicks WHERE short_code IN (${placeholders})`;
        
        db.run(deleteAnalyticsSQL, shortCodes, function(err) {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          
          analyticsDeleted = this.changes;
          
          // Delete links
          const deleteLinksSQL = `DELETE FROM short_urls WHERE short_code IN (${placeholders})`;
          
          db.run(deleteLinksSQL, shortCodes, function(err) {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            linksDeleted = this.changes;
            
            db.run('COMMIT', (err) => {
              if (err) {
                reject(err);
              } else {
                resolve({
                  linksDeleted,
                  analyticsDeleted
                });
              }
            });
          });
        });
      });
    });
  }

  // Rectify user data (GDPR Right to Rectification)
  rectifyUserData(shortCode, updateData) {
    return new Promise((resolve, reject) => {
      // Build dynamic SQL for allowed fields
      const allowedFields = ['description'];
      const updates = [];
      const values = [];
      
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updates.push(`${field} = ?`);
          values.push(updateData[field]);
        }
      }
      
      if (updates.length === 0) {
        resolve(false);
        return;
      }
      
      values.push(shortCode); // Add shortCode for WHERE clause
      
      const sql = `
        UPDATE short_urls 
        SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE short_code = ?
      `;
      
      this.db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // Check if user owns a short code (for verification)
  verifyShortCodeOwnership(shortCode, ipAddress) {
    return new Promise((resolve, reject) => {
      // Since we don't have user accounts, we'll use IP address and creation time
      // as a basic verification method (not foolproof but reasonable for anonymous system)
      const sql = `
        SELECT COUNT(*) as count 
        FROM short_urls 
        WHERE short_code = ? AND ip_address = ?
        AND created_at > datetime('now', '-7 days')
      `;
      
      this.db.get(sql, [shortCode, ipAddress], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count > 0);
        }
      });
    });
  }

  // Get GDPR compliance summary
  getGDPRComplianceSummary() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as totalLinks,
          COUNT(CASE WHEN created_at < datetime('now', '-12 months') THEN 1 END) as linksToDelete,
          COUNT(CASE WHEN created_at > datetime('now', '-30 days') THEN 1 END) as recentLinks,
          MAX(created_at) as newestLink,
          MIN(created_at) as oldestLink
        FROM short_urls
      `;
      
      this.db.get(sql, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            totalLinks: row.totalLinks || 0,
            linksToDelete: row.linksToDelete || 0,
            recentLinks: row.recentLinks || 0,
            newestLink: row.newestLink,
            oldestLink: row.oldestLink,
            dataRetentionPolicy: '12 months',
            ipAnonymizationPolicy: '30 days',
            lastChecked: new Date().toISOString()
          });
        }
      });
    });
  }

  // Admin methods
  getAllLinks() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          id as _id,
          short_code as shortCode,
          original_url as originalUrl,
          clicks,
          created_at as createdAt,
          last_accessed as lastClicked,
          description,
          ip_address as ipAddress,
          user_agent as userAgent,
          is_active as isActive
        FROM short_urls 
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

  getAdminStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as totalLinks,
          SUM(clicks) as totalClicks,
          COUNT(CASE WHEN created_at > datetime('now', '-1 day') THEN 1 END) as linksToday,
          COUNT(CASE WHEN created_at > datetime('now', '-7 days') THEN 1 END) as linksThisWeek,
          COUNT(CASE WHEN clicks > 0 THEN 1 END) as activeLinks,
          AVG(clicks) as avgClicks
        FROM short_urls
      `;
      
      this.db.get(sql, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            totalLinks: row.totalLinks || 0,
            totalClicks: row.totalClicks || 0,
            activeLinks: row.activeLinks || 0,
            linksToday: row.linksToday || 0,
            linksThisWeek: row.linksThisWeek || 0,
            avgClicks: Math.round(row.avgClicks || 0)
          });
        }
      });
    });
  }

  getAnalytics() {
    return new Promise((resolve, reject) => {
      // Get basic stats
      const statsSQL = `
        SELECT 
          COUNT(*) as totalLinks,
          SUM(clicks) as totalClicks,
          COUNT(CASE WHEN clicks > 0 THEN 1 END) as activeLinks,
          COUNT(CASE WHEN created_at > datetime('now', '-1 day') THEN 1 END) as linksToday
        FROM short_urls
      `;
      
      this.db.get(statsSQL, [], (err, stats) => {
        if (err) {
          reject(err);
          return;
        }

        // Get clicks by day (last 30 days)
        const clicksByDaySQL = `
          SELECT 
            date(created_at) as date,
            COUNT(*) as links_created,
            SUM(clicks) as total_clicks
          FROM short_urls 
          WHERE created_at > datetime('now', '-30 days')
          GROUP BY date(created_at)
          ORDER BY date DESC
        `;
        
        this.db.all(clicksByDaySQL, [], (err, clicksByDay) => {
          if (err) {
            reject(err);
            return;
          }

          // Get top links
          const topLinksSQL = `
            SELECT 
              short_code as shortCode,
              original_url as originalUrl,
              clicks
            FROM short_urls 
            WHERE clicks > 0
            ORDER BY clicks DESC 
            LIMIT 10
          `;
          
          this.db.all(topLinksSQL, [], (err, topLinks) => {
            if (err) {
              reject(err);
              return;
            }

            // Get referrer stats
            const referrerSQL = `
              SELECT 
                CASE 
                  WHEN user_agent LIKE '%Chrome%' THEN 'Chrome'
                  WHEN user_agent LIKE '%Firefox%' THEN 'Firefox'
                  WHEN user_agent LIKE '%Safari%' AND user_agent NOT LIKE '%Chrome%' THEN 'Safari'
                  WHEN user_agent LIKE '%Edge%' THEN 'Edge'
                  ELSE 'Other'
                END as browser,
                COUNT(*) as count
              FROM short_urls 
              WHERE user_agent IS NOT NULL
              GROUP BY browser
              ORDER BY count DESC
            `;
            
            this.db.all(referrerSQL, [], (err, referrerStats) => {
              if (err) {
                reject(err);
                return;
              }

              // Get country stats (simplified since we don't collect geo data)
              const countrySQL = `
                SELECT 
                  'Unknown' as country,
                  COUNT(*) as count
                FROM short_urls 
                LIMIT 1
              `;
              
              this.db.all(countrySQL, [], (err, countryStats) => {
                if (err) {
                  reject(err);
                  return;
                }

                // Get top domains
                const topDomainsSQL = `
                  SELECT 
                    CASE 
                      WHEN original_url LIKE 'https://www.%' THEN SUBSTR(original_url, 13, INSTR(SUBSTR(original_url, 13), '/') - 1)
                      WHEN original_url LIKE 'http://www.%' THEN SUBSTR(original_url, 12, INSTR(SUBSTR(original_url, 12), '/') - 1)
                      WHEN original_url LIKE 'https://%' THEN SUBSTR(original_url, 9, INSTR(SUBSTR(original_url, 9), '/') - 1)
                      WHEN original_url LIKE 'http://%' THEN SUBSTR(original_url, 8, INSTR(SUBSTR(original_url, 8), '/') - 1)
                      ELSE SUBSTR(original_url, 1, INSTR(original_url, '/') - 1)
                    END as domain,
                    COUNT(*) as count,
                    SUM(clicks) as total_clicks
                  FROM short_urls 
                  WHERE original_url IS NOT NULL
                  GROUP BY domain
                  HAVING domain != '' AND domain NOT NULL
                  ORDER BY total_clicks DESC, count DESC
                  LIMIT 10
                `;

                this.db.all(topDomainsSQL, [], (err, topDomains) => {
                  if (err) {
                    reject(err);
                    return;
                  }

                  // Get visitor stats (estimate based on unique IPs and clicks)
                  const visitorStatsSQL = `
                    SELECT 
                      COUNT(DISTINCT ip_address) as totalVisitors,
                      COUNT(DISTINCT CASE WHEN created_at > datetime('now', '-1 day') THEN ip_address END) as visitsToday
                    FROM short_urls 
                    WHERE ip_address IS NOT NULL AND ip_address != ''
                  `;

                  this.db.get(visitorStatsSQL, [], (err, visitorStats) => {
                    if (err) {
                      reject(err);
                      return;
                    }

                    resolve({
                      totalLinks: stats.totalLinks || 0,
                      totalClicks: stats.totalClicks || 0,
                      activeLinks: stats.activeLinks || 0,
                      linksToday: stats.linksToday || 0,
                      clicksByDay: clicksByDay || [],
                      topLinks: topLinks || [],
                      referrerStats: referrerStats || [],
                      countryStats: countryStats || [],
                      topDomains: topDomains || [],
                      totalVisitors: visitorStats?.totalVisitors || 0,
                      visitsToday: visitorStats?.visitsToday || 0
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  deleteLink(shortCode) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM short_urls WHERE short_code = ?';
      this.db.run(sql, [shortCode], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  findById(id) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM short_urls WHERE id = ?';
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  toggleLinkStatus(shortCode) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE short_urls SET is_active = NOT is_active WHERE short_code = ?';
      this.db.run(sql, [shortCode], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  updateLinkDescription(shortCode, description) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE short_urls SET description = ? WHERE short_code = ?';
      this.db.run(sql, [description || '', shortCode], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  getAllLinks() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          id,
          short_code,
          original_url,
          clicks,
          created_at,
          expires_at,
          description,
          is_active,
          last_accessed as last_clicked,
          custom_options
        FROM short_urls 
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

  getStats() {
    return new Promise((resolve, reject) => {
      const queries = [
        'SELECT COUNT(*) as totalLinks FROM short_urls',
        'SELECT SUM(clicks) as totalClicks FROM short_urls',
        'SELECT COUNT(*) as linksToday FROM short_urls WHERE date(created_at) = date("now")',
        'SELECT COUNT(*) as clicksToday FROM clicks WHERE date(clicked_at) = date("now")'
      ];

      Promise.all(queries.map(query => 
        new Promise((res, rej) => {
          this.db.get(query, [], (err, row) => {
            if (err) rej(err);
            else res(row);
          });
        })
      )).then(results => {
        resolve({
          totalLinks: results[0].totalLinks || 0,
          totalClicks: results[1].totalClicks || 0,
          linksToday: results[2].linksToday || 0,
          clicksToday: results[3].clicksToday || 0,
          topLinks: [],
          recentActivity: []
        });
      }).catch(reject);
    });
  }

  getAnalytics() {
    return new Promise((resolve, reject) => {
      const queries = {
        totalLinks: 'SELECT COUNT(*) as count FROM short_urls',
        totalClicks: 'SELECT SUM(clicks) as count FROM short_urls',
        activeLinks: 'SELECT COUNT(*) as count FROM short_urls WHERE is_active = 1',
        linksToday: 'SELECT COUNT(*) as count FROM short_urls WHERE date(created_at) = date("now")',
        topLinks: `
          SELECT short_code as shortCode, original_url as originalUrl, clicks 
          FROM short_urls 
          ORDER BY clicks DESC 
          LIMIT 10
        `,
        clicksByDay: `
          SELECT 
            date(created_at) as date,
            COUNT(*) as links_created,
            SUM(clicks) as total_clicks
          FROM short_urls 
          WHERE created_at >= date('now', '-30 days')
          GROUP BY date(created_at)
          ORDER BY date(created_at) DESC
        `,
        referrerStats: `
          SELECT 
            CASE 
              WHEN user_agent LIKE '%Chrome%' THEN 'Chrome'
              WHEN user_agent LIKE '%Firefox%' THEN 'Firefox'
              WHEN user_agent LIKE '%Safari%' THEN 'Safari'
              WHEN user_agent LIKE '%Edge%' THEN 'Edge'
              ELSE 'Other'
            END as browser,
            COUNT(*) as count
          FROM clicks 
          GROUP BY browser
          ORDER BY count DESC
        `,
        countryStats: `
          SELECT 'Unknown' as country, COUNT(*) as count
          FROM clicks
          GROUP BY country
          ORDER BY count DESC
          LIMIT 10
        `
      };

      const executeQueries = async () => {
        const results = {};
        
        for (const [key, query] of Object.entries(queries)) {
          try {
            if (key === 'topLinks' || key === 'clicksByDay' || key === 'referrerStats' || key === 'countryStats') {
              results[key] = await new Promise((res, rej) => {
                this.db.all(query, [], (err, rows) => {
                  if (err) rej(err);
                  else res(rows || []);
                });
              });
            } else {
              const result = await new Promise((res, rej) => {
                this.db.get(query, [], (err, row) => {
                  if (err) rej(err);
                  else res(row);
                });
              });
              results[key] = result?.count || 0;
            }
          } catch (error) {
            console.error(`Error executing query ${key}:`, error);
            if (key === 'topLinks' || key === 'clicksByDay' || key === 'referrerStats' || key === 'countryStats') {
              results[key] = [];
            } else {
              results[key] = 0;
            }
          }
        }
        
        return results;
      };

      executeQueries()
        .then(resolve)
        .catch(reject);
    });
  }

  updateLink(id, data) {
    return new Promise((resolve, reject) => {
      const { description, isActive } = data;
      const sql = 'UPDATE short_urls SET description = ? WHERE id = ?';
      this.db.run(sql, [description || '', id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // Bug Report Methods
  createBugReport(data) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO bug_reports (title, description, severity, type, email, steps, expected, actual, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      this.db.run(sql, [
        data.title,
        data.description,
        data.severity || 'medium',
        data.type || 'bug',
        data.email || null,
        data.steps || null,
        data.expected || null,
        data.actual || null,
        data.ip_address || null,
        data.user_agent || null
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            success: true
          });
        }
      });
    });
  }

  getBugReports(filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT id, title, description, severity, type, email, steps, expected, actual, 
               status, created_at, updated_at
        FROM bug_reports 
      `;
      
      const conditions = [];
      const params = [];
      
      if (filters.status) {
        conditions.push('status = ?');
        params.push(filters.status);
      }
      
      if (filters.type) {
        conditions.push('type = ?');
        params.push(filters.type);
      }
      
      if (filters.severity) {
        conditions.push('severity = ?');
        params.push(filters.severity);
      }
      
      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }
      
      sql += ' ORDER BY created_at DESC';
      
      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(filters.limit);
      }
      
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows || []);
        }
      });
    });
  }

  updateBugReportStatus(id, status) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE bug_reports SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      
      this.db.run(sql, [status, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  getBugReportStats() {
    return new Promise((resolve, reject) => {
      const queries = {
        total: 'SELECT COUNT(*) as count FROM bug_reports',
        open: 'SELECT COUNT(*) as count FROM bug_reports WHERE status = "open"',
        inProgress: 'SELECT COUNT(*) as count FROM bug_reports WHERE status = "in_progress"',
        closed: 'SELECT COUNT(*) as count FROM bug_reports WHERE status = "closed"',
        byType: `
          SELECT type, COUNT(*) as count 
          FROM bug_reports 
          GROUP BY type 
          ORDER BY count DESC
        `,
        bySeverity: `
          SELECT severity, COUNT(*) as count 
          FROM bug_reports 
          GROUP BY severity 
          ORDER BY 
            CASE severity 
              WHEN 'critical' THEN 1 
              WHEN 'high' THEN 2 
              WHEN 'medium' THEN 3 
              WHEN 'low' THEN 4 
            END
        `,
        recent: `
          SELECT title, type, severity, created_at 
          FROM bug_reports 
          ORDER BY created_at DESC 
          LIMIT 5
        `
      };

      const executeQueries = async () => {
        const results = {};
        
        for (const [key, query] of Object.entries(queries)) {
          try {
            if (key === 'byType' || key === 'bySeverity' || key === 'recent') {
              results[key] = await new Promise((res, rej) => {
                this.db.all(query, [], (err, rows) => {
                  if (err) rej(err);
                  else res(rows || []);
                });
              });
            } else {
              const result = await new Promise((res, rej) => {
                this.db.get(query, [], (err, row) => {
                  if (err) rej(err);
                  else res(row);
                });
              });
              results[key] = result?.count || 0;
            }
          } catch (error) {
            console.error(`Error executing bug report query ${key}:`, error);
            if (key === 'byType' || key === 'bySeverity' || key === 'recent') {
              results[key] = [];
            } else {
              results[key] = 0;
            }
          }
        }
        
        return results;
      };

      executeQueries()
        .then(resolve)
        .catch(reject);
    });
  }

}

module.exports = Database;
