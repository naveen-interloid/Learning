# **10.2 Object.defineProperty() & Property Descriptors**

Property descriptors provide fine-grained control over object properties, allowing you to define how properties behave regarding access, modification, enumeration, and configuration.

## Understanding Property Descriptors

### Basic Property Descriptor Structure

```javascript
// Property descriptors define property behavior
class PropertyDescriptorBasics {
  static demonstrateDescriptorTypes() {
    console.log('=== Property Descriptor Types ===');
    
    const obj = {};
    
    // Data descriptor
    Object.defineProperty(obj, 'dataProperty', {
      value: 'Hello World',
      writable: true,      // Can be changed
      enumerable: true,    // Shows in for...in and Object.keys()
      configurable: true   // Can be deleted or reconfigured
    });
    
    // Accessor descriptor
    let _hiddenValue = 'secret';
    Object.defineProperty(obj, 'accessorProperty', {
      get() {
        console.log('Getter called');
        return _hiddenValue;
      },
      set(value) {
        console.log('Setter called with:', value);
        _hiddenValue = value;
      },
      enumerable: true,
      configurable: true
    });
    
    // Examine descriptors
    console.log('Data descriptor:', 
      Object.getOwnPropertyDescriptor(obj, 'dataProperty'));
    console.log('Accessor descriptor:', 
      Object.getOwnPropertyDescriptor(obj, 'accessorProperty'));
    
    // Test behavior
    console.log('Data property:', obj.dataProperty);
    console.log('Accessor property:', obj.accessorProperty);
    obj.accessorProperty = 'new secret';
    console.log('Updated accessor:', obj.accessorProperty);
  }
  
  static demonstrateDefaultBehavior() {
    console.log('\n=== Default vs Defined Properties ===');
    
    const obj = {};
    
    // Regular assignment (default descriptor)
    obj.regular = 'regular value';
    
    // Defined property with explicit descriptor
    Object.defineProperty(obj, 'defined', {
      value: 'defined value',
      writable: false,     // Different from default (true)
      enumerable: false,   // Different from default (true)
      configurable: false  // Different from default (true)
    });
    
    console.log('Regular property descriptor:',
      Object.getOwnPropertyDescriptor(obj, 'regular'));
    console.log('Defined property descriptor:',
      Object.getOwnPropertyDescriptor(obj, 'defined'));
    
    // Test differences
    console.log('Keys (enumerable only):', Object.keys(obj)); // Only 'regular'
    
    try {
      obj.defined = 'new value'; // Fails silently (or throws in strict mode)
      console.log('Defined property after assignment:', obj.defined);
    } catch (error) {
      console.log('Cannot modify non-writable property');
    }
  }
}

PropertyDescriptorBasics.demonstrateDescriptorTypes();
PropertyDescriptorBasics.demonstrateDefaultBehavior();
```

### Property Attributes in Detail

