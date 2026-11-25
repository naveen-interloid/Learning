# **6. Promise Combinators**

### 1️⃣ Overview of Promise Combinators

Promise combinators are utility methods that help you work with multiple promises simultaneously. They provide different strategies for handling multiple asynchronous operations.

**The Four Main Combinators:**
- `Promise.all()` - Wait for all promises to resolve
- `Promise.race()` - Wait for the first promise to settle
- `Promise.allSettled()` - Wait for all promises to settle (resolve or reject)
- `Promise.any()` - Wait for the first promise to resolve

---

### 2️⃣ Promise.all()

**Basic Usage:**
```javascript
const promise1 = fetch('/api/users');
const promise2 = fetch('/api/posts');
const promise3 = fetch('/api/comments');

Promise.all([promise1, promise2, promise3])
  .then(responses => {
    console.log('All requests completed');
    return Promise.all(responses.map(r => r.json()));
  })
  .then(data => {
    const [users, posts, comments] = data;
    console.log('Users:', users);
    console.log('Posts:', posts);
    console.log('Comments:', comments);
  })
  .catch(error => {
    console.error('One or more requests failed:', error);
  });
```

**With async/await:**
```javascript
async function fetchAllData() {
  try {
    const [usersResponse, postsResponse, commentsResponse] = await Promise.all([
      fetch('/api/users'),
      fetch('/api/posts'),
      fetch('/api/comments')
    ]);
    
    const [users, posts, comments] = await Promise.all([
      usersResponse.json(),
      postsResponse.json(),
      commentsResponse.json()
    ]);
    
    return { users, posts, comments };
  } catch (error) {
    console.error('Failed to fetch data:', error);
    throw error;
  }
}
```

**Key Characteristics:**
- **Fails fast**: If any promise rejects, Promise.all immediately rejects
- **Preserves order**: Results array matches input array order
- **Parallel execution**: All promises run simultaneously

```javascript
async function demonstratePromiseAll() {
  const delays = [1000, 2000, 500];
  
  console.time('Promise.all');
  
  const results = await Promise.all(
    delays.map(delay => 
      new Promise(resolve => {
        setTimeout(() => resolve(`Completed in ${delay}ms`), delay);
      })
    )
  );
  
  console.timeEnd('Promise.all'); // ~2000ms (longest delay)
  console.log(results);
  // ['Completed in 1000ms', 'Completed in 2000ms', 'Completed in 500ms']
}
```

---

### 3️⃣ Promise.race()

**Basic Usage:**
```javascript
const slowPromise = new Promise(resolve => {
  setTimeout(() => resolve('Slow result'), 3000);
});

const fastPromise = new Promise(resolve => {
  setTimeout(() => resolve('Fast result'), 1000);
});

Promise.race([slowPromise, fastPromise])
  .then(result => {
    console.log('First to complete:', result); // 'Fast result'
  });
```

**Timeout Implementation:**
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
async function fetchWithTimeout() {
  try {
    const data = await withTimeout(
      fetch('/api/slow-endpoint'),
      5000
    );
    return await data.json();
  } catch (error) {
    if (error.message.includes('timed out')) {
      console.log('Request timed out, using cached data');
      return getCachedData();
    }
    throw error;
  }
}
```

**First Successful Response:**
```javascript
async function fetchFromMultipleSources() {
  const sources = [
    'https://api1.example.com/data',
    'https://api2.example.com/data',
    'https://api3.example.com/data'
  ];
  
  try {
    const response = await Promise.race(
      sources.map(url => fetch(url))
    );
    
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    console.error('All sources failed or timed out:', error);
    throw error;
  }
}
```

---

### 4️⃣ Promise.allSettled()

**Basic Usage:**
```javascript
const promises = [
  Promise.resolve('Success 1'),
  Promise.reject(new Error('Error 1')),
  Promise.resolve('Success 2'),
  Promise.reject(new Error('Error 2'))
];

Promise.allSettled(promises)
  .then(results => {
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Promise ${index} succeeded:`, result.value);
      } else {
        console.log(`Promise ${index} failed:`, result.reason.message);
      }
    });
  });

// Output:
// Promise 0 succeeded: Success 1
// Promise 1 failed: Error 1
// Promise 2 succeeded: Success 2
// Promise 3 failed: Error 2
```

**Robust Data Fetching:**
```javascript
async function fetchMultipleEndpoints() {
  const endpoints = [
    '/api/users',
    '/api/posts',
    '/api/comments',
    '/api/analytics' // This might fail
  ];
  
  const promises = endpoints.map(async (endpoint) => {
    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${endpoint}: ${response.status}`);
    }
    return response.json();
  });
  
  const results = await Promise.allSettled(promises);
  
  const successful = [];
  const failed = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      successful.push({
        endpoint: endpoints[index],
        data: result.value
      });
    } else {
      failed.push({
        endpoint: endpoints[index],
        error: result.reason.message
      });
    }
  });
  
  console.log(`${successful.length} endpoints succeeded`);
  console.log(`${failed.length} endpoints failed`);
  
  return { successful, failed };
}
```

**Batch Processing with Error Handling:**
```javascript
async function processBatch(items, processor) {
  const promises = items.map(async (item, index) => {
    try {
      const result = await processor(item);
      return { index, item, result, success: true };
    } catch (error) {
      return { index, item, error: error.message, success: false };
    }
  });
  
  const results = await Promise.allSettled(promises);
  
  const processed = results.map(result => result.value);
  const successful = processed.filter(p => p.success);
  const failed = processed.filter(p => !p.success);
  
  return {
    total: items.length,
    successful: successful.length,
    failed: failed.length,
    results: processed
  };
}

