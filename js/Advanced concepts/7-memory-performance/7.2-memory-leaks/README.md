# **7.2 Memory Leaks Prevention**

Memory leaks occur when JavaScript applications retain references to objects that are no longer needed, preventing garbage collection. Understanding common leak patterns and prevention strategies is crucial for building performant applications.

## Common Memory Leak Patterns

### Event Listener Leaks

```javascript
// event-listener-leaks.js - Event listener memory leak patterns
class EventListenerLeakDemo {
  static demonstrateLeakyEventListeners() {
    console.log('=== Event Listener Leak Patterns ===');
    
    // ❌ BAD: Event listeners without cleanup
    function createLeakyComponent() {
      const element = document.createElement('div');
      element.className = 'leaky-component';
      element.innerHTML = '<button>Click me</button>';
      
      const button = element.querySelector('button');
      
      // This creates a memory leak if element is removed without cleanup
      button.addEventListener('click', function() {
        console.log('Button clicked');
        // This closure keeps the entire element in memory
        element.style.background = 'red';
      });
      
      // Global event listener without cleanup
      window.addEventListener('resize', function() {
        // This keeps the element reference alive
        element.style.width = window.innerWidth + 'px';
      });
      
      return element;
    }
    
    // ✅ GOOD: Proper event listener cleanup
    function createCleanComponent() {
      const element = document.createElement('div');
      element.className = 'clean-component';
      element.innerHTML = '<button>Click me</button>';
      
      const button = element.querySelector('button');
      
      // Store references for cleanup
      const clickHandler = function() {
        console.log('Clean button clicked');
        element.style.background = 'green';
      };
      
      const resizeHandler = function() {
        element.style.width = window.innerWidth + 'px';
      };
      
      button.addEventListener('click', clickHandler);
      window.addEventListener('resize', resizeHandler);
      
      // Cleanup method
      element.cleanup = function() {
        button.removeEventListener('click', clickHandler);
        window.removeEventListener('resize', resizeHandler);
        console.log('Event listeners cleaned up');
      };
      
      return element;
    }
    
    // Create components
    const leakyComponent = createLeakyComponent();
    const cleanComponent = createCleanComponent();
    
    document.body.appendChild(leakyComponent);
    document.body.appendChild(cleanComponent);
    
    // Simulate component removal
    setTimeout(() => {
      // Remove leaky component (listeners remain)
      document.body.removeChild(leakyComponent);
      
      // Remove clean component with proper cleanup
      cleanComponent.cleanup();
      document.body.removeChild(cleanComponent);
      
      console.log('Components removed');
    }, 3000);
  }
  
  static demonstrateAbortController() {
    console.log('\n=== AbortController for Event Cleanup ===');
    
    // ✅ MODERN: Using AbortController for automatic cleanup
    function createModernComponent() {
      const element = document.createElement('div');
      element.className = 'modern-component';
      element.innerHTML = '<button>Modern Button</button>';
      
      const button = element.querySelector('button');
      const controller = new AbortController();
      const signal = controller.signal;
      
      // All listeners use the same signal
      button.addEventListener('click', () => {
        console.log('Modern button clicked');
      }, { signal });
      
      window.addEventListener('resize', () => {
        element.style.width = window.innerWidth + 'px';
      }, { signal });
      
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          element.style.display = 'none';
        }
      }, { signal });
      
      // Single cleanup method
      element.cleanup = () => {
        controller.abort(); // Removes all listeners at once
        console.log('All event listeners aborted');
      };
      
      return element;
    }
    
    const modernComponent = createModernComponent();
    document.body.appendChild(modernComponent);
    
    setTimeout(() => {
      modernComponent.cleanup();
      document.body.removeChild(modernComponent);
    }, 2000);
  }
}

// Run event listener leak demonstrations
EventListenerLeakDemo.demonstrateLeakyEventListeners();
EventListenerLeakDemo.demonstrateAbortController();
```

### Closure and Reference Leaks

