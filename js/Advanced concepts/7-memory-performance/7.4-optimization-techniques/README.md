# **7.4 Optimization Techniques**

Performance optimization involves applying various strategies to improve JavaScript application speed, memory usage, and user experience through code-level improvements and architectural decisions.

## Code-Level Optimizations

### Algorithm Optimization
```javascript
// ❌ Inefficient: O(n²) complexity
function findDuplicatesInefficient(arr) {
  const duplicates = [];
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j] && !duplicates.includes(arr[i])) {
        duplicates.push(arr[i]);
      }
    }
  }
  return duplicates;
}

// ✅ Efficient: O(n) complexity
function findDuplicatesEfficient(arr) {
  const seen = new Set();
  const duplicates = new Set();
  
  for (const item of arr) {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  }
  
  return Array.from(duplicates);
}
```

### Memory Optimization
```javascript
// Object pooling for frequent allocations
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    
    // Pre-populate pool
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }
  
  acquire() {
    return this.pool.length > 0 ? this.pool.pop() : this.createFn();
  }
  
  release(obj) {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}
```

## Bundle Optimization

### Tree Shaking
```javascript
// ✅ Tree-shakable exports
export const utilityA = () => {};
export const utilityB = () => {};

// ❌ Not tree-shakable
export default {
  utilityA: () => {},
  utilityB: () => {}
};
```

### Code Splitting
```javascript
// Route-based splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

// Feature-based splitting
async function loadFeature() {
  const { feature } = await import('./features/advanced-feature');
  return feature;
}
```

## Caching Strategies

### Memoization
```javascript
function memoize(fn) {
  const cache = new Map();
  
  return function(...args) {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Usage
const expensiveFunction = memoize((n) => {
  // Expensive computation
  return fibonacci(n);
});
```

### Service Worker Caching
```javascript
// Cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

## DOM Optimization

### Batch DOM Operations
```javascript
// ❌ Inefficient: Multiple reflows
function inefficientDOMUpdate(elements, data) {
  elements.forEach((element, index) => {
    element.style.width = data[index].width + 'px';
    element.style.height = data[index].height + 'px';
    element.textContent = data[index].text;
  });
}

// ✅ Efficient: Batched updates
function efficientDOMUpdate(elements, data) {
  const fragment = document.createDocumentFragment();
  
  elements.forEach((element, index) => {
    const clone = element.cloneNode(true);
    clone.style.width = data[index].width + 'px';
    clone.style.height = data[index].height + 'px';
    clone.textContent = data[index].text;
    fragment.appendChild(clone);
  });
  
  // Single DOM update
  elements[0].parentNode.replaceChildren(fragment);
}
```

### Virtual Scrolling
```javascript
class VirtualScrollList {
  constructor(container, itemHeight, totalItems) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.totalItems = totalItems;
    this.visibleItems = Math.ceil(container.clientHeight / itemHeight) + 2;
    
    this.setupScrolling();
  }
  
  setupScrolling() {
    this.container.addEventListener('scroll', () => {
      this.updateVisibleItems();
    });
    
    this.updateVisibleItems();
  }
  
  updateVisibleItems() {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleItems, this.totalItems);
    
    this.renderItems(startIndex, endIndex);
  }
  
  renderItems(start, end) {
    // Only render visible items
    const items = [];
    for (let i = start; i < end; i++) {
      items.push(this.createItem(i));
    }
    
    this.container.innerHTML = '';
    items.forEach(item => this.container.appendChild(item));
  }
}
```

## Network Optimization

### Resource Preloading
```javascript
// Preload critical resources
function preloadResources(urls) {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = 'script';
    document.head.appendChild(link);
  });
}

// Prefetch future resources
function prefetchResources(urls) {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  });
}
```

### Request Optimization
```javascript
// Request batching
class RequestBatcher {
  constructor(batchSize = 10, delay = 100) {
    this.batchSize = batchSize;
    this.delay = delay;
    this.queue = [];
    this.timer = null;
  }
  
  add(request) {
    this.queue.push(request);
    
    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.delay);
    }
  }
  
  flush() {
    if (this.queue.length === 0) return;
    
    const batch = this.queue.splice(0);
    clearTimeout(this.timer);
    this.timer = null;
    
    // Send batched request
    this.sendBatch(batch);
  }
  
  sendBatch(requests) {
    fetch('/api/batch', {
      method: 'POST',
      body: JSON.stringify(requests)
    });
  }
}
```

## Performance Monitoring

### Real User Monitoring (RUM)
```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.setupObservers();
  }
  
  setupObservers() {
    // Monitor Core Web Vitals
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.entryType === 'largest-contentful-paint') {
          this.recordMetric('LCP', entry.startTime);
        }
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Monitor First Input Delay
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        this.recordMetric('FID', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });
  }
  
  recordMetric(name, value) {
    this.metrics.set(name, value);
    
    // Send to analytics
    this.sendMetric(name, value);
  }
  
  sendMetric(name, value) {
    // Send to monitoring service
    navigator.sendBeacon('/analytics', JSON.stringify({
      metric: name,
      value: value,
      timestamp: Date.now()
    }));
  }
}
```

## Key Takeaways

* **Algorithm optimization** provides the biggest performance gains
* **Memory management** prevents performance degradation over time
* **Bundle optimization** reduces initial load times
* **Caching strategies** improve repeat visit performance
* **DOM optimization** prevents layout thrashing
* **Network optimization** reduces resource loading time
* **Performance monitoring** enables data-driven optimization
* **Measure before optimizing** to identify actual bottlenecks
* **Consider user-perceived performance** over raw metrics
* **Optimize for the critical rendering path** first
