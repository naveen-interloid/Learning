# **11.2 Internal Slots & Methods**

Internal slots and methods are specification-level concepts that define the internal structure and behavior of JavaScript objects. They're not directly accessible from JavaScript code but govern how objects work internally.

## Understanding Internal Slots

### What are Internal Slots?

Internal slots are like "private properties" that exist only in the specification. They store internal state and are denoted with double square brackets `[[SlotName]]`.

```javascript
// Every object has internal slots like:
// [[Prototype]] - the object's prototype
// [[Extensible]] - whether new properties can be added
// [[PrivateElements]] - private class fields (ES2022)

const obj = {};
// Internally, obj has:
// [[Prototype]]: Object.prototype
// [[Extensible]]: true

// You can't access internal slots directly:
// console.log(obj.[[Prototype]]); // SyntaxError

// But you can access them through methods:
console.log(Object.getPrototypeOf(obj)); // Object.prototype
console.log(Object.isExtensible(obj));   // true
```

### Common Internal Slots

```javascript
// Demonstrating various internal slots through their accessible interfaces

// [[Prototype]] - object's prototype chain
const parent = { parentProp: 'parent' };
const child = Object.create(parent);
console.log(Object.getPrototypeOf(child) === parent); // true

// [[Extensible]] - whether object can have new properties added
const obj = { existing: 'prop' };
console.log(Object.isExtensible(obj)); // true

Object.preventExtensions(obj);
console.log(Object.isExtensible(obj)); // false

try {
  obj.newProp = 'value';
  console.log(obj.newProp); // undefined (in strict mode, would throw)
} catch (e) {
  console.log('Cannot add property to non-extensible object');
}

// [[Get]] and [[Set]] - property access behavior
const proxyObj = new Proxy({}, {
  get(target, prop) {
    console.log(`Getting property: ${prop}`);
    return target[prop];
  },
  set(target, prop, value) {
    console.log(`Setting property: ${prop} = ${value}`);
    target[prop] = value;
    return true;
  }
});

proxyObj.test = 'value'; // "Setting property: test = value"
console.log(proxyObj.test); // "Getting property: test", then "value"
```

## Internal Methods

### Essential Internal Methods

```javascript
// Internal methods define object behavior
// They're called by the engine during operations

class InternalMethodDemo {
  static demonstrateInternalMethods() {
    const obj = {
      name: 'test',
      get computed() {
        console.log('Getter called via [[Get]]');
        return this._computed || 'default';
      },
      set computed(value) {
        console.log('Setter called via [[Set]]');
        this._computed = value;
      }
    };
    
    // [[Get]] internal method
    console.log('=== [[Get]] Internal Method ===');
    console.log(obj.name);     // Calls [[Get]]
    console.log(obj.computed); // Calls [[Get]], which invokes getter
    
    // [[Set]] internal method
    console.log('=== [[Set]] Internal Method ===');
    obj.name = 'updated';      // Calls [[Set]]
    obj.computed = 'new value'; // Calls [[Set]], which invokes setter
    
    // [[Has]] internal method
    console.log('=== [[Has]] Internal Method ===');
    console.log('name' in obj);      // Calls [[Has]]
    console.log('toString' in obj);  // Calls [[Has]], checks prototype chain
    
    // [[Delete]] internal method
    console.log('=== [[Delete]] Internal Method ===');
    console.log(delete obj.name);    // Calls [[Delete]], returns true
    console.log('name' in obj);      // false
    
    // [[Enumerate]] internal method (deprecated, but conceptually important)
    console.log('=== Property Enumeration ===');
    for (const key in obj) {         // Uses property enumeration
      console.log(`Enumerable property: ${key}`);
    }
  }
}

InternalMethodDemo.demonstrateInternalMethods();
```

### Proxy and Internal Methods

