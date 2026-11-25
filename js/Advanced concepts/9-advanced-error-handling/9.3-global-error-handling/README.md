# **9.3 Global Error Handling**

Global error handling provides a safety net for uncaught errors and unhandled promise rejections. It's essential for maintaining application stability and gathering error information in production environments.

## Browser Global Error Handling

### window.onerror Event Handler

```javascript
// Basic global error handler
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global error caught:', {
    message,
    source,
    line: lineno,
    column: colno,
    error: error ? error.stack : 'No error object'
  });
  
  // Send error to logging service
  logErrorToService({
    type: 'javascript-error',
    message,
    source,
    line: lineno,
    column: colno,
    stack: error ? error.stack : null,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString()
  });
  
  // Return true to prevent default browser error handling
  return true;
};

// Enhanced global error handler
class GlobalErrorHandler {
  constructor(options = {}) {
    this.options = {
      logToConsole: true,
      sendToService: true,
      maxErrors: 50, // Prevent error spam
      serviceUrl: '/api/errors',
      ...options
    };
    
    this.errorCount = 0;
    this.errorCache = new Set(); // Prevent duplicate errors
    
    this.setupErrorHandlers();
  }
  
  setupErrorHandlers() {
    // JavaScript errors
    window.onerror = (message, source, lineno, colno, error) => {
      this.handleError({
        type: 'javascript-error',
        message,
        source,
        lineno,
        colno,
        error,
        stack: error ? error.stack : null
      });
      return true;
    };
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'unhandled-promise-rejection',
        message: event.reason ? event.reason.message : 'Unhandled promise rejection',
        error: event.reason,
        stack: event.reason ? event.reason.stack : null,
        promise: event.promise
      });
      
      // Prevent default browser behavior
      event.preventDefault();
    });
    
    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleError({
          type: 'resource-error',
          message: `Failed to load resource: ${event.target.src || event.target.href}`,
          source: event.target.src || event.target.href,
          element: event.target.tagName
        });
      }
    }, true); // Use capture phase
  }
  
  handleError(errorInfo) {
    // Prevent error spam
    if (this.errorCount >= this.options.maxErrors) {
      return;
    }
    
    // Create error signature to prevent duplicates
    const errorSignature = this.createErrorSignature(errorInfo);
    if (this.errorCache.has(errorSignature)) {
      return;
    }
    
    this.errorCache.add(errorSignature);
    this.errorCount++;
    
    // Enhance error info
    const enhancedError = this.enhanceErrorInfo(errorInfo);
    
    // Log to console if enabled
    if (this.options.logToConsole) {
      console.error('Global error:', enhancedError);
    }
    
    // Send to service if enabled
    if (this.options.sendToService) {
      this.sendErrorToService(enhancedError);
    }
    
    // Trigger custom error handlers
    this.triggerErrorHandlers(enhancedError);
  }
  
  createErrorSignature(errorInfo) {
    return `${errorInfo.type}-${errorInfo.message}-${errorInfo.source}-${errorInfo.lineno}`;
  }
  
  enhanceErrorInfo(errorInfo) {
    return {
      ...errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      sessionId: this.getSessionId(),
      userId: this.getUserId()
    };
  }
  
  async sendErrorToService(errorInfo) {
    try {
      await fetch(this.options.serviceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorInfo)
      });
    } catch (error) {
      console.error('Failed to send error to service:', error);
    }
  }
  
  triggerErrorHandlers(errorInfo) {
    // Custom error handlers can be registered here
    this.customHandlers?.forEach(handler => {
      try {
        handler(errorInfo);
      } catch (error) {
        console.error('Error in custom error handler:', error);
      }
    });
  }
  
  getSessionId() {
    // Implement session ID retrieval
    return sessionStorage.getItem('sessionId') || 'unknown';
  }
  
  getUserId() {
    // Implement user ID retrieval
    return localStorage.getItem('userId') || 'anonymous';
  }
  
  addCustomHandler(handler) {
    if (!this.customHandlers) {
      this.customHandlers = [];
    }
    this.customHandlers.push(handler);
  }
  
  reset() {
    this.errorCount = 0;
    this.errorCache.clear();
  }
}

// Initialize global error handler
const globalErrorHandler = new GlobalErrorHandler({
  maxErrors: 100,
  serviceUrl: '/api/client-errors'
});

// Add custom error handler
globalErrorHandler.addCustomHandler((errorInfo) => {
  if (errorInfo.type === 'unhandled-promise-rejection') {
    // Special handling for promise rejections
    console.warn('Unhandled promise rejection detected');
  }
});
```

