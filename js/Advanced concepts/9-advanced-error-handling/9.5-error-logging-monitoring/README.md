# **9.5 Error Logging and Monitoring**

Effective error logging and monitoring are crucial for maintaining application health and quickly identifying issues in production environments.

## Structured Error Logging

### Basic Logging Implementation

```javascript
class Logger {
  constructor(options = {}) {
    this.level = options.level || 'info';
    this.service = options.service || 'app';
    this.version = options.version || '1.0.0';
    this.environment = options.environment || 'development';
  }
  
  log(level, message, meta = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.service,
      version: this.version,
      environment: this.environment,
      ...meta
    };
    
    if (this.shouldLog(level)) {
      console.log(JSON.stringify(logEntry));
      this.sendToService(logEntry);
    }
  }
  
  error(message, error, meta = {}) {
    this.log('error', message, {
      error: {
        name: error?.name,
        message: error?.message,
        stack: error?.stack
      },
      ...meta
    });
  }
  
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }
  
  info(message, meta = {}) {
    this.log('info', message, meta);
  }
  
  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }
  
  shouldLog(level) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    return levels[level] >= levels[this.level];
  }
  
  async sendToService(logEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      console.error('Failed to send log to service:', error);
    }
  }
}

// Usage
const logger = new Logger({
  level: 'info',
  service: 'user-service',
  version: '2.1.0',
  environment: 'production'
});

try {
  processUser(userData);
} catch (error) {
  logger.error('User processing failed', error, {
    userId: userData.id,
    operation: 'processUser'
  });
}
```

### Advanced Error Tracking

```javascript
class ErrorTracker {
  constructor(options = {}) {
    this.apiKey = options.apiKey;
    this.endpoint = options.endpoint || '/api/errors';
    this.batchSize = options.batchSize || 10;
    this.flushInterval = options.flushInterval || 30000;
    
    this.errorQueue = [];
    this.context = {};
    
    this.startBatchProcessor();
    this.setupGlobalHandlers();
  }
  
  captureError(error, context = {}) {
    const errorData = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      name: error.name,
      context: { ...this.context, ...context },
      environment: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      },
      breadcrumbs: this.getBreadcrumbs()
    };
    
    this.errorQueue.push(errorData);
    
    if (this.errorQueue.length >= this.batchSize) {
      this.flush();
    }
  }
  
  setContext(key, value) {
    this.context[key] = value;
  }
  
  addBreadcrumb(message, category = 'default', level = 'info') {
    if (!this.breadcrumbs) {
      this.breadcrumbs = [];
    }
    
    this.breadcrumbs.push({
      timestamp: new Date().toISOString(),
      message,
      category,
      level
    });
    
    // Keep only last 50 breadcrumbs
    if (this.breadcrumbs.length > 50) {
      this.breadcrumbs = this.breadcrumbs.slice(-50);
    }
  }
  
  getBreadcrumbs() {
    return this.breadcrumbs || [];
  }
  
  async flush() {
    if (this.errorQueue.length === 0) return;
    
    const batch = [...this.errorQueue];
    this.errorQueue = [];
    
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({ errors: batch })
      });
    } catch (error) {
      console.error('Failed to send error batch:', error);
      // Re-queue errors for retry
      this.errorQueue.unshift(...batch);
    }
  }
  
  setupGlobalHandlers() {
    window.addEventListener('error', (event) => {
      this.captureError(event.error || new Error(event.message), {
        type: 'javascript-error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError(event.reason, {
        type: 'unhandled-promise-rejection'
      });
    });
  }
  
  startBatchProcessor() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }
  
  generateId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

// Initialize error tracker
const errorTracker = new ErrorTracker({
  apiKey: 'your-api-key',
  endpoint: 'https://api.errortracking.com/errors'
});

// Set user context
errorTracker.setContext('userId', getCurrentUserId());
errorTracker.setContext('feature', 'checkout');

// Add breadcrumbs for user actions
errorTracker.addBreadcrumb('User clicked checkout button', 'user-action');
errorTracker.addBreadcrumb('Payment form loaded', 'navigation');
```

