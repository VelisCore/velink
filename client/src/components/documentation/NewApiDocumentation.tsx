import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Copy, Check, AlertCircle, BarChart3, Globe, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

interface PlaygroundRequest {
  url: string;
  method: 'GET' | 'POST' | 'DELETE';
  endpoint: string;
  body?: any;
  description: string;
}

interface PlaygroundResponse {
  status: number;
  data: any;
  error?: string;
}

const ApiPlayground: React.FC<{ request: PlaygroundRequest }> = ({ request }) => {
  const [response, setResponse] = useState<PlaygroundResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestBody, setRequestBody] = useState<string>(
    request.body ? JSON.stringify(request.body, null, 2) : ''
  );
  const [copied, setCopied] = useState(false);

  const executeRequest = async () => {
    setLoading(true);
    setResponse(null);

    try {
      let config: any = {
        method: request.method,
        url: request.url + request.endpoint,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (request.method !== 'GET' && requestBody) {
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

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard!');
  };

  const curlCommand = `curl -X ${request.method} "${request.url}${request.endpoint}"${
    request.method !== 'GET' && requestBody 
      ? ` \\\n  -H "Content-Type: application/json" \\\n  -d '${requestBody.replace(/\n\s*/g, ' ')}'`
      : ''
  }`;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 md:px-6 py-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold w-fit ${
              request.method === 'GET' ? 'bg-green-100 text-green-800' :
              request.method === 'POST' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {request.method}
            </span>
            <code className="font-mono text-sm text-gray-700 break-all">{request.endpoint}</code>
          </div>
          <button
            onClick={() => copyToClipboard(curlCommand)}
            className="flex items-center space-x-2 px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors text-sm w-fit"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            <span>Copy cURL</span>
          </button>
        </div>
        <p className="mt-2 text-gray-600 text-sm">{request.description}</p>
      </div>

      <div className="p-4 md:p-6">
        {request.method !== 'GET' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Body (JSON)
            </label>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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

        {response && (
          <div className="mt-6">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm font-medium text-gray-700">Response:</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                response.status >= 200 && response.status < 300 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {response.status}
              </span>
            </div>
            <pre className="bg-gray-50 border border-gray-200 rounded-md p-3 md:p-4 text-xs md:text-sm overflow-x-auto">
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

const NewApiDocumentation: React.FC = () => {
  const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '';
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show scroll to top button when user scrolls down
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const endpoints: PlaygroundRequest[] = [
    {
      url: baseUrl,
      method: 'POST',
      endpoint: '/api/shorten',
      description: 'Create a new shortened URL. No API key required. Rate limited to 1 request per 0.5 seconds and 500 links per day.',
      body: {
        url: 'https://example.com/very-long-url-to-shorten',
        expiresIn: '30d'
      }
    },
    {
      url: baseUrl,
      method: 'POST',
      endpoint: '/api/batch-shorten',
      description: 'Create multiple shortened URLs at once. Perfect for bulk operations.',
      body: {
        urls: [
          'https://example.com/page1',
          'https://example.com/page2',
          'https://github.com/your-repo'
        ],
        expiresIn: '30d'
      }
    },
    {
      url: baseUrl,
      method: 'GET',
      endpoint: '/api/info/abc123',
      description: 'Get information about a specific shortened URL. Replace "abc123" with the actual short code.'
    },
    {
      url: baseUrl,
      method: 'GET',
      endpoint: '/api/stats',
      description: 'Get global statistics including total links, clicks, top domains, and daily click data.'
    },
    {
      url: baseUrl,
      method: 'GET',
      endpoint: '/api/v1/stats',
      description: 'Get detailed statistics with enhanced analytics data.'
    },
    {
      url: baseUrl,
      method: 'DELETE',
      endpoint: '/api/links/abc123',
      description: 'Delete a shortened URL. Replace "abc123" with the actual short code.'
    }
  ];

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
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 px-4"
        >
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold bg-gradient-to-r from-primary-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
            Velink API Documentation
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Simple, powerful, and completely free URL shortening API. No API keys required - just start using it right away!
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-8">
            <div className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm md:text-base">
              <Check className="h-4 w-4" />
              <span className="font-medium">No API Key Required</span>
            </div>
            <div className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm md:text-base">
              <Globe className="h-4 w-4" />
              <span className="font-medium">Rate Limited</span>
            </div>
            <div className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm md:text-base">
              <BarChart3 className="h-4 w-4" />
              <span className="font-medium">Analytics Included</span>
            </div>
          </div>
        </motion.div>

        {/* Rate Limiting Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-12"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">Rate Limiting</h3>
              <ul className="text-amber-700 space-y-1">
                <li>• <strong>Request Frequency:</strong> Maximum 1 request per 0.5 seconds</li>
                <li>• <strong>Daily Limit:</strong> 500 new links per day per IP address</li>
                <li>• <strong>Suspension:</strong> Accounts are temporarily suspended after reaching daily limits</li>
                <li>• <strong>Read Operations:</strong> Statistics and info endpoints have higher limits</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Base URL */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-12"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Base URL</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
            <code className="font-mono text-sm">
              {process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : 'https://velink.me'}
            </code>
          </div>
        </motion.div>

        {/* API Endpoints */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-8"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Interactive API Playground</h2>
          
          {endpoints.map((endpoint, index) => (
            <motion.div
              key={`${endpoint.method}-${endpoint.endpoint}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <ApiPlayground request={endpoint} />
            </motion.div>
          ))}
        </motion.div>

        {/* Response Codes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 bg-white rounded-xl shadow-lg border border-gray-200 p-8"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-6">HTTP Response Codes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-green-700">Success Codes</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-mono">200</span>
                  <span>OK - Request successful</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">201</span>
                  <span>Created - Resource created successfully</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold text-red-700">Error Codes</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-mono">400</span>
                  <span>Bad Request - Invalid input</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">404</span>
                  <span>Not Found - Resource not found</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">429</span>
                  <span>Too Many Requests - Rate limit exceeded</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono">500</span>
                  <span>Internal Error - Server error</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-6">
            If you have questions or need support, we're here to help!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="mailto:mail@velyzo.de"
              className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Contact Support
            </a>
            <a
              href="https://github.com/velyzo/velink"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll to top button for mobile */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg transition-all duration-300 md:hidden"
          aria-label="Scroll to top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default NewApiDocumentation;
