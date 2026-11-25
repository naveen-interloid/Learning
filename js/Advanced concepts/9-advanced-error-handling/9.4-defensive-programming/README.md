# **9.4 Defensive Programming Patterns**

Defensive programming involves writing code that anticipates and handles potential failures, invalid inputs, and unexpected conditions. It's about building robust systems that fail gracefully.

## Input Validation and Sanitization

### Basic Input Validation

```javascript
// Type checking and validation
function validateUser(user) {
  const errors = [];
  
  if (!user || typeof user !== 'object') {
    throw new Error('User must be an object');
  }
  
  if (!user.email || typeof user.email !== 'string') {
    errors.push('Email is required and must be a string');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push('Email format is invalid');
  }
  
  if (!user.age || typeof user.age !== 'number' || user.age < 0 || user.age > 150) {
    errors.push('Age must be a number between 0 and 150');
  }
  
  if (errors.length > 0) {
    throw new ValidationError('User validation failed', errors);
  }
  
  return true;
}

// Sanitization functions
function sanitizeString(input, maxLength = 255) {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, ''); // Basic XSS prevention
}

function sanitizeNumber(input, min = -Infinity, max = Infinity) {
  const num = Number(input);
  
  if (isNaN(num)) {
    return 0;
  }
  
  return Math.max(min, Math.min(max, num));
}
```

### Advanced Validation Patterns

```javascript
// Schema-based validation
class Validator {
  static validate(data, schema) {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = data[field];
      
      if (rules.required && (value === undefined || value === null)) {
        errors.push(`${field} is required`);
        continue;
      }
      
      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${field} must be of type ${rules.type}`);
        }
        
        if (rules.min && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        
        if (rules.max && value > rules.max) {
          errors.push(`${field} must be at most ${rules.max}`);
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
        
        if (rules.custom && !rules.custom(value)) {
          errors.push(`${field} failed custom validation`);
        }
      }
    }
    
    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }
    
    return true;
  }
}

// Usage
const userSchema = {
  email: {
    required: true,
    type: 'string',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  age: {
    required: true,
    type: 'number',
    min: 0,
    max: 150
  },
  password: {
    required: true,
    type: 'string',
    custom: (value) => value.length >= 8
  }
};

try {
  Validator.validate(userData, userSchema);
} catch (error) {
  console.error('Validation errors:', error.errors);
}
```

## Fail-Fast vs Fail-Safe Strategies

### Fail-Fast Implementation

```javascript
// Fail-fast: Detect problems early and stop execution
class BankAccount {
  constructor(initialBalance) {
    if (typeof initialBalance !== 'number' || initialBalance < 0) {
      throw new Error('Initial balance must be a non-negative number');
    }
    this.balance = initialBalance;
  }
  
  withdraw(amount) {
    // Fail-fast validation
    if (typeof amount !== 'number') {
      throw new Error('Amount must be a number');
    }
    
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
    
    if (amount > this.balance) {
      throw new Error('Insufficient funds');
    }
    
    this.balance -= amount;
    return this.balance;
  }
}
```

### Fail-Safe Implementation

```javascript
// Fail-safe: Continue operation with degraded functionality
class RobustBankAccount {
  constructor(initialBalance) {
    this.balance = this.sanitizeAmount(initialBalance) || 0;
    this.errors = [];
  }
  
  withdraw(amount) {
    try {
      const sanitizedAmount = this.sanitizeAmount(amount);
      
      if (sanitizedAmount <= 0) {
        this.logError('Invalid withdrawal amount, ignoring request');
        return this.balance;
      }
      
      if (sanitizedAmount > this.balance) {
        this.logError('Insufficient funds, partial withdrawal');
        const availableAmount = this.balance;
        this.balance = 0;
        return availableAmount;
      }
      
      this.balance -= sanitizedAmount;
      return this.balance;
    } catch (error) {
      this.logError(`Withdrawal failed: ${error.message}`);
      return this.balance;
    }
  }
  
  sanitizeAmount(amount) {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return 0;
    }
    return Math.max(0, amount);
  }
  
  logError(message) {
    this.errors.push({
      message,
      timestamp: new Date().toISOString()
    });
  }
  
  getErrors() {
    return [...this.errors];
  }
}
```

## Circuit Breaker Pattern

```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 60000;
    this.monitoringPeriod = options.monitoringPeriod || 10000;
    
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.successCount = 0;
  }
  
  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'HALF_OPEN';
        this.successCount = 0;
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }
    
    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  onSuccess() {
    this.failureCount = 0;
    
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= 3) {
        this.state = 'CLOSED';
      }
    }
  }
  
  onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
  
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime
    };
  }
}

