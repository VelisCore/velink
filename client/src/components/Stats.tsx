import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, MousePointer, Clock, TrendingUp, Globe, BarChart2, Activity } from 'lucide-react';
import axios from 'axios';

interface StatsData {
  totalLinks: number;
  totalClicks: number;
  latestCreated: string | null;
  topDomains?: Array<{domain: string, count: number}>;
  clicksByDay?: Array<{date: string, clicks: number}>;
  dailyAverage?: number;
}

const Stats: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    totalLinks: 0,
    totalClicks: 0,
    latestCreated: null,
    dailyAverage: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [useDetailedStats, setUseDetailedStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // First try to get detailed stats from v1 API
        try {
          const response = await axios.get('/api/v1/stats');
          const detailedData = response.data;
          
          // Calculate daily average clicks from the last 7 days if we have the data
          let dailyAverage = 0;
          if (detailedData.clicksByDay && detailedData.clicksByDay.length > 0) {
            const last7Days = detailedData.clicksByDay.slice(0, 7);
            const total = last7Days.reduce((sum: number, day: {date: string, clicks: number}) => sum + day.clicks, 0);
            dailyAverage = Math.round(total / last7Days.length);
          }
          
          setStats({
            totalLinks: detailedData.totalLinks || 0,
            totalClicks: detailedData.totalClicks || 0,
            latestCreated: detailedData.latestCreated,
            topDomains: detailedData.topDomains,
            clicksByDay: detailedData.clicksByDay,
            dailyAverage
          });
          setUseDetailedStats(true);
          setError(null);
        } catch (err) {
          // Fallback to basic stats if detailed stats aren't available
          const response = await axios.get('/api/stats');
          setStats({
            totalLinks: response.data.totalLinks || 0,
            totalClicks: response.data.totalClicks || 0,
            latestCreated: response.data.latestCreated,
            dailyAverage: 0
          });
          setUseDetailedStats(false);
          setError(null);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
        setError('Unable to load statistics. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const getTimeAgo = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const statItems = [
    {
      icon: Link2,
      label: 'Total Links',
      value: formatNumber(stats.totalLinks),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: MousePointer,
      label: 'Total Clicks',
      value: formatNumber(stats.totalClicks),
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: TrendingUp,
      label: 'Avg. Clicks/Link',
      value: stats.totalLinks > 0 ? (stats.totalClicks / stats.totalLinks).toFixed(1) : '0',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      icon: Clock,
      label: 'Latest Link',
      value: getTimeAgo(stats.latestCreated),
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <section id="stats" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Live Statistics
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real-time data from our URL shortening platform. These numbers update 
            automatically as users create and share links.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="card animate-pulse">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg mr-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="card group hover:shadow-2xl"
              >
                <div className="flex items-center mb-4">
                  <div className={`${item.bgColor} p-3 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-200`}>
                    <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                  </div>
                  <span className="text-gray-600 font-medium">{item.label}</span>
                </div>
                <div className={`text-3xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                  {item.value}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Detailed stats section */}
        {!isLoading && stats.topDomains && stats.clicksByDay && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Top domains */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="h-5 w-5 text-primary-600 mr-2" />
                Top Domains
              </h3>
              <div className="space-y-4">
                {stats.topDomains.slice(0, 5).map((domain, index) => (
                  <div key={domain.domain} className="flex items-center">
                    <div className="w-8 text-gray-500 text-sm">{index + 1}.</div>
                    <div className="flex-1 truncate" title={domain.domain}>
                      {domain.domain}
                    </div>
                    <div className="font-semibold text-primary-600">{domain.count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clicks by day */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="h-5 w-5 text-primary-600 mr-2" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                {stats.clicksByDay.slice(0, 5).map((day) => (
                  <div key={day.date} className="flex items-center">
                    <div className="w-24 text-gray-500 text-sm">
                      {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-200 h-2 rounded-full w-full">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (day.clicks / ((stats.dailyAverage || 1) * 2) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-right font-semibold text-primary-600">{day.clicks}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 bg-red-50 text-red-800 p-4 rounded-lg text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Platform performance stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gray-50 rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Platform Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-1">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-1">&lt;100ms</div>
                <div className="text-sm text-gray-600">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-1">24/7</div>
                <div className="text-sm text-gray-600">Monitoring</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Stats;