```javascript
// Deep dive into property attributes
class PropertyAttributes {
  static demonstrateWritable() {
    console.log('=== Writable Attribute ===');
    
    const obj = {};
    
    // Non-writable property
    Object.defineProperty(obj, 'constant', {
      value: 'unchangeable',
      writable: false,
      enumerable: true,
      configurable: true
    });
    
    console.log('Initial value:', obj.constant);
    
    // Attempt to change (fails silently in non-strict mode)
    obj.constant = 'new value';
    console.log('After assignment attempt:', obj.constant);
    
    // Can still be changed via defineProperty if configurable
    Object.defineProperty(obj, 'constant', {
      value: 'changed via defineProperty'
    });
    console.log('After defineProperty:', obj.constant);
  }
  
  static demonstrateEnumerable() {
    console.log('\n=== Enumerable Attribute ===');
    
    const obj = {};
    
    Object.defineProperty(obj, 'visible', {
      value: 'I am visible',
      enumerable: true,
      writable: true,
      configurable: true
    });
    
    Object.defineProperty(obj, 'hidden', {
      value: 'I am hidden',
      enumerable: false,
      writable: true,
      configurable: true
    });
    
    console.log('Object.keys():', Object.keys(obj));
    console.log('Object.getOwnPropertyNames():', Object.getOwnPropertyNames(obj));
    
    console.log('for...in loop:');
    for (const key in obj) {
      console.log(`  ${key}: ${obj[key]}`);
    }
    
    console.log('JSON.stringify():', JSON.stringify(obj));
  }
  
  static demonstrateConfigurable() {
    console.log('\n=== Configurable Attribute ===');
    
    const obj = {};
    
    // Configurable property
    Object.defineProperty(obj, 'flexible', {
      value: 'can be reconfigured',
      configurable: true,
      writable: true,
      enumerable: true
    });
    
    // Non-configurable property
    Object.defineProperty(obj, 'fixed', {
      value: 'cannot be reconfigured',
      configurable: false,
      writable: true,
      enumerable: true
    });
    
    // Can reconfigure flexible property
    Object.defineProperty(obj, 'flexible', {
      enumerable: false
    });
    console.log('Flexible property reconfigured');
    
    // Cannot reconfigure fixed property
    try {
      Object.defineProperty(obj, 'fixed', {
        enumerable: false
      });
    } catch (error) {
      console.log('Cannot reconfigure non-configurable property:', error.message);
    }
    
    // Cannot delete non-configurable property
    console.log('Delete flexible:', delete obj.flexible); // true
    console.log('Delete fixed:', delete obj.fixed); // false
  }
}

PropertyAttributes.demonstrateWritable();
PropertyAttributes.demonstrateEnumerable();
PropertyAttributes.demonstrateConfigurable();
```

## Advanced Getter and Setter Patterns

### Computed Properties

```javascript
// Using getters for computed properties
class ComputedProperties {
  static createPersonWithComputedProps() {
    const person = {
      firstName: 'John',
      lastName: 'Doe',
      birthYear: 1990
    };
    
    // Computed full name
    Object.defineProperty(person, 'fullName', {
      get() {
        return `${this.firstName} ${this.lastName}`;
      },
      set(value) {
        const parts = value.split(' ');
        this.firstName = parts[0] || '';
        this.lastName = parts.slice(1).join(' ') || '';
      },
      enumerable: true,
      configurable: true
    });
    
    // Computed age
    Object.defineProperty(person, 'age', {
      get() {
        return new Date().getFullYear() - this.birthYear;
      },
      enumerable: true,
      configurable: true
    });
    
    // Computed initials
    Object.defineProperty(person, 'initials', {
      get() {
        return `${this.firstName[0] || ''}${this.lastName[0] || ''}`.toUpperCase();
      },
      enumerable: true,
      configurable: true
    });
    
    return person;
  }
  
  static demonstrate() {
    console.log('=== Computed Properties ===');
    
    const person = this.createPersonWithComputedProps();
    
    console.log('Full name:', person.fullName);
    console.log('Age:', person.age);
    console.log('Initials:', person.initials);
    
    // Modify through setter
    person.fullName = 'Jane Smith';
    console.log('After name change:');
    console.log('First name:', person.firstName);
    console.log('Last name:', person.lastName);
    console.log('Full name:', person.fullName);
    console.log('Initials:', person.initials);
  }
}

ComputedProperties.demonstrate();
```

### Property Validation