```javascript
// Proxies allow you to intercept internal method calls
class ProxyInternalMethods {
  static createInstrumentedObject() {
    const target = { a: 1, b: 2 };
    
    return new Proxy(target, {
      // Intercept [[Get]]
      get(target, prop, receiver) {
        console.log(`[[Get]] called for property: ${prop}`);
        return Reflect.get(target, prop, receiver);
      },
      
      // Intercept [[Set]]
      set(target, prop, value, receiver) {
        console.log(`[[Set]] called for property: ${prop} = ${value}`);
        return Reflect.set(target, prop, value, receiver);
      },
      
      // Intercept [[Has]]
      has(target, prop) {
        console.log(`[[Has]] called for property: ${prop}`);
        return Reflect.has(target, prop);
      },
      
      // Intercept [[Delete]]
      deleteProperty(target, prop) {
        console.log(`[[Delete]] called for property: ${prop}`);
        return Reflect.deleteProperty(target, prop);
      },
      
      // Intercept [[OwnPropertyKeys]]
      ownKeys(target) {
        console.log('[[OwnPropertyKeys]] called');
        return Reflect.ownKeys(target);
      },
      
      // Intercept [[GetOwnPropertyDescriptor]]
      getOwnPropertyDescriptor(target, prop) {
        console.log(`[[GetOwnPropertyDescriptor]] called for: ${prop}`);
        return Reflect.getOwnPropertyDescriptor(target, prop);
      },
      
      // Intercept [[DefineOwnProperty]]
      defineProperty(target, prop, descriptor) {
        console.log(`[[DefineOwnProperty]] called for: ${prop}`);
        return Reflect.defineProperty(target, prop, descriptor);
      }
    });
  }
  
  static demonstrate() {
    console.log('=== Proxy Internal Method Interception ===');
    const obj = this.createInstrumentedObject();
    
    obj.c = 3;              // [[Set]]
    console.log(obj.a);     // [[Get]]
    console.log('b' in obj); // [[Has]]
    delete obj.b;           // [[Delete]]
    Object.keys(obj);       // [[OwnPropertyKeys]]
    
    Object.defineProperty(obj, 'd', {
      value: 4,
      writable: true,
      enumerable: true,
      configurable: true
    }); // [[DefineOwnProperty]]
    
    Object.getOwnPropertyDescriptor(obj, 'd'); // [[GetOwnPropertyDescriptor]]
  }
}

ProxyInternalMethods.demonstrate();
```

## Property Descriptors and Internal Structure

### Understanding Property Descriptors

```javascript
// Property descriptors define how properties behave internally
class PropertyDescriptorDemo {
  static demonstrateDescriptors() {
    const obj = {};
    
    // Data property descriptor
    Object.defineProperty(obj, 'dataProperty', {
      value: 'initial value',
      writable: true,
      enumerable: true,
      configurable: true
    });
    
    // Accessor property descriptor
    let _accessorValue = 'initial';
    Object.defineProperty(obj, 'accessorProperty', {
      get() {
        console.log('Getter accessed');
        return _accessorValue;
      },
      set(value) {
        console.log(`Setter called with: ${value}`);
        _accessorValue = value;
      },
      enumerable: true,
      configurable: true
    });
    
    // Examine descriptors
    console.log('Data property descriptor:');
    console.log(Object.getOwnPropertyDescriptor(obj, 'dataProperty'));
    
    console.log('Accessor property descriptor:');
    console.log(Object.getOwnPropertyDescriptor(obj, 'accessorProperty'));
    
    // Property attributes affect behavior
    console.log('=== Property Behavior ===');
    
    // Writable: false
    Object.defineProperty(obj, 'readOnly', {
      value: 'cannot change',
      writable: false,
      enumerable: true,
      configurable: true
    });
    
    obj.readOnly = 'new value'; // Silently fails in non-strict mode
    console.log(obj.readOnly);  // "cannot change"
    
    // Enumerable: false
    Object.defineProperty(obj, 'hidden', {
      value: 'not enumerable',
      writable: true,
      enumerable: false,
      configurable: true
    });
    
    console.log('Enumerable properties:', Object.keys(obj));
    console.log('All own properties:', Object.getOwnPropertyNames(obj));
    
    // Configurable: false
    Object.defineProperty(obj, 'permanent', {
      value: 'cannot reconfigure',
      writable: true,
      enumerable: true,
      configurable: false
    });
    
    try {
      Object.defineProperty(obj, 'permanent', {
        enumerable: false // Try to change enumerable
      });
    } catch (e) {
      console.log('Cannot reconfigure non-configurable property');
    }
  }
}

PropertyDescriptorDemo.demonstrateDescriptors();
```

### Internal Slots for Different Object Types

