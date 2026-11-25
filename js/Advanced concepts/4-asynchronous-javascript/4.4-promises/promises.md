# **4. Promises (resolve, reject, chaining)**

### 1️⃣ Understanding Promises

**What is a Promise?**
A Promise is an object representing the eventual completion or failure of an asynchronous operation.

```javascript
// Basic Promise structure
const myPromise = new Promise((resolve, reject) => {
  // Asynchronous operation
  setTimeout(() => {
    const success = Math.random() > 0.5;
    
    if (success) {
      resolve('Operation successful!');
    } else {
      reject(new Error('Operation failed!'));
    }
  }, 1000);
});

// Using the Promise
myPromise
  .then(result => console.log('Success:', result))
  .catch(error => console.error('Error:', error));
```

---

### 2️⃣ Promise States

**Three States of a Promise:**
```javascript
// 1. Pending - Initial state
const pendingPromise = new Promise((resolve, reject) => {
  // Still waiting...
});
console.log(pendingPromise); // Promise { <pending> }

// 2. Fulfilled (Resolved) - Operation completed successfully
const fulfilledPromise = Promise.resolve('Success!');
console.log(fulfilledPromise); // Promise { 'Success!' }

// 3. Rejected - Operation failed
const rejectedPromise = Promise.reject(new Error('Failed!'));
console.log(rejectedPromise); // Promise { <rejected> Error: Failed! }

// State transitions are irreversible
const promise = new Promise((resolve, reject) => {
  resolve('First resolution');
  resolve('Second resolution'); // Ignored!
  reject(new Error('This rejection is ignored'));
});

promise.then(value => console.log(value)); // 'First resolution'
```

---

### 3️⃣ Creating Promises

**Promise Constructor:**
```javascript
function fetchUserData(userId) {
  return new Promise((resolve, reject) => {
    // Validate input
    if (!userId || userId < 1) {
      reject(new Error('Invalid user ID'));
      return;
    }
    
    // Simulate API call
    setTimeout(() => {
      const userData = {
        id: userId,
        name: 'John Doe',
        email: 'john@example.com'
      };
      
      resolve(userData);
    }, 1000);
  });
}

// Usage
fetchUserData(1)
  .then(user => console.log('User:', user))
  .catch(error => console.error('Error:', error));
```

**Promise.resolve() and Promise.reject():**
```javascript
// Creating immediately resolved promises
const immediateSuccess = Promise.resolve('Immediate success');
const immediateFailure = Promise.reject(new Error('Immediate failure'));

// Useful for converting values to promises
function processValue(value) {
  if (typeof value === 'string') {
    return Promise.resolve(value.toUpperCase());
  } else {
    return Promise.reject(new Error('Value must be a string'));
  }
}

processValue('hello').then(console.log); // 'HELLO'
processValue(123).catch(console.error); // Error: Value must be a string
```

**Converting Callbacks to Promises:**
```javascript
// Original callback-based function
function readFileCallback(filename, callback) {
  setTimeout(() => {
    if (filename.endsWith('.txt')) {
      callback(null, `Content of ${filename}`);
    } else {
      callback(new Error('Only .txt files supported'));
    }
  }, 1000);
}

// Promisified version
function readFilePromise(filename) {
  return new Promise((resolve, reject) => {
    readFileCallback(filename, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

// Usage
readFilePromise('data.txt')
  .then(content => console.log(content))
  .catch(error => console.error(error));
```

---

### 4️⃣ Promise Chaining

**Basic Chaining:**
```javascript
function step1(input) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Step 1 complete');
      resolve(input + ' -> Step1');
    }, 1000);
  });
}

function step2(input) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Step 2 complete');
      resolve(input + ' -> Step2');
    }, 1000);
  });
}

function step3(input) {
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('Step 3 complete');
      resolve(input + ' -> Step3');
    }, 1000);
  });
}

// Chaining promises
step1('Start')
  .then(result1 => step2(result1))
  .then(result2 => step3(result2))
  .then(finalResult => {
    console.log('Final result:', finalResult);
    // Output: Start -> Step1 -> Step2 -> Step3
  })
  .catch(error => {
    console.error('Error in chain:', error);
  });
```

