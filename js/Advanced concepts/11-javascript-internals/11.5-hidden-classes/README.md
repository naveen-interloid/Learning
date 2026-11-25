# **11.5 Hidden Classes & Inline Caching**

Hidden classes (also called Maps or Shapes) are V8's internal mechanism for optimizing property access. Understanding them is crucial for writing high-performance JavaScript.

## Understanding Hidden Classes

### What are Hidden Classes?

```javascript
// Hidden classes optimize property access
class HiddenClassDemo {
  static basicExample() {
    // Each object with the same property structure shares a hidden class
    const obj1 = { x: 1, y: 2 };
    const obj2 = { x: 3, y: 4 };
    const obj3 = { x: 5, y: 6 };
    
    // obj1, obj2, obj3 share the same hidden class
    // Hidden class contains:
    // - Property names and their offsets
    // - Property attributes (writable, enumerable, etc.)
    // - Transitions to other hidden classes
    
    console.log('Objects with same structure share hidden class');
    
    // Different structure = different hidden class
    const obj4 = { y: 8, x: 7 }; // Different property order
    const obj5 = { x: 9, y: 10, z: 11 }; // Additional property
    
    console.log('Different structures have different hidden classes');
  }
  
  static demonstrateTransitions() {
    // Hidden class transitions
    const obj = {}; // Hidden class: Empty
    
    obj.a = 1;      // Transition to: Hidden class with 'a'
    obj.b = 2;      // Transition to: Hidden class with 'a', 'b'
    obj.c = 3;      // Transition to: Hidden class with 'a', 'b', 'c'
    
    // Each property addition creates a new hidden class
    // V8 caches these transitions for reuse
    
    console.log('Object after transitions:', obj);
    
    // Objects following the same transition path share hidden classes
    const obj2 = {};
    obj2.a = 10;    // Uses cached transition
    obj2.b = 20;    // Uses cached transition
    obj2.c = 30;    // Uses cached transition
    
    // obj and obj2 now have the same hidden class
    console.log('Second object follows same transition path');
  }
}

HiddenClassDemo.basicExample();
HiddenClassDemo.demonstrateTransitions();
```

### Hidden Class Optimization Benefits

```javascript
// Benefits of hidden classes for property access
class OptimizationBenefits {
  static propertyAccessSpeed() {
    // Without hidden classes, property access would require:
    // 1. Hash table lookup for property name
    // 2. Check if property exists
    // 3. Return value
    
    // With hidden classes, property access becomes:
    // 1. Check object's hidden class
    // 2. Use cached offset to directly access property
    // 3. Return value (much faster!)
    
    function accessProperty(obj) {
      return obj.value; // Optimized with hidden classes
    }
    
    // Objects with same hidden class
    const objects = [
      { value: 1, type: 'A' },
      { value: 2, type: 'B' },
      { value: 3, type: 'C' }
    ];
    
    console.log('Fast property access with same hidden class:');
    objects.forEach(obj => {
      console.log(accessProperty(obj));
    });
  }
  
  static memoryEfficiency() {
    // Hidden classes save memory by sharing structure information
    const users = [];
    
    // All user objects share the same hidden class
    for (let i = 0; i < 1000; i++) {
      users.push({
        id: i,
        name: `User${i}`,
        email: `user${i}@example.com`,
        active: true
      });
    }
    
    // Without hidden classes: Each object would store property names
    // With hidden classes: Property names stored once in hidden class
    
    console.log('Created 1000 users sharing hidden class structure');
  }
}

OptimizationBenefits.propertyAccessSpeed();
OptimizationBenefits.memoryEfficiency();
```

## Inline Caching Mechanisms

### Monomorphic Inline Caches

```javascript
// Monomorphic inline caches (one hidden class)
class MonomorphicCaching {
  static demonstrateMonomorphicIC() {
    function getProperty(obj) {
      return obj.name; // This property access will be cached
    }
    
    // Train with objects of the same hidden class
    const users = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 35 }
    ];
    
    console.log('Monomorphic inline cache training:');
    users.forEach(user => {
      console.log(getProperty(user));
    });
    
    // After training, the inline cache contains:
    // - Expected hidden class
    // - Property offset for 'name'
    // - Direct memory access code
    
    // Subsequent calls with same hidden class are very fast
    console.log('Fast cached access:', getProperty(users[0]));
  }
  
  static monomorphicPerformance() {
    // Benchmark monomorphic vs polymorphic access
    function accessName(obj) {
      return obj.name;
    }
    
    // Monomorphic objects (same hidden class)
    const monomorphicObjects = Array.from({ length: 10000 }, (_, i) => ({
      name: `Name${i}`,
      value: i
    }));
    
    console.time('Monomorphic access');
    for (let i = 0; i < 10000; i++) {
      accessName(monomorphicObjects[i]);
    }
    console.timeEnd('Monomorphic access');
    
    console.log('Monomorphic access completed');
  }
}

MonomorphicCaching.demonstrateMonomorphicIC();
MonomorphicCaching.monomorphicPerformance();
```

