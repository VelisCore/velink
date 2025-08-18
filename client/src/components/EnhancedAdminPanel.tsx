import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, BarChart3, Download, Settings, Activity, Database, 
  RefreshCw, Save, TrendingUp, Clock, Lock, Eye, EyeOff,
  Trash2, Edit3, Copy, Search, FileText, Globe, AlertTriangle,
  CheckCircle, HardDrive, Server, Zap, X, Plus, PieChart,
  ArrowUpRight, Link as LinkIcon, Cpu, MemoryStick, Gauge
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LinkInterface {
  _id: string;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  clicks: number;
  lastClicked?: string;
  isActive?: boolean;
  description?: string;
  expiresAt?: string;
  password?: string;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  method?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
}

interface AnalyticsData {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  linksToday: number;
  clicksByDay: Array<{ date: string; links_created: number; total_clicks: number }>;
  topLinks: Array<{ shortCode: string; originalUrl: string; clicks: number }>;
  referrerStats: Array<{ browser: string; count: number }>;
  countryStats: Array<{ country: string; count: number }>;
  topReferrers?: Array<{ domain: string; clicks: number }>;
  deviceStats?: Array<{ device: string; count: number }>;
  browserStats?: Array<{ browser: string; count: number }>;
  topDomains?: Array<{ domain: string; count: number; total_clicks: number }>;
  totalVisitors?: number;
  visitsToday?: number;
}

interface SystemInfo {
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  diskUsage: {
    used: number;
    total: number;
    percentage: number;
  };
  cpuUsage: number;
  loadAverage: number[];
  dbSize: number;
  activeConnections: number;
  version: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  processes: Array<{
    name: string;
    pid: number;
    cpu: number;
    memory: number;
  }>;
  network: {
    bytesReceived: number;
    bytesSent: number;
    connections: number;
  };
  security: {
    sslEnabled: boolean;
    httpsRedirect: boolean;
    rateLimiting: boolean;
    blockedIPs: number;
    lastSecurityScan: string;
    vulnerabilities: number;
  };
}

type TabType = 'dashboard' | 'links' | 'analytics' | 'system' | 'logs' | 'database' | 'settings' | 'update' | 'security' | 'reports';

const EnhancedAdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  
  // Enhanced state management
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'reconnecting'>('online');
  
  // Data states
  const [links, setLinks] = useState<LinkInterface[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Update management state
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>('');
  const [currentVersion, setCurrentVersion] = useState<string>('');
  const [latestVersion, setLatestVersion] = useState<string>('');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<number>(0);
  
  // Settings state
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Velink',
    baseUrl: 'velink.me',
    allowPublicLinks: true,
    requirePasswords: false,
    defaultExpiry: '1 year',
    maxLinksPerIP: 100,
    analyticsEnabled: true,
    maintenanceMode: false
  });

  // Authentication
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        toast.success('Login successful!');
      } else {
        toast.error('Invalid admin token');
      }
    } catch (error) {
      toast.error('Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced data fetching with real-time features
  const fetchLinks = useCallback(async (showToast = false) => {
    if (!token) return;
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/links', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLinks(data.links || []);
        setConnectionStatus('online');
        if (showToast) toast.success('Links refreshed successfully');
      } else {
        throw new Error('Failed to fetch links');
      }
    } catch (error) {
      console.error('Failed to fetch links:', error);
      setConnectionStatus('offline');
      if (showToast) toast.error('Failed to refresh links');
    } finally {
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  }, [token]);

  const fetchAnalytics = useCallback(async (showToast = false) => {
    if (!token) return;
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
        setConnectionStatus('online');
        if (showToast) toast.success('Analytics refreshed successfully');
      } else {
        throw new Error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setConnectionStatus('offline');
      if (showToast) toast.error('Failed to refresh analytics');
    } finally {
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  }, [token]);

  const fetchSystemInfo = useCallback(async (showToast = false) => {
    if (!token) return;
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/system-info', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSystemInfo(data);
        setConnectionStatus('online');
        if (showToast) toast.success('System info refreshed successfully');
      } else {
        throw new Error('Failed to fetch system info');
      }
    } catch (error) {
      console.error('Failed to fetch system info:', error);
      setConnectionStatus('offline');
      if (showToast) toast.error('Failed to refresh system info');
    } finally {
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  }, [token]);

  const fetchLogs = useCallback(async (showToast = false) => {
    if (!token) return;
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setConnectionStatus('online');
        if (showToast) toast.success('Logs refreshed successfully');
      } else {
        throw new Error('Failed to fetch logs');
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setConnectionStatus('offline');
      if (showToast) toast.error('Failed to refresh logs');
    } finally {
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  }, [token]);

  // Comprehensive refresh function
  const refreshAllData = useCallback(async (showToast = true) => {
    setRefreshing(true);
    const promises = [
      fetchLinks(false),
      fetchAnalytics(false),
      fetchSystemInfo(false),
      fetchLogs(false)
    ];
    
    try {
      await Promise.all(promises);
      setConnectionStatus('online');
      if (showToast) toast.success('All data refreshed successfully');
    } catch (error) {
      setConnectionStatus('offline');
      if (showToast) toast.error('Some data failed to refresh');
    } finally {
      setRefreshing(false);
      setLastRefresh(new Date());
    }
  }, [fetchLinks, fetchAnalytics, fetchSystemInfo, fetchLogs]);

  // Database operations
  const createBackup = useCallback(async () => {
    if (!token) return;
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/database/backup', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(`Backup created: ${data.filename}`);
        await fetchSystemInfo();
      } else {
        throw new Error('Failed to create backup');
      }
    } catch (error) {
      toast.error('Failed to create backup');
    } finally {
      setRefreshing(false);
    }
  }, [token, fetchSystemInfo]);

  // Enhanced useEffect with auto-refresh
  useEffect(() => {
    if (isAuthenticated && token) {
      switch (activeTab) {
        case 'dashboard':
          fetchLinks();
          fetchAnalytics();
          fetchSystemInfo();
          break;
        case 'links':
          fetchLinks();
          break;
        case 'analytics':
          fetchAnalytics();
          break;
        case 'system':
          fetchSystemInfo();
          break;
        case 'logs':
          fetchLogs();
          break;
      }
    }
  }, [isAuthenticated, token, activeTab, fetchLinks, fetchAnalytics, fetchSystemInfo, fetchLogs]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!isAuthenticated || !autoRefresh) return;

    const interval = setInterval(() => {
      switch (activeTab) {
        case 'dashboard':
          fetchLinks(false);
          fetchAnalytics(false);
          fetchSystemInfo(false);
          break;
        case 'links':
          fetchLinks(false);
          break;
        case 'analytics':
          fetchAnalytics(false);
          break;
        case 'system':
          fetchSystemInfo(false);
          break;
        case 'logs':
          fetchLogs(false);
          break;
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, autoRefresh, activeTab, fetchLinks, fetchAnalytics, fetchSystemInfo, fetchLogs]);

  // Connection status monitoring
  useEffect(() => {
    const handleOnline = () => setConnectionStatus('online');
    const handleOffline = () => setConnectionStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Velink Admin</h1>
            <p className="text-gray-600 mt-2">Enter your admin token to continue</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="input-primary"
                placeholder="Enter admin token..."
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Access Admin Panel</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Velink Admin</h1>
              </div>
              
              {/* Tab Navigation */}
              <div className="hidden md:flex space-x-1">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                  { id: 'links', label: 'Links', icon: LinkIcon },
                  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                  { id: 'system', label: 'System', icon: Server },
                  { id: 'logs', label: 'Logs', icon: FileText },
                  { id: 'database', label: 'Database', icon: Database },
                  { id: 'settings', label: 'Settings', icon: Settings },
                  { id: 'security', label: 'Security', icon: Shield },
                  { id: 'reports', label: 'Reports', icon: PieChart },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as TabType)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Status and Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  connectionStatus === 'online' ? 'bg-green-500 animate-pulse' :
                  connectionStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                }`}></div>
                <span className="text-sm text-gray-600 capitalize">{connectionStatus}</span>
              </div>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => refreshAllData()}
                disabled={refreshing}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <span className="text-xs text-gray-500">
                Last: {lastRefresh.toLocaleTimeString()}
              </span>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {/* Enhanced Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Live Dashboard</h2>
                <p className="text-gray-600 mt-2">Real-time overview of your Velink system</p>
              </div>
              
              {/* Enhanced Stats Grid with Real Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl shadow-lg text-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total Links</p>
                      <p className="text-3xl font-bold">{analytics?.totalLinks?.toLocaleString() || 0}</p>
                      <p className="text-blue-200 text-xs mt-1">+{analytics?.linksToday || 0} today</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg">
                      <LinkIcon className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-blue-200">
                    Growth: {analytics?.totalLinks && analytics?.linksToday 
                      ? ((analytics.linksToday / analytics.totalLinks) * 100).toFixed(1)
                      : 0}% today
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl shadow-lg text-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Clicks</p>
                      <p className="text-3xl font-bold">{analytics?.totalClicks?.toLocaleString() || 0}</p>
                      <p className="text-green-200 text-xs mt-1">All time traffic</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg">
                      <ArrowUpRight className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-green-200">
                    Avg: {analytics?.totalClicks && analytics?.totalLinks 
                      ? (analytics.totalClicks / analytics.totalLinks).toFixed(1)
                      : 0} clicks/link
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl shadow-lg text-white"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Active Links</p>
                      <p className="text-3xl font-bold">{analytics?.activeLinks?.toLocaleString() || 0}</p>
                      <p className="text-purple-200 text-xs mt-1">Currently working</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg">
                      <CheckCircle className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-purple-200">
                    Active: {analytics?.totalLinks && analytics?.activeLinks 
                      ? ((analytics.activeLinks / analytics.totalLinks) * 100).toFixed(1)
                      : 0}%
                  </div>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className={`p-6 rounded-xl shadow-lg text-white transition-all duration-300 ${
                    systemInfo?.memoryUsage?.percentage && systemInfo.memoryUsage.percentage > 80 
                      ? 'bg-gradient-to-br from-red-500 to-red-600'
                      : systemInfo?.memoryUsage?.percentage && systemInfo.memoryUsage.percentage > 60
                      ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                      : 'bg-gradient-to-br from-green-500 to-green-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium">System Health</p>
                      <p className="text-xl font-bold">
                        {systemInfo?.memoryUsage?.percentage 
                          ? `${systemInfo.memoryUsage.percentage.toFixed(1)}%`
                          : 'Loading...'
                        }
                      </p>
                      <p className="text-white/70 text-xs mt-1">Memory usage</p>
                    </div>
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Server className="w-8 h-8" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-white/70">
                    CPU: {systemInfo?.cpuUsage?.toFixed(1) || '0'}% • 
                    Uptime: {systemInfo?.uptime 
                      ? Math.floor(systemInfo.uptime / 3600) + 'h'
                      : '0h'
                    }
                  </div>
                </motion.div>
              </div>

              {/* Enhanced Real-time Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Real-time Activity Feed */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Live Activity Feed</h3>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-600">Live</span>
                      </div>
                      <button
                        onClick={() => fetchLogs(true)}
                        disabled={refreshing}
                        className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                    {logs.length > 0 ? logs.slice(0, 8).map((log, index) => (
                      <motion.div 
                        key={`${log.timestamp}-${index}`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                          log.level === 'error' ? 'bg-red-500' :
                          log.level === 'warn' ? 'bg-yellow-500' : 
                          log.level === 'info' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-medium">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                              log.level === 'error' ? 'bg-red-100 text-red-700' :
                              log.level === 'warn' ? 'bg-yellow-100 text-yellow-700' : 
                              log.level === 'info' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {log.level.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 mt-1">{log.message}</p>
                          {log.url && (
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                              <span className="font-medium">{log.method}</span>
                              <span className="text-blue-600">{log.url}</span>
                              {log.ip && <span>• {log.ip}</span>}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No recent activity</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Top Links with Real Data */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Top Performing Links</h3>
                    <button
                      onClick={() => fetchAnalytics(true)}
                      disabled={refreshing}
                      className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {(analytics?.topLinks || []).length > 0 ? 
                      (analytics?.topLinks || []).slice(0, 5).map((link, index) => (
                        <motion.div 
                          key={link.shortCode}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              index === 0 ? 'bg-yellow-100 text-yellow-600' :
                              index === 1 ? 'bg-gray-100 text-gray-600' :
                              index === 2 ? 'bg-orange-100 text-orange-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              <span className="font-bold text-sm">#{index + 1}</span>
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-blue-600">/{link.shortCode}</p>
                              <button 
                                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/${link.shortCode}`)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 truncate">{link.originalUrl}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-gray-900">{link.clicks.toLocaleString()}</p>
                            <p className="text-xs text-gray-500">clicks</p>
                          </div>
                        </motion.div>
                      )) : (
                        <div className="text-center py-8 text-gray-500">
                          <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>No links found</p>
                        </div>
                      )
                    }
                  </div>
                </div>
              </div>

              {/* Real-time System Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">System Performance</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <button
                        onClick={() => fetchSystemInfo(true)}
                        disabled={refreshing}
                        className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">CPU Usage</span>
                      <span className={`text-sm font-medium ${
                        (systemInfo?.cpuUsage || 0) > 80 ? 'text-red-600' :
                        (systemInfo?.cpuUsage || 0) > 60 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {systemInfo?.cpuUsage?.toFixed(1) || '0'}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (systemInfo?.cpuUsage || 0) > 80 ? 'bg-red-500' :
                          (systemInfo?.cpuUsage || 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(systemInfo?.cpuUsage || 0, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Memory Usage</span>
                      <span className={`text-sm font-medium ${
                        (systemInfo?.memoryUsage?.percentage || 0) > 80 ? 'text-red-600' :
                        (systemInfo?.memoryUsage?.percentage || 0) > 60 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {systemInfo?.memoryUsage?.percentage?.toFixed(1) || '0'}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (systemInfo?.memoryUsage?.percentage || 0) > 80 ? 'bg-red-500' :
                          (systemInfo?.memoryUsage?.percentage || 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(systemInfo?.memoryUsage?.percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Disk Usage</span>
                      <span className={`text-sm font-medium ${
                        (systemInfo?.diskUsage?.percentage || 0) > 80 ? 'text-red-600' :
                        (systemInfo?.diskUsage?.percentage || 0) > 60 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {systemInfo?.diskUsage?.percentage?.toFixed(1) || '0'}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          (systemInfo?.diskUsage?.percentage || 0) > 80 ? 'bg-red-500' :
                          (systemInfo?.diskUsage?.percentage || 0) > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(systemInfo?.diskUsage?.percentage || 0, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Quick Actions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setActiveTab('links')}
                      className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Plus className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Create New Link</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => setActiveTab('analytics')}
                      className="w-full text-left p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Download className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">View Analytics</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => setActiveTab('system')}
                      className="w-full text-left p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Settings className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">System Monitor</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => createBackup()}
                      disabled={refreshing}
                      className="w-full text-left p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center space-x-3">
                        <Database className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-orange-900">Create Backup</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Enhanced Server Info with Real Data */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Server Information</h3>
                    <button
                      onClick={() => fetchSystemInfo(true)}
                      disabled={refreshing}
                      className="text-blue-600 hover:text-blue-700 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime</span>
                      <span className="font-medium">
                        {systemInfo?.uptime 
                          ? `${Math.floor(systemInfo.uptime / 86400)}d ${Math.floor((systemInfo.uptime % 86400) / 3600)}h ${Math.floor((systemInfo.uptime % 3600) / 60)}m`
                          : 'Loading...'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version</span>
                      <span className="font-medium">{systemInfo?.version || 'v1.0.0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Node.js</span>
                      <span className="font-medium">{systemInfo?.nodeVersion || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Platform</span>
                      <span className="font-medium">{systemInfo?.platform || 'Unknown'} ({systemInfo?.arch || 'Unknown'})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Database</span>
                      <span className="font-medium text-green-600">
                        {systemInfo?.dbSize 
                          ? `Connected (${(systemInfo.dbSize / 1024 / 1024).toFixed(1)} MB)`
                          : 'Connected'
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Connections</span>
                      <span className="font-medium">{systemInfo?.activeConnections || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Placeholder for other tabs */}
          {activeTab !== 'dashboard' && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
              </h2>
              <p className="text-gray-600 mb-8">
                This section is being enhanced with real-time features and comprehensive functionality.
              </p>
              <button
                onClick={() => refreshAllData()}
                disabled={refreshing}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 mx-auto"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default EnhancedAdminPanel;
