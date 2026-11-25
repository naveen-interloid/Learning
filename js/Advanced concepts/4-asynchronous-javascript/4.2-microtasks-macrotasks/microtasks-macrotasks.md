# **2. Microtasks vs Macrotasks**

### 1️⃣ Understanding Task Queues

JavaScript has **two main types of task queues** that handle asynchronous operations with different priorities:

* **Microtask Queue** (Job Queue) - Higher priority
* **Macrotask Queue** (Task Queue) - Lower priority

---

### 2️⃣ Microtasks

**What are Microtasks?**
- High-priority tasks that execute **immediately after** the current script
- Execute **before** any macrotasks
- Process **all available microtasks** before moving to macrotasks

**Common Microtask Sources:**
```javascript
// Promise callbacks
Promise.resolve().then(() => console.log('Promise microtask'));

// queueMicrotask API
queueMicrotask(() => console.log('queueMicrotask'));

// MutationObserver callbacks
const observer = new MutationObserver(() => {
  console.log('MutationObserver microtask');
});

// async/await (internally uses Promises)
async function asyncFunction() {
  console.log('async function microtask');
}
```

---

### 3️⃣ Macrotasks

**What are Macrotasks?**
- Lower-priority tasks that execute **after microtasks**
- Execute **one at a time** per event loop cycle
- Allow browser to update rendering between tasks

**Common Macrotask Sources:**
```javascript
// setTimeout/setInterval
setTimeout(() => console.log('setTimeout macrotask'), 0);
setInterval(() => console.log('setInterval macrotask'), 1000);

// setImmediate (Node.js)
setImmediate(() => console.log('setImmediate macrotask'));

// I/O operations
fs.readFile('file.txt', () => console.log('File read macrotask'));

// UI events
button.addEventListener('click', () => console.log('Click event macrotask'));

// requestAnimationFrame (special case)
requestAnimationFrame(() => console.log('Animation frame'));
```

---

### 4️⃣ Execution Order Examples

**Basic Priority Example:**
```javascript
console.log('1: Synchronous');

setTimeout(() => console.log('2: Macrotask'), 0);

Promise.resolve().then(() => console.log('3: Microtask'));

console.log('4: Synchronous');

// Output: 1, 4, 3, 2
// Explanation:
// - Synchronous code runs first: 1, 4
// - All microtasks run: 3
// - Then macrotasks: 2
```

**Complex Nested Example:**
```javascript
console.log('Start');

setTimeout(() => {
  console.log('Macrotask 1');
  
  Promise.resolve().then(() => {
    console.log('Microtask inside Macrotask 1');
  });
  
  setTimeout(() => {
    console.log('Macrotask 2');
  }, 0);
}, 0);

Promise.resolve().then(() => {
  console.log('Microtask 1');
  
  Promise.resolve().then(() => {
    console.log('Microtask 2');
  });
});

console.log('End');

// Output:
// Start
// End
// Microtask 1
// Microtask 2
// Macrotask 1
// Microtask inside Macrotask 1
// Macrotask 2
```

---

### 5️⃣ Event Loop Phases Detailed

**Complete Event Loop Cycle:**
```javascript
function demonstrateEventLoopPhases() {
  console.log('=== Phase Demo ===');
  
  // 1. Current execution context
  console.log('1: Synchronous execution');
  
  // 2. Macrotasks (different types)
  setTimeout(() => console.log('2: setTimeout 0ms'), 0);
  setTimeout(() => console.log('3: setTimeout 10ms'), 10);
  
  // 3. Microtasks (different sources)
  Promise.resolve().then(() => {
    console.log('4: Promise.then');
    
    // Nested microtask
    queueMicrotask(() => {
      console.log('5: Nested queueMicrotask');
    });
  });
  
  queueMicrotask(() => {
    console.log('6: queueMicrotask');
  });
  
  // 4. More synchronous code
  console.log('7: More synchronous');
  
  // 5. I/O macrotask (if in Node.js)
  if (typeof setImmediate !== 'undefined') {
    setImmediate(() => console.log('8: setImmediate'));
  }
}

demonstrateEventLoopPhases();

// Typical Output:
// === Phase Demo ===
// 1: Synchronous execution
// 7: More synchronous
// 4: Promise.then
// 6: queueMicrotask
// 5: Nested queueMicrotask
// 2: setTimeout 0ms
// 8: setImmediate (Node.js)
// 3: setTimeout 10ms
```

---

### 6️⃣ Microtask Queue Exhaustion

**Infinite Microtasks (Dangerous!):**
```javascript
// ⚠️ This will block the event loop!
function infiniteMicrotasks() {
  Promise.resolve().then(() => {
    console.log('Microtask');
    infiniteMicrotasks(); // Creates another microtask
  });
}

// infiniteMicrotasks(); // Don't run this!

// ✅ Better approach with escape condition
function controlledMicrotasks(count = 0) {
  if (count < 5) {
    Promise.resolve().then(() => {
      console.log(`Controlled microtask ${count}`);
      controlledMicrotasks(count + 1);
    });
  }
}

controlledMicrotasks();
```

**Yielding Control Back:**
```javascript
// ✅ Good: Allow macrotasks to run
function processLargeDataset(data, batchSize = 1000) {
  let index = 0;
  
  function processBatch() {
    const endIndex = Math.min(index + batchSize, data.length);
    
    // Process batch
    for (; index < endIndex; index++) {
      // Process data[index]
    }
    
    if (index < data.length) {
      // Use setTimeout to yield control
      setTimeout(processBatch, 0);
    } else {
      console.log('Processing complete');
    }
  }
  
  processBatch();
}
```

---

### 7️⃣ Real-World Scenarios

