import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Code, BookOpen, Server, Key, Globe, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const ApiDocumentation: React.FC = () => {
  const apiEndpoints = [
    {
      name: 'Shorten URL',
      method: 'POST',
      endpoint: '/api/shorten',
      description: 'Create a new shortened URL',
      requestBody: {
        url: 'https://example.com/very-long-url'
      },
      response: {
        shortUrl: 'http://velink.example.com/abc123',
        shortCode: 'abc123',
        originalUrl: 'https://example.com/very-long-url',
        clicks: 0,
        createdAt: '2025-07-21T12:00:00.000Z'
      },
      limits: 'Rate limited to 1 request per minute per IP address'
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
        createdAt: '2025-07-21T12:00:00.000Z'
      }
    },
    {
      name: 'Get Statistics',
      method: 'GET',
      endpoint: '/api/stats',
      description: 'Get global statistics about the service',
      response: {
        totalLinks: 1000,
        totalClicks: 50000,
        latestCreated: '2025-07-21T12:00:00.000Z'
      }
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
        createdAt: '2025-07-21T12:00:00.000Z',
        clickData: [
          {
            date: '2025-07-21',
            clicks: 10
          },
          {
            date: '2025-07-20',
            clicks: 15
          },
          {
            date: '2025-07-19',
            clicks: 17
          }
        ]
      }
    }
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API Documentation</h1>
        <p className="text-lg text-gray-600 mb-12">
          Integrate Velink's URL shortening capabilities into your applications
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div 
            whileHover={{ y: -5 }}
            className="card"
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-50 p-3 rounded-lg mr-4">
                <Server className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold">RESTful API</h3>
            </div>
            <p className="text-gray-600">
              Simple and intuitive HTTP endpoints for seamless integration
            </p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="card"
          >
            <div className="flex items-center mb-4">
              <div className="bg-green-50 p-3 rounded-lg mr-4">
                <Key className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">No API Key Required</h3>
            </div>
            <p className="text-gray-600">
              Start using our API immediately without registration
            </p>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="card"
          >
            <div className="flex items-center mb-4">
              <div className="bg-purple-50 p-3 rounded-lg mr-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold">Rate Limiting</h3>
            </div>
            <p className="text-gray-600">
              Reasonable rate limits to ensure fair usage for everyone
            </p>
          </motion.div>
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
