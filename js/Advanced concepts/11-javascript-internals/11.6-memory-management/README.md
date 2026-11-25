# **11.6 Memory Management & Garbage Collection**

Understanding JavaScript's memory management and garbage collection is crucial for building performant applications and avoiding memory leaks.

## JavaScript Memory Model

### Heap and Stack

```javascript
// Understanding memory allocation
class MemoryModel {
  static demonstrateStackVsHeap() {
    // Stack: Primitive values and references
    let number = 42;        // Stored on stack
    let string = "hello";   // Reference on stack, value on heap
    let boolean = true;     // Stored on stack
    
    // Heap: Objects and complex data structures
    let object = { value: 42 };     // Reference on stack, object on heap
    let array = [1, 2, 3];          // Reference on stack, array on heap
    let function_ref = function() {}; // Reference on stack, function on heap
    
    console.log('Primitives and references demonstrated');
  }
  
  static demonstrateReferenceTypes() {
    // Reference copying vs value copying
    let a = 5;
    let b = a;    // Value copied
    a = 10;
    console.log('a:', a, 'b:', b); // a: 10, b: 5
    
    let obj1 = { value: 5 };
    let obj2 = obj1;  // Reference copied
    obj1.value = 10;
    console.log('obj1.value:', obj1.value, 'obj2.value:', obj2.value); // Both: 10
    
    // This is why garbage collection is needed
    obj1 = null;  // Remove one reference
    obj2 = null;  // Remove last reference - object can be collected
  }
}

MemoryModel.demonstrateStackVsHeap();
MemoryModel.demonstrateReferenceTypes();
```

## Garbage Collection Algorithms

### Mark and Sweep

```javascript
// Understanding mark and sweep algorithm
class MarkAndSweep {
  static demonstrateReachability() {
    // Objects reachable from roots are kept
    let root = {
      child1: { value: 1 },
      child2: { value: 2 }
    };
    
    root.child1.parent = root;  // Circular reference
    root.child2.sibling = root.child1;
    
    console.log('Created object graph with references');
    
    // All objects are reachable from 'root'
    // Mark phase: Mark all reachable objects
    // Sweep phase: Collect unmarked objects
    
    root = null;  // Remove root reference
    // Now all objects become unreachable and can be collected
    console.log('Removed root - objects now unreachable');
  }
  
  static demonstrateCircularReferences() {
    // Circular references don't prevent collection in modern engines
    function createCircularStructure() {
      let obj1 = { name: 'obj1' };
      let obj2 = { name: 'obj2' };
      
      obj1.ref = obj2;
      obj2.ref = obj1;  // Circular reference
      
      return obj1;
    }
    
    let circular = createCircularStructure();
    console.log('Created circular reference');
    
    circular = null;  // Remove external reference
    // Both objects become unreachable despite circular reference
    console.log('Circular structure can be collected');
  }
}

MarkAndSweep.demonstrateReachability();
MarkAndSweep.demonstrateCircularReferences();
```

### Generational Garbage Collection

```javascript
// Understanding generational GC
class GenerationalGC {
  static demonstrateGenerations() {
    // Young generation: Recently allocated objects
    function createShortLivedObjects() {
      let temp = [];
      for (let i = 0; i < 1000; i++) {
        temp.push({ id: i, data: new Array(100).fill(i) });
      }
      // temp goes out of scope - objects become unreachable
      return temp.length;
    }
    
    console.log('Created short-lived objects:', createShortLivedObjects());
    // These objects will be collected by minor GC (scavenger)
    
    // Old generation: Long-lived objects
    const longLived = [];
    function createLongLivedObjects() {
      for (let i = 0; i < 100; i++) {
        longLived.push({
          id: i,
          data: new Array(1000).fill(i),
          timestamp: Date.now()
        });
      }
    }
    
    createLongLivedObjects();
    console.log('Created long-lived objects:', longLived.length);
    // These objects survive minor GC and move to old generation
  }
  
  static demonstrateWeakReferences() {
    // WeakMap and WeakSet don't prevent garbage collection
    const weakMap = new WeakMap();
    const regularMap = new Map();
    
    function createObjectsWithReferences() {
      for (let i = 0; i < 100; i++) {
        let obj = { id: i };
        
        // WeakMap reference doesn't prevent GC
        weakMap.set(obj, `weak-value-${i}`);
        
        // Regular Map reference prevents GC
        if (i < 10) {
          regularMap.set(`key-${i}`, obj);
        }
        
        // obj goes out of scope
        // Objects not in regularMap can be collected
      }
    }
    
    createObjectsWithReferences();
    console.log('WeakMap allows garbage collection');
    console.log('Regular Map prevents garbage collection');
  }
}

GenerationalGC.demonstrateGenerations();
GenerationalGC.demonstrateWeakReferences();
```

