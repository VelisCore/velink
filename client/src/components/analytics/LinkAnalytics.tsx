import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, Clock, ExternalLink, Info, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

interface LinkAnalyticsData {
  shortCode: string;
  originalUrl: string;
  totalClicks: number;
  createdAt: string;
  clickData: {
    date: string;
    clicks: number;
  }[];
}

const LinkAnalytics: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const [analytics, setAnalytics] = useState<LinkAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`/api/analytics/${shortCode}`);
        setAnalytics(response.data);
        setError('');
      } catch (err: any) {
        console.error('Failed to fetch link analytics:', err);
        setError(err.response?.data?.error || 'Failed to fetch link analytics');
        toast.error('Failed to fetch link analytics');
      } finally {
        setIsLoading(false);
      }
    };

    if (shortCode) {
      fetchAnalytics();
    }
  }, [shortCode]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="text-center py-12">
          <div className="bg-red-100 text-red-700 p-6 rounded-lg inline-flex items-center mb-6">
            <Info className="h-12 w-12 mr-4" />
            <div className="text-left">
              <h2 className="text-xl font-bold mb-2">Error Loading Analytics</h2>
              <p>{error}</p>
            </div>
          </div>
          <p className="text-gray-600">
            The link you're looking for might not exist or you may not have permission to view its analytics.
          </p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <div className="text-center py-12">
          <p className="text-gray-600">No data available for this link.</p>
        </div>
      </div>
    );
  }

  // In a real implementation, we would use a proper charting library like Chart.js or Recharts
  // This is a simplified version to demonstrate the concept
  const maxClicks = Math.max(...analytics.clickData.map(d => d.clicks));
  
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
        
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Link Analytics</h1>
        <p className="text-lg text-gray-600 mb-8">
          Performance statistics for your shortened link
        </p>
        
        <div className="card mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {shortCode}
              </h2>
              <div className="flex items-center text-gray-500 mb-4">
                <ExternalLink className="h-4 w-4 mr-2" />
                <a 
                  href={analytics.originalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 truncate max-w-sm"
                >
                  {analytics.originalUrl}
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Created On</div>
                <div className="font-medium">{formatDate(analytics.createdAt)}</div>
              </div>
              <a
                href={`https://velink.me/${shortCode}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Visit Link
              </a>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -5 }}
            className="card"
          >
            <div className="flex items-center mb-4">
              <div className="bg-blue-50 p-3 rounded-lg mr-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-gray-600 font-medium">Total Clicks</span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              {analytics.totalClicks}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -5 }}
            className="card"
          >
            <div className="flex items-center mb-4">
              <div className="bg-green-50 p-3 rounded-lg mr-4">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-gray-600 font-medium">Active Days</span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
              {analytics.clickData.length}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ y: -5 }}
            className="card"
          >
            <div className="flex items-center mb-4">
              <div className="bg-purple-50 p-3 rounded-lg mr-4">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-gray-600 font-medium">Avg. Clicks/Day</span>
            </div>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
              {analytics.clickData.length > 0 
                ? (analytics.totalClicks / analytics.clickData.length).toFixed(1) 
                : '0'}
            </div>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Click Performance Over Time</h3>
          
          <div className="h-64 w-full">
            <div className="relative h-full">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-500">
                <div>{maxClicks}</div>
                <div>{Math.floor(maxClicks / 2)}</div>
                <div>0</div>
              </div>
              
              {/* Chart area */}
              <div className="absolute left-12 right-0 top-0 bottom-0 border-l border-b border-gray-200">
                <div className="absolute left-0 right-0 top-0 bottom-0 flex items-end">
                  {analytics.clickData.map((data, index) => (
                    <div 
                      key={data.date} 
                      className="flex-1 flex flex-col items-center justify-end h-full px-1"
                    >
                      <div className="relative group">
                        <div className="tooltip opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap transition-opacity duration-200">
                          {data.date}: {data.clicks} clicks
                        </div>
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: `${(data.clicks / maxClicks) * 100}%` }}
                          transition={{ duration: 0.5, delay: 0.5 + index * 0.05 }}
                          className="w-full bg-primary-500 hover:bg-primary-600 rounded-t"
                          style={{ minWidth: '8px' }}
                        ></motion.div>
                      </div>
                      <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left whitespace-nowrap">
                        {data.date.split('-').slice(1).join('/')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 bg-gray-50 rounded-xl p-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw Click Data</h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.clickData.map((data) => (
                  <tr key={data.date}>
                    <td className="py-3 px-4 text-sm text-gray-800">{data.date}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{data.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LinkAnalytics;