**Returning Values vs Promises:**
```javascript
Promise.resolve(10)
  .then(value => {
    console.log('Value:', value); // 10
    return value * 2; // Return a value
  })
  .then(value => {
    console.log('Doubled:', value); // 20
    return Promise.resolve(value + 5); // Return a promise
  })
  .then(value => {
    console.log('Added 5:', value); // 25
    return new Promise(resolve => {
      setTimeout(() => resolve(value * 3), 1000);
    });
  })
  .then(value => {
    console.log('Tripled after delay:', value); // 75
  });
```

**Complex Chaining Example:**
```javascript
class UserService {
  static fetchUser(id) {
    return new Promise(resolve => {
      setTimeout(() => resolve({ id, name: 'John' }), 500);
    });
  }
  
  static fetchUserPosts(userId) {
    return new Promise(resolve => {
      setTimeout(() => resolve([
        { id: 1, title: 'Post 1', userId },
        { id: 2, title: 'Post 2', userId }
      ]), 500);
    });
  }
  
  static fetchPostComments(postId) {
    return new Promise(resolve => {
      setTimeout(() => resolve([
        { id: 1, text: 'Great post!', postId },
        { id: 2, text: 'Thanks for sharing', postId }
      ]), 500);
    });
  }
}

// Chained operations
UserService.fetchUser(1)
  .then(user => {
    console.log('User:', user);
    return UserService.fetchUserPosts(user.id);
  })
  .then(posts => {
    console.log('Posts:', posts);
    return UserService.fetchPostComments(posts[0].id);
  })
  .then(comments => {
    console.log('Comments:', comments);
  })
  .catch(error => {
    console.error('Error in chain:', error);
  });
```

---

### 5️⃣ Error Handling

**Basic Error Handling:**
```javascript
function riskyOperation() {
  return new Promise((resolve, reject) => {
    const success = Math.random() > 0.5;
    
    setTimeout(() => {
      if (success) {
        resolve('Operation succeeded');
      } else {
        reject(new Error('Operation failed'));
      }
    }, 1000);
  });
}

riskyOperation()
  .then(result => {
    console.log('Success:', result);
  })
  .catch(error => {
    console.error('Caught error:', error.message);
  });
```

**Error Propagation in Chains:**
```javascript
Promise.resolve('start')
  .then(value => {
    console.log('Step 1:', value);
    return 'step1-complete';
  })
  .then(value => {
    console.log('Step 2:', value);
    throw new Error('Something went wrong in step 2');
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
  });
```

**Multiple Catch Blocks:**
```javascript
function processData(data) {
  return Promise.resolve(data)
    .then(data => {
      if (!data) throw new Error('No data provided');
      return data.toUpperCase();
    })
    .catch(error => {
      if (error.message === 'No data provided') {
        console.log('Using default data');
        return 'DEFAULT';
      }
      throw error; // Re-throw if not handled
    })
    .then(data => {
      console.log('Processed data:', data);
      return data;
    })
    .catch(error => {
      console.error('Unhandled error:', error);
      throw error;
    });
}

processData(null); // Will use default data
processData(123); // Will throw error (no toUpperCase method)
```

**Finally Block:**
```javascript
function performOperation() {
  console.log('Starting operation...');
  
  return riskyOperation()
    .then(result => {
      console.log('Operation result:', result);
      return result;
    })
    .catch(error => {
      console.error('Operation failed:', error.message);
      throw error;
    })
    .finally(() => {
      console.log('Cleanup: Operation finished');
      // This always runs, regardless of success or failure
    });
}

performOperation();
```

---

### 6️⃣ Advanced Promise Patterns

