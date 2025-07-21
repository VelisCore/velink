import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Eye, Database, Lock, Users, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmMWY1ZjkiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      
      <div className="relative max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors group"
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
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-8 py-12 text-center">
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
              className="text-blue-100 text-lg"
            >
              Last updated: January 2025
            </motion.p>
          </div>

          <div className="p-8 space-y-8">
            {/* Data Controller */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Data Controller</h2>
                  <div className="space-y-2 text-gray-700">
                    <p><strong>Service:</strong> Velink URL Shortening Service</p>
                    <p><strong>Responsible:</strong> Devin Oldenburg</p>
                    <p><strong>Contact:</strong> <a href="mailto:devin.oldenburg@icloud.com" className="text-blue-600 hover:text-blue-700 font-medium">devin.oldenburg@icloud.com</a></p>
                    <p><strong>Phone:</strong> +49 15733791807</p>
                  </div>
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
                  <span>1. Data Collection</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <p>We collect only the minimum data necessary to provide our URL shortening service:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Original URLs for shortening and redirection</li>
                    <li>IP addresses for security and fraud prevention</li>
                    <li>Click analytics for shortened links</li>
                    <li>Browser and device information (anonymized)</li>
                    <li>Timestamp data for service analytics</li>
                  </ul>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-green-50 rounded-xl p-6 border border-green-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <span>2. Automatic Data Deletion</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <p>Velink implements strict data retention policies:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>12-Month Auto-Deletion:</strong> All personal data automatically deleted after 12 months</li>
                    <li><strong>IP Anonymization:</strong> IP addresses anonymized after 30 days</li>
                    <li><strong>No Indefinite Storage:</strong> No personal data is stored permanently</li>
                    <li><strong>Encrypted Data:</strong> All data encrypted in transit and at rest</li>
                  </ul>
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      ✅ This policy ensures GDPR compliance and your privacy rights
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="bg-purple-50 rounded-xl p-6 border border-purple-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  <span>3. Data Usage</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <p>Your data is used exclusively for:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Providing URL shortening and redirection services</li>
                    <li>Fraud detection and abuse prevention</li>
                    <li>Service analytics and performance monitoring (anonymized)</li>
                    <li>Legal compliance when required by law</li>
                    <li>Service optimization using aggregated data only</li>
                  </ul>
                  <p className="mt-3 font-medium text-purple-800">
                    We never sell, share, or monetize your personal data.
                  </p>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-orange-50 rounded-xl p-6 border border-orange-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  <span>4. Your Rights & Data Control</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <p>Under GDPR and German data protection law, you have the right to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Access:</strong> Request a copy of your stored data</li>
                    <li><strong>Rectification:</strong> Correct inaccurate personal data</li>
                    <li><strong>Erasure:</strong> Request immediate deletion of your data</li>
                    <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
                    <li><strong>Objection:</strong> Object to processing of your personal data</li>
                  </ul>
                  <div className="mt-4 p-4 bg-white rounded-lg border border-orange-200">
                    <p className="text-sm">
                      <strong>Exercise Your Rights:</strong> Contact us at{' '}
                      <a href="mailto:devin.oldenburg@icloud.com" className="text-blue-600 hover:text-blue-700 font-medium">
                        devin.oldenburg@icloud.com
                      </a>{' '}
                      for any data requests.
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
                  <Lock className="w-5 h-5 text-red-600" />
                  <span>5. Security & Cookie Policy</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <p>We implement industry-standard security measures:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>End-to-end encryption for all data transmission</li>
                    <li>Secure database storage with regular backups</li>
                    <li>Rate limiting to prevent abuse and attacks</li>
                    <li>Regular security audits and updates</li>
                  </ul>
                  <div className="mt-4">
                    <p className="font-medium mb-2">Cookie Usage:</p>
                    <ul className="list-disc pl-6 space-y-1 text-sm">
                      <li><strong>Essential Cookies:</strong> Required for service functionality</li>
                      <li><strong>Analytics Cookies:</strong> Optional, for service improvement</li>
                      <li><strong>User Control:</strong> You can accept or decline non-essential cookies</li>
                    </ul>
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
                  <span>6. Contact & Legal Information</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <p>For privacy-related questions or data requests:</p>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p><strong>Data Protection Officer:</strong> Devin Oldenburg</p>
                    <p><strong>Email:</strong> <a href="mailto:devin.oldenburg@icloud.com" className="text-blue-600 hover:text-blue-700 font-medium">devin.oldenburg@icloud.com</a></p>
                    <p><strong>Phone:</strong> +49 15733791807</p>
                    <p className="text-sm text-gray-600 mt-2">
                      Address available upon request for legal matters
                    </p>
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Supervisory Authority:</strong> You have the right to lodge a complaint with the German data protection authority (BfDI) if you believe your data rights have been violated.
                    </p>
                  </div>
                </div>
              </motion.section>
            </div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-center pt-8 border-t border-gray-200"
            >
              <p className="text-gray-600 text-sm">
                This privacy policy is governed by German and EU law. Changes will be announced via the service.{' '}
                <Link to="/legal/terms" className="text-blue-600 hover:text-blue-700 font-medium">Terms of Service</Link>
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
