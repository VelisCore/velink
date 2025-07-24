  // Get detailed stats for the API
  getDetailedStats() {
    return new Promise((resolve, reject) => {
      const basicStatsSql = `
        SELECT 
          COUNT(*) as total_links,
          SUM(clicks) as total_clicks,
          MAX(created_at) as latest_created,
          COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_links,
          COUNT(CASE WHEN date(created_at) = date('now') THEN 1 END) as links_today,
          ROUND(CAST(SUM(clicks) AS FLOAT) / NULLIF(COUNT(*), 0), 2) as avg_clicks_per_link
        FROM short_urls
      `;

      const topDomainsSql = `
        SELECT 
          substr(original_url, instr(original_url, '://') + 3, 
                 case when instr(substr(original_url, instr(original_url, '://') + 3), '/') = 0
                      then length(substr(original_url, instr(original_url, '://') + 3))
                      else instr(substr(original_url, instr(original_url, '://') + 3), '/') - 1
                 end) as domain,
          COUNT(*) as count,
          SUM(clicks) as total_clicks
        FROM short_urls
        GROUP BY domain
        ORDER BY count DESC
        LIMIT 10
      `;

      const clicksByDaySql = `
        SELECT 
          date(created_at) as date,
          COUNT(*) as links_created,
          SUM(clicks) as total_clicks
        FROM short_urls
        WHERE created_at >= date('now', '-30 days')
        GROUP BY date(created_at)
        ORDER BY date DESC
        LIMIT 30
      `;

      const hourlyStatsSql = `
        SELECT 
          strftime('%H', created_at) as hour,
          COUNT(*) as links_created
        FROM short_urls
        WHERE created_at >= date('now', '-7 days')
        GROUP BY strftime('%H', created_at)
        ORDER BY links_created DESC
      `;

      const recentActivitySql = `
        SELECT 
          short_code,
          substr(original_url, 1, 50) || (CASE WHEN length(original_url) > 50 THEN '...' ELSE '' END) as original_url,
          clicks,
          created_at,
          description
        FROM short_urls
        ORDER BY created_at DESC
        LIMIT 10
      `;

      const weeklyActivitySql = `
        SELECT 
          COUNT(*) as links_this_week,
          SUM(clicks) as clicks_this_week
        FROM short_urls
        WHERE created_at >= date('now', '-7 days')
      `;

      const monthlyGrowthSql = `
        SELECT 
          COUNT(*) as links_this_month,
          SUM(clicks) as clicks_this_month,
          (SELECT COUNT(*) FROM short_urls WHERE created_at >= date('now', '-60 days') AND created_at < date('now', '-30 days')) as links_last_month
        FROM short_urls
        WHERE created_at >= date('now', '-30 days')
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
        }),
        new Promise((res, rej) => {
          this.db.all(hourlyStatsSql, [], (err, rows) => {
            if (err) return rej(err);
            res(rows);
          });
        }),
        new Promise((res, rej) => {
          this.db.all(recentActivitySql, [], (err, rows) => {
            if (err) return rej(err);
            res(rows);
          });
        }),
        new Promise((res, rej) => {
          this.db.get(weeklyActivitySql, [], (err, row) => {
            if (err) return rej(err);
            res(row || {});
          });
        }),
        new Promise((res, rej) => {
          this.db.get(monthlyGrowthSql, [], (err, row) => {
            if (err) return rej(err);
            res(row || {});
          });
        })
      ])
        .then(([basicStats, topDomains, clicksByDay, hourlyStats, recentActivity, weeklyActivity, monthlyGrowth]) => {
          // Calculate monthly growth percentage
          const growthPercent = monthlyGrowth.links_last_month > 0 ? 
            ((monthlyGrowth.links_this_month - monthlyGrowth.links_last_month) / monthlyGrowth.links_last_month * 100).toFixed(1) :
            monthlyGrowth.links_this_month > 0 ? 100 : 0;

          resolve({
            totalLinks: basicStats.total_links || 0,
            totalClicks: basicStats.total_clicks || 0,
            latestCreated: basicStats.latest_created,
            activeLinks: basicStats.active_links || 0,
            linksToday: basicStats.links_today || 0,
            avgClicksPerLink: basicStats.avg_clicks_per_link || 0,
            topDomains,
            clicksByDay,
            hourlyStats,
            recentActivity,
            dailyAverage: clicksByDay.length > 0 ? 
              Math.round(clicksByDay.reduce((sum, day) => sum + (day.links_created || 0), 0) / clicksByDay.length) : 0,
            weeklyActivity: weeklyActivity.links_this_week || 0,
            weeklyClicks: weeklyActivity.clicks_this_week || 0,
            monthlyGrowth: growthPercent,
            linksThisMonth: monthlyGrowth.links_this_month || 0,
            linksLastMonth: monthlyGrowth.links_last_month || 0
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
