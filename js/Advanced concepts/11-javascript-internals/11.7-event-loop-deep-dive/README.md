# **11.7 Event Loop Deep Dive**

The event loop is the heart of JavaScript's concurrency model. This deep dive explores its internal mechanisms and implementation details.

## Event Loop Architecture

### Core Components

```javascript
// Understanding event loop components
class EventLoopComponents {
  static demonstrateCallStack() {
    console.log('=== Call Stack Demonstration ===');
    
    function third() {
      console.log('3. In third()');
      console.trace('Call stack trace');
    }
    
    function second() {
      console.log('2. In second()');
      third();
      console.log('4. Back in second()');
    }
    
    function first() {
      console.log('1. In first()');
      second();
      console.log('5. Back in first()');
    }
    
    first();
    console.log('6. Back in global scope');
  }
  
  static demonstrateTaskQueue() {
    console.log('=== Task Queue Demonstration ===');
    
    console.log('1. Synchronous');
    
    setTimeout(() => {
      console.log('4. Macrotask (setTimeout)');
    }, 0);
    
    Promise.resolve().then(() => {
      console.log('3. Microtask (Promise)');
    });
    
    console.log('2. Synchronous');
    
    // Output order: 1, 2, 3, 4
    // Microtasks run before macrotasks
  }
  
  static demonstrateEventLoopPhases() {
    console.log('=== Event Loop Phases ===');
    
    // Phase 1: Execute current script
    console.log('Phase 1: Current script execution');
    
    // Phase 2: Process microtask queue
    Promise.resolve().then(() => {
      console.log('Phase 2: Microtask execution');
    });
    
    // Phase 3: Process macrotask queue
    setTimeout(() => {
      console.log('Phase 3: Macrotask execution');
    }, 0);
    
    // Phase 4: Render (in browsers)
    if (typeof requestAnimationFrame !== 'undefined') {
      requestAnimationFrame(() => {
        console.log('Phase 4: Render phase');
      });
    }
    
    console.log('Script continues...');
  }
}

EventLoopComponents.demonstrateCallStack();
EventLoopComponents.demonstrateTaskQueue();
EventLoopComponents.demonstrateEventLoopPhases();
```

### Microtask vs Macrotask Processing

```javascript
// Deep dive into task processing
class TaskProcessing {
  static demonstrateMicrotaskPriority() {
    console.log('=== Microtask Priority ===');
    
    console.log('1. Start');
    
    // Macrotask
    setTimeout(() => {
      console.log('5. setTimeout 1');
      
      // Nested microtask
      Promise.resolve().then(() => {
        console.log('6. Promise in setTimeout');
      });
    }, 0);
    
    // Another macrotask
    setTimeout(() => {
      console.log('7. setTimeout 2');
    }, 0);
    
    // Microtask
    Promise.resolve().then(() => {
      console.log('3. Promise 1');
      
      // Nested microtask
      return Promise.resolve().then(() => {
        console.log('4. Promise 2 (nested)');
      });
    });
    
    console.log('2. End');
    
    // All microtasks run before any macrotask
  }
  
  static demonstrateMicrotaskExhaustion() {
    console.log('=== Microtask Queue Exhaustion ===');
    
    let count = 0;
    
    function scheduleMicrotask() {
      if (count < 5) {
        Promise.resolve().then(() => {
          console.log(`Microtask ${++count}`);
          scheduleMicrotask(); // Schedule another microtask
        });
      }
    }
    
    setTimeout(() => {
      console.log('Macrotask - this runs after all microtasks');
    }, 0);
    
    scheduleMicrotask();
    console.log('Scheduled microtasks');
    
    // All microtasks must complete before macrotask runs
  }
  
  static demonstrateQueueMicrotask() {
    console.log('=== queueMicrotask API ===');
    
    console.log('1. Start');
    
    queueMicrotask(() => {
      console.log('3. queueMicrotask');
    });
    
    Promise.resolve().then(() => {
      console.log('4. Promise.then');
    });
    
    setTimeout(() => {
      console.log('5. setTimeout');
    }, 0);
    
    console.log('2. End');
    
    // queueMicrotask and Promise.then have same priority
  }
}

TaskProcessing.demonstrateMicrotaskPriority();
TaskProcessing.demonstrateMicrotaskExhaustion();
TaskProcessing.demonstrateQueueMicrotask();
```

## Browser vs Node.js Event Loop

### Browser Event Loop

