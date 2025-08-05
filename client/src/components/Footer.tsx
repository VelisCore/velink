import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Heart, Coffee } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <img src="/logo512.png" alt="Velink Logo" className="h-8 w-8" />
              <h3 className="text-2xl font-bold text-primary-400">
                Velink
              </h3>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              The beautiful, fast, and secure URL shortening platform. 
              Transform your long links into powerful short URLs with detailed analytics.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://github.com/velyzo/velink"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com/velyzo_official"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://ko-fi.com/wfxey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Ko-fi"
              >
                <Coffee className="h-5 w-5" />
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
                <Link to="/api-docs" className="text-gray-300 hover:text-white transition-colors duration-200">
                  API Documentation
                </Link>
              </li>
              <li>
                <a href="#stats" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Statistics
                </a>
              </li>
              <li>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Features
                </a>
              </li>
              <li>
                <a href="mailto:mail@velyzo.de" className="text-gray-300 hover:text-white transition-colors duration-200">
                  Support
                </a>
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
              <span>by <a href="https://velyzo.de" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">Velyzo</a></span>
            </div>
            
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-gray-400">
              <span>&copy; {currentYear} Velyzo. All rights reserved.</span>
              <div className="flex space-x-4">
                <Link to="/privacy" className="hover:text-white transition-colors duration-200">
                  Privacy Policy
                </Link>
                <Link to="/terms" className="hover:text-white transition-colors duration-200">
                  Terms of Service
                </Link>
                <Link to="/impressum" className="hover:text-white transition-colors duration-200">
                  Impressum
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
