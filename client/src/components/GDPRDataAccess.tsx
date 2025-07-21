import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Shield, Download, Trash2, Edit3, Eye, UserCheck, 
  Database, AlertCircle, CheckCircle, Home,
  Mail, Phone, HelpCircle 
} from 'lucide-react';

const GDPRDataAccess: React.FC = () => {
  const [shortCodes, setShortCodes] = useState<string>('');
  const [creationSecrets, setCreationSecrets] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'access' | 'delete' | 'export' | 'rectify'>('access');
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const parseShortCodes = (input: string): string[] => {
    return input
      .split(/[,\s\n]+/)
      .map(code => code.trim())
      .filter(code => code.length > 0)
      .map(code => {
        // Extract short code from full URLs
        if (code.includes('/')) {
          return code.split('/').pop() || '';
        }
        return code;
      })
      .filter(code => code.length > 0);
  };

  const handleAccessData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const codes = parseShortCodes(shortCodes);
      
      if (codes.length === 0) {
        setError('Please enter at least one short code');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/gdpr/my-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shortCodes: codes }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch data');
      }

      setUserData(data);
      setSuccess(`Found data for ${data.personalData.links.length} links with ${data.dataSubject.totalClicks} total clicks`);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteData = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const codes = parseShortCodes(shortCodes);
      const secrets = parseShortCodes(creationSecrets);
      
      if (codes.length === 0) {
        setError('Please enter at least one short code');
        setLoading(false);
        return;
      }

      if (secrets.length === 0) {
        setError('Please enter creation secrets to verify ownership');
        setLoading(false);
        return;
      }

      if (codes.length !== secrets.length) {
        setError('Number of short codes must match number of creation secrets');
        setLoading(false);
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to permanently delete all data for ${codes.length} short code(s)?\n\nThis action cannot be undone and will:\n- Delete all links\n- Delete all click analytics\n- Remove all associated data\n\nYou must provide the correct creation secrets to verify ownership.\n\nType "DELETE" in the next prompt to confirm.`
      );

      if (!confirmed) {
        setLoading(false);
        return;
      }

      const confirmText = window.prompt('Please type "DELETE" to confirm permanent deletion:');
      
      if (confirmText !== 'DELETE') {
        setError('Deletion cancelled - confirmation text did not match');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/gdpr/delete-my-data', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          shortCodes: codes,
          creationSecrets: secrets,
          confirmDeletion: true 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete data');
      }

      setSuccess(`Successfully deleted ${data.deleted.links} links and ${data.deleted.analytics} analytics records. Verified codes: ${data.verifiedCodes?.join(', ')}`);
      setUserData(null);
      setShortCodes('');
      setCreationSecrets('');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    setLoading(true);
    setError('');
    
    try {
      const codes = parseShortCodes(shortCodes);
      
      if (codes.length === 0) {
        setError('Please enter at least one short code');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/gdpr/export-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          shortCodes: codes,
          format 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to export data');
      }

      // Create download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `velink-my-data-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSuccess(`Data exported successfully as ${format.toUpperCase()}`);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500 rounded-2xl mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">GDPR Data Access</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access, export, modify, or delete your personal data in compliance with GDPR regulations
          </p>
          
          {/* Back to Home Button */}
          <div className="mt-6">
            <Link 
              to="/" 
              className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-1 border border-gray-200"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
        </motion.div>

        {/* Data Controller Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-blue-200"
        >
          <div className="flex items-start space-x-4">
            <UserCheck className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Data Controller Information</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <p><strong>Name:</strong> Devin Oldenburg</p>
                  <p className="flex items-center space-x-2 mt-1">
                    <Mail className="w-4 h-4" />
                    <span><strong>Email:</strong> <a href="mailto:devin.oldenburg@icloud.com" className="text-blue-600 hover:text-blue-700">devin.oldenburg@icloud.com</a></span>
                  </p>
                  <p className="flex items-center space-x-2 mt-1">
                    <Phone className="w-4 h-4" />
                    <span><strong>Phone:</strong> +49 15733791807</span>
                  </p>
                </div>
                <div>
                  <p><strong>Data Retention:</strong> 12 months automatic deletion</p>
                  <p><strong>IP Anonymization:</strong> After 30 days</p>
                  <p><strong>Response Time:</strong> Within 30 days</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'access', label: 'Access Data', icon: Eye },
                { id: 'export', label: 'Export Data', icon: Download },
                { id: 'rectify', label: 'Rectify Data', icon: Edit3 },
                { id: 'delete', label: 'Delete Data', icon: Trash2 }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Short Code Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Short Codes
              </label>
              <textarea
                value={shortCodes}
                onChange={(e) => setShortCodes(e.target.value)}
                placeholder="Enter your short codes (one per line or comma-separated):&#10;abc123&#10;def456&#10;https://velink.site/xyz789"
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                You can enter short codes, full URLs, or a mix. We'll extract the codes automatically.
              </p>
            </div>

            {/* Creation Secrets Input (only for delete) */}
            {activeTab === 'delete' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Creation Secrets <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={creationSecrets}
                  onChange={(e) => setCreationSecrets(e.target.value)}
                  placeholder="Enter creation secrets (one per line or comma-separated):&#10;abc123def456...&#10;789ghi012jkl...&#10;&#10;Note: You received these secrets when you created the links."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-red-600 mt-1">
                  <strong>Required for deletion:</strong> Creation secrets verify you own these links. You received these when you created each link.
                </p>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800">Error</h4>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-start space-x-3"
              >
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Success</h4>
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              </motion.div>
            )}

            {/* Tab Content */}
            {activeTab === 'access' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <span>Access Your Data</span>
                </h3>
                <p className="text-gray-600 mb-4">
                  View all data we have stored about your short links and their usage.
                </p>
                <button
                  onClick={handleAccessData}
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : 'Access My Data'}
                </button>
              </div>
            )}

            {activeTab === 'export' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Download className="w-5 h-5 text-blue-600" />
                  <span>Export Your Data</span>
                </h3>
                <p className="text-gray-600 mb-4">
                  Download your data in a portable format for use with other services.
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleExportData('json')}
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Exporting...' : 'Export as JSON'}
                  </button>
                  <button
                    onClick={() => handleExportData('csv')}
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Exporting...' : 'Export as CSV'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'rectify' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                  <span>Rectify Your Data</span>
                </h3>
                <p className="text-gray-600 mb-4">
                  Contact us to correct any inaccurate information in your data.
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 text-sm">
                    For data corrections, please contact us directly at{' '}
                    <a href="mailto:devin.oldenburg@icloud.com" className="font-medium underline">
                      devin.oldenburg@icloud.com
                    </a>{' '}
                    with the specific information you'd like to correct.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'delete' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  <span>Delete Your Data</span>
                </h3>
                <p className="text-gray-600 mb-4">
                  Permanently delete all data associated with your short links. This action cannot be undone.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <UserCheck className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-800">Ownership Verification Required</h4>
                      <p className="text-blue-700 text-sm">
                        To delete links, you must provide the <strong>creation secrets</strong> you received when creating each link. 
                        This ensures only the original creator can delete the data.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-800">Warning</h4>
                      <p className="text-red-700 text-sm">
                        This will permanently delete all links, analytics, and associated data. 
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleDeleteData}
                  disabled={loading}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Deleting...' : 'Delete My Data'}
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Display User Data */}
        {userData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Database className="w-6 h-6 text-blue-600" />
              <span>Your Data Summary</span>
            </h3>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-blue-600 font-medium">Total Links</p>
                <p className="text-2xl font-bold text-blue-800">{userData.personalData.links.length}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-green-600 font-medium">Total Clicks</p>
                <p className="text-2xl font-bold text-green-800">{userData.dataSubject.totalClicks}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-purple-600 font-medium">Data Retention</p>
                <p className="text-sm font-bold text-purple-800">{userData.dataSubject.dataRetentionPolicy}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Your Links:</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Short Code</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Original URL</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userData.personalData.links.map((link: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm font-mono text-blue-600">{link.shortCode}</td>
                        <td className="px-4 py-2 text-sm text-gray-900 max-w-xs truncate">{link.originalUrl}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{link.clicks}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {new Date(link.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            link.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {link.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <p>Generated at: {new Date(userData.generatedAt).toLocaleString()}</p>
              <p>Request source: {userData.requestSource}</p>
            </div>
          </motion.div>
        )}

        {/* GDPR Rights Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-6 mt-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <HelpCircle className="w-6 h-6 text-blue-600" />
            <span>Your Privacy Rights (GDPR)</span>
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">👁️</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Right to Information</h4>
                  <p className="text-sm text-gray-600">Know what data we have about you</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🔍</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Right of Access</h4>
                  <p className="text-sm text-gray-600">Request a copy of your data</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">✏️</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Right to Rectification</h4>
                  <p className="text-sm text-gray-600">Correct inaccurate information</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🗑️</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Right to Erasure</h4>
                  <p className="text-sm text-gray-600">Request immediate data deletion</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">🚫</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Right to Object</h4>
                  <p className="text-sm text-gray-600">Object to data processing</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-lg">📋</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Right to Portability</h4>
                  <p className="text-sm text-gray-600">Export your data in standard format</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Exercise Your Rights:</strong> Contact us anytime to exercise these rights. We respond within 30 days.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default GDPRDataAccess;
