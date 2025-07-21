import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Building, User, Mail, Phone, Scale, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const Impressum: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-100">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmYWY1ZmYiIGZpbGwtb3BhY2l0eT0iMC40Ij48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
      
      <div className="relative max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium transition-colors group"
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
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 px-8 py-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6"
            >
              <Scale className="w-10 h-10 text-white" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-4xl font-bold text-white mb-4"
            >
              Legal Notice (Impressum)
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-purple-100 text-lg"
            >
              Information according to § 5 TMG (German Telemedia Act)
            </motion.p>
          </div>

          <div className="p-8 space-y-8">
            {/* Introduction */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100"
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Legal Information</h2>
                  <p className="text-gray-700 leading-relaxed">
                    This website is operated by Devin Oldenburg as a private individual. The following information is provided 
                    in accordance with German law (TMG - Telemediengesetz) and European Union regulations.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Legal Sections */}
            <div className="grid gap-6">
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="bg-blue-50 rounded-xl p-6 border border-blue-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
                  <User className="w-5 h-5 text-blue-600" />
                  <span>Service Provider Information</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg p-6 border border-blue-100">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span>Personal Details</span>
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <div className="flex items-center space-x-3">
                        <User className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium">Devin Oldenburg</p>
                          <p className="text-sm text-gray-600">Private Individual</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-6 border border-blue-100">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span>Contact Information</span>
                    </h3>
                    <div className="space-y-3 text-gray-700">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <a href="mailto:devin.oldenburg@icloud.com" className="text-blue-600 hover:text-blue-700 font-medium">
                            devin.oldenburg@icloud.com
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <a href="tel:+4915733791807" className="text-blue-600 hover:text-blue-700 font-medium">
                            +49 15733791807
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> This service is operated by a private individual for personal and educational purposes. 
                    All contact information is provided for legal compliance only.
                  </p>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="bg-green-50 rounded-xl p-6 border border-green-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-green-600" />
                  <span>Legal Framework & Responsibility</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <h4 className="font-medium text-gray-900 mb-2">🇩🇪 Applicable Law</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• German Telemedia Act (TMG)</li>
                      <li>• German Civil Code (BGB)</li>
                      <li>• EU General Data Protection Regulation (GDPR)</li>
                      <li>• German Federal Data Protection Act (BDSG)</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-green-100">
                    <h4 className="font-medium text-gray-900 mb-2">⚖️ Jurisdiction</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• German courts have jurisdiction</li>
                      <li>• Place of jurisdiction: Germany</li>
                      <li>• Applicable law: German law</li>
                      <li>• EU consumer protection applies</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-100 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Editorial Responsibility:</strong> The content of this website is created and maintained by Devin Oldenburg, 
                    who is responsible for all editorial content according to § 18 Abs. 2 MStV.
                  </p>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="bg-orange-50 rounded-xl p-6 border border-orange-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-orange-600" />
                  <span>External Links & Content Disclaimer</span>
                </h2>
                <div className="text-gray-700 space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-orange-100">
                    <h4 className="font-medium text-gray-900 mb-2">🔗 External Links Policy</h4>
                    <p className="text-sm mb-2">
                      Our service allows users to shorten URLs linking to external websites. We want to clarify our position:
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• We do not control or endorse external website content</li>
                      <li>• Users are responsible for the content they link to</li>
                      <li>• We check for illegal content when made aware</li>
                      <li>• Illegal or harmful links will be removed immediately</li>
                    </ul>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-orange-100">
                      <h4 className="font-medium text-orange-800 text-sm mb-2">⚠️ Content Disclaimer</h4>
                      <ul className="text-xs space-y-1">
                        <li>• No liability for external content</li>
                        <li>• Content accuracy not guaranteed</li>
                        <li>• External sites may have different terms</li>
                        <li>• Report inappropriate content to us</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-orange-100">
                      <h4 className="font-medium text-orange-800 text-sm mb-2">🛡️ Our Commitment</h4>
                      <ul className="text-xs space-y-1">
                        <li>• Quick response to abuse reports</li>
                        <li>• Cooperation with law enforcement</li>
                        <li>• Regular monitoring for illegal content</li>
                        <li>• Transparent handling of violations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="bg-purple-50 rounded-xl p-6 border border-purple-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Building className="w-5 h-5 text-purple-600" />
                  <span>Technical & Hosting Information</span>
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <h4 className="font-medium text-gray-900 mb-2">🖥️ Website Technology</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• React.js frontend application</li>
                      <li>• Node.js backend server</li>
                      <li>• SQLite database</li>
                      <li>• HTTPS encryption throughout</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-purple-100">
                    <h4 className="font-medium text-gray-900 mb-2">🌐 Service Information</h4>
                    <ul className="text-sm space-y-1 text-gray-700">
                      <li>• Domain: velink.site</li>
                      <li>• Service type: URL shortening</li>
                      <li>• Availability: 24/7 (best effort)</li>
                      <li>• Geographic scope: Worldwide</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-purple-100 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Hosting Notice:</strong> This service may be hosted on third-party infrastructure. 
                    We ensure all hosting partners comply with European data protection standards.
                  </p>
                </div>
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
                className="bg-red-50 rounded-xl p-6 border border-red-200"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Scale className="w-5 h-5 text-red-600" />
                  <span>Copyright & Intellectual Property</span>
                </h2>
                <div className="text-gray-700 space-y-3">
                  <div className="bg-white rounded-lg p-4 border border-red-100">
                    <h4 className="font-medium text-gray-900 mb-2">© VeLink Service</h4>
                    <p className="text-sm mb-2">
                      All content on this website, including but not limited to:
                    </p>
                    <ul className="text-sm space-y-1">
                      <li>• Website design and layout</li>
                      <li>• Source code and software</li>
                      <li>• Text content and documentation</li>
                      <li>• Logos and branding materials</li>
                    </ul>
                    <p className="text-sm mt-3 text-red-700">
                      Is protected by copyright law and owned by Devin Oldenburg unless otherwise stated.
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-red-100">
                      <h4 className="font-medium text-red-800 text-sm mb-2">✅ Permitted Use</h4>
                      <ul className="text-xs space-y-1">
                        <li>• Personal, non-commercial use of the service</li>
                        <li>• Creating shortened links for legitimate purposes</li>
                        <li>• Sharing service information with attribution</li>
                        <li>• Educational and research purposes</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-100">
                      <h4 className="font-medium text-red-800 text-sm mb-2">❌ Prohibited Use</h4>
                      <ul className="text-xs space-y-1">
                        <li>• Copying or redistributing our source code</li>
                        <li>• Commercial use without permission</li>
                        <li>• Reverse engineering our service</li>
                        <li>• Using our branding for other services</li>
                      </ul>
                    </div>
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
                  <span>Contact & Legal Inquiries</span>
                </h2>
                <div className="text-gray-700 space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3">📞 How to Reach Us</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2">General Inquiries & Support</p>
                        <p className="text-sm flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-gray-600" />
                          <a href="mailto:devin.oldenburg@icloud.com" className="text-blue-600 hover:text-blue-700">devin.oldenburg@icloud.com</a>
                        </p>
                        <p className="text-sm flex items-center space-x-2 mt-1">
                          <Phone className="w-4 h-4 text-gray-600" />
                          <a href="tel:+4915733791807" className="text-blue-600 hover:text-blue-700">+49 15733791807</a>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2">Legal & Copyright Issues</p>
                        <p className="text-sm">Same contact information applies</p>
                        <p className="text-xs text-gray-600 mt-1">Please clearly mark legal communications in the subject line</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Related Legal Documents:</p>
                    <div className="flex flex-wrap gap-2">
                      <Link to="/legal/terms" className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors">
                        Terms of Service
                      </Link>
                      <Link to="/legal/privacy" className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm hover:bg-purple-200 transition-colors">
                        Privacy Policy
                      </Link>
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
                This legal notice complies with German TMG § 5 and EU regulations. Last updated: January 21, 2025
              </p>
              <p className="text-gray-500 text-xs mt-2">
                All information provided is accurate to the best of our knowledge and will be updated as necessary to maintain compliance.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Impressum;