## Memory Leaks and Prevention

### Common Memory Leak Patterns

```javascript
// Common memory leak patterns and prevention
class MemoryLeaks {
  static demonstrateEventListenerLeaks() {
    // ❌ Memory leak: Event listeners not removed
    function createLeakyElement() {
      const element = document.createElement('div');
      const data = new Array(1000000).fill('leak'); // Large data
      
      element.addEventListener('click', function() {
        console.log(data.length); // Closure keeps data alive
      });
      
      document.body.appendChild(element);
      return element;
    }
    
    // ✅ Proper cleanup
    function createCleanElement() {
      const element = document.createElement('div');
      const data = new Array(1000000).fill('clean');
      
      function clickHandler() {
        console.log(data.length);
      }
      
      element.addEventListener('click', clickHandler);
      document.body.appendChild(element);
      
      // Return cleanup function
      return {
        element,
        cleanup: () => {
          element.removeEventListener('click', clickHandler);
          element.remove();
        }
      };
    }
    
    console.log('Event listener leak patterns demonstrated');
  }
  
  static demonstrateClosureLeaks() {
    // ❌ Memory leak: Closures keeping large objects alive
    function createLeakyClosure() {
      const largeData = new Array(1000000).fill('data');
      
      return function(input) {
        // This closure keeps largeData alive even if not used
        return input.toUpperCase();
      };
    }
    
    // ✅ Avoid unnecessary closures
    function createCleanClosure() {
      // Don't capture unnecessary variables
      return function(input) {
        return input.toUpperCase();
      };
    }
    
    const leaky = createLeakyClosure();
    const clean = createCleanClosure();
    
    console.log('Closure leak patterns demonstrated');
  }
  
  static demonstrateTimerLeaks() {
    // ❌ Memory leak: Timers not cleared
    function createLeakyTimer() {
      const data = new Array(1000000).fill('timer');
      
      const intervalId = setInterval(() => {
        console.log(data.length); // Keeps data alive
      }, 1000);
      
      // intervalId never cleared - memory leak!
      return intervalId;
    }
    
    // ✅ Proper timer cleanup
    function createCleanTimer() {
      const data = new Array(1000000).fill('timer');
      
      const intervalId = setInterval(() => {
        console.log(data.length);
      }, 1000);
      
      // Return cleanup function
      return {
        intervalId,
        cleanup: () => clearInterval(intervalId)
      };
    }
    
    console.log('Timer leak patterns demonstrated');
  }
  
  static demonstrateGlobalVariableLeaks() {
    // ❌ Memory leak: Accidental global variables
    function createAccidentalGlobal() {
      // Forgot 'var', 'let', or 'const'
      accidentalGlobal = new Array(1000000).fill('global');
      return accidentalGlobal.length;
    }
    
    // ✅ Proper variable declaration
    function createProperLocal() {
      const properLocal = new Array(1000000).fill('local');
      return properLocal.length;
    }
    
    console.log('Global variable leak patterns demonstrated');
  }
}

MemoryLeaks.demonstrateEventListenerLeaks();
MemoryLeaks.demonstrateClosureLeaks();
MemoryLeaks.demonstrateTimerLeaks();
MemoryLeaks.demonstrateGlobalVariableLeaks();
```

### Memory Leak Detection

