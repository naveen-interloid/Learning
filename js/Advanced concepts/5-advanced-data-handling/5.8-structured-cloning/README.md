# Structured Cloning Algorithm

The structured cloning algorithm is used by JavaScript to create deep copies of objects in various contexts like postMessage, IndexedDB, and the modern structuredClone() API.

## What is Structured Cloning?

Structured cloning creates a deep copy of a value, handling circular references and many built-in JavaScript types that JSON.stringify/parse cannot handle.

```javascript
// Basic structured cloning (modern browsers)
const original = {
    date: new Date(),
    regex: /test/gi,
    map: new Map([['key', 'value']]),
    set: new Set([1, 2, 3]),
    buffer: new ArrayBuffer(8)
};

const cloned = structuredClone(original);

console.log(cloned.date instanceof Date); // true
console.log(cloned.regex instanceof RegExp); // true
console.log(cloned.map instanceof Map); // true
console.log(cloned.set instanceof Set); // true
console.log(cloned.buffer instanceof ArrayBuffer); // true
```

## Supported Types

### Primitive Types
```javascript
const primitives = {
    string: 'hello',
    number: 42,
    bigint: 123n,
    boolean: true,
    null: null,
    undefined: undefined,
    symbol: Symbol('test') // Note: symbols are NOT cloneable
};

// Only non-symbol primitives are cloned
const cloned = structuredClone({
    string: primitives.string,
    number: primitives.number,
    bigint: primitives.bigint,
    boolean: primitives.boolean,
    null: primitives.null,
    undefined: primitives.undefined
    // symbol would throw an error
});
```

### Built-in Objects
```javascript
const builtInObjects = {
    // Date objects
    date: new Date('2023-01-01'),
    
    // RegExp objects
    regex: /pattern/gim,
    
    // Arrays (including nested)
    array: [1, [2, 3], { nested: true }],
    
    // Plain objects
    object: { a: 1, b: { c: 2 } },
    
    // Maps
    map: new Map([
        ['key1', 'value1'],
        [{ objKey: true }, 'value2']
    ]),
    
    // Sets
    set: new Set([1, 2, 3, { unique: true }]),
    
    // Typed Arrays
    int32Array: new Int32Array([1, 2, 3, 4]),
    float64Array: new Float64Array([1.1, 2.2, 3.3]),
    
    // ArrayBuffer and views
    buffer: new ArrayBuffer(16),
    
    // Error objects
    error: new Error('Test error'),
    evalError: new EvalError('Eval error'),
    rangeError: new RangeError('Range error'),
    referenceError: new ReferenceError('Reference error'),
    syntaxError: new SyntaxError('Syntax error'),
    typeError: new TypeError('Type error'),
    uriError: new URIError('URI error')
};

const cloned = structuredClone(builtInObjects);
```

## Unsupported Types

```javascript
// These types CANNOT be structured cloned
const unsupportedTypes = {
    // Functions
    func: () => {},
    
    // Symbols
    symbol: Symbol('test'),
    
    // DOM nodes
    element: document.createElement('div'),
    
    // Prototype chains (only own properties are cloned)
    customObject: Object.create({ inherited: 'property' }),
    
    // Objects with non-cloneable properties
    objectWithFunction: {
        data: 'cloneable',
        method: function() {} // This would cause an error
    }
};

// This would throw a DataCloneError
// structuredClone(unsupportedTypes);
```

## Handling Circular References

```javascript
// Structured cloning handles circular references automatically
const obj = { name: 'circular' };
obj.self = obj;
obj.nested = { parent: obj };

const cloned = structuredClone(obj);

console.log(cloned.self === cloned); // true
console.log(cloned.nested.parent === cloned); // true
console.log(cloned !== obj); // true - different objects
```

## Transfer Objects (Advanced)

```javascript
// Some objects can be transferred instead of cloned
// This moves ownership rather than copying
const buffer = new ArrayBuffer(1024);
const transferable = new Uint8Array(buffer);

// In Web Workers context:
// postMessage(transferable, [buffer]); // Transfer ownership

// After transfer, original buffer becomes unusable
// console.log(buffer.byteLength); // 0 - transferred
```

## Implementation in Different Contexts

### postMessage API

```javascript
// Web Workers
const worker = new Worker('worker.js');

const data = {
    timestamp: new Date(),
    config: new Map([['debug', true]]),
    buffer: new ArrayBuffer(1024)
};

// Uses structured cloning internally
worker.postMessage(data);

// In worker.js:
self.onmessage = function(event) {
    const clonedData = event.data;
    console.log(clonedData.timestamp instanceof Date); // true
    console.log(clonedData.config instanceof Map); // true
};
```

### IndexedDB

```javascript
// IndexedDB uses structured cloning for stored values
async function storeComplexData() {
    const request = indexedDB.open('TestDB', 1);
    
    request.onsuccess = function(event) {
        const db = event.target.result;
        const transaction = db.transaction(['store'], 'readwrite');
        const store = transaction.objectStore('store');
        
        const complexData = {
            id: 1,
            created: new Date(),
            tags: new Set(['javascript', 'indexeddb']),
            metadata: new Map([['version', '1.0']])
        };
        
        // Structured cloning happens automatically
        store.add(complexData);
    };
}
```

### History API

```javascript
// History state uses structured cloning
const state = {
    page: 'home',
    timestamp: new Date(),
    filters: new Map([['category', 'tech']])
};

// Uses structured cloning internally
history.pushState(state, 'Home Page', '/home');

window.addEventListener('popstate', (event) => {
    const clonedState = event.state;
    console.log(clonedState.timestamp instanceof Date); // true
    console.log(clonedState.filters instanceof Map); // true
});
```

