# JSON Parsing & Advanced Techniques

JSON (JavaScript Object Notation) is more powerful than basic stringify/parse operations. Understanding advanced techniques can help with data transformation, validation, and custom serialization.

## JSON.parse() with Reviver Function

The reviver function allows you to transform values during parsing.

```javascript
// Basic reviver function
const jsonString = '{"date":"2023-01-01T00:00:00.000Z","count":"42"}';

const parsed = JSON.parse(jsonString, (key, value) => {
    // Transform date strings to Date objects
    if (key === 'date') {
        return new Date(value);
    }
    // Transform numeric strings to numbers
    if (key === 'count') {
        return parseInt(value, 10);
    }
    return value;
});

console.log(parsed.date instanceof Date); // true
console.log(typeof parsed.count); // 'number'
```

### Advanced Reviver Patterns

```javascript
// Type-aware reviver
function typeAwareReviver(key, value) {
    // Handle ISO date strings
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return new Date(value);
    }
    
    // Handle special objects with type markers
    if (value && typeof value === 'object' && value.__type) {
        switch (value.__type) {
            case 'RegExp':
                return new RegExp(value.source, value.flags);
            case 'Set':
                return new Set(value.values);
            case 'Map':
                return new Map(value.entries);
            default:
                return value;
        }
    }
    
    return value;
}

// Usage
const complexData = JSON.parse(complexJsonString, typeAwareReviver);
```

## JSON.stringify() with Replacer Function

The replacer function allows you to control serialization.

```javascript
// Basic replacer function
const data = {
    name: 'John',
    password: 'secret123',
    age: 30,
    internal: 'hidden'
};

// Filter out sensitive data
const safeJson = JSON.stringify(data, (key, value) => {
    if (key === 'password' || key === 'internal') {
        return undefined; // Exclude from output
    }
    return value;
});

console.log(safeJson); // {"name":"John","age":30}
```

### Advanced Replacer Patterns

```javascript
// Type-preserving replacer
function typePreservingReplacer(key, value) {
    // Handle Date objects
    if (value instanceof Date) {
        return {
            __type: 'Date',
            value: value.toISOString()
        };
    }
    
    // Handle RegExp objects
    if (value instanceof RegExp) {
        return {
            __type: 'RegExp',
            source: value.source,
            flags: value.flags
        };
    }
    
    // Handle Set objects
    if (value instanceof Set) {
        return {
            __type: 'Set',
            values: Array.from(value)
        };
    }
    
    // Handle Map objects
    if (value instanceof Map) {
        return {
            __type: 'Map',
            entries: Array.from(value.entries())
        };
    }
    
    return value;
}

// Usage
const complexObject = {
    date: new Date(),
    regex: /test/gi,
    set: new Set([1, 2, 3]),
    map: new Map([['key', 'value']])
};

const serialized = JSON.stringify(complexObject, typePreservingReplacer, 2);
```

## Handling Circular References

```javascript
// Circular reference handler
function getCircularReplacer() {
    const seen = new WeakSet();
    return (key, value) => {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular Reference]';
            }
            seen.add(value);
        }
        return value;
    };
}

// Usage with circular reference
const obj = { name: 'test' };
obj.self = obj;

const json = JSON.stringify(obj, getCircularReplacer());
console.log(json); // {"name":"test","self":"[Circular Reference]"}
```

## Custom Serialization Class

```javascript
class JSONSerializer {
    constructor() {
        this.typeHandlers = new Map();
        this.setupDefaultHandlers();
    }
    
    setupDefaultHandlers() {
        // Date handler
        this.typeHandlers.set('Date', {
            serialize: (date) => ({ __type: 'Date', value: date.toISOString() }),
            deserialize: (data) => new Date(data.value)
        });
        
        // RegExp handler
        this.typeHandlers.set('RegExp', {
            serialize: (regex) => ({ 
                __type: 'RegExp', 
                source: regex.source, 
                flags: regex.flags 
            }),
            deserialize: (data) => new RegExp(data.source, data.flags)
        });
        
        // Set handler
        this.typeHandlers.set('Set', {
            serialize: (set) => ({ __type: 'Set', values: Array.from(set) }),
            deserialize: (data) => new Set(data.values)
        });
    }
    
    serialize(obj) {
        return JSON.stringify(obj, (key, value) => {
            if (value && typeof value === 'object') {
                const constructor = value.constructor.name;
                const handler = this.typeHandlers.get(constructor);
                if (handler) {
                    return handler.serialize(value);
                }
            }
            return value;
        });
    }
    
    deserialize(jsonString) {
        return JSON.parse(jsonString, (key, value) => {
            if (value && typeof value === 'object' && value.__type) {
                const handler = this.typeHandlers.get(value.__type);
                if (handler) {
                    return handler.deserialize(value);
                }
            }
            return value;
        });
    }
    
    addTypeHandler(typeName, serializer, deserializer) {
        this.typeHandlers.set(typeName, {
            serialize: serializer,
            deserialize: deserializer
        });
    }
}

// Usage
const serializer = new JSONSerializer();
const data = {
    created: new Date(),
    pattern: /test/gi,
    tags: new Set(['js', 'json'])
};

const serialized = serializer.serialize(data);
const deserialized = serializer.deserialize(serialized);
```

