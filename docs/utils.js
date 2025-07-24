/**
 * Environment Detection and Configuration Utilities
 * Provides environment-aware logging and error handling for production readiness
 */

/**
 * Environment detection utility
 */
const Environment = {
  /**
   * Check if running in development environment
   * @returns {boolean} - True if development environment
   */
  isDevelopment() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           window.location.hostname.includes('local') ||
           window.location.port === '3000' ||
           window.location.port === '5173';
  },

  /**
   * Check if running in production environment
   * @returns {boolean} - True if production environment
   */
  isProduction() {
    return !this.isDevelopment();
  },

  /**
   * Get current environment type
   * @returns {string} - 'development' or 'production'
   */
  getType() {
    return this.isDevelopment() ? 'development' : 'production';
  }
};

/**
 * Production-ready logger utility
 */
const Logger = {
  /**
   * Log information (development only)
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments
   */
  info(message, ...args) {
    if (Environment.isDevelopment()) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  /**
   * Log warnings (development only)
   * @param {string} message - Message to log
   * @param {...any} args - Additional arguments
   */
  warn(message, ...args) {
    if (Environment.isDevelopment()) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },

  /**
   * Log errors (always logged but handled differently in production)
   * @param {string} message - Message to log
   * @param {Error} error - Error object
   * @param {...any} args - Additional arguments
   */
  error(message, error = null, ...args) {
    if (Environment.isDevelopment()) {
      console.error(`[ERROR] ${message}`, error, ...args);
    } else {
      // In production, send errors to monitoring service
      this.sendToMonitoring(message, error, ...args);
    }
  },

  /**
   * Send error to monitoring service (placeholder for production)
   * @param {string} message - Error message
   * @param {Error} error - Error object
   * @param {...any} args - Additional arguments
   */
  sendToMonitoring(message, error, ...args) {
    // Placeholder for production error monitoring
    // In a real application, this would send to services like:
    // - Sentry
    // - LogRocket
    // - DataDog
    // - Custom analytics endpoint
    
    try {
      const errorData = {
        message,
        error: error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : null,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        additionalData: args
      };
      
      // Example: Send to monitoring endpoint
      // fetch('/api/monitoring/error', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorData)
      // });
      
    } catch (monitoringError) {
      // Fallback: store in localStorage for later analysis
      const errors = JSON.parse(localStorage.getItem('techstore_errors') || '[]');
      errors.push({
        message,
        timestamp: new Date().toISOString(),
        error: error ? error.message : null
      });
      
      // Keep only last 10 errors to prevent storage overflow
      if (errors.length > 10) {
        errors.splice(0, errors.length - 10);
      }
      
      localStorage.setItem('techstore_errors', JSON.stringify(errors));
    }
  }
};

/**
 * Global error boundary for unhandled errors
 */
class GlobalErrorHandler {
  constructor() {
    this.init();
  }

  init() {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      Logger.error('Unhandled JavaScript Error', event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      if (Environment.isProduction()) {
        this.showUserFriendlyError('An unexpected error occurred. Please refresh the page.');
      }
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      Logger.error('Unhandled Promise Rejection', event.reason);
      
      if (Environment.isProduction()) {
        this.showUserFriendlyError('A network error occurred. Please check your connection and try again.');
      }
      
      // Prevent the default behavior (console error)
      event.preventDefault();
    });

    // Handle network errors
    window.addEventListener('offline', () => {
      this.showUserFriendlyError('You are currently offline. Please check your internet connection.', 'warning');
    });

    window.addEventListener('online', () => {
      this.showUserFriendlyError('Connection restored!', 'success');
    });
  }

  /**
   * Show user-friendly error message
   * @param {string} message - Error message to display
   * @param {string} type - Type of notification (error, warning, success)
   */
  showUserFriendlyError(message, type = 'error') {
    // Use existing ToastNotification if available
    if (typeof ToastNotification !== 'undefined') {
      const toast = new ToastNotification();
      toast.show(message, type, 5000);
    } else {
      // Fallback to browser alert
      if (type === 'error') {
        alert(`Error: ${message}`);
      } else {
        alert(message);
      }
    }
  }

  /**
   * Manually report an error
   * @param {Error} error - Error to report
   * @param {string} context - Context where error occurred
   */
  reportError(error, context = '') {
    Logger.error(`Error in ${context}`, error);
  }
}

/**
 * Performance monitoring utility
 */
const PerformanceMonitor = {
  /**
   * Start timing an operation
   * @param {string} name - Name of the operation
   */
  startTiming(name) {
    if (Environment.isDevelopment()) {
      performance.mark(`${name}-start`);
    }
  },

  /**
   * End timing an operation and log the result
   * @param {string} name - Name of the operation
   */
  endTiming(name) {
    if (Environment.isDevelopment()) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
      
      const measure = performance.getEntriesByName(name)[0];
      Logger.info(`Performance: ${name} took ${measure.duration.toFixed(2)}ms`);
      
      // Clean up marks and measures
      performance.clearMarks(`${name}-start`);
      performance.clearMarks(`${name}-end`);
      performance.clearMeasures(name);
    }
  },

  /**
   * Monitor page load performance
   */
  monitorPageLoad() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          Logger.info('Page Load Performance', {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.navigationStart
          });
        }
      }, 0);
    });
  }
};

// Initialize global error handler and performance monitoring
const errorHandler = new GlobalErrorHandler();
PerformanceMonitor.monitorPageLoad();

// Export utilities for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Environment,
    Logger,
    GlobalErrorHandler,
    PerformanceMonitor
  };
} else {
  // Browser environment - attach to window
  window.TechStoreUtils = {
    Environment,
    Logger,
    GlobalErrorHandler,
    PerformanceMonitor,
    errorHandler
  };
}
