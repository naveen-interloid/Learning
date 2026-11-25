# **9.1 Custom Error Types**

Creating custom error types allows for more precise error handling, better debugging, and cleaner code organization. Custom errors provide context-specific information and enable different handling strategies for different error types.

## Basic Custom Error Creation

### Extending the Error Class

```javascript
// Basic custom error
class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CustomError';
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomError);
    }
  }
}

// Usage
function riskyOperation() {
  throw new CustomError('Something went wrong in riskyOperation');
}

try {
  riskyOperation();
} catch (error) {
  if (error instanceof CustomError) {
    console.log('Caught custom error:', error.message);
  } else {
    console.log('Caught unknown error:', error);
  }
}
```

### Enhanced Custom Error with Additional Properties

```javascript
class ValidationError extends Error {
  constructor(message, field, value) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.timestamp = new Date().toISOString();
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      field: this.field,
      value: this.value,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

// Usage
function validateEmail(email) {
  if (!email || !email.includes('@')) {
    throw new ValidationError('Invalid email format', 'email', email);
  }
}

try {
  validateEmail('invalid-email');
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`Validation failed for field "${error.field}":`, error.message);
    console.log('Invalid value:', error.value);
    console.log('Error details:', JSON.stringify(error, null, 2));
  }
}
```

## Domain-Specific Error Types

### Network and API Errors

```javascript
class NetworkError extends Error {
  constructor(message, statusCode, url, response = null) {
    super(message);
    this.name = 'NetworkError';
    this.statusCode = statusCode;
    this.url = url;
    this.response = response;
    this.isRetryable = this.determineRetryability(statusCode);
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError);
    }
  }
  
  determineRetryability(statusCode) {
    // 5xx errors are typically retryable, 4xx are not
    return statusCode >= 500 && statusCode < 600;
  }
  
  static fromResponse(response, url) {
    const message = `HTTP ${response.status}: ${response.statusText}`;
    return new NetworkError(message, response.status, url, response);
  }
}

class TimeoutError extends NetworkError {
  constructor(message, url, timeout) {
    super(message, 408, url);
    this.name = 'TimeoutError';
    this.timeout = timeout;
    this.isRetryable = true;
  }
}

// Usage
async function fetchData(url, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw NetworkError.fromResponse(response, url);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new TimeoutError(`Request timed out after ${timeout}ms`, url, timeout);
    }
    
    throw error;
  }
}

// Error handling
async function handleApiCall() {
  try {
    const data = await fetchData('/api/users');
    return data;
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.log('Request timed out, retrying...');
      // Implement retry logic
    } else if (error instanceof NetworkError) {
      if (error.isRetryable) {
        console.log('Server error, will retry');
      } else {
        console.log('Client error, will not retry');
      }
    }
    throw error;
  }
}
```

### Business Logic Errors

```javascript
class BusinessLogicError extends Error {
  constructor(message, code, context = {}) {
    super(message);
    this.name = 'BusinessLogicError';
    this.code = code;
    this.context = context;
    this.severity = 'medium';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BusinessLogicError);
    }
  }
}

class InsufficientFundsError extends BusinessLogicError {
  constructor(requestedAmount, availableAmount, accountId) {
    const message = `Insufficient funds: requested ${requestedAmount}, available ${availableAmount}`;
    super(message, 'INSUFFICIENT_FUNDS', {
      requestedAmount,
      availableAmount,
      accountId
    });
    this.name = 'InsufficientFundsError';
    this.severity = 'high';
  }
}

class AccountNotFoundError extends BusinessLogicError {
  constructor(accountId) {
    super(`Account not found: ${accountId}`, 'ACCOUNT_NOT_FOUND', { accountId });
    this.name = 'AccountNotFoundError';
    this.severity = 'high';
  }
}

class TransactionLimitExceededError extends BusinessLogicError {
  constructor(amount, limit, accountId) {
    const message = `Transaction amount ${amount} exceeds limit ${limit}`;
    super(message, 'TRANSACTION_LIMIT_EXCEEDED', {
      amount,
      limit,
      accountId
    });
    this.name = 'TransactionLimitExceededError';
    this.severity = 'medium';
  }
}

// Usage in business logic
class BankingService {
  async transfer(fromAccountId, toAccountId, amount) {
    try {
      const fromAccount = await this.getAccount(fromAccountId);
      const toAccount = await this.getAccount(toAccountId);
      
      if (!fromAccount) {
        throw new AccountNotFoundError(fromAccountId);
      }
      
      if (!toAccount) {
        throw new AccountNotFoundError(toAccountId);
      }
      
      if (fromAccount.balance < amount) {
        throw new InsufficientFundsError(amount, fromAccount.balance, fromAccountId);
      }
      
      if (amount > fromAccount.dailyLimit) {
        throw new TransactionLimitExceededError(amount, fromAccount.dailyLimit, fromAccountId);
      }
      
      // Perform transfer
      await this.executeTransfer(fromAccount, toAccount, amount);
      
    } catch (error) {
      // Log business logic errors with appropriate severity
      if (error instanceof BusinessLogicError) {
        this.logBusinessError(error);
      }
      throw error;
    }
  }
  
  logBusinessError(error) {
    const logLevel = error.severity === 'high' ? 'error' : 'warn';
    console[logLevel](`Business Logic Error [${error.code}]:`, {
      message: error.message,
      context: error.context,
      severity: error.severity
    });
  }
}
```

