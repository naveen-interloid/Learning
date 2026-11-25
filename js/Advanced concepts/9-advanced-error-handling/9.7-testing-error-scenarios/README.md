# **9.7 Testing Error Scenarios**

Testing error scenarios is crucial for ensuring your error handling works correctly and your application behaves gracefully under failure conditions.

## Unit Testing Error Conditions

### Basic Error Testing with Jest

```javascript
// Function to test
async function fetchUser(userId) {
  if (!userId) {
    throw new ValidationError('User ID is required');
  }
  
  const response = await fetch(`/api/users/${userId}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new NotFoundError(`User ${userId} not found`);
    }
    throw new NetworkError(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
}

// Test suite
describe('fetchUser Error Handling', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  
  test('should throw ValidationError for missing userId', async () => {
    await expect(fetchUser()).rejects.toThrow(ValidationError);
    await expect(fetchUser()).rejects.toThrow('User ID is required');
  });
  
  test('should throw NotFoundError for 404 response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found'
    });
    
    await expect(fetchUser('123')).rejects.toThrow(NotFoundError);
    await expect(fetchUser('123')).rejects.toThrow('User 123 not found');
  });
  
  test('should throw NetworkError for server errors', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });
    
    await expect(fetchUser('123')).rejects.toThrow(NetworkError);
    await expect(fetchUser('123')).rejects.toThrow('HTTP 500: Internal Server Error');
  });
  
  test('should handle network failures', async () => {
    fetch.mockRejectedValueOnce(new Error('Network failure'));
    
    await expect(fetchUser('123')).rejects.toThrow('Network failure');
  });
  
  test('should return user data on success', async () => {
    const mockUser = { id: '123', name: 'John Doe' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    });
    
    const user = await fetchUser('123');
    expect(user).toEqual(mockUser);
  });
});
```

### Testing Error Recovery

```javascript
// Function with retry logic
async function fetchWithRetry(url, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.json();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }
  
  throw lastError;
}

