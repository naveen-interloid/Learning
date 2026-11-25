# **9.2 try...catch...finally with Async Code**

Handling errors in asynchronous JavaScript requires understanding how errors propagate through Promises, async/await, and various async patterns. This section covers comprehensive strategies for robust async error handling.

## Basic Async Error Handling

### try...catch with async/await

```javascript
// Basic async error handling
async function basicAsyncOperation() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Operation failed:', error.message);
    throw error; // Re-throw if needed
  }
}

// Multiple async operations
async function multipleAsyncOperations() {
  try {
    const user = await fetchUser(1);
    const posts = await fetchUserPosts(user.id);
    const comments = await fetchPostComments(posts[0].id);
    
    return { user, posts, comments };
  } catch (error) {
    console.error('Failed to fetch data:', error);
    
    // Handle specific error types
    if (error.name === 'NetworkError') {
      throw new Error('Network connectivity issue');
    } else if (error.name === 'ValidationError') {
      throw new Error('Invalid data received');
    }
    
    throw error;
  }
}
```

### finally Block with Async Operations

```javascript
async function operationWithCleanup() {
  let resource = null;
  
  try {
    resource = await acquireResource();
    const result = await processResource(resource);
    return result;
  } catch (error) {
    console.error('Processing failed:', error);
    throw error;
  } finally {
    // Cleanup always runs, regardless of success or failure
    if (resource) {
      await releaseResource(resource);
      console.log('Resource cleaned up');
    }
  }
}

// Database transaction example
async function performDatabaseTransaction() {
  const transaction = await db.beginTransaction();
  
  try {
    await db.insert('users', userData);
    await db.insert('profiles', profileData);
    await db.insert('preferences', preferencesData);
    
    await transaction.commit();
    console.log('Transaction completed successfully');
  } catch (error) {
    await transaction.rollback();
    console.error('Transaction failed, rolled back:', error);
    throw error;
  } finally {
    await transaction.close();
    console.log('Transaction connection closed');
  }
}
```

## Promise Error Handling

### Promise.catch() vs try...catch

```javascript
// Using Promise.catch()
function promiseCatchExample() {
  return fetch('/api/data')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('Data received:', data);
      return data;
    })
    .catch(error => {
      console.error('Promise chain failed:', error);
      
      // Return fallback data or re-throw
      if (error.message.includes('HTTP 404')) {
        return { fallback: true };
      }
      
      throw error;
    });
}

// Equivalent with async/await
async function asyncAwaitExample() {
  try {
    const response = await fetch('/api/data');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Data received:', data);
    return data;
  } catch (error) {
    console.error('Async operation failed:', error);
    
    if (error.message.includes('HTTP 404')) {
      return { fallback: true };
    }
    
    throw error;
  }
}
```

### Error Propagation in Promise Chains

```javascript
// Error propagation example
function demonstrateErrorPropagation() {
  return Promise.resolve('start')
    .then(value => {
      console.log('Step 1:', value);
      return 'step1-complete';
    })
    .then(value => {
      console.log('Step 2:', value);
      throw new Error('Step 2 failed'); // Error occurs here
    })
    .then(value => {
      // This won't execute due to error above
      console.log('Step 3:', value);
      return 'step3-complete';
    })
    .catch(error => {
      console.error('Caught error:', error.message);
      return 'recovered'; // Recovery value
    })
    .then(value => {
      // This will execute with the recovery value
      console.log('After recovery:', value);
      return value;
    });
}

// Multiple catch blocks for different error types
function multipleErrorHandling() {
  return fetchUserData()
    .catch(NetworkError, error => {
      console.log('Network error, retrying...');
      return retryFetchUserData();
    })
    .catch(ValidationError, error => {
      console.log('Validation error, using default data');
      return getDefaultUserData();
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      throw error;
    });
}
```

## Advanced Async Error Patterns

### Error Boundaries for Async Operations

