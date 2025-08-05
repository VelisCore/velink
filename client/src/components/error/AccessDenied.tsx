import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, Shield } from 'lucide-react';

interface AccessDeniedProps {
  message?: string;
  onRetry?: () => void;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
  message = "Access Denied", 
  onRetry 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
        <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
      </div>

      <div className="relative max-w-md w-full text-center">
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-8">
            {/* 403 Number */}
            <div className="mb-8">
              <h1 className="text-9xl font-bold text-purple-600 mb-2">403</h1>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-primary-500 mx-auto rounded-full"></div>
            </div>

            {/* Content */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Access denied</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You don't have permission to access this resource.
              </p>
              {message && message !== "Access Denied" && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <p className="text-purple-800 text-sm">
                    {message}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                to="/admin"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Shield className="w-5 h-5 mr-2" />
                Login
              </Link>
              
              <Link
                to="/"
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Home className="w-5 h-5 mr-2" />
                Go home
              </Link>
              
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Go back
              </button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Need help? <a href="mailto:devin.oldenburg@icloud.com" className="text-primary-600 hover:text-primary-700 font-medium">Contact support</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
