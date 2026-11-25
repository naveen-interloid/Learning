# **11.8 Performance Profiling & Optimization**

Performance profiling is essential for identifying bottlenecks and optimizing JavaScript applications. This section covers tools, techniques, and strategies for measuring and improving performance.

## Performance Measurement Fundamentals

### Basic Performance APIs

```javascript
// Using performance APIs for measurement
class PerformanceMeasurement {
  static basicTiming() {
    console.log('=== Basic Performance Timing ===');
    
    // High-resolution timing
    const start = performance.now();
    
    // Simulate some work
    let sum = 0;
    for (let i = 0; i < 1000000; i++) {
      sum += Math.sqrt(i);
    }
    
    const end = performance.now();
    console.log(`Operation took ${(end - start).toFixed(2)} milliseconds`);
    console.log(`Result: ${sum}`);
  }
  
  static performanceMarks() {
    console.log('=== Performance Marks and Measures ===');
    
    // Mark the start
    performance.mark('operation-start');
    
    // Simulate async operation
    setTimeout(() => {
      performance.mark('operation-end');
      
      // Create a measure
      performance.measure('operation-duration', 'operation-start', 'operation-end');
      
      // Get the measure
      const measures = performance.getEntriesByName('operation-duration');
      console.log(`Async operation took ${measures[0].duration.toFixed(2)}ms`);
      
      // Clean up
      performance.clearMarks();
      performance.clearMeasures();
    }, 100);
  }
  
  static memoryMeasurement() {
    console.log('=== Memory Measurement ===');
    
    if (performance.memory) {
      const memory = performance.memory;
      console.log('Memory usage:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    } else {
      console.log('Memory API not available');
    }
  }
}

PerformanceMeasurement.basicTiming();
PerformanceMeasurement.performanceMarks();
PerformanceMeasurement.memoryMeasurement();
```

### Performance Observer API

```javascript
// Using Performance Observer for detailed monitoring
class PerformanceObserverDemo {
  static observeNavigationTiming() {
    console.log('=== Navigation Timing Observer ===');
    
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            console.log('Navigation timing:', {
              domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
              loadComplete: entry.loadEventEnd - entry.loadEventStart,
              firstPaint: entry.responseEnd - entry.requestStart,
              domInteractive: entry.domInteractive - entry.navigationStart
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['navigation'] });
    }
  }
  
  static observeLongTasks() {
    console.log('=== Long Task Observer ===');
    
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          console.warn(`Long task detected: ${entry.duration.toFixed(2)}ms`, {
            name: entry.name,
            startTime: entry.startTime,
            duration: entry.duration
          });
        }
      });
      
      try {
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        console.log('Long task observer not supported');
      }
    }
  }
  
  static observeResourceTiming() {
    console.log('=== Resource Timing Observer ===');
    
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'resource') {
            console.log(`Resource loaded: ${entry.name}`, {
              duration: entry.duration.toFixed(2),
              size: entry.transferSize,
              type: entry.initiatorType
            });
          }
        }
      });
      
      observer.observe({ entryTypes: ['resource'] });
    }
  }
}

PerformanceObserverDemo.observeNavigationTiming();
PerformanceObserverDemo.observeLongTasks();
PerformanceObserverDemo.observeResourceTiming();
```

## Profiling Tools and Techniques

### Custom Profiler Implementation

```javascript
// Building a custom profiler
class CustomProfiler {
  constructor() {
    this.profiles = new Map();
    this.activeProfiles = new Map();
  }
  
  start(name) {
    this.activeProfiles.set(name, {
      startTime: performance.now(),
      startMemory: this.getMemoryUsage()
    });
  }
  
  end(name) {
    const active = this.activeProfiles.get(name);
    if (!active) {
      console.warn(`No active profile found for: ${name}`);
      return;
    }
    
    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    
    const profile = {
      name,
      duration: endTime - active.startTime,
      memoryDelta: endMemory - active.startMemory,
      timestamp: new Date().toISOString()
    };
    
    if (!this.profiles.has(name)) {
      this.profiles.set(name, []);
    }
    
    this.profiles.get(name).push(profile);
    this.activeProfiles.delete(name);
    
    return profile;
  }
  
  getMemoryUsage() {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }
  
  getReport(name) {
    const profiles = this.profiles.get(name) || [];
    if (profiles.length === 0) {
      return null;
    }
    
    const durations = profiles.map(p => p.duration);
    const memoryDeltas = profiles.map(p => p.memoryDelta);
    
    return {
      name,
      count: profiles.length,
      totalDuration: durations.reduce((a, b) => a + b, 0),
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      averageMemoryDelta: memoryDeltas.reduce((a, b) => a + b, 0) / memoryDeltas.length,
      profiles: profiles.slice(-10) // Last 10 profiles
    };
  }
  
  getAllReports() {
    const reports = {};
    for (const name of this.profiles.keys()) {
      reports[name] = this.getReport(name);
    }
    return reports;
  }
  
  clear(name) {
    if (name) {
      this.profiles.delete(name);
    } else {
      this.profiles.clear();
    }
  }
}

// Usage example
const profiler = new CustomProfiler();

function profiledFunction(n) {
  profiler.start('fibonacci');
  
  function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
  }
  
  const result = fibonacci(n);
  const profile = profiler.end('fibonacci');
  
  console.log(`Fibonacci(${n}) = ${result}`, profile);
  return result;
}

// Test the profiler
profiledFunction(30);
profiledFunction(35);

console.log('Profiler report:', profiler.getReport('fibonacci'));
```

