import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Database, Cookie, Clock, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmMGZkZjQiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      
      <div className="relative max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-green-600 hover:text-green-700 font-medium transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 px-8 py-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6"
            >
              <Shield className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Privacy Policy
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-green-100 text-lg"
            >
              Effective Date: January 21, 2025
            </motion.p>
          </div>

          <div className="p-8 space-y-8">
            {/* Introduction */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100"
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-green-500 rounded-lg">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Your Privacy Matters</h2>
                  <p className="text-gray-700 leading-relaxed">
                    This Privacy Policy explains how Velink, operated by Devin Oldenburg, collects, uses, and protects your data. 
                    We are committed to transparency and your privacy rights under GDPR and other applicable data protection laws.
                  </p>
                  <p className="text-gray-600 text-sm mt-2 italic">
                    <strong>Note:</strong> Velink provides comprehensive mobile API routes for developers to create third-party mobile applications. We don't operate our own mobile app, but welcome developers to build innovative mobile solutions using our platform.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Privacy Sections */}
            <div className="grid gap-6">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-blue-50 rounded-xl p-6 border border-blue-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Database className="w-5 h-5 text-blue-600" />
                  <span>1. Data We Collect</span>
                </h2>
                <div className="text-gray-700 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <h4 className="font-medium text-gray-900 mb-2">🔗 Link Data</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Original URL you want to shorten</li>
                        <li>• Generated short URL code</li>
                        <li>• Creation timestamp</li>
                        <li>• Optional custom alias (if provided)</li>
                        <li>• Password protection settings (if enabled)</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <h4 className="font-medium text-gray-900 mb-2">📊 Analytics Data</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Click timestamps and counts</li>
                        <li>• Anonymized IP addresses (after 30 days)</li>
                        <li>• Referrer information (where you came from)</li>
                        <li>• Basic device/browser information</li>
                        <li>• Geographic location (country/region only)</li>
                        <li>• Third-party mobile app data (via our public API routes)</li>
                      </ul>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-blue-100 md:col-span-2">
                    <h4 className="font-medium text-gray-900 mb-2">📱 Third-Party Mobile API Usage</h4>
                    <p className="text-sm text-gray-600 mb-2 italic">
                      <strong>Important:</strong> Velink doesn't have its own mobile app. We provide mobile API routes that third-party developers can use to create mobile applications.
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• API requests from third-party mobile applications</li>
                      <li>• Sync data for third-party app functionality (links, analytics)</li>
                      <li>• QR code generation and scanning data via API</li>
                      <li>• Widget data requests for third-party mobile widgets</li>
                      <li>• Push notification data (managed by third-party apps)</li>
                      <li>• Offline action processing for third-party mobile sync</li>
                    </ul>
                    <p className="text-xs text-gray-500 mt-2">
                      Developers are free to create mobile apps using our comprehensive API. We only collect data when third-party apps interact with our API endpoints.
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm font-medium text-blue-800">
                      ✅ We do NOT collect: Personal names, email addresses, passwords, or detailed personal information
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-purple-50 rounded-xl p-6 border border-purple-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <span>2. How We Use Your Data</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <p>We use the collected data solely for legitimate service purposes:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Core Service</h4>
                      <ul className="text-sm space-y-1">
                        <li>• URL shortening and redirection</li>
                        <li>• Click tracking and analytics</li>
                        <li>• Service performance monitoring</li>
                        <li>• Fraud and abuse prevention</li>
                        <li>• Third-party mobile API functionality</li>
                        <li>• QR code generation for mobile sharing</li>
                        <li>• Data sync for third-party mobile apps</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Third-Party API Services</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Mobile app data synchronization</li>
                        <li>• Widget data for mobile developers</li>
                        <li>• Push notification routing (via third-party apps)</li>
                        <li>• Offline action processing</li>
                        <li>• QR code scanning analytics</li>
                      </ul>
                    </div>
                  </div>
                  <div className="grid md:grid-cols-1 gap-4 mt-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Legal Basis (GDPR)</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Legitimate interest for service operation</li>
                        <li>• Consent for analytics cookies</li>
                        <li>• Legal obligation for data retention</li>
                        <li>• Protection of vital interests</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-purple-100 rounded-lg space-y-2">
                    <p className="text-sm text-purple-800">
                      <strong>Mobile App Clarification:</strong> Velink provides API routes for third-party mobile app development but doesn't operate its own mobile app. Developers can freely create mobile applications using our comprehensive API endpoints.
                    </p>
                    <p className="text-sm text-purple-800">
                      <strong>No Third-Party Sharing:</strong> We never sell, rent, or share your data with third parties for marketing purposes.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="bg-green-50 rounded-xl p-6 border border-green-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Cookie className="w-5 h-5 text-green-600" />
                  <span>3. Cookies & Tracking</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <p>We use minimal cookies to provide our service:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <h4 className="font-medium text-gray-900 mb-2">🍪 Essential Cookies</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Session management</li>
                        <li>• Rate limiting protection</li>
                        <li>• Basic functionality</li>
                        <li><em>These cannot be disabled</em></li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-100">
                      <h4 className="font-medium text-gray-900 mb-2">📈 Analytics Cookies</h4>
                      <ul className="text-sm space-y-1">
                        <li>• Click tracking</li>
                        <li>• Usage statistics</li>
                        <li>• Performance monitoring</li>
                        <li><em>You can opt-out</em></li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <p className="text-sm text-green-800">
                        <strong>Cookie Control:</strong> Most browsers allow you to control cookies. Disabling essential cookies may affect service functionality.
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>No Third-Party Tracking:</strong> We don't use Google Analytics, Facebook Pixel, or other external tracking services.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-orange-50 rounded-xl p-6 border border-orange-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span>4. Data Retention & Deletion</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <p>We practice data minimization and automatic deletion:</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-orange-100">
                      <h4 className="font-medium text-gray-900 mb-2">📅 12 Months</h4>
                      <p className="text-sm">Complete automatic deletion of all data, including:</p>
                      <ul className="text-xs mt-2 space-y-1">
                        <li>• All shortened URLs</li>
                        <li>• Click analytics</li>
                        <li>• IP addresses</li>
                        <li>• All associated data</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-100">
                      <h4 className="font-medium text-gray-900 mb-2">🔒 30 Days</h4>
                      <p className="text-sm">IP address anonymization:</p>
                      <ul className="text-xs mt-2 space-y-1">
                        <li>• IP addresses anonymized</li>
                        <li>• Personal identifiers removed</li>
                        <li>• Only statistical data remains</li>
                        <li>• GDPR compliance</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-100">
                      <h4 className="font-medium text-gray-900 mb-2">⚡ Immediate</h4>
                      <p className="text-sm">Upon your request:</p>
                      <ul className="text-xs mt-2 space-y-1">
                        <li>• Manual data deletion</li>
                        <li>• Link deactivation</li>
                        <li>• Analytics removal</li>
                        <li>• No questions asked</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-orange-100 rounded-lg">
                    <p className="text-sm text-orange-800">
                      <strong>No Backups:</strong> Deleted data is permanently removed without backup retention.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="bg-red-50 rounded-xl p-6 border border-red-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-red-600" />
                  <span>5. Your Privacy Rights (GDPR)</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <p>As a data subject, you have the following rights:</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 border border-red-100">
                        <h4 className="font-medium text-red-800 text-sm">👁️ Right to Information</h4>
                        <p className="text-xs text-gray-600 mt-1">Know what data we have about you</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-red-100">
                        <h4 className="font-medium text-red-800 text-sm">🔍 Right of Access</h4>
                        <p className="text-xs text-gray-600 mt-1">Request a copy of your data</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-red-100">
                        <h4 className="font-medium text-red-800 text-sm">✏️ Right to Rectification</h4>
                        <p className="text-xs text-gray-600 mt-1">Correct inaccurate information</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-3 border border-red-100">
                        <h4 className="font-medium text-red-800 text-sm">🗑️ Right to Erasure</h4>
                        <p className="text-xs text-gray-600 mt-1">Request immediate data deletion</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-red-100">
                        <h4 className="font-medium text-red-800 text-sm">🚫 Right to Object</h4>
                        <p className="text-xs text-gray-600 mt-1">Object to data processing</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 border border-red-100">
                        <h4 className="font-medium text-red-800 text-sm">📋 Right to Portability</h4>
                        <p className="text-xs text-gray-600 mt-1">Export your data in standard format</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-red-100 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Exercise Your Rights:</strong> Contact us anytime to exercise these rights. We respond within 30 days.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <span>6. Contact & Data Protection</span>
                </h2>
                <div className="text-gray-700 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">📞 Data Controller</h4>
                      <p className="text-sm"><strong>Devin Oldenburg</strong></p>
                      <p className="text-sm flex items-center space-x-2 mt-2">
                        <Mail className="w-4 h-4 text-gray-600" />
                        <a href="mailto:devin.oldenburg@icloud.com" className="text-blue-600 hover:text-blue-700">devin.oldenburg@icloud.com</a>
                      </p>
                      <p className="text-sm flex items-center space-x-2 mt-1">
                        <Phone className="w-4 h-4 text-gray-600" />
                        <span>+49 15733791807</span>
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="font-medium text-gray-900 mb-2">🛡️ Supervisory Authority</h4>
                      <p className="text-sm">If you have privacy concerns:</p>
                      <p className="text-sm mt-2"><strong>Your local data protection authority</strong></p>
                      <p className="text-xs text-gray-600 mt-1">You have the right to lodge a complaint with your local data protection supervisory authority.</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <p className="text-sm">
                      <strong>Related Legal Documents:</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link to="/legal/terms" className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors">
                        Terms of Service
                      </Link>
                      <Link to="/legal/impressum" className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm hover:bg-green-200 transition-colors">
                        Legal Notice
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="bg-indigo-50 rounded-xl p-6 border border-indigo-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  <span>7. Security Measures</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <p>We implement appropriate technical and organizational measures:</p>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-indigo-100">
                      <h4 className="font-medium text-indigo-800 text-sm mb-2">🔐 Technical</h4>
                      <ul className="text-xs space-y-1">
                        <li>• HTTPS encryption</li>
                        <li>• Secure database storage</li>
                        <li>• Regular security updates</li>
                        <li>• Access controls</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-indigo-100">
                      <h4 className="font-medium text-indigo-800 text-sm mb-2">🏢 Organizational</h4>
                      <ul className="text-xs space-y-1">
                        <li>• Data minimization</li>
                        <li>• Regular data deletion</li>
                        <li>• Privacy by design</li>
                        <li>• Staff training</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-indigo-100">
                      <h4 className="font-medium text-indigo-800 text-sm mb-2">⚡ Response</h4>
                      <ul className="text-xs space-y-1">
                        <li>• Incident response plan</li>
                        <li>• Breach notification</li>
                        <li>• Regular security audits</li>
                        <li>• Continuous monitoring</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="text-center pt-8 border-t border-gray-200"
            >
              <p className="text-gray-600 text-sm">
                This Privacy Policy is governed by German and European data protection law. Last updated: January 21, 2025
              </p>
              <p className="text-gray-500 text-xs mt-2">
                We are committed to protecting your privacy and will update this policy as needed to reflect changes in our practices or applicable law.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