```javascript
// Browser-specific event loop behavior
class BrowserEventLoop {
  static demonstrateRenderingPhase() {
    console.log('=== Browser Rendering Phase ===');
    
    if (typeof document !== 'undefined') {
      const element = document.createElement('div');
      element.textContent = 'Test Element';
      document.body.appendChild(element);
      
      // Macrotask
      setTimeout(() => {
        element.style.color = 'red';
        console.log('Changed color in macrotask');
      }, 0);
      
      // Microtask
      Promise.resolve().then(() => {
        element.style.fontSize = '20px';
        console.log('Changed font size in microtask');
      });
      
      // Animation frame (render phase)
      requestAnimationFrame(() => {
        element.style.backgroundColor = 'yellow';
        console.log('Changed background in animation frame');
      });
      
      console.log('Scheduled DOM updates');
    } else {
      console.log('Browser APIs not available');
    }
  }
  
  static demonstrateUserInteraction() {
    console.log('=== User Interaction Events ===');
    
    if (typeof document !== 'undefined') {
      const button = document.createElement('button');
      button.textContent = 'Click me';
      document.body.appendChild(button);
      
      button.addEventListener('click', () => {
        console.log('1. Click handler start');
        
        Promise.resolve().then(() => {
          console.log('2. Microtask in click handler');
        });
        
        setTimeout(() => {
          console.log('3. Macrotask in click handler');
        }, 0);
        
        console.log('4. Click handler end');
      });
      
      console.log('Click event listener added');
    }
  }
  
  static demonstrateIntersectionObserver() {
    console.log('=== Intersection Observer ===');
    
    if (typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          console.log('Intersection observed:', entry.isIntersecting);
          
          // This callback runs as a microtask
          Promise.resolve().then(() => {
            console.log('Microtask in intersection callback');
          });
        });
      });
      
      console.log('Intersection observer created');
    }
  }
}

BrowserEventLoop.demonstrateRenderingPhase();
BrowserEventLoop.demonstrateUserInteraction();
BrowserEventLoop.demonstrateIntersectionObserver();
```

### Node.js Event Loop

```javascript
// Node.js-specific event loop behavior
class NodeEventLoop {
  static demonstrateNodePhases() {
    console.log('=== Node.js Event Loop Phases ===');
    
    if (typeof process !== 'undefined') {
      console.log('1. Start');
      
      // Timer phase
      setTimeout(() => {
        console.log('4. Timer phase (setTimeout)');
      }, 0);
      
      setImmediate(() => {
        console.log('5. Check phase (setImmediate)');
      });
      
      // Process.nextTick (highest priority)
      process.nextTick(() => {
        console.log('2. process.nextTick');
      });
      
      // Promise microtask
      Promise.resolve().then(() => {
        console.log('3. Promise microtask');
      });
      
      console.log('6. End');
      
      // Order: 1, 6, 2, 3, 4, 5
    } else {
      console.log('Node.js APIs not available');
    }
  }
  
  static demonstrateProcessNextTick() {
    console.log('=== process.nextTick Priority ===');
    
    if (typeof process !== 'undefined') {
      Promise.resolve().then(() => {
        console.log('2. Promise');
      });
      
      process.nextTick(() => {
        console.log('1. nextTick');
        
        // Nested nextTick
        process.nextTick(() => {
          console.log('3. Nested nextTick');
        });
      });
      
      console.log('4. Synchronous');
      
      // nextTick has higher priority than Promise microtasks
    }
  }
  
  static demonstrateIOCallbacks() {
    console.log('=== I/O Callbacks Phase ===');
    
    if (typeof require !== 'undefined') {
      try {
        const fs = require('fs');
        
        // I/O operation
        fs.readFile(__filename, (err, data) => {
          console.log('I/O callback executed');
          
          // Microtask in I/O callback
          Promise.resolve().then(() => {
            console.log('Microtask in I/O callback');
          });
          
          // Timer in I/O callback
          setTimeout(() => {
            console.log('Timer in I/O callback');
          }, 0);
        });
        
        console.log('I/O operation scheduled');
      } catch (e) {
        console.log('File system not available');
      }
    }
  }
}

NodeEventLoop.demonstrateNodePhases();
NodeEventLoop.demonstrateProcessNextTick();
NodeEventLoop.demonstrateIOCallbacks();
```

## Advanced Event Loop Concepts

### Event Loop Blocking