### Function-level Profiling

```javascript
// Function-level profiling utilities
class FunctionProfiler {
  static wrapFunction(fn, name) {
    return function(...args) {
      const start = performance.now();
      const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
      
      try {
        const result = fn.apply(this, args);
        
        // Handle async functions
        if (result && typeof result.then === 'function') {
          return result.finally(() => {
            const end = performance.now();
            const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
            
            console.log(`[PROFILE] ${name} (async):`, {
              duration: `${(end - start).toFixed(2)}ms`,
              memoryDelta: `${((endMemory - startMemory) / 1024).toFixed(2)}KB`
            });
          });
        } else {
          const end = performance.now();
          const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
          
          console.log(`[PROFILE] ${name}:`, {
            duration: `${(end - start).toFixed(2)}ms`,
            memoryDelta: `${((endMemory - startMemory) / 1024).toFixed(2)}KB`
          });
          
          return result;
        }
      } catch (error) {
        const end = performance.now();
        console.log(`[PROFILE] ${name} (error):`, {
          duration: `${(end - start).toFixed(2)}ms`,
          error: error.message
        });
        throw error;
      }
    };
  }
  
  static profileClass(ClassConstructor) {
    const prototype = ClassConstructor.prototype;
    const methodNames = Object.getOwnPropertyNames(prototype)
      .filter(name => name !== 'constructor' && typeof prototype[name] === 'function');
    
    methodNames.forEach(methodName => {
      const originalMethod = prototype[methodName];
      prototype[methodName] = this.wrapFunction(originalMethod, `${ClassConstructor.name}.${methodName}`);
    });
    
    return ClassConstructor;
  }
}

// Example usage
@FunctionProfiler.profileClass
class ExampleClass {
  heavyComputation(n) {
    let result = 0;
    for (let i = 0; i < n; i++) {
      result += Math.sqrt(i);
    }
    return result;
  }
  
  async asyncOperation() {
    await new Promise(resolve => setTimeout(resolve, 100));
    return 'async result';
  }
}

const example = new ExampleClass();
example.heavyComputation(1000000);
example.asyncOperation();
```

## Performance Optimization Strategies

### Code-level Optimizations