### Modern Error Event API

```javascript
// Using the modern error event API
window.addEventListener('error', (event) => {
  const errorInfo = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    stack: event.error ? event.error.stack : null,
    timestamp: new Date().toISOString()
  };
  
  handleGlobalError(errorInfo);
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  const errorInfo = {
    type: 'unhandled-promise-rejection',
    reason: event.reason,
    message: event.reason ? event.reason.message : 'Promise rejected',
    stack: event.reason ? event.reason.stack : null,
    timestamp: new Date().toISOString()
  };
  
  handleGlobalError(errorInfo);
  
  // Optionally prevent the default behavior
  // event.preventDefault();
});

function handleGlobalError(errorInfo) {
  // Centralized error handling logic
  console.error('Global error detected:', errorInfo);
  
  // Send to error tracking service
  if (typeof errorTrackingService !== 'undefined') {
    errorTrackingService.captureError(errorInfo);
  }
  
  // Show user-friendly error message for critical errors
  if (isCriticalError(errorInfo)) {
    showUserErrorNotification('Something went wrong. Please refresh the page.');
  }
}

function isCriticalError(errorInfo) {
  const criticalPatterns = [
    /Cannot read property.*of undefined/,
    /Cannot read properties.*of undefined/,
    /is not a function/,
    /Network Error/
  ];
  
  return criticalPatterns.some(pattern => 
    pattern.test(errorInfo.message || '')
  );
}
```

## Node.js Global Error Handling

### Process-level Error Handling

```javascript
// Node.js global error handlers
class NodeGlobalErrorHandler {
  constructor(options = {}) {
    this.options = {
      exitOnUncaughtException: false,
      exitOnUnhandledRejection: false,
      logToFile: true,
      logFile: 'errors.log',
      ...options
    };
    
    this.setupProcessHandlers();
  }
  
  setupProcessHandlers() {
    // Uncaught exceptions
    process.on('uncaughtException', (error, origin) => {
      this.handleUncaughtException(error, origin);
    });
    
    // Unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.handleUnhandledRejection(reason, promise);
    });
    
    // Warning events
    process.on('warning', (warning) => {
      this.handleWarning(warning);
    });
    
    // Graceful shutdown signals
    process.on('SIGTERM', () => {
      this.handleShutdown('SIGTERM');
    });
    
    process.on('SIGINT', () => {
      this.handleShutdown('SIGINT');
    });
  }
  
  handleUncaughtException(error, origin) {
    const errorInfo = {
      type: 'uncaught-exception',
      message: error.message,
      stack: error.stack,
      origin,
      timestamp: new Date().toISOString(),
      process: {
        pid: process.pid,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
    
    console.error('Uncaught Exception:', errorInfo);
    
    if (this.options.logToFile) {
      this.logToFile(errorInfo);
    }
    
    // Perform cleanup
    this.performCleanup();
    
    if (this.options.exitOnUncaughtException) {
      process.exit(1);
    }
  }
  
  handleUnhandledRejection(reason, promise) {
    const errorInfo = {
      type: 'unhandled-rejection',
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : null,
      promise: promise.toString(),
      timestamp: new Date().toISOString(),
      process: {
        pid: process.pid,
        memory: process.memoryUsage(),
        uptime: process.uptime()
      }
    };
    
    console.error('Unhandled Rejection:', errorInfo);
    
    if (this.options.logToFile) {
      this.logToFile(errorInfo);
    }
    
    if (this.options.exitOnUnhandledRejection) {
      process.exit(1);
    }
  }
  
  handleWarning(warning) {
    const warningInfo = {
      type: 'warning',
      name: warning.name,
      message: warning.message,
      stack: warning.stack,
      timestamp: new Date().toISOString()
    };
    
    console.warn('Process Warning:', warningInfo);
    
    if (this.options.logToFile) {
      this.logToFile(warningInfo);
    }
  }
  
  handleShutdown(signal) {
    console.log(`Received ${signal}, performing graceful shutdown...`);
    
    this.performCleanup();
    
    // Give some time for cleanup
    setTimeout(() => {
      process.exit(0);
    }, 5000);
  }
  
  performCleanup() {
    // Close database connections
    // Stop servers
    // Clean up resources
    console.log('Performing cleanup...');
  }
  
  logToFile(errorInfo) {
    const fs = require('fs');
    const logEntry = JSON.stringify(errorInfo) + '\n';
    
    fs.appendFile(this.options.logFile, logEntry, (err) => {
      if (err) {
        console.error('Failed to write to log file:', err);
      }
    });
  }
}

// Initialize Node.js global error handler
const nodeErrorHandler = new NodeGlobalErrorHandler({
  exitOnUncaughtException: false,
  exitOnUnhandledRejection: false,
  logToFile: true,
  logFile: './logs/errors.log'
});
```

