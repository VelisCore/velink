// Modern Login Form Handler
class LoginForm {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 2;
    this.form = document.getElementById('loginForm');
    this.steps = document.querySelectorAll('.form-step');
    this.nextBtn = document.getElementById('nextBtn');
    this.backBtn = document.getElementById('backBtn');
    this.submitBtn = document.querySelector('button[type="submit"]');
    this.togglePasswordBtn = document.querySelector('.toggle-password');
    this.loadingOverlay = document.getElementById('loadingOverlay');
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupPasswordToggle();
    this.setupFormValidation();
    this.focusFirstInput();
  }

  bindEvents() {
    // Navigation buttons
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => this.nextStep());
    }
    
    if (this.backBtn) {
      this.backBtn.addEventListener('click', () => this.prevStep());
    }

    // Form submission
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Enter key handling
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (this.currentStep === 1 && this.nextBtn) {
          e.preventDefault();
          this.nextStep();
        }
      }
    });

    // Input field events
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('input', () => this.validateField(input));
      input.addEventListener('blur', () => this.validateField(input));
    });
  }

  setupPasswordToggle() {
    if (this.togglePasswordBtn) {
      this.togglePasswordBtn.addEventListener('click', () => {
        const passwordInput = document.getElementById('password');
        const icon = this.togglePasswordBtn.querySelector('i');
        
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          icon.className = 'bi bi-eye-slash';
          this.togglePasswordBtn.setAttribute('aria-label', 'Hide password');
        } else {
          passwordInput.type = 'password';
          icon.className = 'bi bi-eye';
          this.togglePasswordBtn.setAttribute('aria-label', 'Show password');
        }
      });
    }
  }

  setupFormValidation() {
    // Real-time validation
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    if (usernameInput) {
      usernameInput.addEventListener('input', () => {
        this.validateUsername(usernameInput.value);
      });
    }

    if (passwordInput) {
      passwordInput.addEventListener('input', () => {
        this.validatePassword(passwordInput.value);
      });
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      // Validate current step
      if (this.validateCurrentStep()) {
        this.currentStep++;
        this.updateStepDisplay();
        this.focusFirstInput();
        this.trackStepProgress();
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepDisplay();
      this.focusFirstInput();
    }
  }

  updateStepDisplay() {
    this.steps.forEach((step, index) => {
      const stepNumber = index + 1;
      if (stepNumber === this.currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
  }

  validateCurrentStep() {
    if (this.currentStep === 1) {
      const username = document.getElementById('username').value.trim();
      if (!username) {
        this.showFieldError('username', 'Please enter your username or email');
        return false;
      }
      if (!this.validateUsername(username)) {
        return false;
      }
    }
    return true;
  }

  validateUsername(username) {
    const usernameInput = document.getElementById('username');
    
    if (!username) {
      this.showFieldError('username', 'Username or email is required');
      return false;
    }
    
    if (username.length < 3) {
      this.showFieldError('username', 'Username must be at least 3 characters');
      return false;
    }
    
    // If it looks like an email, validate email format
    if (username.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(username)) {
        this.showFieldError('username', 'Please enter a valid email address');
        return false;
      }
    }
    
    this.clearFieldError('username');
    return true;
  }

  validatePassword(password) {
    const passwordInput = document.getElementById('password');
    
    if (!password) {
      this.showFieldError('password', 'Password is required');
      return false;
    }
    
    if (password.length < 8) {
      this.showFieldError('password', 'Password must be at least 8 characters');
      return false;
    }
    
    this.clearFieldError('password');
    return true;
  }

  validateField(input) {
    const value = input.value.trim();
    
    switch (input.id) {
      case 'username':
        return this.validateUsername(value);
      case 'password':
        return this.validatePassword(value);
      default:
        return true;
    }
  }

  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const inputGroup = field.closest('.input-group') || field.closest('.form-group');
    
    // Remove existing error
    this.clearFieldError(fieldId);
    
    // Add error class
    field.classList.add('error');
    
    // Create error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.cssText = `
      color: var(--error-500);
      font-size: var(--font-size-xs);
      margin-top: var(--space-1);
      display: flex;
      align-items: center;
      gap: var(--space-1);
    `;
    
    // Add icon
    const icon = document.createElement('i');
    icon.className = 'bi bi-exclamation-triangle';
    errorElement.insertBefore(icon, errorElement.firstChild);
    
    inputGroup.appendChild(errorElement);
    
    // Focus the field
    field.focus();
  }

  clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const inputGroup = field.closest('.input-group') || field.closest('.form-group');
    const existingError = inputGroup.querySelector('.field-error');
    
    if (existingError) {
      existingError.remove();
    }
    
    field.classList.remove('error');
  }

  focusFirstInput() {
    const activeStep = document.querySelector('.form-step.active');
    const firstInput = activeStep?.querySelector('input');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    
    if (!this.validateUsername(username) || !this.validatePassword(password)) {
      return;
    }
    
    // Show loading state
    this.showLoading(true);
    
    // Track login attempt
    if (window.cookieManager) {
      window.cookieManager.trackEvent('login_attempt', {
        method: 'email_password',
        step: 'form_submit'
      });
    }
    
    try {
      // Submit the form
      const formData = new FormData(this.form);
      const response = await fetch('/login', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Success
        this.showSuccessMessage('Login successful! Redirecting...');
        
        // Track successful login
        if (window.cookieManager) {
          window.cookieManager.trackEvent('login_success', {
            method: 'email_password'
          });
        }
        
        // Redirect after short delay
        setTimeout(() => {
          window.location.href = result.redirect || '/dashboard';
        }, 1500);
        
      } else {
        // Error
        this.showError(result.message || 'Login failed. Please check your credentials.');
        
        // Track failed login
        if (window.cookieManager) {
          window.cookieManager.trackEvent('login_failed', {
            method: 'email_password',
            error: result.message || 'unknown_error'
          });
        }
      }
      
    } catch (error) {
      console.error('Login error:', error);
      this.showError('Network error. Please try again.');
      
      // Track network error
      if (window.cookieManager) {
        window.cookieManager.trackError('login_network_error', '/login');
      }
    } finally {
      this.showLoading(false);
    }
  }

  showLoading(show) {
    if (this.loadingOverlay) {
      if (show) {
        this.loadingOverlay.removeAttribute('hidden');
      } else {
        this.loadingOverlay.setAttribute('hidden', '');
      }
    }
    
    // Disable form elements
    const formElements = this.form.querySelectorAll('input, button');
    formElements.forEach(element => {
      element.disabled = show;
    });
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showSuccessMessage(message) {
    this.showNotification(message, 'success');
  }

  showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: var(--space-6);
      right: var(--space-6);
      background: ${type === 'error' ? 'var(--error-500)' : type === 'success' ? 'var(--success-500)' : 'var(--primary-500)'};
      color: white;
      padding: var(--space-4) var(--space-6);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      z-index: var(--z-popover);
      animation: slideInRight 0.3s ease-out;
      max-width: 300px;
      font-size: var(--font-size-sm);
      display: flex;
      align-items: center;
      gap: var(--space-2);
    `;
    
    // Add icon
    const icon = document.createElement('i');
    icon.className = type === 'error' ? 'bi bi-exclamation-triangle' : 
                     type === 'success' ? 'bi bi-check-circle' : 'bi bi-info-circle';
    notification.appendChild(icon);
    
    // Add message
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    notification.appendChild(messageSpan);
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  trackStepProgress() {
    if (window.cookieManager) {
      window.cookieManager.trackEvent('login_step_progress', {
        step: this.currentStep,
        total_steps: this.totalSteps
      });
    }
  }
}

// Social login handlers
function handleSocialLogin(provider) {
  if (window.cookieManager) {
    window.cookieManager.trackEvent('login_attempt', {
      method: provider,
      step: 'social_click'
    });
  }
  
  // Implement social login logic here
  console.log(`Social login with ${provider} clicked`);
  
  // For now, show a message
  if (window.loginForm) {
    window.loginForm.showNotification(`${provider} login coming soon!`, 'info');
  }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .input-group input.error {
    border-color: var(--error-500);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }
  
  .field-error {
    animation: fadeInUp 0.2s ease-out;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.loginForm = new LoginForm();
  
  // Add social login event listeners
  document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const provider = btn.textContent.trim().toLowerCase();
      handleSocialLogin(provider);
    });
  });
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoginForm;
}
