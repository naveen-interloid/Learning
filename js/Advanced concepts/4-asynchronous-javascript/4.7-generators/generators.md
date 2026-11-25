# **7. Generators & Async Generators**

### 1️⃣ Understanding Generators

**What are Generators?**
Generators are functions that can be paused and resumed, allowing you to produce a sequence of values over time.

```javascript
// Basic generator function
function* simpleGenerator() {
  console.log('Generator started');
  yield 1;
  console.log('After first yield');
  yield 2;
  console.log('After second yield');
  yield 3;
  console.log('Generator finished');
}

const gen = simpleGenerator();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: false }
console.log(gen.next()); // { value: undefined, done: true }
```

**Generator Syntax:**
```javascript
// Function declaration
function* generatorFunction() {
  yield 'value';
}

// Function expression
const generatorExpression = function* () {
  yield 'value';
};

// Arrow function (not supported)
// const arrowGenerator = * () => {}; // SyntaxError!

// Method in object
const obj = {
  * generatorMethod() {
    yield 'value';
  }
};

// Method in class
class MyClass {
  * generatorMethod() {
    yield 'value';
  }
}
```

---

### 2️⃣ Generator Mechanics

**Yield and Return:**
```javascript
function* demonstrateYieldReturn() {
  yield 'first';
  yield 'second';
  return 'final'; // This ends the generator
  yield 'never reached';
}

const gen = demonstrateYieldReturn();
console.log(gen.next()); // { value: 'first', done: false }
console.log(gen.next()); // { value: 'second', done: false }
console.log(gen.next()); // { value: 'final', done: true }
console.log(gen.next()); // { value: undefined, done: true }
```

**Passing Values to Generators:**
```javascript
function* interactiveGenerator() {
  const first = yield 'What is your name?';
  console.log(`Hello, ${first}!`);
  
  const second = yield 'What is your age?';
  console.log(`You are ${second} years old.`);
  
  return `Nice to meet you, ${first}!`;
}

const gen = interactiveGenerator();
console.log(gen.next());        // { value: 'What is your name?', done: false }
console.log(gen.next('Alice')); // Hello, Alice! { value: 'What is your age?', done: false }
console.log(gen.next(25));      // You are 25 years old. { value: 'Nice to meet you, Alice!', done: true }
```

**Generator Delegation (yield*):**
```javascript
function* innerGenerator() {
  yield 'inner1';
  yield 'inner2';
  return 'inner-return';
}

function* outerGenerator() {
  yield 'outer1';
  const result = yield* innerGenerator(); // Delegate to inner generator
  console.log('Inner generator returned:', result);
  yield 'outer2';
}

const gen = outerGenerator();
console.log(gen.next()); // { value: 'outer1', done: false }
console.log(gen.next()); // { value: 'inner1', done: false }
console.log(gen.next()); // { value: 'inner2', done: false }
console.log(gen.next()); // Inner generator returned: inner-return { value: 'outer2', done: false }
console.log(gen.next()); // { value: undefined, done: true }
```

---

### 3️⃣ Practical Generator Examples

**Infinite Sequences:**
```javascript
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

function* take(generator, count) {
  let taken = 0;
  for (const value of generator) {
    if (taken >= count) break;
    yield value;
    taken++;
  }
}

// Get first 10 Fibonacci numbers
const fib = fibonacci();
const first10 = [...take(fib, 10)];
console.log(first10); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

**ID Generator:**
```javascript
function* createIdGenerator(prefix = 'id', start = 1) {
  let current = start;
  while (true) {
    yield `${prefix}-${current++}`;
  }
}

const userIdGen = createIdGenerator('user', 1000);
const postIdGen = createIdGenerator('post');

console.log(userIdGen.next().value); // 'user-1000'
console.log(userIdGen.next().value); // 'user-1001'
console.log(postIdGen.next().value); // 'post-1'
console.log(postIdGen.next().value); // 'post-2'
```

**State Machine:**
```javascript
function* trafficLight() {
  while (true) {
    yield 'red';
    yield 'yellow';
    yield 'green';
    yield 'yellow';
  }
}

class TrafficLightController {
  constructor() {
    this.lightGenerator = trafficLight();
    this.currentLight = this.lightGenerator.next().value;
  }
  
  next() {
    this.currentLight = this.lightGenerator.next().value;
    return this.currentLight;
  }
  
  getCurrentLight() {
    return this.currentLight;
  }
}

const controller = new TrafficLightController();
console.log(controller.getCurrentLight()); // 'red'
console.log(controller.next()); // 'yellow'
console.log(controller.next()); // 'green'
console.log(controller.next()); // 'yellow'
console.log(controller.next()); // 'red'
```

---

### 4️⃣ Async Generators

**Basic Async Generator:**
```javascript
async function* asyncGenerator() {
  console.log('Async generator started');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  yield 'First value after 1s';
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  yield 'Second value after 2s';
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  yield 'Third value after 3s';
  
  console.log('Async generator finished');
}