```javascript
// Using setters for property validation
class PropertyValidation {
  static createValidatedObject() {
    const obj = {
      _email: '',
      _age: 0
    };
    
    // Email validation
    Object.defineProperty(obj, 'email', {
      get() {
        return this._email;
      },
      set(value) {
        if (typeof value !== 'string') {
          throw new TypeError('Email must be a string');
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new Error('Invalid email format');
        }
        
        this._email = value;
      },
      enumerable: true,
      configurable: true
    });
    
    // Age validation
    Object.defineProperty(obj, 'age', {
      get() {
        return this._age;
      },
      set(value) {
        if (typeof value !== 'number' || !Number.isInteger(value)) {
          throw new TypeError('Age must be an integer');
        }
        
        if (value < 0 || value > 150) {
          throw new RangeError('Age must be between 0 and 150');
        }
        
        this._age = value;
      },
      enumerable: true,
      configurable: true
    });
    
    return obj;
  }
  
  static demonstrate() {
    console.log('\n=== Property Validation ===');
    
    const obj = this.createValidatedObject();
    
    try {
      obj.email = 'john@example.com';
      obj.age = 30;
      console.log('Valid data set successfully');
      console.log('Email:', obj.email);
      console.log('Age:', obj.age);
      
      // This will throw an error
      obj.email = 'invalid-email';
    } catch (error) {
      console.error('Validation error:', error.message);
    }
    
    try {
      obj.age = -5; // Invalid age
    } catch (error) {
      console.error('Age validation error:', error.message);
    }
  }
}

PropertyValidation.demonstrate();
```

### Property Change Tracking

```javascript
// Track property changes with getters/setters
class PropertyChangeTracking {
  static createTrackableObject(initialData = {}) {
    const changes = [];
    const obj = { ...initialData };
    
    // Add change tracking to all properties
    for (const [key, value] of Object.entries(initialData)) {
      let currentValue = value;
      
      Object.defineProperty(obj, key, {
        get() {
          return currentValue;
        },
        set(newValue) {
          const oldValue = currentValue;
          currentValue = newValue;
          
          changes.push({
            property: key,
            oldValue,
            newValue,
            timestamp: new Date().toISOString()
          });
        },
        enumerable: true,
        configurable: true
      });
    }
    
    // Add method to get changes
    Object.defineProperty(obj, 'getChanges', {
      value() {
        return [...changes];
      },
      writable: false,
      enumerable: false,
      configurable: false
    });
    
    // Add method to clear changes
    Object.defineProperty(obj, 'clearChanges', {
      value() {
        changes.length = 0;
      },
      writable: false,
      enumerable: false,
      configurable: false
    });
    
    return obj;
  }
  
  static demonstrate() {
    console.log('\n=== Property Change Tracking ===');
    
    const user = this.createTrackableObject({
      name: 'John',
      email: 'john@example.com',
      age: 30
    });
    
    console.log('Initial user:', { 
      name: user.name, 
      email: user.email, 
      age: user.age 
    });
    
    // Make some changes
    user.name = 'John Doe';
    user.age = 31;
    user.email = 'john.doe@example.com';
    
    console.log('Changes made:', user.getChanges());
    
    user.clearChanges();
    console.log('Changes after clear:', user.getChanges());
  }
}

PropertyChangeTracking.demonstrate();
```

## Advanced Property Descriptor Patterns

### Property Decorators