// Usage
const items = [1, 2, 3, 4, 5];
const processor = async (item) => {
  if (item === 3) throw new Error('Processing failed');
  return item * 2;
};

const batchResult = await processBatch(items, processor);
console.log(batchResult);
```

---

### 5️⃣ Promise.any()

**Basic Usage:**
```javascript
const promises = [
  Promise.reject(new Error('Error 1')),
  Promise.reject(new Error('Error 2')),
  Promise.resolve('First success!'),
  Promise.resolve('Second success!')
];

Promise.any(promises)
  .then(result => {
    console.log('First successful result:', result); // 'First success!'
  })
  .catch(error => {
    console.error('All promises rejected:', error);
  });
```

**Fallback Strategy:**
```javascript
async function fetchWithFallbacks() {
  const sources = [
    () => fetch('/api/primary'),
    () => fetch('/api/secondary'),
    () => fetch('/api/tertiary'),
    () => Promise.resolve(new Response(JSON.stringify({ fallback: true })))
  ];
  
  try {
    const response = await Promise.any(
      sources.map(source => source())
    );
    
    return await response.json();
  } catch (error) {
    // This only happens if ALL sources fail
    console.error('All data sources failed:', error);
    throw new Error('No data source available');
  }
}
```

**AggregateError Handling:**
```javascript
async function handleAggregateError() {
  const promises = [
    Promise.reject(new Error('Database error')),
    Promise.reject(new Error('Network error')),
    Promise.reject(new Error('Timeout error'))
  ];
  
  try {
    const result = await Promise.any(promises);
    console.log('Success:', result);
  } catch (error) {
    if (error instanceof AggregateError) {
      console.log('All promises failed:');
      error.errors.forEach((err, index) => {
        console.log(`  ${index + 1}. ${err.message}`);
      });
    }
  }
}
```

---

### 6️⃣ Advanced Patterns

**Custom Promise Combinator - Some:**
```javascript
function promiseSome(promises, count) {
  return new Promise((resolve, reject) => {
    if (count <= 0) {
      resolve([]);
      return;
    }
    
    if (count > promises.length) {
      reject(new Error('Count exceeds number of promises'));
      return;
    }
    
    const results = [];
    const errors = [];
    let settled = 0;
    
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(value => {
          results.push({ index, value });
          if (results.length >= count) {
            resolve(results.slice(0, count));
          }
        })
        .catch(error => {
          errors.push({ index, error });
        })
        .finally(() => {
          settled++;
          if (settled === promises.length && results.length < count) {
            reject(new Error(`Only ${results.length} promises resolved, needed ${count}`));
          }
        });
    });
  });
}

// Usage: Wait for at least 2 out of 4 promises to succeed
const promises = [
  Promise.resolve('A'),
  Promise.reject('Error B'),
  Promise.resolve('C'),
  Promise.reject('Error D')
];

promiseSome(promises, 2)
  .then(results => console.log('Got 2 results:', results))
  .catch(error => console.error('Failed to get 2 results:', error));
```

**Promise Map with Concurrency Control:**
```javascript
async function promiseMap(items, mapper, concurrency = Infinity) {
  if (concurrency === Infinity) {
    return Promise.all(items.map(mapper));
  }
  
  const results = [];
  const executing = [];
  
  for (const [index, item] of items.entries()) {
    const promise = Promise.resolve(mapper(item, index))
      .then(result => {
        results[index] = result;
      });
    
    executing.push(promise);
    
    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(executing.findIndex(p => p === promise), 1);
    }
  }
  
  await Promise.all(executing);
  return results;
}