### Polymorphic Inline Caches

```javascript
// Polymorphic inline caches (multiple hidden classes)
class PolymorphicCaching {
  static demonstratePolymorphicIC() {
    function getProperty(obj) {
      return obj.name; // Will handle multiple hidden classes
    }
    
    // Objects with different hidden classes
    const user = { name: 'Alice', age: 30 };
    const admin = { name: 'Admin', role: 'administrator', permissions: [] };
    const guest = { name: 'Guest', temporary: true };
    
    console.log('Polymorphic inline cache training:');
    console.log(getProperty(user));   // Hidden class 1
    console.log(getProperty(admin));  // Hidden class 2
    console.log(getProperty(guest));  // Hidden class 3
    
    // Inline cache now contains multiple entries:
    // - Hidden class 1 → offset for 'name'
    // - Hidden class 2 → offset for 'name'
    // - Hidden class 3 → offset for 'name'
    
    console.log('Polymorphic cache handles multiple shapes');
  }
  
  static polymorphicLimits() {
    function getProperty(obj) {
      return obj.name;
    }
    
    // Create many different object shapes
    const objects = [];
    for (let i = 0; i < 10; i++) {
      const obj = { name: `Object${i}` };
      obj[`prop${i}`] = i; // Each object has unique property
      objects.push(obj);
    }
    
    console.log('Testing polymorphic limits:');
    objects.forEach((obj, index) => {
      console.log(`Shape ${index}:`, getProperty(obj));
    });
    
    // After ~4-8 different shapes, becomes megamorphic
    // Megamorphic = falls back to hash table lookup
    console.log('Too many shapes may cause megamorphic behavior');
  }
}

PolymorphicCaching.demonstratePolymorphicIC();
PolymorphicCaching.polymorphicLimits();
```

### Megamorphic Inline Caches

```javascript
// Megamorphic inline caches (too many hidden classes)
class MegamorphicCaching {
  static demonstrateMegamorphicIC() {
    function getProperty(obj) {
      return obj.value; // Will become megamorphic
    }
    
    // Create many objects with different shapes
    const objects = [];
    for (let i = 0; i < 20; i++) {
      const obj = { value: i };
      // Add unique properties to create different hidden classes
      for (let j = 0; j < i; j++) {
        obj[`prop${j}`] = j;
      }
      objects.push(obj);
    }
    
    console.log('Creating megamorphic inline cache:');
    objects.forEach((obj, index) => {
      if (index < 5) {
        console.log(`Object ${index}:`, getProperty(obj));
      }
    });
    
    // After many different shapes, inline cache gives up
    // Falls back to generic property lookup (slower)
    console.log('Function is now megamorphic (slower)');
  }
  
  static avoidMegamorphic() {
    // Strategy to avoid megamorphic behavior
    
    // ❌ Bad: Creates many different shapes
    function createBadObjects() {
      const objects = [];
      for (let i = 0; i < 10; i++) {
        const obj = { value: i };
        if (i % 2 === 0) obj.even = true;
        if (i % 3 === 0) obj.divisibleBy3 = true;
        if (i % 5 === 0) obj.divisibleBy5 = true;
        objects.push(obj);
      }
      return objects;
    }
    
    // ✅ Good: Consistent object shape
    function createGoodObjects() {
      const objects = [];
      for (let i = 0; i < 10; i++) {
        objects.push({
          value: i,
          even: i % 2 === 0 ? true : null,
          divisibleBy3: i % 3 === 0 ? true : null,
          divisibleBy5: i % 5 === 0 ? true : null
        });
      }
      return objects;
    }
    
    const badObjects = createBadObjects();
    const goodObjects = createGoodObjects();
    
    console.log('Bad objects have different shapes');
    console.log('Good objects share the same shape');
  }
}

MegamorphicCaching.demonstrateMegamorphicIC();
MegamorphicCaching.avoidMegamorphic();
```

