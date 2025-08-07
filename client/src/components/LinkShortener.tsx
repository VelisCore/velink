import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Link2, Copy, Check, ExternalLink, BarChart3, AlertCircle, Settings } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ShortenedLink {
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
  expiresAt?: string;
  customOptions?: {
    [key: string]: any;
  };
}

const LinkShortener: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shortenedLink, setShortenedLink] = useState<ShortenedLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [expiresIn, setExpiresIn] = useState<string>('never');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [customPassword, setCustomPassword] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [redirectDelay, setRedirectDelay] = useState<number>(0);
  const [urlPreview, setUrlPreview] = useState<string>('');

  const isValidUrl = (string: string) => {
    try {
      const url = new URL(string);
      return (url.protocol === 'http:' || url.protocol === 'https:') && 
             url.hostname && 
             url.hostname.includes('.') &&
             !url.hostname.startsWith('.') &&
             !url.hostname.endsWith('.');
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL starting with http:// or https:// (e.g., https://example.com)');
      return;
    }

    // Additional URL validation
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1' || 
          urlObj.hostname.endsWith('.local') || urlObj.hostname.includes('192.168.') ||
          urlObj.hostname.includes('10.0.') || urlObj.hostname.includes('172.16.')) {
        setError('Local URLs cannot be shortened for security reasons');
        return;
      }
    } catch (e) {
      setError('Invalid URL format');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // Prepare custom options if any are set
      const customOptions = {} as any;
      
      if (customPassword) {
        customOptions.password = customPassword;
      }
      
      if (isPrivate) {
        customOptions.isPrivate = true;
      }

      if (redirectDelay > 0) {
        customOptions.redirectDelay = redirectDelay;
      }

      // Prepare the request payload
      const payload = { 
        url,
        expiresIn,
        ...(Object.keys(customOptions).length > 0 ? { customOptions } : {})
      };

      const response = await axios.post('/api/shorten', payload);
      setShortenedLink(response.data);
      toast.success('Link shortened successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to shorten URL';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortenedLink) return;
    
    try {
      await navigator.clipboard.writeText(shortenedLink.shortUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleReset = () => {
    setUrl('');
    setShortenedLink(null);
    setError('');
    setCopied(false);
    setExpiresIn('never');
    setCustomPassword('');
    setIsPrivate(false);
    setRedirectDelay(0);
    setShowAdvancedOptions(false);
    setUrlPreview('');
  };

  return (
    <section id="shortener" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Shorten Your Links
          </h2>
          <p className="text-lg text-gray-600">
            Paste your long URL below and get a beautiful short link instantly
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="card max-w-2xl mx-auto"
        >
          {!shortenedLink ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your long URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      // Update URL preview
                      if (e.target.value && isValidUrl(e.target.value)) {
                        try {
                          const urlObj = new URL(e.target.value);
                          setUrlPreview(`${urlObj.hostname}${urlObj.pathname}`);
                        } catch {
                          setUrlPreview('');
                        }
                      } else {
                        setUrlPreview('');
                      }
                    }}
                    placeholder="https://example.com/very-long-url-here"
                    className={`input-primary pl-10 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {urlPreview && !error && (
                  <div className="mt-2 text-sm text-gray-500 flex items-center">
                    <span className="text-gray-400 mr-1">Preview:</span>
                    <span className="font-mono bg-gray-50 px-2 py-1 rounded">velink.me/abc123</span>
                    <span className="mx-2 text-gray-300">→</span>
                    <span className="truncate">{urlPreview}</span>
                  </div>
                )}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center space-x-2 text-red-600"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="expires" className="block text-sm font-medium text-gray-700">
                    Link expiration
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    {showAdvancedOptions ? 'Hide' : 'Show'} advanced options
                  </button>
                </div>
                <select
                  id="expires"
                  value={expiresIn}
                  onChange={(e) => setExpiresIn(e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  disabled={isLoading}
                >
                  <option value="never">Never expire</option>
                  <option value="1d">1 day</option>
                  <option value="7d">7 days</option>
                  <option value="30d">30 days</option>
                  <option value="365d">1 year</option>
                </select>
              </div>
              
              {showAdvancedOptions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 bg-gray-50 p-4 rounded-lg"
                >
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password protection (optional)
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      placeholder="Enter a password"
                      className="input-primary"
                      disabled={isLoading}
                    />
                    {customPassword && (
                      <p className="text-xs text-blue-600 mt-1">
                        🔒 Visitors will need to enter this password before accessing the link
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="redirectDelay" className="block text-sm font-medium text-gray-700 mb-1">
                      Redirect delay (seconds)
                    </label>
                    <select
                      id="redirectDelay"
                      value={redirectDelay}
                      onChange={(e) => setRedirectDelay(Number(e.target.value))}
                      className="input-primary"
                      disabled={isLoading}
                    >
                      <option value={0}>Instant redirect</option>
                      <option value={3}>3 seconds</option>
                      <option value={5}>5 seconds</option>
                      <option value={10}>10 seconds</option>
                      <option value={15}>15 seconds</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Add a countdown before redirecting to the destination
                    </p>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="private"
                      checked={isPrivate}
                      onChange={(e) => setIsPrivate(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      disabled={isLoading}
                    />
                    <label htmlFor="private" className="ml-2 block text-sm text-gray-700">
                      Make this link private (not shown in public stats)
                    </label>
                  </div>
                </motion.div>
              )}



              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Shortening...</span>
                  </div>
                ) : (
                  'Shorten Link'
                )}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="h-8 w-8 text-green-600" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Your link has been shortened!
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={shortenedLink.shortUrl}
                      readOnly
                      className="input-primary flex-1 bg-gray-50"
                    />
                    <button
                      onClick={handleCopy}
                      className="btn-secondary px-4"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <a
                      href={shortenedLink.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary px-4"
                      title="Open link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original URL
                  </label>
                  <input
                    type="text"
                    value={shortenedLink.originalUrl}
                    readOnly
                    className="input-primary bg-gray-50 text-gray-600"
                  />
                </div>

                {/* Creation Secret - REMOVED FOR SIMPLIFICATION
                GDPR complexity was removed since no personal data is collected.
                The entire creation secret system has been simplified.
                {shortenedLink.creationSecret && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Key className="w-4 h-4 inline mr-1" />
                      Creation Secret (Required for Data Deletion)
                    </label>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="text"
                          value={shortenedLink.creationSecret}
                          readOnly
                          className="input-primary bg-white text-gray-800 font-mono text-sm flex-1"
                        />
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(shortenedLink.creationSecret!);
                            toast.success('Creation secret copied!');
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                          title="Copy creation secret"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-sm text-blue-800">
                        � <strong>Save this code</strong> to manage your link later (delete, change settings, etc.). 
                        <a href="/gdpr" className="text-blue-600 underline ml-1">Manage your links</a>
                      </p>
                    </div>
                  </div>
                )} */}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <BarChart3 className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{shortenedLink.clicks}</div>
                    <div className="text-sm text-gray-600">Clicks</div>
                    <Link 
                      to={`/analytics/${shortenedLink.shortCode}`}
                      className="mt-2 text-xs text-primary-600 hover:text-primary-700 inline-block"
                    >
                      View Analytics
                    </Link>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {new Date(shortenedLink.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">Created</div>
                    {shortenedLink.expiresAt && (
                      <div className="mt-1 text-xs text-amber-600">
                        Expires: {new Date(shortenedLink.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                
                {shortenedLink.customOptions && Object.keys(shortenedLink.customOptions).length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="font-medium mb-1">Additional options:</div>
                    <ul className="text-gray-600">
                      {shortenedLink.customOptions.password && (
                        <li>🔒 Password protected</li>
                      )}
                      {shortenedLink.customOptions.isPrivate && (
                        <li>🔏 Private link (not shown in public stats)</li>
                      )}
                      {shortenedLink.customOptions.redirectDelay && shortenedLink.customOptions.redirectDelay > 0 && (
                        <li>⏱️ {shortenedLink.customOptions.redirectDelay}s redirect delay</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              <button
                onClick={handleReset}
                className="btn-secondary w-full"
              >
                Shorten Another Link
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default LinkShortener;
