# **6. Memoization & Caching Patterns**

### 1️⃣ Explanation

**Memoization** is an optimization technique that caches function results. When the same inputs occur again, return the cached result instead of recalculating.

Benefits:
* **Improved performance** for expensive operations
* **Trade memory for speed**
* **Reduces redundant calculations**
* **Especially useful for recursive functions**

---

### 2️⃣ Basic Memoization

**Simple Memoization:**
```javascript
function memoize(fn) {
  const cache = {};
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (key in cache) {
      console.log('Cache hit!');
      return cache[key];
    }
    
    console.log('Computing...');
    const result = fn(...args);
    cache[key] = result;
    return result;
  };
}

// Usage
const expensiveFunction = (n) => {
  // Simulate expensive operation
  let result = 0;
  for (let i = 0; i < n * 1000000; i++) {
    result += i;
  }
  return result;
};

const memoizedExpensive = memoize(expensiveFunction);

console.log(memoizedExpensive(100)); // Computing... (slow)
console.log(memoizedExpensive(100)); // Cache hit! (fast)
```

---

### 3️⃣ Fibonacci with Memoization

**Without Memoization (Slow):**
```javascript
function fibSlow(n) {
  if (n <= 1) return n;
  return fibSlow(n - 1) + fibSlow(n - 2);
}

console.time('fibSlow');
console.log(fibSlow(40)); // Very slow
console.timeEnd('fibSlow');
```

**With Memoization (Fast):**
```javascript
const fibFast = memoize(function(n) {
  if (n <= 1) return n;
  return fibFast(n - 1) + fibFast(n - 2);
});

console.time('fibFast');
console.log(fibFast(40)); // Much faster
console.timeEnd('fibFast');
```

---

### 4️⃣ Advanced Caching Patterns

**LRU Cache (Least Recently Used):**
```javascript
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }
  
  get(key) {
    if (this.cache.has(key)) {
      // Move to end (most recently used)
      const value = this.cache.get(key);
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }
  
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, value);
  }
}

function memoizeWithLRU(fn, maxSize = 100) {
  const cache = new LRUCache(maxSize);
  
  return function(...args) {
    const key = JSON.stringify(args);
    let result = cache.get(key);
    
    if (result === undefined) {
      result = fn(...args);
      cache.set(key, result);
    }
    
    return result;
  };
}
```

---

### 5️⃣ Real-World Applications

**API Response Caching:**
```javascript
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function fetchWithCache(url) {
  const now = Date.now();
  const cached = apiCache.get(url);
  
  if (cached && (now - cached.timestamp) < CACHE_DURATION) {
    console.log('Using cached response');
    return cached.data;
  }
  
  console.log('Fetching from API');
  const response = await fetch(url);
  const data = await response.json();
  
  apiCache.set(url, {
    data,
    timestamp: now
  });
  
  return data;
}
```

**Expensive Calculations:**
```javascript
const calculateDistance = memoize((lat1, lon1, lat2, lon2) => {
  // Haversine formula for distance calculation
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
});

// Subsequent calls with same coordinates are cached
console.log(calculateDistance(40.7128, -74.0060, 34.0522, -118.2437));
```

---

### 6️⃣ Key Takeaways

* **Memoization** caches function results for performance
* **Trade memory for speed** - useful for expensive operations
* **LRU cache** prevents unlimited memory growth
* **Great for recursive functions** and API calls
* **Consider cache invalidation** for dynamic data
