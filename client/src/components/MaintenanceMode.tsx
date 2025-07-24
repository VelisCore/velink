import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Clock, RefreshCw, Shield } from 'lucide-react';

interface MaintenanceModeProps {
  message?: string;
  estimatedCompletion?: string;
  onRetry?: () => void;
}

const MaintenanceMode: React.FC<MaintenanceModeProps> = ({ 
  message, 
  estimatedCompletion,
  onRetry 
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // Add delay to prevent spam
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (onRetry) {
      onRetry();
    }
    
    setIsRetrying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl border border-orange-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
            <div className="flex items-center space-x-3 text-white">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Wrench className="h-6 w-6" />
              </motion.div>
              <h1 className="text-xl font-bold">System Maintenance</h1>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Icon */}
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Shield className="h-10 w-10 text-orange-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">We'll Be Right Back!</h2>
            </div>

            {/* Message */}
            <div className="text-center space-y-3">
              <p className="text-gray-600 leading-relaxed">
                {message || 'Velink is currently undergoing scheduled maintenance to improve your experience. We apologize for any inconvenience.'}
              </p>
              
              {estimatedCompletion && (
                <div className="flex items-center justify-center space-x-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                  <Clock className="h-4 w-4" />
                  <span>Estimated completion: {estimatedCompletion}</span>
                </div>
              )}
            </div>

            {/* Features during maintenance */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700 text-center">What we're improving:</h3>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'Enhanced security measures',
                  'Improved performance',
                  'New features and capabilities',
                  'System stability updates'
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center space-x-2 text-sm text-gray-600"
                  >
                    <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                    <span>{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Retry Button */}
            <div className="text-center pt-2">
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-medium rounded-lg transition-colors duration-200 transform hover:scale-105 disabled:transform-none"
              >
                <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
                <span>{isRetrying ? 'Checking...' : 'Check Again'}</span>
              </button>
              
              {retryCount > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Retry attempt: {retryCount}
                </p>
              )}
            </div>

            {/* Contact Info */}
            <div className="border-t border-gray-200 pt-4 text-center">
              <p className="text-xs text-gray-500">
                For urgent matters, contact us at{' '}
                <a 
                  href="mailto:support@velink.app" 
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  support@velink.app
                </a>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-6 text-center"
        >
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 1, 0.3]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-2 h-2 bg-orange-400 rounded-full"
              />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Monitoring system status...</p>
        </motion.div>
      </div>
    </div>
  );
};

export default MaintenanceMode;
