import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Server, Key, Clock, Lock, Check, AlertTriangle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const ApiDocumentation: React.FC = () => {
  const apiEndpoints = [
    {
      name: 'Shorten URL',
      method: 'POST',
      endpoint: '/api/shorten',
      description: 'Create a new shortened URL with advanced options',
      requestBody: {
        url: 'https://example.com/very-long-url',
        expiresIn: '30d', // Optional: 1d, 7d, 30d, 365d, never
        customOptions: {
          isPrivate: true, // Optional: If true, link won't appear in public stats
          password: 'secret', // Optional: Password protection for the link
          redirectDelay: 5 // Optional: Delay in seconds (0-15) before redirect
        }
      },
      response: {
        shortUrl: 'https://velink.me/abc123',
        shortCode: 'abc123',
        originalUrl: 'https://example.com/very-long-url',
        clicks: 0,
        createdAt: '2025-07-23T12:00:00.000Z',
        expiresAt: '2025-08-22T12:00:00.000Z',
        customOptions: {
          isPrivate: true,
          password: true, // Password is never returned, only a boolean indicating if set
          redirectDelay: 5
        }
      },
      limits: 'Rate limited to 1 request per 0.5 seconds, 500 links per day per IP',
      icon: <Server className="h-6 w-6 text-primary-600" />
    },
    {
      name: 'Batch Shorten URLs',
      method: 'POST',
      endpoint: '/api/batch-shorten',
      description: 'Create multiple shortened URLs in a single request',
      requestBody: {
        urls: [
          'https://example.com/url1',
          'https://example.com/url2'
        ],
        expiresIn: '30d', // Optional: applies to all URLs
        customOptions: {
          isPrivate: false,
          redirectDelay: 3
        }
      },
      response: [
        {
          shortUrl: 'https://velink.me/abc123',
          shortCode: 'abc123',
          originalUrl: 'https://example.com/url1',
          clicks: 0,
          createdAt: '2025-07-23T12:00:00.000Z'
        },
        {
          shortUrl: 'https://velink.me/def456',
          shortCode: 'def456',
          originalUrl: 'https://example.com/url2',
          clicks: 0,
          createdAt: '2025-07-23T12:00:00.000Z'
        }
      ],
      limits: 'Rate limited to 1 request per 0.5 seconds, max 10 URLs per batch',
      icon: <Server className="h-6 w-6 text-indigo-600" />
    },
    {
      name: 'Get URL Info',
      method: 'GET',
      endpoint: '/api/info/{shortCode}',
      description: 'Get information about a shortened URL',
      response: {
        shortCode: 'abc123',
        originalUrl: 'https://example.com/very-long-url',
        clicks: 42,
        createdAt: '2025-07-23T12:00:00.000Z',
        expiresAt: '2025-08-22T12:00:00.000Z',
        customOptions: {
          isPrivate: false,
          password: false,
          redirectDelay: 0
        }
      },
      icon: <Key className="h-6 w-6 text-amber-600" />
    },
    {
      name: 'Verify Link Password',
      method: 'POST',
      endpoint: '/api/verify-password/{shortCode}',
      description: 'Verify password for a password-protected link',
      requestBody: {
        password: 'secret'
      },
      response: {
        success: true,
        originalUrl: 'https://example.com/very-long-url'
      },
      icon: <Lock className="h-6 w-6 text-green-600" />
    },
    {
      name: 'Track Click',
      method: 'POST',
      endpoint: '/api/track/{shortCode}',
      description: 'Track a click on a shortened URL (internal use)',
      response: {
        success: true,
        clicks: 43
      },
      icon: <Settings className="h-6 w-6 text-orange-600" />
    },
    {
      name: 'Get Enhanced Statistics',
      method: 'GET',
      endpoint: '/api/v1/stats',
      description: 'Get comprehensive real-time statistics with detailed metrics',
      response: {
        totalLinks: 1000,
        totalClicks: 50000,
        activeLinks: 950,
        linksToday: 25,
        avgClicksPerLink: 50,
        latestCreated: '2025-07-23T12:00:00.000Z',
        dailyAverage: 1200,
        topDomains: [
          { domain: 'example.com', count: 250, total_clicks: 12500 },
          { domain: 'github.com', count: 180, total_clicks: 9000 }
        ],
        clicksByDay: [
          { date: '2025-07-23', links_created: 25, total_clicks: 1200 },
          { date: '2025-07-22', links_created: 32, total_clicks: 1100 }
        ],
        hourlyStats: [
          { hour: '14', links_created: 5 },
          { hour: '13', links_created: 8 }
        ],
        recentActivity: [
          { 
            short_code: 'abc123', 
            original_url: 'https://example.com', 
            clicks: 42,
            created_at: '2025-07-23T12:00:00.000Z',
            description: 'Popular link'
          }
        ]
      },
      icon: <Clock className="h-6 w-6 text-blue-600" />
    },
    {
      name: 'Get Basic Statistics',
      method: 'GET',
      endpoint: '/api/stats',
      description: 'Get basic global statistics (fallback endpoint)',
      response: {
        totalLinks: 1000,
        totalClicks: 50000,
        linksToday: 25,
        clicksToday: 1200,
        topLinks: [],
        recentActivity: []
      },
      icon: <Clock className="h-6 w-6 text-cyan-600" />
    },
    {
      name: 'Get Detailed Statistics',
      method: 'GET',
      endpoint: '/api/stats/detailed',
      description: 'Get detailed statistics with domain analytics',
      response: {
        totalLinks: 1000,
        totalClicks: 50000,
        activeLinks: 950,
        linksToday: 25,
        avgClicksPerLink: 50,
        latestCreated: '2025-07-23T12:00:00.000Z',
        dailyAverage: 1200,
        topDomains: [
          { domain: 'example.com', count: 250, total_clicks: 12500 }
        ],
        clicksByDay: [
          { date: '2025-07-23', links_created: 25, total_clicks: 1200 }
        ]
      },
      icon: <Settings className="h-6 w-6 text-purple-600" />
    },
    {
      name: 'Get Link Analytics',
      method: 'GET',
      endpoint: '/api/analytics/{shortCode}',
      description: 'Get detailed analytics for a specific shortened URL',
      response: {
        shortCode: 'abc123',
        originalUrl: 'https://example.com/very-long-url',
        totalClicks: 42,
        createdAt: '2025-07-23T12:00:00.000Z',
        clickData: [
          { date: '2025-07-23', clicks: 10 },
          { date: '2025-07-22', clicks: 15 },
          { date: '2025-07-21', clicks: 17 }
        ],
        browserStats: {
          Chrome: 24,
          Firefox: 10,
          Safari: 8
        },
        deviceStats: {
          Desktop: 30,
          Mobile: 12
        },
        referrers: [
          { domain: 'google.com', count: 15 },
          { domain: 'twitter.com', count: 8 }
        ],
        geoStats: {
          'United States': 20,
          'Germany': 12,
          'United Kingdom': 10
        }
      },
      icon: <Settings className="h-6 w-6 text-purple-600" />
    },
    {
      name: 'Sitemap',
      method: 'GET',
      endpoint: '/sitemap.xml',
      description: 'Get XML sitemap with all public links (auto-updates every 20 minutes)',
      response: `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://velink.me</loc>
    <lastmod>2025-07-23</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://velink.me/abc123</loc>
    <lastmod>2025-07-23</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`,
      icon: <Server className="h-6 w-6 text-teal-600" />
    },
    {
      name: 'Health Check',
      method: 'GET',
      endpoint: '/api/health',
      description: 'Check if the API is running correctly',
      response: {
        status: 'OK',
        timestamp: '2025-07-23T12:00:00.000Z',
        version: '2.0.0',
        database: 'connected',
        uptime: '7 days, 12 hours'
      },
      icon: <Check className="h-6 w-6 text-green-600" />
    },
    {
      name: 'Delete Link',
      method: 'DELETE',
      endpoint: '/api/links/{shortCode}',
      description: 'Delete a shortened URL',
      response: {
        message: 'Link deleted successfully',
        shortCode: 'abc123'
      },
      icon: <AlertTriangle className="h-6 w-6 text-red-600" />,
      limits: 'Rate limited to 1 request per 0.5 seconds'
    }
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8 transition-colors duration-200 group">
          <div className="bg-primary-50 p-1 rounded group-hover:bg-primary-100 transition-colors duration-200 mr-2">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span>Back to Home</span>
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API Documentation</h1>
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-8 rounded-xl shadow-xl mb-12">
          <h2 className="text-2xl font-bold mb-4">Base URL</h2>
          <div className="bg-gray-900 p-4 rounded-md font-mono text-sm md:text-base overflow-auto">
            https://velink.me/api
          </div>
          <p className="mt-4 text-primary-100">
            All API requests should be made to this base URL followed by the endpoint path.
          </p>
        </div>
        
        <div className="space-y-12">
          {apiEndpoints.map((endpoint, index) => (
            <motion.div
              key={endpoint.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card border border-gray-200 hover:border-primary-300 transition-all duration-300 overflow-hidden"
            >
              <div className="flex items-center p-4 border-b border-gray-100 bg-gray-50">
                <div className="mr-4">
                  {endpoint.icon || <Server className="h-6 w-6 text-primary-600" />}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{endpoint.name}</h3>
                  <p className="text-gray-600">{endpoint.description}</p>
                </div>
                <div className="ml-auto">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                    endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                    endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {endpoint.method}
                  </span>
                </div>
              </div>
              {endpoint.limits && (
                <div className="p-4 bg-amber-50 border-t border-amber-100">
                  <div className="flex items-center text-amber-800">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">{endpoint.limits}</span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Base URL</h2>
          <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-sm mb-4">
            https://velink.example.com/api
          </div>
          <p className="text-gray-600">
            All API requests should be made to the base URL above. HTTPS is required for all API requests.
          </p>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Endpoints</h2>
          
          {apiEndpoints.map((endpoint, index) => (
            <motion.div
              key={endpoint.method + endpoint.endpoint}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="mb-12"
            >
              <div className="flex items-center mb-4">
                <span className={`px-3 py-1 rounded-md font-mono text-white mr-3 ${
                  endpoint.method === 'GET' ? 'bg-green-600' : 'bg-blue-600'
                }`}>
                  {endpoint.method}
                </span>
                <h3 className="text-xl font-semibold">{endpoint.name}</h3>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm mb-4">
                {endpoint.endpoint}
              </div>
              
              <p className="text-gray-700 mb-6">{endpoint.description}</p>
              
              {endpoint.requestBody && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Request Body</h4>
                  <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
                    <pre>{JSON.stringify(endpoint.requestBody, null, 2)}</pre>
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Response</h4>
                <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{JSON.stringify(endpoint.response, null, 2)}</pre>
                </div>
              </div>
              
              {endpoint.limits && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">{endpoint.limits}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-primary-50 rounded-xl p-8 border border-primary-100"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need More?</h2>
          <p className="text-gray-700 mb-4">
            If you need more advanced features or higher rate limits, please contact us about our premium API offering.
          </p>
          <a
            href="mailto:api@velink.example.com"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
          >
            Contact our API team <ArrowLeft className="h-4 w-4 ml-2 transform rotate-180" />
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ApiDocumentation;
