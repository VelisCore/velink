import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Shield, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const cookieConsent = localStorage.getItem('velink-cookie-consent');
    if (!cookieConsent) {
      // Show cookie notice after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptAllCookies = () => {
    localStorage.setItem('velink-cookie-consent', 'all');
    localStorage.setItem('velink-analytics-enabled', 'true');
    setIsVisible(false);
  };

  const acceptEssentialOnly = () => {
    localStorage.setItem('velink-cookie-consent', 'essential');
    localStorage.setItem('velink-analytics-enabled', 'false');
    setIsVisible(false);
  };

  const closeBanner = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md"
      >
        <div className="bg-white/95 backdrop-blur-sm border border-blue-200 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Cookie className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-white font-bold">Cookie Settings</h3>
            </div>
            <button
              onClick={closeBanner}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 text-sm mb-4 leading-relaxed">
              We use cookies to improve your experience and analyze usage. Essential cookies are required for the service to function.
            </p>

            {/* Cookie Details Toggle */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm mb-4 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span>{showDetails ? 'Hide Details' : 'Show Cookie Details'}</span>
            </button>

            {/* Cookie Details */}
            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 overflow-hidden"
                >
                  <div className="bg-blue-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm text-gray-900">Essential Cookies</div>
                        <div className="text-xs text-gray-600">Required for basic functionality, security, and rate limiting</div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Cookie className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-sm text-gray-900">Analytics Cookies</div>
                        <div className="text-xs text-gray-600">Help us understand usage patterns (anonymized)</div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Privacy Policy Link */}
            <div className="mb-4">
              <Link
                to="/legal/privacy"
                className="text-xs text-blue-600 hover:text-blue-700 underline"
              >
                Read our Privacy Policy for full details
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={acceptEssentialOnly}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Essential Only
              </button>
              <button
                onClick={acceptAllCookies}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Accept All
              </button>
            </div>

            {/* Data Retention Notice */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                <strong>Data Retention:</strong> All personal data is automatically deleted after 12 months. IP addresses are anonymized after 30 days.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieNotice;
