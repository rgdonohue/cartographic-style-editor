/**
 * ErrorDisplay - User-facing error notifications
 * Shows dismissible toast notifications for errors and status messages
 */

export class ErrorDisplay {
  /**
   * Initialize ErrorDisplay
   * @param {HTMLElement} container - Container element for error messages
   * @param {AppState} appState - Application state instance
   */
  constructor(container, appState) {
    this.container = container;
    this.appState = appState;
    this.activeToasts = new Map();
    this.autoHideDelay = 5000; // 5 seconds
    
    this._setupEventListeners();
  }

  /**
   * Setup event listeners for error events
   * @private
   */
  _setupEventListeners() {
    // Listen for new errors
    this.appState.on('errorAdded', (error) => {
      this.showError(error);
    });

    // Listen for export/import events
    this.appState.on('exportStarted', (data) => {
      this.showInfo(`Exporting ${data.type.toUpperCase()}...`, { persistent: true });
    });

    this.appState.on('exportCompleted', (data) => {
      this.hideInfo();
      if (data.fallback) {
        this.showWarning(data.message);
      } else {
        this.showSuccess(`${data.type.toUpperCase()} exported successfully`);
      }
    });

    this.appState.on('importStarted', (data) => {
      this.showInfo(`Importing ${data.type.toUpperCase()}...`, { persistent: true });
    });

    this.appState.on('importCompleted', (data) => {
      this.hideInfo();
      this.showSuccess(`Style imported from ${data.filename}`);
    });

    // Listen for loading state changes
    this.appState.on('loadingChanged', (data) => {
      if (data.isLoading) {
        this.showInfo('Loading...', { persistent: true });
      } else {
        this.hideInfo();
      }
    });
  }

  /**
   * Show error message
   * @param {Object|string} error - Error object or message string
   * @param {Object} options - Display options
   */
  showError(error, options = {}) {
    const message = typeof error === 'string' ? error : error.message || 'An error occurred';
    this._showToast(message, 'error', {
      autoHide: true,
      ...options
    });
  }

  /**
   * Show warning message
   * @param {string} message - Warning message
   * @param {Object} options - Display options
   */
  showWarning(message, options = {}) {
    this._showToast(message, 'warning', {
      autoHide: true,
      ...options
    });
  }

  /**
   * Show success message
   * @param {string} message - Success message
   * @param {Object} options - Display options
   */
  showSuccess(message, options = {}) {
    this._showToast(message, 'success', {
      autoHide: true,
      ...options
    });
  }

  /**
   * Show info message
   * @param {string} message - Info message
   * @param {Object} options - Display options
   */
  showInfo(message, options = {}) {
    this._showToast(message, 'info', {
      autoHide: !options.persistent,
      ...options
    });
  }

  /**
   * Hide info messages (for loading states)
   */
  hideInfo() {
    for (const [id, toast] of this.activeToasts) {
      if (toast.type === 'info') {
        this._removeToast(id);
      }
    }
  }

  /**
   * Show toast notification
   * @private
   * @param {string} message - Message to display
   * @param {string} type - Toast type (error, warning, success, info)
   * @param {Object} options - Display options
   */
  _showToast(message, type, options = {}) {
    const id = this._generateToastId();
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `error-toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    
    // Create message content
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    toast.appendChild(messageSpan);

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'close-btn';
    closeBtn.innerHTML = '×';
    closeBtn.setAttribute('aria-label', 'Close notification');
    closeBtn.addEventListener('click', () => {
      this._removeToast(id);
    });
    toast.appendChild(closeBtn);

    // Add keyboard support for close button
    closeBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this._removeToast(id);
      }
    });

    // Show the container if hidden
    this.container.style.display = 'block';
    
    // Add toast to container
    this.container.appendChild(toast);

    // Store toast reference
    this.activeToasts.set(id, {
      element: toast,
      type,
      timestamp: Date.now()
    });

    // Auto-hide if configured
    if (options.autoHide !== false) {
      setTimeout(() => {
        this._removeToast(id);
      }, this.autoHideDelay);
    }

    // Focus management for accessibility
    if (type === 'error') {
      toast.setAttribute('tabindex', '-1');
      toast.focus();
    }

    return id;
  }

  /**
   * Remove toast notification
   * @private
   * @param {string} id - Toast ID
   */
  _removeToast(id) {
    const toast = this.activeToasts.get(id);
    if (toast) {
      // Add fade-out animation
      toast.element.style.opacity = '0';
      toast.element.style.transform = 'translateX(100%)';
      
      setTimeout(() => {
        if (toast.element.parentNode) {
          toast.element.parentNode.removeChild(toast.element);
        }
        this.activeToasts.delete(id);
        
        // Hide container if no more toasts
        if (this.activeToasts.size === 0) {
          this.container.style.display = 'none';
        }
      }, 300); // Animation duration
    }
  }

  /**
   * Generate unique toast ID
   * @private
   * @returns {string} Unique ID
   */
  _generateToastId() {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all toasts
   */
  clearAll() {
    for (const [id] of this.activeToasts) {
      this._removeToast(id);
    }
  }

  /**
   * Show recoverable error with retry option
   * @param {Object} error - Error object
   * @param {Function} retryCallback - Function to call on retry
   */
  showRecoverableError(error, retryCallback) {
    const message = error.message || 'An error occurred';
    const id = this._generateToastId();
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'error-toast toast-error';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    
    // Create message content
    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    toast.appendChild(messageSpan);

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.marginTop = '0.5rem';
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '0.5rem';

    // Create retry button
    const retryBtn = document.createElement('button');
    retryBtn.textContent = 'Retry';
    retryBtn.style.fontSize = '0.8rem';
    retryBtn.style.padding = '0.25rem 0.5rem';
    retryBtn.addEventListener('click', () => {
      this._removeToast(id);
      if (retryCallback) {
        retryCallback();
      }
    });
    buttonContainer.appendChild(retryBtn);

    // Create dismiss button
    const dismissBtn = document.createElement('button');
    dismissBtn.textContent = 'Dismiss';
    dismissBtn.style.fontSize = '0.8rem';
    dismissBtn.style.padding = '0.25rem 0.5rem';
    dismissBtn.addEventListener('click', () => {
      this._removeToast(id);
    });
    buttonContainer.appendChild(dismissBtn);

    toast.appendChild(buttonContainer);

    // Show the container if hidden
    this.container.style.display = 'block';
    
    // Add toast to container
    this.container.appendChild(toast);

    // Store toast reference
    this.activeToasts.set(id, {
      element: toast,
      type: 'error',
      timestamp: Date.now()
    });

    // Focus on retry button for accessibility
    retryBtn.focus();

    return id;
  }

  /**
   * Show network status
   * @param {boolean} isOnline - Network status
   */
  showNetworkStatus(isOnline) {
    if (!isOnline) {
      this.showWarning('You are offline. Some features may not work correctly.', {
        persistent: true
      });
    } else {
      // Remove offline warnings
      for (const [id, toast] of this.activeToasts) {
        if (toast.element.textContent.includes('offline')) {
          this._removeToast(id);
        }
      }
    }
  }

  /**
   * Destroy the component
   */
  destroy() {
    this.clearAll();
    this.appState.off('errorAdded', this.showError);
    this.appState.off('exportStarted', this.showInfo);
    this.appState.off('exportCompleted', this.showSuccess);
    this.appState.off('importStarted', this.showInfo);
    this.appState.off('importCompleted', this.showSuccess);
    this.appState.off('loadingChanged', this.showInfo);
  }
}