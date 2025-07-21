const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    const dbPath = path.join(__dirname, 'velink.db');
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
        ip_address TEXT,
        user_agent TEXT
      )
    `;

    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_short_code ON short_urls(short_code);
      CREATE INDEX IF NOT EXISTS idx_original_url ON short_urls(original_url);
      CREATE INDEX IF NOT EXISTS idx_created_at ON short_urls(created_at);
    `;

    this.db.serialize(() => {
      this.db.run(createTableSQL);
      this.db.run(createIndexSQL);
    });
  }

  createShortUrl(data) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO short_urls (short_code, original_url, ip_address, user_agent)
        VALUES (?, ?, ?, ?)
      `;
      
      this.db.run(sql, [data.shortCode, data.originalUrl, data.ip, data.userAgent], function(err) {
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
      const sql = 'UPDATE short_urls SET clicks = clicks + 1 WHERE short_code = ?';
      this.db.run(sql, [shortCode], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
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
}

module.exports = Database;
