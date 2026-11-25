# **4. Asynchronous JavaScript — Overview**

This section covers the fundamental concepts and advanced patterns of asynchronous programming in JavaScript. Understanding these concepts is crucial for building responsive, efficient web applications.

### **4.1 Event Loop & Callbacks Queue**
* How JavaScript handles asynchronous operations
* Call stack, callback queue, and event loop
* Understanding the single-threaded nature of JavaScript
* **Files**: [4.1-event-loop/event-loop.md](./4.1-event-loop/event-loop.md)

### **4.2 Microtasks vs Macrotasks**
* Task queue priorities and execution order
* Promise callbacks vs setTimeout callbacks
* Understanding the event loop phases
* **Files**: [4.2-microtasks-macrotasks/microtasks-macrotasks.md](./4.2-microtasks-macrotasks/microtasks-macrotasks.md)

### **4.3 Callback Functions & Callback Hell**
* Traditional asynchronous pattern
* Nested callbacks and readability issues
* Error handling with callbacks
* Solutions to callback hell
* **Files**: [4.3-callbacks/callbacks.md](./4.3-callbacks/callbacks.md)

### **4.4 Promises (resolve, reject, chaining)**
* Modern asynchronous pattern
* Promise states and lifecycle
* Chaining and error handling
* Advanced promise patterns
* **Files**: [4.4-promises/promises.md](./4.4-promises/promises.md)

### **4.5 async/await & Error Handling**
* Syntactic sugar over promises
* Sequential and parallel execution
* Try-catch with async functions
* Advanced error handling patterns
* **Files**: [4.5-async-await/async-await.md](./4.5-async-await/async-await.md)

### **4.6 Promise Combinators**
* Promise.all() - wait for all
* Promise.race() - first to complete
* Promise.allSettled() - all results
* Promise.any() - first successful
* **Files**: [4.6-promise-combinators/promise-combinators.md](./4.6-promise-combinators/promise-combinators.md)

### **4.7 Generators & Async Generators**
* Function* syntax and yield
* Async iteration patterns
* Custom async iterators
* Real-world generator applications
* **Files**: [4.7-generators/generators.md](./4.7-generators/generators.md)

### **4.8 Observables (RxJS Basics)**
* Reactive programming concepts
* Observable streams and operators
* Handling multiple async values
* Real-world RxJS patterns
* **Files**: [4.8-observables/observables.md](./4.8-observables/observables.md)

## Learning Path

1. **Start with Event Loop** (4.1) - Foundation of async JavaScript
2. **Understand Task Queues** (4.2) - Critical for debugging async code
3. **Learn Callbacks** (4.3) - Historical context and problems
4. **Master Promises** (4.4) - Modern async foundation
5. **Use async/await** (4.5) - Clean async syntax
6. **Combine Promises** (4.6) - Handle multiple async operations
7. **Explore Generators** (4.7) - Advanced iteration patterns
8. **Discover Observables** (4.8) - Reactive programming

## Prerequisites

- Solid understanding of JavaScript functions and closures
- Familiarity with ES6+ features
- Basic knowledge of DOM events
- Understanding of HTTP requests

## Key Takeaways

After completing this section, you'll understand:
- How JavaScript's event loop works
- The difference between microtasks and macrotasks
- How to handle asynchronous operations effectively
- When to use callbacks, promises, async/await, or observables
- How to handle errors in asynchronous code
- Performance implications of different async patterns
- How to test asynchronous code

## Reference Links

1. [Event Loop & Callbacks Queue](./4.1-event-loop/event-loop.md)
2. [Microtasks vs Macrotasks](./4.2-microtasks-macrotasks/microtasks-macrotasks.md)
3. [Callback Functions & Callback Hell](./4.3-callbacks/callbacks.md)
4. [Promises](./4.4-promises/promises.md)
5. [async/await & Error Handling](./4.5-async-await/async-await.md)
6. [Promise Combinators](./4.6-promise-combinators/promise-combinators.md)
7. [Generators & Async Generators](./4.7-generators/generators.md)
8. [Observables (RxJS Basics)](./4.8-observables/observables.md)