describe('fetchWithRetry', () => {
  beforeEach(() => {
    fetch.resetMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  test('should succeed on first attempt', async () => {
    const mockData = { success: true };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData
    });
    
    const result = await fetchWithRetry('/api/data');
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  
  test('should retry on failure and eventually succeed', async () => {
    const mockData = { success: true };
    
    // First two calls fail, third succeeds
    fetch
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });
    
    const promise = fetchWithRetry('/api/data', 3);
    
    // Fast-forward through delays
    jest.advanceTimersByTime(3000);
    
    const result = await promise;
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  
  test('should fail after max retries', async () => {
    fetch.mockRejectedValue(new Error('Persistent error'));
    
    const promise = fetchWithRetry('/api/data', 2);
    
    // Fast-forward through delays
    jest.advanceTimersByTime(3000);
    
    await expect(promise).rejects.toThrow('Persistent error');
    expect(fetch).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });
});
```

## Integration Testing with Failures

### Testing Error Boundaries

```javascript
// React Error Boundary testing
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from './ErrorBoundary';

// Component that throws an error
function ThrowError({ shouldThrow }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalError;
  });
  
  test('should render children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('No error')).toBeInTheDocument();
  });
  
  test('should render error UI when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Reload Page')).toBeInTheDocument();
  });
  
  test('should call error logging service', () => {
    const mockLogError = jest.fn();
    
    render(
      <ErrorBoundary onError={mockLogError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(mockLogError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test error'
      }),
      expect.any(Object)
    );
  });
});
```

### API Error Testing

```javascript
// Testing API error handling
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;
    
    if (id === 'network-error') {
      return res.networkError('Network connection failed');
    }
    
    if (id === '404') {
      return res(ctx.status(404), ctx.json({ error: 'User not found' }));
    }
    
    if (id === '500') {
      return res(ctx.status(500), ctx.json({ error: 'Internal server error' }));
    }
    
    return res(ctx.json({ id, name: 'Test User' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API Error Handling Integration', () => {
  test('should handle network errors', async () => {
    await expect(fetchUser('network-error')).rejects.toThrow('Network connection failed');
  });
  
  test('should handle 404 errors', async () => {
    await expect(fetchUser('404')).rejects.toThrow(NotFoundError);
  });
  
  test('should handle server errors', async () => {
    await expect(fetchUser('500')).rejects.toThrow(NetworkError);
  });
  
  test('should handle successful responses', async () => {
    const user = await fetchUser('123');
    expect(user).toEqual({ id: '123', name: 'Test User' });
  });
});
```

## Chaos Engineering Principles

### Fault Injection Testing

```javascript
class FaultInjector {
  constructor() {
    this.faults = new Map();
    this.enabled = false;
  }
  
  enable() {
    this.enabled = true;
  }
  
  disable() {
    this.enabled = false;
  }
  
  addFault(name, condition, fault) {
    this.faults.set(name, { condition, fault });
  }
  
  removeFault(name) {
    this.faults.delete(name);
  }
  
  async inject(operation, context = {}) {
    if (!this.enabled) {
      return operation();
    }
    
    for (const [name, { condition, fault }] of this.faults) {
      if (condition(context)) {
        console.log(`Injecting fault: ${name}`);
        return fault(operation, context);
      }
    }
    
    return operation();
  }
}

// Fault injection examples
const faultInjector = new FaultInjector();

// Network latency fault
faultInjector.addFault(
  'network-latency',
  (context) => context.operation === 'api-call' && Math.random() < 0.1,
  async (operation, context) => {
    await new Promise(resolve => setTimeout(resolve, 5000));
    return operation();
  }
);

// Random failures
faultInjector.addFault(
  'random-failure',
  (context) => Math.random() < 0.05,
  async (operation, context) => {
    throw new Error('Injected random failure');
  }
);

// Memory pressure simulation
faultInjector.addFault(
  'memory-pressure',
  (context) => context.operation === 'data-processing',
  async (operation, context) => {
    // Simulate memory pressure
    const largeArray = new Array(1000000).fill('memory-pressure');
    try {
      return await operation();
    } finally {
      // Clean up
      largeArray.length = 0;
    }
  }
);

// Usage in tests
describe('Chaos Engineering Tests', () => {
  beforeEach(() => {
    faultInjector.enable();
  });
  
  afterEach(() => {
    faultInjector.disable();
  });
  
  test('should handle injected network latency', async () => {
    const operation = jest.fn().mockResolvedValue('success');
    
    const start = Date.now();
    const result = await faultInjector.inject(operation, { operation: 'api-call' });
    const duration = Date.now() - start;
    
    // Should either complete quickly or take ~5 seconds due to latency injection
    expect(duration < 100 || duration > 4900).toBe(true);
  });
  
  test('should handle random failures gracefully', async () => {
    const operation = jest.fn().mockResolvedValue('success');
    
    // Run multiple times to potentially trigger random failure
    const results = await Promise.allSettled(
      Array.from({ length: 100 }, () => 
        faultInjector.inject(operation, { operation: 'test' })
      )
    );
    
    const failures = results.filter(r => r.status === 'rejected');
    const successes = results.filter(r => r.status === 'fulfilled');
    
    // Should have some failures due to random fault injection
    expect(failures.length).toBeGreaterThan(0);
    expect(successes.length).toBeGreaterThan(0);
  });
});
```

### Load Testing with Errors

```javascript
// Simulated load testing with error scenarios
class LoadTester {
  constructor(options = {}) {
    this.concurrency = options.concurrency || 10;
    this.duration = options.duration || 30000;
    this.errorRate = options.errorRate || 0.1;
  }
  
  async runLoadTest(operation, name = 'operation') {
    const startTime = Date.now();
    const results = {
      total: 0,
      successful: 0,
      failed: 0,
      errors: [],
      durations: []
    };
    
    const workers = Array.from({ length: this.concurrency }, () => 
      this.worker(operation, startTime, results)
    );
    
    await Promise.all(workers);
    
    return {
      ...results,
      averageDuration: results.durations.reduce((a, b) => a + b, 0) / results.durations.length,
      errorRate: results.failed / results.total,
      throughput: results.total / (this.duration / 1000)
    };
  }
  
  async worker(operation, startTime, results) {
    while (Date.now() - startTime < this.duration) {
      const operationStart = Date.now();
      
      try {
        // Randomly inject errors
        if (Math.random() < this.errorRate) {
          throw new Error('Simulated load test error');
        }
        
        await operation();
        
        results.successful++;
        results.durations.push(Date.now() - operationStart);
      } catch (error) {
        results.failed++;
        results.errors.push(error.message);
      }
      
      results.total++;
      
      // Small delay between operations
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }
}

// Usage in tests
describe('Load Testing with Errors', () => {
  test('should handle errors under load', async () => {
    const mockOperation = jest.fn().mockImplementation(async () => {
      // Simulate some processing time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      return 'success';
    });
    
    const loadTester = new LoadTester({
      concurrency: 5,
      duration: 5000,
      errorRate: 0.2
    });
    
    const results = await loadTester.runLoadTest(mockOperation, 'test-operation');
    
    expect(results.total).toBeGreaterThan(0);
    expect(results.successful).toBeGreaterThan(0);
    expect(results.failed).toBeGreaterThan(0);
    expect(results.errorRate).toBeCloseTo(0.2, 1);
    
    console.log('Load test results:', results);
  });
});
```

## Error Simulation and Mocking

### Network Error Simulation

```javascript
// Network error simulator
class NetworkSimulator {
  constructor() {
    this.originalFetch = global.fetch;
    this.scenarios = new Map();
  }
  
  addScenario(name, condition, behavior) {
    this.scenarios.set(name, { condition, behavior });
  }
  
  activate() {
    global.fetch = this.mockFetch.bind(this);
  }
  
  deactivate() {
    global.fetch = this.originalFetch;
  }
  
  async mockFetch(url, options = {}) {
    // Check if any scenario applies
    for (const [name, { condition, behavior }] of this.scenarios) {
      if (condition(url, options)) {
        console.log(`Applying network scenario: ${name}`);
        return behavior(url, options, this.originalFetch);
      }
    }
    
    // Default behavior
    return this.originalFetch(url, options);
  }
}

// Network scenarios
const networkSimulator = new NetworkSimulator();

// Slow network
networkSimulator.addScenario(
  'slow-network',
  (url) => url.includes('/api/slow'),
  async (url, options, originalFetch) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    return originalFetch(url, options);
  }
);

// Intermittent failures
networkSimulator.addScenario(
  'intermittent-failure',
  (url) => url.includes('/api/unreliable'),
  async (url, options, originalFetch) => {
    if (Math.random() < 0.3) {
      throw new Error('Network timeout');
    }
    return originalFetch(url, options);
  }
);

// Rate limiting
networkSimulator.addScenario(
  'rate-limit',
  (url) => url.includes('/api/limited'),
  async (url, options, originalFetch) => {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' }
    });
  }
);

