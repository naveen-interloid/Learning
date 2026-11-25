# **9.6 Error Recovery Strategies**

Error recovery strategies help applications gracefully handle failures and maintain functionality even when things go wrong.

## Retry Mechanisms

### Basic Retry Implementation

```javascript
class RetryManager {
  static async withRetry(operation, options = {}) {
    const {
      maxRetries = 3,
      delay = 1000,
      backoffMultiplier = 2,
      maxDelay = 30000,
      retryCondition = () => true
    } = options;
    
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries || !retryCondition(error)) {
          throw error;
        }
        
        const currentDelay = Math.min(delay * Math.pow(backoffMultiplier, attempt), maxDelay);
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${currentDelay}ms:`, error.message);
        
        await this.delay(currentDelay);
      }
    }
    
    throw lastError;
  }
  
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage examples
async function fetchWithRetry(url) {
  return RetryManager.withRetry(
    () => fetch(url).then(r => r.json()),
    {
      maxRetries: 3,
      delay: 500,
      retryCondition: (error) => {
        // Only retry on network errors or 5xx responses
        return error.name === 'TypeError' || 
               (error.status >= 500 && error.status < 600);
      }
    }
  );
}

async function saveDataWithRetry(data) {
  return RetryManager.withRetry(
    () => saveToDatabase(data),
    {
      maxRetries: 5,
      delay: 1000,
      backoffMultiplier: 1.5
    }
  );
}
```

### Advanced Retry Patterns

```javascript
class SmartRetryManager {
  constructor() {
    this.failureCounts = new Map();
    this.circuitBreakers = new Map();
  }
  
  async executeWithSmartRetry(operationId, operation, options = {}) {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      jitterRange = 0.1,
      circuitBreakerThreshold = 5
    } = options;
    