```javascript
class AsyncErrorBoundary {
  constructor(options = {}) {
    this.retryCount = options.retryCount || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.fallbackValue = options.fallbackValue;
    this.onError = options.onError || console.error;
  }
  
  async execute(asyncOperation, context = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryCount; attempt++) {
      try {
        return await asyncOperation();
      } catch (error) {
        lastError = error;
        
        this.onError(`Attempt ${attempt} failed:`, error, context);
        
        if (attempt < this.retryCount) {
          await this.delay(this.retryDelay * attempt); // Exponential backoff
        }
      }
    }
    
    // All retries failed
    if (this.fallbackValue !== undefined) {
      this.onError('All retries failed, using fallback value', lastError, context);
      return this.fallbackValue;
    }
    
    throw new Error(`Operation failed after ${this.retryCount} attempts: ${lastError.message}`);
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage
const errorBoundary = new AsyncErrorBoundary({
  retryCount: 3,
  retryDelay: 500,
  fallbackValue: null,
  onError: (message, error, context) => {
    console.error(`[${context.operation}] ${message}`, error);
  }
});

async function robustApiCall() {
  return errorBoundary.execute(
    () => fetch('/api/unreliable-endpoint').then(r => r.json()),
    { operation: 'fetchUserData' }
  );
}
```

### Parallel Async Error Handling

```javascript
// Handle errors in parallel operations
async function parallelOperationsWithErrorHandling() {
  const operations = [
    { name: 'users', operation: () => fetchUsers() },
    { name: 'posts', operation: () => fetchPosts() },
    { name: 'comments', operation: () => fetchComments() }
  ];
  
  const results = await Promise.allSettled(
    operations.map(async ({ name, operation }) => {
      try {
        const result = await operation();
        return { name, success: true, data: result };
      } catch (error) {
        return { name, success: false, error: error.message };
      }
    })
  );
  
  const successful = results
    .map(result => result.value)
    .filter(result => result.success);
    
  const failed = results
    .map(result => result.value)
    .filter(result => !result.success);
  
  if (failed.length > 0) {
    console.warn('Some operations failed:', failed);
  }
  
  return {
    successful: successful.reduce((acc, result) => {
      acc[result.name] = result.data;
      return acc;
    }, {}),
    failed: failed.map(result => ({
      operation: result.name,
      error: result.error
    }))
  };
}

// Fail-fast vs fail-safe strategies
async function failFastStrategy() {
  // Fails immediately if any operation fails
  try {
    const [users, posts, comments] = await Promise.all([
      fetchUsers(),
      fetchPosts(),
      fetchComments()
    ]);
    
    return { users, posts, comments };
  } catch (error) {
    console.error('One or more operations failed:', error);
    throw error;
  }
}

async function failSafeStrategy() {
  // Continues even if some operations fail
  const [usersResult, postsResult, commentsResult] = await Promise.allSettled([
    fetchUsers(),
    fetchPosts(),
    fetchComments()
  ]);
  
  return {
    users: usersResult.status === 'fulfilled' ? usersResult.value : [],
    posts: postsResult.status === 'fulfilled' ? postsResult.value : [],
    comments: commentsResult.status === 'fulfilled' ? commentsResult.value : [],
    errors: [usersResult, postsResult, commentsResult]
      .filter(result => result.status === 'rejected')
      .map(result => result.reason)
  };
}
```

### Timeout and Cancellation

```javascript
// Timeout wrapper for async operations
function withTimeout(promise, timeoutMs, timeoutMessage = 'Operation timed out') {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`${timeoutMessage} after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

// Cancellable async operations
class CancellableOperation {
  constructor() {
    this.cancelled = false;
    this.cancelCallbacks = [];
  }
  
  cancel() {
    this.cancelled = true;
    this.cancelCallbacks.forEach(callback => callback());
  }
  
  onCancel(callback) {
    this.cancelCallbacks.push(callback);
  }
  
  async execute(asyncOperation) {
    if (this.cancelled) {
      throw new Error('Operation was cancelled before execution');
    }
    
    try {
      const result = await asyncOperation(this);
      
      if (this.cancelled) {
        throw new Error('Operation was cancelled during execution');
      }
      
      return result;
    } catch (error) {
      if (this.cancelled) {
        throw new Error('Operation was cancelled');
      }
      throw error;
    }
  }
}

