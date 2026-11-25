# **10.1 Proxy & Reflect API**

The Proxy and Reflect APIs provide powerful metaprogramming capabilities, allowing you to intercept and customize operations on objects such as property access, assignment, enumeration, and function invocation.

## Understanding Proxy

### Basic Proxy Concepts

```javascript
// Basic Proxy structure
const target = { name: 'John', age: 30 };

const handler = {
  get(target, property, receiver) {
    console.log(`Getting property: ${property}`);
    return Reflect.get(target, property, receiver);
  },
  
  set(target, property, value, receiver) {
    console.log(`Setting property: ${property} = ${value}`);
    return Reflect.set(target, property, value, receiver);
  }
};

const proxy = new Proxy(target, handler);

// Usage
console.log(proxy.name);    // "Getting property: name" → "John"
proxy.age = 31;             // "Setting property: age = 31"
console.log(proxy.age);     // "Getting property: age" → 31
```

### Proxy Handler Methods

```javascript
// Comprehensive proxy handler demonstration
class ProxyHandlerDemo {
  static createInstrumentedObject(target) {
    return new Proxy(target, {
      // Property access
      get(target, property, receiver) {
        console.log(`[GET] ${String(property)}`);
        return Reflect.get(target, property, receiver);
      },
      
      // Property assignment
      set(target, property, value, receiver) {
        console.log(`[SET] ${String(property)} = ${value}`);
        return Reflect.set(target, property, value, receiver);
      },
      
      // Property existence check
      has(target, property) {
        console.log(`[HAS] ${String(property)}`);
        return Reflect.has(target, property);
      },
      
      // Property deletion
      deleteProperty(target, property) {
        console.log(`[DELETE] ${String(property)}`);
        return Reflect.deleteProperty(target, property);
      },
      
      // Property enumeration
      ownKeys(target) {
        console.log('[OWNKEYS] Getting own property keys');
        return Reflect.ownKeys(target);
      },
      
      // Property descriptor access
      getOwnPropertyDescriptor(target, property) {
        console.log(`[GETDESCRIPTOR] ${String(property)}`);
        return Reflect.getOwnPropertyDescriptor(target, property);
      },
      
      // Property definition
      defineProperty(target, property, descriptor) {
        console.log(`[DEFINE] ${String(property)}`);
        return Reflect.defineProperty(target, property, descriptor);
      },
      
      // Prototype access
      getPrototypeOf(target) {
        console.log('[GETPROTOTYPE]');
        return Reflect.getPrototypeOf(target);
      },
      
      // Prototype setting
      setPrototypeOf(target, prototype) {
        console.log('[SETPROTOTYPE]');
        return Reflect.setPrototypeOf(target, prototype);
      },
      
      // Extensibility check
      isExtensible(target) {
        console.log('[ISEXTENSIBLE]');
        return Reflect.isExtensible(target);
      },
      
      // Prevent extensions
      preventExtensions(target) {
        console.log('[PREVENTEXTENSIONS]');
        return Reflect.preventExtensions(target);
      },
      
      // Function calls
      apply(target, thisArg, argumentsList) {
        console.log(`[APPLY] Called with ${argumentsList.length} arguments`);
        return Reflect.apply(target, thisArg, argumentsList);
      },
      
      // Constructor calls
      construct(target, argumentsList, newTarget) {
        console.log(`[CONSTRUCT] Called with ${argumentsList.length} arguments`);
        return Reflect.construct(target, argumentsList, newTarget);
      }
    });
  }
  
  static demonstrate() {
    console.log('=== Object Proxy Demo ===');
    const obj = this.createInstrumentedObject({ x: 1, y: 2 });
    
    obj.z = 3;              // [SET]
    console.log(obj.x);     // [GET]
    console.log('y' in obj); // [HAS]
    delete obj.z;           // [DELETE]
    Object.keys(obj);       // [OWNKEYS]
    
    console.log('\n=== Function Proxy Demo ===');
    function add(a, b) { return a + b; }
    const proxiedFunction = this.createInstrumentedObject(add);
    
    proxiedFunction(5, 3);  // [APPLY]
    new proxiedFunction(1, 2); // [CONSTRUCT] (if constructor)
  }
}

ProxyHandlerDemo.demonstrate();
```

