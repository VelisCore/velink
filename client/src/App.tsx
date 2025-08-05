import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import Hero from './components/Hero';
import LinkShortener from './components/LinkShortener';
import Features from './components/Features';
import Stats from './components/Stats';
import Footer from './components/Footer';
import PrivacyPolicy from './components/legal/PrivacyPolicy';
import TermsOfService from './components/legal/TermsOfService';
import Impressum from './components/legal/Impressum';
import ApiDocumentation from './components/documentation/ApiDocumentation';
import LinkAnalytics from './components/analytics/LinkAnalytics';
import CookieNotice from './components/CookieNotice';
import AdminPanel from './components/CleanAdminPanel';
import PrivacyGate from './components/PrivacyGate';
import BugReport from './components/BugReport';
import SEO from './components/SEO';
import { NotFound } from './components/error';
// Performance components
import { 
  ResourcePreloader, 
  usePerformanceMonitoring, 
  usePrefetchRouter,
  registerServiceWorker,
  BundleAnalyzer 
} from './components/Performance';
import './App.css';

// HomePage component to keep the main page structure
const HomePage = () => (
  <>
    <SEO />
    <Header />
    <main>
      <Hero />
      <LinkShortener />
      <Features />
      <Stats />
    </main>
    <Footer />
  </>
);

function App() {
  // Performance monitoring
  usePerformanceMonitoring();
  usePrefetchRouter();
  
  // Register service worker
  React.useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <Router>
      <PrivacyGate>
        {/* Performance optimizations */}
        <ResourcePreloader />
        <BundleAnalyzer />
          
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#10b981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/privacy" element={
                <>
                  <SEO 
                    title="Privacy Policy - Velink | Your Privacy Matters"
                    description="Learn how Velink protects your privacy and data. GDPR compliant with transparent data handling and user control."
                    url="/privacy"
                  />
                  <PrivacyPolicy />
                </>
              } />
              <Route path="/terms" element={
                <>
                  <SEO 
                    title="Terms of Service - Velink | Service Agreement"
                    description="Terms and conditions for using Velink URL shortening service. Fair usage policy and service guidelines."
                    url="/terms"
                  />
                  <TermsOfService />
                </>
              } />
              <Route path="/impressum" element={
                <>
                  <SEO 
                    title="Impressum - Velink | Legal Information"
                    description="Legal information and contact details for Velink URL shortener service."
                    url="/impressum"
                  />
                  <Impressum />
                </>
              } />
              <Route path="/legal/privacy" element={
                <>
                  <SEO 
                    title="Privacy Policy - Velink | Your Privacy Matters"
                    description="Learn how Velink protects your privacy and data. GDPR compliant with transparent data handling and user control."
                    url="/legal/privacy"
                  />
                  <PrivacyPolicy />
                </>
              } />
              <Route path="/legal/terms" element={
                <>
                  <SEO 
                    title="Terms of Service - Velink | Service Agreement"
                    description="Terms and conditions for using Velink URL shortening service. Fair usage policy and service guidelines."
                    url="/legal/terms"
                  />
                  <TermsOfService />
                </>
              } />
              <Route path="/legal/impressum" element={
                <>
                  <SEO 
                    title="Impressum - Velink | Legal Information"
                    description="Legal information and contact details for Velink URL shortener service."
                    url="/legal/impressum"
                  />
                  <Impressum />
                </>
              } />
              <Route path="/api-docs" element={
                <>
                  <SEO 
                    title="API Documentation - Velink | Developer Resources"
                    description="Complete API documentation for Velink URL shortener. RESTful endpoints, code examples, and interactive playground."
                    url="/api-docs"
                    keywords="velink api, url shortener api, rest api, developer documentation, api endpoints, link shortener integration"
                  />
                  <ApiDocumentation />
                </>
              } />
              <Route path="/analytics/:shortCode" element={
                <>
                  <SEO 
                    title="Link Analytics - Velink | Detailed Link Statistics"
                    description="View comprehensive analytics for your shortened links including clicks, geography, devices, and referrers."
                    url="/analytics"
                    keywords="link analytics, url statistics, click tracking, link performance, geographic analytics"
                    noIndex={true}
                  />
                  <LinkAnalytics />
                </>
              } />
              <Route path="/admin" element={
                <>
                  <SEO 
                    title="Admin Panel - Velink | System Management"
                    description="Velink admin panel for system management and analytics."
                    noIndex={true}
                  />
                  <AdminPanel />
                </>
              } />
              <Route path="/bug-report" element={
                <>
                  <SEO 
                    title="Bug Report - Velink | Report Issues"
                    description="Report bugs, request features, or ask questions about Velink URL shortener service."
                    url="/bug-report"
                  />
                  <BugReport />
                </>
              } />
              <Route path="*" element={
                <>
                  <SEO 
                    title="Page Not Found - Velink | 404 Error"
                    description="The page you're looking for doesn't exist. Return to Velink homepage or try a different URL."
                    noIndex={true}
                  />
                  <NotFound />
                </>
              } />
            </Routes>
            
          <CookieNotice />
        </div>
      </PrivacyGate>
    </Router>
  );
}export default App;
