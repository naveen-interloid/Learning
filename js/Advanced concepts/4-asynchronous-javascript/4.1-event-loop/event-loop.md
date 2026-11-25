# **1. Event Loop & Callbacks Queue**

### 1️⃣ Explanation

The **Event Loop** is the mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded. It manages the execution of code, handling events, and executing queued sub-tasks.

Key components:
* **Call Stack** - where function calls are executed
* **Web APIs** - browser-provided APIs (setTimeout, DOM events, etc.)
* **Callback Queue** - where callbacks wait to be executed
* **Event Loop** - moves callbacks from queue to call stack

---

### 2️⃣ Mental Model

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Call Stack  │    │  Web APIs   │    │Callback Queue│
│             │    │             │    │             │
│ function3() │    │ setTimeout  │    │ callback1   │
│ function2() │    │ DOM events  │    │ callback2   │
│ function1() │    │ HTTP req    │    │ callback3   │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                                      │
       │                                      │
       └──────── Event Loop ◄─────────────────┘
```

---

### 3️⃣ How It Works

**Basic Example:**
```javascript
console.log('Start');

setTimeout(() => {
  console.log('Timeout callback');
}, 0);

console.log('End');

// Output:
// Start
// End
// Timeout callback
```

**Step-by-step execution:**
1. `console.log('Start')` → Call Stack → Execute → Output "Start"
2. `setTimeout(...)` → Call Stack → Move to Web APIs → Pop from Call Stack
3. `console.log('End')` → Call Stack → Execute → Output "End"
4. Timer completes → Callback moves to Callback Queue
5. Call Stack is empty → Event Loop moves callback to Call Stack
6. Callback executes → Output "Timeout callback"

---

### 4️⃣ Complex Example

**Multiple Async Operations:**
```javascript
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');

// Output: 1, 4, 3, 2
```

**Why this order?**
- Synchronous code runs first: 1, 4
- Promise callbacks go to **Microtask Queue** (higher priority)
- setTimeout callbacks go to **Macrotask Queue** (lower priority)
- Microtasks execute before macrotasks: 3, then 2

---

### 5️⃣ Event Loop Phases

**Detailed Event Loop:**
```javascript
function demonstrateEventLoop() {
  console.log('=== Event Loop Demo ===');
  
  // Immediate execution
  console.log('1: Synchronous');
  
  // Macrotask (Timer)
  setTimeout(() => {
    console.log('2: setTimeout (macrotask)');
  }, 0);
  
  // Microtask (Promise)
  Promise.resolve().then(() => {
    console.log('3: Promise.then (microtask)');
  });
  
  // Immediate execution
  console.log('4: Synchronous');
  
  // Another microtask
  queueMicrotask(() => {
    console.log('5: queueMicrotask');
  });
  
  // Another macrotask
  setTimeout(() => {
    console.log('6: Another setTimeout');
  }, 0);
}

demonstrateEventLoop();

// Output:
// === Event Loop Demo ===
// 1: Synchronous
// 4: Synchronous
// 3: Promise.then (microtask)
// 5: queueMicrotask
// 2: setTimeout (macrotask)
// 6: Another setTimeout
```

---

### 6️⃣ Real-World Examples

**DOM Event Handling:**
```javascript
const button = document.getElementById('myButton');

console.log('Script start');

button.addEventListener('click', () => {
  console.log('Button clicked!');
  
  Promise.resolve().then(() => {
    console.log('Promise in click handler');
  });
  
  setTimeout(() => {
    console.log('setTimeout in click handler');
  }, 0);
});

console.log('Script end');

// When button is clicked:
// Button clicked!
// Promise in click handler
// setTimeout in click handler
```

**API Calls and UI Updates:**
```javascript
function fetchUserData(userId) {
  console.log('Starting fetch...');
  
  // This goes to Web APIs
  fetch(`/api/users/${userId}`)
    .then(response => {
      console.log('Response received');
      return response.json();
    })
    .then(userData => {
      console.log('Data parsed');
      updateUI(userData);
    })
    .catch(error => {
      console.error('Error:', error);
    });
  
  console.log('Fetch initiated');
}

function updateUI(data) {
  // DOM manipulation
  document.getElementById('userName').textContent = data.name;
  
  // This creates a microtask
  Promise.resolve().then(() => {
    console.log('UI updated');
  });
}

// Output order:
// Starting fetch...
// Fetch initiated
// Response received
// Data parsed
// UI updated
```

---

### 7️⃣ Common Pitfalls

**Blocking the Event Loop:**
```javascript
// ❌ Bad - blocks the event loop
function heavyComputation() {
  const start = Date.now();
  while (Date.now() - start < 5000) {
    // Blocking operation for 5 seconds
  }
  console.log('Heavy computation done');
}

console.log('Before heavy computation');
heavyComputation(); // Blocks everything for 5 seconds
console.log('After heavy computation');

// ✅ Better - break into chunks
function heavyComputationAsync(iterations, callback) {
  let i = 0;
  
  function processChunk() {
    const chunkSize = 1000;
    const end = Math.min(i + chunkSize, iterations);
    
    for (; i < end; i++) {
      // Do some work
    }
    
    if (i < iterations) {
      setTimeout(processChunk, 0); // Give other tasks a chance
    } else {
      callback();
    }
  }
  
  processChunk();
}

heavyComputationAsync(100000, () => {
  console.log('Async heavy computation done');
});
```

---

### 8️⃣ Debugging Event Loop Issues

**Visualizing Execution Order:**
```javascript
function debugEventLoop() {
  console.log('1: Start');
  
  setTimeout(() => console.log('2: setTimeout 1'), 0);
  setTimeout(() => console.log('3: setTimeout 2'), 0);
  
  Promise.resolve()
    .then(() => console.log('4: Promise 1'))
    .then(() => console.log('5: Promise 2'));
  
  queueMicrotask(() => console.log('6: queueMicrotask'));
  
  console.log('7: End');
}

debugEventLoop();

// Output: 1, 7, 4, 6, 5, 2, 3
```

**Performance Monitoring:**
```javascript
function measureEventLoopLag() {
  let start = performance.now();
  
  setTimeout(() => {
    const lag = performance.now() - start;
    console.log(`Event loop lag: ${lag.toFixed(2)}ms`);
  }, 0);
}

// Call periodically to monitor event loop health
setInterval(measureEventLoopLag, 1000);
```

---

### 9️⃣ Key Takeaways

* **JavaScript is single-threaded** but can handle async operations
* **Event Loop** coordinates between call stack and callback queues
* **Microtasks** (Promises) have higher priority than **macrotasks** (setTimeout)
* **Don't block the event loop** with heavy synchronous operations
* **Understanding execution order** is crucial for debugging async code
