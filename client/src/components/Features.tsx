import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  BarChart3, 
  Globe, 
  Clock, 
  Smartphone,
  Lock,
  TrendingUp
} from 'lucide-react';

const Features: React.FC = () => {
  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Shorten URLs instantly with our optimized infrastructure and minimal processing time.',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      icon: Shield,
      title: 'Rate Limited',
      description: 'Protected against abuse with intelligent rate limiting - 1 link per minute per IP.',
      color: 'from-blue-400 to-blue-600'
    },
    {
      icon: BarChart3,
      title: 'Click Analytics',
      description: 'Track link performance with detailed click statistics and engagement metrics.',
      color: 'from-green-400 to-green-600'
    },
    {
      icon: Globe,
      title: 'SEO Optimized',
      description: 'Shortened links are optimized for search engines with proper meta tags and redirects.',
      color: 'from-purple-400 to-purple-600'
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Fully responsive design that works perfectly on all devices and screen sizes.',
      color: 'from-pink-400 to-red-500'
    },
    {
      icon: Lock,
      title: 'Secure & Private',
      description: 'Your data is protected with enterprise-grade security and privacy measures.',
      color: 'from-indigo-400 to-indigo-600'
    },
    {
      icon: Clock,
      title: 'No Registration',
      description: 'Start shortening links immediately without creating an account or logging in.',
      color: 'from-teal-400 to-cyan-500'
    },
    {
      icon: TrendingUp,
      title: 'High Availability',
      description: '99.9% uptime guarantee with redundant infrastructure and automatic failover.',
      color: 'from-emerald-400 to-emerald-600'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need for professional link shortening with enterprise-grade 
            security and performance.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="card text-center group hover:shadow-2xl"
            >
              <div className={`w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r ${feature.color} p-3 transform group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Additional info section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 md:p-12 text-white text-center">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to start shortening?
            </h3>
            <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust Velink for their URL shortening needs. 
              No signup required, start using it right away.
            </p>
            <a
              href="#shortener"
              className="inline-flex items-center px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200 transform hover:scale-105"
            >
              Get Started Now
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