**Promise Timeout Pattern:**
```javascript
function withTimeout(promise, timeoutMs) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);
  });
  
  return Promise.race([promise, timeoutPromise]);
}

// Usage
const slowOperation = new Promise(resolve => {
  setTimeout(() => resolve('Slow result'), 3000);
});

withTimeout(slowOperation, 2000)
  .then(result => console.log('Result:', result))
  .catch(error => console.error('Error:', error.message));
// Will timeout after 2 seconds
```

**Retry Pattern:**
```javascript
function withRetry(promiseFactory, maxRetries = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    
    function attempt() {
      attempts++;
      
      promiseFactory()
        .then(resolve)
        .catch(error => {
          if (attempts >= maxRetries) {
            reject(new Error(`Failed after ${maxRetries} attempts: ${error.message}`));
          } else {
            console.log(`Attempt ${attempts} failed, retrying in ${delay}ms...`);
            setTimeout(attempt, delay);
          }
        });
    }
    
    attempt();
  });
}

// Usage
const unreliableOperation = () => {
  return new Promise((resolve, reject) => {
    if (Math.random() < 0.7) {
      reject(new Error('Random failure'));
    } else {
      resolve('Success!');
    }
  });
};

withRetry(unreliableOperation, 5, 500)
  .then(result => console.log('Final result:', result))
  .catch(error => console.error('Final error:', error.message));
```

**Promise Pool (Concurrency Control):**
```javascript
class PromisePool {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }
  
  add(promiseFactory) {
    return new Promise((resolve, reject) => {
      this.queue.push({
        promiseFactory,
        resolve,
        reject
      });
      
      this.process();
    });
  }
  
  async process() {
    if (this.running >= this.concurrency || this.queue.length === 0) {
      return;
    }
    
    this.running++;
    const { promiseFactory, resolve, reject } = this.queue.shift();
    
    try {
      const result = await promiseFactory();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.running--;
      this.process(); // Process next item
    }
  }
}

// Usage
const pool = new PromisePool(2); // Max 2 concurrent operations

const tasks = Array.from({ length: 10 }, (_, i) => 
  () => new Promise(resolve => {
    console.log(`Starting task ${i}`);
    setTimeout(() => {
      console.log(`Completed task ${i}`);
      resolve(`Result ${i}`);
    }, Math.random() * 2000);
  })
);

Promise.all(tasks.map(task => pool.add(task)))
  .then(results => console.log('All tasks completed:', results));
```

---

### 7️⃣ Promise Utilities

**Custom Promise.all Implementation:**
```javascript
function customPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    if (promises.length === 0) {
      resolve([]);
      return;
    }
    
    const results = new Array(promises.length);
    let completedCount = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results[index] = value;
          completedCount++;
          
          if (completedCount === promises.length) {
            resolve(results);
          }
        })
        .catch(reject);
    });
  });
}

// Test
customPromiseAll([
  Promise.resolve(1),
  Promise.resolve(2),
  Promise.resolve(3)
]).then(console.log); // [1, 2, 3]
```

**Promise Debounce:**
```javascript
function debouncePromise(fn, delay) {
  let timeoutId;
  let latestResolve, latestReject;
  
  return function(...args) {
    return new Promise((resolve, reject) => {
      latestResolve = resolve;
      latestReject = reject;
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn.apply(this, args);
          latestResolve(result);
        } catch (error) {
          latestReject(error);
        }
      }, delay);
    });
  };
}

// Usage
const debouncedSearch = debouncePromise(async (query) => {
  console.log('Searching for:', query);
  return `Results for ${query}`;
}, 300);

// Multiple rapid calls - only the last one executes
debouncedSearch('a');
debouncedSearch('ab');
debouncedSearch('abc').then(console.log); // Only this executes
```

---

### 8️⃣ Testing Promises