// Usage examples
async function timeoutExample() {
  try {
    const data = await withTimeout(
      fetch('/api/slow-endpoint').then(r => r.json()),
      5000,
      'API request timed out'
    );
    return data;
  } catch (error) {
    if (error.message.includes('timed out')) {
      console.log('Request timed out, using cached data');
      return getCachedData();
    }
    throw error;
  }
}

async function cancellableExample() {
  const operation = new CancellableOperation();
  
  // Cancel after 3 seconds
  setTimeout(() => operation.cancel(), 3000);
  
  try {
    const result = await operation.execute(async (op) => {
      const response = await fetch('/api/data');
      
      // Check for cancellation during long operation
      if (op.cancelled) return null;
      
      const data = await response.json();
      return data;
    });
    
    console.log('Operation completed:', result);
  } catch (error) {
    if (error.message.includes('cancelled')) {
      console.log('Operation was cancelled');
    } else {
      console.error('Operation failed:', error);
    }
  }
}
```

## Error Context and Debugging

### Enhanced Error Information

```javascript
class AsyncOperationError extends Error {
  constructor(message, operation, context = {}) {
    super(message);
    this.name = 'AsyncOperationError';
    this.operation = operation;
    this.context = context;
    this.timestamp = new Date().toISOString();
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AsyncOperationError);
    }
  }
  
  static async wrapAsync(asyncOperation, operationName, context = {}) {
    try {
      return await asyncOperation();
    } catch (error) {
      throw new AsyncOperationError(
        `${operationName} failed: ${error.message}`,
        operationName,
        { ...context, originalError: error }
      );
    }
  }
}