## Error Hierarchies and Classification

### Creating Error Hierarchies

```javascript
// Base application error
class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', statusCode = 500) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
    this.isOperational = true; // Distinguishes operational errors from programming errors
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// Client errors (4xx)
class ClientError extends AppError {
  constructor(message, code = 'CLIENT_ERROR', statusCode = 400) {
    super(message, code, statusCode);
    this.name = 'ClientError';
  }
}

// Server errors (5xx)
class ServerError extends AppError {
  constructor(message, code = 'SERVER_ERROR', statusCode = 500) {
    super(message, code, statusCode);
    this.name = 'ServerError';
  }
}

// Specific client errors
class BadRequestError extends ClientError {
  constructor(message, field = null) {
    super(message, 'BAD_REQUEST', 400);
    this.name = 'BadRequestError';
    this.field = field;
  }
}

class UnauthorizedError extends ClientError {
  constructor(message = 'Unauthorized access') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

class ForbiddenError extends ClientError {
  constructor(message = 'Access forbidden') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

class NotFoundError extends ClientError {
  constructor(resource, id = null) {
    const message = id ? `${resource} with id ${id} not found` : `${resource} not found`;
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.resourceId = id;
  }
}

// Specific server errors
class DatabaseError extends ServerError {
  constructor(message, query = null) {
    super(message, 'DATABASE_ERROR', 500);
    this.name = 'DatabaseError';
    this.query = query;
  }
}

class ExternalServiceError extends ServerError {
  constructor(message, service, statusCode = 502) {
    super(message, 'EXTERNAL_SERVICE_ERROR', statusCode);
    this.name = 'ExternalServiceError';
    this.service = service;
  }
}
```

### Error Factory Pattern

```javascript
class ErrorFactory {
  static createError(type, ...args) {
    const errorTypes = {
      'validation': ValidationError,
      'network': NetworkError,
      'timeout': TimeoutError,
      'business': BusinessLogicError,
      'not_found': NotFoundError,
      'unauthorized': UnauthorizedError,
      'forbidden': ForbiddenError,
      'database': DatabaseError,
      'external_service': ExternalServiceError
    };
    
    const ErrorClass = errorTypes[type];
    if (!ErrorClass) {
      throw new Error(`Unknown error type: ${type}`);
    }
    
    return new ErrorClass(...args);
  }
  
  static fromApiResponse(response) {
    const { status, data } = response;
    
    switch (status) {
      case 400:
        return new BadRequestError(data.message, data.field);
      case 401:
        return new UnauthorizedError(data.message);
      case 403:
        return new ForbiddenError(data.message);
      case 404:
        return new NotFoundError(data.resource, data.id);
      case 500:
        return new ServerError(data.message);
      default:
        return new AppError(data.message || 'Unknown error', 'UNKNOWN_ERROR', status);
    }
  }
}

// Usage
try {
  throw ErrorFactory.createError('validation', 'Invalid email', 'email', 'invalid@');
} catch (error) {
  console.log('Error type:', error.constructor.name);
  console.log('Error details:', error);
}
```