## Reflect API

### Reflect Methods and Usage

```javascript
// Reflect API provides default implementations for proxy handlers
class ReflectDemo {
  static demonstrateReflectMethods() {
    const obj = { name: 'Alice', age: 25 };
    
    console.log('=== Reflect Methods ===');
    
    // Reflect.get - Get property value
    console.log('Name:', Reflect.get(obj, 'name')); // "Alice"
    
    // Reflect.set - Set property value
    Reflect.set(obj, 'city', 'New York');
    console.log('After setting city:', obj);
    
    // Reflect.has - Check property existence
    console.log('Has age:', Reflect.has(obj, 'age')); // true
    console.log('Has salary:', Reflect.has(obj, 'salary')); // false
    
    // Reflect.deleteProperty - Delete property
    console.log('Delete age:', Reflect.deleteProperty(obj, 'age')); // true
    console.log('After deletion:', obj);
    
    // Reflect.ownKeys - Get own property keys
    console.log('Own keys:', Reflect.ownKeys(obj));
    
    // Reflect.defineProperty - Define property with descriptor
    Reflect.defineProperty(obj, 'id', {
      value: 123,
      writable: false,
      enumerable: true,
      configurable: false
    });
    console.log('After defining id:', obj);
    
    // Reflect.getOwnPropertyDescriptor - Get property descriptor
    const descriptor = Reflect.getOwnPropertyDescriptor(obj, 'id');
    console.log('ID descriptor:', descriptor);
  }
  
  static demonstrateReflectWithFunctions() {
    console.log('\n=== Reflect with Functions ===');
    
    function greet(greeting, name) {
      return `${greeting}, ${name}!`;
    }
    
    // Reflect.apply - Call function
    const result = Reflect.apply(greet, null, ['Hello', 'World']);
    console.log('Applied function:', result);
    
    // Reflect.construct - Call constructor
    class Person {
      constructor(name, age) {
        this.name = name;
        this.age = age;
      }
    }
    
    const person = Reflect.construct(Person, ['Bob', 30]);
    console.log('Constructed person:', person);
  }
  
  static demonstrateReflectWithPrototypes() {
    console.log('\n=== Reflect with Prototypes ===');
    
    const obj = {};
    const proto = { inherited: 'value' };
    
    // Reflect.setPrototypeOf - Set prototype
    Reflect.setPrototypeOf(obj, proto);
    
    // Reflect.getPrototypeOf - Get prototype
    const objProto = Reflect.getPrototypeOf(obj);
    console.log('Prototype set correctly:', objProto === proto);
    
    // Reflect.isExtensible - Check extensibility
    console.log('Is extensible:', Reflect.isExtensible(obj));
    
    // Reflect.preventExtensions - Prevent extensions
    Reflect.preventExtensions(obj);
    console.log('After preventing extensions:', Reflect.isExtensible(obj));
  }
}

ReflectDemo.demonstrateReflectMethods();
ReflectDemo.demonstrateReflectWithFunctions();
ReflectDemo.demonstrateReflectWithPrototypes();
```

## Advanced Proxy Patterns

### Virtual Objects and Property Generation

```javascript
// Creating virtual objects with dynamic properties
class VirtualObject {
  static createMathObject() {
    return new Proxy({}, {
      get(target, property) {
        if (typeof property === 'string') {
          // Generate mathematical constants
          if (property.startsWith('PI_')) {
            const multiplier = parseInt(property.split('_')[1]) || 1;
            return Math.PI * multiplier;
          }
          
          // Generate mathematical functions
          if (property.startsWith('pow')) {
            const exponent = parseInt(property.replace('pow', '')) || 2;
            return (base) => Math.pow(base, exponent);
          }
          
          // Generate sequences
          if (property.startsWith('seq')) {
            const length = parseInt(property.replace('seq', '')) || 10;
            return Array.from({ length }, (_, i) => i + 1);
          }
        }
        
        return Reflect.get(target, property);
      },
      
      has(target, property) {
        if (typeof property === 'string') {
          return property.startsWith('PI_') || 
                 property.startsWith('pow') || 
                 property.startsWith('seq') ||
                 Reflect.has(target, property);
        }
        return Reflect.has(target, property);
      },
      
      ownKeys(target) {
        // Return some example virtual properties
        return [
          ...Reflect.ownKeys(target),
          'PI_2', 'PI_3', 'pow2', 'pow3', 'seq5', 'seq10'
        ];
      }
    });
  }
  
  static demonstrate() {
    console.log('=== Virtual Math Object ===');
    const math = this.createMathObject();
    
    console.log('PI_2:', math.PI_2);           // π * 2
    console.log('PI_3:', math.PI_3);           // π * 3
    console.log('pow2(5):', math.pow2(5));     // 5²
    console.log('pow3(2):', math.pow3(2));     // 2³
    console.log('seq5:', math.seq5);           // [1,2,3,4,5]
    
    console.log('Has PI_4:', 'PI_4' in math); // true (virtual)
    console.log('Keys:', Object.keys(math));
  }
}

VirtualObject.demonstrate();
```

