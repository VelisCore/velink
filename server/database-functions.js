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