```javascript
// closure-leaks.js - Closure-related memory leaks
class ClosureLeakDemo {
  static demonstrateClosureLeaks() {
    console.log('\n=== Closure Memory Leak Patterns ===');
    
    // ❌ BAD: Closure keeping large objects alive
    function createLeakyClosures() {
      const largeData = new Array(1000000).fill('data'); // Large array
      const smallData = 'small string';
      
      // This closure keeps the entire largeData in memory
      const leakyFunction = function() {
        return smallData; // Only uses smallData but keeps largeData alive
      };
      
      return leakyFunction;
    }
    
    // ✅ GOOD: Extracting needed data to avoid large object retention
    function createCleanClosures() {
      const largeData = new Array(1000000).fill('data');
      const smallData = 'small string';
      
      // Extract only what's needed
      const extractedData = smallData;
      
      // This closure only keeps extractedData
      const cleanFunction = function() {
        return extractedData;
      };
      
      // largeData can be garbage collected
      return cleanFunction;
    }
    
    console.log('Creating leaky closures...');
    const leakyFunctions = [];
    for (let i = 0; i < 10; i++) {
      leakyFunctions.push(createLeakyClosures());
    }
    
    console.log('Creating clean closures...');
    const cleanFunctions = [];
    for (let i = 0; i < 10; i++) {
      cleanFunctions.push(createCleanClosures());
    }
    
    // Test functions
    console.log('Leaky function result:', leakyFunctions[0]());
    console.log('Clean function result:', cleanFunctions[0]());
  }
  
  static demonstrateCircularReferences() {
    console.log('\n=== Circular Reference Patterns ===');
    
    // ❌ BAD: Circular references preventing GC
    function createCircularReferences() {
      const parent = {
        name: 'parent',
        children: []
      };
      
      const child1 = {
        name: 'child1',
        parent: parent, // Reference to parent
        data: new Array(100000).fill('child1-data')
      };
      
      const child2 = {
        name: 'child2',
        parent: parent, // Reference to parent
        data: new Array(100000).fill('child2-data')
      };
      
      // Create circular references
      parent.children.push(child1, child2);
      child1.sibling = child2;
      child2.sibling = child1;
      
      return parent;
    }
    
    // ✅ GOOD: Using WeakMap to avoid circular references
    function createWeakReferences() {
      const parentChildMap = new WeakMap();
      const childParentMap = new WeakMap();
      
      const parent = {
        name: 'parent'
      };
      
      const child1 = {
        name: 'child1',
        data: new Array(100000).fill('child1-data')
      };
      
      const child2 = {
        name: 'child2',
        data: new Array(100000).fill('child2-data')
      };
      
      // Use WeakMap for relationships
      parentChildMap.set(parent, [child1, child2]);
      childParentMap.set(child1, parent);
      childParentMap.set(child2, parent);
      
      // Helper methods
      parent.getChildren = () => parentChildMap.get(parent) || [];
      child1.getParent = () => childParentMap.get(child1);
      child2.getParent = () => childParentMap.get(child2);
      
      return { parent, child1, child2 };
    }
    
    console.log('Creating circular references...');
    const circularStructure = createCircularReferences();
    console.log('Circular parent:', circularStructure.name);
    
    console.log('Creating weak references...');
    const weakStructure = createWeakReferences();
    console.log('Weak parent:', weakStructure.parent.name);
    console.log('Child1 parent:', weakStructure.child1.getParent().name);
  }
}

// Run closure leak demonstrations
ClosureLeakDemo.demonstrateClosureLeaks();
ClosureLeakDemo.demonstrateCircularReferences();
```

### Timer and Interval Leaks

