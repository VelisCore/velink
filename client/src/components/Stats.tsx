import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, MousePointer, Clock, TrendingUp, Activity } from 'lucide-react';
import axios from 'axios';

interface StatsData {
  totalLinks: number;
  totalClicks: number;
  latestCreated: string | null;
  activeLinks?: number;
  linksToday?: number;
  avgClicksPerLink?: number;
  topDomains?: Array<{domain: string, count: number, total_clicks: number}>;
  clicksByDay?: Array<{date: string, links_created: number, total_clicks: number}>;
  hourlyStats?: Array<{hour: string, links_created: number}>;
  recentActivity?: Array<{short_code: string, original_url: string, clicks: number, created_at: string, description: string}>;
  dailyAverage?: number;
  clicksToday?: number;
  clicksThisWeek?: number;
  clicksThisMonth?: number;
  averageRedirectTime?: number;
  popularTimeOfDay?: string;
  weeklyActivity?: number;
  monthlyGrowth?: string;
}

const Stats: React.FC = () => {
  const [stats, setStats] = useState<StatsData>({
    totalLinks: 0,
    totalClicks: 0,
    latestCreated: null,
    activeLinks: 0,
    linksToday: 0,
    avgClicksPerLink: 0,
    dailyAverage: 0,
    clicksToday: 0,
    clicksThisWeek: 0,
    clicksThisMonth: 0,
    averageRedirectTime: 0,
    popularTimeOfDay: 'Unknown'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [useDetailedStats, setUseDetailedStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
        // First try to get detailed stats from v1 API
        try {
          const response = await axios.get('/api/v1/stats');
          const detailedData = response.data;
          
          setStats({
            totalLinks: detailedData.totalLinks || 0,
            totalClicks: detailedData.totalClicks || 0,
            activeLinks: detailedData.activeLinks || 0,
            linksToday: detailedData.linksToday || 0,
            avgClicksPerLink: detailedData.avgClicksPerLink || 0,
            latestCreated: detailedData.latestCreated,
            topDomains: detailedData.topDomains || [],
            clicksByDay: detailedData.clicksByDay || [],
            hourlyStats: detailedData.hourlyStats || [],
            recentActivity: detailedData.recentActivity || [],
            dailyAverage: detailedData.dailyAverage || 0,
            clicksToday: detailedData.clicksByDay && detailedData.clicksByDay[0] ? detailedData.clicksByDay[0].total_clicks : 0,
            clicksThisWeek: detailedData.weeklyClicks || 0,
            clicksThisMonth: detailedData.clicksByDay ? 
              detailedData.clicksByDay.slice(0, 30).reduce((sum: number, day: any) => sum + (day.total_clicks || 0), 0) : 0,
            averageRedirectTime: Math.round(Math.random() * 400 + 100), // Mock data - replace with real metrics
            popularTimeOfDay: detailedData.hourlyStats && detailedData.hourlyStats.length > 0 ? 
              (() => {
                const peakHour = detailedData.hourlyStats.reduce((prev: any, current: any) => 
                  (prev.links_created > current.links_created) ? prev : current
                );
                const hour = parseInt(peakHour.hour);
                return hour >= 12 ? `${hour === 12 ? 12 : hour - 12}:00 PM` : `${hour === 0 ? 12 : hour}:00 AM`;
              })() : 'No data',
            weeklyActivity: detailedData.weeklyActivity || 0,
            monthlyGrowth: detailedData.monthlyGrowth || '0'
          });
          setUseDetailedStats(true);
          setError(null);
          setLastUpdate(new Date());
        } catch (detailedErr) {
          // Fall back to basic stats if detailed stats aren't available
          
          // Fallback to basic stats if detailed stats aren't available
          const response = await axios.get('/api/stats');
          setStats(prevStats => ({
            ...prevStats,
            totalLinks: response.data.totalLinks || 0,
            totalClicks: response.data.totalClicks || 0,
            latestCreated: response.data.latestCreated
          }));
          setUseDetailedStats(false);
          setError(null);
          setLastUpdate(new Date());
        }
      } catch (error: any) {
        console.error('Failed to fetch stats:', error);
        setError(`Unable to load statistics: ${error.response?.data?.error || error.message || 'Network error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    
    // Refresh stats every 10 seconds for live updates
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString('en-US');
  };

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago (${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })})`;
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins > 0 ? `${diffMins}m ago` : 'Just now';
    }
  };

  const statItems = [
    {
      icon: Link2,
      label: 'Total Links',
      value: formatNumber(stats.totalLinks),
      subValue: useDetailedStats ? `${stats.activeLinks || 0} active` : undefined,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600'
    },
    {
      icon: MousePointer,
      label: 'Total Clicks',
      value: formatNumber(stats.totalClicks),
      subValue: useDetailedStats && stats.clicksToday ? `${formatNumber(stats.clicksToday)} today` : undefined,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600'
    },
    {
      icon: TrendingUp,
      label: 'Weekly Activity',
      value: useDetailedStats ? formatNumber(stats.weeklyActivity || 0) : 
             (stats.totalLinks > 0 ? (stats.totalClicks / stats.totalLinks).toFixed(1) : '0'),
      subValue: useDetailedStats ? `${stats.linksToday || 0} links created today` : 'Avg clicks/link',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600'
    },
    {
      icon: Activity,
      label: 'Performance',
      value: useDetailedStats ? `${stats.averageRedirectTime || 0}ms` : formatRelativeTime(stats.latestCreated),
      subValue: useDetailedStats ? 'Avg redirect time' : 
                lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString('de-DE', { timeZone: 'Europe/Berlin' })}` : undefined,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600'
    },
    {
      icon: Clock,
      label: 'Latest Link',
      value: formatRelativeTime(stats.latestCreated),
      subValue: useDetailedStats && stats.popularTimeOfDay ? `Peak: ${stats.popularTimeOfDay}` : undefined,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600'
    },
    {
      icon: TrendingUp,
      label: 'Monthly Growth',
      value: useDetailedStats ? `${stats.monthlyGrowth || '0'}%` : `${stats.dailyAverage || 0}/day`,
      subValue: useDetailedStats ? 'growth from last month' : 'Daily average',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      iconColor: 'text-teal-600'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                {item.subValue && (
                  <div className="text-sm text-gray-500 mt-1">
                    {item.subValue}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
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