```javascript
// Code-level optimization techniques
class CodeOptimizations {
  static demonstrateLoopOptimizations() {
    console.log('=== Loop Optimizations ===');
    
    const data = Array.from({length: 1000000}, (_, i) => i);
    
    // ❌ Inefficient: Property access in loop condition
    console.time('Inefficient loop');
    let sum1 = 0;
    for (let i = 0; i < data.length; i++) {
      sum1 += data[i];
    }
    console.timeEnd('Inefficient loop');
    
    // ✅ Efficient: Cache length
    console.time('Efficient loop');
    let sum2 = 0;
    const length = data.length;
    for (let i = 0; i < length; i++) {
      sum2 += data[i];
    }
    console.timeEnd('Efficient loop');
    
    // ✅ Most efficient: Use built-in methods when possible
    console.time('Built-in method');
    const sum3 = data.reduce((a, b) => a + b, 0);
    console.timeEnd('Built-in method');
    
    console.log('All sums equal:', sum1 === sum2 && sum2 === sum3);
  }
  
  static demonstrateObjectOptimizations() {
    console.log('=== Object Access Optimizations ===');
    
    const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
    const iterations = 1000000;
    
    // ❌ Inefficient: Repeated property access
    console.time('Repeated property access');
    let sum1 = 0;
    for (let i = 0; i < iterations; i++) {
      sum1 += obj.a + obj.b + obj.c + obj.d + obj.e;
    }
    console.timeEnd('Repeated property access');
    
    // ✅ Efficient: Cache property values
    console.time('Cached property access');
    const {a, b, c, d, e} = obj;
    let sum2 = 0;
    for (let i = 0; i < iterations; i++) {
      sum2 += a + b + c + d + e;
    }
    console.timeEnd('Cached property access');
    
    console.log('Sums equal:', sum1 === sum2);
  }
  
  static demonstrateStringOptimizations() {
    console.log('=== String Optimizations ===');
    
    const parts = Array.from({length: 1000}, (_, i) => `part${i}`);
    
    // ❌ Inefficient: String concatenation in loop
    console.time('String concatenation');
    let result1 = '';
    for (const part of parts) {
      result1 += part + ' ';
    }
    console.timeEnd('String concatenation');
    
    // ✅ Efficient: Array join
    console.time('Array join');
    const result2 = parts.join(' ') + ' ';
    console.timeEnd('Array join');
    
    console.log('Results equal:', result1 === result2);
  }
}

CodeOptimizations.demonstrateLoopOptimizations();
CodeOptimizations.demonstrateObjectOptimizations();
CodeOptimizations.demonstrateStringOptimizations();
```

### Memory Optimization

```javascript
// Memory optimization techniques
class MemoryOptimizations {
  static demonstrateObjectPooling() {
    console.log('=== Object Pooling ===');
    
    class Vector2D {
      constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
      }
      
      reset(x = 0, y = 0) {
        this.x = x;
        this.y = y;
        return this;
      }
      
      add(other) {
        this.x += other.x;
        this.y += other.y;
        return this;
      }
    }
    
    class Vector2DPool {
      constructor(initialSize = 100) {
        this.pool = [];
        for (let i = 0; i < initialSize; i++) {
          this.pool.push(new Vector2D());
        }
      }
      
      acquire(x, y) {
        if (this.pool.length > 0) {
          return this.pool.pop().reset(x, y);
        }
        return new Vector2D(x, y);
      }
      
      release(vector) {
        this.pool.push(vector.reset());
      }
    }
    
    const pool = new Vector2DPool();
    
    // Benchmark with pooling
    console.time('With object pooling');
    for (let i = 0; i < 100000; i++) {
      const v1 = pool.acquire(i, i + 1);
      const v2 = pool.acquire(i + 2, i + 3);
      v1.add(v2);
      pool.release(v1);
      pool.release(v2);
    }
    console.timeEnd('With object pooling');
    
    // Benchmark without pooling
    console.time('Without object pooling');
    for (let i = 0; i < 100000; i++) {
      const v1 = new Vector2D(i, i + 1);
      const v2 = new Vector2D(i + 2, i + 3);
      v1.add(v2);
      // Objects become eligible for GC
    }
    console.timeEnd('Without object pooling');
  }
  
  static demonstrateTypedArrays() {
    console.log('=== Typed Arrays vs Regular Arrays ===');
    
    const size = 1000000;
    
    // Regular array
    console.time('Regular array creation');
    const regularArray = new Array(size);
    for (let i = 0; i < size; i++) {
      regularArray[i] = Math.random();
    }
    console.timeEnd('Regular array creation');
    
    // Typed array
    console.time('Typed array creation');
    const typedArray = new Float64Array(size);
    for (let i = 0; i < size; i++) {
      typedArray[i] = Math.random();
    }
    console.timeEnd('Typed array creation');
    
    // Processing comparison
    console.time('Regular array processing');
    let sum1 = 0;
    for (let i = 0; i < size; i++) {
      sum1 += regularArray[i];
    }
    console.timeEnd('Regular array processing');
    
    console.time('Typed array processing');
    let sum2 = 0;
    for (let i = 0; i < size; i++) {
      sum2 += typedArray[i];
    }
    console.timeEnd('Typed array processing');
    
    console.log('Processing results similar:', Math.abs(sum1 - sum2) < 0.001);
  }
}

MemoryOptimizations.demonstrateObjectPooling();
MemoryOptimizations.demonstrateTypedArrays();
```

## Best Practices

### Performance Best Practices