### Validation and Type Checking

```javascript
// Using Proxy for automatic validation
class ValidationProxy {
  static createValidatedObject(schema) {
    return new Proxy({}, {
      set(target, property, value) {
        const rule = schema[property];
        
        if (rule) {
          // Type validation
          if (rule.type && typeof value !== rule.type) {
            throw new TypeError(
              `Property ${property} must be of type ${rule.type}, got ${typeof value}`
            );
          }
          
          // Range validation for numbers
          if (rule.type === 'number') {
            if (rule.min !== undefined && value < rule.min) {
              throw new RangeError(
                `Property ${property} must be >= ${rule.min}, got ${value}`
              );
            }
            if (rule.max !== undefined && value > rule.max) {
              throw new RangeError(
                `Property ${property} must be <= ${rule.max}, got ${value}`
              );
            }
          }
          
          // String length validation
          if (rule.type === 'string') {
            if (rule.minLength && value.length < rule.minLength) {
              throw new Error(
                `Property ${property} must be at least ${rule.minLength} characters`
              );
            }
            if (rule.maxLength && value.length > rule.maxLength) {
              throw new Error(
                `Property ${property} must be at most ${rule.maxLength} characters`
              );
            }
          }
          
          // Custom validation function
          if (rule.validate && !rule.validate(value)) {
            throw new Error(`Property ${property} failed custom validation`);
          }
        }
        
        return Reflect.set(target, property, value);
      },
      
      get(target, property) {
        if (property === 'validate') {
          return () => {
            for (const [prop, rule] of Object.entries(schema)) {
              if (rule.required && !(prop in target)) {
                throw new Error(`Required property ${prop} is missing`);
              }
            }
            return true;
          };
        }
        
        return Reflect.get(target, property);
      }
    });
  }
  
  static demonstrate() {
    console.log('=== Validation Proxy Demo ===');
    
    const userSchema = {
      name: {
        type: 'string',
        required: true,
        minLength: 2,
        maxLength: 50
      },
      age: {
        type: 'number',
        required: true,
        min: 0,
        max: 150
      },
      email: {
        type: 'string',
        required: true,
        validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      }
    };
    
    const user = ValidationProxy.createValidatedObject(userSchema);
    
    try {
      user.name = 'John Doe';
      user.age = 30;
      user.email = 'john@example.com';
      
      console.log('Valid user created:', user);
      user.validate(); // Check all required fields
      
      // This will throw an error
      user.age = 200; // Age too high
    } catch (error) {
      console.error('Validation error:', error.message);
    }
  }
}

ValidationProxy.demonstrate();
```

### Observable Objects

