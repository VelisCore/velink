// Modern Registration Form Handler
class RegisterForm {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 3;
    this.form = document.getElementById('registerForm');
    this.steps = document.querySelectorAll('.form-step');
    this.progressSteps = document.querySelectorAll('.progress-step');
    this.progressLines = document.querySelectorAll('.progress-line');
    this.nextBtn = document.getElementById('nextBtn');
    this.backBtn = document.getElementById('backBtn');
    this.submitBtn = document.querySelector('button[type="submit"]');
    this.togglePasswordBtn = document.querySelector('.toggle-password');
    this.loadingOverlay = document.getElementById('loadingOverlay');
    this.resendEmailBtn = document.getElementById('resendEmailBtn');
    
    this.passwordStrength = 0;
    this.validationRules = {
      username: {
        minLength: 3,
        maxLength: 20,
        pattern: /^[a-zA-Z0-9_-]+$/,
        reserved: ['admin', 'api', 'www', 'mail', 'root', 'support']
      },
      email: {
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      password: {
        minLength: 8,
        patterns: {
          lowercase: /[a-z]/,
          uppercase: /[A-Z]/,
          number: /[0-9]/,
          special: /[!@#$%^&*(),.?":{}|<>]/
        }
      }
    };
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.setupPasswordToggle();
    this.setupPasswordStrength();
    this.setupFormValidation();
    this.setupUsernameAvailability();
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

    if (this.resendEmailBtn) {
      this.resendEmailBtn.addEventListener('click', () => this.resendVerificationEmail());
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
    const inputs = document.querySelectorAll('input:not([type="checkbox"])');
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

  setupPasswordStrength() {
    const passwordInput = document.getElementById('password');
    const strengthFill = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (passwordInput && strengthFill && strengthText) {
      passwordInput.addEventListener('input', () => {
        const password = passwordInput.value;
        const strength = this.calculatePasswordStrength(password);
        this.updatePasswordStrength(strength, strengthFill, strengthText);
      });
    }
  }

  calculatePasswordStrength(password) {
    if (!password) return { score: 0, text: 'Password strength' };
    
    const rules = this.validationRules.password;
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= rules.minLength) score += 2;
    else feedback.push(`At least ${rules.minLength} characters`);
    
    // Pattern checks
    if (rules.patterns.lowercase.test(password)) score += 1;
    else feedback.push('One lowercase letter');
    
    if (rules.patterns.uppercase.test(password)) score += 1;
    else feedback.push('One uppercase letter');
    
    if (rules.patterns.number.test(password)) score += 1;
    else feedback.push('One number');
    
    if (rules.patterns.special.test(password)) score += 1;
    else feedback.push('One special character');
    
    // Length bonus
    if (password.length >= 12) score += 1;
    if (password.length >= 16) score += 1;
    
    let level, text;
    if (score <= 2) {
      level = 'weak';
      text = 'Weak password';
    } else if (score <= 4) {
      level = 'fair';
      text = 'Fair password';
    } else if (score <= 6) {
      level = 'good';
      text = 'Good password';
    } else {
      level = 'strong';
      text = 'Strong password';
    }
    
    return { score, level, text, feedback };
  }

  updatePasswordStrength(strength, fillElement, textElement) {
    this.passwordStrength = strength.score;
    
    // Update visual indicator
    fillElement.className = `strength-fill ${strength.level}`;
    textElement.textContent = strength.text;
    
    // Update password field validation
    const passwordInput = document.getElementById('password');
    if (strength.score < 4) {
      passwordInput.classList.add('warning');
    } else {
      passwordInput.classList.remove('warning');
    }
  }

  setupFormValidation() {
    // Real-time validation
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordRepeatInput = document.getElementById('password-repeat');

    if (usernameInput) {
      usernameInput.addEventListener('input', debounce(() => {
        this.validateUsername(usernameInput.value);
      }, 300));
    }

    if (emailInput) {
      emailInput.addEventListener('input', debounce(() => {
        this.validateEmail(emailInput.value);
      }, 300));
    }

    if (passwordInput) {
      passwordInput.addEventListener('input', () => {
        this.validatePassword(passwordInput.value);
        // Also validate password repeat if it has a value
        const repeatValue = passwordRepeatInput?.value;
        if (repeatValue) {
          this.validatePasswordRepeat(repeatValue, passwordInput.value);
        }
      });
    }

    if (passwordRepeatInput) {
      passwordRepeatInput.addEventListener('input', () => {
        this.validatePasswordRepeat(passwordRepeatInput.value, passwordInput?.value);
      });
    }
  }

  setupUsernameAvailability() {
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
      usernameInput.addEventListener('input', debounce(async () => {
        const username = usernameInput.value.trim();
        if (username.length >= 3) {
          await this.checkUsernameAvailability(username);
        }
      }, 500));
    }
  }

  async checkUsernameAvailability(username) {
    try {
      const response = await fetch('/api/check-username', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username })
      });
      
      const result = await response.json();
      