**UI Updates and Responsiveness:**
```javascript
// ❌ Bad: Blocks UI updates
function badUIUpdate() {
  for (let i = 0; i < 1000; i++) {
    Promise.resolve().then(() => {
      document.getElementById('counter').textContent = i;
    });
  }
  // UI won't update until all microtasks complete
}

// ✅ Good: Allows UI updates
function goodUIUpdate() {
  let i = 0;
  
  function updateBatch() {
    const batchEnd = Math.min(i + 10, 1000);
    
    for (; i < batchEnd; i++) {
      document.getElementById('counter').textContent = i;
    }
    
    if (i < 1000) {
      setTimeout(updateBatch, 0); // Yield to browser
    }
  }
  
  updateBatch();
}
```

**API Response Handling:**
```javascript
async function handleAPIResponses() {
  console.log('Starting API calls');
  
  // These create microtasks
  const promise1 = fetch('/api/data1').then(r => r.json());
  const promise2 = fetch('/api/data2').then(r => r.json());
  const promise3 = fetch('/api/data3').then(r => r.json());
  
  // This creates a macrotask
  setTimeout(() => {
    console.log('Timeout during API calls');
  }, 0);
  
  // Microtasks (promise callbacks) will run first
  const [data1, data2, data3] = await Promise.all([
    promise1, promise2, promise3
  ]);
  
  console.log('All API calls completed');
  // Timeout will run after this
}
```

---

### 8️⃣ Browser vs Node.js Differences

**Browser Task Priorities:**
```javascript
// Browser environment
console.log('1: Sync');

setTimeout(() => console.log('2: setTimeout'), 0);

requestAnimationFrame(() => console.log('3: rAF'));

Promise.resolve().then(() => console.log('4: Promise'));

// Browser output: 1, 4, 3, 2
// rAF runs before setTimeout in browsers
```

**Node.js Task Priorities:**
```javascript
// Node.js environment
console.log('1: Sync');

setTimeout(() => console.log('2: setTimeout'), 0);

setImmediate(() => console.log('3: setImmediate'));

Promise.resolve().then(() => console.log('4: Promise'));

process.nextTick(() => console.log('5: nextTick'));

// Node.js output: 1, 5, 4, 2, 3
// nextTick has highest priority in Node.js
```

---

### 9️⃣ Debugging Task Queue Issues

**Visualizing Task Execution:**
```javascript
class TaskTracker {
  constructor() {
    this.tasks = [];
  }
  
  track(name, type) {
    this.tasks.push({ name, type, timestamp: performance.now() });
  }
  
  addMicrotask(name, fn) {
    Promise.resolve().then(() => {
      this.track(name, 'microtask');
      fn();
    });
  }
  
  addMacrotask(name, fn) {
    setTimeout(() => {
      this.track(name, 'macrotask');
      fn();
    }, 0);
  }
  
  report() {
    console.table(this.tasks);
  }
}

const tracker = new TaskTracker();

tracker.track('sync-1', 'synchronous');
tracker.addMicrotask('micro-1', () => console.log('Microtask 1'));
tracker.addMacrotask('macro-1', () => console.log('Macrotask 1'));
tracker.addMicrotask('micro-2', () => console.log('Microtask 2'));
tracker.track('sync-2', 'synchronous');

setTimeout(() => tracker.report(), 100);
```

**Performance Monitoring:**
```javascript
function monitorTaskQueueHealth() {
  let microtaskCount = 0;
  let macrotaskCount = 0;
  
  // Monitor microtasks
  const originalThen = Promise.prototype.then;
  Promise.prototype.then = function(...args) {
    microtaskCount++;
    return originalThen.apply(this, args);
  };
  
  // Monitor macrotasks
  const originalSetTimeout = window.setTimeout;
  window.setTimeout = function(...args) {
    macrotaskCount++;
    return originalSetTimeout.apply(this, args);
  };
  
  // Report every second
  setInterval(() => {
    console.log(`Microtasks: ${microtaskCount}, Macrotasks: ${macrotaskCount}`);
    microtaskCount = 0;
    macrotaskCount = 0;
  }, 1000);
}
```

---

### 🔟 Best Practices

**Do's:**
```javascript
// ✅ Use microtasks for immediate follow-up work
Promise.resolve().then(() => {
  // Clean up after current operation
  updateUI();
  logAnalytics();
});

// ✅ Use macrotasks to yield control
function processLargeArray(array) {
  let index = 0;
  
  function processBatch() {
    // Process small batch
    for (let i = 0; i < 100 && index < array.length; i++, index++) {
      processItem(array[index]);
    }
    
    if (index < array.length) {
      setTimeout(processBatch, 0); // Yield control
    }
  }
  
  processBatch();
}
```

**Don'ts:**
```javascript
// ❌ Don't create infinite microtasks
function badRecursiveMicrotask() {
  Promise.resolve().then(badRecursiveMicrotask);
}

// ❌ Don't rely on exact timing
setTimeout(() => {
  // This might not run exactly after 0ms
  console.log('Not guaranteed to be immediate');
}, 0);

// ❌ Don't assume task order across different APIs
setTimeout(() => console.log('setTimeout'), 0);
requestAnimationFrame(() => console.log('rAF'));
// Order may vary between browsers
```

---

### 1️⃣1️⃣ Key Takeaways

* **Microtasks** have higher priority than **macrotasks**
* **All microtasks** execute before **any macrotask**
* **Infinite microtasks** can block the event loop
* **Browser rendering** happens between macrotasks
* **Different environments** (Browser vs Node.js) have different priorities
* **Use setTimeout(0)** to yield control back to the browser
* **Understanding task queues** is crucial for performance optimization