```javascript
// Creating property decorators using descriptors
class PropertyDecorators {
  // Memoization decorator
  static memoize(target, propertyKey, descriptor) {
    const originalMethod = descriptor.get;
    const cache = new Map();
    
    descriptor.get = function() {
      const key = JSON.stringify(this);
      
      if (cache.has(key)) {
        console.log(`Cache hit for ${propertyKey}`);
        return cache.get(key);
      }
      
      console.log(`Computing ${propertyKey}`);
      const result = originalMethod.call(this);
      cache.set(key, result);
      return result;
    };
    
    return descriptor;
  }
  
  // Deprecation decorator
  static deprecated(message) {
    return function(target, propertyKey, descriptor) {
      const original = descriptor.get || descriptor.value;
      
      if (descriptor.get) {
        descriptor.get = function() {
          console.warn(`DEPRECATED: ${propertyKey} - ${message}`);
          return original.call(this);
        };
      } else if (typeof original === 'function') {
        descriptor.value = function(...args) {
          console.warn(`DEPRECATED: ${propertyKey} - ${message}`);
          return original.apply(this, args);
        };
      }
      
      return descriptor;
    };
  }
  
  // Validation decorator
  static validate(validator) {
    return function(target, propertyKey, descriptor) {
      const setter = descriptor.set;
      
      descriptor.set = function(value) {
        if (!validator(value)) {
          throw new Error(`Invalid value for ${propertyKey}: ${value}`);
        }
        return setter.call(this, value);
      };
      
      return descriptor;
    };
  }
  
  static demonstrate() {
    console.log('\n=== Property Decorators ===');
    
    class Example {
      constructor() {
        this._value = 0;
      }
      
      // Memoized expensive computation
      get expensiveComputation() {
        // Simulate expensive operation
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
          result += Math.sqrt(i);
        }
        return result;
      }
      
      get value() {
        return this._value;
      }
      
      set value(val) {
        this._value = val;
      }
      
      oldMethod() {
        return 'This method is deprecated';
      }
    }
    
    // Apply decorators manually (since we can't use @ syntax in this context)
    const expensiveDescriptor = Object.getOwnPropertyDescriptor(Example.prototype, 'expensiveComputation');
    Object.defineProperty(Example.prototype, 'expensiveComputation', 
      this.memoize(Example.prototype, 'expensiveComputation', expensiveDescriptor));
    
    const valueDescriptor = Object.getOwnPropertyDescriptor(Example.prototype, 'value');
    Object.defineProperty(Example.prototype, 'value',
      this.validate(val => typeof val === 'number')(Example.prototype, 'value', valueDescriptor));
    
    const methodDescriptor = Object.getOwnPropertyDescriptor(Example.prototype, 'oldMethod');
    Object.defineProperty(Example.prototype, 'oldMethod',
      this.deprecated('Use newMethod instead')(Example.prototype, 'oldMethod', methodDescriptor));
    
    const example = new Example();
    
    // Test memoization
    console.log('First call:', example.expensiveComputation);
    console.log('Second call:', example.expensiveComputation);
    
    // Test validation
    try {
      example.value = 42; // Valid
      console.log('Value set to:', example.value);
      example.value = 'invalid'; // Invalid
    } catch (error) {
      console.error('Validation error:', error.message);
    }
    
    // Test deprecation warning
    example.oldMethod();
  }
}

PropertyDecorators.demonstrate();
```

### Dynamic Property Creation

```javascript
// Dynamically create properties with descriptors
class DynamicProperties {
  static createPropertyFactory() {
    return {
      // Create a read-only property
      readonly(obj, name, value) {
        Object.defineProperty(obj, name, {
          value,
          writable: false,
          enumerable: true,
          configurable: false
        });
      },
      
      // Create a lazy-loaded property
      lazy(obj, name, factory) {
        let computed = false;
        let value;
        
        Object.defineProperty(obj, name, {
          get() {
            if (!computed) {
              console.log(`Lazy loading ${name}`);
              value = factory();
              computed = true;
            }
            return value;
          },
          enumerable: true,
          configurable: true
        });
      },
      
      // Create an observable property
      observable(obj, name, initialValue, onChange) {
        let value = initialValue;
        
        Object.defineProperty(obj, name, {
          get() {
            return value;
          },
          set(newValue) {
            const oldValue = value;
            value = newValue;
            if (onChange) {
              onChange(newValue, oldValue, name);
            }
          },
          enumerable: true,
          configurable: true
        });
      },
      
      // Create a computed property
      computed(obj, name, dependencies, computer) {
        Object.defineProperty(obj, name, {
          get() {
            const depValues = dependencies.map(dep => this[dep]);
            return computer.apply(this, depValues);
          },
          enumerable: true,
          configurable: true
        });
      }
    };
  }
  
  static demonstrate() {
    console.log('\n=== Dynamic Property Creation ===');
    
    const factory = this.createPropertyFactory();
    const obj = {};
    
    // Create different types of properties
    factory.readonly(obj, 'id', 'user-123');
    
    factory.lazy(obj, 'expensiveData', () => {
      // Simulate expensive computation
      return Array.from({ length: 1000 }, (_, i) => i * i);
    });
    
    factory.observable(obj, 'status', 'active', (newVal, oldVal, prop) => {
      console.log(`${prop} changed from ${oldVal} to ${newVal}`);
    });
    
    obj.firstName = 'John';
    obj.lastName = 'Doe';
    factory.computed(obj, 'fullName', ['firstName', 'lastName'], 
      (first, last) => `${first} ${last}`);
    
    // Test the properties
    console.log('ID (readonly):', obj.id);
    
    try {
      obj.id = 'new-id'; // Should not change
      console.log('ID after assignment attempt:', obj.id);
    } catch (error) {
      console.log('Cannot modify readonly property');
    }
    
    console.log('Expensive data (lazy):', obj.expensiveData.length);
    console.log('Expensive data again (cached):', obj.expensiveData.length);
    
    obj.status = 'inactive'; // Triggers observer
    
    console.log('Full name (computed):', obj.fullName);
    obj.firstName = 'Jane';
    console.log('Full name after change:', obj.fullName);
  }
}

DynamicProperties.demonstrate();
```