## Advanced Error Patterns

### Error Aggregation

```javascript
class AggregateError extends Error {
  constructor(errors, message = 'Multiple errors occurred') {
    super(message);
    this.name = 'AggregateError';
    this.errors = Array.isArray(errors) ? errors : [errors];
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AggregateError);
    }
  }
  
  add(error) {
    this.errors.push(error);
  }
  
  hasErrorOfType(ErrorType) {
    return this.errors.some(error => error instanceof ErrorType);
  }
  
  getErrorsOfType(ErrorType) {
    return this.errors.filter(error => error instanceof ErrorType);
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      errors: this.errors.map(error => ({
        name: error.name,
        message: error.message,
        ...(error.toJSON ? error.toJSON() : {})
      }))
    };
  }
}

// Usage for batch operations
async function processBatch(items, processor) {
  const errors = [];
  const results = [];
  
  for (const [index, item] of items.entries()) {
    try {
      const result = await processor(item);
      results.push({ index, result, success: true });
    } catch (error) {
      errors.push(error);
      results.push({ index, error, success: false });
    }
  }
  
  if (errors.length > 0) {
    throw new AggregateError(errors, `${errors.length} out of ${items.length} items failed`);
  }
  
  return results;
}
```

### Contextual Error Wrapping

```javascript
class ContextualError extends Error {
  constructor(originalError, context, operation) {
    const message = `Error in ${operation}: ${originalError.message}`;
    super(message);
    this.name = 'ContextualError';
    this.originalError = originalError;
    this.context = context;
    this.operation = operation;
    
    // Preserve original stack trace
    this.stack = originalError.stack;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ContextualError);
    }
  }
  
  static wrap(error, context, operation) {
    if (error instanceof ContextualError) {
      // Add to existing context chain
      return new ContextualError(error.originalError, {
        ...error.context,
        ...context,
        previousOperation: error.operation
      }, operation);
    }
    
    return new ContextualError(error, context, operation);
  }
  
  unwrap() {
    return this.originalError;
  }
  
  getRootCause() {
    let error = this;
    while (error instanceof ContextualError) {
      error = error.originalError;
    }
    return error;
  }
}

// Usage
class UserService {
  async getUser(userId) {
    try {
      return await this.database.findUser(userId);
    } catch (error) {
      throw ContextualError.wrap(error, { userId }, 'UserService.getUser');
    }
  }
  
  async getUserWithPosts(userId) {
    try {
      const user = await this.getUser(userId);
      const posts = await this.getPostsForUser(userId);
      return { user, posts };
    } catch (error) {
      throw ContextualError.wrap(error, { userId }, 'UserService.getUserWithPosts');
    }
  }
}
```

## Error Serialization and Deserialization

### JSON Serialization

```javascript
class SerializableError extends Error {
  constructor(message, code, data = {}) {
    super(message);
    this.name = 'SerializableError';
    this.code = code;
    this.data = data;
    this.timestamp = new Date().toISOString();
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SerializableError);
    }
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      data: this.data,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
  
  static fromJSON(json) {
    const error = new SerializableError(json.message, json.code, json.data);
    error.timestamp = json.timestamp;
    error.stack = json.stack;
    return error;
  }
  
  static serialize(error) {
    if (error instanceof SerializableError) {
      return JSON.stringify(error);
    }
    
    // Convert regular errors to serializable format
    const serializable = new SerializableError(
      error.message,
      error.code || 'UNKNOWN_ERROR',
      {
        originalName: error.name,
        originalStack: error.stack
      }
    );
    
    return JSON.stringify(serializable);
  }
  
  static deserialize(jsonString) {
    try {
      const json = JSON.parse(jsonString);
      return SerializableError.fromJSON(json);
    } catch (parseError) {
      throw new SerializableError(
        'Failed to deserialize error',
        'DESERIALIZATION_ERROR',
        { originalString: jsonString, parseError: parseError.message }
      );
    }
  }
}

// Usage for cross-process communication
function sendErrorToWorker(error) {
  const serialized = SerializableError.serialize(error);
  worker.postMessage({ type: 'error', data: serialized });
}

function receiveErrorFromWorker(message) {
  if (message.type === 'error') {
    const error = SerializableError.deserialize(message.data);
    console.error('Worker error:', error);
  }
}
```