```javascript
// Understanding event loop blocking
class EventLoopBlocking {
  static demonstrateBlocking() {
    console.log('=== Event Loop Blocking ===');
    
    console.log('1. Before blocking operation');
    
    // Schedule async operations
    setTimeout(() => {
      console.log('This will be delayed by blocking operation');
    }, 0);
    
    Promise.resolve().then(() => {
      console.log('This microtask will also be delayed');
    });
    
    // Blocking synchronous operation
    const start = Date.now();
    while (Date.now() - start < 2000) {
      // Block for 2 seconds
    }
    
    console.log('2. After blocking operation');
    
    // Async operations will now execute
  }
  
  static demonstrateNonBlocking() {
    console.log('=== Non-blocking Alternative ===');
    
    function heavyComputation(callback) {
      let i = 0;
      const batchSize = 1000000;
      const totalWork = 100000000;
      
      function processBatch() {
        const end = Math.min(i + batchSize, totalWork);
        
        // Do work in batch
        while (i < end) {
          i++;
        }
        
        if (i < totalWork) {
          // Yield control back to event loop
          setTimeout(processBatch, 0);
        } else {
          callback();
        }
      }
      
      processBatch();
    }
    
    console.log('Starting non-blocking computation');
    
    heavyComputation(() => {
      console.log('Heavy computation completed');
    });
    
    // This will run during computation
    setTimeout(() => {
      console.log('This runs during computation');
    }, 100);
  }
  
  static demonstrateWebWorkers() {
    console.log('=== Web Workers (if available) ===');
    
    if (typeof Worker !== 'undefined') {
      // Create worker script as blob
      const workerScript = `
        self.onmessage = function(e) {
          const { start, end } = e.data;
          let result = 0;
          
          for (let i = start; i < end; i++) {
            result += Math.sqrt(i);
          }
          
          self.postMessage(result);
        };
      `;
      
      const blob = new Blob([workerScript], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));
      
      worker.onmessage = (e) => {
        console.log('Worker result:', e.data);
        worker.terminate();
      };
      
      worker.postMessage({ start: 0, end: 1000000 });
      console.log('Heavy computation offloaded to worker');
    } else {
      console.log('Web Workers not available');
    }
  }
}

EventLoopBlocking.demonstrateBlocking();
EventLoopBlocking.demonstrateNonBlocking();
EventLoopBlocking.demonstrateWebWorkers();
```

### Event Loop Performance

```javascript
// Event loop performance considerations
class EventLoopPerformance {
  static measureEventLoopLag() {
    console.log('=== Event Loop Lag Measurement ===');
    
    function measureLag() {
      const start = Date.now();
      
      setTimeout(() => {
        const lag = Date.now() - start;
        console.log(`Event loop lag: ${lag}ms`);
        
        if (lag > 10) {
          console.warn('High event loop lag detected!');
        }
      }, 0);
    }
    
    // Measure lag periodically
    setInterval(measureLag, 1000);
    
    console.log('Event loop lag monitoring started');
  }
  
  static optimizeTaskScheduling() {
    console.log('=== Task Scheduling Optimization ===');
    
    // ❌ Bad: Scheduling many tasks at once
    function badScheduling() {
      for (let i = 0; i < 1000; i++) {
        setTimeout(() => {
          console.log(`Task ${i}`);
        }, 0);
      }
    }
    
    // ✅ Good: Batching tasks
    function goodScheduling() {
      const tasks = Array.from({ length: 1000 }, (_, i) => i);
      const batchSize = 10;
      
      function processBatch(startIndex) {
        const endIndex = Math.min(startIndex + batchSize, tasks.length);
        
        for (let i = startIndex; i < endIndex; i++) {
          console.log(`Batched task ${tasks[i]}`);
        }
        
        if (endIndex < tasks.length) {
          setTimeout(() => processBatch(endIndex), 0);
        }
      }
      
      processBatch(0);
    }
    
    console.log('Task scheduling patterns demonstrated');
  }
  
  static useRequestIdleCallback() {
    console.log('=== requestIdleCallback (if available) ===');
    
    if (typeof requestIdleCallback !== 'undefined') {
      function doWork(deadline) {
        while (deadline.timeRemaining() > 0) {
          // Do work while there's idle time
          performLowPriorityWork();
        }
        
        // Schedule more work if needed
        requestIdleCallback(doWork);
      }
      
      function performLowPriorityWork() {
        // Simulate low priority work
        Math.random();
      }
      
      requestIdleCallback(doWork);
      console.log('Idle callback scheduled');
    } else {
      console.log('requestIdleCallback not available');
    }
  }
}

EventLoopPerformance.measureEventLoopLag();
EventLoopPerformance.optimizeTaskScheduling();
EventLoopPerformance.useRequestIdleCallback();
```

## Event Loop Debugging

### Debugging Techniques