// Using for-await-of
async function consumeAsyncGenerator() {
  for await (const value of asyncGenerator()) {
    console.log('Received:', value);
  }
}

consumeAsyncGenerator();
```

**Manual Async Generator Consumption:**
```javascript
async function manualConsumption() {
  const gen = asyncGenerator();
  
  let result = await gen.next();
  while (!result.done) {
    console.log('Value:', result.value);
    result = await gen.next();
  }
}
```

**Data Stream Simulation:**
```javascript
async function* dataStream() {
  const data = ['chunk1', 'chunk2', 'chunk3', 'chunk4', 'chunk5'];
  
  for (const chunk of data) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    yield chunk;
  }
}

async function processDataStream() {
  console.log('Starting data processing...');
  
  for await (const chunk of dataStream()) {
    console.log('Processing chunk:', chunk);
    // Process chunk here
  }
  
  console.log('Data processing complete');
}
```

---

### 5️⃣ Advanced Generator Patterns

**Generator Pipeline:**
```javascript
function* numbers() {
  for (let i = 1; i <= 10; i++) {
    yield i;
  }
}

function* filter(generator, predicate) {
  for (const value of generator) {
    if (predicate(value)) {
      yield value;
    }
  }
}

function* map(generator, mapper) {
  for (const value of generator) {
    yield mapper(value);
  }
}

function* take(generator, count) {
  let taken = 0;
  for (const value of generator) {
    if (taken >= count) break;
    yield value;
    taken++;
  }
}

// Create a pipeline
const pipeline = take(
  map(
    filter(numbers(), x => x % 2 === 0), // Even numbers
    x => x * x                          // Square them
  ),
  3 // Take first 3
);

console.log([...pipeline]); // [4, 16, 36]
```

**Async Generator with Error Handling:**
```javascript
async function* robustAsyncGenerator() {
  const urls = [
    'https://api.example.com/data1',
    'https://api.example.com/data2',
    'https://api.example.com/data3'
  ];
  
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      yield { success: true, data, url };
    } catch (error) {
      yield { success: false, error: error.message, url };
    }
  }
}

async function processRobustStream() {
  for await (const result of robustAsyncGenerator()) {
    if (result.success) {
      console.log('Data from', result.url, ':', result.data);
    } else {
      console.error('Error from', result.url, ':', result.error);
    }
  }
}
```

**Backpressure Handling:**
```javascript
class AsyncGeneratorWithBackpressure {
  constructor(maxBufferSize = 5) {
    this.buffer = [];
    this.maxBufferSize = maxBufferSize;
    this.waitingResolvers = [];
    this.finished = false;
  }
  
  async* generate() {
    while (!this.finished || this.buffer.length > 0) {
      if (this.buffer.length === 0) {
        // Wait for data
        await new Promise(resolve => {
          this.waitingResolvers.push(resolve);
        });
      }
      
      if (this.buffer.length > 0) {
        yield this.buffer.shift();
      }
    }
  }
  
  push(value) {
    if (this.buffer.length >= this.maxBufferSize) {
      throw new Error('Buffer overflow - backpressure detected');
    }
    
    this.buffer.push(value);
    
    // Notify waiting consumers
    if (this.waitingResolvers.length > 0) {
      const resolve = this.waitingResolvers.shift();
      resolve();
    }
  }
  
  finish() {
    this.finished = true;
    // Notify all waiting consumers
    this.waitingResolvers.forEach(resolve => resolve());
    this.waitingResolvers = [];
  }
}

// Usage
const generator = new AsyncGeneratorWithBackpressure(3);

// Producer
setTimeout(() => generator.push('data1'), 100);
setTimeout(() => generator.push('data2'), 200);
setTimeout(() => generator.push('data3'), 300);
setTimeout(() => generator.finish(), 400);

// Consumer
async function consume() {
  for await (const data of generator.generate()) {
    console.log('Consumed:', data);
  }
}
```

---

### 6️⃣ Real-World Applications

**Pagination Handler:**
```javascript
async function* paginatedFetch(baseUrl, pageSize = 10) {
  let page = 1;
  let hasMore = true;
  
  while (hasMore) {
    try {
      const response = await fetch(`${baseUrl}?page=${page}&size=${pageSize}`);
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        yield* data.items; // Yield each item individually
        hasMore = data.hasMore || data.items.length === pageSize;
        page++;
      } else {
        hasMore = false;
      }
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      hasMore = false;
    }
  }
}

