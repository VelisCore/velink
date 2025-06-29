// Cookie Notice and Analytics Management
class CookieManager {
  constructor() {
    this.cookieName = 'velink_cookies_accepted';
    this.cookieValue = 'true';
    this.cookieExpiry = 365; // days
    this.init();
  }

  init() {
    // Check if cookies are already accepted
    if (!this.getCookie(this.cookieName)) {
      this.showCookieNotice();
    } else {
      // Load analytics if cookies are accepted
      this.loadAnalytics();
    }
  }

  showCookieNotice() {
    // Create cookie notice if it doesn't exist
    if (!document.getElementById('cookie-notice')) {
      this.createCookieNotice();
    }
    
    // Show the notice
    setTimeout(() => {
      const notice = document.getElementById('cookie-notice');
      if (notice) {
        notice.classList.add('show');
      }
    }, 1000); // Show after 1 second
  }

  createCookieNotice() {
    const notice = document.createElement('div');
    notice.id = 'cookie-notice';
    notice.className = 'cookie-notice';
    notice.innerHTML = `
      <div class="cookie-notice-content">
        <div class="cookie-notice-text">
          We use cookies to enhance your experience and analyze our traffic. 
          By continuing to use our site, you consent to our use of cookies. 
          <a href="/datenschutz" target="_blank">Learn more</a>
        </div>
        <div class="cookie-notice-actions">
          <button class="btn btn-ghost btn-sm" onclick="cookieManager.rejectCookies()">
            Decline
          </button>
          <button class="btn btn-primary btn-sm" onclick="cookieManager.acceptCookies()">
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