## Performance Monitoring

```javascript
class PerformanceMonitor {
  constructor(options = {}) {
    this.thresholds = {
      slowFunction: 1000, // 1 second
      memoryUsage: 50 * 1024 * 1024, // 50MB
      ...options.thresholds
    };
    
    this.metrics = [];
    this.setupPerformanceObserver();
  }
  
  measureFunction(fn, name) {
    return async (...args) => {
      const startTime = performance.now();
      const startMemory = this.getMemoryUsage();
      
      try {
        const result = await fn(...args);
        const endTime = performance.now();
        const endMemory = this.getMemoryUsage();
        
        const duration = endTime - startTime;
        const memoryDelta = endMemory - startMemory;
        
        this.recordMetric({
          name,
          duration,
          memoryDelta,
          success: true,
          timestamp: new Date().toISOString()
        });
        
        if (duration > this.thresholds.slowFunction) {
          console.warn(`Slow function detected: ${name} took ${duration.toFixed(2)}ms`);
        }
        
        return result;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.recordMetric({
          name,
          duration,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        throw error;
      }
    };
  }
  
  recordMetric(metric) {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }
  
  getMemoryUsage() {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }
  
  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            this.recordMetric({
              name: 'page-load',
              duration: entry.loadEventEnd - entry.loadEventStart,
              type: 'navigation',
              timestamp: new Date().toISOString()
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    }
  }
  
  getMetrics() {
    return {
      total: this.metrics.length,
      successful: this.metrics.filter(m => m.success !== false).length,
      failed: this.metrics.filter(m => m.success === false).length,
      averageDuration: this.calculateAverageDuration(),
      slowFunctions: this.getSlowFunctions()
    };
  }
  
  calculateAverageDuration() {
    if (this.metrics.length === 0) return 0;
    
    const totalDuration = this.metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return totalDuration / this.metrics.length;
  }
  
  getSlowFunctions() {
    return this.metrics
      .filter(m => m.duration > this.thresholds.slowFunction)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);
  }
}

// Usage
const performanceMonitor = new PerformanceMonitor();

// Wrap functions for monitoring
const monitoredFetchUser = performanceMonitor.measureFunction(fetchUser, 'fetchUser');
const monitoredProcessData = performanceMonitor.measureFunction(processData, 'processData');

// Use monitored functions
try {
  const user = await monitoredFetchUser(userId);
  const result = await monitoredProcessData(user);
} catch (error) {
  console.error('Operation failed:', error);
}
```

## Real-time Error Alerting