// Usage in tests
describe('Network Error Simulation', () => {
  beforeEach(() => {
    networkSimulator.activate();
  });
  
  afterEach(() => {
    networkSimulator.deactivate();
  });
  
  test('should handle slow network conditions', async () => {
    const start = Date.now();
    
    try {
      await fetch('/api/slow/data');
    } catch (error) {
      // Expected to be slow
    }
    
    const duration = Date.now() - start;
    expect(duration).toBeGreaterThan(2900);
  });
  
  test('should handle intermittent failures', async () => {
    const results = await Promise.allSettled(
      Array.from({ length: 20 }, () => fetch('/api/unreliable/data'))
    );
    
    const failures = results.filter(r => r.status === 'rejected');
    const successes = results.filter(r => r.status === 'fulfilled');
    
    // Should have both successes and failures
    expect(failures.length).toBeGreaterThan(0);
    expect(successes.length).toBeGreaterThan(0);
  });
});
```

## Best Practices

### Do's

```javascript
// ✅ Test both success and failure scenarios
test('should handle both success and failure', async () => {
  // Test success
  mockApi.mockResolvedValueOnce({ success: true });
  await expect(operation()).resolves.toBeDefined();
  
  // Test failure
  mockApi.mockRejectedValueOnce(new Error('API error'));
  await expect(operation()).rejects.toThrow('API error');
});

// ✅ Test error recovery mechanisms
test('should retry on failure', async () => {
  mockApi
    .mockRejectedValueOnce(new Error('Temporary failure'))
    .mockResolvedValueOnce({ success: true });
  
  const result = await operationWithRetry();
  expect(result.success).toBe(true);
  expect(mockApi).toHaveBeenCalledTimes(2);
});

// ✅ Use realistic error scenarios
test('should handle network timeout', async () => {
  mockApi.mockImplementation(() => 
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 100)
    )
  );
  
  await expect(operation()).rejects.toThrow('Timeout');
});
```

### Don'ts

```javascript
// ❌ Don't only test happy paths
test('should work correctly', async () => {
  mockApi.mockResolvedValue({ success: true });
  const result = await operation();
  expect(result.success).toBe(true);
  // Missing error scenarios!
});

// ❌ Don't ignore error details
test('should handle errors', async () => {
  mockApi.mockRejectedValue(new Error('Some error'));
  await expect(operation()).rejects.toThrow();
  // Should test specific error types and messages
});
```

## Key Takeaways

* **Test both success and failure scenarios** thoroughly
* **Use realistic error conditions** in your tests
* **Test error recovery mechanisms** like retries and fallbacks
* **Implement chaos engineering** principles for resilience testing
* **Simulate network conditions** and failures
* **Test error boundaries** and global error handlers
* **Use load testing** to identify error patterns under stress
* **Mock external dependencies** to control error scenarios
* **Verify error logging** and monitoring functionality