```javascript
// Different object types have different internal slots
class ObjectTypeInternals {
  static demonstrateArrayInternals() {
    console.log('=== Array Internal Slots ===');
    
    const arr = [1, 2, 3];
    // Arrays have [[ArrayLength]] internal slot
    
    console.log('Array length:', arr.length); // Accesses [[ArrayLength]]
    
    // Setting length affects [[ArrayLength]]
    arr.length = 2;
    console.log('After setting length to 2:', arr); // [1, 2]
    
    // Adding elements updates [[ArrayLength]]
    arr[5] = 6;
    console.log('After setting index 5:', arr.length); // 6
    console.log('Array:', arr); // [1, 2, empty × 3, 6]
  }
  
  static demonstrateFunctionInternals() {
    console.log('=== Function Internal Slots ===');
    
    function namedFunction(a, b) {
      return a + b;
    }
    
    // Functions have internal slots like:
    // [[FunctionKind]], [[ECMAScriptCode]], [[Environment]], etc.
    
    console.log('Function name:', namedFunction.name);     // [[FunctionKind]]
    console.log('Function length:', namedFunction.length); // Parameter count
    
    // Arrow functions have different internal structure
    const arrowFunction = (a, b) => a + b;
    console.log('Arrow function name:', arrowFunction.name); // ""
    console.log('Arrow function length:', arrowFunction.length); // 2
    
    // Bound functions
    const boundFunction = namedFunction.bind(null, 10);
    console.log('Bound function name:', boundFunction.name); // "bound namedFunction"
    console.log('Bound function length:', boundFunction.length); // 1 (remaining params)
  }
  
  static demonstrateRegExpInternals() {
    console.log('=== RegExp Internal Slots ===');
    
    const regex = /test/gi;
    // RegExp objects have internal slots like:
    // [[RegExpMatcher]], [[OriginalSource]], [[OriginalFlags]]
    
    console.log('RegExp source:', regex.source);   // "test"
    console.log('RegExp flags:', regex.flags);     // "gi"
    console.log('RegExp global:', regex.global);   // true
    console.log('RegExp ignoreCase:', regex.ignoreCase); // true
    
    // lastIndex is a regular property, not an internal slot
    console.log('RegExp lastIndex:', regex.lastIndex); // 0
    
    // Test method updates lastIndex for global regexes
    const testString = 'test TEST test';
    console.log(regex.test(testString)); // true
    console.log('After first test, lastIndex:', regex.lastIndex); // 4
    console.log(regex.test(testString)); // true
    console.log('After second test, lastIndex:', regex.lastIndex); // 9
  }
  
  static demonstratePromiseInternals() {
    console.log('=== Promise Internal Slots ===');
    
    // Promises have internal slots like:
    // [[PromiseState]], [[PromiseResult]], [[PromiseFulfillReactions]]
    
    const pendingPromise = new Promise((resolve, reject) => {
      // Promise is initially in "pending" state
      setTimeout(() => resolve('resolved value'), 100);
    });
    
    const resolvedPromise = Promise.resolve('immediate value');
    const rejectedPromise = Promise.reject(new Error('rejection reason'));
    
    // You can't directly access [[PromiseState]], but you can observe it
    console.log('Pending promise:', pendingPromise);
    console.log('Resolved promise:', resolvedPromise);
    console.log('Rejected promise:', rejectedPromise);
    
    // Promise state transitions are observable through then/catch
    pendingPromise.then(value => {
      console.log('Promise resolved with:', value);
    });
    
    rejectedPromise.catch(reason => {
      console.log('Promise rejected with:', reason.message);
    });
  }
}

ObjectTypeInternals.demonstrateArrayInternals();
ObjectTypeInternals.demonstrateFunctionInternals();
ObjectTypeInternals.demonstrateRegExpInternals();
ObjectTypeInternals.demonstratePromiseInternals();
```

## Advanced Internal Slot Concepts

### Exotic Objects