    // Check circuit breaker
    if (this.isCircuitOpen(operationId, circuitBreakerThreshold)) {
      throw new Error(`Circuit breaker open for operation: ${operationId}`);
    }
    
    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await operation();
        this.recordSuccess(operationId);
        return result;
      } catch (error) {
        lastError = error;
        this.recordFailure(operationId);
        
        if (attempt === maxRetries) {
          break;
        }
        
        const delay = this.calculateDelay(attempt, baseDelay, jitterRange);
        await this.delay(delay);
      }
    }
    
    throw lastError;
  }
  
  calculateDelay(attempt, baseDelay, jitterRange) {
    const exponentialDelay = baseDelay * Math.pow(2, attempt);
    const jitter = exponentialDelay * jitterRange * (Math.random() - 0.5);
    return exponentialDelay + jitter;
  }
  
  recordSuccess(operationId) {
    this.failureCounts.delete(operationId);
    this.circuitBreakers.delete(operationId);
  }
  
  recordFailure(operationId) {
    const count = (this.failureCounts.get(operationId) || 0) + 1;
    this.failureCounts.set(operationId, count);
  }
  
  isCircuitOpen(operationId, threshold) {
    const failures = this.failureCounts.get(operationId) || 0;
    return failures >= threshold;
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const smartRetry = new SmartRetryManager();

// Usage
async function robustApiCall(endpoint) {
  return smartRetry.executeWithSmartRetry(
    `api-${endpoint}`,
    () => fetch(`/api/${endpoint}`).then(r => r.json()),
    { maxRetries: 3, circuitBreakerThreshold: 5 }
  );
}
```

## Fallback Strategies

### Data Source Fallbacks

```javascript
class DataSourceManager {
  constructor() {
    this.sources = [];
    this.cache = new Map();
  }
  
  addSource(source) {
    this.sources.push(source);
  }
  
  async getData(key, options = {}) {
    const { useCache = true, cacheTimeout = 300000 } = options;
    
    // Check cache first
    if (useCache && this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (Date.now() - cached.timestamp < cacheTimeout) {
        return cached.data;
      }
    }
    
    // Try each data source in order
    for (const [index, source] of this.sources.entries()) {
      try {
        console.log(`Trying data source ${index + 1}: ${source.name}`);
        const data = await source.fetch(key);
        
        // Cache successful result
        if (useCache) {
          this.cache.set(key, {
            data,
            timestamp: Date.now(),
            source: source.name
          });
        }
        
        return data;
      } catch (error) {
        console.warn(`Data source ${source.name} failed:`, error.message);
        
        if (index === this.sources.length - 1) {
          throw new Error('All data sources failed');
        }
      }
    }
  }
}

// Data source implementations
class DatabaseSource {
  constructor() {
    this.name = 'Database';
  }
  
  async fetch(key) {
    const response = await fetch(`/api/db/${key}`);
    if (!response.ok) throw new Error(`Database error: ${response.status}`);
    return response.json();
  }
}

class CacheSource {
  constructor() {
    this.name = 'Redis Cache';
  }
  
  async fetch(key) {
    const response = await fetch(`/api/cache/${key}`);
    if (!response.ok) throw new Error(`Cache error: ${response.status}`);
    return response.json();
  }
}

class StaticSource {
  constructor() {
    this.name = 'Static Fallback';
    this.fallbackData = {
      'user-1': { id: 1, name: 'Default User', email: 'default@example.com' }
    };
  }
  
  async fetch(key) {
    if (this.fallbackData[key]) {
      return this.fallbackData[key];
    }
    throw new Error('No fallback data available');
  }
}

// Setup data sources
const dataManager = new DataSourceManager();
dataManager.addSource(new DatabaseSource());
dataManager.addSource(new CacheSource());
dataManager.addSource(new StaticSource());

// Usage
async function getUser(userId) {
  try {
    return await dataManager.getData(`user-${userId}`);
  } catch (error) {
    console.error('Failed to get user data:', error);
    throw error;
  }
}
```

### Feature Fallbacks

```javascript
class FeatureFallbackManager {
  constructor() {
    this.features = new Map();
    this.fallbacks = new Map();
  }
  
  registerFeature(name, implementation, fallback) {
    this.features.set(name, implementation);
    this.fallbacks.set(name, fallback);
  }
  
  async executeFeature(name, ...args) {
    try {
      const feature = this.features.get(name);
      if (!feature) {
        throw new Error(`Feature ${name} not found`);
      }
      
      return await feature(...args);
    } catch (error) {
      console.warn(`Feature ${name} failed, using fallback:`, error.message);
      
      const fallback = this.fallbacks.get(name);
      if (fallback) {
        return await fallback(...args);
      }
      
      throw new Error(`No fallback available for feature ${name}`);
    }
  }
}

// Feature implementations
const featureManager = new FeatureFallbackManager();

// Advanced search with AI
featureManager.registerFeature(
  'search',
  async (query) => {
    const response = await fetch('/api/ai-search', {
      method: 'POST',
      body: JSON.stringify({ query })
    });
    
    if (!response.ok) {
      throw new Error('AI search service unavailable');
    }
    
    return response.json();
  },
  // Fallback to simple text search
  async (query) => {
    const response = await fetch(`/api/simple-search?q=${encodeURIComponent(query)}`);
    return response.json();
  }
);

// Real-time notifications
featureManager.registerFeature(
  'notifications',
  async (message) => {
    // WebSocket real-time notifications
    if (window.WebSocket && window.notificationSocket) {
      window.notificationSocket.send(JSON.stringify(message));
      return { method: 'websocket', sent: true };
    }
    throw new Error('WebSocket not available');
  },
  // Fallback to polling
  async (message) => {
    await fetch('/api/notifications', {
      method: 'POST',
      body: JSON.stringify(message)
    });
    return { method: 'polling', sent: true };
  }
);

// Usage
async function performSearch(query) {
  return featureManager.executeFeature('search', query);
}

async function sendNotification(message) {
  return featureManager.executeFeature('notifications', message);
}
```

## State Recovery and Cleanup

### Application State Recovery

```javascript
class StateRecoveryManager {
  constructor() {
    this.snapshots = [];
    this.maxSnapshots = 10;
    this.recoveryStrategies = new Map();
  }
  
  takeSnapshot(state, label = 'auto') {
    const snapshot = {
      id: Date.now(),
      label,
      timestamp: new Date().toISOString(),
      state: this.deepClone(state)
    };
    
    this.snapshots.push(snapshot);
    
    // Keep only recent snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots = this.snapshots.slice(-this.maxSnapshots);
    }
    
    return snapshot.id;
  }
  
  recoverToSnapshot(snapshotId) {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }
    
    return this.deepClone(snapshot.state);
  }
  
  recoverToLastKnownGood() {
    if (this.snapshots.length === 0) {
      throw new Error('No snapshots available for recovery');
    }
    
    const lastSnapshot = this.snapshots[this.snapshots.length - 1];
    return this.deepClone(lastSnapshot.state);
  }
  
  registerRecoveryStrategy(errorType, strategy) {
    this.recoveryStrategies.set(errorType, strategy);
  }
  
  async attemptRecovery(error, currentState) {
    const strategy = this.recoveryStrategies.get(error.constructor.name);
    
    if (strategy) {
      try {
        return await strategy(error, currentState, this);
      } catch (recoveryError) {
        console.error('Recovery strategy failed:', recoveryError);
      }
    }
    
    // Default recovery: restore last snapshot
    try {
      return this.recoverToLastKnownGood();
    } catch (snapshotError) {
      console.error('Snapshot recovery failed:', snapshotError);
      throw new Error('Unable to recover application state');
    }
  }
  
  deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }
  
  getSnapshots() {
    return this.snapshots.map(s => ({
      id: s.id,
      label: s.label,
      timestamp: s.timestamp
    }));
  }
}