```javascript
// timer-leaks.js - Timer and interval memory leaks
class TimerLeakDemo {
  static demonstrateTimerLeaks() {
    console.log('\n=== Timer Memory Leak Patterns ===');
    
    // ❌ BAD: Timers without cleanup
    function createLeakyTimers() {
      const data = {
        values: new Array(100000).fill(Math.random()),
        count: 0
      };
      
      // Leaky interval - never cleared
      setInterval(() => {
        data.count++;
        console.log('Leaky timer tick:', data.count);
        
        // This keeps the entire data object in memory
        if (data.values.length > 50000) {
          // Some operation on large data
        }
      }, 1000);
      
      // Leaky timeout chain
      function scheduleNext() {
        setTimeout(() => {
          data.count++;
          scheduleNext(); // Creates infinite chain
        }, 2000);
      }
      scheduleNext();
      
      return data;
    }
    
    // ✅ GOOD: Proper timer management
    function createManagedTimers() {
      const data = {
        values: new Array(100000).fill(Math.random()),
        count: 0,
        timers: []
      };
      
      // Store timer IDs for cleanup
      const intervalId = setInterval(() => {
        data.count++;
        console.log('Managed timer tick:', data.count);
        
        // Stop after 5 ticks
        if (data.count >= 5) {
          clearInterval(intervalId);
          console.log('Interval cleared');
        }
      }, 1000);
      
      data.timers.push(intervalId);
      
      // Controlled timeout chain
      let timeoutCount = 0;
      function scheduleNext() {
        if (timeoutCount < 3) {
          const timeoutId = setTimeout(() => {
            timeoutCount++;
            console.log('Managed timeout:', timeoutCount);
            scheduleNext();
          }, 1500);
          data.timers.push(timeoutId);
        }
      }
      scheduleNext();
      
      // Cleanup method
      data.cleanup = () => {
        data.timers.forEach(id => {
          clearTimeout(id);
          clearInterval(id);
        });
        data.timers = [];
        console.log('All timers cleared');
      };
      
      return data;
    }
    
    console.log('Creating leaky timers...');
    const leakyData = createLeakyTimers();
    
    console.log('Creating managed timers...');
    const managedData = createManagedTimers();
    
    // Cleanup managed timers after demo
    setTimeout(() => {
      managedData.cleanup();
    }, 8000);
  }
  
  static demonstrateRequestAnimationFrameLeaks() {
    console.log('\n=== RequestAnimationFrame Leak Patterns ===');
    
    // ❌ BAD: Uncontrolled animation loop
    function createLeakyAnimation() {
      const element = document.createElement('div');
      element.style.cssText = 'width: 100px; height: 100px; background: red; position: absolute;';
      document.body.appendChild(element);
      
      let position = 0;
      const largeData = new Array(50000).fill('animation-data');
      
      function animate() {
        position += 1;
        element.style.left = position + 'px';
        
        // This keeps largeData in memory indefinitely
        if (largeData.length > 0) {
          // Some operation
        }
        
        requestAnimationFrame(animate); // Infinite loop
      }
      
      animate();
      return element;
    }
    
    // ✅ GOOD: Controlled animation with cleanup
    function createManagedAnimation() {
      const element = document.createElement('div');
      element.style.cssText = 'width: 100px; height: 100px; background: green; position: absolute; top: 120px;';
      document.body.appendChild(element);
      
      let position = 0;
      let animationId = null;
      let isRunning = true;
      
      function animate() {
        if (!isRunning) return;
        
        position += 1;
        element.style.left = position + 'px';
        
        // Stop animation after moving 200px
        if (position < 200) {
          animationId = requestAnimationFrame(animate);
        } else {
          console.log('Animation completed');
          isRunning = false;
        }
      }
      
      animationId = requestAnimationFrame(animate);
      
      // Cleanup method
      element.stopAnimation = () => {
        isRunning = false;
        if (animationId) {
          cancelAnimationFrame(animationId);
          console.log('Animation cancelled');
        }
      };
      
      return element;
    }
    
    console.log('Creating leaky animation...');
    const leakyElement = createLeakyAnimation();
    
    console.log('Creating managed animation...');
    const managedElement = createManagedAnimation();
    
    // Stop animations after demo
    setTimeout(() => {
      // Remove leaky element (animation continues)
      document.body.removeChild(leakyElement);
      
      // Stop managed animation properly
      managedElement.stopAnimation();
      document.body.removeChild(managedElement);
    }, 5000);
  }
}

// Run timer leak demonstrations
TimerLeakDemo.demonstrateTimerLeaks();
TimerLeakDemo.demonstrateRequestAnimationFrameLeaks();
```

