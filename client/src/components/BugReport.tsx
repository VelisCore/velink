import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bug, Send, AlertTriangle, Info, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

interface BugReportData {
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'bug' | 'feature' | 'improvement' | 'question';
  email?: string;
  steps?: string;
  expected?: string;
  actual?: string;
}

const BugReport: React.FC = () => {
  const [formData, setFormData] = useState<BugReportData>({
    title: '',
    description: '',
    severity: 'medium',
    type: 'bug',
    email: '',
    steps: '',
    expected: '',
    actual: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare data, only including non-empty fields
      const submitData: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        severity: formData.severity,
        type: formData.type
      };

      // Only include optional fields if they have content
      if (formData.email?.trim()) {
        submitData.email = formData.email.trim();
      }
      if (formData.steps?.trim()) {
        submitData.steps = formData.steps.trim();
      }
      if (formData.expected?.trim()) {
        submitData.expected = formData.expected.trim();
      }
      if (formData.actual?.trim()) {
        submitData.actual = formData.actual.trim();
      }

      // Use absolute URL to ensure correct endpoint
      const apiUrl = `${window.location.origin}/api/bug-reports`;
      await axios.post(apiUrl, submitData);
      toast.success('Bug report submitted successfully!');
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting bug report:', error);
      toast.error('Failed to submit bug report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      severity: 'medium',
      type: 'bug',
      email: '',
      steps: '',
      expected: '',
      actual: ''
    });
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="transition-all duration-300 group-hover:scale-105">
                  <img src="/logo512.png" alt="Velink Logo" className="h-10 w-10" />
                </div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                    Velink
                  </h1>
                  <span className="text-gray-500">Bug Report</span>
                </div>
              </Link>
              <Link
                to="/"
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your bug report has been submitted successfully. Our team will review it and get back to you if needed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetForm}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                Submit Another Report
              </button>
              <Link
                to="/"
                className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="transition-all duration-300 group-hover:scale-105">
                <img src="/logo512.png" alt="Velink Logo" className="h-10 w-10" />
              </div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Velink
                </h1>
                <span className="text-gray-500">Bug Report</span>
              </div>
            </Link>
            <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bug className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-4">
            Report a Bug or Issue
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help us improve Velink by reporting bugs, suggesting features, or asking questions. 
            Your feedback is valuable to us!
          </p>
        </motion.div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Bug className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Bug Reports</h3>
            <p className="text-gray-600 text-sm">
              Found something that's not working as expected? Let us know!
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Feature Requests</h3>
            <p className="text-gray-600 text-sm">
              Have an idea for a new feature? We'd love to hear about it!
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Info className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">General Questions</h3>
            <p className="text-gray-600 text-sm">
              Need help or have questions about how something works?
            </p>
          </div>
        </div>

        {/* Bug Report Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="select-primary"
                  required
                >
                  <option value="bug">🐛 Bug Report</option>
                  <option value="feature">✨ Feature Request</option>
                  <option value="improvement">🚀 Improvement</option>
                  <option value="question">❓ Question</option>
                </select>
              </div>
              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-2">
                  Severity
                </label>
                <select
                  id="severity"
                  name="severity"
                  value={formData.severity}
                  onChange={handleInputChange}
                  className="select-primary"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🟠 High</option>
                  <option value="critical">🔴 Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief description of the issue or request"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Provide a detailed description of the issue or request"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email (Optional)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your@email.com (if you want updates on this report)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
              />
            </div>

            {formData.type === 'bug' && (
              <>
                <div>
                  <label htmlFor="steps" className="block text-sm font-medium text-gray-700 mb-2">
                    Steps to Reproduce
                  </label>
                  <textarea
                    id="steps"
                    name="steps"
                    value={formData.steps}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="expected" className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Behavior
                    </label>
                    <textarea
                      id="expected"
                      name="expected"
                      value={formData.expected}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="What did you expect to happen?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="actual" className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Behavior
                    </label>
                    <textarea
                      id="actual"
                      name="actual"
                      value={formData.actual}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="What actually happened?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end space-x-4">
              <Link
                to="/"
                className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Send className={`h-4 w-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Report'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default BugReport;
