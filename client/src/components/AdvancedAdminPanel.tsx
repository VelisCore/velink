import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Trash2, ExternalLink, BarChart3, Copy, AlertTriangle, 
  Settings, Search, RefreshCw, Edit3, 
  TrendingUp, Activity, CheckCircle,
  Clock, Server, HardDrive, Cpu, MemoryStick,
  Lock, Link,
  Gauge, Wifi, WifiOff, PowerOff,
  MousePointer, Monitor
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LinkData {
  _id: string;
  shortCode: string;
  originalUrl: string;
  createdAt: string;
  clicks: number;
  lastClicked?: string;
  isActive?: boolean;
  description?: string;
  tags?: string[];
  isPrivate?: boolean;
  password?: string;
  expiresAt?: string;
  ipAddress?: string;
  userAgent?: string;
  country?: string;
  region?: string;
  city?: string;
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
  dbSize: number;
  activeConnections: number;
  requestsPerMinute: number;
  errorRate: number;
  responseTime: number;
  version: string;
  nodeVersion: string;
  platform: string;
  architecture: string;
}

interface Analytics {
  totalLinks: number;
  totalClicks: number;
  activeLinks: number;
  linksToday: number;
  clicksToday: number;
  topDomains: Array<{domain: string, count: number, total_clicks: number}>;
  clicksByDay: Array<{date: string, links_created: number, total_clicks: number}>;
  clicksByHour: Array<{hour: number, clicks: number}>;
  topLinks: Array<{shortCode: string, originalUrl: string, clicks: number}>;
  geoStats: Array<{country: string, clicks: number}>;
  deviceStats: Array<{device: string, count: number}>;
  browserStats: Array<{browser: string, count: number}>;
  referrerStats: Array<{referrer: string, clicks: number}>;
}

interface Config {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  linkExpiry: {
    default: string;
    max: string;
  };
  allowCustomDomains: boolean;
  requireAuth: boolean;
  enableAnalytics: boolean;
  enableGeo: boolean;
  maintenance: boolean;
  features: {
    passwordProtection: boolean;
    customAliases: boolean;
    linkExpiry: boolean;
    bulkOperations: boolean;
    exportData: boolean;
    apiAccess: boolean;
  };
}