### DOM Reference Leaks

```javascript
// dom-leaks.js - DOM reference memory leaks
class DOMLeakDemo {
  static demonstrateDOMReferenceLeaks() {
    console.log('\n=== DOM Reference Leak Patterns ===');
    
    // ❌ BAD: Keeping references to removed DOM elements
    function createDOMLeaks() {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="parent">
          <div class="child">Child 1</div>
          <div class="child">Child 2</div>
          <div class="child">Child 3</div>
        </div>
      `;
      
      document.body.appendChild(container);
      
      // Store references to DOM elements
      const parent = container.querySelector('.parent');
      const children = Array.from(container.querySelectorAll('.child'));
      
      // Add data to elements
      children.forEach((child, index) => {
        child.largeData = new Array(10000).fill(`data-${index}`);
      });
      
      // Remove from DOM but keep references
      setTimeout(() => {
        document.body.removeChild(container);
        console.log('Container removed from DOM');
        
        // These references prevent garbage collection
        console.log('Parent still accessible:', parent.className);
        console.log('Children still accessible:', children.length);
        
        // The largeData is still in memory
        children.forEach((child, index) => {
          console.log(`Child ${index} data length:`, child.largeData.length);
        });
      }, 2000);
      
      return { parent, children };
    }
    
    // ✅ GOOD: Proper DOM reference cleanup
    function createCleanDOMHandling() {
      const container = document.createElement('div');
      container.innerHTML = `
        <div class="parent">
          <div class="child">Child 1</div>
          <div class="child">Child 2</div>
          <div class="child">Child 3</div>
        </div>
      `;
      
      document.body.appendChild(container);
      
      // Use WeakMap for element data
      const elementData = new WeakMap();
      const children = Array.from(container.querySelectorAll('.child'));
      
      children.forEach((child, index) => {
        elementData.set(child, new Array(10000).fill(`data-${index}`));
      });
      
      const cleanup = () => {
        // Clear any stored references
        children.length = 0; // Clear array
        
        // Remove from DOM
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
        
        console.log('Clean DOM removal completed');
        // elementData will be automatically cleaned up
      };
      
      setTimeout(cleanup, 2000);
      
      return { cleanup };
    }
    
    console.log('Creating DOM leaks...');
    const leakyRefs = createDOMLeaks();
    
    console.log('Creating clean DOM handling...');
    const cleanRefs = createCleanDOMHandling();
  }
  
  static demonstrateObserverLeaks() {
    console.log('\n=== Observer Leak Patterns ===');
    
    // ❌ BAD: Observers without cleanup
    function createLeakyObservers() {
      const target = document.createElement('div');
      target.textContent = 'Observed element';
      document.body.appendChild(target);
      
      // MutationObserver without cleanup
      const mutationObserver = new MutationObserver((mutations) => {
        console.log('Mutations observed:', mutations.length);
        // This callback keeps references to the target
      });
      
      mutationObserver.observe(target, {
        childList: true,
        attributes: true,
        subtree: true
      });
      
      // IntersectionObserver without cleanup
      const intersectionObserver = new IntersectionObserver((entries) => {
        console.log('Intersection changes:', entries.length);
      });
      
      intersectionObserver.observe(target);
      
      // Remove element but observers remain active
      setTimeout(() => {
        document.body.removeChild(target);
        console.log('Target removed but observers still active');
      }, 2000);
      
      return { target, mutationObserver, intersectionObserver };
    }
    
    // ✅ GOOD: Proper observer cleanup
    function createManagedObservers() {
      const target = document.createElement('div');
      target.textContent = 'Managed observed element';
      target.style.marginTop = '20px';
      document.body.appendChild(target);
      
      const observers = [];
      
      // MutationObserver with cleanup
      const mutationObserver = new MutationObserver((mutations) => {
        console.log('Managed mutations observed:', mutations.length);
      });
      
      mutationObserver.observe(target, {
        childList: true,
        attributes: true,
        subtree: true
      });
      
      observers.push(mutationObserver);
      
      // IntersectionObserver with cleanup
      const intersectionObserver = new IntersectionObserver((entries) => {
        console.log('Managed intersection changes:', entries.length);
      });
      
      intersectionObserver.observe(target);
      observers.push(intersectionObserver);
      
      // Cleanup function
      const cleanup = () => {
        observers.forEach(observer => observer.disconnect());
        observers.length = 0;
        
        if (target.parentNode) {
          target.parentNode.removeChild(target);
        }
        
        console.log('Observers properly disconnected');
      };
      
      setTimeout(cleanup, 2000);
      
      return { cleanup };
    }
    
    console.log('Creating leaky observers...');
    const leakyObservers = createLeakyObservers();
    
    console.log('Creating managed observers...');
    const managedObservers = createManagedObservers();
  }
}

