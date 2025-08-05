import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Server,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  Settings,
  Activity,
  HardDrive,
  Cpu,
  Clock,
  GitBranch,
  Archive,
  RotateCcw
} from 'lucide-react';
import toast from 'react-hot-toast';

interface UpdateStatus {
  isUpdating: boolean;
  step: number;
  totalSteps: number;
  percentage: number;
  currentStep: string;
  timestamp: string;
  success?: boolean;
  error?: string;
  estimatedTimeRemaining?: number;
}

interface SystemHealth {
  status: string;
  uptime: string;
  memoryUsage: string;
  diskUsage: string;
  loadAverage: string;
  nodeVersion: string;
  platform: string;
  arch: string;
}

interface UpdateInfo {
  success: boolean;
  updateAvailable: boolean;
  currentCommit: string;
  latestCommit: string;
  currentVersion: string;
  latestVersion: string;
  systemHealth: SystemHealth;
  lastCheck: string;
}

const EnhancedUpdateAdminPanel: React.FC = () => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'update' | 'backups' | 'maintenance'>('overview');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);

  // Polling for update status
  useEffect(() => {
    const pollStatus = () => {
      if (updateStatus?.isUpdating) {
        fetchUpdateStatus();
      }
    };

    const interval = setInterval(pollStatus, 3000);
    return () => clearInterval(interval);
  }, [updateStatus?.isUpdating]);

  const fetchUpdateInfo = async () => {
    try {
      const response = await fetch('/api/admin/update/check', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUpdateInfo(data);
      } else {
        throw new Error('Failed to fetch update info');
      }
    } catch (error) {
      console.error('Error fetching update info:', error);
      toast.error('Failed to check for updates');
    }
  };

  const fetchUpdateStatus = async () => {
    try {
      const response = await fetch('/api/admin/update/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUpdateStatus(data);
      }
    } catch (error) {
      console.error('Error fetching update status:', error);
    }
  };

  const fetchBackups = async () => {
    try {
      const response = await fetch('/api/admin/update/backups', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setBackups(data.backups || []);
      }
    } catch (error) {
      console.error('Error fetching backups:', error);
    }
  };

  const performUpdate = async (options: any = {}) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/update/perform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          createBackup: true,
          restartServices: true,
          maintenanceMode: true,
          updateSystem: false,
          verbose: true,
          ...options
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setUpdateStatus({ isUpdating: true, step: 0, totalSteps: 12, percentage: 0, currentStep: 'Starting update...', timestamp: new Date().toISOString() });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Update failed');
      }
    } catch (error: any) {
      console.error('Error performing update:', error);
      toast.error(error.message || 'Failed to start update');
    } finally {
      setLoading(false);
    }
  };

  const cancelUpdate = async () => {
    try {
      const response = await fetch('/api/admin/update/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          reason: 'User cancelled from admin panel'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setUpdateStatus(null);
      } else {
        throw new Error('Failed to cancel update');
      }
    } catch (error) {
      console.error('Error cancelling update:', error);
      toast.error('Failed to cancel update');
    }
  };

  const createBackup = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/update/backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          name: `manual-backup-${new Date().toISOString().split('T')[0]}`,
          includeDatabase: true,
          description: 'Manual backup created from admin panel'
        }),
      });

      if (response.ok) {
        await response.json();
        toast.success('Backup created successfully');
        fetchBackups();
      } else {
        throw new Error('Failed to create backup');
      }
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenanceMode = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/admin/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: JSON.stringify({
          enabled,
          message: enabled ? 'System maintenance in progress' : undefined,
          estimatedDuration: enabled ? 600 : undefined
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMaintenanceMode(data.maintenanceMode);
        toast.success(data.message);
      } else {
        throw new Error('Failed to toggle maintenance mode');
      }
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
      toast.error('Failed to toggle maintenance mode');
    }
  };

  // Load initial data
  useEffect(() => {
    fetchUpdateInfo();
    fetchUpdateStatus();
    fetchBackups();
  }, []);

  const renderOverview = () => (
    <div className="space-y-6">
      {/* System Health */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-green-500" />
          System Health
        </h3>
        
        {updateInfo?.systemHealth ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-blue-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className="font-semibold">{updateInfo.systemHealth.uptime}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Cpu className="h-5 w-5 text-orange-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Memory</p>
                  <p className="font-semibold">{updateInfo.systemHealth.memoryUsage}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <HardDrive className="h-5 w-5 text-purple-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Disk Usage</p>
                  <p className="font-semibold">{updateInfo.systemHealth.diskUsage}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <GitBranch className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-600">Node.js</p>
                  <p className="font-semibold">{updateInfo.systemHealth.nodeVersion}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-pulse bg-gray-200 rounded-lg h-24"></div>
        )}
      </div>

      {/* Update Status */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <RefreshCw className="h-5 w-5 mr-2 text-blue-500" />
          Update Status
        </h3>
        
        {updateInfo ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Current Version</p>
                <p className="font-semibold">{updateInfo.currentVersion} ({updateInfo.currentCommit})</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Latest Version</p>
                <p className="font-semibold">{updateInfo.latestVersion} ({updateInfo.latestCommit})</p>
              </div>
            </div>
            
            {updateInfo.updateAvailable ? (
              <div className="flex items-center p-4 bg-blue-50 rounded-lg">
                <Download className="h-5 w-5 text-blue-500 mr-3" />
                <div className="flex-1">
                  <p className="font-semibold text-blue-900">Update Available</p>
                  <p className="text-sm text-blue-700">A new version is ready to install</p>
                </div>
                <button
                  onClick={() => setActiveTab('update')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Now
                </button>
              </div>
            ) : (
              <div className="flex items-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="font-semibold text-green-900">Up to Date</p>
                  <p className="text-sm text-green-700">Your system is running the latest version</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
        )}
      </div>
    </div>
  );

  const renderUpdateTab = () => (
    <div className="space-y-6">
      {updateStatus?.isUpdating ? (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 text-blue-500 animate-spin" />
            Update in Progress
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {updateStatus.step}/{updateStatus.totalSteps}: {updateStatus.currentStep}
                </span>
                <span className="text-sm text-gray-500">{updateStatus.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${updateStatus.percentage}%` }}
                ></div>
              </div>
            </div>
            
            {updateStatus.estimatedTimeRemaining && (
              <p className="text-sm text-gray-600">
                Estimated time remaining: {Math.ceil(updateStatus.estimatedTimeRemaining / 60)} minutes
              </p>
            )}
            
            <button
              onClick={cancelUpdate}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cancel Update
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <RefreshCw className="h-5 w-5 mr-2 text-blue-500" />
            System Update
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => performUpdate({ updateSystem: false })}
                disabled={loading}
                className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-colors text-left"
              >
                <div className="flex items-center">
                  <RefreshCw className="h-6 w-6 text-blue-500 mr-3" />
                  <div>
                    <h4 className="font-semibold">Standard Update</h4>
                    <p className="text-sm text-gray-600">Update Velink application only</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => performUpdate({ updateSystem: true })}
                disabled={loading}
                className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-400 transition-colors text-left"
              >
                <div className="flex items-center">
                  <Server className="h-6 w-6 text-orange-500 mr-3" />
                  <div>
                    <h4 className="font-semibold">Full System Update</h4>
                    <p className="text-sm text-gray-600">Update Velink + system packages</p>
                  </div>
                </div>
              </button>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800">Before updating:</h4>
                  <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                    <li>• A backup will be created automatically</li>
                    <li>• The system will enter maintenance mode</li>
                    <li>• Services will restart after completion</li>
                    <li>• Updates typically take 5-10 minutes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBackupsTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Archive className="h-5 w-5 mr-2 text-blue-500" />
            System Backups
          </h3>
          <button
            onClick={createBackup}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Create Backup
          </button>
        </div>
        
        <div className="space-y-3">
          {backups.length > 0 ? (
            backups.map((backup) => (
              <div key={backup.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <h4 className="font-semibold">{backup.name}</h4>
                  <p className="text-sm text-gray-600">{backup.description}</p>
                  <p className="text-xs text-gray-500">
                    Created: {new Date(backup.created).toLocaleString()} • Size: {backup.size}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center">
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Restore
                  </button>
                  <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Archive className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No backups found</p>
              <p className="text-sm">Create your first backup to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMaintenanceTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-blue-500" />
          Maintenance Mode
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-semibold">Maintenance Mode</h4>
              <p className="text-sm text-gray-600">
                Temporarily disable public access for system maintenance
              </p>
            </div>
            <button
              onClick={() => toggleMaintenanceMode(!maintenanceMode)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
                maintenanceMode
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {maintenanceMode ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Disable
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Enable
                </>
              )}
            </button>
          </div>
          
          {maintenanceMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800">Maintenance Mode Active</h4>
                  <p className="text-sm text-yellow-700">
                    Public access is currently disabled. Only admin routes are accessible.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enhanced Update System</h1>
          <p className="text-gray-600">Ultra-robust update management for Ubuntu server</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'update', label: 'Updates', icon: RefreshCw },
              { id: 'backups', label: 'Backups', icon: Archive },
              { id: 'maintenance', label: 'Maintenance', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
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
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'update' && renderUpdateTab()}
            {activeTab === 'backups' && renderBackupsTab()}
            {activeTab === 'maintenance' && renderMaintenanceTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EnhancedUpdateAdminPanel;