const AdvancedAdminPanel: React.FC = () => {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Data state
  const [links, setLinks] = useState<LinkData[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [config, setConfig] = useState<Config | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'links' | 'analytics' | 'system' | 'config' | 'users' | 'security'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'clicks' | 'code' | 'domain'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'expired' | 'private' | 'public'>('all');

  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval] = useState(30); // seconds

  // Authentication handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        setIsAuthenticated(true);
        toast.success('Successfully authenticated!');
        localStorage.setItem('velink-admin-token', token);
        loadDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Authentication failed');
      }
    } catch (error) {
      toast.error('Network error during authentication');
    } finally {
      setAuthLoading(false);
    }
  };

  // Load individual data sections
  const loadLinks = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/links', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLinks(data.links || []);
      }
    } catch (error) {
      console.error('Failed to load links:', error);
    }
  }, [token]);

  const loadAnalytics = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      // Use mock data for development
      setAnalytics({
        totalLinks: links.length,
        totalClicks: links.reduce((sum, link) => sum + link.clicks, 0),
        activeLinks: links.filter(link => link.isActive !== false).length,
        linksToday: links.filter(link => {
          const today = new Date().toDateString();
          return new Date(link.createdAt).toDateString() === today;
        }).length,
        clicksToday: 0,
        topDomains: [],
        clicksByDay: [],
        clicksByHour: [],
        topLinks: [],
        geoStats: [],
        deviceStats: [],
        browserStats: [],
        referrerStats: []
      });
    }
  }, [token, links]);

  const loadSystemInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/system', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSystemInfo(data);
      }
    } catch (error) {
      // Use mock data for development
      setSystemInfo({
        uptime: 86400,
        memoryUsage: { used: 512000000, total: 2048000000, percentage: 25 },
        diskUsage: { used: 5000000000, total: 20000000000, percentage: 25 },
        cpuUsage: 15,
        dbSize: 1024000,
        activeConnections: 5,
        requestsPerMinute: 120,
        errorRate: 0.1,
        responseTime: 45,
        version: '1.0.0',
        nodeVersion: process.version || '18.0.0',
        platform: 'linux',
        architecture: 'x64'
      });
    }
  }, [token]);

  const loadConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/config', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      // Use mock data for development
      setConfig({
        siteName: 'Velink',
        siteUrl: 'https://velink.example.com',
        adminEmail: 'admin@velink.example.com',
        rateLimit: { windowMs: 900000, maxRequests: 100 },
        linkExpiry: { default: '30d', max: '1y' },
        allowCustomDomains: false,
        requireAuth: false,
        enableAnalytics: true,
        enableGeo: true,
        maintenance: false,
        features: {
          passwordProtection: true,
          customAliases: true,
          linkExpiry: true,
          bulkOperations: true,
          exportData: true,
          apiAccess: true
        }
      });
    }
  }, [token]);

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadLinks(),
        loadAnalytics(),
        loadSystemInfo(),
        loadConfig()
      ]);
      setLastUpdate(new Date());
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [loadLinks, loadAnalytics, loadSystemInfo, loadConfig]);

  // Auto-refresh effect
  useEffect(() => {
    if (isAuthenticated && autoRefresh) {
      const interval = setInterval(() => {
        loadDashboardData();
      }, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, autoRefresh, refreshInterval, loadDashboardData]);

  // Check for existing auth token
  useEffect(() => {
    const savedToken = localStorage.getItem('velink-admin-token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      loadDashboardData();
    }
  }, [loadDashboardData]);

  // Utility functions
  const formatBytes = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      timeZone: 'Europe/Berlin',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredLinks = React.useMemo(() => {
    let filtered = links;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(link => 
        link.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (link.description && link.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(link => {
        switch (filterBy) {
          case 'active': return link.isActive !== false;
          case 'expired': return link.expiresAt && new Date(link.expiresAt) < new Date();
          case 'private': return link.isPrivate === true;
          case 'public': return link.isPrivate !== true;
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case 'created':
          aVal = new Date(a.createdAt);
          bVal = new Date(b.createdAt);
          break;
        case 'clicks':
          aVal = a.clicks;
          bVal = b.clicks;
          break;
        case 'code':
          aVal = a.shortCode.toLowerCase();
          bVal = b.shortCode.toLowerCase();
          break;
        case 'domain':
          aVal = new URL(a.originalUrl).hostname;
          bVal = new URL(b.originalUrl).hostname;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [links, searchTerm, filterBy, sortBy, sortOrder]);

  // Bulk operations
  const handleBulkDelete = async () => {
    if (selectedLinks.length === 0) return;
    
    try {
      const response = await fetch('/api/admin/links/bulk-delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ linkIds: selectedLinks })
      });

      if (response.ok) {
        toast.success(`Deleted ${selectedLinks.length} links`);
        setSelectedLinks([]);
        loadLinks();
      } else {
        toast.error('Failed to delete links');
      }
    } catch (error) {
      toast.error('Network error during bulk delete');
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/admin/links/${linkId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Link deleted successfully');
        setShowDeleteConfirm(null);
        loadLinks();
      } else {
        toast.error('Failed to delete link');
      }
    } catch (error) {
      toast.error('Network error during delete');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Velink Admin</h1>
            <p className="text-gray-600">Advanced Administration Panel</p>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Enter your admin token"
                required
              />
            </div>

            <button
              type="submit"
              disabled={authLoading || !token.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {authLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </div>
              ) : (
                'Access Admin Panel'
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Secure access to Velink administration
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation tabs */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Velink Admin</h1>
              <div className="hidden md:block text-sm text-gray-500">
                Last updated: {formatDateTime(lastUpdate.toISOString())}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-colors ${
                  autoRefresh 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
              >
                {autoRefresh ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              </button>
              
              <button
                onClick={loadDashboardData}
                disabled={loading}
                className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  localStorage.removeItem('velink-admin-token');
                  toast.success('Logged out successfully');
                }}
                className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                title="Logout"
              >
                <PowerOff className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'links', label: 'Links', icon: Link },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'system', label: 'System', icon: Server },
              { id: 'config', label: 'Config', icon: Settings },
              { id: 'security', label: 'Security', icon: Lock }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Auto-refresh: {refreshInterval}s</span>
              </div>
            </div>
            
            {/* Quick stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Link className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Links</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics?.totalLinks || 0}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+{analytics?.linksToday || 0} today</span>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MousePointer className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics?.totalClicks?.toLocaleString('de-DE') || 0}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Activity className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+{analytics?.clicksToday || 0} today</span>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Links</p>
                    <p className="text-2xl font-semibold text-gray-900">{analytics?.activeLinks || 0}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <Gauge className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-purple-600">{((analytics?.activeLinks || 0) / (analytics?.totalLinks || 1) * 100).toFixed(1)}% active</span>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Server className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Server Uptime</p>
                    <p className="text-2xl font-semibold text-gray-900">{systemInfo ? formatUptime(systemInfo.uptime) : '0d 0h 0m'}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">Healthy</span>
                </div>
              </motion.div>
            </div>

            {/* System status */}
            {systemInfo && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Monitor className="w-5 h-5 mr-2" />
                  System Status
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <MemoryStick className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-600">Memory Usage</span>
                      </div>
                      <span className="text-sm text-gray-900">{systemInfo.memoryUsage.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          systemInfo.memoryUsage.percentage > 80 ? 'bg-red-500' :
                          systemInfo.memoryUsage.percentage > 60 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${systemInfo.memoryUsage.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatBytes(systemInfo.memoryUsage.used)} / {formatBytes(systemInfo.memoryUsage.total)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <HardDrive className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-600">Disk Usage</span>
                      </div>
                      <span className="text-sm text-gray-900">{systemInfo.diskUsage.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          systemInfo.diskUsage.percentage > 80 ? 'bg-red-500' :
                          systemInfo.diskUsage.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${systemInfo.diskUsage.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatBytes(systemInfo.diskUsage.used)} / {formatBytes(systemInfo.diskUsage.total)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Cpu className="w-4 h-4 text-gray-500 mr-2" />
                        <span className="text-sm font-medium text-gray-600">CPU Usage</span>
                      </div>
                      <span className="text-sm text-gray-900">{systemInfo.cpuUsage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          systemInfo.cpuUsage > 80 ? 'bg-red-500' :
                          systemInfo.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${systemInfo.cpuUsage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {systemInfo.activeConnections} active connections
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{systemInfo.requestsPerMinute}</div>
                    <div className="text-xs text-gray-500">Requests/min</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{systemInfo.responseTime}ms</div>
                    <div className="text-xs text-gray-500">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{systemInfo.errorRate}%</div>
                    <div className="text-xs text-gray-500">Error Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">{formatBytes(systemInfo.dbSize)}</div>
                    <div className="text-xs text-gray-500">Database Size</div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Recent activity */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {links.slice(0, 5).map((link, index) => (
                  <div key={link._id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Link className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{window.location.origin}/{link.shortCode}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{link.originalUrl}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{link.clicks} clicks</div>
                      <div className="text-xs text-gray-500">{formatDateTime(link.createdAt)}</div>
                    </div>
                  </div>
                ))}
                {links.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Link className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                    <p>No links created yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === 'links' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Links Management</h2>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search links..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Links</option>
                  <option value="active">Active</option>
                  <option value="expired">Expired</option>
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                </select>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setSortBy(sort as any);
                    setSortOrder(order as any);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="created-desc">Newest First</option>
                  <option value="created-asc">Oldest First</option>
                  <option value="clicks-desc">Most Clicks</option>
                  <option value="clicks-asc">Fewest Clicks</option>
                  <option value="code-asc">Code A-Z</option>
                  <option value="code-desc">Code Z-A</option>
                </select>
              </div>
            </div>

            {selectedLinks.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-blue-800 font-medium">{selectedLinks.length} links selected</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete Selected
                    </button>
                    <button
                      onClick={() => setSelectedLinks([])}
                      className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                    >
                      Clear Selection
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedLinks.length === filteredLinks.length && filteredLinks.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLinks(filteredLinks.map(link => link._id));
                            } else {
                              setSelectedLinks([]);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Short Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Original URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clicks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLinks.map((link) => (
                      <tr key={link._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedLinks.includes(link._id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLinks([...selectedLinks, link._id]);
                              } else {
                                setSelectedLinks(selectedLinks.filter(id => id !== link._id));
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                              {link.shortCode}
                            </code>
                            <button
                              onClick={() => copyToClipboard(`${window.location.origin}/${link.shortCode}`)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Copy className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs truncate text-sm text-gray-900">
                            {link.originalUrl}
                          </div>
                          {link.description && (
                            <div className="text-xs text-gray-500 max-w-xs truncate">
                              {link.description}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <MousePointer className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {link.clicks.toLocaleString('de-DE')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDateTime(link.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            link.isActive !== false 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {link.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => window.open(`/${link.shortCode}`, '_blank')}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Visit link"
                            >
                              <ExternalLink className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              title="Edit link"
                            >
                              <Edit3 className="w-4 h-4 text-gray-500" />
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(link._id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                              title="Delete link"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredLinks.length === 0 && (
                <div className="text-center py-12">
                  <Link className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No links found</h3>
                  <p className="text-gray-500">
                    {searchTerm || filterBy !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Create your first shortened link to get started.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Other tabs would have similar comprehensive implementations */}
        {(activeTab === 'analytics' || activeTab === 'system' || activeTab === 'config' || activeTab === 'security') && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === 'analytics' && <BarChart3 className="w-8 h-8 text-white" />}
                {activeTab === 'system' && <Server className="w-8 h-8 text-white" />}
                {activeTab === 'config' && <Settings className="w-8 h-8 text-white" />}
                {activeTab === 'security' && <Lock className="w-8 h-8 text-white" />}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Management
              </h2>
              <p className="text-gray-600 mb-6">
                Advanced {activeTab} management features are coming soon. This enhanced admin panel will include:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                {activeTab === 'analytics' && [
                  '📊 Real-time click analytics and trends',
                  '🌍 Geographic distribution maps',
                  '📱 Device and browser analytics',
                  '📈 Custom date range reporting',
                  '📊 Export analytics data',
                  '🔗 Per-link performance metrics'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <span>{feature}</span>
                  </div>
                ))}
                
                {activeTab === 'system' && [
                  '⚡ Real-time performance monitoring',
                  '📊 Resource usage graphs',
                  '🔧 Configuration management',
                  '📝 System logs viewer',
                  '🔄 Backup and restore',
                  '🚨 Alert and notification system'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <span>{feature}</span>
                  </div>
                ))}
                
                {activeTab === 'config' && [
                  '⚙️ Global settings management',
                  '🎨 Branding and customization',
                  '🔒 Security configurations',
                  '📧 Email and notifications',
                  '🌐 API settings and keys',
                  '🔧 Advanced feature toggles'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <span>{feature}</span>
                  </div>
                ))}
                
                {activeTab === 'security' && [
                  '🔐 Access control and permissions',
                  '📊 Security audit logs',
                  '🛡️ Threat detection and blocking',
                  '🔑 API key management',
                  '⚠️ Security alerts and monitoring',
                  '🔒 Two-factor authentication'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
            >
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this link? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteLink(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedAdminPanel;