// Usage with context
async function fetchUserWithContext(userId) {
  return AsyncOperationError.wrapAsync(
    async () => {
      const response = await fetch(`/api/users/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    },
    'fetchUser',
    { userId, timestamp: Date.now() }
  );
}

// Async operation tracing
class AsyncTracer {
  constructor() {
    this.operations = [];
  }
  
  async trace(operation, name, context = {}) {
    const startTime = Date.now();
    const operationId = Math.random().toString(36).substr(2, 9);
    
    this.operations.push({
      id: operationId,
      name,
      context,
      startTime,
      status: 'running'
    });
    
    try {
      const result = await operation();
      
      this.updateOperation(operationId, {
        status: 'completed',
        endTime: Date.now(),
        duration: Date.now() - startTime
      });
      
      return result;
    } catch (error) {
      this.updateOperation(operationId, {
        status: 'failed',
        endTime: Date.now(),
        duration: Date.now() - startTime,
        error: error.message
      });
      
      throw error;
    }
  }
  
  updateOperation(id, updates) {
    const operation = this.operations.find(op => op.id === id);
    if (operation) {
      Object.assign(operation, updates);
    }
  }
  
  getOperationSummary() {
    return {
      total: this.operations.length,
      completed: this.operations.filter(op => op.status === 'completed').length,
      failed: this.operations.filter(op => op.status === 'failed').length,
      running: this.operations.filter(op => op.status === 'running').length,
      operations: this.operations
    };
  }
}

// Usage
const tracer = new AsyncTracer();

async function tracedOperation() {
  try {
    const users = await tracer.trace(
      () => fetchUsers(),
      'fetchUsers',
      { source: 'database' }
    );
    
    const posts = await tracer.trace(
      () => fetchPosts(),
      'fetchPosts',
      { source: 'api' }
    );
    
    return { users, posts };
  } catch (error) {
    console.error('Operation failed:', error);
    console.log('Operation summary:', tracer.getOperationSummary());
    throw error;
  }
}
```

## Testing Async Error Handling

```javascript
describe('Async Error Handling', () => {
  describe('Basic async/await error handling', () => {
    test('should catch and handle async errors', async () => {
      const mockFetch = jest.fn().mockRejectedValue(new Error('Network error'));
      global.fetch = mockFetch;
      
      await expect(basicAsyncOperation()).rejects.toThrow('Network error');
      expect(mockFetch).toHaveBeenCalledWith('/api/data');
    });
    
    test('should execute finally block even when error occurs', async () => {
      const cleanup = jest.fn();
      
      const operation = async () => {
        try {
          throw new Error('Test error');
        } catch (error) {
          throw error;
        } finally {
          cleanup();
        }
      };
      
      await expect(operation()).rejects.toThrow('Test error');
      expect(cleanup).toHaveBeenCalled();
    });
  });
  
  describe('Promise error handling', () => {
    test('should handle Promise.allSettled results', async () => {
      const promises = [
        Promise.resolve('success'),
        Promise.reject(new Error('failure')),
        Promise.resolve('another success')
      ];
      
      const results = await Promise.allSettled(promises);
      
      expect(results[0].status).toBe('fulfilled');
      expect(results[0].value).toBe('success');
      expect(results[1].status).toBe('rejected');
      expect(results[1].reason.message).toBe('failure');
      expect(results[2].status).toBe('fulfilled');
      expect(results[2].value).toBe('another success');
    });
  });
  
  describe('Timeout handling', () => {
    test('should timeout long-running operations', async () => {
      const slowOperation = new Promise(resolve => {
        setTimeout(() => resolve('slow result'), 2000);
      });
      
      await expect(
        withTimeout(slowOperation, 1000, 'Custom timeout message')
      ).rejects.toThrow('Custom timeout message after 1000ms');
    });
    
    test('should complete fast operations before timeout', async () => {
      const fastOperation = Promise.resolve('fast result');
      
      const result = await withTimeout(fastOperation, 1000);
      expect(result).toBe('fast result');
    });
  });
  
  describe('Error boundary', () => {
    test('should retry failed operations', async () => {
      let attempts = 0;
      const flakyOperation = () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Temporary failure');
        }
        return 'success';
      };
      
      const boundary = new AsyncErrorBoundary({ retryCount: 3 });
      const result = await boundary.execute(flakyOperation);
      
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });
    
    test('should use fallback value when all retries fail', async () => {
      const alwaysFailOperation = () => {
        throw new Error('Always fails');
      };
      
      const boundary = new AsyncErrorBoundary({
        retryCount: 2,
        fallbackValue: 'fallback'
      });
      
      const result = await boundary.execute(alwaysFailOperation);
      expect(result).toBe('fallback');
    });
  });
});
```

## Best Practices

### Do's

```javascript
// ✅ Always handle async errors
async function goodAsyncFunction() {
  try {
    const result = await riskyAsyncOperation();
    return result;
  } catch (error) {
    console.error('Operation failed:', error);
    throw error; // Re-throw if needed
  }
}

// ✅ Use finally for cleanup
async function withProperCleanup() {
  let resource = null;
  try {
    resource = await acquireResource();
    return await processResource(resource);
  } catch (error) {
    console.error('Processing failed:', error);
    throw error;
  } finally {
    if (resource) {
      await releaseResource(resource);
    }
  }
}

// ✅ Handle specific error types differently
async function specificErrorHandling() {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof NetworkError) {
      // Handle network errors
      return await retryOperation();
    } else if (error instanceof ValidationError) {
      // Handle validation errors
      throw new UserFriendlyError('Please check your input');
    }
    throw error;
  }
}
```

### Don'ts

```javascript
// ❌ Don't ignore async errors
async function badAsyncFunction() {
  const result = await riskyAsyncOperation(); // Unhandled error!
  return result;
}

// ❌ Don't mix async/await with .catch() unnecessarily
async function confusingMix() {
  try {
    const result = await operation()
      .catch(error => null); // Confusing mix of patterns
    return result;
  } catch (error) {
    // This catch might never execute
  }
}

// ❌ Don't forget to await in try-catch
async function forgottenAwait() {
  try {
    const promise = asyncOperation(); // Missing await!
    return promise;
  } catch (error) {
    // This won't catch async errors
    console.error(error);
  }
}
```

## Key Takeaways

* **Always handle async errors** with try-catch or .catch()
* **Use finally blocks** for cleanup operations
* **Understand error propagation** in Promise chains
* **Implement retry logic** for transient failures
* **Use timeouts** to prevent hanging operations
* **Handle parallel operations** with appropriate strategies
* **Add context** to errors for better debugging
* **Test error scenarios** thoroughly
* **Choose fail-fast vs fail-safe** strategies based on requirements
* **Use error boundaries** for complex async operations