## Hidden Class Transitions

### Property Addition Transitions

```javascript
// Understanding property addition transitions
class PropertyTransitions {
  static demonstrateAdditionTransitions() {
    // Each property addition creates a transition
    console.log('Property addition transitions:');
    
    const obj1 = {};           // Hidden class: Empty
    console.log('1. Empty object');
    
    obj1.a = 1;               // Transition: Empty → {a}
    console.log('2. Added property a');
    
    obj1.b = 2;               // Transition: {a} → {a,b}
    console.log('3. Added property b');
    
    obj1.c = 3;               // Transition: {a,b} → {a,b,c}
    console.log('4. Added property c');
    
    // Second object following same path reuses transitions
    const obj2 = {};
    obj2.a = 10;              // Reuses: Empty → {a}
    obj2.b = 20;              // Reuses: {a} → {a,b}
    obj2.c = 30;              // Reuses: {a,b} → {a,b,c}
    
    console.log('Second object reused transitions');
  }
  
  static demonstrateOrderMatters() {
    // Property addition order affects hidden classes
    const obj1 = {};
    obj1.a = 1;
    obj1.b = 2;
    // Hidden class: {a,b} with a at offset 0, b at offset 1
    
    const obj2 = {};
    obj2.b = 2;
    obj2.a = 1;
    // Hidden class: {b,a} with b at offset 0, a at offset 1
    
    // obj1 and obj2 have DIFFERENT hidden classes!
    console.log('Property order creates different hidden classes');
    
    // ✅ Better: Consistent property order
    function createConsistentObject(a, b) {
      return { a, b }; // Always same order
    }
    
    const consistent1 = createConsistentObject(1, 2);
    const consistent2 = createConsistentObject(3, 4);
    // These share the same hidden class
    
    console.log('Consistent order shares hidden classes');
  }
}

PropertyTransitions.demonstrateAdditionTransitions();
PropertyTransitions.demonstrateOrderMatters();
```

### Property Deletion and Reconfiguration

```javascript
// Property deletion and reconfiguration effects
class PropertyModifications {
  static demonstrateDeletion() {
    const obj = { a: 1, b: 2, c: 3 };
    console.log('Original object:', obj);
    
    // Property deletion changes hidden class
    delete obj.b;
    console.log('After deleting b:', obj);
    
    // This creates a new hidden class and is expensive
    // V8 may not optimize objects that have had properties deleted
    
    console.log('Property deletion changes hidden class (expensive)');
  }
  
  static avoidDeletion() {
    // ❌ Bad: Using delete
    const badObj = { a: 1, b: 2, c: 3 };
    delete badObj.b; // Changes hidden class
    
    // ✅ Better: Set to undefined
    const goodObj = { a: 1, b: 2, c: 3 };
    goodObj.b = undefined; // Keeps same hidden class
    
    // ✅ Best: Use null for "empty" values
    const bestObj = { a: 1, b: null, c: 3 };
    bestObj.b = 2; // Just changing value, not structure
    
    console.log('Avoided property deletion');
  }
  
  static demonstrateReconfiguration() {
    const obj = { value: 42 };
    
    // Reconfiguring property attributes changes hidden class
    Object.defineProperty(obj, 'value', {
      writable: false,
      enumerable: false,
      configurable: false
    });
    
    console.log('Property reconfiguration changes hidden class');
    
    // ✅ Better: Define properties with final attributes upfront
    const betterObj = Object.defineProperty({}, 'value', {
      value: 42,
      writable: false,
      enumerable: false,
      configurable: false
    });
    
    console.log('Defined property with final attributes');
  }
}

PropertyModifications.demonstrateDeletion();
PropertyModifications.avoidDeletion();
PropertyModifications.demonstrateReconfiguration();
```

## Optimizing for Hidden Classes

### Best Practices

