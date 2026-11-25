# **5. async/await & Error Handling**

### 1️⃣ Understanding async/await

**What is async/await?**
async/await is syntactic sugar over Promises that makes asynchronous code look and behave more like synchronous code.

```javascript
// Promise-based approach
function fetchUserData() {
  return fetch('/api/user')
    .then(response => response.json())
    .then(user => {
      console.log('User:', user);
      return user;
    })
    .catch(error => {
      console.error('Error:', error);
      throw error;
    });
}

// async/await approach
async function fetchUserDataAsync() {
  try {
    const response = await fetch('/api/user');
    const user = await response.json();
    console.log('User:', user);
    return user;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
```

---

### 2️⃣ Basic async/await Syntax

**Async Functions:**
```javascript
// Function declaration
async function myAsyncFunction() {
  return 'Hello, World!';
}

// Function expression
const myAsyncExpression = async function() {
  return 'Hello, World!';
};

// Arrow function
const myAsyncArrow = async () => {
  return 'Hello, World!';
};

// Method in object
const obj = {
  async myMethod() {
    return 'Hello, World!';
  }
};

// Method in class
class MyClass {
  async myMethod() {
    return 'Hello, World!';
  }
}

// All async functions return promises
console.log(myAsyncFunction()); // Promise { 'Hello, World!' }
myAsyncFunction().then(console.log); // 'Hello, World!'
```

**Await Keyword:**
```javascript
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function example() {
  console.log('Start');
  
  // await pauses execution until promise resolves
  await delay(1000);
  console.log('After 1 second');
  
  await delay(1000);
  console.log('After 2 seconds');
  
  return 'Done!';
}

example().then(console.log);
// Output:
// Start
// (1 second delay)
// After 1 second
// (1 second delay)
// After 2 seconds
// Done!
```

---

### 3️⃣ Error Handling with try/catch

**Basic Error Handling:**
```javascript
async function fetchData(url) {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Fetch error:', error.message);
    throw error; // Re-throw if needed
  }
}

// Usage
async function main() {
  try {
    const data = await fetchData('/api/data');
    console.log('Data received:', data);
  } catch (error) {
    console.error('Main error:', error.message);
  }
}
```

**Multiple Error Types:**
```javascript
class NetworkError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'NetworkError';
    this.status = status;
  }
}

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

async function processUserData(userData) {
  try {
    // Validation
    if (!userData.email) {
      throw new ValidationError('Email is required', 'email');
    }
    
    // API call
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new NetworkError('Failed to create user', response.status);
    }
    
    return await response.json();
    
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error(`Validation error in ${error.field}: ${error.message}`);
      // Handle validation error
    } else if (error instanceof NetworkError) {
      console.error(`Network error (${error.status}): ${error.message}`);
      // Handle network error
    } else {
      console.error('Unexpected error:', error);
      // Handle unexpected error
    }
    
    throw error;
  }
}
```

**Nested try/catch:**
```javascript
async function complexOperation() {
  let user, posts, comments;
  
  try {
    // Get user data
    user = await fetchUser(1);
    console.log('User fetched:', user.name);
    
    try {
      // Get user posts
      posts = await fetchUserPosts(user.id);
      console.log(`Found ${posts.length} posts`);
      
      try {
        // Get comments for first post
        if (posts.length > 0) {
          comments = await fetchPostComments(posts[0].id);
          console.log(`Found ${comments.length} comments`);
        }
      } catch (commentError) {
        console.error('Failed to fetch comments:', commentError.message);
        comments = []; // Use empty array as fallback
      }
      
    } catch (postError) {
      console.error('Failed to fetch posts:', postError.message);
      posts = []; // Use empty array as fallback
    }
    
  } catch (userError) {
    console.error('Failed to fetch user:', userError.message);
    throw userError; // Can't continue without user
  }
  
  return { user, posts, comments };
}
```

---

### 4️⃣ Sequential vs Parallel Execution

**Sequential Execution:**
```javascript
async function sequentialExecution() {
  console.time('Sequential');
  
  // These run one after another
  const user = await fetchUser(1);        // 1 second
  const posts = await fetchPosts(1);      // 1 second
  const comments = await fetchComments(1); // 1 second
  
  console.timeEnd('Sequential'); // ~3 seconds
  
  return { user, posts, comments };
}
```