// Run DOM leak demonstrations
DOMLeakDemo.demonstrateDOMReferenceLeaks();
DOMLeakDemo.demonstrateObserverLeaks();
```

## Memory Leak Detection Tools

### Custom Memory Leak Detector

```javascript
// leak-detector.js - Custom memory leak detection utilities
class MemoryLeakDetector {
  constructor() {
    this.snapshots = [];
    this.trackedObjects = new WeakSet();
    this.objectCounts = new Map();
    this.isMonitoring = false;
  }
  
  // Start monitoring memory usage
  startMonitoring(interval = 5000) {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('Memory leak monitoring started');
    
    this.monitoringInterval = setInterval(() => {
      this.takeSnapshot();
    }, interval);
    
    this.takeSnapshot(); // Initial snapshot
  }
  
  // Stop monitoring
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    this.isMonitoring = false;
    clearInterval(this.monitoringInterval);
    console.log('Memory leak monitoring stopped');
  }
  
  // Take memory snapshot
  takeSnapshot() {
    const snapshot = {
      timestamp: Date.now(),
      memory: this.getMemoryUsage(),
      objectCounts: new Map(this.objectCounts),
      gcInfo: this.getGCInfo()
    };
    
    this.snapshots.push(snapshot);
    
    // Keep only last 20 snapshots
    if (this.snapshots.length > 20) {
      this.snapshots = this.snapshots.slice(-20);
    }
    
    console.log('Memory snapshot taken:', {
      used: snapshot.memory.used,
      total: snapshot.memory.total,
      objects: snapshot.objectCounts.size
    });
    
    return snapshot;
  }
  
  // Get memory usage information
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    
    return {
      used: 0,
      total: 0,
      limit: 0
    };
  }
  
  // Get garbage collection info (if available)
  getGCInfo() {
    // This would require special browser flags or Node.js
    return {
      collections: 0,
      time: 0
    };
  }
  
  // Track object for leak detection
  trackObject(obj, name) {
    if (typeof obj !== 'object' || obj === null) return;
    
    this.trackedObjects.add(obj);
    
    const type = name || obj.constructor.name;
    this.objectCounts.set(type, (this.objectCounts.get(type) || 0) + 1);
    
    console.log(`Tracking object: ${type} (total: ${this.objectCounts.get(type)})`);
  }
  
  // Untrack object
  untrackObject(obj, name) {
    if (typeof obj !== 'object' || obj === null) return;
    
    const type = name || obj.constructor.name;
    const count = this.objectCounts.get(type) || 0;
    
    if (count > 0) {
      this.objectCounts.set(type, count - 1);
      console.log(`Untracking object: ${type} (remaining: ${count - 1})`);
    }
  }
  
  // Analyze memory trends
  analyzeMemoryTrends() {
    if (this.snapshots.length < 2) {
      console.log('Need at least 2 snapshots for analysis');
      return null;
    }
    
    const first = this.snapshots[0];
    const last = this.snapshots[this.snapshots.length - 1];
    const duration = last.timestamp - first.timestamp;
    
    const memoryGrowth = last.memory.used - first.memory.used;
    const growthRate = memoryGrowth / (duration / 1000); // bytes per second
    
    const analysis = {
      duration: duration,
      memoryGrowth: memoryGrowth,
      growthRate: growthRate,
      snapshots: this.snapshots.length,
      potentialLeak: growthRate > 1024 * 1024, // > 1MB/sec growth
      recommendations: []
    };
    
    if (analysis.potentialLeak) {
      analysis.recommendations.push('High memory growth rate detected');
      analysis.recommendations.push('Check for event listener leaks');
      analysis.recommendations.push('Verify timer cleanup');
      analysis.recommendations.push('Review closure usage');
    }
    
    // Analyze object count trends
    const objectTrends = new Map();
    for (const [type, count] of last.objectCounts) {
      const firstCount = first.objectCounts.get(type) || 0;
      const growth = count - firstCount;
      
      if (growth > 0) {
        objectTrends.set(type, growth);
      }
    }
    
    analysis.objectTrends = objectTrends;
    
    return analysis;
  }
  
  // Generate memory report
  generateReport() {
    const analysis = this.analyzeMemoryTrends();
    if (!analysis) return;
    
    console.log('\n=== Memory Leak Analysis Report ===');
    console.log(`Duration: ${(analysis.duration / 1000).toFixed(1)} seconds`);
    console.log(`Memory Growth: ${(analysis.memoryGrowth / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Growth Rate: ${(analysis.growthRate / 1024).toFixed(2)} KB/sec`);
    console.log(`Potential Leak: ${analysis.potentialLeak ? 'YES' : 'NO'}`);
    
    if (analysis.objectTrends.size > 0) {
      console.log('\nObject Growth:');
      for (const [type, growth] of analysis.objectTrends) {
        console.log(`  ${type}: +${growth}`);
      }
    }
    
    if (analysis.recommendations.length > 0) {
      console.log('\nRecommendations:');
      analysis.recommendations.forEach(rec => {
        console.log(`  - ${rec}`);
      });
    }
    
    return analysis;
  }
  
  // Force garbage collection (if available)
  forceGC() {
    if (global.gc) {
      console.log('Forcing garbage collection...');
      global.gc();
      
      setTimeout(() => {
        this.takeSnapshot();
        console.log('Post-GC snapshot taken');
      }, 100);
    } else {
      console.log('Garbage collection not available');
    }
  }
  
  // Clear all data
  reset() {
    this.snapshots = [];
    this.objectCounts.clear();
    console.log('Memory leak detector reset');
  }
}

