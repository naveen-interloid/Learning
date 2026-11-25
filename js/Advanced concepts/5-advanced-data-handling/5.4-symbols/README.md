# Symbols & Well-known Symbols

Symbols are a primitive data type that represents unique identifiers. They're often used to create private object properties and to implement JavaScript's built-in protocols.

## Basic Symbol Usage

### Creating Symbols

```javascript
// Create unique symbols
const sym1 = Symbol();
const sym2 = Symbol();
const sym3 = Symbol('description');

console.log(sym1 === sym2); // false - each symbol is unique
console.log(sym3.toString()); // 'Symbol(description)'
console.log(sym3.description); // 'description'
```

### Symbols as Object Properties

```javascript
const mySymbol = Symbol('myProperty');

const obj = {
    [mySymbol]: 'secret value',
    regularProperty: 'visible value'
};

console.log(obj[mySymbol]); // 'secret value'
console.log(obj.regularProperty); // 'visible value'

// Symbol properties are not enumerable
console.log(Object.keys(obj)); // ['regularProperty']
console.log(Object.getOwnPropertyNames(obj)); // ['regularProperty']
console.log(Object.getOwnPropertySymbols(obj)); // [Symbol(myProperty)]
```

## Global Symbol Registry

```javascript
// Create symbols in global registry
const globalSym1 = Symbol.for('shared.key');
const globalSym2 = Symbol.for('shared.key');

console.log(globalSym1 === globalSym2); // true - same symbol from registry

// Get the key for a global symbol
console.log(Symbol.keyFor(globalSym1)); // 'shared.key'

// Local symbols don't have keys
const localSym = Symbol('local');
console.log(Symbol.keyFor(localSym)); // undefined
```

## Well-known Symbols

JavaScript defines several well-known symbols that control language behavior.

### Symbol.iterator

```javascript
// Make objects iterable
const iterableObj = {
    data: [1, 2, 3, 4, 5],
    
    [Symbol.iterator]() {
        let index = 0;
        const data = this.data;
        
        return {
            next() {
                if (index < data.length) {
                    return { value: data[index++], done: false };
                } else {
                    return { done: true };
                }
            }
        };
    }
};

// Now it's iterable
for (const value of iterableObj) {
    console.log(value); // 1, 2, 3, 4, 5
}

// Works with spread operator
console.log([...iterableObj]); // [1, 2, 3, 4, 5]
```

### Symbol.toStringTag

```javascript
// Customize Object.prototype.toString() behavior
class CustomClass {
    constructor(name) {
        this.name = name;
    }
    
    get [Symbol.toStringTag]() {
        return 'CustomClass';
    }
}

const instance = new CustomClass('test');
console.log(Object.prototype.toString.call(instance)); // '[object CustomClass]'

// Without Symbol.toStringTag
class RegularClass {
    constructor(name) {
        this.name = name;
    }
}

const regular = new RegularClass('test');
console.log(Object.prototype.toString.call(regular)); // '[object Object]'
```

### Symbol.toPrimitive

```javascript
// Control type conversion behavior
class Temperature {
    constructor(celsius) {
        this.celsius = celsius;
    }
    
    [Symbol.toPrimitive](hint) {
        switch (hint) {
            case 'number':
                return this.celsius;
            case 'string':
                return `${this.celsius}°C`;
            case 'default':
                return this.celsius;
            default:
                throw new Error('Invalid hint');
        }
    }
}

const temp = new Temperature(25);
console.log(+temp); // 25 (number conversion)
console.log(`Temperature: ${temp}`); // 'Temperature: 25°C' (string conversion)
console.log(temp + 5); // 30 (default conversion)
```

### Symbol.hasInstance

```javascript
// Customize instanceof behavior
class MyArray {
    static [Symbol.hasInstance](instance) {
        return Array.isArray(instance);
    }
}

console.log([] instanceof MyArray); // true
console.log({} instanceof MyArray); // false
console.log([1, 2, 3] instanceof MyArray); // true
```

### Symbol.species

```javascript
// Control constructor used for derived objects
class MyArray extends Array {
    static get [Symbol.species]() {
        return Array; // Use Array constructor instead of MyArray
    }
}

const myArr = new MyArray(1, 2, 3);
const mapped = myArr.map(x => x * 2);

console.log(mapped instanceof MyArray); // false
console.log(mapped instanceof Array); // true
```

## Advanced Symbol Patterns

### Private Properties Simulation

```javascript
// Create private-like properties using symbols
const _private = Symbol('private');
const _secret = Symbol('secret');

class SecureClass {
    constructor(publicData, privateData) {
        this.public = publicData;
        this[_private] = privateData;
        this[_secret] = 'top secret';
    }
    
    getPrivate() {
        return this[_private];
    }
    
    setPrivate(value) {
        this[_private] = value;
    }
}

const instance = new SecureClass('visible', 'hidden');
console.log(instance.public); // 'visible'
console.log(instance.getPrivate()); // 'hidden'

// Private properties are not easily accessible
console.log(Object.keys(instance)); // ['public']
// But they can still be accessed if you have the symbol
console.log(instance[_private]); // 'hidden'
```

### Metadata Storage

```javascript
// Store metadata using symbols
const metadata = Symbol('metadata');

function addMetadata(obj, data) {
    if (!obj[metadata]) {
        obj[metadata] = {};
    }
    Object.assign(obj[metadata], data);
}

function getMetadata(obj, key) {
    return obj[metadata] && obj[metadata][key];
}

const user = { name: 'John', age: 30 };
addMetadata(user, { created: new Date(), version: 1 });

console.log(getMetadata(user, 'created')); // Date object
console.log(Object.keys(user)); // ['name', 'age'] - metadata is hidden
```

