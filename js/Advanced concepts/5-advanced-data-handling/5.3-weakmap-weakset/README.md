# WeakMap & WeakSet

WeakMap and WeakSet are specialized collections that hold "weak" references to their keys/values, allowing for automatic garbage collection when objects are no longer referenced elsewhere.

## WeakMap

WeakMap is a collection of key-value pairs where keys must be objects and are held weakly.

### Basic WeakMap Usage

```javascript
const wm = new WeakMap();

// Keys must be objects
const obj1 = {};
const obj2 = {};

wm.set(obj1, 'value for obj1');
wm.set(obj2, 'value for obj2');

console.log(wm.get(obj1)); // 'value for obj1'
console.log(wm.has(obj2)); // true

wm.delete(obj1);
console.log(wm.has(obj1)); // false
```

### WeakMap Methods

```javascript
const wm = new WeakMap();
const key = {};

// set(key, value) - adds or updates an entry
wm.set(key, 'some value');

// get(key) - returns the value for the key
console.log(wm.get(key)); // 'some value'

// has(key) - returns boolean indicating if key exists
console.log(wm.has(key)); // true

// delete(key) - removes the entry
wm.delete(key);
console.log(wm.has(key)); // false
```

### Private Data Pattern with WeakMap

```javascript
// Private data using WeakMap
const privateData = new WeakMap();

class User {
    constructor(name, email) {
        // Store private data
        privateData.set(this, {
            name: name,
            email: email,
            id: Math.random().toString(36)
        });
    }
    
    getName() {
        return privateData.get(this).name;
    }
    
    getEmail() {
        return privateData.get(this).email;
    }
    
    setEmail(newEmail) {
        const data = privateData.get(this);
        data.email = newEmail;
    }
    
    // Private ID is not accessible from outside
    _getId() {
        return privateData.get(this).id;
    }
}

const user = new User('John', 'john@example.com');
console.log(user.getName()); // 'John'
// user.name is undefined - truly private!
```

### Metadata Storage Pattern

```javascript
// Store metadata about DOM elements
const elementMetadata = new WeakMap();

function addMetadata(element, data) {
    elementMetadata.set(element, {
        ...elementMetadata.get(element),
        ...data
    });
}

function getMetadata(element) {
    return elementMetadata.get(element) || {};
}

// Usage
const button = document.createElement('button');
addMetadata(button, { 
    clickCount: 0, 
    created: new Date() 
});

button.addEventListener('click', () => {
    const meta = getMetadata(button);
    meta.clickCount++;
    meta.lastClicked = new Date();
});
```

## WeakSet

WeakSet is a collection of objects where each object can occur only once and are held weakly.

### Basic WeakSet Usage

```javascript
const ws = new WeakSet();

const obj1 = {};
const obj2 = {};

// Add objects to WeakSet
ws.add(obj1);
ws.add(obj2);

console.log(ws.has(obj1)); // true
console.log(ws.has(obj2)); // true

ws.delete(obj1);
console.log(ws.has(obj1)); // false
```

### WeakSet Methods

```javascript
const ws = new WeakSet();
const obj = {};

// add(value) - adds an object to the WeakSet
ws.add(obj);

// has(value) - returns boolean indicating if object exists
console.log(ws.has(obj)); // true

// delete(value) - removes the object
ws.delete(obj);
console.log(ws.has(obj)); // false
```

### Object Tracking Pattern

```javascript
// Track processed objects to avoid reprocessing
const processedObjects = new WeakSet();

function processObject(obj) {
    if (processedObjects.has(obj)) {
        console.log('Object already processed');
        return;
    }
    
    // Process the object
    console.log('Processing object:', obj);
    
    // Mark as processed
    processedObjects.add(obj);
}

const data = { id: 1, name: 'test' };
processObject(data); // Processing object: { id: 1, name: 'test' }
processObject(data); // Object already processed
```

### Access Control Pattern

```javascript
// Control access to sensitive operations
const authorizedObjects = new WeakSet();

class SecureAPI {
    static authorize(obj) {
        authorizedObjects.add(obj);
    }
    
    static revoke(obj) {
        authorizedObjects.delete(obj);
    }
    
    static sensitiveOperation(obj, data) {
        if (!authorizedObjects.has(obj)) {
            throw new Error('Unauthorized access');
        }
        
        // Perform sensitive operation
        return `Processed: ${data}`;
    }
}

const client = {};
SecureAPI.authorize(client);
console.log(SecureAPI.sensitiveOperation(client, 'secret data')); // Works

SecureAPI.revoke(client);
// SecureAPI.sensitiveOperation(client, 'secret data'); // Throws error
```

