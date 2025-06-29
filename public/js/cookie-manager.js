// Enhanced Cookie Notice and Analytics Management
class CookieManager {
  constructor() {
    this.init();
  }

  init() {
    // Check if cookie consent has been given
    if (!this.getCookie('cookie_consent')) {
      this.showCookieNotice();
    } else if (this.getCookie('cookie_consent') === 'accepted') {
      this.loadAnalytics();
    }
  }

  showCookieNotice() {
    // Create cookie notice if it doesn't exist
    if (!document.getElementById('cookie-notice')) {
      this.createCookieNotice();
    }
    
    // Show the notice with animation
    setTimeout(() => {
      const notice = document.getElementById('cookie-notice');
      if (notice) {
        notice.classList.add('show', 'animate-in');
      }
    }, 1500); // Show after 1.5 seconds
  }

  createCookieNotice() {
    const notice = document.createElement('div');
    notice.id = 'cookie-notice';
    notice.className = 'cookie-notice';
    notice.innerHTML = `
      <div class="cookie-notice-content">
        <div class="cookie-notice-icon">
          <i class="bi bi-cookie"></i>
        </div>
        <div class="cookie-notice-text">
          <strong>Cookie Notice:</strong> We use cookies to enhance your experience, analyze traffic, and provide personalized content. 
          By continuing to use Velink, you consent to our use of cookies. 
          <a href="/datenschutz" target="_blank">Privacy Policy</a>
        </div>
        <div class="cookie-notice-actions">
          <button class="cookie-notice-btn cookie-notice-btn-decline" onclick="cookieManager.declineCookies()">
            <i class="bi bi-x-circle"></i>
            Decline
          </button>
          <button class="cookie-notice-btn cookie-notice-btn-accept" onclick="cookieManager.acceptCookies()">
            <i class="bi bi-check-circle"></i>
            Accept All
          </button>
          <button class="cookie-notice-close" onclick="cookieManager.hideCookieNotice()">
            <i class="bi bi-x"></i>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(notice);
  }

  async acceptCookies() {
    try {
      const response = await fetch('/api/cookie-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accepted: true })
      });

      if (response.ok) {
        this.hideCookieNotice();
        this.loadAnalytics();
        this.showToast('Cookie preferences saved. Analytics enabled.', 'success');
      }
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
      this.showToast('Error saving preferences. Please try again.', 'error');
    }
  }

  async declineCookies() {
    try {
      const response = await fetch('/api/cookie-consent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ accepted: false })
      });

      if (response.ok) {
        this.hideCookieNotice();
        this.showToast('Cookie preferences saved. Only essential cookies will be used.', 'info');
      }
    } catch (error) {
      console.error('Error saving cookie preferences:', error);
      this.showToast('Error saving preferences. Please try again.', 'error');
    }
  }

  hideCookieNotice() {
    const notice = document.getElementById('cookie-notice');
    if (notice) {
      notice.classList.remove('show');
      setTimeout(() => {
        notice.remove();
      }, 300);
    }
  }

  loadAnalytics() {
    // Only load analytics if user has consented
    if (this.getCookie('cookie_consent') === 'accepted') {
      // Load Google Analytics or other tracking scripts here
      this.trackPageView();
    }
  }

  trackPageView() {
    // Simple page view tracking
    if (typeof gtag !== 'undefined') {
      gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: document.title,
        page_location: window.location.href
      });
    }
    
    // Custom analytics tracking
    this.trackEvent('page_view', window.location.pathname);
  }

  trackEvent(eventName, eventData = {}) {
    // Only track if user has consented
    if (this.getCookie('cookie_consent') !== 'accepted') {
      return;
    }

    // Send custom event to our analytics
    fetch('/api/track-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        data: eventData,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        referrer: document.referrer
      })
    }).catch(error => {
      console.error('Analytics tracking error:', error);
    });
  }

  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  showToast(message, type = 'info') {
    // Create a simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
      position: fixed;
      top: 1rem;
      right: 1rem;
      background: var(--${type === 'success' ? 'success' : type === 'error' ? 'error' : 'primary'});
      color: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      max-width: 300px;
      font-size: 0.875rem;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }, 3000);
  }
}

// Initialize cookie manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.cookieManager = new CookieManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CookieManager;
}
            Accept All
          </button>
        </div>
        <button class="cookie-notice-close" onclick="cookieManager.hideCookieNotice()" aria-label="Close">
          ×
        </button>
      </div>
    `;
    
    document.body.appendChild(notice);
  }

