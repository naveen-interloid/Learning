# Deep & Shallow Copy

Understanding the difference between deep and shallow copying is crucial for avoiding bugs and managing data correctly in JavaScript.

## Shallow Copy

A shallow copy creates a new object, but nested objects are still referenced, not copied.

### Methods for Shallow Copy

```javascript
// 1. Object.assign()
const original = { a: 1, b: { c: 2 } };
const shallowCopy1 = Object.assign({}, original);

// 2. Spread operator
const shallowCopy2 = { ...original };

// 3. Array.from() for arrays
const arr = [1, [2, 3], 4];
const shallowArrayCopy = Array.from(arr);

// 4. Slice for arrays
const shallowArrayCopy2 = arr.slice();
```

### Shallow Copy Limitations

```javascript
const original = { a: 1, b: { c: 2 } };
const copy = { ...original };

copy.a = 10; // Only affects copy
copy.b.c = 20; // Affects both original and copy!

console.log(original.b.c); // 20 - modified!
```

## Deep Copy

A deep copy creates a completely independent copy of an object and all nested objects.

### JSON Method (Limited)

```javascript
const original = { a: 1, b: { c: 2 }, d: [3, 4] };
const deepCopy = JSON.parse(JSON.stringify(original));

// Limitations:
const problematic = {
    date: new Date(),
    func: () => {},
    undefined: undefined,
    symbol: Symbol('test'),
    regex: /test/g
};

// JSON method loses functions, undefined, symbols, dates become strings
const broken = JSON.parse(JSON.stringify(problematic));
```

### Custom Deep Copy Implementation

```javascript
function deepCopy(obj) {
    // Handle null and non-objects
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    // Handle Date
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    // Handle Array
    if (Array.isArray(obj)) {
        return obj.map(item => deepCopy(item));
    }
    
    // Handle RegExp
    if (obj instanceof RegExp) {
        return new RegExp(obj);
    }
    
    // Handle Objects
    const copy = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            copy[key] = deepCopy(obj[key]);
        }
    }
    
    return copy;
}
```

### Advanced Deep Copy with Circular References

```javascript
function deepCopyWithCircular(obj, visited = new WeakMap()) {
    // Handle primitives and null
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    // Handle circular references
    if (visited.has(obj)) {
        return visited.get(obj);
    }
    
    let copy;
    
    if (obj instanceof Date) {
        copy = new Date(obj.getTime());
    } else if (obj instanceof RegExp) {
        copy = new RegExp(obj);
    } else if (Array.isArray(obj)) {
        copy = [];
        visited.set(obj, copy);
        for (let i = 0; i < obj.length; i++) {
            copy[i] = deepCopyWithCircular(obj[i], visited);
        }
    } else {
        copy = {};
        visited.set(obj, copy);
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                copy[key] = deepCopyWithCircular(obj[key], visited);
            }
        }
    }
    
    return copy;
}

// Test with circular reference
const obj = { a: 1 };
obj.self = obj;
const copied = deepCopyWithCircular(obj);
```

### Modern structuredClone() API

```javascript
// Modern browsers support structuredClone()
const original = {
    date: new Date(),
    regex: /test/g,
    map: new Map([['key', 'value']]),
    set: new Set([1, 2, 3]),
    buffer: new ArrayBuffer(8)
};

const deepCopy = structuredClone(original);

// Handles most built-in types correctly
// Still can't clone functions, symbols, or DOM nodes
```

## Performance Considerations

```javascript
// Benchmark different copying methods
function benchmark() {
    const data = {
        numbers: Array.from({length: 1000}, (_, i) => i),
        nested: { deep: { very: { deep: 'value' } } }
    };
    
    console.time('JSON method');
    for (let i = 0; i < 1000; i++) {
        JSON.parse(JSON.stringify(data));
    }
    console.timeEnd('JSON method');
    
    console.time('Custom deep copy');
    for (let i = 0; i < 1000; i++) {
        deepCopy(data);
    }
    console.timeEnd('Custom deep copy');
    
    console.time('structuredClone');
    for (let i = 0; i < 1000; i++) {
        structuredClone(data);
    }
    console.timeEnd('structuredClone');
}
```

## Best Practices

1. **Use shallow copy when possible** - It's faster and often sufficient
2. **Choose the right deep copy method** based on your data types
3. **Consider immutability libraries** like Immutable.js or Immer for complex scenarios
4. **Be aware of performance implications** - deep copying can be expensive
5. **Test with your actual data structures** - edge cases matter

## Common Pitfalls

- Assuming spread operator creates deep copies
- Using JSON methods with functions or special objects
- Not handling circular references
- Performance issues with large objects
- Forgetting about prototype chains in custom implementations