**Parallel Execution:**
```javascript
async function parallelExecution() {
  console.time('Parallel');
  
  // Start all operations simultaneously
  const userPromise = fetchUser(1);
  const postsPromise = fetchPosts(1);
  const commentsPromise = fetchComments(1);
  
  // Wait for all to complete
  const [user, posts, comments] = await Promise.all([
    userPromise,
    postsPromise,
    commentsPromise
  ]);
  
  console.timeEnd('Parallel'); // ~1 second
  
  return { user, posts, comments };
}

// Alternative syntax
async function parallelExecutionAlt() {
  console.time('Parallel Alt');
  
  const [user, posts, comments] = await Promise.all([
    fetchUser(1),
    fetchPosts(1),
    fetchComments(1)
  ]);
  
  console.timeEnd('Parallel Alt'); // ~1 second
  
  return { user, posts, comments };
}
```

**Mixed Sequential and Parallel:**
```javascript
async function mixedExecution() {
  try {
    // First, get user data (required for next steps)
    const user = await fetchUser(1);
    
    // Then fetch posts and profile in parallel
    const [posts, profile] = await Promise.all([
      fetchUserPosts(user.id),
      fetchUserProfile(user.id)
    ]);
    
    // Finally, get comments for the first post (sequential)
    let comments = [];
    if (posts.length > 0) {
      comments = await fetchPostComments(posts[0].id);
    }
    
    return { user, posts, profile, comments };
  } catch (error) {
    console.error('Mixed execution error:', error);
    throw error;
  }
}
```

---

### 5️⃣ Advanced Error Handling Patterns

**Error Recovery:**
```javascript
async function robustDataFetch(primaryUrl, fallbackUrl) {
  try {
    // Try primary source
    return await fetchData(primaryUrl);
  } catch (primaryError) {
    console.warn('Primary source failed:', primaryError.message);
    
    try {
      // Try fallback source
      console.log('Trying fallback source...');
      return await fetchData(fallbackUrl);
    } catch (fallbackError) {
      console.error('Fallback source also failed:', fallbackError.message);
      
      // Both failed, throw combined error
      const combinedError = new Error(
        `Both primary and fallback sources failed. ` +
        `Primary: ${primaryError.message}, ` +
        `Fallback: ${fallbackError.message}`
      );
      throw combinedError;
    }
  }
}
```

**Timeout Handling:**
```javascript
function withTimeout(promise, timeoutMs) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

async function fetchWithTimeout(url, timeoutMs = 5000) {
  try {
    const response = await withTimeout(fetch(url), timeoutMs);
    return await response.json();
  } catch (error) {
    if (error.message.includes('timed out')) {
      console.error('Request timed out');
      // Handle timeout specifically
    } else {
      console.error('Request failed:', error.message);
      // Handle other errors
    }
    throw error;
  }
}
```

**Retry Logic:**
```javascript
async function withRetry(asyncFn, maxRetries = 3, delay = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await asyncFn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw new Error(
          `Failed after ${maxRetries} attempts. Last error: ${error.message}`
        );
      }
      
      console.warn(`Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Exponential backoff
      delay *= 2;
    }
  }
}

// Usage
async function reliableFetch(url) {
  return withRetry(async () => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }, 3, 500);
}
```

---

### 6️⃣ Async Iteration

**for-await-of Loop:**
```javascript
async function* asyncGenerator() {
  for (let i = 1; i <= 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield `Item ${i}`;
  }
}

async function processAsyncIterable() {
  console.log('Starting async iteration...');
  
  for await (const item of asyncGenerator()) {
    console.log('Received:', item);
  }
  
  console.log('Async iteration complete');
}

processAsyncIterable();
```

**Processing Arrays Sequentially:**
```javascript
async function processArraySequentially(items, processor) {
  const results = [];
  
  for (const item of items) {
    try {
      const result = await processor(item);
      results.push(result);
    } catch (error) {
      console.error(`Error processing ${item}:`, error.message);
      results.push(null); // or handle error as needed
    }
  }
  
  return results;
}

// Usage
const urls = [
  'https://api.example.com/data1',
  'https://api.example.com/data2',
  'https://api.example.com/data3'
];

async function fetchUrl(url) {
  const response = await fetch(url);
  return response.json();
}

const results = await processArraySequentially(urls, fetchUrl);
console.log('All results:', results);
```

**Processing Arrays in Parallel with Concurrency Control:**
```javascript
async function processArrayWithConcurrency(items, processor, concurrency = 3) {
  const results = new Array(items.length);
  const executing = [];
  
  for (let i = 0; i < items.length; i++) {
    const promise = processor(items[i], i).then(
      result => {
        results[i] = { success: true, result };
      },
      error => {
        results[i] = { success: false, error: error.message };
      }
    );
    
    executing.push(promise);
    
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }
  
  await Promise.all(executing);
  return results;
}

// Usage
const results = await processArrayWithConcurrency(
  urls,
  async (url, index) => {
    console.log(`Processing ${index}: ${url}`);
    const response = await fetch(url);
    return response.json();
  },
  2 // Max 2 concurrent requests
);
```

---

### 7️⃣ Testing async/await

**Testing with Jest:**
```javascript
// Function to test
async function fetchUserById(id) {
  if (id < 1) {
    throw new Error('Invalid user ID');
  }
  
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error(`User not found: ${response.status}`);
  }
  
  return response.json();
}