### Express.js Error Handling Middleware

```javascript
// Express.js global error handling middleware
function globalErrorHandler(err, req, res, next) {
  // Log the error
  console.error('Express error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString()
  });
  
  // Determine error type and response
  let statusCode = 500;
  let message = 'Internal Server Error';
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }
  
  // Send error response
  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    }
  });
}

// 404 handler
function notFoundHandler(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
}

// Apply middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);
```

## Error Boundaries for React Applications

```javascript
// React Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }
  
  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
    
    // Send error to logging service
    this.logErrorToService(error, errorInfo);
  }
  
  logErrorToService(error, errorInfo) {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // Send to error tracking service
    fetch('/api/client-errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(errorData)
    }).catch(err => {
      console.error('Failed to log error to service:', err);
    });
  }
  
  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
          {process.env.NODE_ENV === 'development' && (
            <details style={{ whiteSpace: 'pre-wrap' }}>
              <summary>Error Details (Development Only)</summary>
              <p>{this.state.error && this.state.error.toString()}</p>
              <p>{this.state.errorInfo.componentStack}</p>
            </details>
          )}
        </div>
      );
    }
    
    return this.props.children;
  }
}

// Usage
function App() {
  return (
    <ErrorBoundary>
      <Header />
      <MainContent />
      <Footer />
    </ErrorBoundary>
  );
}

// Hook-based error boundary (React 16.8+)
function useErrorHandler() {
  const [error, setError] = React.useState(null);
  
  const resetError = () => setError(null);
  
  const captureError = React.useCallback((error, errorInfo) => {
    setError({ error, errorInfo });
    
    // Log to service
    console.error('Error captured by hook:', error, errorInfo);
  }, []);
  
  React.useEffect(() => {
    if (error) {
      // Handle error
      console.error('Error state updated:', error);
    }
  }, [error]);
  
  return { error, resetError, captureError };
}
```

## Advanced Global Error Handling Patterns

### Error Aggregation and Batching