**Testing with Jest:**
```javascript
// Function to test
function fetchData(url) {
  return new Promise((resolve, reject) => {
    if (url.includes('error')) {
      reject(new Error('Network error'));
    } else {
      setTimeout(() => {
        resolve({ data: `Data from ${url}` });
      }, 100);
    }
  });
}

// Tests
describe('Promise Tests', () => {
  test('should resolve with data', async () => {
    const result = await fetchData('https://api.example.com');
    expect(result).toEqual({ data: 'Data from https://api.example.com' });
  });
  
  test('should reject with error', async () => {
    await expect(fetchData('https://error.com'))
      .rejects
      .toThrow('Network error');
  });
  
  test('should handle promise chain', async () => {
    const result = await fetchData('https://api.example.com')
      .then(data => data.data.toUpperCase());
    
    expect(result).toBe('DATA FROM HTTPS://API.EXAMPLE.COM');
  });
});

// Mock promises for testing
jest.mock('./api', () => ({
  fetchUser: jest.fn(() => Promise.resolve({ id: 1, name: 'Test User' }))
}));
```

---

### 9️⃣ Performance Considerations

**Promise Creation Overhead:**
```javascript
// ❌ Inefficient - creates unnecessary promises
function inefficientFunction(value) {
  return new Promise(resolve => {
    resolve(value * 2);
  });
}

// ✅ Efficient - return value directly when possible
function efficientFunction(value) {
  return value * 2;
}

// ✅ Or use Promise.resolve for consistency
function consistentFunction(value) {
  return Promise.resolve(value * 2);
}
```

**Memory Leaks Prevention:**
```javascript
// ❌ Potential memory leak - promise never resolves
function memoryLeakRisk() {
  return new Promise((resolve, reject) => {
    // If this condition is never true, promise never resolves
    if (false) {
      resolve('never happens');
    }
    // Missing reject or resolve - promise stays pending forever
  });
}

// ✅ Always ensure promises resolve or reject
function safePromise() {
  return new Promise((resolve, reject) => {
    try {
      // Some operation
      const result = performOperation();
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}
```

---

### 🔟 Best Practices

**Do's:**
```javascript
// ✅ Always handle errors
promise
  .then(result => console.log(result))
  .catch(error => console.error(error));

// ✅ Return promises from then handlers
promise
  .then(result => {
    return processResult(result); // Return promise or value
  })
  .then(processedResult => {
    console.log(processedResult);
  });

// ✅ Use Promise.resolve/reject for immediate values
function getValue(useCache) {
  if (useCache) {
    return Promise.resolve(cachedValue);
  } else {
    return fetchFromServer();
  }
}

// ✅ Chain promises instead of nesting
getData()
  .then(data => processData(data))
  .then(processed => saveData(processed))
  .then(saved => console.log('Saved:', saved));
```

**Don'ts:**
```javascript
// ❌ Don't nest promises (callback hell with promises)
getData()
  .then(data => {
    processData(data)
      .then(processed => {
        saveData(processed)
          .then(saved => {
            console.log('Saved:', saved);
          });
      });
  });

// ❌ Don't forget to return promises
promise
  .then(result => {
    processResult(result); // Missing return!
  })
  .then(processed => {
    // processed is undefined!
    console.log(processed);
  });

// ❌ Don't create unnecessary promises
function unnecessary() {
  return new Promise(resolve => {
    resolve(synchronousOperation());
  });
}

// Better:
function better() {
  return Promise.resolve(synchronousOperation());
}
```

---

### 1️⃣1️⃣ Key Takeaways

* **Promises** solve callback hell with cleaner syntax
* **Three states**: Pending, Fulfilled, Rejected
* **Chaining** allows sequential asynchronous operations
* **Error handling** propagates through the chain
* **Always handle errors** with `.catch()`
* **Return values or promises** from `.then()` handlers
* **Use Promise utilities** for complex scenarios
* **Test promises** with async/await or `.resolves/.rejects`
* **Avoid creating unnecessary promises** for synchronous operations
