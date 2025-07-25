import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Server, 
  Shield, 
  Globe,
  Copy,
  Check,
  AlertCircle,
  Info,
  Play,
  ExternalLink,
  Code,
  Book,
  Zap,
  Clock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

interface ApiEndpoint {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PATCH' | 'PUT';
  endpoint: string;
  description: string;
  requestBody?: any;
  responseExample?: any;
  headers?: string[];
  authentication?: string;
  category: string;
}

interface TabContent {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const ApiDocumentation: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [copiedCode, setCopiedCode] = useState<string>('');

  const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:80' : '';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const tabs: TabContent[] = [
    {
      id: 'overview',
      name: 'Overview',
      icon: <Book className="h-5 w-5" />,
      description: 'Getting started with Velink API'
    },
    {
      id: 'public',
      name: 'Public API',
      icon: <Globe className="h-5 w-5" />,
      description: 'Public endpoints that require no authentication'
    },
    {
      id: 'admin',
      name: 'Admin API',
      icon: <Shield className="h-5 w-5" />,
      description: 'Admin endpoints that require authentication'
    },
    {
      id: 'examples',
      name: 'Code Examples',
      icon: <Code className="h-5 w-5" />,
      description: 'Integration examples and SDKs'
    }
  ];

  const apiEndpoints: ApiEndpoint[] = [
    {
      id: 'shorten-url',
      name: 'Shorten URL',
      method: 'POST',
      endpoint: '/api/shorten',
      description: 'Create a new shortened URL',
      category: 'public',
      requestBody: {
        url: 'https://example.com/very-long-url-to-shorten',
        expiresIn: '30d'
      },
      responseExample: {
        success: true,
        shortCode: 'abc123',
        shortUrl: 'https://velink.me/abc123',
        originalUrl: 'https://example.com/very-long-url-to-shorten',
        qrCode: 'https://velink.me/qr/abc123'
      }
    },
    {
      id: 'batch-shorten',
      name: 'Batch Shorten URLs',
      method: 'POST',
      endpoint: '/api/batch-shorten',
      description: 'Create multiple shortened URLs at once',
      category: 'public',
      requestBody: {
        urls: [
          'https://example.com/page1',
          'https://example.com/page2',
          'https://github.com/your-repo'
        ],
        expiresIn: '30d'
      },
      responseExample: {
        success: true,
        results: [
          {
            originalUrl: 'https://example.com/page1',
            shortCode: 'abc123',
            shortUrl: 'https://velink.me/abc123'
          }
        ]
      }
    },
    {
      id: 'get-link-info',
      name: 'Get Link Information',
      method: 'GET',
      endpoint: '/api/info/:shortCode',
      description: 'Get information about a specific shortened URL',
      category: 'public',
      responseExample: {
        success: true,
        shortCode: 'abc123',
        originalUrl: 'https://example.com/page',
        clicks: 42,
        createdAt: '2024-01-15T10:30:00Z'
      }
    },
    {
      id: 'get-stats',
      name: 'Get Global Statistics',
      method: 'GET',
      endpoint: '/api/stats',
      description: 'Get global statistics including total links and clicks',
      category: 'public',
      responseExample: {
        totalLinks: 1250,
        totalClicks: 8765,
        linksToday: 42,
        clicksToday: 156
      }
    },
    {
      id: 'delete-link',
      name: 'Delete Link',
      method: 'DELETE',
      endpoint: '/api/links/:shortCode',
      description: 'Delete a shortened URL',
      category: 'public',
      responseExample: {
        success: true,
        message: 'Link deleted successfully'
      }
    },
    {
      id: 'admin-verify',
      name: 'Verify Admin Token',
      method: 'POST',
      endpoint: '/api/admin/verify',
      description: 'Verify admin authentication token',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        token: 'your-admin-token'
      },
      responseExample: {
        success: true,
        message: 'Token verified'
      }
    },
    {
      id: 'admin-links',
      name: 'Get All Links',
      method: 'GET',
      endpoint: '/api/admin/links',
      description: 'Get all shortened links with admin access',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        links: [
          {
            id: 1,
            shortCode: 'abc123',
            originalUrl: 'https://example.com',
            clicks: 42,
            createdAt: '2024-01-15T10:30:00Z'
          }
        ]
      }
    },
    {
      id: 'admin-stats',
      name: 'Get Admin Statistics',
      method: 'GET',
      endpoint: '/api/admin/stats',
      description: 'Get detailed admin statistics and analytics',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        totalLinks: 1250,
        totalClicks: 8765,
        activeLinks: 1200,
        topLinks: [],
        recentActivity: []
      }
    },
    {
      id: 'admin-update-check',
      name: 'Check Update Status',
      method: 'GET',
      endpoint: '/api/admin/update/check',
      description: 'Check if updates are available and get system health status',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        updateAvailable: true,
        currentVersion: '1.2.3',
        latestVersion: '1.3.0',
        systemHealth: {
          status: 'healthy',
          uptime: '5 days, 12 hours',
          memoryUsage: '256MB',
          diskSpace: '15GB free'
        },
        lastCheck: '2024-01-15T10:30:00Z'
      }
    },
    {
      id: 'admin-update-status',
      name: 'Get Update Progress',
      method: 'GET',
      endpoint: '/api/admin/update/status',
      description: 'Get real-time update progress and status information',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        isUpdating: true,
        progress: 45,
        currentStep: 'Installing dependencies',
        totalSteps: 7,
        stepProgress: {
          step: 3,
          name: 'Installing dependencies',
          status: 'running',
          progress: 65
        },
        estimatedTimeRemaining: 120,
        logs: [
          { timestamp: '2024-01-15T10:30:00Z', level: 'info', message: 'Starting update process...' },
          { timestamp: '2024-01-15T10:30:05Z', level: 'info', message: 'Backing up current version...' }
        ]
      }
    },
    {
      id: 'admin-update-perform',
      name: 'Start System Update',
      method: 'POST',
      endpoint: '/api/admin/update/perform',
      description: 'Initiate system update process with configurable options',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        createBackup: true,
        restartServices: true,
        skipDependencyCheck: false,
        updateBranch: 'main',
        maintenanceMode: true,
        notifyUsers: true
      },
      responseExample: {
        success: true,
        message: 'Update process initiated successfully',
        updateId: 'upd_1234567890',
        estimatedDuration: 300,
        maintenanceModeEnabled: true,
        backupCreated: true
      }
    },
    {
      id: 'admin-update-cancel',
      name: 'Cancel Update Process',
      method: 'POST',
      endpoint: '/api/admin/update/cancel',
      description: 'Cancel ongoing update process and restore from backup if needed',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        reason: 'User cancelled',
        restoreFromBackup: true
      },
      responseExample: {
        success: true,
        message: 'Update process cancelled successfully',
        restoredFromBackup: true,
        maintenanceModeDisabled: true
      }
    },
    {
      id: 'admin-update-backup',
      name: 'Create System Backup',
      method: 'POST',
      endpoint: '/api/admin/update/backup',
      description: 'Create a manual backup of the current system state',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        name: 'manual-backup-2024-01-15',
        includeDatabase: true,
        includeLogs: false,
        description: 'Manual backup before major changes'
      },
      responseExample: {
        success: true,
        backupId: 'backup_1234567890',
        backupPath: '/backups/manual-backup-2024-01-15.tar.gz',
        size: '45.2MB',
        created: '2024-01-15T10:30:00Z'
      }
    },
    {
      id: 'admin-update-restore',
      name: 'Restore from Backup',
      method: 'POST',
      endpoint: '/api/admin/update/restore',
      description: 'Restore system from a specific backup',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        backupId: 'backup_1234567890',
        restoreDatabase: true,
        restartServices: true,
        maintenanceMode: true
      },
      responseExample: {
        success: true,
        message: 'System restored successfully from backup',
        restoredVersion: '1.2.3',
        restoredAt: '2024-01-15T10:30:00Z',
        servicesRestarted: true
      }
    },
    {
      id: 'admin-update-backups',
      name: 'List Available Backups',
      method: 'GET',
      endpoint: '/api/admin/update/backups',
      description: 'Get list of all available system backups',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        backups: [
          {
            id: 'backup_1234567890',
            name: 'manual-backup-2024-01-15',
            version: '1.2.3',
            size: '45.2MB',
            created: '2024-01-15T10:30:00Z',
            type: 'manual',
            description: 'Manual backup before major changes'
          },
          {
            id: 'backup_0987654321',
            name: 'auto-backup-2024-01-14',
            version: '1.2.2',
            size: '44.8MB',
            created: '2024-01-14T02:00:00Z',
            type: 'automatic',
            description: 'Automatic daily backup'
          }
        ],
        totalBackups: 2,
        totalSize: '90.0MB'
      }
    },
    {
      id: 'admin-maintenance-mode',
      name: 'Toggle Maintenance Mode',
      method: 'POST',
      endpoint: '/api/admin/maintenance',
      description: 'Enable or disable maintenance mode for system updates',
      category: 'admin',
      authentication: 'Bearer Token',
      requestBody: {
        enabled: true,
        message: 'System maintenance in progress. Please try again later.',
        estimatedDuration: 600,
        allowAdminAccess: true
      },
      responseExample: {
        success: true,
        maintenanceMode: true,
        message: 'Maintenance mode enabled successfully',
        enabledAt: '2024-01-15T10:30:00Z',
        estimatedCompletion: '2024-01-15T10:40:00Z'
      }
    },
    {
      id: 'admin-system-health',
      name: 'Get System Health',
      method: 'GET',
      endpoint: '/api/admin/system/health',
      description: 'Get comprehensive system health and performance metrics',
      category: 'admin',
      authentication: 'Bearer Token',
      responseExample: {
        success: true,
        status: 'healthy',
        uptime: '5 days, 12 hours, 34 minutes',
        version: '1.2.3',
        environment: 'production',
        system: {
          os: 'Ubuntu 22.04 LTS',
          node: '18.17.0',
          memory: {
            used: '256MB',
            total: '2GB',
            percentage: 12.5
          },
          cpu: {
            usage: 15.2,
            cores: 4
          },
          disk: {
            used: '5.2GB',
            total: '20GB',
            available: '14.8GB',
            percentage: 26
          }
        },
        services: {
          database: 'running',
          webServer: 'running',
          scheduler: 'running'
        },
        lastUpdate: '2024-01-10T08:00:00Z',
        nextScheduledMaintenance: '2024-01-20T02:00:00Z'
      }
    }
  ];

  const filteredEndpoints = apiEndpoints.filter(endpoint => endpoint.category === activeTab);

  const CodeBlock: React.FC<{ code: string; language?: string; id: string }> = ({ 
    code, 
    language = 'javascript', 
    id 
  }) => (
    <div className="relative">
      <div className="flex items-center justify-between bg-gray-800 text-white px-4 py-2 rounded-t-lg">
        <span className="text-sm font-medium">{language}</span>
        <button
          onClick={() => copyToClipboard(code, id)}
          className="flex items-center space-x-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
        >
          {copiedCode === id ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          <span className="text-sm">Copy</span>
        </button>
      </div>
      <pre className="bg-gray-900 text-gray-100 p-4 rounded-b-lg overflow-x-auto text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );

  const ApiPlayground: React.FC<{ endpoint: ApiEndpoint }> = ({ endpoint }) => {
    const [response, setResponse] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [requestBody, setRequestBody] = useState(
      endpoint.requestBody ? JSON.stringify(endpoint.requestBody, null, 2) : ''
    );

    const executeRequest = async () => {
      setLoading(true);
      setResponse(null);

      try {
        let config: any = {
          method: endpoint.method,
          url: `${baseUrl}${endpoint.endpoint.replace(':shortCode', 'abc123')}`,
          headers: {
            'Content-Type': 'application/json',
          },
        };

        if (endpoint.authentication) {
          config.headers['Authorization'] = 'Bearer your-admin-token';
        }

        if (endpoint.method !== 'GET' && requestBody) {
          config.data = JSON.parse(requestBody);
        }

        const result = await axios(config);
        setResponse({
          status: result.status,
          data: result.data,
        });
      } catch (error: any) {
        setResponse({
          status: error.response?.status || 500,
          data: error.response?.data || null,
          error: error.message,
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                'bg-purple-100 text-purple-800'
              }`}>
                {endpoint.method}
              </span>
              <code className="font-mono text-sm text-gray-700">{endpoint.endpoint}</code>
            </div>
            {endpoint.authentication && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                Auth Required
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm">{endpoint.description}</p>
        </div>

        <div className="p-6">
          {endpoint.method !== 'GET' && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Body (JSON)
              </label>
              <textarea
                value={requestBody}
                onChange={(e) => setRequestBody(e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm text-gray-900 bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500"
                placeholder="Enter JSON request body..."
              />
            </div>
          )}

          <button
            onClick={executeRequest}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-md transition-colors"
          >
            <Play className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Executing...' : 'Try it out'}</span>
          </button>

          {endpoint.responseExample && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Example Response:</h4>
              <pre className="bg-slate-800 text-green-400 border border-slate-600 rounded-md p-4 text-sm overflow-x-auto">
                {JSON.stringify(endpoint.responseExample, null, 2)}
              </pre>
            </div>
          )}

          {response && (
            <div className="mt-6">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm font-medium text-gray-700">Live Response:</span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  response.status >= 200 && response.status < 300 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {response.status}
                </span>
              </div>
              <pre className="bg-slate-800 text-cyan-300 border border-slate-600 rounded-md p-4 text-sm overflow-x-auto">
                {JSON.stringify(response.data, null, 2)}
              </pre>
              {response.error && (
                <div className="mt-2 text-red-600 text-sm">
                  Error: {response.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-12">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="bg-primary-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Server className="h-10 w-10 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Velink API Documentation</h2>
                <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
                  Welcome to the Velink API! Our RESTful API provides powerful URL shortening capabilities 
                  with comprehensive analytics, security features, and easy integration.
                </p>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Globe className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{apiEndpoints.filter(e => e.category === 'public').length}</div>
                  <div className="text-sm text-gray-600">Public Endpoints</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{apiEndpoints.filter(e => e.category === 'admin').length}</div>
                  <div className="text-sm text-gray-600">Admin Endpoints</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Zap className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">1000</div>
                  <div className="text-sm text-gray-600">Requests/Day</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="bg-orange-100 p-3 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">99.9%</div>
                  <div className="text-sm text-gray-600">Uptime</div>
                </div>
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-blue-600">1</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Choose API Type</h4>
                  <p className="text-gray-600 text-sm">
                    Start with Public API for basic URL shortening or use Admin API for advanced features
                  </p>
                </div>
                
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="bg-green-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">2</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Make API Calls</h4>
                  <p className="text-gray-600 text-sm">
                    Use our interactive playground to test endpoints and see real responses
                  </p>
                </div>
                
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="bg-purple-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Integrate</h4>
                  <p className="text-gray-600 text-sm">
                    Use our code examples to integrate Velink into your application
                  </p>
                </div>
              </div>
            </div>

            {/* Rate Limits */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Rate Limits</h3>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-semibold text-amber-800 mb-2">Current Limits</h4>
                    <ul className="text-amber-700 space-y-1">
                      <li>• <strong>Public API:</strong> Maximum 1 request per 0.5 seconds</li>
                      <li>• <strong>Daily Limit:</strong> 1000 new links per day per IP address</li>
                      <li>• <strong>Admin API:</strong> Higher limits for authenticated admin operations</li>
                      <li>• <strong>Update Operations:</strong> No rate limits during maintenance windows</li>
                      <li>• <strong>Read Operations:</strong> Statistics and info endpoints have increased limits</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Base URL */}
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Base URL</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <code className="font-mono text-lg text-gray-800">
                  {baseUrl || 'https://velink.me'}
                </code>
              </div>
            </div>
          </div>
        );

      case 'public':
      case 'admin':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {activeTab === 'public' ? 'Public API Endpoints' : 'Admin API Endpoints'}
              </h2>
              <p className="text-gray-600 mb-6">
                {activeTab === 'public' 
                  ? 'These endpoints are publicly accessible and do not require authentication.'
                  : 'These endpoints require admin authentication using a Bearer token.'}
              </p>
              
              {filteredEndpoints.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No endpoints available for this category.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredEndpoints.map((endpoint, index) => (
                    <motion.div
                      key={endpoint.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <ApiPlayground endpoint={endpoint} />
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 'examples':
        return (
          <div className="space-y-8">
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Code Examples</h2>
              
              <div className="space-y-8">
                {/* JavaScript Example */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">JavaScript/Fetch</h3>
                  <CodeBlock 
                    id="js-fetch"
                    code={`// Basic URL shortening
async function shortenUrl(url) {
  try {
    const response = await fetch('${baseUrl || 'https://velink.me'}/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        expiresIn: '30d'
      })
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log('Shortened URL:', data.shortUrl);
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}`}
                  />
                </div>

                {/* cURL Example */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">cURL</h3>
                  <CodeBlock 
                    id="curl-example"
                    language="bash"
                    code={`# Shorten a URL
curl -X POST "${baseUrl || 'https://velink.me'}/api/shorten" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://example.com/very-long-url",
    "expiresIn": "30d"
  }'

# Get link statistics
curl -X GET "${baseUrl || 'https://velink.me'}/api/info/abc123"

# Admin: Get all links (requires auth)
curl -X GET "${baseUrl || 'https://velink.me'}/api/admin/links" \\
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"`}
                  />
                </div>

                {/* Python Example */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Python</h3>
                  <CodeBlock 
                    id="python-example"
                    language="python"
                    code={`import requests
import json

class VelinkAPI:
    def __init__(self, base_url="${baseUrl || 'https://velink.me'}"):
        self.base_url = base_url
        
    def shorten_url(self, url, expires_in="30d"):
        """Shorten a URL using Velink API"""
        endpoint = f"{self.base_url}/api/shorten"
        payload = {
            "url": url,
            "expiresIn": expires_in
        }
        
        try:
            response = requests.post(endpoint, json=payload)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
            return None
    
    def get_link_info(self, short_code):
        """Get information about a shortened URL"""
        endpoint = f"{self.base_url}/api/info/{short_code}"
        
        try:
            response = requests.get(endpoint)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"Error: {e}")
            return None

# Usage
api = VelinkAPI()
result = api.shorten_url("https://example.com/long-url")
if result:
    print(f"Short URL: {result['shortUrl']}")
    print(f"QR Code: {result['qrCode']}")`}
                  />
                </div>

                {/* Node.js Example */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Node.js</h3>
                  <CodeBlock 
                    id="nodejs-example"
                    language="javascript"
                    code={`const axios = require('axios');

class VelinkAPI {
  constructor(baseUrl = '${baseUrl || 'https://velink.me'}', adminToken = null) {
    this.baseUrl = baseUrl;
    this.adminToken = adminToken;
  }

  async shortenUrl(url, expiresIn = '30d') {
    try {
      const response = await axios.post(\`\${this.baseUrl}/api/shorten\`, {
        url,
        expiresIn
      });
      return response.data;
    } catch (error) {
      console.error('Error shortening URL:', error.response?.data || error.message);
      throw error;
    }
  }

  async getLinkInfo(shortCode) {
    try {
      const response = await axios.get(\`\${this.baseUrl}/api/info/\${shortCode}\`);
      return response.data;
    } catch (error) {
      console.error('Error getting link info:', error.response?.data || error.message);
      throw error;
    }
  }

  async getStats() {
    try {
      const response = await axios.get(\`\${this.baseUrl}/api/stats\`);
      return response.data;
    } catch (error) {
      console.error('Error getting stats:', error.response?.data || error.message);
      throw error;
    }
  }

  // Admin methods requiring authentication
  getAuthHeaders() {
    if (!this.adminToken) {
      throw new Error('Admin token required for this operation');
    }
    return {
      'Authorization': \`Bearer \${this.adminToken}\`,
      'Content-Type': 'application/json'
    };
  }

  async checkForUpdates() {
    try {
      const response = await axios.get(\`\${this.baseUrl}/api/admin/update/check\`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error checking for updates:', error.response?.data || error.message);
      throw error;
    }
  }

  async startUpdate(options = {}) {
    const defaultOptions = {
      createBackup: true,
      restartServices: true,
      maintenanceMode: true
    };
    
    try {
      const response = await axios.post(\`\${this.baseUrl}/api/admin/update/perform\`, {
        ...defaultOptions,
        ...options
      }, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error starting update:', error.response?.data || error.message);
      throw error;
    }
  }

  async getUpdateStatus() {
    try {
      const response = await axios.get(\`\${this.baseUrl}/api/admin/update/status\`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting update status:', error.response?.data || error.message);
      throw error;
    }
  }

  async getSystemHealth() {
    try {
      const response = await axios.get(\`\${this.baseUrl}/api/admin/system/health\`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error) {
      console.error('Error getting system health:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Usage Examples
const api = new VelinkAPI('${baseUrl || 'https://velink.me'}', 'your-admin-token');

async function basicExample() {
  try {
    // Public API - Shorten a URL
    const result = await api.shortenUrl('https://example.com/very-long-url');
    console.log('Shortened URL:', result.shortUrl);
    
    // Get link information
    const info = await api.getLinkInfo(result.shortCode);
    console.log('Link clicks:', info.clicks);
    
    // Get global statistics
    const stats = await api.getStats();
    console.log('Total links:', stats.totalLinks);
  } catch (error) {
    console.error('Basic example failed:', error);
  }
}

async function adminExample() {
  try {
    // Admin API - Check system health
    const health = await api.getSystemHealth();
    console.log('System status:', health.status);
    console.log('Uptime:', health.uptime);
    
    // Check for updates
    const updateCheck = await api.checkForUpdates();
    if (updateCheck.updateAvailable) {
      console.log(\`Update available: \${updateCheck.latestVersion}\`);
      
      // Start update process
      const updateResult = await api.startUpdate({
        createBackup: true,
        maintenanceMode: true
      });
      console.log('Update started:', updateResult.updateId);
      
      // Monitor update progress
      const checkProgress = async () => {
        const status = await api.getUpdateStatus();
        console.log(\`Progress: \${status.progress}% - \${status.currentStep}\`);
        
        if (status.isUpdating) {
          setTimeout(checkProgress, 5000); // Check every 5 seconds
        } else {
          console.log('Update completed!');
        }
      };
      
      checkProgress();
    }
  } catch (error) {
    console.error('Admin example failed:', error);
  }
}

// Run examples
basicExample();
// adminExample(); // Uncomment when you have admin token`}
                  />
                </div>

                {/* Update System Management Example */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Update System Management</h3>
                  <CodeBlock 
                    id="update-system-example"
                    language="javascript"
                    code={`// Complete Update System Management Example
class VelinkUpdateManager {
  constructor(baseUrl, adminToken) {
    this.baseUrl = baseUrl;
    this.adminToken = adminToken;
  }

  async performFullSystemUpdate() {
    try {
      // 1. Check system health before update
      console.log('🔍 Checking system health...');
      const health = await this.getSystemHealth();
      if (health.status !== 'healthy') {
        throw new Error(\`System not healthy: \${health.status}\`);
      }

      // 2. Check for available updates
      console.log('🔄 Checking for updates...');
      const updateCheck = await this.checkForUpdates();
      if (!updateCheck.updateAvailable) {
        console.log('✅ System is already up to date');
        return;
      }

      console.log(\`📦 Update available: v\${updateCheck.latestVersion}\`);

      // 3. Create backup before update
      console.log('💾 Creating backup...');
      const backup = await this.createBackup({
        name: \`pre-update-\${new Date().toISOString().split('T')[0]}\`,
        includeDatabase: true,
        description: \`Backup before updating to v\${updateCheck.latestVersion}\`
      });
      console.log(\`✅ Backup created: \${backup.backupId}\`);

      // 4. Start update process
      console.log('🚀 Starting update process...');
      const updateResult = await this.startUpdate({
        createBackup: false, // Already created manual backup
        restartServices: true,
        maintenanceMode: true,
        updateBranch: 'main'
      });

      console.log(\`🔄 Update initiated: \${updateResult.updateId}\`);
      console.log(\`⏱️  Estimated duration: \${updateResult.estimatedDuration}s\`);

      // 5. Monitor update progress
      await this.monitorUpdateProgress();

      console.log('🎉 Update completed successfully!');

    } catch (error) {
      console.error('❌ Update failed:', error.message);
      
      // Attempt to restore from backup if update failed
      try {
        console.log('🔄 Attempting to restore from backup...');
        await this.restoreFromBackup(backup.backupId);
        console.log('✅ System restored from backup');
      } catch (restoreError) {
        console.error('❌ Restore failed:', restoreError.message);
      }
    }
  }

  async monitorUpdateProgress() {
    return new Promise((resolve, reject) => {
      const checkProgress = async () => {
        try {
          const status = await this.getUpdateStatus();
          
          console.log(\`📊 Progress: \${status.progress}% (\${status.currentStep})\`);
          
          if (status.stepProgress) {
            console.log(\`   Step \${status.stepProgress.step}: \${status.stepProgress.name} - \${status.stepProgress.progress}%\`);
          }

          if (!status.isUpdating) {
            resolve();
          } else {
            setTimeout(checkProgress, 3000); // Check every 3 seconds
          }
        } catch (error) {
          reject(error);
        }
      };

      checkProgress();
    });
  }

  // Additional helper methods...
  async getSystemHealth() {
    const response = await fetch(\`\${this.baseUrl}/api/admin/system/health\`, {
      headers: { 'Authorization': \`Bearer \${this.adminToken}\` }
    });
    return response.json();
  }

  async checkForUpdates() {
    const response = await fetch(\`\${this.baseUrl}/api/admin/update/check\`, {
      headers: { 'Authorization': \`Bearer \${this.adminToken}\` }
    });
    return response.json();
  }

  async startUpdate(options) {
    const response = await fetch(\`\${this.baseUrl}/api/admin/update/perform\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.adminToken}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });
    return response.json();
  }

  async getUpdateStatus() {
    const response = await fetch(\`\${this.baseUrl}/api/admin/update/status\`, {
      headers: { 'Authorization': \`Bearer \${this.adminToken}\` }
    });
    return response.json();
  }

  async createBackup(options) {
    const response = await fetch(\`\${this.baseUrl}/api/admin/update/backup\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.adminToken}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });
    return response.json();
  }

  async restoreFromBackup(backupId) {
    const response = await fetch(\`\${this.baseUrl}/api/admin/update/restore\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${this.adminToken}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ backupId, restartServices: true })
    });
    return response.json();
  }
}

// Usage
const updateManager = new VelinkUpdateManager('${baseUrl || 'https://velink.me'}', 'your-admin-token');

// Perform full automated update
updateManager.performFullSystemUpdate()
  .then(() => console.log('Update process completed'))
  .catch(error => console.error('Update failed:', error));`}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="transition-all duration-300 group-hover:scale-105">
                <img src="/logo512.png" alt="Velink Logo" className="h-10 w-10" />
              </div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Velink
                </h1>
                <span className="text-gray-500">API</span>
              </div>
            </Link>
            <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 font-medium ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 hover:border-primary-300 hover:shadow-md'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
          
          {/* Tab Description */}
          <div className="mt-4 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
              <div className="flex items-center gap-2 justify-center">
                <Info className="h-5 w-5 text-blue-600" />
                <p className="text-blue-800 font-medium">
                  {tabs.find(tab => tab.id === activeTab)?.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-6">
              If you have questions or need support, we're here to help!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/bug-report"
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Report an Issue
              </Link>
              <a
                href="mailto:mail@velyzo.de"
                className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg transition-colors"
              >
                Contact Support
              </a>
              <a
                href="https://github.com/velyzo/velink"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentation;