```javascript
// Techniques for detecting memory leaks
class MemoryLeakDetection {
  static monitorMemoryUsage() {
    // Monitor memory usage (Node.js)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      function logMemoryUsage(label) {
        const usage = process.memoryUsage();
        console.log(`${label}:`, {
          heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + ' MB',
          heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + ' MB',
          external: Math.round(usage.external / 1024 / 1024) + ' MB'
        });
      }
      
      logMemoryUsage('Initial');
      
      // Create some objects
      const objects = [];
      for (let i = 0; i < 10000; i++) {
        objects.push({ id: i, data: new Array(100).fill(i) });
      }
      
      logMemoryUsage('After creating objects');
      
      // Clear references
      objects.length = 0;
      
      logMemoryUsage('After clearing references');
    }
    
    // Monitor memory usage (Browser)
    if (typeof performance !== 'undefined' && performance.memory) {
      function logBrowserMemory(label) {
        const memory = performance.memory;
        console.log(`${label}:`, {
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB'
        });
      }
      
      logBrowserMemory('Browser memory');
    }
  }
  
  static createMemoryLeakDetector() {
    // Simple memory leak detector
    class MemoryLeakDetector {
      constructor() {
        this.snapshots = [];
        this.threshold = 10 * 1024 * 1024; // 10MB
      }
      
      takeSnapshot(label) {
        const snapshot = {
          label,
          timestamp: Date.now(),
          memory: this.getMemoryUsage()
        };
        
        this.snapshots.push(snapshot);
        
        if (this.snapshots.length > 1) {
          this.analyzeGrowth();
        }
        
        return snapshot;
      }
      
      getMemoryUsage() {
        if (typeof process !== 'undefined' && process.memoryUsage) {
          return process.memoryUsage().heapUsed;
        } else if (typeof performance !== 'undefined' && performance.memory) {
          return performance.memory.usedJSHeapSize;
        }
        return 0;
      }
      
      analyzeGrowth() {
        const current = this.snapshots[this.snapshots.length - 1];
        const previous = this.snapshots[this.snapshots.length - 2];
        
        const growth = current.memory - previous.memory;
        const timeDiff = current.timestamp - previous.timestamp;
        
        if (growth > this.threshold) {
          console.warn(`Potential memory leak detected:
            Growth: ${Math.round(growth / 1024 / 1024)} MB
            Time: ${timeDiff} ms
            From: ${previous.label}
            To: ${current.label}`);
        }
      }
      
      getReport() {
        return {
          snapshots: this.snapshots.length,
          totalGrowth: this.snapshots.length > 1 ? 
            this.snapshots[this.snapshots.length - 1].memory - this.snapshots[0].memory : 0,
          averageGrowth: this.snapshots.length > 1 ?
            (this.snapshots[this.snapshots.length - 1].memory - this.snapshots[0].memory) / 
            (this.snapshots.length - 1) : 0
        };
      }
    }
    
    const detector = new MemoryLeakDetector();
    
    detector.takeSnapshot('Initial');
    
    // Simulate some operations
    const data = [];
    for (let i = 0; i < 1000; i++) {
      data.push(new Array(1000).fill(i));
    }
    
    detector.takeSnapshot('After data creation');
    
    console.log('Memory leak detector report:', detector.getReport());
  }
}

MemoryLeakDetection.monitorMemoryUsage();
MemoryLeakDetection.createMemoryLeakDetector();
```

## Memory Optimization Techniques

### Efficient Memory Usage

```javascript
// Techniques for efficient memory usage
class MemoryOptimization {
  static useObjectPools() {
    // Object pooling to reduce GC pressure
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
        if (this.pool.length > 0) {
          return this.pool.pop();
        } else {
          return this.createFn();
        }
      }
      
      release(obj) {
        this.resetFn(obj);
        this.pool.push(obj);
      }
    }
    
    // Example: Vector pool for game development
    const vectorPool = new ObjectPool(
      () => ({ x: 0, y: 0 }),           // Create function
      (v) => { v.x = 0; v.y = 0; },     // Reset function
      100                                // Initial size
    );
    
    // Usage
    const vector = vectorPool.acquire();
    vector.x = 10;
    vector.y = 20;
    
    // Use vector...
    
    vectorPool.release(vector); // Return to pool
    
    console.log('Object pooling reduces GC pressure');
  }
  
  static useTypedArrays() {
    // Typed arrays for efficient numeric data
    
    // ❌ Less efficient: Regular array
    const regularArray = [];
    for (let i = 0; i < 10000; i++) {
      regularArray.push(Math.random());
    }
    
    // ✅ More efficient: Typed array
    const typedArray = new Float64Array(10000);
    for (let i = 0; i < typedArray.length; i++) {
      typedArray[i] = Math.random();
    }
    
    // Typed arrays:
    // - Use less memory
    // - Have better cache locality
    // - Are faster for numeric operations
    
    console.log('Typed arrays are more memory efficient');
  }
  
  static avoidMemoryFragmentation() {
    // Techniques to avoid memory fragmentation
    
    // ✅ Good: Allocate similar-sized objects together
    function createBatch(size, count) {
      const batch = [];
      for (let i = 0; i < count; i++) {
        batch.push(new Array(size).fill(i));
      }
      return batch;
    }
    
    const smallObjects = createBatch(10, 1000);
    const mediumObjects = createBatch(100, 100);
    const largeObjects = createBatch(1000, 10);
    
    // ❌ Bad: Mixing different sized allocations
    function createMixed() {
      const mixed = [];
      for (let i = 0; i < 100; i++) {
        mixed.push(new Array(Math.random() * 1000).fill(i));
      }
      return mixed;
    }
    
    console.log('Batched allocation reduces fragmentation');
  }
  
  static useWeakReferences() {
    // Use WeakMap/WeakSet for caches that shouldn't prevent GC
    
    // ❌ Bad: Regular Map prevents GC
    const regularCache = new Map();
    
    function cacheWithMap(obj, data) {
      regularCache.set(obj, data);
      // obj cannot be garbage collected while in cache
    }
    
    // ✅ Good: WeakMap allows GC
    const weakCache = new WeakMap();
    
    function cacheWithWeakMap(obj, data) {
      weakCache.set(obj, data);
      // obj can be garbage collected, cache entry disappears automatically
    }
    
    console.log('WeakMap allows automatic cache cleanup');
  }
}

MemoryOptimization.useObjectPools();
MemoryOptimization.useTypedArrays();
MemoryOptimization.avoidMemoryFragmentation();
MemoryOptimization.useWeakReferences();
```

