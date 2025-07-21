import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Trash2, ExternalLink, Calendar, BarChart3, Copy, AlertTriangle, 
  Download, Settings, Users, Lock, Activity, Database, Search, Filter, 
  RefreshCw, Eye, EyeOff, Edit3, Save, X, Plus, FileText, TrendingUp,
  Globe, Clock, Zap, HardDrive, Cpu, Wifi, CheckCircle, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Link {
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

interface SystemInfo {
  uptime: number;
  memoryUsage: {
    used: number;
    total: number;
  };
  diskUsage: {
    used: number;
    total: number;
  };
  dbSize: number;
  activeConnections: number;
  version: string;
}

interface AnalyticsData {
  clicksByDay: Array<{ date: string; clicks: number }>;
  topReferrers: Array<{ domain: string; clicks: number }>;
  deviceStats: Array<{ device: string; count: number }>;
  browserStats: Array<{ browser: string; count: number }>;
  countryStats: Array<{ country: string; clicks: number }>;
}

const EnhancedAdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [links, setLinks] = useState<Link[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'links' | 'analytics' | 'system' | 'settings'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'clicks' | 'code'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    linksToday: 0,
    clicksToday: 0,
    topLinks: [],
    recentActivity: []
  });

  // Authentication functions
  const verifyTokenFunc = async (tokenToVerify: string) => {
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToVerify }),
      });

      if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('velink-admin-token', tokenToVerify);
        await loadInitialData();
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('velink-admin-token');
        toast.error('Invalid token');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      toast.error('Authentication failed');
    }
  };

  // Check for saved token on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('velink-admin-token');
    if (savedToken) {
      setToken(savedToken);
      verifyTokenFunc(savedToken);
    }
  }, []);

  // Filter and sort links when search term or sort options change
  useEffect(() => {
    let filtered = [...links];
    
    if (searchTerm) {
      filtered = filtered.filter(link => 
        link.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        link.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (link.description && link.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'created':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'clicks':
          aValue = a.clicks;
          bValue = b.clicks;
          break;
        case 'code':
          aValue = a.shortCode;
          bValue = b.shortCode;
          break;
        default:
          aValue = a.createdAt;
          bValue = b.createdAt;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredLinks(filtered);
  }, [links, searchTerm, sortBy, sortOrder]);

  const loadInitialData = async () => {
    await Promise.all([
      loadLinks(),
      loadStats(),
      loadSystemInfo(),
      loadAnalytics()
    ]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      verifyTokenFunc(token.trim());
    }
  };

  const loadLinks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/links', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLinks(data);
      } else {
        toast.error('Failed to load links');
      }
    } catch (error) {
      console.error('Failed to load links:', error);
      toast.error('Failed to load links');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadSystemInfo = async () => {
    try {
      const response = await fetch('/api/admin/system', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSystemInfo(data);
      }
    } catch (error) {
      console.error('Failed to load system info:', error);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/admin/links/${linkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Link deleted successfully');
        await loadLinks();
        await loadStats();
      } else {
        toast.error('Failed to delete link');
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
      toast.error('Failed to delete link');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const deleteBulkLinks = async () => {
    try {
      const response = await fetch('/api/admin/links/bulk', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ linkIds: selectedLinks }),
      });

      if (response.ok) {
        toast.success(`${selectedLinks.length} links deleted successfully`);
        setSelectedLinks([]);
        await loadLinks();
        await loadStats();
      } else {
        toast.error('Failed to delete links');
      }
    } catch (error) {
      console.error('Failed to delete links:', error);
      toast.error('Failed to delete links');
    }
  };

  const toggleLinkStatus = async (linkId: string) => {
    try {
      const response = await fetch(`/api/admin/links/${linkId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Link status updated');
        await loadLinks();
      } else {
        toast.error('Failed to update link status');
      }
    } catch (error) {
      console.error('Failed to update link status:', error);
      toast.error('Failed to update link status');
    }
  };

  const updateLinkDescription = async (linkId: string, description: string) => {
    try {
      const response = await fetch(`/api/admin/links/${linkId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      });

      if (response.ok) {
        toast.success('Description updated');
        setEditingLink(null);
        setEditDescription('');
        await loadLinks();
      } else {
        toast.error('Failed to update description');
      }
    } catch (error) {
      console.error('Failed to update description:', error);
      toast.error('Failed to update description');
    }
  };

  const exportData = async (type: 'links' | 'analytics') => {
    try {
      const response = await fetch(`/api/admin/export/${type}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `velink-${type}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`${type} data exported successfully`);
      } else {
        toast.error(`Failed to export ${type} data`);
      }
    } catch (error) {
      console.error(`Failed to export ${type} data:`, error);
      toast.error(`Failed to export ${type} data`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setToken('');
    setLinks([]);
    setStats({
      totalLinks: 0,
      totalClicks: 0,
      linksToday: 0,
      clicksToday: 0,
      topLinks: [],
      recentActivity: []
    });
    localStorage.removeItem('velink-admin-token');
    toast.success('Logged out successfully');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl shadow-2xl p-8 w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">VeLink Admin</h1>
            <p className="text-gray-300">Enter your admin token to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Admin Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter admin token..."
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Authenticate
            </button>
          </form>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-yellow-300 font-medium">Admin Access Only</p>
                <p className="text-xs text-yellow-400 mt-1">
                  This panel is restricted to authorized administrators only.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">VeLink Admin Panel</h1>
                <p className="text-sm text-gray-500">Devin Oldenburg - Administrator</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => loadInitialData()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'links', label: 'Links', icon: ExternalLink },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'system', label: 'System', icon: Database },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <ExternalLink className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Links</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalLinks}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clicks</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalClicks}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Links Today</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.linksToday}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Clicks Today</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.clicksToday}</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => exportData('links')}
                  className="flex flex-col items-center space-y-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Download className="w-6 h-6 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Export Links</span>
                </button>
                <button
                  onClick={() => exportData('analytics')}
                  className="flex flex-col items-center space-y-2 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                >
                  <FileText className="w-6 h-6 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Export Analytics</span>
                </button>
                <button
                  onClick={() => setActiveTab('system')}
                  className="flex flex-col items-center space-y-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                >
                  <Activity className="w-6 h-6 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">System Health</span>
                </button>
                <button
                  onClick={() => loadInitialData()}
                  className="flex flex-col items-center space-y-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-6 h-6 text-orange-600" />
                  <span className="text-sm font-medium text-orange-700">Refresh Data</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className="space-y-6">
            {/* Search and Controls */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="flex-1 max-w-lg">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search links..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="created">Sort by Created</option>
                    <option value="clicks">Sort by Clicks</option>
                    <option value="code">Sort by Code</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                  >
                    <Filter className="w-5 h-5 text-gray-600" />
                  </button>
                  {selectedLinks.length > 0 && (
                    <button
                      onClick={() => deleteBulkLinks()}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      Delete Selected ({selectedLinks.length})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Links Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">All Links ({filteredLinks.length})</h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLinks(filteredLinks.map(link => link._id));
                              } else {
                                setSelectedLinks([]);
                              }
                            }}
                            checked={selectedLinks.length === filteredLinks.length && filteredLinks.length > 0}
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
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Clicks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredLinks.map((link) => (
                        <tr key={link._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
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
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Copy className="w-4 h-4 text-gray-500" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate" title={link.originalUrl}>
                              {link.originalUrl}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {editingLink === link._id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                                  placeholder="Add description..."
                                />
                                <button
                                  onClick={() => updateLinkDescription(link._id, editDescription)}
                                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingLink(null);
                                    setEditDescription('');
                                  }}
                                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600 max-w-xs truncate">
                                  {link.description || 'No description'}
                                </span>
                                <button
                                  onClick={() => {
                                    setEditingLink(link._id);
                                    setEditDescription(link.description || '');
                                  }}
                                  className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(link.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {link.clicks} clicks
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => toggleLinkStatus(link._id)}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                link.isActive !== false
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {link.isActive !== false ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <a
                                href={`/${link.shortCode}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Open link"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                              <button
                                onClick={() => setShowDeleteConfirm(link._id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Delete link"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredLinks.length === 0 && (
                    <div className="text-center py-12">
                      <ExternalLink className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No links found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? 'No links match your search criteria.' : 'No shortened links have been created yet.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Referrers */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Referrers</h3>
                {analytics?.topReferrers ? (
                  <div className="space-y-3">
                    {analytics.topReferrers.slice(0, 5).map((referrer, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Globe className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{referrer.domain}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{referrer.clicks}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No referrer data available</p>
                )}
              </div>

              {/* Device Stats */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Types</h3>
                {analytics?.deviceStats ? (
                  <div className="space-y-3">
                    {analytics.deviceStats.map((device, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Zap className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{device.device}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-600">{device.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No device data available</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            {systemInfo && (
              <>
                {/* System Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Clock className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Uptime</p>
                        <p className="text-lg font-bold text-gray-900">{formatUptime(systemInfo.uptime)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Cpu className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                        <p className="text-lg font-bold text-gray-900">
                          {Math.round((systemInfo.memoryUsage.used / systemInfo.memoryUsage.total) * 100)}%
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <HardDrive className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Database Size</p>
                        <p className="text-lg font-bold text-gray-900">{formatBytes(systemInfo.dbSize)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <Wifi className="w-6 h-6 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Connections</p>
                        <p className="text-lg font-bold text-gray-900">{systemInfo.activeConnections}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Memory</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Used:</span>
                          <span>{formatBytes(systemInfo.memoryUsage.used)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total:</span>
                          <span>{formatBytes(systemInfo.memoryUsage.total)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${(systemInfo.memoryUsage.used / systemInfo.memoryUsage.total) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Disk</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Used:</span>
                          <span>{formatBytes(systemInfo.diskUsage.used)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total:</span>
                          <span>{formatBytes(systemInfo.diskUsage.total)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{
                              width: `${(systemInfo.diskUsage.used / systemInfo.diskUsage.total) * 100}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Auto-refresh data</h4>
                    <p className="text-sm text-gray-600">Automatically refresh dashboard data every 30 seconds</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors">
                    <span className="sr-only">Auto-refresh</span>
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform translate-x-1" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">Email notifications</h4>
                    <p className="text-sm text-gray-600">Receive email alerts for system events</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="sr-only">Email notifications</span>
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform translate-x-6" />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
              <div className="space-y-4">
                <button
                  onClick={() => exportData('links')}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  <span>Export All Links</span>
                </button>
                <button
                  onClick={() => exportData('analytics')}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  <span>Export Analytics Data</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Link</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this link? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteLink(showDeleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default EnhancedAdminPanel;