```javascript
class ErrorAlerting {
  constructor(options = {}) {
    this.rules = options.rules || [];
    this.channels = options.channels || [];
    this.errorCounts = new Map();
    this.alertCooldowns = new Map();
  }
  
  addRule(rule) {
    this.rules.push(rule);
  }
  
  addChannel(channel) {
    this.channels.push(channel);
  }
  
  processError(error) {
    for (const rule of this.rules) {
      if (this.matchesRule(error, rule)) {
        this.handleAlert(error, rule);
      }
    }
  }
  
  matchesRule(error, rule) {
    if (rule.errorType && error.name !== rule.errorType) {
      return false;
    }
    
    if (rule.messagePattern && !rule.messagePattern.test(error.message)) {
      return false;
    }
    
    if (rule.threshold) {
      const key = `${rule.name}-${error.name}`;
      const count = (this.errorCounts.get(key) || 0) + 1;
      this.errorCounts.set(key, count);
      
      return count >= rule.threshold;
    }
    
    return true;
  }
  
  async handleAlert(error, rule) {
    const alertKey = `${rule.name}-${error.name}`;
    const now = Date.now();
    const lastAlert = this.alertCooldowns.get(alertKey);
    
    // Check cooldown period
    if (lastAlert && (now - lastAlert) < (rule.cooldown || 300000)) {
      return;
    }
    
    this.alertCooldowns.set(alertKey, now);
    
    const alertData = {
      rule: rule.name,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString(),
      count: this.errorCounts.get(alertKey) || 1
    };
    
    for (const channel of this.channels) {
      try {
        await channel.send(alertData);
      } catch (channelError) {
        console.error('Failed to send alert:', channelError);
      }
    }
  }
}

// Alert channels
class SlackChannel {
  constructor(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }
  
  async send(alertData) {
    const message = {
      text: `🚨 Error Alert: ${alertData.rule}`,
      attachments: [{
        color: 'danger',
        fields: [
          { title: 'Error', value: alertData.error.name, short: true },
          { title: 'Message', value: alertData.error.message, short: false },
          { title: 'Count', value: alertData.count.toString(), short: true },
          { title: 'Time', value: alertData.timestamp, short: true }
        ]
      }]
    };
    
    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
  }
}

class EmailChannel {
  constructor(apiKey, fromEmail) {
    this.apiKey = apiKey;
    this.fromEmail = fromEmail;
  }
  
  async send(alertData) {
    const emailData = {
      from: this.fromEmail,
      to: 'alerts@company.com',
      subject: `Error Alert: ${alertData.rule}`,
      html: `
        <h2>Error Alert</h2>
        <p><strong>Rule:</strong> ${alertData.rule}</p>
        <p><strong>Error:</strong> ${alertData.error.name}</p>
        <p><strong>Message:</strong> ${alertData.error.message}</p>
        <p><strong>Count:</strong> ${alertData.count}</p>
        <p><strong>Time:</strong> ${alertData.timestamp}</p>
        <pre>${alertData.error.stack}</pre>
      `
    };
    
    await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(emailData)
    });
  }
}

// Setup alerting
const errorAlerting = new ErrorAlerting();

// Add alert rules
errorAlerting.addRule({
  name: 'critical-errors',
  errorType: 'CriticalError',
  threshold: 1,
  cooldown: 300000 // 5 minutes
});

errorAlerting.addRule({
  name: 'high-error-rate',
  threshold: 10,
  cooldown: 600000 // 10 minutes
});

// Add alert channels
errorAlerting.addChannel(new SlackChannel('https://hooks.slack.com/...'));
errorAlerting.addChannel(new EmailChannel('api-key', 'alerts@company.com'));

// Process errors
window.addEventListener('error', (event) => {
  errorAlerting.processError(event.error);
});
```

## Best Practices

### Do's

```javascript
// ✅ Use structured logging
logger.error('Payment processing failed', error, {
  userId: user.id,
  paymentId: payment.id,
  amount: payment.amount,
  operation: 'processPayment'
});

// ✅ Include context and breadcrumbs
errorTracker.addBreadcrumb('User started checkout');
errorTracker.setContext('checkoutStep', 'payment');

// ✅ Monitor performance metrics
const monitoredFunction = performanceMonitor.measureFunction(
  expensiveOperation,
  'expensiveOperation'
);
```

### Don'ts

```javascript
// ❌ Don't log sensitive information
logger.error('Login failed', error, {
  password: user.password, // Never log passwords!
  creditCard: user.creditCard // Never log sensitive data!
});

// ❌ Don't spam logs
for (let i = 0; i < 1000; i++) {
  logger.info(`Processing item ${i}`); // Too verbose!
}
```

## Key Takeaways

* **Use structured logging** with consistent formats
* **Include relevant context** in error logs
* **Implement error tracking** with breadcrumbs
* **Monitor performance metrics** alongside errors
* **Set up real-time alerting** for critical issues
* **Batch error reports** to avoid overwhelming services
* **Never log sensitive information**
* **Use appropriate log levels** for different scenarios