// Usage example
const stateRecovery = new StateRecoveryManager();

// Register recovery strategies
stateRecovery.registerRecoveryStrategy('ValidationError', async (error, state, manager) => {
  // For validation errors, try to clean invalid data
  const cleanState = { ...state };
  delete cleanState.invalidField;
  return cleanState;
});

stateRecovery.registerRecoveryStrategy('NetworkError', async (error, state, manager) => {
  // For network errors, enable offline mode
  return {
    ...state,
    offlineMode: true,
    lastNetworkError: error.message
  };
});

// Application with state recovery
class RobustApplication {
  constructor() {
    this.state = { user: null, data: [], loading: false };
    this.stateRecovery = new StateRecoveryManager();
  }
  
  async performOperation(operation) {
    // Take snapshot before risky operation
    const snapshotId = this.stateRecovery.takeSnapshot(this.state, 'before-operation');
    
    try {
      this.state = await operation(this.state);
      return this.state;
    } catch (error) {
      console.error('Operation failed:', error);
      
      try {
        // Attempt recovery
        this.state = await this.stateRecovery.attemptRecovery(error, this.state);
        console.log('State recovered successfully');
        return this.state;
      } catch (recoveryError) {
        console.error('Recovery failed:', recoveryError);
        throw recoveryError;
      }
    }
  }
  
  saveCheckpoint(label) {
    return this.stateRecovery.takeSnapshot(this.state, label);
  }
  
  restoreCheckpoint(snapshotId) {
    this.state = this.stateRecovery.recoverToSnapshot(snapshotId);
  }
}
```

## User Experience During Errors

### Graceful Error UI

```javascript
class ErrorUIManager {
  constructor() {
    this.errorContainer = null;
    this.setupErrorContainer();
  }
  
  setupErrorContainer() {
    this.errorContainer = document.createElement('div');
    this.errorContainer.id = 'error-notifications';
    this.errorContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      max-width: 400px;
    `;
    document.body.appendChild(this.errorContainer);
  }
  
  showError(error, options = {}) {
    const {
      type = 'error',
      duration = 5000,
      actions = [],
      recoverable = false
    } = options;
    
    const errorElement = this.createErrorElement(error, type, actions, recoverable);
    this.errorContainer.appendChild(errorElement);
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.removeError(errorElement);
      }, duration);
    }
    
    return errorElement;
  }
  
  createErrorElement(error, type, actions, recoverable) {
    const element = document.createElement('div');
    element.className = `error-notification error-${type}`;
    element.style.cssText = `
      background: ${this.getBackgroundColor(type)};
      color: white;
      padding: 16px;
      margin-bottom: 8px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      animation: slideIn 0.3s ease-out;
    `;
    
    const message = this.getUserFriendlyMessage(error);
    
    element.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="flex: 1;">
          <div style="font-weight: bold; margin-bottom: 4px;">
            ${this.getErrorTitle(type)}
          </div>
          <div style="font-size: 14px; opacity: 0.9;">
            ${message}
          </div>
          ${recoverable ? '<div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">We\'re trying to fix this automatically.</div>' : ''}
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 0; margin-left: 12px;">
          ×
        </button>
      </div>
      ${actions.length > 0 ? this.createActionButtons(actions) : ''}
    `;
    
    return element;
  }
  