## Testing Custom Errors

```javascript
describe('Custom Error Types', () => {
  describe('ValidationError', () => {
    test('should create error with field and value', () => {
      const error = new ValidationError('Invalid email', 'email', 'invalid@');
      
      expect(error).toBeInstanceOf(ValidationError);
      expect(error).toBeInstanceOf(Error);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid email');
      expect(error.field).toBe('email');
      expect(error.value).toBe('invalid@');
      expect(error.timestamp).toBeDefined();
    });
    
    test('should be serializable to JSON', () => {
      const error = new ValidationError('Invalid email', 'email', 'invalid@');
      const json = JSON.stringify(error);
      const parsed = JSON.parse(json);
      
      expect(parsed.name).toBe('ValidationError');
      expect(parsed.message).toBe('Invalid email');
      expect(parsed.field).toBe('email');
      expect(parsed.value).toBe('invalid@');
    });
  });
  
  describe('NetworkError', () => {
    test('should determine retryability correctly', () => {
      const serverError = new NetworkError('Server error', 500, '/api/test');
      const clientError = new NetworkError('Bad request', 400, '/api/test');
      
      expect(serverError.isRetryable).toBe(true);
      expect(clientError.isRetryable).toBe(false);
    });
    
    test('should create from response', () => {
      const mockResponse = {
        status: 404,
        statusText: 'Not Found'
      };
      
      const error = NetworkError.fromResponse(mockResponse, '/api/users/123');
      
      expect(error.statusCode).toBe(404);
      expect(error.url).toBe('/api/users/123');
      expect(error.message).toBe('HTTP 404: Not Found');
    });
  });
  
  describe('AggregateError', () => {
    test('should aggregate multiple errors', () => {
      const error1 = new ValidationError('Error 1', 'field1', 'value1');
      const error2 = new NetworkError('Error 2', 500, '/api/test');
      
      const aggregate = new AggregateError([error1, error2]);
      
      expect(aggregate.errors).toHaveLength(2);
      expect(aggregate.hasErrorOfType(ValidationError)).toBe(true);
      expect(aggregate.hasErrorOfType(NetworkError)).toBe(true);
      expect(aggregate.getErrorsOfType(ValidationError)).toHaveLength(1);
    });
  });
});
```

## Best Practices

### Do's

```javascript
// ✅ Create specific error types for different scenarios
class PaymentProcessingError extends Error {
  constructor(message, paymentId, amount) {
    super(message);
    this.name = 'PaymentProcessingError';
    this.paymentId = paymentId;
    this.amount = amount;
  }
}

// ✅ Include relevant context in errors
throw new ValidationError('Email is required', 'email', null);

// ✅ Use error codes for programmatic handling
class APIError extends Error {
  constructor(message, code, statusCode) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

// ✅ Make errors serializable when needed
class SerializableError extends Error {
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      stack: this.stack
    };
  }
}
```

### Don'ts

```javascript
// ❌ Don't create overly generic errors
class GenericError extends Error {} // Too generic

// ❌ Don't lose original error information
try {
  riskyOperation();
} catch (error) {
  throw new Error('Something went wrong'); // Lost original context
}

// ❌ Don't create errors for control flow
function findUser(id) {
  if (id === 'admin') {
    throw new Error('Admin user'); // Use return values instead
  }
}
```

## Key Takeaways

* **Custom errors** provide better context and enable specific handling
* **Error hierarchies** help organize and categorize different error types
* **Include relevant data** in error objects for debugging and handling
* **Make errors serializable** when they need to cross process boundaries
* **Use error codes** for programmatic error handling
* **Test error scenarios** thoroughly to ensure proper behavior
* **Follow naming conventions** (e.g., suffix with "Error")
* **Preserve stack traces** for better debugging experience
