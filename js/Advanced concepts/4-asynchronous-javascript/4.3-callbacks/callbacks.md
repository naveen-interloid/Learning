# **3. Callback Functions & Callback Hell**

### 1️⃣ Understanding Callbacks

**What is a Callback?**
A callback is a function passed as an argument to another function, to be executed at a later time.

```javascript
// Basic callback example
function greet(name, callback) {
  console.log(`Hello, ${name}!`);
  callback();
}

function afterGreeting() {
  console.log('Nice to meet you!');
}

greet('Alice', afterGreeting);
// Output:
// Hello, Alice!
// Nice to meet you!
```

---

### 2️⃣ Synchronous vs Asynchronous Callbacks

**Synchronous Callbacks:**
```javascript
// Array methods use synchronous callbacks
const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

const evens = numbers.filter(num => num % 2 === 0);
console.log(evens); // [2, 4]

// Custom synchronous callback
function processArray(array, callback) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(callback(array[i], i));
  }
  return result;
}

const processed = processArray([1, 2, 3], (item, index) => `${index}: ${item}`);
console.log(processed); // ['0: 1', '1: 2', '2: 3']
```

**Asynchronous Callbacks:**
```javascript
// Timer callbacks
setTimeout(() => {
  console.log('This runs after 1 second');
}, 1000);

// Event callbacks
document.getElementById('button').addEventListener('click', (event) => {
  console.log('Button clicked!', event);
});

// File system callbacks (Node.js)
const fs = require('fs');
fs.readFile('data.txt', 'utf8', (error, data) => {
  if (error) {
    console.error('Error reading file:', error);
  } else {
    console.log('File content:', data);
  }
});
```

---

### 3️⃣ Common Callback Patterns

**Error-First Callbacks (Node.js Convention):**
```javascript
function readUserData(userId, callback) {
  // Simulate async operation
  setTimeout(() => {
    if (userId < 1) {
      // Error case
      callback(new Error('Invalid user ID'), null);
    } else {
      // Success case
      callback(null, { id: userId, name: 'John Doe' });
    }
  }, 1000);
}

// Usage
readUserData(1, (error, userData) => {
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('User data:', userData);
  }
});
```

**Success/Failure Callbacks:**
```javascript
function fetchData(url, onSuccess, onError) {
  // Simulate API call
  setTimeout(() => {
    if (url.includes('invalid')) {
      onError(new Error('Invalid URL'));
    } else {
      onSuccess({ data: 'Some data from ' + url });
    }
  }, 1000);
}

// Usage
fetchData(
  'https://api.example.com/data',
  (data) => console.log('Success:', data),
  (error) => console.error('Error:', error.message)
);
```

**Callback with Options:**
```javascript
function animateElement(element, options, callback) {
  const {
    duration = 1000,
    easing = 'ease',
    property = 'opacity',
    from = 0,
    to = 1
  } = options;
  
  // Simulate animation
  console.log(`Animating ${property} from ${from} to ${to}`);
  
  setTimeout(() => {
    element.style[property] = to;
    if (callback) callback();
  }, duration);
}

// Usage
const element = document.getElementById('myElement');
animateElement(element, { duration: 500, property: 'opacity' }, () => {
  console.log('Animation complete!');
});
```

---

### 4️⃣ Callback Hell Problem

**What is Callback Hell?**
Callback hell occurs when you have multiple nested callbacks, making code hard to read and maintain.

```javascript
// ❌ Callback Hell Example
function getUserData(userId, callback) {
  setTimeout(() => {
    console.log('Fetching user data...');
    callback(null, { id: userId, name: 'John' });
  }, 1000);
}

function getUserPosts(userId, callback) {
  setTimeout(() => {
    console.log('Fetching user posts...');
    callback(null, [{ id: 1, title: 'Post 1' }, { id: 2, title: 'Post 2' }]);
  }, 1000);
}

function getPostComments(postId, callback) {
  setTimeout(() => {
    console.log('Fetching post comments...');
    callback(null, [{ id: 1, text: 'Great post!' }]);
  }, 1000);
}

// Nested callbacks - CALLBACK HELL!
getUserData(1, (err, user) => {
  if (err) return console.error(err);
  
  getUserPosts(user.id, (err, posts) => {
    if (err) return console.error(err);
    
    getPostComments(posts[0].id, (err, comments) => {
      if (err) return console.error(err);
      
      console.log('Final result:', {
        user,
        posts,
        comments
      });
    });
  });
});
```

**Problems with Callback Hell:**
- **Pyramid of Doom** - Code grows horizontally
- **Error Handling** - Repetitive error checking
- **Readability** - Hard to follow the flow
- **Maintainability** - Difficult to modify or debug
- **Testing** - Complex to unit test

---

### 5️⃣ Solutions to Callback Hell

