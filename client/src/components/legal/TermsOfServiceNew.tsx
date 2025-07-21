import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, AlertTriangle, Shield, Users, Gavel, Clock, Zap, Ban, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../logo.svg';

const TermsOfService: React.FC = () => {
  const sections = [
    {
      icon: Users,
      title: "Service Usage",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      content: [
        "Free URL shortening service with no registration required",
        "Rate limited to 1 request per 0.5 seconds",
        "Maximum of 500 links per day per user",
        "Service available 24/7 with best effort uptime"
      ]
    },
    {
      icon: Clock,
      title: "Rate Limits",
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      content: [
        "0.5 second cooldown between link creation",
        "500 links maximum per 24-hour period",
        "Automatic suspension for exceeding limits",
        "Limits reset daily at midnight UTC"
      ]
    },
    {
      icon: Ban,
      title: "Prohibited Content",
      color: "from-red-500 to-pink-500",
      bgColor: "bg-red-50",
      content: [
        "No malicious or harmful websites",
        "No illegal content or activities",
        "No spam or phishing attempts",
        "No adult content without proper warnings"
      ]
    },
    {
      icon: Shield,
      title: "Our Responsibilities",
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50",
      content: [
        "Maintain service availability and performance",
        "Protect user data and privacy",
        "Monitor for abuse and malicious content",
        "Provide transparent usage analytics"
      ]
    }
  ];

  const features = [
    { icon: Zap, text: "Fast & Reliable", color: "text-yellow-600" },
    { icon: Shield, text: "Secure", color: "text-green-600" },
    { icon: Star, text: "Free Forever", color: "text-blue-600" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
                <img src={logo} alt="Velink Logo" className="h-8 w-8 brightness-0 invert" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-blue-800 bg-clip-text text-transparent">
                  Velink
                </h1>
                <p className="text-sm text-gray-500 font-medium">Terms of Service</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link
                to="/"
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-green-50 hover:to-emerald-50 text-gray-700 hover:text-green-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="font-medium">Back to Home</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl mb-8 shadow-2xl">
            <FileText className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Terms of
            <span className="block bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
              Service
            </span>
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Fair and transparent terms for using Velink's URL shortening service. Simple rules for everyone.
          </p>
          <div className="mt-8 flex items-center justify-center space-x-4 flex-wrap gap-4">
            {features.map((feature, index) => (
              <div key={index} className={`flex items-center space-x-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50 ${feature.color}`}>
                <feature.icon className="w-4 h-4" />
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="h-full p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 group-hover:border-green-300/50">
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`p-4 bg-gradient-to-br ${section.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{section.title}</h3>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600 leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Warning Section */}
        <motion.div
          className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl p-12 text-center shadow-2xl mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <AlertTriangle className="w-16 h-16 text-white/80 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-white mb-4">Important Notice</h3>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Violation of these terms may result in immediate suspension of service. We monitor for abuse and take action to protect our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/legal/privacy"
              className="px-8 py-4 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Read Privacy Policy
            </Link>
            <Link
              to="/legal/impressum"
              className="px-8 py-4 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              Contact Information
            </Link>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          className="bg-gradient-to-br from-green-600 via-emerald-600 to-blue-700 rounded-3xl p-12 text-center shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Gavel className="w-16 h-16 text-white/80 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-white mb-4">Questions About Terms?</h3>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Need clarification on our terms? We're here to help and ensure you understand your rights and responsibilities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:legal@velink.app"
              className="px-8 py-4 bg-white text-green-600 rounded-xl font-semibold hover:bg-green-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Email Legal Team
            </a>
            <a
              href="mailto:support@velink.app"
              className="px-8 py-4 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              General Support
            </a>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <p className="text-gray-500">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default TermsOfService;
