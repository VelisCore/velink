const { customAlphabet } = require('nanoid');

// Custom alphabet for short codes (URL-safe, excludes confusing characters)
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
const nanoid = customAlphabet(alphabet, 6);

/**
 * Generate a short code for URL shortening
 * @returns {string} 6-character short code
 */
function generateShortCode() {
  return nanoid();
}

/**
 * Validate if a string is a valid URL
 * @param {string} string - URL to validate
 * @returns {boolean} True if valid URL
 */
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (err) {
    return false;
  }
}

/**
 * Sanitize URL for database storage
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL
 */
function sanitizeUrl(url) {
  try {
    const urlObj = new URL(url);
    // Remove tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'dclid', 'msclkid', '_ga', 'mc_eid', 'mc_cid'
    ];
    
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.toString();
  } catch (err) {
    return url;
  }
}

/**
 * Get domain from URL
 * @param {string} url - URL to extract domain from
 * @returns {string} Domain name
 */
function getDomainFromUrl(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch (err) {
    return 'unknown';
  }
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Get relative time string
 * @param {string|Date} date - Date to compare
 * @returns {string} Relative time string
 */
function getRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  
  return then.toLocaleDateString();
}

module.exports = {
  generateShortCode,
  isValidUrl,
  sanitizeUrl,
  getDomainFromUrl,
  formatNumber,
  getRelativeTime
};
