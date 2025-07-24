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
import ApiDocumentation from './components/documentation/ApiDocumentationFixed';
import LinkAnalytics from './components/analytics/LinkAnalytics';
import CookieNotice from './components/CookieNotice';
import AdminPanel from './components/CleanAdminPanel';
import PrivacyGate from './components/PrivacyGate';
import BugReport from './components/BugReport';
import './App.css';

// HomePage component to keep the main page structure
const HomePage = () => (
  <>
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
  return (
    <Router>
      <PrivacyGate>
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
                      <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/legal/privacy" element={<PrivacyPolicy />} />
            <Route path="/legal/terms" element={<TermsOfService />} />
            <Route path="/legal/impressum" element={<Impressum />} />
            <Route path="/api-docs" element={<ApiDocumentation />} />
            <Route path="/analytics/:shortCode" element={<LinkAnalytics />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/bug-report" element={<BugReport />} />
            <Route path="/bug-report" element={<BugReport />} />
          </Routes>
          
          <CookieNotice />
        </div>
      </PrivacyGate>
    </Router>
  );
}

export default App;
