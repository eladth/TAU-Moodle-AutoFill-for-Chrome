document.addEventListener('DOMContentLoaded', function() {
  const idInput = document.getElementById('id');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const autoSubmitCheck = document.getElementById('autoSubmit');
  const saveBtn = document.getElementById('save');
  const clearBtn = document.getElementById('clear');
  const status = document.getElementById('status');

  loadCredentials();

  saveBtn.addEventListener('click', saveCredentials);
  clearBtn.addEventListener('click', clearCredentials);
  
  idInput.addEventListener('input', debounce(autoSave, 1000));

  function loadCredentials() {
    const storage = getStorage();
    if (!storage) return;
    
    storage.local.get(['tauCredentials'], function(result) {
      if (result.tauCredentials) {
        idInput.value = result.tauCredentials.id || '';
        usernameInput.value = result.tauCredentials.username || '';
        passwordInput.value = result.tauCredentials.password || '';
        autoSubmitCheck.checked = result.tauCredentials.autoSubmit || false;
      }
    });
  }

  function saveCredentials() {
    const id = idInput.value.trim();
    
    if (!id) {
      showStatus('Please enter your student ID', 'error');
      return;
    }
    
    if (id.length !== 9 || !/^\d{9}$/.test(id)) {
      showStatus('Student ID must be exactly 9 digits', 'error');
      return;
    }

    const credentials = {
      id: id,
      username: usernameInput.value.trim(),
      password: passwordInput.value.trim(),
      autoSubmit: autoSubmitCheck.checked,
      lastUpdated: new Date().toISOString()
    };

    const storage = getStorage();
    if (!storage) {
      showStatus('Storage not available', 'error');
      return;
    }

    storage.local.set({ tauCredentials: credentials }, function() {
      if (chrome.runtime.lastError) {
        showStatus('Error saving: ' + chrome.runtime.lastError.message, 'error');
      } else {
        showStatus('Settings saved successfully! 🎉', 'success');
      }
    });
  }

  function autoSave() {
    const id = idInput.value.trim();
    if (id && id.length === 9 && /^\d{9}$/.test(id)) {
      saveCredentials();
    }
  }

  function clearCredentials() {
    if (confirm('Are you sure you want to clear all saved data?')) {
      const storage = getStorage();
      if (!storage) return;
      
      storage.local.remove(['tauCredentials'], function() {
        idInput.value = '';
        usernameInput.value = '';
        passwordInput.value = '';
        autoSubmitCheck.checked = false;
        showStatus('All data cleared', 'success');
      });
    }
  }

  function showStatus(message, type) {
    status.textContent = message;
    status.className = 'status ' + type;
    setTimeout(() => {
      status.textContent = '';
      status.className = '';
    }, 4000);
  }

  function getStorage() {
    return (typeof browser !== 'undefined' ? browser : chrome)?.storage;
  }

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
});