## Property Descriptor Utilities

### Descriptor Analysis Tools

```javascript
// Utilities for working with property descriptors
class DescriptorUtils {
  static analyzeObject(obj) {
    const analysis = {
      properties: {},
      summary: {
        total: 0,
        writable: 0,
        enumerable: 0,
        configurable: 0,
        accessors: 0,
        dataProperties: 0
      }
    };
    
    const allKeys = [
      ...Object.getOwnPropertyNames(obj),
      ...Object.getOwnPropertySymbols(obj)
    ];
    
    for (const key of allKeys) {
      const descriptor = Object.getOwnPropertyDescriptor(obj, key);
      analysis.properties[key] = descriptor;
      analysis.summary.total++;
      
      if (descriptor.writable) analysis.summary.writable++;
      if (descriptor.enumerable) analysis.summary.enumerable++;
      if (descriptor.configurable) analysis.summary.configurable++;
      
      if (descriptor.get || descriptor.set) {
        analysis.summary.accessors++;
      } else {
        analysis.summary.dataProperties++;
      }
    }
    
    return analysis;
  }
  
  static copyDescriptors(source, target, keys = null) {
    const keysToCopy = keys || Object.getOwnPropertyNames(source);
    
    for (const key of keysToCopy) {
      const descriptor = Object.getOwnPropertyDescriptor(source, key);
      if (descriptor) {
        Object.defineProperty(target, key, descriptor);
      }
    }
    
    return target;
  }
  
  static makeImmutable(obj, deep = false) {
    const keys = Object.getOwnPropertyNames(obj);
    
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(obj, key);
      
      if (descriptor.configurable) {
        Object.defineProperty(obj, key, {
          ...descriptor,
          writable: false,
          configurable: false
        });
      }
      
      if (deep && descriptor.value && typeof descriptor.value === 'object') {
        this.makeImmutable(descriptor.value, true);
      }
    }
    
    Object.preventExtensions(obj);
    return obj;
  }
  
  static demonstrate() {
    console.log('\n=== Descriptor Utilities ===');
    
    const testObj = {
      name: 'Test Object',
      value: 42
    };
    
    Object.defineProperty(testObj, 'computed', {
      get() { return this.value * 2; },
      enumerable: true,
      configurable: true
    });
    
    Object.defineProperty(testObj, 'hidden', {
      value: 'secret',
      writable: true,
      enumerable: false,
      configurable: true
    });
    
    // Analyze object
    const analysis = this.analyzeObject(testObj);
    console.log('Object analysis:', analysis.summary);
    console.log('Properties:', Object.keys(analysis.properties));
    
    // Copy descriptors
    const copy = {};
    this.copyDescriptors(testObj, copy);
    console.log('Copied object keys:', Object.getOwnPropertyNames(copy));
    console.log('Copied computed property:', copy.computed);
    
    // Make immutable
    const immutableObj = { data: { nested: 'value' } };
    this.makeImmutable(immutableObj, true);
    
    try {
      immutableObj.data.nested = 'changed';
      console.log('Immutable test - nested value:', immutableObj.data.nested);
    } catch (error) {
      console.log('Cannot modify immutable object');
    }
  }
}

DescriptorUtils.demonstrate();
```

