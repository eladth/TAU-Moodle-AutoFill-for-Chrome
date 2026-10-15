class TAUMoodleAutofiller {
  constructor() {
    this.debugMode = true;
    this.init();
  }

  log(message, data = '') {
    if (this.debugMode) {
      console.log('[TAU Autofiller]', message, data);
    }
  }

  async init() {
    this.log('Initializing TAU Moodle Autofiller for Hebrew forms...');
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.detectAndFill());
    } else {
      this.detectAndFill();
    }

    // Multiple attempts for dynamic content
    setTimeout(() => this.detectAndFill(), 1000);
    setTimeout(() => this.detectAndFill(), 3000);
    setTimeout(() => this.detectAndFill(), 5000);
  }

  async detectAndFill() {
    const credentials = await this.getStoredCredentials();
    if (!credentials || !credentials.id) {
      this.log('No ID stored');
      return;
    }

    this.log('Credentials found:', { 
      hasId: !!credentials.id, 
      hasUsername: !!credentials.username, 
      hasPassword: !!credentials.password 
    });

    if (this.isLoginPage()) {
      this.log('Login page detected');
      this.analyzeHebrewForm();
      this.fillTAULoginForm(credentials);
    }

    this.observeForForms();
  }

  analyzeHebrewForm() {
    this.log('=== TAU HEBREW FORM ANALYSIS ===');
    
    // Find all input fields and their associated labels
    const allInputs = document.querySelectorAll('input');
    this.log('Total input fields found:', allInputs.length);
    
    allInputs.forEach((input, index) => {
      // Look for associated label or placeholder
      let associatedText = '';
      
      // Check placeholder
      if (input.placeholder) {
        associatedText += `placeholder: "${input.placeholder}" `;
      }
      
      // Check surrounding text
      const parent = input.parentElement;
      if (parent) {
        const surroundingText = parent.textContent.trim();
        if (surroundingText && surroundingText !== input.value) {
          associatedText += `surrounding: "${surroundingText}" `;
        }
      }

      this.log(`Input ${index}:`, {
        type: input.type,
        name: input.name,
        id: input.id,
        className: input.className,
        associatedText: associatedText,
        visible: this.isElementVisible(input)
      });
    });
    
    this.log('=== END HEBREW ANALYSIS ===');
  }

  isLoginPage() {
    // More specific login page detection
    const mustHavePassword = document.querySelector('input[type="password"]') !== null;
    
    const hebrewLoginIndicators = [
      'שם משתמש',
      'מספר זהות',
      'סיסמה'
    ];

    const urlIndicators = [
      'login',
      'auth',
      'signin'
    ];

    // Check for Hebrew login text AND password field
    const pageText = document.body.textContent;
    const hasHebrewLoginFields = hebrewLoginIndicators.filter(indicator => 
      pageText.includes(indicator)
    ).length >= 2; // Must have at least 2 login indicators

    // Check URL for login indicators
    const hasLoginUrl = urlIndicators.some(indicator => 
      window.location.href.toLowerCase().includes(indicator)
    );

    // Must have password field AND (Hebrew login text OR login URL)
    const isLogin = mustHavePassword && (hasHebrewLoginFields || hasLoginUrl);
    
    this.log('Login page check:', { 
      mustHavePassword, 
      hasHebrewLoginFields, 
      hasLoginUrl, 
      isLogin,
      currentUrl: window.location.href
    });
    
    return isLogin;
  }

  fillTAULoginForm(credentials) {
    this.log('Attempting to fill TAU Hebrew login form...');

    // Simple approach: find all visible input fields in order
    const allInputs = document.querySelectorAll('input');
    const visibleInputs = [];
    
    for (let i = 0; i < allInputs.length; i++) {
      const input = allInputs[i];
      if (this.isElementVisible(input) && 
          input.type !== 'hidden' && 
          input.type !== 'submit' && 
          input.type !== 'button') {
        visibleInputs.push(input);
      }
    }

    this.log('Found visible inputs:', visibleInputs.length);
    
    // Separate text and password fields
    const textFields = [];
    const passwordFields = [];
    
    for (let i = 0; i < visibleInputs.length; i++) {
      if (visibleInputs[i].type === 'password') {
        passwordFields.push(visibleInputs[i]);
      } else {
        textFields.push(visibleInputs[i]);
      }
    }

    this.log('Text fields:', textFields.length);
    this.log('Password fields:', passwordFields.length);

    let filledFields = 0;

    // TAU form order: שם משתמש (username), מספר זהות (ID), סיסמה (password)
    if (textFields.length >= 2) {
      // First text field: שם משתמש - only fill if username exists
      if (credentials.username) {
        this.log('Filling first field (שם משתמש) with username');
        this.fillField(textFields[0], credentials.username);
        filledFields++;
      } else {
        this.log('No username, leaving first field empty');
      }

      // Second text field: מספר זהות - always fill with ID
      if (credentials.id) {
        this.log('Filling second field (מספר זהות) with ID');
        this.fillField(textFields[1], credentials.id);
        filledFields++;
      }
    } else if (textFields.length === 1) {
      // Only one text field - use ID
      if (credentials.id) {
        this.log('Only one text field found, filling with ID');
        this.fillField(textFields[0], credentials.id);
        filledFields++;
      }
    } else {
      this.log('No text fields found');
    }

    // Fill password field
    if (credentials.password && passwordFields.length > 0) {
      this.log('Filling password field');
      this.fillField(passwordFields[0], credentials.password);
      filledFields++;
    }

    this.log(`📊 Total fields filled: ${filledFields}`);

    // Auto-submit if enabled
    if (credentials.autoSubmit && filledFields > 0) {
      this.log('Auto-submit enabled, submitting in 2 seconds...');
      setTimeout(() => this.submitHebrewForm(), 2000);
    }
  }

  submitHebrewForm() {
    this.log('Attempting to submit Hebrew form...');

    // Look for submit buttons
    const allButtons = document.querySelectorAll('button, input[type="submit"], input[type="button"]');
    
    for (let i = 0; i < allButtons.length; i++) {
      const btn = allButtons[i];
      if (!this.isElementVisible(btn)) continue;
      
      const text = (btn.textContent || btn.value || '').trim();
      if (text.includes('כניסה') || 
          text.includes('התחבר') || 
          text.toLowerCase().includes('login') ||
          text.toLowerCase().includes('submit')) {
        this.log('Submit button found:', text);
        btn.click();
        return;
      }
    }

    // No button found, try form submit
    this.log('No submit button found, trying form.submit()');
    const forms = document.querySelectorAll('form');
    for (let i = 0; i < forms.length; i++) {
      if (forms[i].querySelector('input[type="password"]')) {
        this.log('Submitting form directly...');
        forms[i].submit();
        break;
      }
    }
  }

  isElementVisible(element) {
    if (!element) return false;
    
    try {
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             element.offsetParent !== null &&
             element.offsetWidth > 0 && 
             element.offsetHeight > 0;
    } catch (e) {
      return true; // fallback
    }
  }

  fillField(field, value) {
    if (!field || !value) return;

    this.log(`Filling field with value: "${value.substring(0, 3)}***"`);

    // Clear and focus
    field.value = '';
    field.focus();
    
    // Set value
    field.value = value;

    // Trigger events
    const events = ['input', 'change', 'keyup', 'blur'];
    
    events.forEach(eventType => {
      try {
        const event = new Event(eventType, { bubbles: true, cancelable: true });
        field.dispatchEvent(event);
      } catch (e) {
        // Fallback for older browsers
        try {
          const event = document.createEvent('HTMLEvents');
          event.initEvent(eventType, true, true);
          field.dispatchEvent(event);
        } catch (e2) {
          // Ignore
        }
      }
    });

    // Verify
    setTimeout(() => {
      if (field.value === value) {
        this.log('✅ Field value verified');
      } else {
        this.log('⚠️ Field value not set correctly. Expected:', value, 'Got:', field.value);
        field.value = value;
      }
    }, 100);
  }

  observeForForms() {
    try {
      const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;
        
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if ((node.tagName && (node.tagName.toLowerCase() === 'form' || node.tagName.toLowerCase() === 'input')) || 
                    (node.querySelector && (node.querySelector('form') || node.querySelector('input[type="password"]'))) ||
                    (node.textContent && (node.textContent.includes('סיסמה') || node.textContent.includes('כניסה')))) {
                  shouldCheck = true;
                }
              }
            });
          }
        });

        if (shouldCheck) {
          this.log('Hebrew form content detected, rechecking...');
          setTimeout(() => {
            if (this.isLoginPage()) {
              this.getStoredCredentials().then(credentials => {
                if (credentials) {
                  this.fillTAULoginForm(credentials);
                }
              });
            }
          }, 500);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    } catch (e) {
      this.log('Error setting up observer:', e);
    }
  }

  async getStoredCredentials() {
    return new Promise((resolve) => {
      try {
        if (typeof browser !== 'undefined' && browser.storage) {
          browser.storage.local.get(['tauCredentials'], (result) => {
            resolve(result.tauCredentials);
          });
        } else if (typeof chrome !== 'undefined' && chrome.storage) {
          chrome.storage.local.get(['tauCredentials'], (result) => {
            resolve(result.tauCredentials);
          });
        } else {
          resolve(null);
        }
      } catch (e) {
        this.log('Error getting credentials:', e);
        resolve(null);
      }
    });
  }
}

// Initialize the autofiller
new TAUMoodleAutofiller();