      if (!result.available) {
        this.showFieldError('username', 'Username is already taken');
        return false;
      } else {
        this.clearFieldError('username');
        this.showFieldSuccess('username', 'Username is available');
        return true;
      }
    } catch (error) {
      console.error('Username availability check failed:', error);
      return true; // Assume available if check fails
    }
  }

  nextStep() {
    if (this.currentStep < this.totalSteps) {
      // Validate current step
      if (this.validateCurrentStep()) {
        this.currentStep++;
        this.updateStepDisplay();
        this.updateProgressIndicator();
        this.focusFirstInput();
        this.trackStepProgress();
      }
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateStepDisplay();
      this.updateProgressIndicator();
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

  updateProgressIndicator() {
    this.progressSteps.forEach((step, index) => {
      const stepNumber = index + 1;
      
      if (stepNumber < this.currentStep) {
        step.classList.add('completed');
        step.classList.remove('active');
      } else if (stepNumber === this.currentStep) {
        step.classList.add('active');
        step.classList.remove('completed');
      } else {
        step.classList.remove('active', 'completed');
      }
    });

    // Update progress lines
    this.progressLines.forEach((line, index) => {
      if (index + 1 < this.currentStep) {
        line.classList.add('completed');
      } else {
        line.classList.remove('completed');
      }
    });
  }

  validateCurrentStep() {
    if (this.currentStep === 1) {
      const username = document.getElementById('username').value.trim();
      const email = document.getElementById('email').value.trim();
      
      const usernameValid = this.validateUsername(username);
      const emailValid = this.validateEmail(email);
      
      return usernameValid && emailValid;
      
    } else if (this.currentStep === 2) {
      const password = document.getElementById('password').value;
      const passwordRepeat = document.getElementById('password-repeat').value;
      const termsAccepted = document.querySelector('input[name="terms"]').checked;
      
      const passwordValid = this.validatePassword(password);
      const passwordRepeatValid = this.validatePasswordRepeat(passwordRepeat, password);
      const termsValid = this.validateTerms(termsAccepted);
      
      return passwordValid && passwordRepeatValid && termsValid;
    }
    
    return true;
  }

  validateUsername(username) {
    const usernameInput = document.getElementById('username');
    const rules = this.validationRules.username;
    
    if (!username) {
      this.showFieldError('username', 'Username is required');
      return false;
    }
    
    if (username.length < rules.minLength) {
      this.showFieldError('username', `Username must be at least ${rules.minLength} characters`);
      return false;
    }
    
    if (username.length > rules.maxLength) {
      this.showFieldError('username', `Username must be no more than ${rules.maxLength} characters`);
      return false;
    }
    
    if (!rules.pattern.test(username)) {
      this.showFieldError('username', 'Username can only contain letters, numbers, underscores, and hyphens');
      return false;
    }
    
    if (rules.reserved.includes(username.toLowerCase())) {
      this.showFieldError('username', 'This username is reserved');
      return false;
    }
    
    this.clearFieldError('username');
    return true;
  }

  validateEmail(email) {
    const emailInput = document.getElementById('email');
    const rules = this.validationRules.email;
    
    if (!email) {
      this.showFieldError('email', 'Email address is required');
      return false;
    }
    
    if (!rules.pattern.test(email)) {
      this.showFieldError('email', 'Please enter a valid email address');
      return false;
    }
    
    this.clearFieldError('email');
    return true;
  }

  validatePassword(password) {
    const passwordInput = document.getElementById('password');
    const rules = this.validationRules.password;
    
    if (!password) {
      this.showFieldError('password', 'Password is required');
      return false;
    }
    
    if (password.length < rules.minLength) {
      this.showFieldError('password', `Password must be at least ${rules.minLength} characters`);
      return false;
    }
    
    if (this.passwordStrength < 3) {
      this.showFieldError('password', 'Please choose a stronger password');
      return false;
    }
    
    this.clearFieldError('password');
    return true;
  }

  validatePasswordRepeat(passwordRepeat, password) {
    if (!passwordRepeat) {
      this.showFieldError('password-repeat', 'Please confirm your password');
      return false;
    }
    
    if (passwordRepeat !== password) {
      this.showFieldError('password-repeat', 'Passwords do not match');
      return false;
    }
    
    this.clearFieldError('password-repeat');
    return true;
  }

  validateTerms(accepted) {
    if (!accepted) {
      this.showNotification('Please accept the Terms of Service and Privacy Policy', 'error');
      return false;
    }
    return true;
  }

  validateField(input) {
    const value = input.value.trim();
    
    switch (input.id) {
      case 'username':
        return this.validateUsername(value);
      case 'email':
        return this.validateEmail(value);
      case 'password':
        return this.validatePassword(value);
      case 'password-repeat':
        const password = document.getElementById('password')?.value;
        return this.validatePasswordRepeat(value, password);
      default:
        return true;
    }
  }

  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const inputGroup = field.closest('.input-group') || field.closest('.form-group');
    
    // Remove existing error and success
    this.clearFieldError(fieldId);
    this.clearFieldSuccess(fieldId);
    
    // Add error class
    field.classList.add('error');
    
    // Create error message
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.innerHTML = `<i class="bi bi-exclamation-triangle"></i> ${message}`;
    
    inputGroup.appendChild(errorElement);
  }

  showFieldSuccess(fieldId, message) {
    const field = document.getElementById(fieldId);
    const inputGroup = field.closest('.input-group') || field.closest('.form-group');
    
    // Remove existing error and success
    this.clearFieldError(fieldId);
    this.clearFieldSuccess(fieldId);
    
    // Add success class
    field.classList.add('success');
    
    // Create success message
    const successElement = document.createElement('div');
    successElement.className = 'field-success';
    successElement.innerHTML = `<i class="bi bi-check-circle"></i> ${message}`;
    successElement.style.cssText = `
      color: var(--success-500);
      font-size: var(--font-size-xs);
      margin-top: var(--space-1);
      display: flex;
      align-items: center;
      gap: var(--space-1);
    `;
    
    inputGroup.appendChild(successElement);
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

  clearFieldSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    const inputGroup = field.closest('.input-group') || field.closest('.form-group');
    const existingSuccess = inputGroup.querySelector('.field-success');
    
    if (existingSuccess) {
      existingSuccess.remove();
    }
    
    field.classList.remove('success');
  }

  focusFirstInput() {
    const activeStep = document.querySelector('.form-step.active');
    const firstInput = activeStep?.querySelector('input:not([type="checkbox"])');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  async handleSubmit(e) {
    e.preventDefault();
    
    // Validate all fields
    if (!this.validateCurrentStep()) {
      return;
    }
    
    // Show loading state
    this.showLoading(true);
    
    // Track registration attempt
    if (window.cookieManager) {
      window.cookieManager.trackEvent('registration_attempt', {
        method: 'email_password',
        step: 'form_submit'
      });
    }
    
    try {
      // Submit the form
      const formData = new FormData(this.form);
      const response = await fetch('/register', {
        method: 'POST',
        body: formData,
        headers: {
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // Success - move to step 3
        this.currentStep = 3;
        this.updateStepDisplay();
        this.updateProgressIndicator();
        
        // Track successful registration
        if (window.cookieManager) {
          window.cookieManager.trackEvent('registration_success', {
            method: 'email_password'
          });
        }
        
      } else {
        // Error
        this.showNotification(result.message || 'Registration failed. Please try again.', 'error');
        
        // Track failed registration
        if (window.cookieManager) {
          window.cookieManager.trackEvent('registration_failed', {
            method: 'email_password',
            error: result.message || 'unknown_error'
          });
        }
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      this.showNotification('Network error. Please try again.', 'error');
      
      // Track network error
      if (window.cookieManager) {
        window.cookieManager.trackError('registration_network_error', '/register');
      }
    } finally {
      this.showLoading(false);
    }
  }

  async resendVerificationEmail() {
    const email = document.getElementById('email')?.value;
    if (!email) return;

    try {
      this.resendEmailBtn.disabled = true;
      this.resendEmailBtn.textContent = 'Sending...';

      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      
      if (result.success) {
        this.showNotification('Verification email sent successfully!', 'success');
        
        // Disable button for 60 seconds
        let countdown = 60;
        const interval = setInterval(() => {
          this.resendEmailBtn.textContent = `Resend in ${countdown}s`;
          countdown--;
          
          if (countdown < 0) {
            clearInterval(interval);
            this.resendEmailBtn.disabled = false;
            this.resendEmailBtn.textContent = 'Resend Verification Email';
          }
        }, 1000);
        
      } else {
        this.showNotification(result.message || 'Failed to resend email', 'error');
        this.resendEmailBtn.disabled = false;
        this.resendEmailBtn.textContent = 'Resend Verification Email';
      }
      
    } catch (error) {
      console.error('Resend email error:', error);
      this.showNotification('Failed to resend email', 'error');
      this.resendEmailBtn.disabled = false;
      this.resendEmailBtn.textContent = 'Resend Verification Email';
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
      window.cookieManager.trackEvent('registration_step_progress', {
        step: this.currentStep,
        total_steps: this.totalSteps
      });
    }
  }
}

// Utility function for debouncing
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Social registration handlers
function handleSocialRegister(provider) {
  if (window.cookieManager) {
    window.cookieManager.trackEvent('registration_attempt', {
      method: provider,
      step: 'social_click'
    });
  }
  
  // Implement social registration logic here
  console.log(`Social registration with ${provider} clicked`);
  
  // For now, show a message
  if (window.registerForm) {
    window.registerForm.showNotification(`${provider} registration coming soon!`, 'info');
  }
}

// Add CSS for success state
const style = document.createElement('style');
style.textContent = `
  .input-group input.success {
    border-color: var(--success-500);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }
  
  .input-group input.warning {
    border-color: var(--warning-500);
    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
  }
  
  .field-success {
    animation: fadeInUp 0.2s ease-out;
  }
`;
document.head.appendChild(style);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.registerForm = new RegisterForm();
  
  // Add social registration event listeners
  document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const provider = btn.textContent.trim().toLowerCase();
      handleSocialRegister(provider);
    });
  });
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RegisterForm;
}