## Best Practices

### Property Descriptor Best Practices

```javascript
// Best practices for using property descriptors
class DescriptorBestPractices {
  static demonstrate() {
    console.log('\n=== Property Descriptor Best Practices ===');
    
    // ✅ Good: Always specify all descriptor properties for clarity
    const goodObj = {};
    Object.defineProperty(goodObj, 'property', {
      value: 'explicit',
      writable: true,
      enumerable: true,
      configurable: true
    });
    
    // ✅ Good: Use getters for computed properties
    Object.defineProperty(goodObj, 'timestamp', {
      get() {
        return new Date().toISOString();
      },
      enumerable: true,
      configurable: true
    });
    
    // ✅ Good: Use setters for validation
    let _validatedValue = '';
    Object.defineProperty(goodObj, 'validatedProperty', {
      get() {
        return _validatedValue;
      },
      set(value) {
        if (typeof value !== 'string') {
          throw new TypeError('Value must be a string');
        }
        _validatedValue = value;
      },
      enumerable: true,
      configurable: true
    });
    
    // ✅ Good: Use non-enumerable for utility methods
    Object.defineProperty(goodObj, 'toJSON', {
      value() {
        return {
          property: this.property,
          validatedProperty: this.validatedProperty,
          timestamp: this.timestamp
        };
      },
      writable: false,
      enumerable: false, // Don't include in JSON.stringify
      configurable: false
    });
    
    console.log('Good practices implemented');
    console.log('Enumerable keys:', Object.keys(goodObj));
    console.log('All keys:', Object.getOwnPropertyNames(goodObj));
  }
  
  static avoidCommonMistakes() {
    console.log('\n=== Common Mistakes to Avoid ===');
    
    // ❌ Bad: Forgetting to specify descriptor properties
    const badObj = {};
    Object.defineProperty(badObj, 'incomplete', {
      value: 'missing properties'
      // Missing writable, enumerable, configurable
    });
    
    const descriptor = Object.getOwnPropertyDescriptor(badObj, 'incomplete');
    console.log('Incomplete descriptor defaults:', {
      writable: descriptor.writable,     // false
      enumerable: descriptor.enumerable, // false
      configurable: descriptor.configurable // false
    });
    
    // ❌ Bad: Mixing data and accessor descriptors
    try {
      Object.defineProperty(badObj, 'mixed', {
        value: 'data',
        get() { return 'accessor'; } // Error: cannot mix
      });
    } catch (error) {
      console.log('Cannot mix descriptor types:', error.message);
    }
    
    // ❌ Bad: Not handling errors in setters
    Object.defineProperty(badObj, 'unsafe', {
      set(value) {
        // This could throw and break the application
        JSON.parse(value);
      },
      enumerable: true,
      configurable: true
    });
    
    console.log('Common mistakes illustrated');
  }
}

DescriptorBestPractices.demonstrate();
DescriptorBestPractices.avoidCommonMistakes();
```

## Key Takeaways

* **Property descriptors** provide fine-grained control over property behavior
* **Data descriptors** use `value` and `writable` attributes
* **Accessor descriptors** use `get` and `set` functions
* **Enumerable** controls visibility in loops and Object.keys()
* **Configurable** controls ability to delete or reconfigure
* **Writable** controls ability to change property values
* **Getters enable computed properties** that update automatically
* **Setters enable validation** and change tracking
* **Always specify all attributes** for clarity and predictability
* **Use descriptors for advanced property behaviors** like immutability and observation