// Usage example
const leakDetector = new MemoryLeakDetector();

// Start monitoring
leakDetector.startMonitoring(2000);

// Simulate memory usage
function simulateMemoryUsage() {
  const objects = [];
  
  // Create objects that might leak
  for (let i = 0; i < 1000; i++) {
    const obj = {
      id: i,
      data: new Array(1000).fill(`data-${i}`),
      timestamp: Date.now()
    };
    
    objects.push(obj);
    leakDetector.trackObject(obj, 'SimulatedObject');
  }
  
  // Simulate partial cleanup (some objects leak)
  setTimeout(() => {
    const toCleanup = objects.splice(0, 800);
    toCleanup.forEach(obj => {
      leakDetector.untrackObject(obj, 'SimulatedObject');
    });
    
    console.log('Partial cleanup completed');
  }, 5000);
}

// Run simulation
simulateMemoryUsage();

// Generate report after monitoring
setTimeout(() => {
  leakDetector.generateReport();
  leakDetector.stopMonitoring();
}, 15000);
```

## Key Takeaways

* **Event listeners are a common source** of memory leaks without proper cleanup
* **AbortController provides modern cleanup** for multiple event listeners
* **Closures can retain large objects** unintentionally through scope chains
* **Circular references prevent garbage collection** in older environments
* **WeakMap and WeakSet help avoid** reference-based memory leaks
* **Timers and intervals must be cleared** to prevent infinite retention
* **DOM references should be nullified** when elements are removed
* **Observers must be disconnected** when no longer needed
* **Memory monitoring helps identify** leak patterns early
* **Proper cleanup patterns are essential** for long-running applications