// Usage: Process 100 items with max 5 concurrent operations
const items = Array.from({ length: 100 }, (_, i) => i);
const results = await promiseMap(
  items,
  async (item) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return item * 2;
  },
  5
);
```

---

### 7️⃣ Real-World Examples

**Dashboard Data Loading:**
```javascript
class Dashboard {
  async loadDashboard() {
    const startTime = Date.now();
    
    try {
      // Critical data - must succeed
      const criticalData = await Promise.all([
        this.fetchUserProfile(),
        this.fetchUserPermissions()
      ]);
      
      // Optional data - can fail gracefully
      const optionalResults = await Promise.allSettled([
        this.fetchRecentActivity(),
        this.fetchNotifications(),
        this.fetchAnalytics(),
        this.fetchRecommendations()
      ]);
      
      const optionalData = {};
      optionalResults.forEach((result, index) => {
        const keys = ['activity', 'notifications', 'analytics', 'recommendations'];
        if (result.status === 'fulfilled') {
          optionalData[keys[index]] = result.value;
        } else {
          console.warn(`Failed to load ${keys[index]}:`, result.reason.message);
          optionalData[keys[index]] = null;
        }
      });
      
      const loadTime = Date.now() - startTime;
      console.log(`Dashboard loaded in ${loadTime}ms`);
      
      return {
        user: criticalData[0],
        permissions: criticalData[1],
        ...optionalData
      };
      
    } catch (error) {
      console.error('Failed to load critical dashboard data:', error);
      throw error;
    }
  }
}
```

**Multi-Source Data Aggregation:**
```javascript
async function aggregateDataFromSources() {
  const sources = [
    { name: 'Database', fetch: () => fetchFromDatabase() },
    { name: 'Cache', fetch: () => fetchFromCache() },
    { name: 'API', fetch: () => fetchFromAPI() }
  ];
  
  // Try to get data from the fastest source
  const racePromises = sources.map(async (source) => {
    try {
      const data = await source.fetch();
      return { source: source.name, data, success: true };
    } catch (error) {
      return { source: source.name, error: error.message, success: false };
    }
  });
  
  try {
    // Get the first successful result
    const fastestResult = await Promise.any(
      racePromises.filter(p => p.success !== false)
    );
    
    console.log(`Data retrieved from ${fastestResult.source}`);
    return fastestResult.data;
    
  } catch (error) {
    // If all sources fail, get detailed error information
    const allResults = await Promise.allSettled(racePromises);
    const errors = allResults
      .map(result => result.value)
      .filter(result => !result.success);
    
    console.error('All data sources failed:', errors);
    throw new Error('No data source available');
  }
}
```

---

### 8️⃣ Performance Considerations

**Comparison of Execution Times:**
```javascript
async function performanceComparison() {
  const delays = [1000, 2000, 3000];
  const createPromise = (delay) => 
    new Promise(resolve => setTimeout(() => resolve(delay), delay));
  
  // Sequential execution
  console.time('Sequential');
  for (const delay of delays) {
    await createPromise(delay);
  }
  console.timeEnd('Sequential'); // ~6000ms
  
  // Promise.all (parallel)
  console.time('Promise.all');
  await Promise.all(delays.map(createPromise));
  console.timeEnd('Promise.all'); // ~3000ms
  
  // Promise.race (first to complete)
  console.time('Promise.race');
  await Promise.race(delays.map(createPromise));
  console.timeEnd('Promise.race'); // ~1000ms
}
```

---

### 9️⃣ Best Practices

**Do's:**
```javascript
// ✅ Use appropriate combinator for your use case
const criticalData = await Promise.all([fetchUsers(), fetchConfig()]);
const optionalData = await Promise.allSettled([fetchAnalytics(), fetchAds()]);

// ✅ Handle errors appropriately
Promise.allSettled(promises).then(results => {
  const successful = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');
  
  console.log(`${successful.length} succeeded, ${failed.length} failed`);
});

// ✅ Use timeout with Promise.race
const dataWithTimeout = await Promise.race([
  fetchData(),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), 5000)
  )
]);
```

**Don'ts:**
```javascript
// ❌ Don't use Promise.all when you want to handle individual failures
Promise.all([
  fetchCriticalData(),
  fetchOptionalData() // This failure will break everything
]).catch(error => {
  // Lost all data due to optional failure
});

// ❌ Don't ignore the order in Promise.all results
const [users, posts] = await Promise.all([
  fetchPosts(), // Wrong order!
  fetchUsers()
]);

// ❌ Don't use Promise.race for unrelated operations
Promise.race([
  saveToDatabase(),
  sendEmail() // These are unrelated!
]);
```

---

### 🔟 Key Takeaways

* **Promise.all()** - All must succeed, fails fast, preserves order
* **Promise.race()** - First to settle wins, useful for timeouts
* **Promise.allSettled()** - All settle, never rejects, good for optional operations
* **Promise.any()** - First to succeed wins, throws AggregateError if all fail
* **Choose the right combinator** for your specific use case
* **Handle errors appropriately** for each combinator
* **Consider performance implications** of parallel vs sequential execution
* **Use custom combinators** for specialized needs
* **Test edge cases** like empty arrays and all-failing promises