```javascript
// Creating observable objects with Proxy
class ObservableProxy {
  static createObservable(target, onChange) {
    const observers = new Set();
    
    if (onChange) {
      observers.add(onChange);
    }
    
    const proxy = new Proxy(target, {
      set(target, property, value, receiver) {
        const oldValue = target[property];
        const result = Reflect.set(target, property, value, receiver);
        
        if (result && oldValue !== value) {
          // Notify all observers
          observers.forEach(observer => {
            try {
              observer({
                type: 'set',
                property,
                oldValue,
                newValue: value,
                target: proxy
              });
            } catch (error) {
              console.error('Observer error:', error);
            }
          });
        }
        
        return result;
      },
      
      deleteProperty(target, property) {
        const oldValue = target[property];
        const result = Reflect.deleteProperty(target, property);
        
        if (result && property in target) {
          observers.forEach(observer => {
            try {
              observer({
                type: 'delete',
                property,
                oldValue,
                target: proxy
              });
            } catch (error) {
              console.error('Observer error:', error);
            }
          });
        }
        
        return result;
      }
    });
    
    // Add methods to manage observers
    Object.defineProperty(proxy, 'observe', {
      value: (callback) => {
        observers.add(callback);
        return () => observers.delete(callback); // Return unsubscribe function
      },
      writable: false,
      enumerable: false,
      configurable: false
    });
    
    Object.defineProperty(proxy, 'unobserve', {
      value: (callback) => observers.delete(callback),
      writable: false,
      enumerable: false,
      configurable: false
    });
    
    return proxy;
  }
  
  static demonstrate() {
    console.log('=== Observable Object Demo ===');
    
    const data = ObservableProxy.createObservable(
      { count: 0, name: 'Counter' },
      (change) => {
        console.log('Change detected:', change);
      }
    );
    
    // Add another observer
    const unsubscribe = data.observe((change) => {
      console.log('Second observer:', change.type, change.property);
    });
    
    // Trigger changes
    data.count = 1;           // Both observers notified
    data.name = 'Updated';    // Both observers notified
    data.newProp = 'value';   // Both observers notified
    
    // Unsubscribe second observer
    unsubscribe();
    
    data.count = 2;           // Only first observer notified
    delete data.newProp;      // Only first observer notified
  }
}

ObservableProxy.demonstrate();
```

## Proxy Performance and Limitations

### Performance Considerations

```javascript
// Performance comparison: Proxy vs Direct Access
class ProxyPerformance {
  static benchmarkPropertyAccess() {
    const target = { value: 42 };
    const proxy = new Proxy(target, {
      get(target, property) {
        return Reflect.get(target, property);
      },
      set(target, property, value) {
        return Reflect.set(target, property, value);
      }
    });
    
    const iterations = 1000000;
    
    // Direct access benchmark
    console.time('Direct access');
    for (let i = 0; i < iterations; i++) {
      target.value = i;
      const val = target.value;
    }
    console.timeEnd('Direct access');
    
    // Proxy access benchmark
    console.time('Proxy access');
    for (let i = 0; i < iterations; i++) {
      proxy.value = i;
      const val = proxy.value;
    }
    console.timeEnd('Proxy access');
    
    console.log('Proxy adds overhead but provides powerful capabilities');
  }
  
  static demonstrateLimitations() {
    console.log('\n=== Proxy Limitations ===');
    
    // 1. Cannot proxy primitive values
    try {
      const stringProxy = new Proxy('hello', {});
    } catch (error) {
      console.log('Cannot proxy primitives:', error.message);
    }
    
    // 2. Some built-in objects have internal slots
    const date = new Date();
    const dateProxy = new Proxy(date, {
      get(target, property) {
        console.log(`Accessing ${property} on Date`);
        return Reflect.get(target, property);
      }
    });
    
    try {
      console.log('Direct date:', date.getTime());
      console.log('Proxied date:', dateProxy.getTime()); // May throw
    } catch (error) {
      console.log('Date proxy limitation:', error.message);
    }
    
    // 3. Proxy identity
    const obj = {};
    const objProxy = new Proxy(obj, {});
    console.log('Proxy identity different:', obj !== objProxy);
    
    // 4. Performance overhead
    console.log('Proxies have performance overhead for all operations');
  }
}

ProxyPerformance.benchmarkPropertyAccess();
ProxyPerformance.demonstrateLimitations();
```

## Real-World Applications

### API Client with Automatic Methods