**Solution 1: Named Functions**
```javascript
// ✅ Better: Extract named functions
function handleUser(err, user) {
  if (err) return console.error(err);
  getUserPosts(user.id, handlePosts);
}

function handlePosts(err, posts) {
  if (err) return console.error(err);
  getPostComments(posts[0].id, handleComments);
}

function handleComments(err, comments) {
  if (err) return console.error(err);
  console.log('Comments:', comments);
}

// Much cleaner!
getUserData(1, handleUser);
```

**Solution 2: Modularization**
```javascript
// ✅ Better: Create reusable modules
class UserService {
  static async getUserWithPostsAndComments(userId) {
    return new Promise((resolve, reject) => {
      this.getUserData(userId, (err, user) => {
        if (err) return reject(err);
        
        this.getUserPosts(user.id, (err, posts) => {
          if (err) return reject(err);
          
          this.getPostComments(posts[0].id, (err, comments) => {
            if (err) return reject(err);
            
            resolve({ user, posts, comments });
          });
        });
      });
    });
  }
  
  static getUserData(userId, callback) {
    setTimeout(() => {
      callback(null, { id: userId, name: 'John' });
    }, 1000);
  }
  
  static getUserPosts(userId, callback) {
    setTimeout(() => {
      callback(null, [{ id: 1, title: 'Post 1' }]);
    }, 1000);
  }
  
  static getPostComments(postId, callback) {
    setTimeout(() => {
      callback(null, [{ id: 1, text: 'Great!' }]);
    }, 1000);
  }
}
```

**Solution 3: Control Flow Libraries**
```javascript
// Using async.js library
const async = require('async');

async.waterfall([
  // Step 1: Get user
  (callback) => {
    getUserData(1, callback);
  },
  
  // Step 2: Get posts
  (user, callback) => {
    getUserPosts(user.id, (err, posts) => {
      callback(err, user, posts);
    });
  },
  
  // Step 3: Get comments
  (user, posts, callback) => {
    getPostComments(posts[0].id, (err, comments) => {
      callback(err, { user, posts, comments });
    });
  }
], (err, result) => {
  if (err) return console.error(err);
  console.log('Final result:', result);
});
```

---

### 6️⃣ Advanced Callback Patterns

**Callback Queue Pattern:**
```javascript
class CallbackQueue {
  constructor() {
    this.queue = [];
    this.processing = false;
  }
  
  add(callback) {
    this.queue.push(callback);
    this.process();
  }
  
  async process() {
    if (this.processing) return;
    this.processing = true;
    
    while (this.queue.length > 0) {
      const callback = this.queue.shift();
      try {
        await new Promise(resolve => {
          callback(resolve);
        });
      } catch (error) {
        console.error('Callback error:', error);
      }
    }
    
    this.processing = false;
  }
}

// Usage
const queue = new CallbackQueue();

queue.add((done) => {
  setTimeout(() => {
    console.log('Task 1 complete');
    done();
  }, 1000);
});

queue.add((done) => {
  setTimeout(() => {
    console.log('Task 2 complete');
    done();
  }, 500);
});
```

**Callback with Retry Logic:**
```javascript
function withRetry(fn, maxRetries = 3, delay = 1000) {
  return function(...args) {
    const callback = args[args.length - 1];
    let attempts = 0;
    
    function attempt() {
      attempts++;
      
      const wrappedCallback = (error, ...results) => {
        if (error && attempts < maxRetries) {
          console.log(`Attempt ${attempts} failed, retrying in ${delay}ms...`);
          setTimeout(attempt, delay);
        } else {
          callback(error, ...results);
        }
      };
      
      // Replace original callback with wrapped one
      const newArgs = [...args.slice(0, -1), wrappedCallback];
      fn(...newArgs);
    }
    
    attempt();
  };
}

// Usage
const unreliableFunction = (data, callback) => {
  // Simulate 70% failure rate
  if (Math.random() < 0.7) {
    callback(new Error('Random failure'));
  } else {
    callback(null, 'Success!');
  }
};

const reliableFunction = withRetry(unreliableFunction, 5, 500);

reliableFunction('test data', (error, result) => {
  if (error) {
    console.error('Final error:', error.message);
  } else {
    console.log('Final result:', result);
  }
});
```

---

### 7️⃣ Error Handling in Callbacks

**Proper Error Handling:**
```javascript
function robustAsyncOperation(data, callback) {
  // Validate input
  if (!data) {
    return callback(new Error('Data is required'));
  }
  
  try {
    // Simulate async operation
    setTimeout(() => {
      try {
        // Simulate potential error in async context
        if (data.invalid) {
          throw new Error('Invalid data format');
        }
        
        const result = processData(data);
        callback(null, result);
      } catch (asyncError) {
        callback(asyncError);
      }
    }, 1000);
  } catch (syncError) {
    // Handle synchronous errors
    callback(syncError);
  }
}

function processData(data) {
  // This might throw
  return data.value.toUpperCase();
}

// Usage with proper error handling
robustAsyncOperation({ value: 'hello' }, (error, result) => {
  if (error) {
    console.error('Operation failed:', error.message);
    // Handle error appropriately
    return;
  }
  
  console.log('Operation succeeded:', result);
});
```

