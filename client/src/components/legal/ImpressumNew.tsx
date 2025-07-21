import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Building, Mail, MapPin, User, FileText, Globe, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from '../../logo.svg';

interface ContactItem {
  label: string;
  value: string;
  isLink?: boolean;
}

const Impressum: React.FC = () => {
  const contactSections = [
    {
      icon: User,
      title: "Service Provider",
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50",
      content: [
        { label: "Name", value: "Velink Service" },
        { label: "Type", value: "Digital Service Platform" },
        { label: "Registration", value: "Commercial Registry" },
        { label: "VAT ID", value: "DE123456789" }
      ] as ContactItem[]
    },
    {
      icon: MapPin,
      title: "Address",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      content: [
        { label: "Street", value: "Musterstraße 123" },
        { label: "City", value: "12345 Berlin" },
        { label: "Country", value: "Germany" },
        { label: "Region", value: "Europe" }
      ] as ContactItem[]
    },
    {
      icon: Mail,
      title: "Contact Information",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      content: [
        { label: "Email", value: "info@velink.app", isLink: true },
        { label: "Legal", value: "legal@velink.app", isLink: true },
        { label: "Support", value: "support@velink.app", isLink: true },
        { label: "Privacy", value: "privacy@velink.app", isLink: true }
      ] as ContactItem[]
    },
    {
      icon: Shield,
      title: "Legal Information",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      content: [
        { label: "Responsible", value: "Max Mustermann" },
        { label: "Position", value: "Managing Director" },
        { label: "Content", value: "Editorial Responsibility" },
        { label: "Regulation", value: "TMG § 5" }
      ] as ContactItem[]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-gray-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
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
              <div className="p-2 bg-gradient-to-br from-gray-600 to-blue-600 rounded-xl shadow-lg">
                <img src={logo} alt="Velink Logo" className="h-8 w-8 brightness-0 invert" />
              </div>
              <div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-gray-700 via-blue-600 to-indigo-800 bg-clip-text text-transparent">
                  Velink
                </h1>
                <p className="text-sm text-gray-500 font-medium">Impressum</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Link
                to="/"
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-50 hover:to-indigo-50 text-gray-700 hover:text-blue-600 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md"
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
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-600 to-blue-600 rounded-3xl mb-8 shadow-2xl">
            <Building className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-6xl md:text-7xl font-black text-gray-900 mb-6 leading-tight">
            Impressum
            <span className="block bg-gradient-to-r from-gray-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Legal Notice
            </span>
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
            Legal information and contact details as required by German law (TMG § 5).
          </p>
          <div className="mt-8 flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full">
              <Globe className="w-4 h-4" />
              <span className="font-medium">Germany</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-full">
              <FileText className="w-4 h-4" />
              <span className="font-medium">TMG Compliant</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {contactSections.map((section, index) => (
            <motion.div
              key={section.title}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="h-full p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-200/50 group-hover:border-blue-300/50">
                <div className="flex items-center space-x-4 mb-6">
                  <div className={`p-4 bg-gradient-to-br ${section.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <section.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{section.title}</h3>
                </div>
                <div className="space-y-4">
                  {section.content.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-gray-500 font-medium">{item.label}:</span>
                      {item.isLink ? (
                        <a
                          href={`mailto:${item.value}`}
                          className="text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <span className="text-gray-900 font-semibold">{item.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Disclaimer Section */}
        <motion.div
          className="bg-gradient-to-br from-gray-700 via-blue-800 to-indigo-900 rounded-3xl p-12 text-center shadow-2xl mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <FileText className="w-16 h-16 text-white/80 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-white mb-4">Disclaimer</h3>
          <div className="text-left max-w-4xl mx-auto text-gray-200 space-y-4">
            <p className="text-lg leading-relaxed">
              <strong className="text-white">Liability for Contents:</strong> The contents of our pages have been created with the utmost care. However, we cannot guarantee the accuracy, completeness, or timeliness of the contents.
            </p>
            <p className="text-lg leading-relaxed">
              <strong className="text-white">Liability for Links:</strong> Our offer contains links to external websites of third parties on whose contents we have no influence. Therefore, we cannot assume any liability for these external contents.
            </p>
            <p className="text-lg leading-relaxed">
              <strong className="text-white">Copyright:</strong> The content and works created by the site operators on these pages are subject to German copyright law.
            </p>
          </div>
        </motion.div>

        {/* Contact CTA */}
        <motion.div
          className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-12 text-center shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Mail className="w-16 h-16 text-white/80 mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-white mb-4">Get in Touch</h3>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Have questions about our service or need to report an issue? We're here to help and respond quickly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:info@velink.app"
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl"
            >
              General Inquiries
            </a>
            <a
              href="mailto:legal@velink.app"
              className="px-8 py-4 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors border border-white/30"
            >
              Legal Matters
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
          <p className="text-gray-400 text-sm mt-2">
            This legal notice complies with German Telemediengesetz (TMG) § 5
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Impressum;
