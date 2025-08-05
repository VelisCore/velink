import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, RefreshCw, Clock } from 'lucide-react';

interface RateLimitedProps {
  retryAfter?: number;
  onRetry?: () => void;
}

const RateLimited: React.FC<RateLimitedProps> = ({ retryAfter, onRetry }) => {
  const [timeLeft, setTimeLeft] = React.useState(retryAfter || 60);

  React.useEffect(() => {
    if (retryAfter) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [retryAfter]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`;
  };

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
            {/* 429 Number */}
            <div className="mb-8">
              <h1 className="text-9xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-2">429</h1>
              <div className="w-24 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto rounded-full"></div>
            </div>

            {/* Content */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Too many requests</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                You've made too many requests. Please wait a moment.
              </p>
              
              {timeLeft > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-2 text-primary-800 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="font-medium">Time until reset</span>
                  </div>
                  <div className="text-2xl font-bold text-primary-600">
                    {formatTime(timeLeft)}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {(timeLeft === 0 || !retryAfter) && onRetry && (
                <button
                  onClick={onRetry}
                  className="inline-flex items-center justify-center w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try again
                </button>
              )}
              
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
                Rate limits help us keep the service fast for everyone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateLimited;