```javascript
// Dynamic API client using Proxy
class APIClient {
  constructor(baseURL, options = {}) {
    this.baseURL = baseURL;
    this.options = options;
    
    return new Proxy(this, {
      get(target, property) {
        // Return existing methods/properties
        if (property in target) {
          return Reflect.get(target, property);
        }
        
        // Generate API methods dynamically
        if (typeof property === 'string') {
          return target.createAPIMethod(property);
        }
        
        return undefined;
      }
    });
  }
  
  createAPIMethod(endpoint) {
    return {
      get: (id = '') => this.request('GET', `${endpoint}/${id}`),
      post: (data) => this.request('POST', endpoint, data),
      put: (id, data) => this.request('PUT', `${endpoint}/${id}`, data),
      delete: (id) => this.request('DELETE', `${endpoint}/${id}`),
      patch: (id, data) => this.request('PATCH', `${endpoint}/${id}`, data)
    };
  }
  
  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}/${endpoint}`;
    const config = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...this.options.headers
      }
    };
    
    if (data) {
      config.body = JSON.stringify(data);
    }
    
    console.log(`${method} ${url}`, data ? data : '');
    
    // Simulate API response
    return {
      status: 200,
      data: { message: `${method} ${endpoint} successful`, data }
    };
  }
}

// Usage demonstration
async function demonstrateAPIClient() {
  console.log('=== Dynamic API Client ===');
  
  const api = new APIClient('https://api.example.com');
  
  // These methods are generated dynamically
  await api.users.get();                    // GET /users/
  await api.users.get('123');               // GET /users/123
  await api.users.post({ name: 'John' });   // POST /users
  await api.posts.put('456', { title: 'Updated' }); // PUT /posts/456
  await api.comments.delete('789');         // DELETE /comments/789
}

demonstrateAPIClient();
```

## Best Practices

### Do's and Don'ts

```javascript
// Best practices for Proxy usage
class ProxyBestPractices {
  static goodPractices() {
    console.log('=== Proxy Best Practices ===');
    
    // ✅ Always use Reflect for default behavior
    const goodProxy = new Proxy({}, {
      get(target, property, receiver) {
        console.log(`Accessing: ${property}`);
        return Reflect.get(target, property, receiver);
      },
      
      set(target, property, value, receiver) {
        console.log(`Setting: ${property} = ${value}`);
        return Reflect.set(target, property, value, receiver);
      }
    });
    
    // ✅ Handle errors gracefully
    const safeProxy = new Proxy({}, {
      get(target, property, receiver) {
        try {
          return Reflect.get(target, property, receiver);
        } catch (error) {
          console.error('Proxy get error:', error);
          return undefined;
        }
      }
    });
    
    // ✅ Use appropriate return values
    const correctProxy = new Proxy({}, {
      set(target, property, value, receiver) {
        // Always return boolean indicating success/failure
        return Reflect.set(target, property, value, receiver);
      },
      
      has(target, property) {
        // Always return boolean
        return Reflect.has(target, property);
      }
    });
    
    console.log('Good practices demonstrated');
  }
  
  static avoidCommonMistakes() {
    console.log('\n=== Common Mistakes to Avoid ===');
    
    // ❌ Don't forget to use Reflect
    const badProxy1 = new Proxy({}, {
      get(target, property) {
        console.log(`Getting ${property}`);
        return target[property]; // Should use Reflect.get
      }
    });
    
    // ❌ Don't ignore the receiver parameter
    const badProxy2 = new Proxy({}, {
      get(target, property, receiver) {
        // Ignoring receiver can break inheritance
        return Reflect.get(target, property); // Missing receiver
      }
    });
    
    // ❌ Don't return wrong types from handlers
    const badProxy3 = new Proxy({}, {
      set(target, property, value) {
        target[property] = value;
        // Should return boolean, not undefined
      }
    });
    
    console.log('Common mistakes illustrated (don\'t use these patterns)');
  }
}

ProxyBestPractices.goodPractices();
ProxyBestPractices.avoidCommonMistakes();
```

## Key Takeaways

* **Proxy** intercepts and customizes object operations
* **Reflect** provides default implementations for proxy handlers
* **Handler methods** correspond to internal object operations
* **Virtual objects** can generate properties dynamically
* **Validation proxies** enforce data integrity automatically
* **Observable objects** enable reactive programming patterns
* **Performance overhead** exists but enables powerful abstractions
* **Use Reflect** for default behavior in proxy handlers
* **Handle errors gracefully** in proxy operations
* **Consider alternatives** for performance-critical code
