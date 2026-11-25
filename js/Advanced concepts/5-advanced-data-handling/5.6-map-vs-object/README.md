# Map vs Object Performance

Understanding when to use Map vs Object is crucial for optimal performance and correct behavior in JavaScript applications.

## Key Differences

### Object Characteristics
- Keys must be strings or symbols
- Has prototype with default keys
- Not directly iterable (need Object.keys(), etc.)
- Optimized for property access
- JSON serializable

### Map Characteristics
- Keys can be any type (objects, primitives, functions)
- No default keys
- Directly iterable
- Optimized for frequent additions/deletions
- Not JSON serializable by default

## Performance Comparisons

### Creation Performance

```javascript
function testCreationPerformance() {
    const iterations = 1000000;
    
    // Object creation
    console.time('Object creation');
    for (let i = 0; i < iterations; i++) {
        const obj = {};
        obj[i] = i;
    }
    console.timeEnd('Object creation');
    
    // Map creation
    console.time('Map creation');
    for (let i = 0; i < iterations; i++) {
        const map = new Map();
        map.set(i, i);
    }
    console.timeEnd('Map creation');
}
```

### Access Performance

```javascript
function testAccessPerformance() {
    const size = 1000000;
    
    // Setup
    const obj = {};
    const map = new Map();
    
    for (let i = 0; i < size; i++) {
        obj[i] = i;
        map.set(i, i);
    }
    
    // Object access
    console.time('Object access');
    for (let i = 0; i < size; i++) {
        obj[i];
    }
    console.timeEnd('Object access');
    
    // Map access
    console.time('Map access');
    for (let i = 0; i < size; i++) {
        map.get(i);
    }
    console.timeEnd('Map access');
}
```

### Insertion Performance

```javascript
function testInsertionPerformance() {
    const iterations = 100000;
    
    // Object insertion
    console.time('Object insertion');
    const obj = {};
    for (let i = 0; i < iterations; i++) {
        obj[`key${i}`] = i;
    }
    console.timeEnd('Object insertion');
    
    // Map insertion
    console.time('Map insertion');
    const map = new Map();
    for (let i = 0; i < iterations; i++) {
        map.set(`key${i}`, i);
    }
    console.timeEnd('Map insertion');
}
```

### Deletion Performance

```javascript
function testDeletionPerformance() {
    const size = 100000;
    
    // Setup objects
    const obj = {};
    const map = new Map();
    
    for (let i = 0; i < size; i++) {
        obj[i] = i;
        map.set(i, i);
    }
    
    // Object deletion
    console.time('Object deletion');
    for (let i = 0; i < size; i++) {
        delete obj[i];
    }
    console.timeEnd('Object deletion');
    
    // Map deletion
    console.time('Map deletion');
    for (let i = 0; i < size; i++) {
        map.delete(i);
    }
    console.timeEnd('Map deletion');
}
```

## Memory Usage Comparison

```javascript
function memoryUsageTest() {
    const size = 100000;
    
    // Measure object memory
    const objBefore = process.memoryUsage().heapUsed;
    const obj = {};
    for (let i = 0; i < size; i++) {
        obj[`key${i}`] = `value${i}`;
    }
    const objAfter = process.memoryUsage().heapUsed;
    
    // Measure Map memory
    const mapBefore = process.memoryUsage().heapUsed;
    const map = new Map();
    for (let i = 0; i < size; i++) {
        map.set(`key${i}`, `value${i}`);
    }
    const mapAfter = process.memoryUsage().heapUsed;
    
    console.log(`Object memory: ${(objAfter - objBefore) / 1024 / 1024} MB`);
    console.log(`Map memory: ${(mapAfter - mapBefore) / 1024 / 1024} MB`);
}
```

## When to Use Each

### Use Object When:

```javascript
// 1. Working with records/dictionaries with string keys
const userRecord = {
    id: 1,
    name: 'John',
    email: 'john@example.com'
};

// 2. Need JSON serialization
const config = {
    apiUrl: 'https://api.example.com',
    timeout: 5000
};
const jsonConfig = JSON.stringify(config);

// 3. Need property access syntax
console.log(userRecord.name); // Clean syntax

// 4. Working with small, relatively static data
const constants = {
    PI: 3.14159,
    E: 2.71828
};
```

### Use Map When:

```javascript
// 1. Keys are not strings
const objectKeyMap = new Map();
const keyObj1 = { id: 1 };
const keyObj2 = { id: 2 };
objectKeyMap.set(keyObj1, 'value1');
objectKeyMap.set(keyObj2, 'value2');

// 2. Frequent additions and deletions
const cache = new Map();
function addToCache(key, value) {
    cache.set(key, value);
    if (cache.size > 1000) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey); // Efficient deletion
    }
}

// 3. Need to iterate in insertion order
const orderedMap = new Map();
orderedMap.set('first', 1);
orderedMap.set('second', 2);
orderedMap.set('third', 3);

for (const [key, value] of orderedMap) {
    console.log(key, value); // Guaranteed order
}

// 4. Need size information frequently
console.log(`Cache has ${cache.size} items`); // O(1) operation
```