```javascript
// Performance best practices
class PerformanceBestPractices {
  static measureFirst() {
    console.log('=== Always Measure First ===');
    
    // Create a simple benchmark utility
    function benchmark(name, fn, iterations = 1000) {
      const start = performance.now();
      
      for (let i = 0; i < iterations; i++) {
        fn();
      }
      
      const end = performance.now();
      const avgTime = (end - start) / iterations;
      
      console.log(`${name}: ${avgTime.toFixed(4)}ms per iteration`);
      return avgTime;
    }
    
    // Example: Compare different approaches
    const data = Array.from({length: 1000}, (_, i) => i);
    
    benchmark('for loop', () => {
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += data[i];
      }
      return sum;
    });
    
    benchmark('forEach', () => {
      let sum = 0;
      data.forEach(x => sum += x);
      return sum;
    });
    
    benchmark('reduce', () => {
      return data.reduce((a, b) => a + b, 0);
    });
  }
  
  static avoidPrematureOptimization() {
    console.log('=== Avoid Premature Optimization ===');
    
    // ❌ Premature optimization: Complex but unnecessary
    function prematurelyOptimized(arr) {
      // Overly complex optimization for simple task
      const len = arr.length;
      const chunks = Math.ceil(len / 4);
      let sum = 0;
      
      for (let chunk = 0; chunk < 4; chunk++) {
        const start = chunk * chunks;
        const end = Math.min(start + chunks, len);
        
        for (let i = start; i < end; i++) {
          sum += arr[i];
        }
      }
      
      return sum;
    }
    
    // ✅ Simple and readable
    function simpleApproach(arr) {
      return arr.reduce((a, b) => a + b, 0);
    }
    
    const testData = Array.from({length: 1000}, (_, i) => i);
    
    console.time('Prematurely optimized');
    const result1 = prematurelyOptimized(testData);
    console.timeEnd('Prematurely optimized');
    
    console.time('Simple approach');
    const result2 = simpleApproach(testData);
    console.timeEnd('Simple approach');
    
    console.log('Results equal:', result1 === result2);
    console.log('Simple is often better!');
  }
  
  static profileInProduction() {
    console.log('=== Production Profiling ===');
    
    // Lightweight production profiler
    class ProductionProfiler {
      constructor(sampleRate = 0.01) { // 1% sampling
        this.sampleRate = sampleRate;
        this.metrics = new Map();
      }
      
      profile(name, fn) {
        if (Math.random() > this.sampleRate) {
          return fn(); // Skip profiling
        }
        
        const start = performance.now();
        const result = fn();
        const duration = performance.now() - start;
        
        if (!this.metrics.has(name)) {
          this.metrics.set(name, []);
        }
        
        this.metrics.get(name).push(duration);
        
        // Keep only recent samples
        const samples = this.metrics.get(name);
        if (samples.length > 100) {
          samples.shift();
        }
        
        return result;
      }
      
      getStats(name) {
        const samples = this.metrics.get(name) || [];
        if (samples.length === 0) return null;
        
        const sorted = [...samples].sort((a, b) => a - b);
        return {
          count: samples.length,
          avg: samples.reduce((a, b) => a + b) / samples.length,
          p50: sorted[Math.floor(sorted.length * 0.5)],
          p95: sorted[Math.floor(sorted.length * 0.95)],
          p99: sorted[Math.floor(sorted.length * 0.99)]
        };
      }
    }
    
    const prodProfiler = new ProductionProfiler(1.0); // 100% for demo
    
    // Example usage
    function expensiveOperation() {
      let result = 0;
      for (let i = 0; i < 100000; i++) {
        result += Math.sqrt(i);
      }
      return result;
    }
    
    // Profile multiple calls
    for (let i = 0; i < 50; i++) {
      prodProfiler.profile('expensiveOperation', expensiveOperation);
    }
    
    console.log('Production stats:', prodProfiler.getStats('expensiveOperation'));
  }
}

PerformanceBestPractices.measureFirst();
PerformanceBestPractices.avoidPrematureOptimization();
PerformanceBestPractices.profileInProduction();
```

## Key Takeaways

* **Measure before optimizing** - Use performance APIs and profiling tools
* **Performance Observer** provides detailed timing information
* **Custom profilers** help track application-specific metrics
* **Code-level optimizations** can provide significant improvements
* **Memory optimization** reduces GC pressure and improves performance
* **Object pooling** reduces allocation overhead
* **Typed arrays** are more efficient for numeric data
* **Avoid premature optimization** - profile first, optimize bottlenecks
* **Production profiling** with sampling provides real-world insights
* **Continuous monitoring** helps maintain performance over time