// Usage
const circuitBreaker = new CircuitBreaker({
  failureThreshold: 3,
  resetTimeout: 30000
});

async function callExternalAPI() {
  try {
    return await circuitBreaker.execute(async () => {
      const response = await fetch('/api/external-service');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    });
  } catch (error) {
    console.error('API call failed:', error.message);
    return getDefaultData();
  }
}
```

## Graceful Degradation

```javascript
// Feature detection and graceful degradation
class FeatureManager {
  constructor() {
    this.features = new Map();
    this.detectFeatures();
  }
  
  detectFeatures() {
    // Detect browser capabilities
    this.features.set('localStorage', this.hasLocalStorage());
    this.features.set('webWorkers', this.hasWebWorkers());
    this.features.set('fetch', this.hasFetch());
    this.features.set('webGL', this.hasWebGL());
  }
  
  hasLocalStorage() {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  hasWebWorkers() {
    return typeof Worker !== 'undefined';
  }
  
  hasFetch() {
    return typeof fetch !== 'undefined';
  }
  
  hasWebGL() {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (error) {
      return false;
    }
  }
  
  isSupported(feature) {
    return this.features.get(feature) || false;
  }
  
  withFallback(feature, primaryAction, fallbackAction) {
    if (this.isSupported(feature)) {
      return primaryAction();
    } else {
      console.warn(`Feature ${feature} not supported, using fallback`);
      return fallbackAction();
    }
  }
}

// Usage
const featureManager = new FeatureManager();

function saveData(data) {
  return featureManager.withFallback(
    'localStorage',
    () => {
      localStorage.setItem('userData', JSON.stringify(data));
      return true;
    },
    () => {
      // Fallback to cookies or server storage
      document.cookie = `userData=${encodeURIComponent(JSON.stringify(data))}`;
      return true;
    }
  );
}

function performHeavyComputation(data) {
  return featureManager.withFallback(
    'webWorkers',
    () => {
      return new Promise((resolve, reject) => {
        const worker = new Worker('computation-worker.js');
        worker.postMessage(data);
        worker.onmessage = (e) => resolve(e.data);
        worker.onerror = reject;
      });
    },
    () => {
      // Fallback to main thread computation
      console.warn('Web Workers not supported, computing on main thread');
      return computeOnMainThread(data);
    }
  );
}
```

## Best Practices

### Do's

```javascript
// ✅ Validate inputs early
function processUser(user) {
  if (!user || typeof user !== 'object') {
    throw new Error('Invalid user object');
  }
  
  // Continue with processing
}

// ✅ Use type checking
function calculateTotal(items) {
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }
  
  return items.reduce((total, item) => {
    if (typeof item.price !== 'number') {
      throw new Error('Item price must be a number');
    }
    return total + item.price;
  }, 0);
}

// ✅ Implement circuit breakers for external services
const apiCircuitBreaker = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000
});
```

### Don'ts

```javascript
// ❌ Don't assume inputs are valid
function badFunction(user) {
  return user.name.toUpperCase(); // Could throw if user or name is undefined
}

// ❌ Don't ignore potential failures
function riskyOperation() {
  const result = JSON.parse(someString); // Could throw
  return result.data; // Could throw if data doesn't exist
}
```

## Key Takeaways

* **Validate inputs** early and thoroughly
* **Choose appropriate strategies** - fail-fast for development, fail-safe for production
* **Implement circuit breakers** for external dependencies
* **Design for graceful degradation** when features aren't available
* **Use type checking** and sanitization
* **Plan for failure scenarios** and provide fallbacks
* **Test edge cases** and error conditions
* **Document assumptions** and constraints