```javascript
class ErrorAggregator {
  constructor(options = {}) {
    this.options = {
      batchSize: 10,
      flushInterval: 30000, // 30 seconds
      maxRetries: 3,
      ...options
    };
    
    this.errorBatch = [];
    this.flushTimer = null;
    this.retryCount = 0;
    
    this.startFlushTimer();
  }
  
  addError(errorInfo) {
    this.errorBatch.push({
      ...errorInfo,
      id: this.generateErrorId(),
      timestamp: new Date().toISOString()
    });
    
    if (this.errorBatch.length >= this.options.batchSize) {
      this.flush();
    }
  }
  
  async flush() {
    if (this.errorBatch.length === 0) return;
    
    const batch = [...this.errorBatch];
    this.errorBatch = [];
    
    try {
      await this.sendBatch(batch);
      this.retryCount = 0;
    } catch (error) {
      console.error('Failed to send error batch:', error);
      
      if (this.retryCount < this.options.maxRetries) {
        this.retryCount++;
        // Re-add errors to batch for retry
        this.errorBatch.unshift(...batch);
      } else {
        console.error('Max retries exceeded, dropping error batch');
        this.retryCount = 0;
      }
    }
  }
  
  async sendBatch(batch) {
    const response = await fetch('/api/errors/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ errors: batch })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }
  
  generateErrorId() {
    return Math.random().toString(36).substr(2, 9);
  }
  
  startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.options.flushInterval);
  }
  
  stop() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Flush remaining errors
    this.flush();
  }
}

// Initialize error aggregator
const errorAggregator = new ErrorAggregator({
  batchSize: 5,
  flushInterval: 15000
});

// Integrate with global error handler
window.addEventListener('error', (event) => {
  errorAggregator.addError({
    type: 'javascript-error',
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error ? event.error.stack : null
  });
});
```

### Context-Aware Error Handling

```javascript
class ContextualErrorHandler {
  constructor() {
    this.context = new Map();
    this.setupGlobalHandlers();
  }
  
  setContext(key, value) {
    this.context.set(key, value);
  }
  
  getContext() {
    return Object.fromEntries(this.context);
  }
  
  clearContext() {
    this.context.clear();
  }
  
  setupGlobalHandlers() {
    window.addEventListener('error', (event) => {
      this.handleError({
        type: 'javascript-error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        context: this.getContext()
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        type: 'unhandled-promise-rejection',
        reason: event.reason,
        context: this.getContext()
      });
    });
  }
  
  handleError(errorInfo) {
    const enhancedError = {
      ...errorInfo,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      sessionContext: this.getSessionContext()
    };
    
    console.error('Contextual error:', enhancedError);
    
    // Send to error service with context
    this.sendToErrorService(enhancedError);
  }
  
  getSessionContext() {
    return {
      sessionId: sessionStorage.getItem('sessionId'),
      userId: localStorage.getItem('userId'),
      feature: this.context.get('currentFeature'),
      action: this.context.get('currentAction')
    };
  }
  
  async sendToErrorService(errorInfo) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorInfo)
      });
    } catch (error) {
      console.error('Failed to send error to service:', error);
    }
  }
}

// Usage
const contextualErrorHandler = new ContextualErrorHandler();

// Set context when user performs actions
function navigateToFeature(featureName) {
  contextualErrorHandler.setContext('currentFeature', featureName);
  contextualErrorHandler.setContext('currentAction', 'navigate');
  
  // Navigate to feature
  loadFeature(featureName);
}

function performAction(actionName) {
  contextualErrorHandler.setContext('currentAction', actionName);
  
  // Perform action
  executeAction(actionName);
}
```

## Testing Global Error Handling