// Usage
async function processAllUsers() {
  let count = 0;
  for await (const user of paginatedFetch('/api/users', 50)) {
    console.log(`Processing user ${++count}:`, user.name);
    
    // Process user
    await processUser(user);
    
    // Optional: Add delay to avoid overwhelming the server
    if (count % 100 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`Processed ${count} users total`);
}
```

**File Processing:**
```javascript
async function* processLargeFile(filePath, chunkSize = 1024) {
  const fs = require('fs').promises;
  const fileHandle = await fs.open(filePath, 'r');
  
  try {
    let position = 0;
    const buffer = Buffer.alloc(chunkSize);
    
    while (true) {
      const { bytesRead } = await fileHandle.read(buffer, 0, chunkSize, position);
      
      if (bytesRead === 0) break; // End of file
      
      yield buffer.slice(0, bytesRead);
      position += bytesRead;
    }
  } finally {
    await fileHandle.close();
  }
}

// Usage
async function analyzeFile(filePath) {
  let totalBytes = 0;
  let lineCount = 0;
  let partialLine = '';
  
  for await (const chunk of processLargeFile(filePath)) {
    totalBytes += chunk.length;
    
    const text = partialLine + chunk.toString();
    const lines = text.split('\n');
    
    // Keep the last partial line for next iteration
    partialLine = lines.pop();
    lineCount += lines.length;
  }
  
  // Don't forget the last line if file doesn't end with newline
  if (partialLine) lineCount++;
  
  console.log(`File analysis: ${totalBytes} bytes, ${lineCount} lines`);
}
```

---

### 7️⃣ Testing Generators

**Testing Sync Generators:**
```javascript
function* testGenerator() {
  yield 1;
  yield 2;
  yield 3;
}

describe('Generator Tests', () => {
  test('should yield correct values', () => {
    const gen = testGenerator();
    
    expect(gen.next()).toEqual({ value: 1, done: false });
    expect(gen.next()).toEqual({ value: 2, done: false });
    expect(gen.next()).toEqual({ value: 3, done: false });
    expect(gen.next()).toEqual({ value: undefined, done: true });
  });
  
  test('should work with spread operator', () => {
    const values = [...testGenerator()];
    expect(values).toEqual([1, 2, 3]);
  });
});
```

**Testing Async Generators:**
```javascript
async function* asyncTestGenerator() {
  await new Promise(resolve => setTimeout(resolve, 10));
  yield 'a';
  await new Promise(resolve => setTimeout(resolve, 10));
  yield 'b';
}

describe('Async Generator Tests', () => {
  test('should yield async values', async () => {
    const gen = asyncTestGenerator();
    
    const first = await gen.next();
    expect(first).toEqual({ value: 'a', done: false });
    
    const second = await gen.next();
    expect(second).toEqual({ value: 'b', done: false });
    
    const third = await gen.next();
    expect(third).toEqual({ value: undefined, done: true });
  });
  
  test('should work with for-await-of', async () => {
    const values = [];
    for await (const value of asyncTestGenerator()) {
      values.push(value);
    }
    expect(values).toEqual(['a', 'b']);
  });
});
```

---

### 8️⃣ Performance Considerations

**Memory Efficiency:**
```javascript
// ❌ Memory inefficient - creates entire array in memory
function getAllNumbers(max) {
  const numbers = [];
  for (let i = 1; i <= max; i++) {
    numbers.push(i);
  }
  return numbers;
}

// ✅ Memory efficient - generates values on demand
function* getNumbers(max) {
  for (let i = 1; i <= max; i++) {
    yield i;
  }
}

// Usage comparison
const millionNumbers = getAllNumbers(1000000); // Uses ~8MB memory
const millionGenerator = getNumbers(1000000);  // Uses minimal memory

// Process only what you need
for (const num of millionGenerator) {
  if (num > 100) break; // Only generated 100 numbers
  console.log(num);
}
```

---

### 9️⃣ Best Practices

**Do's:**
```javascript
// ✅ Use generators for lazy evaluation
function* lazyMap(iterable, mapper) {
  for (const item of iterable) {
    yield mapper(item);
  }
}

// ✅ Handle errors in async generators
async function* safeAsyncGenerator() {
  try {
    yield await riskyOperation();
  } catch (error) {
    console.error('Error in generator:', error);
    yield null; // or appropriate fallback
  }
}

// ✅ Use yield* for delegation
function* combinedGenerator() {
  yield* generator1();
  yield* generator2();
}
```

**Don'ts:**
```javascript
// ❌ Don't forget that generators are lazy
function* expensiveGenerator() {
  console.log('This runs when next() is called, not when generator is created');
  yield 1;
}

const gen = expensiveGenerator(); // Nothing logged yet
gen.next(); // Now it logs

// ❌ Don't use generators for simple iterations
function* simpleRange(n) {
  for (let i = 0; i < n; i++) {
    yield i;
  }
}

// Better: Use Array.from or simple for loop for small ranges
const simpleArray = Array.from({ length: n }, (_, i) => i);
```

---

### 🔟 Key Takeaways

* **Generators** enable lazy evaluation and memory-efficient iteration
* **yield** pauses execution and returns a value
* **yield*** delegates to another generator
* **Async generators** combine async/await with generator functionality
* **for-await-of** is used to consume async generators
* **Generators are iterables** and work with spread operator, destructuring
* **Use generators** for infinite sequences, state machines, and data streams
* **Test generators** by checking next() results or using iteration
* **Consider memory efficiency** when choosing generators vs arrays
* **Handle errors appropriately** in both sync and async generators