**Error Propagation:**
```javascript
function chainedOperations(input, finalCallback) {
  step1(input, (err, result1) => {
    if (err) return finalCallback(err);
    
    step2(result1, (err, result2) => {
      if (err) return finalCallback(err);
      
      step3(result2, (err, result3) => {
        if (err) return finalCallback(err);
        
        finalCallback(null, result3);
      });
    });
  });
}

// Helper to reduce error handling boilerplate
function safeCallback(callback, nextStep) {
  return (error, result) => {
    if (error) return callback(error);
    nextStep(result);
  };
}

// Cleaner version
function chainedOperationsClean(input, finalCallback) {
  step1(input, safeCallback(finalCallback, (result1) => {
    step2(result1, safeCallback(finalCallback, (result2) => {
      step3(result2, finalCallback);
    }));
  }));
}
```

---

### 8️⃣ Testing Callbacks

**Testing Asynchronous Callbacks:**
```javascript
// Using Jest or similar testing framework
describe('Callback Functions', () => {
  test('should handle successful callback', (done) => {
    getUserData(1, (error, user) => {
      expect(error).toBeNull();
      expect(user).toEqual({ id: 1, name: 'John' });
      done(); // Signal test completion
    });
  });
  
  test('should handle error callback', (done) => {
    getUserData(-1, (error, user) => {
      expect(error).toBeInstanceOf(Error);
      expect(user).toBeNull();
      done();
    });
  });
  
  test('should timeout if callback never called', (done) => {
    const timeout = setTimeout(() => {
      done(new Error('Callback was never called'));
    }, 2000);
    
    getUserData(1, (error, user) => {
      clearTimeout(timeout);
      expect(user).toBeDefined();
      done();
    });
  });
});

// Mock callbacks for testing
function createMockCallback() {
  const mock = jest.fn();
  mock.success = (result) => mock(null, result);
  mock.error = (error) => mock(error, null);
  return mock;
}

test('should call callback with correct parameters', () => {
  const mockCallback = createMockCallback();
  
  // Test the function
  someAsyncFunction('test', mockCallback);
  
  // Verify callback was called correctly
  expect(mockCallback).toHaveBeenCalledWith(null, expectedResult);
});
```

---

### 9️⃣ Migration from Callbacks to Promises

**Promisifying Callbacks:**
```javascript
// Convert callback-based function to Promise
function promisify(callbackFunction) {
  return function(...args) {
    return new Promise((resolve, reject) => {
      callbackFunction(...args, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  };
}

// Usage
const getUserDataPromise = promisify(getUserData);

// Now you can use async/await
async function example() {
  try {
    const user = await getUserDataPromise(1);
    console.log('User:', user);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Node.js built-in promisify
const { promisify } = require('util');
const fs = require('fs');

const readFileAsync = promisify(fs.readFile);

async function readFile() {
  try {
    const data = await readFileAsync('file.txt', 'utf8');
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

---

### 🔟 Best Practices

**Do's:**
```javascript
// ✅ Use consistent error-first callback pattern
function goodAsyncFunction(input, callback) {
  if (!input) {
    return callback(new Error('Input required'));
  }
  
  setTimeout(() => {
    callback(null, processInput(input));
  }, 100);
}

// ✅ Always handle errors
someAsyncFunction(data, (error, result) => {
  if (error) {
    console.error('Error:', error);
    return; // Early return on error
  }
  
  // Process result
  console.log(result);
});

// ✅ Use named functions to avoid deep nesting
function handleUserData(error, user) {
  if (error) return console.error(error);
  // Handle user data
}

getUserData(1, handleUserData);
```

**Don'ts:**
```javascript
// ❌ Don't ignore errors
someAsyncFunction(data, (error, result) => {
  console.log(result); // Ignoring potential error!
});

// ❌ Don't create deep nesting
getData((err, data) => {
  processData(data, (err, processed) => {
    saveData(processed, (err, saved) => {
      // Too deep!
    });
  });
});

// ❌ Don't call callback multiple times
function badAsyncFunction(callback) {
  setTimeout(() => {
    callback(null, 'first');
    callback(null, 'second'); // BUG: Called twice!
  }, 100);
}
```

---

### 1️⃣1️⃣ Key Takeaways

* **Callbacks** are the foundation of asynchronous JavaScript
* **Callback Hell** makes code hard to read and maintain
* **Error-first pattern** is the Node.js convention
* **Named functions** help reduce nesting
* **Proper error handling** is crucial
* **Testing callbacks** requires special consideration
* **Promises and async/await** are modern alternatives
* **Understanding callbacks** helps you understand Promises better