### Protocol Implementation

```javascript
// Implement custom protocols using symbols
const asyncIterator = Symbol('asyncIterator');

class AsyncRange {
    constructor(start, end, delay = 100) {
        this.start = start;
        this.end = end;
        this.delay = delay;
    }
    
    [Symbol.asyncIterator]() {
        let current = this.start;
        const end = this.end;
        const delay = this.delay;
        
        return {
            async next() {
                if (current <= end) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return { value: current++, done: false };
                } else {
                    return { done: true };
                }
            }
        };
    }
}

// Usage with for-await-of
async function useAsyncRange() {
    for await (const num of new AsyncRange(1, 5, 200)) {
        console.log(num); // 1, 2, 3, 4, 5 (with delays)
    }
}
```

### Symbol-based Enums

```javascript
// Create enum-like structures with symbols
const Colors = {
    RED: Symbol('red'),
    GREEN: Symbol('green'),
    BLUE: Symbol('blue'),
    
    // Helper methods
    values() {
        return [this.RED, this.GREEN, this.BLUE];
    },
    
    isValid(color) {
        return this.values().includes(color);
    }
};

function setColor(color) {
    if (!Colors.isValid(color)) {
        throw new Error('Invalid color');
    }
    console.log('Color set to:', color.toString());
}

setColor(Colors.RED); // Works
// setColor('red'); // Throws error - string not accepted
```

## Symbol Utilities

### Symbol Inspection

```javascript
// Utility functions for working with symbols
class SymbolUtils {
    static getSymbolProperties(obj) {
        return Object.getOwnPropertySymbols(obj);
    }
    
    static getAllProperties(obj) {
        return [
            ...Object.getOwnPropertyNames(obj),
            ...Object.getOwnPropertySymbols(obj)
        ];
    }
    
    static copyWithSymbols(source, target = {}) {
        // Copy regular properties
        Object.assign(target, source);
        
        // Copy symbol properties
        const symbols = Object.getOwnPropertySymbols(source);
        symbols.forEach(sym => {
            target[sym] = source[sym];
        });
        
        return target;
    }
    
    static describeSymbol(sym) {
        if (typeof sym !== 'symbol') {
            return 'Not a symbol';
        }
        
        const key = Symbol.keyFor(sym);
        return {
            description: sym.description,
            isGlobal: key !== undefined,
            globalKey: key,
            toString: sym.toString()
        };
    }
}

// Usage
const sym1 = Symbol('local');
const sym2 = Symbol.for('global');

console.log(SymbolUtils.describeSymbol(sym1));
// { description: 'local', isGlobal: false, globalKey: undefined, toString: 'Symbol(local)' }

console.log(SymbolUtils.describeSymbol(sym2));
// { description: 'global', isGlobal: true, globalKey: 'global', toString: 'Symbol(global)' }
```

### Symbol-based Registry

```javascript
// Create a symbol-based registry system
class SymbolRegistry {
    constructor() {
        this.symbols = new Map();
        this.descriptions = new Map();
    }
    
    create(description) {
        const symbol = Symbol(description);
        this.symbols.set(description, symbol);
        this.descriptions.set(symbol, description);
        return symbol;
    }
    
    get(description) {
        return this.symbols.get(description);
    }
    
    has(description) {
        return this.symbols.has(description);
    }
    
    getDescription(symbol) {
        return this.descriptions.get(symbol);
    }
    
    list() {
        return Array.from(this.symbols.keys());
    }
    
    clear() {
        this.symbols.clear();
        this.descriptions.clear();
    }
}

// Usage
const registry = new SymbolRegistry();
const userSym = registry.create('user.id');
const adminSym = registry.create('admin.token');

console.log(registry.list()); // ['user.id', 'admin.token']
console.log(registry.get('user.id') === userSym); // true
```

## Performance Considerations

```javascript
// Symbol property access performance
function performanceTest() {
    const obj = {};
    const sym = Symbol('test');
    const str = 'test';
    
    // Setup
    obj[sym] = 'symbol value';
    obj[str] = 'string value';
    
    const iterations = 1000000;
    
    // Test symbol property access
    console.time('Symbol access');
    for (let i = 0; i < iterations; i++) {
        obj[sym];
    }
    console.timeEnd('Symbol access');
    
    // Test string property access
    console.time('String access');
    for (let i = 0; i < iterations; i++) {
        obj[str];
    }
    console.timeEnd('String access');
}

// performanceTest();
```

## Best Practices

1. **Use symbols for private-like properties** - They're not truly private but harder to access accidentally
2. **Implement well-known symbols** - To integrate with JavaScript's built-in behavior
3. **Use global registry sparingly** - Only when you need to share symbols across modules
4. **Document symbol usage** - Symbols can make code less readable
5. **Consider performance** - Symbol property access is slightly slower than string properties
6. **Use descriptive names** - Symbol descriptions help with debugging
7. **Don't rely on symbols for security** - They can still be accessed via reflection

## Common Use Cases

- Creating private object properties
- Implementing custom iteration protocols
- Defining object metadata
- Creating unique constants/enums
- Implementing custom type conversion
- Building framework/library APIs
- Avoiding property name collisions
- Creating extensible object protocols