```javascript
// Exotic objects have non-standard internal method behavior
class ExoticObjectDemo {
  static demonstrateArrayExoticBehavior() {
    console.log('=== Array Exotic Behavior ===');
    
    const arr = [];
    
    // Arrays have exotic [[DefineOwnProperty]] behavior
    // Setting numeric indices affects length
    Object.defineProperty(arr, '5', {
      value: 'five',
      writable: true,
      enumerable: true,
      configurable: true
    });
    
    console.log('Array length after setting index 5:', arr.length); // 6
    console.log('Array contents:', arr); // [empty × 5, 'five']
    
    // Setting length affects numeric properties
    arr.length = 3;
    console.log('Array after setting length to 3:', arr); // [empty × 3]
    console.log('Index 5 exists:', '5' in arr); // false
  }
  
  static demonstrateStringExoticBehavior() {
    console.log('=== String Exotic Behavior ===');
    
    const str = new String('hello');
    
    // String objects have exotic [[GetOwnPropertyDescriptor]]
    // Numeric indices return character descriptors
    console.log('String object:', str);
    console.log('Character at index 1:', str[1]); // 'e'
    
    const descriptor = Object.getOwnPropertyDescriptor(str, '1');
    console.log('Descriptor for index 1:', descriptor);
    // { value: 'e', writable: false, enumerable: true, configurable: false }
    
    // String indices are non-writable and non-configurable
    try {
      str[1] = 'x'; // Silently fails
      console.log('After trying to modify:', str[1]); // Still 'e'
    } catch (e) {
      console.log('Cannot modify string character');
    }
  }
  
  static demonstrateArgumentsExoticBehavior() {
    console.log('=== Arguments Exotic Behavior ===');
    
    function testArguments(a, b, c) {
      // Arguments object has exotic behavior in non-strict mode
      console.log('Initial arguments:', arguments[0], arguments[1], arguments[2]);
      
      // In non-strict mode, arguments and parameters are linked
      arguments[0] = 'modified';
      console.log('After modifying arguments[0]:', a); // 'modified'
      
      a = 'changed again';
      console.log('After modifying parameter a:', arguments[0]); // 'changed again'
      
      // This linking only works for parameters that were provided
      arguments[2] = 'set c';
      console.log('Parameter c after setting arguments[2]:', c); // undefined
      
      return arguments;
    }
    
    const args = testArguments('first', 'second');
    console.log('Arguments object properties:', Object.getOwnPropertyNames(args));
  }
}

ExoticObjectDemo.demonstrateArrayExoticBehavior();
ExoticObjectDemo.demonstrateStringExoticBehavior();
ExoticObjectDemo.demonstrateArgumentsExoticBehavior();
```

### Internal Slot Inheritance

```javascript
// Understanding how internal slots work with inheritance
class InternalSlotInheritance {
  static demonstratePrototypeSlots() {
    console.log('=== Prototype Internal Slots ===');
    
    const parent = { parentProp: 'parent value' };
    const child = Object.create(parent);
    child.childProp = 'child value';
    
    // [[Prototype]] internal slot creates the prototype chain
    console.log('Child prototype:', Object.getPrototypeOf(child) === parent); // true
    console.log('Parent prototype:', Object.getPrototypeOf(parent)); // Object.prototype
    
    // Property lookup follows the prototype chain
    console.log('Child accessing parent property:', child.parentProp); // 'parent value'
    
    // [[Get]] internal method walks the prototype chain
    console.log('Property lookup chain:');
    let current = child;
    while (current) {
      console.log('Checking object:', current);
      if (current.hasOwnProperty('parentProp')) {
        console.log('Found parentProp in:', current);
        break;
      }
      current = Object.getPrototypeOf(current);
    }
  }
  
  static demonstrateClassInternalSlots() {
    console.log('=== Class Internal Slots ===');
    
    class Parent {
      constructor(value) {
        this.value = value;
      }
      
      parentMethod() {
        return `Parent: ${this.value}`;
      }
    }
    
    class Child extends Parent {
      constructor(value, childValue) {
        super(value);
        this.childValue = childValue;
      }
      
      childMethod() {
        return `Child: ${this.childValue}`;
      }
    }
    
    const instance = new Child('parent value', 'child value');
    
    // Class instances have [[Prototype]] pointing to class prototype
    console.log('Instance prototype:', Object.getPrototypeOf(instance) === Child.prototype); // true
    console.log('Child prototype:', Object.getPrototypeOf(Child.prototype) === Parent.prototype); // true
    
    // Method calls use [[Get]] to find methods in prototype chain
    console.log('Parent method call:', instance.parentMethod());
    console.log('Child method call:', instance.childMethod());
    
    // Constructor function has [[Prototype]] too
    console.log('Child constructor prototype:', Object.getPrototypeOf(Child) === Parent); // true
  }
}

InternalSlotInheritance.demonstratePrototypeSlots();
InternalSlotInheritance.demonstrateClassInternalSlots();
```

## Practical Applications

### Understanding Object Behavior