```javascript
// Best practices for hidden class optimization
class HiddenClassOptimization {
  static consistentObjectCreation() {
    // ✅ Good: Constructor function ensures consistent shape
    function Person(name, age, email) {
      this.name = name;
      this.age = age;
      this.email = email;
      // All Person objects have the same hidden class
    }
    
    const people = [
      new Person('Alice', 30, 'alice@example.com'),
      new Person('Bob', 25, 'bob@example.com'),
      new Person('Charlie', 35, 'charlie@example.com')
    ];
    
    // ✅ Good: Class syntax also ensures consistency
    class User {
      constructor(id, name) {
        this.id = id;
        this.name = name;
        this.active = true; // Always initialize all properties
      }
    }
    
    const users = [
      new User(1, 'User1'),
      new User(2, 'User2'),
      new User(3, 'User3')
    ];
    
    console.log('Consistent object creation optimized');
  }
  
  static avoidShapeChanges() {
    // ❌ Bad: Changing object shape after creation
    function createBadObject() {
      const obj = { a: 1, b: 2 };
      
      if (Math.random() > 0.5) {
        obj.c = 3; // Sometimes adds property
      }
      
      return obj;
    }
    
    // ✅ Good: Consistent shape regardless of conditions
    function createGoodObject() {
      return {
        a: 1,
        b: 2,
        c: Math.random() > 0.5 ? 3 : null // Always present
      };
    }
    
    console.log('Avoided shape changes after creation');
  }
  
  static initializeAllProperties() {
    // ✅ Good: Initialize all properties in constructor
    class OptimizedClass {
      constructor(data) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.email = data.email || null;
        this.active = data.active !== undefined ? data.active : true;
        this.metadata = data.metadata || null;
        // All properties initialized, consistent hidden class
      }
    }
    
    // ❌ Bad: Conditionally adding properties
    class UnoptimizedClass {
      constructor(data) {
        this.id = data.id;
        this.name = data.name;
        
        if (data.email) {
          this.email = data.email; // Sometimes present
        }
        
        if (data.active !== undefined) {
          this.active = data.active; // Sometimes present
        }
        
        // Objects have different hidden classes!
      }
    }
    
    console.log('All properties initialized for consistent shape');
  }
  
  static useObjectLiterals() {
    // ✅ Good: Object literals with consistent structure
    function createPoint(x, y, z) {
      return { x, y, z }; // Always same structure
    }
    
    // ✅ Good: Factory function with consistent shape
    function createUser(name, age) {
      return {
        name: name,
        age: age,
        email: null,        // Always present
        active: true,       // Always present
        metadata: null      // Always present
      };
    }
    
    const points = [
      createPoint(1, 2, 3),
      createPoint(4, 5, 6),
      createPoint(7, 8, 9)
    ];
    
    console.log('Object literals with consistent structure');
  }
}

HiddenClassOptimization.consistentObjectCreation();
HiddenClassOptimization.avoidShapeChanges();
HiddenClassOptimization.initializeAllProperties();
HiddenClassOptimization.useObjectLiterals();
```

### Performance Comparison

```javascript
// Performance comparison of different approaches
class PerformanceComparison {
  static benchmarkPropertyAccess() {
    // Setup objects with same vs different hidden classes
    
    // Same hidden class
    const sameShapeObjects = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      name: `Object${i}`,
      value: i * 2
    }));
    
    // Different hidden classes
    const differentShapeObjects = Array.from({ length: 10000 }, (_, i) => {
      const obj = { id: i, name: `Object${i}`, value: i * 2 };
      if (i % 2 === 0) obj.even = true;
      if (i % 3 === 0) obj.divisibleBy3 = true;
      if (i % 5 === 0) obj.divisibleBy5 = true;
      return obj;
    });
    
    function accessProperty(obj) {
      return obj.name;
    }
    
    // Benchmark same shape access
    console.time('Same shape access');
    for (let i = 0; i < 10000; i++) {
      accessProperty(sameShapeObjects[i]);
    }
    console.timeEnd('Same shape access');
    
    // Benchmark different shape access
    console.time('Different shape access');
    for (let i = 0; i < 10000; i++) {
      accessProperty(differentShapeObjects[i]);
    }
    console.timeEnd('Different shape access');
    
    console.log('Same shape access is typically faster');
  }
}

PerformanceComparison.benchmarkPropertyAccess();
```

## Key Takeaways

* **Hidden classes** optimize property access by caching structure information
* **Inline caches** speed up property access for objects with known shapes
* **Monomorphic** caches (one shape) are fastest
* **Polymorphic** caches (few shapes) are moderately fast
* **Megamorphic** caches (many shapes) fall back to slow hash lookup
* **Property order** matters for hidden class identity
* **Consistent object shapes** enable better optimization
* **Avoid property deletion** - use undefined or null instead
* **Initialize all properties** in constructors for consistent shapes
* **Understanding hidden classes** helps write faster JavaScript