```javascript
describe('Global Error Handling', () => {
  let originalOnError;
  let originalUnhandledRejection;
  let errorHandler;
  
  beforeEach(() => {
    // Save original handlers
    originalOnError = window.onerror;
    originalUnhandledRejection = window.onunhandledrejection;
    
    // Create test error handler
    errorHandler = new GlobalErrorHandler({
      logToConsole: false,
      sendToService: false
    });
  });
  
  afterEach(() => {
    // Restore original handlers
    window.onerror = originalOnError;
    window.onunhandledrejection = originalUnhandledRejection;
  });
  
  test('should catch JavaScript errors', (done) => {
    errorHandler.addCustomHandler((errorInfo) => {
      expect(errorInfo.type).toBe('javascript-error');
      expect(errorInfo.message).toContain('test error');
      done();
    });
    
    // Trigger a JavaScript error
    setTimeout(() => {
      throw new Error('test error');
    }, 0);
  });
  
  test('should catch unhandled promise rejections', (done) => {
    errorHandler.addCustomHandler((errorInfo) => {
      expect(errorInfo.type).toBe('unhandled-promise-rejection');
      expect(errorInfo.message).toContain('promise rejection');
      done();
    });
    
    // Trigger an unhandled promise rejection
    Promise.reject(new Error('promise rejection'));
  });
  
  test('should prevent duplicate errors', () => {
    const handler = jest.fn();
    errorHandler.addCustomHandler(handler);
    
    // Trigger the same error multiple times
    const error = new Error('duplicate error');
    errorHandler.handleError({
      type: 'test-error',
      message: error.message,
      source: 'test.js',
      lineno: 1
    });
    
    errorHandler.handleError({
      type: 'test-error',
      message: error.message,
      source: 'test.js',
      lineno: 1
    });
    
    expect(handler).toHaveBeenCalledTimes(1);
  });
  
  test('should respect error limits', () => {
    const limitedHandler = new GlobalErrorHandler({
      maxErrors: 2,
      logToConsole: false,
      sendToService: false
    });
    
    const handler = jest.fn();
    limitedHandler.addCustomHandler(handler);
    
    // Trigger more errors than the limit
    for (let i = 0; i < 5; i++) {
      limitedHandler.handleError({
        type: 'test-error',
        message: `error ${i}`,
        source: 'test.js',
        lineno: i
      });
    }
    
    expect(handler).toHaveBeenCalledTimes(2);
  });
});
```

## Best Practices

### Do's

```javascript
// ✅ Set up comprehensive global error handling
const globalErrorHandler = new GlobalErrorHandler({
  maxErrors: 100,
  sendToService: true,
  serviceUrl: '/api/errors'
});

// ✅ Add context to errors
globalErrorHandler.setContext('userId', getCurrentUserId());
globalErrorHandler.setContext('feature', getCurrentFeature());

// ✅ Handle different error types appropriately
window.addEventListener('error', (event) => {
  if (event.target !== window) {
    // Resource loading error
    handleResourceError(event);
  } else {
    // JavaScript error
    handleJavaScriptError(event);
  }
});

// ✅ Implement graceful degradation
function handleCriticalError(error) {
  // Show user-friendly message
  showErrorNotification('Something went wrong. Please try again.');
  
  // Attempt to recover
  attemptRecovery();
}
```

### Don'ts

```javascript
// ❌ Don't ignore global errors
window.onerror = function() {
  // Ignoring errors is bad!
  return true;
};

// ❌ Don't spam error services
window.onerror = function(message, source, lineno, colno, error) {
  // This could send thousands of errors
  fetch('/api/errors', {
    method: 'POST',
    body: JSON.stringify({ message, source, lineno, colno })
  });
};

// ❌ Don't expose sensitive information in error messages
window.onerror = function(message, source, lineno, colno, error) {
  alert(`Error: ${message} at ${source}:${lineno}`); // Exposes file paths
};
```

## Key Takeaways

* **Global error handling** provides a safety net for uncaught errors
* **Use both `window.onerror` and `unhandledrejection`** for comprehensive coverage
* **Implement error batching** to avoid overwhelming error services
* **Add context** to errors for better debugging
* **Prevent error spam** with deduplication and limits
* **Handle different error types** appropriately
* **Test error handling** thoroughly
* **Implement graceful degradation** for critical errors
* **Use error boundaries** in React applications
* **Set up proper logging** and monitoring in production