## Performance Optimization

```javascript
// Streaming JSON for large datasets
class JSONStreamer {
    static *parseStream(jsonString) {
        // Simple implementation for array streaming
        if (jsonString.startsWith('[')) {
            let depth = 0;
            let current = '';
            let inString = false;
            let escaped = false;
            
            for (let i = 1; i < jsonString.length - 1; i++) {
                const char = jsonString[i];
                
                if (!inString) {
                    if (char === '{') depth++;
                    else if (char === '}') depth--;
                    else if (char === ',' && depth === 0) {
                        yield JSON.parse(current.trim());
                        current = '';
                        continue;
                    }
                }
                
                if (char === '"' && !escaped) inString = !inString;
                escaped = char === '\\' && !escaped;
                current += char;
            }
            
            if (current.trim()) {
                yield JSON.parse(current.trim());
            }
        }
    }
}

// Memory-efficient parsing of large arrays
const largeJsonArray = '[{"id":1},{"id":2},{"id":3}]';
for (const item of JSONStreamer.parseStream(largeJsonArray)) {
    console.log(item); // Process one item at a time
}
```

## Validation and Error Handling

```javascript
class SafeJSON {
    static parse(jsonString, reviver = null, options = {}) {
        const { 
            maxDepth = 100, 
            maxLength = 1000000,
            allowedTypes = ['object', 'array', 'string', 'number', 'boolean', 'null']
        } = options;
        
        // Basic validation
        if (typeof jsonString !== 'string') {
            throw new TypeError('Input must be a string');
        }
        
        if (jsonString.length > maxLength) {
            throw new Error(`JSON string too long: ${jsonString.length} > ${maxLength}`);
        }
        
        try {
            let depth = 0;
            const result = JSON.parse(jsonString, (key, value) => {
                // Track depth
                if (typeof value === 'object' && value !== null) {
                    depth++;
                    if (depth > maxDepth) {
                        throw new Error(`Maximum depth exceeded: ${depth} > ${maxDepth}`);
                    }
                }
                
                // Type validation
                const valueType = Array.isArray(value) ? 'array' : 
                                 value === null ? 'null' : typeof value;
                
                if (!allowedTypes.includes(valueType)) {
                    throw new Error(`Disallowed type: ${valueType}`);
                }
                
                return reviver ? reviver(key, value) : value;
            });
            
            return result;
        } catch (error) {
            throw new Error(`JSON parsing failed: ${error.message}`);
        }
    }
    
    static stringify(obj, replacer = null, space = null, options = {}) {
        const { maxDepth = 100 } = options;
        
        let depth = 0;
        const safeReplacer = (key, value) => {
            if (typeof value === 'object' && value !== null) {
                depth++;
                if (depth > maxDepth) {
                    return '[Max Depth Exceeded]';
                }
            }
            
            return replacer ? replacer(key, value) : value;
        };
        
        try {
            return JSON.stringify(obj, safeReplacer, space);
        } catch (error) {
            throw new Error(`JSON stringification failed: ${error.message}`);
        }
    }
}
```

## Best Practices

1. **Always validate JSON input** - Use try-catch blocks
2. **Use revivers for type conversion** - Convert strings to appropriate types
3. **Handle circular references** - Use WeakSet to track visited objects
4. **Consider performance** - Large objects can be slow to serialize
5. **Implement custom serialization** - For complex data types
6. **Validate data structure** - Check depth and size limits
7. **Use streaming for large datasets** - Process data incrementally

## Common Use Cases

- API data transformation
- Configuration file processing
- State serialization in applications
- Data migration and backup
- Inter-process communication
- Browser storage (localStorage, sessionStorage)