  getUserFriendlyMessage(error) {
    const friendlyMessages = {
      'NetworkError': 'Unable to connect to our servers. Please check your internet connection.',
      'ValidationError': 'Please check your input and try again.',
      'AuthenticationError': 'Please log in again to continue.',
      'NotFoundError': 'The requested information could not be found.',
      'ServerError': 'Our servers are experiencing issues. Please try again later.'
    };
    
    return friendlyMessages[error.name] || 'An unexpected error occurred. Please try again.';
  }
  
  getErrorTitle(type) {
    const titles = {
      'error': 'Error',
      'warning': 'Warning',
      'info': 'Information',
      'success': 'Success'
    };
    
    return titles[type] || 'Notification';
  }
  
  getBackgroundColor(type) {
    const colors = {
      'error': '#dc3545',
      'warning': '#ffc107',
      'info': '#17a2b8',
      'success': '#28a745'
    };
    
    return colors[type] || '#6c757d';
  }
  
  createActionButtons(actions) {
    const buttonsHtml = actions.map(action => `
      <button onclick="${action.handler}" 
              style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); 
                     color: white; padding: 6px 12px; margin-right: 8px; border-radius: 3px; 
                     cursor: pointer; font-size: 12px;">
        ${action.label}
      </button>
    `).join('');
    
    return `<div style="margin-top: 12px;">${buttonsHtml}</div>`;
  }
  
  removeError(element) {
    if (element && element.parentNode) {
      element.style.animation = 'slideOut 0.3s ease-in';
      setTimeout(() => {
        element.remove();
      }, 300);
    }
  }
  
  clearAll() {
    this.errorContainer.innerHTML = '';
  }
}

// Usage
const errorUI = new ErrorUIManager();

// Show different types of errors
try {
  await riskyOperation();
} catch (error) {
  errorUI.showError(error, {
    type: 'error',
    duration: 0, // Don't auto-remove
    actions: [
      {
        label: 'Retry',
        handler: 'retryOperation()'
      },
      {
        label: 'Report Issue',
        handler: 'reportIssue()'
      }
    ],
    recoverable: true
  });
}
```

## Best Practices

### Do's

```javascript
// ✅ Implement exponential backoff with jitter
const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;

// ✅ Use circuit breakers for external services
if (failureCount > threshold) {
  throw new Error('Circuit breaker open');
}

// ✅ Provide meaningful fallbacks
const data = await primarySource().catch(() => fallbackSource());

// ✅ Show user-friendly error messages
errorUI.showError(error, { 
  message: 'Unable to save your changes. Trying again...',
  recoverable: true 
});
```

### Don'ts

```javascript
// ❌ Don't retry indefinitely
while (true) {
  try {
    await operation();
    break;
  } catch (error) {
    // This could loop forever!
  }
}

// ❌ Don't ignore recovery failures
try {
  await operation();
} catch (error) {
  recover(); // What if recovery fails?
}
```

## Key Takeaways

* **Implement smart retry logic** with exponential backoff and jitter
* **Use circuit breakers** to prevent cascading failures
* **Provide meaningful fallbacks** for critical functionality
* **Take state snapshots** before risky operations
* **Show user-friendly error messages** and recovery options
* **Test recovery scenarios** thoroughly
* **Monitor recovery success rates** and adjust strategies
* **Design for graceful degradation** rather than complete failure