## Custom Structured Cloning Implementation

```javascript
class StructuredCloner {
    static clone(obj, visited = new WeakMap()) {
        // Handle primitives and null
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }
        
        // Handle circular references
        if (visited.has(obj)) {
            return visited.get(obj);
        }
        
        let cloned;
        
        // Handle different object types
        if (obj instanceof Date) {
            cloned = new Date(obj.getTime());
        } else if (obj instanceof RegExp) {
            cloned = new RegExp(obj.source, obj.flags);
        } else if (obj instanceof Map) {
            cloned = new Map();
            visited.set(obj, cloned);
            for (const [key, value] of obj) {
                cloned.set(
                    this.clone(key, visited),
                    this.clone(value, visited)
                );
            }
        } else if (obj instanceof Set) {
            cloned = new Set();
            visited.set(obj, cloned);
            for (const value of obj) {
                cloned.add(this.clone(value, visited));
            }
        } else if (obj instanceof ArrayBuffer) {
            cloned = obj.slice(0);
        } else if (ArrayBuffer.isView(obj)) {
            // Handle typed arrays
            cloned = new obj.constructor(obj);
        } else if (obj instanceof Error) {
            cloned = new obj.constructor(obj.message);
            cloned.name = obj.name;
            cloned.stack = obj.stack;
        } else if (Array.isArray(obj)) {
            cloned = [];
            visited.set(obj, cloned);
            for (let i = 0; i < obj.length; i++) {
                cloned[i] = this.clone(obj[i], visited);
            }
        } else {
            // Handle plain objects
            cloned = {};
            visited.set(obj, cloned);
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = this.clone(obj[key], visited);
                }
            }
        }
        
        return cloned;
    }
    
    static isCloneable(obj) {
        if (obj === null || typeof obj !== 'object') {
            return typeof obj !== 'symbol' && typeof obj !== 'function';
        }
        
        // Check for uncloneable types
        if (typeof obj === 'function' ||
            obj instanceof Symbol ||
            obj.nodeType !== undefined || // DOM nodes
            obj instanceof WeakMap ||
            obj instanceof WeakSet) {
            return false;
        }
        
        return true;
    }
}

// Usage
const testData = {
    date: new Date(),
    map: new Map([['key', { nested: true }]]),
    circular: null
};
testData.circular = testData;

const cloned = StructuredCloner.clone(testData);
console.log(cloned.circular === cloned); // true
```

## Performance Considerations

```javascript
function performanceComparison() {
    const testData = {
        array: Array.from({length: 10000}, (_, i) => ({
            id: i,
            timestamp: new Date(),
            tags: new Set([`tag${i}`, `category${i % 10}`])
        }))
    };
    
    // JSON method (limited but fast)
    console.time('JSON clone');
    const jsonClone = JSON.parse(JSON.stringify(testData));
    console.timeEnd('JSON clone');
    
    // Structured clone (comprehensive but slower)
    console.time('Structured clone');
    const structuredClone = structuredClone(testData);
    console.timeEnd('Structured clone');
    
    // Custom implementation
    console.time('Custom clone');
    const customClone = StructuredCloner.clone(testData);
    console.timeEnd('Custom clone');
    
    console.log('JSON preserves Sets:', jsonClone.array[0].tags instanceof Set); // false
    console.log('Structured preserves Sets:', structuredClone.array[0].tags instanceof Set); // true
    console.log('Custom preserves Sets:', customClone.array[0].tags instanceof Set); // true
}
```

## Error Handling

```javascript
class SafeStructuredCloner {
    static clone(obj, options = {}) {
        const { 
            skipUncloneable = false,
            maxDepth = 100,
            onError = null 
        } = options;
        
        try {
            return this._cloneWithDepth(obj, 0, maxDepth, new WeakMap(), skipUncloneable);
        } catch (error) {
            if (onError) {
                return onError(error, obj);
            }
            throw error;
        }
    }
    
    static _cloneWithDepth(obj, depth, maxDepth, visited, skipUncloneable) {
        if (depth > maxDepth) {
            throw new Error(`Maximum cloning depth (${maxDepth}) exceeded`);
        }
        
        if (obj === null || typeof obj !== 'object') {
            if (typeof obj === 'symbol' || typeof obj === 'function') {
                if (skipUncloneable) {
                    return undefined;
                }
                throw new Error(`Cannot clone ${typeof obj}`);
            }
            return obj;
        }
        
        if (visited.has(obj)) {
            return visited.get(obj);
        }
        
        // Continue with cloning logic...
        // (Implementation details omitted for brevity)
    }
}

// Usage with error handling
const problematicData = {
    good: 'data',
    bad: () => 'function',
    nested: { symbol: Symbol('test') }
};

const safeClone = SafeStructuredCloner.clone(problematicData, {
    skipUncloneable: true,
    onError: (error, obj) => {
        console.warn('Cloning error:', error.message);
        return { error: 'Cloning failed' };
    }
});
```

## Best Practices

1. **Use native structuredClone() when available** - It's optimized and handles edge cases
2. **Understand limitations** - Not all objects can be cloned
3. **Handle errors gracefully** - Cloning can fail with unsupported types
4. **Consider performance** - Structured cloning is slower than shallow copying
5. **Test with your data types** - Ensure all your objects are cloneable
6. **Use for cross-context communication** - Web Workers, IndexedDB, etc.
7. **Prefer over JSON for complex objects** - When you need to preserve types

## Common Use Cases

- Web Worker communication
- IndexedDB storage
- Browser history state
- Deep copying complex objects
- Serialization for caching
- State management in applications
- Cross-frame communication
- Service Worker data handling