## Memory Management Benefits

### Automatic Cleanup

```javascript
// Demonstrate automatic cleanup
function demonstrateCleanup() {
    const wm = new WeakMap();
    const ws = new WeakSet();
    
    let obj = { data: 'test' };
    
    wm.set(obj, 'stored in WeakMap');
    ws.add(obj);
    
    console.log(wm.has(obj)); // true
    console.log(ws.has(obj)); // true
    
    // Remove the only reference to obj
    obj = null;
    
    // At this point, the object can be garbage collected
    // and will be automatically removed from WeakMap and WeakSet
    // (though we can't directly observe this)
}

demonstrateCleanup();
```

### Comparison with Regular Map/Set

```javascript
// Regular Map keeps references alive
const regularMap = new Map();
const weakMap = new WeakMap();

function createObjects() {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    
    // Regular Map prevents garbage collection
    regularMap.set(obj1, 'value1');
    
    // WeakMap allows garbage collection
    weakMap.set(obj2, 'value2');
    
    return { obj1, obj2 };
}

const { obj1, obj2 } = createObjects();

// Even if we lose references to obj1 and obj2,
// obj1 will remain in memory due to regularMap
// obj2 can be garbage collected
```

## Advanced Patterns

### Memoization with Automatic Cleanup

```javascript
// Memoization that doesn't prevent garbage collection
const memoCache = new WeakMap();

function memoize(fn) {
    return function(obj, ...args) {
        if (!memoCache.has(obj)) {
            memoCache.set(obj, new Map());
        }
        
        const objCache = memoCache.get(obj);
        const key = JSON.stringify(args);
        
        if (objCache.has(key)) {
            return objCache.get(key);
        }
        
        const result = fn.call(this, obj, ...args);
        objCache.set(key, result);
        return result;
    };
}

// Usage
const expensiveOperation = memoize((obj, multiplier) => {
    console.log('Computing...');
    return obj.value * multiplier;
});

const data = { value: 10 };
console.log(expensiveOperation(data, 2)); // Computing... 20
console.log(expensiveOperation(data, 2)); // 20 (cached)
```

### Event Listener Management

```javascript
// Automatic cleanup of event listeners
const elementListeners = new WeakMap();

function addManagedListener(element, event, handler) {
    if (!elementListeners.has(element)) {
        elementListeners.set(element, new Map());
    }
    
    const listeners = elementListeners.get(element);
    
    if (listeners.has(event)) {
        // Remove existing listener
        element.removeEventListener(event, listeners.get(event));
    }
    
    element.addEventListener(event, handler);
    listeners.set(event, handler);
}

function removeManagedListener(element, event) {
    const listeners = elementListeners.get(element);
    if (listeners && listeners.has(event)) {
        element.removeEventListener(event, listeners.get(event));
        listeners.delete(event);
    }
}

// Usage
const button = document.createElement('button');
addManagedListener(button, 'click', () => console.log('Clicked!'));
// When button is removed from DOM and dereferenced,
// listeners are automatically cleaned up
```

## Limitations and Considerations

### WeakMap/WeakSet Limitations

```javascript
// 1. Keys/values must be objects (not primitives)
const wm = new WeakMap();
// wm.set('string', 'value'); // TypeError!
// wm.set(42, 'value'); // TypeError!

// 2. Not enumerable
const ws = new WeakSet();
ws.add({});
ws.add({});
// console.log(ws.size); // undefined
// for (let item of ws) {} // TypeError!

// 3. No clear() method
// ws.clear(); // TypeError!

// 4. Cannot iterate
// Object.keys(wm); // []
// [...wm]; // TypeError!
```

### When to Use WeakMap vs Map

```javascript
// Use WeakMap when:
// - Keys are objects that might be garbage collected
// - You want automatic cleanup
// - Storing metadata about objects
// - Implementing private data

// Use Map when:
// - You need to iterate over entries
// - Keys might be primitives
// - You need to know the size
// - You need to clear all entries
```

## Best Practices

1. **Use for object metadata** - Store additional data about objects
2. **Implement private data** - Create truly private class properties
3. **Avoid memory leaks** - Let objects be garbage collected automatically
4. **Don't rely on immediate cleanup** - Garbage collection timing is unpredictable
5. **Use for caching** - When cache entries should be cleaned up automatically
6. **Consider regular Map/Set** - If you need enumeration or primitive keys

## Common Use Cases

- Private class data
- Object metadata storage
- Caching with automatic cleanup
- DOM element data association
- Access control and authorization
- Preventing memory leaks in long-running applications
- Memoization patterns
- Event listener management
