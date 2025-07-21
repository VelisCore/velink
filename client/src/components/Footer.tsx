import React from 'react';
import { Link2, Github, Twitter, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-2 rounded-lg">
                <Link2 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                VeLink
              </h3>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              The beautiful, fast, and secure URL shortening platform. 
              Transform your long links into powerful short URLs with detailed analytics.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              <li>
                <a href="#shortener" className="text-gray-300 hover:text-white transition-colors duration-200">
                  URL Shortener
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Click Analytics
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Rate Limiting
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200">
                  SEO Optimization
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#stats" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Statistics
                </a>
              </li>
              <li>
                <button 
                  onClick={() => window.alert('API documentation coming soon!')}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  API
                </button>
              </li>
              <li>
                <button 
                  onClick={() => window.alert('Support available via GitHub Issues')}
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 text-gray-300 mb-4 md:mb-0">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>by VeLink Team</span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
              <span>&copy; {currentYear} VeLink. All rights reserved.</span>
              <div className="flex space-x-4">
                <button 
                  onClick={() => window.alert('Privacy Policy coming soon!')}
                  className="hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => window.alert('Terms of Service coming soon!')}
                  className="hover:text-white transition-colors duration-200"
                >
                  Terms of Service
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700"></div>
    </footer>
  );
};

export default Footer;