  acceptCookies() {
    this.setCookie(this.cookieName, this.cookieValue, this.cookieExpiry);
    this.hideCookieNotice();
    this.loadAnalytics();
    
    // Track consent
    this.trackEvent('cookie_consent', 'accept');
  }

  rejectCookies() {
    this.setCookie(this.cookieName, 'false', this.cookieExpiry);
    this.hideCookieNotice();
    
    // Track rejection (without analytics cookies)
    console.log('Cookies rejected by user');
  }

  hideCookieNotice() {
    const notice = document.getElementById('cookie-notice');
    if (notice) {
      notice.classList.remove('show');
      setTimeout(() => {
        notice.remove();
      }, 300);
    }
  }

  loadAnalytics() {
    // Only load analytics if cookies are accepted
    if (this.getCookie(this.cookieName) === 'true') {
      this.loadPlausible();
      // You can add Google Analytics here if needed
      // this.loadGoogleAnalytics();
    }
  }

  loadPlausible() {
    // Load Plausible Analytics (privacy-friendly)
    if (!document.querySelector('script[data-domain]')) {
      const script = document.createElement('script');
      script.defer = true;
      script.src = 'https://plausible.io/js/script.js';
      script.setAttribute('data-domain', window.location.hostname);
      document.head.appendChild(script);
      
      // Initialize Plausible
      window.plausible = window.plausible || function() { 
        (window.plausible.q = window.plausible.q || []).push(arguments) 
      };
    }
  }

  loadGoogleAnalytics() {
    // Uncomment and configure if you want to use Google Analytics
    /*
    const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your GA4 measurement ID
    
    if (!window.gtag) {
      // Load Google Analytics
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script1);
      
      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_MEASUREMENT_ID}', {
          anonymize_ip: true,
          cookie_flags: 'SameSite=Strict;Secure'
        });
      `;
      document.head.appendChild(script2);
    }
    */
  }

  // Utility functions
  setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict`;
  }

  getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  // Event tracking function
  trackEvent(eventName, eventData = {}) {
    // Only track if cookies are accepted
    if (this.getCookie(this.cookieName) === 'true') {
      // Plausible event tracking
      if (window.plausible) {
        window.plausible(eventName, { props: eventData });
      }
      
      // Google Analytics event tracking
      if (window.gtag) {
        window.gtag('event', eventName, eventData);
      }
      
      // Console log for debugging
      console.log('Event tracked:', eventName, eventData);
    }
  }

  // Page view tracking
  trackPageView(url = window.location.pathname) {
    this.trackEvent('pageview', { url });
  }

  // Custom event tracking methods
  trackFormSubmission(formName) {
    this.trackEvent('form_submit', { form_name: formName });
  }

  trackButtonClick(buttonName) {
    this.trackEvent('button_click', { button_name: buttonName });
  }

  trackLinkClick(linkUrl, linkText) {
    this.trackEvent('link_click', { 
      url: linkUrl, 
      text: linkText.substring(0, 50) // Limit text length
    });
  }

  trackDownload(fileName) {
    this.trackEvent('download', { file_name: fileName });
  }

  trackError(errorMessage, errorPage) {
    this.trackEvent('error', { 
      message: errorMessage.substring(0, 100), 
      page: errorPage 
    });
  }
}

// Initialize cookie manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.cookieManager = new CookieManager();
});

// Auto-track page views for SPAs
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (window.cookieManager) {
      window.cookieManager.trackPageView();
    }
  }
}).observe(document, { subtree: true, childList: true });

// Track external link clicks
document.addEventListener('click', function(e) {
  const link = e.target.closest('a');
  if (link && link.href && window.cookieManager) {
    const isExternal = link.hostname !== window.location.hostname;
    const isDownload = link.hasAttribute('download') || 
                      /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip|rar|exe|dmg)$/i.test(link.href);
    
    if (isExternal) {
      window.cookieManager.trackLinkClick(link.href, link.textContent);
    } else if (isDownload) {
      const fileName = link.href.split('/').pop() || 'unknown';
      window.cookieManager.trackDownload(fileName);
    }
  }
});

// Track form submissions
document.addEventListener('submit', function(e) {
  if (window.cookieManager && e.target.tagName === 'FORM') {
    const formName = e.target.id || e.target.className || 'unnamed_form';
    window.cookieManager.trackFormSubmission(formName);
  }
});

// Track JavaScript errors
window.addEventListener('error', function(e) {
  if (window.cookieManager) {
    window.cookieManager.trackError(e.message, window.location.pathname);
  }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CookieManager;
}
