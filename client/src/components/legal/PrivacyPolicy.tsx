import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600">Last updated: July 21, 2025</p>
          
          <h2>1. Introduction</h2>
          <p>
            At Velink, we respect your privacy and are committed to protecting your personal data. 
            This Privacy Policy explains how we collect, use, and safeguard your information when 
            you use our URL shortening service.
          </p>
          
          <h2>2. Information We Collect</h2>
          <p>
            When you use Velink, we collect the following information:
          </p>
          <ul>
            <li><strong>URLs submitted for shortening</strong> - We store the original URL that you provide.</li>
            <li><strong>IP Address</strong> - We collect IP addresses for security purposes and analytics.</li>
            <li><strong>User Agent Information</strong> - We collect information about your browser and device.</li>
            <li><strong>Click Data</strong> - We track when your shortened links are accessed.</li>
          </ul>
          
          <h2>3. How We Use Your Information</h2>
          <p>
            We use the collected information for:
          </p>
          <ul>
            <li>Providing our URL shortening service</li>
            <li>Generating analytics for link performance</li>
            <li>Improving our service</li>
            <li>Preventing abuse and ensuring security</li>
            <li>Complying with legal obligations</li>
          </ul>
          
          <h2>4. Data Retention</h2>
          <p>
            We retain your data for as long as your shortened URLs are active. Unused links 
            (those with zero clicks) may be automatically deleted after 30 days.
          </p>
          
          <h2>5. Your Rights</h2>
          <p>
            Depending on your location, you may have rights regarding your personal data, including:
          </p>
          <ul>
            <li>Access to your data</li>
            <li>Correction of inaccurate data</li>
            <li>Deletion of your data</li>
            <li>Restriction of processing</li>
            <li>Data portability</li>
          </ul>
          <p>
            To exercise these rights, please contact us at privacy@velink.example.com.
          </p>
          
          <h2>6. Cookies and Tracking</h2>
          <p>
            We use essential cookies to ensure the proper functioning of our service. 
            We may also use analytics cookies to understand how our service is used.
          </p>
          
          <h2>7. Third-Party Services</h2>
          <p>
            We do not sell your personal information to third parties. However, we may use 
            third-party services for analytics and security purposes.
          </p>
          
          <h2>8. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any 
            changes by posting the new Privacy Policy on this page.
          </p>
          
          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            Email: privacy@velink.example.com<br />
            Address: Velink GmbH, Musterstraße 123, 10115 Berlin, Germany
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