## Advanced Performance Patterns

### Object Pool Pattern

```javascript
class ObjectPool {
    constructor() {
        this.objects = new Map(); // Use Map for object keys
        this.available = new Set();
    }
    
    acquire(key) {
        if (this.available.has(key)) {
            this.available.delete(key);
            return this.objects.get(key);
        }
        
        const obj = this.createObject(key);
        this.objects.set(key, obj);
        return obj;
    }
    
    release(key) {
        if (this.objects.has(key)) {
            this.available.add(key);
        }
    }
    
    createObject(key) {
        return { key, data: new Array(1000).fill(0) };
    }
}
```

### Hybrid Approach

```javascript
class HybridStorage {
    constructor() {
        this.stringKeys = {}; // Object for string keys
        this.objectKeys = new Map(); // Map for object keys
    }
    
    set(key, value) {
        if (typeof key === 'string') {
            this.stringKeys[key] = value;
        } else {
            this.objectKeys.set(key, value);
        }
    }
    
    get(key) {
        if (typeof key === 'string') {
            return this.stringKeys[key];
        } else {
            return this.objectKeys.get(key);
        }
    }
    
    has(key) {
        if (typeof key === 'string') {
            return key in this.stringKeys;
        } else {
            return this.objectKeys.has(key);
        }
    }
    
    delete(key) {
        if (typeof key === 'string') {
            delete this.stringKeys[key];
        } else {
            this.objectKeys.delete(key);
        }
    }
    
    *entries() {
        // Yield object entries
        for (const key in this.stringKeys) {
            yield [key, this.stringKeys[key]];
        }
        // Yield Map entries
        yield* this.objectKeys.entries();
    }
}
```

## Benchmarking Utilities

```javascript
class PerformanceBenchmark {
    static benchmark(name, fn, iterations = 1000000) {
        console.time(name);
        for (let i = 0; i < iterations; i++) {
            fn(i);
        }
        console.timeEnd(name);
    }
    
    static compare(tests, iterations = 1000000) {
        console.log(`Running ${iterations} iterations for each test:`);
        
        for (const [name, fn] of Object.entries(tests)) {
            this.benchmark(name, fn, iterations);
        }
    }
    
    static memoryUsage(fn) {
        const before = process.memoryUsage();
        fn();
        const after = process.memoryUsage();
        
        return {
            heapUsed: after.heapUsed - before.heapUsed,
            heapTotal: after.heapTotal - before.heapTotal,
            external: after.external - before.external
        };
    }
}

// Usage example
PerformanceBenchmark.compare({
    'Object property access': (i) => {
        const obj = { [i]: i };
        return obj[i];
    },
    'Map get': (i) => {
        const map = new Map([[i, i]]);
        return map.get(i);
    }
});
```

## Best Practices

### Object Best Practices
1. Use for records with known string keys
2. Prefer for small, static data structures
3. Use when JSON serialization is needed
4. Avoid frequent property additions/deletions
5. Use `Object.create(null)` for pure dictionaries

### Map Best Practices
1. Use for dynamic key-value storage
2. Prefer when keys are not strings
3. Use for frequent insertions/deletions
4. Use when iteration order matters
5. Consider WeakMap for object keys that should be garbage collected

### Performance Tips
1. Pre-allocate objects when possible
2. Use appropriate data structure for access patterns
3. Consider memory vs speed tradeoffs
4. Profile your specific use case
5. Use hybrid approaches when beneficial

## Real-world Examples

### Caching System
```javascript
class SmartCache {
    constructor(maxSize = 1000) {
        this.cache = new Map(); // Better for frequent updates
        this.maxSize = maxSize;
    }
    
    get(key) {
        const value = this.cache.get(key);
        if (value) {
            // Move to end (LRU)
            this.cache.delete(key);
            this.cache.set(key, value);
        }
        return value;
    }
    
    set(key, value) {
        if (this.cache.has(key)) {
            this.cache.delete(key);
        } else if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }
}
```

### Configuration Manager
```javascript
class ConfigManager {
    constructor() {
        this.config = {}; // Object for known string keys
        this.runtime = new Map(); // Map for dynamic runtime data
    }
    
    setConfig(key, value) {
        this.config[key] = value;
    }
    
    setRuntime(key, value) {
        this.runtime.set(key, value);
    }
    
    get(key) {
        return this.config[key] ?? this.runtime.get(key);
    }
    
    toJSON() {
        return JSON.stringify(this.config); // Only config is serializable
    }
}
```