// Tests
describe('fetchUserById', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });
  
  test('should fetch user successfully', async () => {
    const mockUser = { id: 1, name: 'John Doe' };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser
    });
    
    const user = await fetchUserById(1);
    
    expect(user).toEqual(mockUser);
    expect(fetch).toHaveBeenCalledWith('/api/users/1');
  });
  
  test('should throw error for invalid ID', async () => {
    await expect(fetchUserById(0))
      .rejects
      .toThrow('Invalid user ID');
  });
  
  test('should throw error for 404 response', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    });
    
    await expect(fetchUserById(999))
      .rejects
      .toThrow('User not found: 404');
  });
  
  test('should handle network errors', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    await expect(fetchUserById(1))
      .rejects
      .toThrow('Network error');
  });
});
```

**Testing Error Handling:**
```javascript
describe('Error Handling', () => {
  test('should handle multiple error types', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock different error scenarios
    const mockFetch = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) });
    
    global.fetch = mockFetch;
    
    // Test network error
    await expect(fetchUserById(1)).rejects.toThrow('Network error');
    
    // Test HTTP error
    await expect(fetchUserById(1)).rejects.toThrow('User not found: 500');
    
    // Test success
    const result = await fetchUserById(1);
    expect(result).toEqual({});
    
    consoleSpy.mockRestore();
  });
});
```

---

### 8️⃣ Performance Considerations

**Avoiding Unnecessary await:**
```javascript
// ❌ Inefficient - unnecessary await
async function inefficient() {
  const result1 = await operation1();
  const result2 = await operation2(); // Doesn't depend on result1
  const result3 = await operation3(); // Doesn't depend on result1 or result2
  
  return [result1, result2, result3];
}

// ✅ Efficient - parallel execution
async function efficient() {
  const [result1, result2, result3] = await Promise.all([
    operation1(),
    operation2(),
    operation3()
  ]);
  
  return [result1, result2, result3];
}
```

**Memory Management:**
```javascript
// ❌ Potential memory leak - holding references
async function memoryLeak() {
  const largeData = await fetchLargeDataset();
  
  // Process data in chunks
  for (let i = 0; i < largeData.length; i += 1000) {
    const chunk = largeData.slice(i, i + 1000);
    await processChunk(chunk);
    // largeData is still in memory!
  }
}

// ✅ Better memory management
async function memoryEfficient() {
  const dataStream = createDataStream();
  
  for await (const chunk of dataStream) {
    await processChunk(chunk);
    // Each chunk can be garbage collected after processing
  }
}
```

---

### 9️⃣ Best Practices

**Do's:**
```javascript
// ✅ Always use try/catch with async/await
async function goodExample() {
  try {
    const result = await riskyOperation();
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// ✅ Use Promise.all for parallel operations
async function parallelOperations() {
  const [user, posts, comments] = await Promise.all([
    fetchUser(),
    fetchPosts(),
    fetchComments()
  ]);
  
  return { user, posts, comments };
}

// ✅ Handle specific error types
async function specificErrorHandling() {
  try {
    return await operation();
  } catch (error) {
    if (error.code === 'NETWORK_ERROR') {
      // Handle network error
    } else if (error.code === 'VALIDATION_ERROR') {
      // Handle validation error
    } else {
      // Handle unknown error
    }
    throw error;
  }
}
```

**Don'ts:**
```javascript
// ❌ Don't forget try/catch
async function badExample() {
  const result = await riskyOperation(); // Unhandled error!
  return result;
}

// ❌ Don't use async/await unnecessarily
async function unnecessary() {
  return await Promise.resolve('value'); // Just return the promise!
}

// Better:
function better() {
  return Promise.resolve('value');
}

// ❌ Don't mix async/await with .then()/.catch()
async function mixed() {
  const result = await operation()
    .then(data => data.value)  // Confusing mix!
    .catch(error => null);
  
  return result;
}

// Better:
async function clean() {
  try {
    const data = await operation();
    return data.value;
  } catch (error) {
    return null;
  }
}
```

---

### 🔟 Key Takeaways

* **async/await** makes asynchronous code more readable
* **Always use try/catch** for error handling
* **Use Promise.all** for parallel operations
* **Sequential vs parallel** execution affects performance
* **Handle specific error types** appropriately
* **Test async functions** with proper mocking
* **Avoid unnecessary await** for better performance
* **async functions always return promises**
* **await can only be used inside async functions**
* **Error handling patterns** are crucial for robust applications