```javascript
// Techniques for debugging event loop issues
class EventLoopDebugging {
  static traceAsyncOperations() {
    console.log('=== Async Operation Tracing ===');
    
    // Wrap setTimeout to add tracing
    const originalSetTimeout = setTimeout;
    window.setTimeout = function(callback, delay, ...args) {
      const stack = new Error().stack;
      console.log('setTimeout scheduled:', { delay, stack: stack.split('\n')[2] });
      
      return originalSetTimeout(() => {
        console.log('setTimeout executing:', { delay });
        callback(...args);
      }, delay);
    };
    
    // Example usage
    setTimeout(() => {
      console.log('Traced timeout executed');
    }, 100);
  }
  
  static detectLongRunningTasks() {
    console.log('=== Long Running Task Detection ===');
    
    let lastTime = performance.now();
    
    function checkTaskDuration() {
      const currentTime = performance.now();
      const duration = currentTime - lastTime;
      
      if (duration > 16.67) { // More than one frame (60fps)
        console.warn(`Long task detected: ${duration.toFixed(2)}ms`);
      }
      
      lastTime = currentTime;
      setTimeout(checkTaskDuration, 0);
    }
    
    checkTaskDuration();
    
    // Simulate long task
    setTimeout(() => {
      const start = Date.now();
      while (Date.now() - start < 50) {
        // Block for 50ms
      }
    }, 1000);
  }
  
  static visualizeEventLoop() {
    console.log('=== Event Loop Visualization ===');
    
    const events = [];
    
    function logEvent(type, description) {
      events.push({
        type,
        description,
        timestamp: performance.now()
      });
    }
    
    // Log different types of events
    logEvent('sync', 'Synchronous code start');
    
    setTimeout(() => {
      logEvent('macrotask', 'setTimeout callback');
    }, 0);
    
    Promise.resolve().then(() => {
      logEvent('microtask', 'Promise callback');
    });
    
    queueMicrotask(() => {
      logEvent('microtask', 'queueMicrotask callback');
    });
    
    logEvent('sync', 'Synchronous code end');
    
    // Display events after they complete
    setTimeout(() => {
      console.log('Event timeline:');
      events.forEach((event, index) => {
        console.log(`${index + 1}. ${event.type}: ${event.description} (${event.timestamp.toFixed(2)}ms)`);
      });
    }, 10);
  }
}

EventLoopDebugging.traceAsyncOperations();
EventLoopDebugging.detectLongRunningTasks();
EventLoopDebugging.visualizeEventLoop();
```

## Best Practices

### Event Loop Optimization

```javascript
// Best practices for event loop optimization
class EventLoopBestPractices {
  static avoidBlockingOperations() {
    // ✅ Good: Break up long operations
    function processLargeDataset(data, callback) {
      let index = 0;
      const batchSize = 1000;
      
      function processBatch() {
        const end = Math.min(index + batchSize, data.length);
        
        while (index < end) {
          // Process data[index]
          index++;
        }
        
        if (index < data.length) {
          setTimeout(processBatch, 0); // Yield control
        } else {
          callback();
        }
      }
      
      processBatch();
    }
    
    console.log('Non-blocking data processing pattern');
  }
  
  static useMicrotasksWisely() {
    // ✅ Good: Use microtasks for immediate follow-up work
    function updateUI(data) {
      // Update DOM
      document.getElementById('data').textContent = data;
      
      // Use microtask for immediate follow-up
      queueMicrotask(() => {
        // Log analytics, update caches, etc.
        console.log('UI updated with:', data);
      });
    }
    
    // ❌ Bad: Creating infinite microtask loops
    function badMicrotaskLoop() {
      Promise.resolve().then(() => {
        console.log('This will block the event loop!');
        badMicrotaskLoop(); // Infinite recursion
      });
    }
    
    console.log('Microtask usage patterns');
  }
  
  static optimizeTimerUsage() {
    // ✅ Good: Batch timer operations
    const timerBatch = [];
    let batchTimeout = null;
    
    function batchedSetTimeout(callback, delay) {
      timerBatch.push({ callback, delay: Date.now() + delay });
      
      if (!batchTimeout) {
        batchTimeout = setTimeout(processBatch, 0);
      }
    }
    
    function processBatch() {
      const now = Date.now();
      const ready = timerBatch.filter(timer => timer.delay <= now);
      
      ready.forEach(timer => timer.callback());
      
      // Remove processed timers
      timerBatch.splice(0, ready.length);
      
      if (timerBatch.length > 0) {
        batchTimeout = setTimeout(processBatch, 0);
      } else {
        batchTimeout = null;
      }
    }
    
    console.log('Batched timer operations');
  }
}

EventLoopBestPractices.avoidBlockingOperations();
EventLoopBestPractices.useMicrotasksWisely();
EventLoopBestPractices.optimizeTimerUsage();
```

## Key Takeaways

* **Event loop** coordinates execution of JavaScript code
* **Microtasks** have higher priority than macrotasks
* **Browser and Node.js** have different event loop implementations
* **Blocking operations** can freeze the entire application
* **Task batching** improves event loop performance
* **requestIdleCallback** allows work during idle time
* **Event loop lag** indicates performance problems
* **Proper task scheduling** prevents UI freezing
* **Understanding phases** helps optimize async code
* **Debugging tools** help identify event loop issues