```javascript
// Using knowledge of internal slots for better code
class PracticalInternalSlots {
  static createOptimizedObject() {
    // Understanding internal slots helps create better objects
    
    // Method 1: Object literal (fast)
    const obj1 = {
      prop1: 'value1',
      prop2: 'value2',
      method() {
        return this.prop1 + this.prop2;
      }
    };
    
    // Method 2: Using Object.create with descriptors (more control)
    const obj2 = Object.create(Object.prototype, {
      prop1: {
        value: 'value1',
        writable: true,
        enumerable: true,
        configurable: true
      },
      prop2: {
        value: 'value2',
        writable: true,
        enumerable: true,
        configurable: true
      },
      method: {
        value: function() {
          return this.prop1 + this.prop2;
        },
        writable: true,
        enumerable: false, // Methods often shouldn't be enumerable
        configurable: true
      }
    });
    
    return { obj1, obj2 };
  }
  
  static createImmutableObject() {
    // Using internal slot knowledge for immutability
    const data = { value: 42, nested: { prop: 'test' } };
    
    // Level 1: Prevent extensions
    Object.preventExtensions(data);
    console.log('Can add properties:', Object.isExtensible(data)); // false
    
    // Level 2: Seal (prevent extensions + make properties non-configurable)
    const sealedData = { value: 42 };
    Object.seal(sealedData);
    console.log('Is sealed:', Object.isSealed(sealedData)); // true
    
    // Level 3: Freeze (seal + make properties non-writable)
    const frozenData = { value: 42 };
    Object.freeze(frozenData);
    console.log('Is frozen:', Object.isFrozen(frozenData)); // true
    
    // Deep freeze requires recursive freezing
    function deepFreeze(obj) {
      Object.getOwnPropertyNames(obj).forEach(prop => {
        const value = obj[prop];
        if (value && typeof value === 'object') {
          deepFreeze(value);
        }
      });
      return Object.freeze(obj);
    }
    
    const deepFrozenData = deepFreeze({ 
      value: 42, 
      nested: { prop: 'test' } 
    });
    
    return { data, sealedData, frozenData, deepFrozenData };
  }
  
  static demonstratePropertyEnumeration() {
    // Understanding enumeration and internal slots
    const obj = {};
    
    // Enumerable property
    Object.defineProperty(obj, 'enumerable', {
      value: 'visible',
      enumerable: true,
      writable: true,
      configurable: true
    });
    
    // Non-enumerable property
    Object.defineProperty(obj, 'hidden', {
      value: 'invisible',
      enumerable: false,
      writable: true,
      configurable: true
    });
    
    // Symbol property (non-enumerable by default in for...in)
    const sym = Symbol('symbol');
    obj[sym] = 'symbol value';
    
    console.log('for...in loop:');
    for (const key in obj) {
      console.log(`  ${key}: ${obj[key]}`);
    }
    
    console.log('Object.keys():', Object.keys(obj));
    console.log('Object.getOwnPropertyNames():', Object.getOwnPropertyNames(obj));
    console.log('Object.getOwnPropertySymbols():', Object.getOwnPropertySymbols(obj));
    console.log('Reflect.ownKeys():', Reflect.ownKeys(obj));
  }
}

const { obj1, obj2 } = PracticalInternalSlots.createOptimizedObject();
console.log('Optimized objects created');

const immutableObjects = PracticalInternalSlots.createImmutableObject();
console.log('Immutable objects created');

PracticalInternalSlots.demonstratePropertyEnumeration();
```

## Best Practices

### Do's

```javascript
// ✅ Use Object.getOwnPropertyDescriptor to understand property behavior
const descriptor = Object.getOwnPropertyDescriptor(obj, 'prop');
console.log('Property descriptor:', descriptor);

// ✅ Use Reflect methods for consistent internal method access
const hasProperty = Reflect.has(obj, 'prop');
const propertyValue = Reflect.get(obj, 'prop');

// ✅ Understand prototype chain for inheritance
const prototype = Object.getPrototypeOf(obj);

// ✅ Use appropriate object creation methods
const obj = Object.create(prototype, descriptors);

// ✅ Consider property enumerability when designing APIs
Object.defineProperty(obj, 'method', {
  value: function() {},
  enumerable: false // Methods usually shouldn't be enumerable
});
```

### Don'ts

```javascript
// ❌ Don't assume all properties are enumerable
for (const key in obj) {
  // This misses non-enumerable properties
}

// ❌ Don't ignore property descriptors
obj.prop = value; // Might fail if property is non-writable

// ❌ Don't modify built-in prototypes carelessly
Array.prototype.myMethod = function() {}; // Affects all arrays

// ❌ Don't rely on property order in objects (except for specific cases)
const keys = Object.keys(obj); // Order is not guaranteed for all property types
```

## Key Takeaways

* **Internal slots** store object state that's not directly accessible
* **Internal methods** define how objects respond to operations
* **Property descriptors** control property behavior through internal slots
* **Exotic objects** have non-standard internal method behavior
* **Proxies** allow interception of internal method calls
* **Understanding internals** helps write more predictable code
* **Different object types** have different internal slot structures
* **Prototype chain** is implemented through [[Prototype]] internal slots
