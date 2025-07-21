import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, Copy, Check, ExternalLink, BarChart3, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ShortenedLink {
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
}

const LinkShortener: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shortenedLink, setShortenedLink] = useState<ShortenedLink | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return string.startsWith('http://') || string.startsWith('https://');
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      setError('Please enter a valid URL starting with http:// or https://');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/shorten', { url });
      setShortenedLink(response.data);
      toast.success('Link shortened successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to shorten URL';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortenedLink) return;
    
    try {
      await navigator.clipboard.writeText(shortenedLink.shortUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleReset = () => {
    setUrl('');
    setShortenedLink(null);
    setError('');
    setCopied(false);
  };

  return (
    <section id="shortener" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Shorten Your Links
          </h2>
          <p className="text-lg text-gray-600">
            Paste your long URL below and get a beautiful short link instantly
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
          className="card max-w-2xl mx-auto"
        >
          {!shortenedLink ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your long URL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Link2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/very-long-url-here"
                    className={`input-primary pl-10 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    disabled={isLoading}
                  />
                </div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center space-x-2 text-red-600"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Shortening...</span>
                  </div>
                ) : (
                  'Shorten Link'
                )}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <Check className="h-8 w-8 text-green-600" />
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Your link has been shortened!
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={shortenedLink.shortUrl}
                      readOnly
                      className="input-primary flex-1 bg-gray-50"
                    />
                    <button
                      onClick={handleCopy}
                      className="btn-secondary px-4"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    <a
                      href={shortenedLink.shortUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary px-4"
                      title="Open link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original URL
                  </label>
                  <input
                    type="text"
                    value={shortenedLink.originalUrl}
                    readOnly
                    className="input-primary bg-gray-50 text-gray-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center mb-2">
                      <BarChart3 className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{shortenedLink.clicks}</div>
                    <div className="text-sm text-gray-600">Clicks</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">
                      {new Date(shortenedLink.createdAt).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-600">Created</div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="btn-secondary w-full"
              >
                Shorten Another Link
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default LinkShortener;
