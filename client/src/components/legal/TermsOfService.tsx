import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, Shield, User, Clock, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsOfService: React.FC = () => {
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
              <FileText className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Terms of Service
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-blue-100 text-lg"
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
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Welcome to VeLink</h2>
                  <p className="text-gray-700 leading-relaxed">
                    These Terms of Service ("Terms") govern your use of the VeLink URL shortening service operated by Devin Oldenburg. 
                    By using our service, you agree to these terms. Please read them carefully.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Terms Sections */}
            <div className="grid gap-6">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-green-50 rounded-xl p-6 border border-green-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span>1. Service Description</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <p>VeLink provides URL shortening services that allow you to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Convert long URLs into shorter, more manageable links</li>
                    <li>Track click statistics for your shortened links</li>
                    <li>Access analytics and reporting features</li>
                    <li>Use our service free of charge for personal and commercial use</li>
                  </ul>
                  <div className="mt-4 p-3 bg-green-100 rounded-lg">
                    <p className="text-sm font-medium text-green-800">
                      📈 Our service is provided "as is" without warranty. We strive for 99% uptime but cannot guarantee uninterrupted service.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-blue-50 rounded-xl p-6 border border-blue-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span>2. Acceptable Use</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <p>You agree to use VeLink responsibly and legally. You may NOT use our service to:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Illegal Content:</strong> Link to illegal, harmful, or offensive material</li>
                    <li><strong>Spam or Phishing:</strong> Distribute unsolicited content or fraudulent links</li>
                    <li><strong>Malware:</strong> Link to viruses, malware, or malicious software</li>
                    <li><strong>Copyright Infringement:</strong> Link to copyrighted material without permission</li>
                    <li><strong>Harassment:</strong> Target individuals with harmful or abusive content</li>
                  </ul>
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Rate Limiting:</strong> We limit link creation to 1 link per minute per IP address to prevent abuse.
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
                  <Clock className="w-5 h-5 text-purple-600" />
                  <span>3. Data Retention & Privacy</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <p>We respect your privacy and handle data responsibly:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Data Collection:</strong> We collect minimal data necessary for service operation</li>
                    <li><strong>Automatic Deletion:</strong> All data is automatically deleted after 12 months</li>
                    <li><strong>IP Anonymization:</strong> IP addresses are anonymized after 30 days</li>
                    <li><strong>No Personal Accounts:</strong> No registration required, no personal data stored</li>
                    <li><strong>Analytics:</strong> We track clicks for statistical purposes only</li>
                  </ul>
                  <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                    <p className="text-sm text-purple-800">
                      <strong>GDPR Compliance:</strong> Our data handling practices comply with European data protection laws.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-yellow-50 rounded-xl p-6 border border-yellow-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-yellow-600" />
                  <span>4. Liability & Disclaimers</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <p>Important limitations on our liability:</p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Service Availability:</strong> We do not guarantee continuous service availability</li>
                    <li><strong>Content Responsibility:</strong> Users are responsible for the content they link to</li>
                    <li><strong>Data Accuracy:</strong> Analytics data provided "as is" without warranty</li>
                    <li><strong>Third-Party Content:</strong> We are not responsible for external website content</li>
                    <li><strong>Damages:</strong> Our liability is limited to the maximum extent permitted by law</li>
                  </ul>
                  <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Limitation of Liability:</strong> Liability limited to intent and gross negligence under German law.
                    </p>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="bg-gray-50 rounded-xl p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <span>5. Contact & Support</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <p>For questions, concerns, or support regarding these Terms of Service:</p>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <p><strong>Service Provider:</strong> Devin Oldenburg</p>
                    <p className="flex items-center space-x-2 mt-2">
                      <Mail className="w-4 h-4 text-gray-600" />
                      <span><strong>Email:</strong> <a href="mailto:devin.oldenburg@icloud.com" className="text-blue-600 hover:text-blue-700 font-medium">devin.oldenburg@icloud.com</a></span>
                    </p>
                    <p className="flex items-center space-x-2 mt-1">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <span><strong>Phone:</strong> +49 15733791807</span>
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm">
                      <strong>Related Legal Documents:</strong>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link to="/legal/privacy" className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors">
                        Privacy Policy
                      </Link>
                      <Link to="/legal/impressum" className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 transition-colors">
                        Legal Notice
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 }}
                className="bg-red-50 rounded-xl p-6 border border-red-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-red-600" />
                  <span>6. Changes & Termination</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Changes to Terms</h4>
                      <ul className="text-sm space-y-1">
                        <li>• We may update these terms at any time</li>
                        <li>• Changes will be posted on this page</li>
                        <li>• Continued use implies acceptance</li>
                        <li>• Major changes will be highlighted</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Service Termination</h4>
                      <ul className="text-sm space-y-1">
                        <li>• We may terminate service at any time</li>
                        <li>• Users may stop using service anytime</li>
                        <li>• Data deletion follows retention policy</li>
                        <li>• No refunds (service is free)</li>
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
              transition={{ delay: 1.5 }}
              className="text-center pt-8 border-t border-gray-200"
            >
              <p className="text-gray-600 text-sm">
                These Terms of Service are governed by German law. Last updated: January 21, 2025
              </p>
              <p className="text-gray-500 text-xs mt-2">
                By using VeLink, you acknowledge that you have read, understood, and agree to these Terms of Service.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
