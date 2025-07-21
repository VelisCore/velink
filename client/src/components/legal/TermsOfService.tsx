import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService: React.FC = () => {
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
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600">Last updated: July 21, 2025</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Velink's URL shortening service, you agree to be bound by these 
            Terms of Service. If you do not agree to these terms, please do not use our service.
          </p>
          
          <h2>2. Description of Service</h2>
          <p>
            Velink provides a URL shortening service that allows users to create shortened links to longer URLs.
            Our service includes analytics for tracking link performance.
          </p>
          
          <h2>3. User Responsibilities</h2>
          <p>
            When using Velink, you agree to:
          </p>
          <ul>
            <li>Provide accurate information when using our service</li>
            <li>Not use our service for any illegal or unauthorized purpose</li>
            <li>Not attempt to disrupt or compromise the security of our service</li>
            <li>Not use our service to distribute malware, spam, or harmful content</li>
            <li>Not infringe on the intellectual property rights of others</li>
          </ul>
          
          <h2>4. Prohibited Content</h2>
          <p>
            You may not use Velink to shorten URLs that link to:
          </p>
          <ul>
            <li>Illegal content or activities</li>
            <li>Malware, phishing, or other harmful content</li>
            <li>Content that promotes hate speech or discrimination</li>
            <li>Content that violates the privacy or intellectual property rights of others</li>
            <li>Adult content without proper age verification</li>
            <li>Spam or deceptive content</li>
          </ul>
          
          <h2>5. Rate Limiting</h2>
          <p>
            To ensure fair usage, we implement rate limiting on our service. Currently, 
            users are limited to creating 1 shortened URL per minute and 100 general API 
            requests per minute.
          </p>
          
          <h2>6. Service Availability</h2>
          <p>
            We strive to provide a reliable service, but we do not guarantee that our service 
            will be available at all times. We reserve the right to modify, suspend, or discontinue 
            the service at any time without notice.
          </p>
          
          <h2>7. Data Retention</h2>
          <p>
            We may delete shortened URLs that have not been accessed for an extended period. 
            Unused links (those with zero clicks) may be automatically deleted after 30 days.
          </p>
          
          <h2>8. Intellectual Property</h2>
          <p>
            All content, features, and functionality of our service are owned by Velink and 
            are protected by international copyright, trademark, and other intellectual property laws.
          </p>
          
          <h2>9. Disclaimer of Warranties</h2>
          <p>
            Our service is provided "as is" and "as available" without any warranties of any kind, 
            either express or implied.
          </p>
          
          <h2>10. Limitation of Liability</h2>
          <p>
            In no event shall Velink be liable for any indirect, incidental, special, consequential, 
            or punitive damages arising out of or related to your use of our service.
          </p>
          
          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms of Service at any time. We will notify users 
            of any significant changes by posting the new terms on our website.
          </p>
          
          <h2>12. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of Germany, 
            without regard to its conflict of law provisions.
          </p>
          
          <h2>13. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p>
            Email: terms@velink.example.com<br />
            Address: Velink GmbH, Musterstraße 123, 10115 Berlin, Germany
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;
