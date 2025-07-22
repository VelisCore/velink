import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, ExternalLink, Calendar, BarChart3, 
  Download, Settings, Activity, Database, 
  RefreshCw, Save, TrendingUp, Clock, Terminal, 
  Lock, Unlock, Eye, EyeOff, Construction,
  Trash2, Edit3, Copy, Search, Filter, FileText,
  Globe, ToggleLeft, ToggleRight, AlertTriangle,
  CheckCircle, XCircle, Monitor, HardDrive, Cpu,
  RotateCcw, Zap, Wifi
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

const CleanAdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'links' | 'analytics' | 'system' | 'logs' | 'databases' | 'settings'>('dashboard');
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  
  // Links management
  const [links, setLinks] = useState<LinkInterface[]>([]);
  const [filteredLinks, setFilteredLinks] = useState<LinkInterface[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'clicks' | 'code'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');
  
  // Analytics
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  
  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    linksToday: 0,
    clicksToday: 0,
    topLinks: [],
    recentActivity: []
  });
  
  // Privacy and maintenance settings
  const [privacySettings, setPrivacySettings] = useState({
    isPrivate: false,
    password: '',
    isMaintenanceMode: false,
    maintenanceMessage: ''
  });
  const [showPrivacyPassword, setShowPrivacyPassword] = useState(false);

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
        setToken(tokenToVerify);
        setIsAuthenticated(true);
        localStorage.setItem('velink-admin-token', tokenToVerify);
        setTimeout(() => {
          loadInitialDataWithToken(tokenToVerify);
        }, 100);
        toast.success('Successfully authenticated!');
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh data every 15 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const interval = setInterval(() => {
      // Don't auto-refresh if user is editing a link description
      if (!editingLink) {
        loadInitialData();
      }
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token, editingLink]);

  // Filter and sort links when search term or sort options change
  useEffect(() => {
    if (!Array.isArray(links)) {
      setFilteredLinks([]);
      return;
    }

    let filtered = [...links];
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(link => {
        const shortCode = (link.shortCode || '').toLowerCase();
        const originalUrl = (link.originalUrl || '').toLowerCase();
        const description = (link.description || '').toLowerCase();
        
        return shortCode.includes(searchLower) ||
               originalUrl.includes(searchLower) ||
               description.includes(searchLower);
      });
    }
    
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'created':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        case 'clicks':
          aValue = a.clicks || 0;
          bValue = b.clicks || 0;
          break;
        case 'code':
          aValue = (a.shortCode || '').toLowerCase();
          bValue = (b.shortCode || '').toLowerCase();
          break;
        default:
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
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
    if (!token) return;
    
    setLoading(true);
    try {
      await Promise.all([
        loadLinks(),
        loadStats(),
        loadSystemInfo(),
        loadAnalytics(),
        loadLogs(),
        loadPrivacySettings()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load some data');
    } finally {
      setLoading(false);
    }
  };

  const loadInitialDataWithToken = async (tokenToUse: string) => {
    setToken(tokenToUse);
    setLoading(true);
    try {
      await Promise.all([
        loadLinks(),
        loadStats(),
        loadSystemInfo(),
        loadAnalytics(),
        loadLogs(),
        loadPrivacySettings()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load some data');
    } finally {
      setLoading(false);
    }
  };

  const loadPrivacySettings = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/admin/privacy-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Only update privacy settings if password field is not currently being edited
        setPrivacySettings(prev => ({
          ...data,
          password: prev.password // Keep current password input value
        }));
      }
    } catch (error) {
      console.error('Failed to load privacy settings:', error);
    }
  };

  const updatePrivacySettings = async (settings: Partial<typeof privacySettings>) => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/admin/privacy-settings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        await loadPrivacySettings();
        toast.success('Privacy settings updated successfully');
      } else {
        toast.error('Failed to update privacy settings');
      }
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      toast.error('Failed to update privacy settings');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (token.trim()) {
      verifyTokenFunc(token.trim());
    }
  };

  const loadLinks = async () => {
    if (!token) return;
    
    try {
      const response = await fetch('/api/admin/links', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Raw links data:', data); // Debug log
        
        // Ensure data is an array and has proper structure
        if (Array.isArray(data)) {
          const validatedLinks = data.map(link => ({
            _id: link.id?.toString() || link._id?.toString() || `temp-${Date.now()}-${Math.random()}`,
            shortCode: link.short_code || link.shortCode || '',
            originalUrl: link.original_url || link.originalUrl || link.url || link.destination || '',
            clicks: typeof link.clicks === 'number' ? link.clicks : 0,
            createdAt: link.created_at || link.createdAt || link.created || link.timestamp || new Date().toISOString(),
            isActive: link.is_active === 1 || link.is_active === true || (typeof link.isActive === 'boolean' ? link.isActive : (typeof link.active === 'boolean' ? link.active : true)),
            description: link.description || link.desc || '',
            lastClicked: link.last_clicked || link.lastClicked || link.lastAccessed || null,
            expiresAt: link.expires_at || link.expiresAt || link.expires || null,
            password: link.password || null
          }));
          
          console.log('Validated links:', validatedLinks); // Debug log
          setLinks(validatedLinks);
        } else {
          console.error('Invalid links data format:', data);
          setLinks([]);
          toast.error('Invalid data format received for links');
        }
      } else {
        const errorText = await response.text();
        console.error(`HTTP ${response.status}: ${response.statusText}`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to load links:', error);
      toast.error('Failed to load links: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setLinks([]);
    }
  };

  const loadAnalytics = async () => {
    if (!token) return;
    
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

  const loadLogs = async (date?: string) => {
    if (!token) return;
    
    try {
      const targetDate = date || selectedDate;
      const response = await fetch(`/api/admin/logs?date=${targetDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (error) {
      console.error('Failed to load logs:', error);
    }
  };

  const loadStats = async () => {
    if (!token) return;
    
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
    if (!token) return;
    
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

  const exportData = async (type: 'links' | 'analytics') => {
    if (!token) return;
    
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

  // Link management functions
  const deleteLink = async (linkId: string) => {
    if (!token || !linkId) {
      toast.error('Missing token or link ID');
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/links/${linkId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        toast.success('Link deleted successfully');
        await loadLinks();
        await loadStats();
      } else {
        const errorData = await response.text();
        console.error('Delete failed:', errorData);
        toast.error(`Failed to delete link: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to delete link:', error);
      toast.error('Failed to delete link: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setShowDeleteConfirm(null);
      setLoading(false);
    }
  };

  const deleteBulkLinks = async () => {
    if (!token || selectedLinks.length === 0) {
      toast.error('No links selected or missing token');
      return;
    }
    
    try {
      setLoading(true);
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
        const errorData = await response.text();
        console.error('Bulk delete failed:', errorData);
        toast.error(`Failed to delete links: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to delete links:', error);
      toast.error('Failed to delete links: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleLinkStatus = async (linkId: string) => {
    if (!token || !linkId) {
      toast.error('Missing token or link ID');
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/links/${linkId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        toast.success('Link status updated');
        await loadLinks();
      } else {
        const errorData = await response.text();
        console.error('Toggle status failed:', errorData);
        toast.error(`Failed to update link status: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to update link status:', error);
      toast.error('Failed to update link status: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const updateLinkDescription = async (linkId: string, description: string) => {
    if (!token || !linkId) {
      toast.error('Missing token or link ID');
      return;
    }
    
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
        const errorData = await response.text();
        console.error('Update description failed:', errorData);
        toast.error(`Failed to update description: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to update description:', error);
      toast.error('Failed to update description: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const downloadLogs = async (date: string) => {
    if (!token) return;
    
    try {
      const response = await fetch(`/api/admin/logs/download?date=${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `velink-logs-${date}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Logs downloaded successfully');
      } else {
        toast.error('Failed to download logs');
      }
    } catch (error) {
      console.error('Failed to download logs:', error);
      toast.error('Failed to download logs');
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

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Login Form Component
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl p-12 shadow-xl border border-gray-200 max-w-md w-full"
        >
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl mb-6 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Velink Admin</h1>
            <p className="text-gray-600">Enter your admin token to continue</p>
          </motion.div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Admin Token
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter your admin token"
                required
              />
            </motion.div>
            
            <motion.button
              type="submit"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Access Admin Panel
            </motion.button>
          </form>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 text-center text-gray-500 text-sm"
          >
            <p>Secure access required</p>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Navigation Tabs
  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'links', label: 'Links', icon: ExternalLink },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'system', label: 'System', icon: Activity },
    { id: 'logs', label: 'Logs', icon: Terminal },
    { id: 'databases', label: 'Database', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-50 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Velink Admin</h1>
                  <p className="text-gray-600 text-sm">Management Dashboard</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => loadInitialData()}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                title="Refresh all data (auto-refreshes every 15 seconds)"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg transition-all duration-200 font-medium border border-red-200"
              >
                Logout
              </motion.button>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex space-x-2 mt-4 overflow-x-auto">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary-100 text-primary-700 shadow-sm border border-primary-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">✨ Velink Admin Dashboard ✨</h2>
              <p className="text-gray-600 text-lg">Complete management system with auto-refresh every 15 seconds</p>
            </div>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Links</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLinks.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-primary-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Total Clicks</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalClicks.toLocaleString()}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Links Today</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.linksToday}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">Clicks Today</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.clicksToday}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => exportData('links')}
                  className="flex items-center space-x-3 p-4 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-xl transition-all duration-200"
                >
                  <Download className="w-5 h-5 text-primary-600" />
                  <span className="text-gray-900 font-medium">Export Links</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => exportData('analytics')}
                  className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-all duration-200"
                >
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <span className="text-gray-900 font-medium">Export Analytics</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('settings')}
                  className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all duration-200"
                >
                  <Settings className="w-5 h-5 text-purple-600" />
                  <span className="text-gray-900 font-medium">Privacy Settings</span>
                </motion.button>
              </div>
            </div>

            {/* System Status */}
            {systemInfo && (
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-6">System Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Uptime</span>
                      <span className="text-gray-900">{formatUptime(systemInfo.uptime)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 text-sm">System running</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Memory Usage</span>
                      <span className="text-gray-900">{Math.round((systemInfo.memoryUsage.used / systemInfo.memoryUsage.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(systemInfo.memoryUsage.used / systemInfo.memoryUsage.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 font-medium">Database Size</span>
                      <span className="text-gray-900">{formatBytes(systemInfo.dbSize)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Database className="w-4 h-4 text-primary-500" />
                      <span className="text-primary-600 text-sm">Healthy</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Privacy Settings */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy & Security Settings</h2>
              
              <div className="space-y-6">
                {/* Private Website Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-3">
                    {privacySettings.isPrivate ? (
                      <Lock className="w-6 h-6 text-red-500" />
                    ) : (
                      <Unlock className="w-6 h-6 text-green-500" />
                    )}
                    <div>
                      <h3 className="text-gray-900 font-medium">Private Website</h3>
                      <p className="text-gray-600 text-sm">
                        {privacySettings.isPrivate 
                          ? 'Website is private and requires password' 
                          : 'Website is publicly accessible'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updatePrivacySettings({ isPrivate: !privacySettings.isPrivate })}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 border ${
                      privacySettings.isPrivate
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'
                        : 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200'
                    }`}
                  >
                    {privacySettings.isPrivate ? 'Make Public' : 'Make Private'}
                  </motion.button>
                </div>

                {/* Password Setting */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <Eye className="w-6 h-6 text-primary-500" />
                    <h3 className="text-gray-900 font-medium">Privacy Password</h3>
                  </div>
                  
                  <div className="flex space-x-3">
                    <div className="flex-1 relative">
                      <input
                        type={showPrivacyPassword ? 'text' : 'password'}
                        value={privacySettings.password}
                        onChange={(e) => setPrivacySettings(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter privacy password"
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={() => setShowPrivacyPassword(!showPrivacyPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPrivacyPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </motion.button>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => updatePrivacySettings({ password: privacySettings.password })}
                      className="px-4 py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-200 rounded-xl transition-all duration-200"
                    >
                      <Save className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Maintenance Mode */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Construction className="w-6 h-6 text-orange-500" />
                    <div>
                      <h3 className="text-gray-900 font-medium">Maintenance Mode</h3>
                      <p className="text-gray-600 text-sm">
                        {privacySettings.isMaintenanceMode 
                          ? 'Website is in maintenance mode' 
                          : 'Website is operational'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => updatePrivacySettings({ isMaintenanceMode: !privacySettings.isMaintenanceMode })}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 border ${
                      privacySettings.isMaintenanceMode
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'
                        : 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200'
                    }`}
                  >
                    {privacySettings.isMaintenanceMode ? 'Disable' : 'Enable'}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'links' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Links Header */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Link Management</h2>
                <div className="flex items-center space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      setLoading(true);
                      await loadLinks();
                      setLoading(false);
                    }}
                    className="p-2 bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-200 rounded-lg transition-all duration-200"
                    title="Refresh links"
                    disabled={loading}
                  >
                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                  </motion.button>
                  {selectedLinks.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={deleteBulkLinks}
                      className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg transition-all duration-200"
                      disabled={loading}
                    >
                      Delete Selected ({selectedLinks.length})
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search links by code, URL, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'created' | 'clicks' | 'code')}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="created">Sort by Date</option>
                    <option value="clicks">Sort by Clicks</option>
                    <option value="code">Sort by Code</option>
                  </select>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-900 hover:bg-gray-50 transition-all duration-200"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </motion.button>
                </div>
              </div>

              {/* Debug Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-xl border border-gray-200 text-sm">
                <p className="text-gray-600">
                  Debug: Total links: {links.length}, Filtered: {filteredLinks.length}, Loading: {loading ? 'Yes' : 'No'}
                </p>
              </div>

              {/* Links Table */}
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="text-center py-12">
                    <RefreshCw className="w-8 h-8 text-primary-500 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-500">Loading links...</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left p-3 text-gray-600 font-medium">
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
                            className="rounded"
                          />
                        </th>
                        <th className="text-left p-3 text-gray-600 font-medium">Short Code</th>
                        <th className="text-left p-3 text-gray-600 font-medium">Original URL</th>
                        <th className="text-left p-3 text-gray-600 font-medium">Clicks</th>
                        <th className="text-left p-3 text-gray-600 font-medium">Created</th>
                        <th className="text-left p-3 text-gray-600 font-medium">Status</th>
                        <th className="text-left p-3 text-gray-600 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLinks.map((link) => (
                        <motion.tr
                          key={link._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200"
                        >
                          <td className="p-3">
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
                              className="rounded"
                            />
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-900 font-mono">{link.shortCode || 'N/A'}</span>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => copyToClipboard(`${window.location.origin}/${link.shortCode || ''}`)}
                                className="text-primary-500 hover:text-primary-600"
                                disabled={!link.shortCode}
                              >
                                <Copy className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="max-w-xs truncate">
                              <span className="text-gray-600" title={link.originalUrl || 'No URL'}>
                                {link.originalUrl || 'No URL'}
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-gray-900 font-semibold">{link.clicks || 0}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-gray-600">
                              {link.createdAt ? new Date(link.createdAt).toLocaleDateString() : 'Unknown'}
                            </span>
                          </td>
                          <td className="p-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleLinkStatus(link._id)}
                              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 border ${
                                link.isActive 
                                  ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' 
                                  : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                              }`}
                              disabled={!link._id}
                            >
                              {link.isActive ? 'Active' : 'Inactive'}
                            </motion.button>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setEditingLink(link._id);
                                  setEditDescription(link.description || '');
                                }}
                                className="text-primary-500 hover:text-primary-600"
                                title="Edit description"
                                disabled={!link._id}
                              >
                                <Edit3 className="w-4 h-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowDeleteConfirm(link._id)}
                                className="text-red-500 hover:text-red-600"
                                title="Delete link"
                                disabled={!link._id}
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {filteredLinks.length === 0 && (
                <div className="text-center py-12">
                  <ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No links found</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => loadAnalytics()}
                  className="p-2 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 rounded-lg transition-all duration-200"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </motion.button>
              </div>

              {analytics ? (
                <div className="space-y-6">
                  {/* Analytics Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/90 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm">Total Links</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.totalLinks}</p>
                        </div>
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                          <ExternalLink className="w-6 h-6 text-primary-600" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/90 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm">Total Clicks</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.totalClicks}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <BarChart3 className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/90 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm">Active Links</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.activeLinks}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                    </div>
                    <div className="bg-white/90 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 text-sm">Links Today</p>
                          <p className="text-2xl font-bold text-gray-900">{analytics.linksToday}</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Links */}
                  <div className="bg-white/90 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Top Performing Links</h3>
                    <div className="space-y-3">
                      {analytics.topLinks.map((link, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-gray-900 font-mono">{link.shortCode}</span>
                              <span className="text-gray-600 text-sm truncate">{link.originalUrl}</span>
                            </div>
                          </div>
                          <div className="text-gray-900 font-semibold">{link.clicks} clicks</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500">Loading analytics...</div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'system' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">System Information</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => loadSystemInfo()}
                  className="p-2 bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 rounded-lg transition-all duration-200"
                >
                  <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                </motion.button>
              </div>

              {systemInfo ? (
                <div className="space-y-6">
                  {/* System Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white/90 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                          <Clock className="w-6 h-6 text-green-600" />
                        </div>
                        <h3 className="text-gray-900 font-semibold">Uptime</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{formatUptime(systemInfo.uptime)}</p>
                      <p className="text-green-600 text-sm">System running smoothly</p>
                    </div>

                    <div className="bg-white/90 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <HardDrive className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-gray-900 font-semibold">Memory Usage</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {Math.round((systemInfo.memoryUsage.used / systemInfo.memoryUsage.total) * 100)}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(systemInfo.memoryUsage.used / systemInfo.memoryUsage.total) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-blue-600 text-sm">
                        {formatBytes(systemInfo.memoryUsage.used)} / {formatBytes(systemInfo.memoryUsage.total)}
                      </p>
                    </div>

                    <div className="bg-white/90 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <Database className="w-6 h-6 text-purple-600" />
                        </div>
                        <h3 className="text-gray-900 font-semibold">Database</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{formatBytes(systemInfo.dbSize)}</p>
                      <p className="text-purple-600 text-sm">Database size</p>
                    </div>

                    <div className="bg-white/90 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                          <Wifi className="w-6 h-6 text-orange-600" />
                        </div>
                        <h3 className="text-gray-900 font-semibold">Connections</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{systemInfo.activeConnections}</p>
                      <p className="text-orange-600 text-sm">Active connections</p>
                    </div>

                    <div className="bg-white/90 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                          <Zap className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h3 className="text-gray-900 font-semibold">Version</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">{systemInfo.version}</p>
                      <p className="text-yellow-600 text-sm">Current version</p>
                    </div>

                    <div className="bg-white/90 rounded-xl p-6 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <HardDrive className="w-6 h-6 text-indigo-600" />
                        </div>
                        <h3 className="text-gray-900 font-semibold">Disk Usage</h3>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {Math.round((systemInfo.diskUsage.used / systemInfo.diskUsage.total) * 100)}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div 
                          className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(systemInfo.diskUsage.used / systemInfo.diskUsage.total) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-indigo-600 text-sm">
                        {formatBytes(systemInfo.diskUsage.used)} / {formatBytes(systemInfo.diskUsage.total)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Loading system information...</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'logs' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>
                <div className="flex items-center space-x-3">
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      loadLogs(e.target.value);
                    }}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => downloadLogs(selectedDate)}
                    className="p-2 bg-primary-50 text-primary-600 hover:bg-primary-100 border border-primary-200 rounded-lg transition-all duration-200"
                    title="Download logs"
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => loadLogs(selectedDate)}
                    className="p-2 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 rounded-lg transition-all duration-200"
                    title="Refresh logs"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Historical Logs */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Logs for {new Date(selectedDate).toLocaleDateString()}
                </h3>
                <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <div key={index} className={`mb-1 ${
                        log.level === 'error' ? 'text-red-400' :
                        log.level === 'warn' ? 'text-yellow-400' :
                        log.level === 'info' ? 'text-blue-400' :
                        'text-gray-300'
                      }`}>
                        <span className="text-gray-400">[{log.timestamp}]</span> {log.message}
                        {log.method && <span className="text-purple-400"> {log.method}</span>}
                        {log.url && <span className="text-cyan-400"> {log.url}</span>}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Terminal className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">No logs found for this date</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'databases' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Database Management</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => exportData('links')}
                  className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-100 border border-purple-200 rounded-lg transition-all duration-200"
                >
                  <Download className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Database Overview */}
                <div className="bg-white/90 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Overview</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Database className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-gray-900">Links Table</span>
                      </div>
                      <span className="text-blue-600">{stats.totalLinks} records</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-gray-900">Analytics</span>
                      </div>
                      <span className="text-green-600">{stats.totalClicks} clicks tracked</span>
                    </div>
                    {systemInfo && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <HardDrive className="w-5 h-5 text-purple-600" />
                          </div>
                          <span className="text-gray-900">Database Size</span>
                        </div>
                        <span className="text-purple-600">{formatBytes(systemInfo.dbSize)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Database Actions */}
                <div className="bg-white/90 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Actions</h3>
                  <div className="space-y-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => exportData('links')}
                      className="w-full flex items-center space-x-3 p-3 bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 rounded-lg transition-all duration-200"
                    >
                      <Download className="w-5 h-5" />
                      <span>Export Links Data</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => exportData('analytics')}
                      className="w-full flex items-center space-x-3 p-3 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 rounded-lg transition-all duration-200"
                    >
                      <FileText className="w-5 h-5" />
                      <span>Export Analytics</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => loadInitialData()}
                      className="w-full flex items-center space-x-3 p-3 bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 rounded-lg transition-all duration-200"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Refresh Database Stats</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Edit Link Modal */}
      {editingLink && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 max-w-md w-full shadow-xl"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Link Description</h3>
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Enter description..."
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              rows={3}
            />
            <div className="flex space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditingLink(null);
                  setEditDescription('');
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-xl transition-all duration-200 border border-gray-300"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => updateLinkDescription(editingLink, editDescription)}
                className="flex-1 px-4 py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 hover:text-primary-700 rounded-xl transition-all duration-200 border border-primary-200"
              >
                Save
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-gray-200 max-w-md w-full shadow-xl"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Deletion</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this link? This action cannot be undone.
              </p>
              
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 rounded-xl transition-all duration-200 border border-gray-300"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => deleteLink(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl transition-all duration-200 border border-red-200"
                >
                  Delete
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CleanAdminPanel;