## Best Practices

### Memory Management Best Practices

```javascript
// Best practices for memory management
class MemoryBestPractices {
  static properCleanup() {
    // ✅ Always clean up resources
    class ResourceManager {
      constructor() {
        this.resources = [];
        this.timers = [];
        this.listeners = [];
      }
      
      addResource(resource) {
        this.resources.push(resource);
      }
      
      addTimer(timer) {
        this.timers.push(timer);
      }
      
      addListener(element, event, handler) {
        element.addEventListener(event, handler);
        this.listeners.push({ element, event, handler });
      }
      
      cleanup() {
        // Clear all timers
        this.timers.forEach(timer => clearInterval(timer));
        this.timers = [];
        
        // Remove all event listeners
        this.listeners.forEach(({ element, event, handler }) => {
          element.removeEventListener(event, handler);
        });
        this.listeners = [];
        
        // Clean up resources
        this.resources.forEach(resource => {
          if (resource.cleanup) {
            resource.cleanup();
          }
        });
        this.resources = [];
      }
    }
    
    console.log('Proper resource cleanup prevents leaks');
  }
  
  static avoidGlobalVariables() {
    // ✅ Use modules or namespaces instead of globals
    const MyModule = (function() {
      let privateData = [];
      
      return {
        addData(item) {
          privateData.push(item);
        },
        
        clearData() {
          privateData = [];
        },
        
        getDataCount() {
          return privateData.length;
        }
      };
    })();
    
    // ❌ Avoid accidental globals
    function badFunction() {
      // accidentalGlobal = 'oops'; // Creates global variable
    }
    
    console.log('Modules prevent accidental globals');
  }
  
  static useAppropriateDataStructures() {
    // Choose data structures based on usage patterns
    
    // For frequent additions/removals: Set
    const uniqueItems = new Set();
    uniqueItems.add('item1');
    uniqueItems.delete('item1');
    
    // For key-value with object keys: Map
    const objectMap = new Map();
    const keyObj = {};
    objectMap.set(keyObj, 'value');
    
    // For temporary associations: WeakMap
    const tempAssociations = new WeakMap();
    tempAssociations.set(keyObj, 'temp data');
    
    // For large numeric arrays: Typed arrays
    const numbers = new Float64Array(10000);
    
    console.log('Appropriate data structures improve efficiency');
  }
}

MemoryBestPractices.properCleanup();
MemoryBestPractices.avoidGlobalVariables();
MemoryBestPractices.useAppropriateDataStructures();
```

## Key Takeaways

* **Garbage collection** automatically manages memory in JavaScript
* **Mark and sweep** is the primary GC algorithm
* **Generational GC** optimizes for object lifetime patterns
* **Memory leaks** occur when objects remain reachable unintentionally
* **WeakMap/WeakSet** allow garbage collection of keys/values
* **Object pooling** reduces GC pressure for frequently created objects
* **Typed arrays** are more memory efficient for numeric data
* **Proper cleanup** of event listeners and timers prevents leaks
* **Understanding GC** helps write more efficient JavaScript
* **Memory profiling** tools help identify and fix memory issues
