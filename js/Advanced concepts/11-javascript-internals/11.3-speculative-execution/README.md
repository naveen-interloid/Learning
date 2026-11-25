# **11.3 Speculative Execution in JS Engines**

Speculative execution is a key optimization technique used by modern JavaScript engines to improve performance by making educated guesses about code behavior and optimizing accordingly.

## Understanding Speculative Execution

### What is Speculative Execution?

Speculative execution involves the engine making assumptions about how code will behave based on runtime profiling, then generating optimized code based on those assumptions.

```javascript
// Example: Type speculation
function add(a, b) {
  return a + b;
}

// Initially, the engine doesn't know what types a and b will be
add(5, 3);        // Engine observes: numbers
add(10, 7);       // Engine observes: numbers again
add(2, 8);        // Engine observes: numbers again

// After several calls with numbers, the engine speculates:
// "This function always receives numbers"
// It generates optimized machine code for number addition

// But if types change:
add("hello", "world"); // Deoptimization! Engine was wrong
// Engine falls back to generic code and updates its assumptions
```

### JIT Compilation Pipeline

```javascript
// Demonstration of how code goes through optimization tiers
class OptimizationDemo {
  static demonstrateOptimizationTiers() {
    // Tier 1: Interpreter (Ignition in V8)
    // - Executes bytecode directly
    // - Collects profiling information
    
    function hotFunction(x) {
      return x * x + x;
    }
    
    // First few calls run in interpreter
    console.log('Starting function calls...');
    
    // Tier 2: Baseline compiler (if applicable)
    // - Light optimization
    // - Still collects profiling data
    
    // Tier 3: Optimizing compiler (TurboFan in V8)
    // - Heavy optimization based on profiling data
    // - Speculative optimizations
    
    // Simulate many calls to trigger optimization
    for (let i = 0; i < 10000; i++) {
      hotFunction(i);
    }
    
    console.log('Function should be optimized now');
    
    // This call benefits from optimized code
    const result = hotFunction(42);
    console.log('Optimized result:', result);
  }
  
  static demonstrateDeoptimization() {
    function polymorphicFunction(obj) {
      return obj.value * 2;
    }
    
    // Train the function with objects of the same shape
    const shape1Objects = [
      { value: 1, type: 'A' },
      { value: 2, type: 'A' },
      { value: 3, type: 'A' }
    ];
    
    console.log('Training with consistent object shape...');
    shape1Objects.forEach(obj => {
      polymorphicFunction(obj);
    });
    
    // Engine optimizes for this object shape
    console.log('Function optimized for shape1');
    
    // Introduce a different object shape
    const shape2Object = { value: 4, name: 'different', extra: true };
    
    console.log('Introducing different object shape...');
    const result = polymorphicFunction(shape2Object);
    console.log('Result with different shape:', result);
    
    // This likely caused deoptimization
    console.log('Function may have deoptimized');
  }
}

OptimizationDemo.demonstrateOptimizationTiers();
OptimizationDemo.demonstrateDeoptimization();
```

## Profiling and Feedback Collection

### Inline Caches and Profiling

```javascript
// Understanding how engines collect profiling information
class ProfilingDemo {
  static demonstrateInlineCaching() {
    // Property access profiling
    function getProperty(obj) {
      return obj.name; // This property access will be profiled
    }
    
    // Monomorphic case (one object shape)
    const user1 = { name: 'Alice', age: 30 };
    const user2 = { name: 'Bob', age: 25 };
    const user3 = { name: 'Charlie', age: 35 };
    
    console.log('Monomorphic property access:');
    console.log(getProperty(user1));
    console.log(getProperty(user2));
    console.log(getProperty(user3));
    // Engine can optimize this with a monomorphic inline cache
    
    // Polymorphic case (multiple object shapes)
    const admin = { name: 'Admin', role: 'administrator', permissions: [] };
    const guest = { name: 'Guest', temporary: true };
    
    console.log('Polymorphic property access:');
    console.log(getProperty(admin));  // Different shape
    console.log(getProperty(guest));  // Another different shape
    // Engine uses polymorphic inline cache (less efficient)
    
    // Megamorphic case (too many shapes)
    const shapes = [];
    for (let i = 0; i < 10; i++) {
      const obj = { name: `User${i}` };
      obj[`prop${i}`] = i; // Each object has a unique property
      shapes.push(obj);
    }
    
    console.log('Megamorphic property access:');
    shapes.forEach(obj => {
      getProperty(obj); // Too many shapes, becomes megamorphic
    });
    // Engine falls back to generic property lookup
  }
  
  static demonstrateCallSitePolymorphism() {
    // Function call profiling
    function processValue(processor, value) {
      return processor(value);
    }
    
    const doubler = x => x * 2;
    const squarer = x => x * x;
    const incrementer = x => x + 1;
    
    // Monomorphic call site
    console.log('Monomorphic calls:');
    console.log(processValue(doubler, 5));
    console.log(processValue(doubler, 10));
    console.log(processValue(doubler, 15));
    // Engine can inline the doubler function
    
    // Polymorphic call site
    console.log('Polymorphic calls:');
    console.log(processValue(doubler, 5));
    console.log(processValue(squarer, 5));
    console.log(processValue(incrementer, 5));
    // Engine maintains multiple inline caches
    
    // Megamorphic call site
    console.log('Megamorphic calls:');
    const processors = [
      x => x * 2, x => x * 3, x => x * 4, x => x * 5,
      x => x + 1, x => x + 2, x => x + 3, x => x + 4,
      x => x - 1, x => x / 2
    ];
    
    processors.forEach(processor => {
      processValue(processor, 10);
    });
    // Too many different functions, becomes megamorphic
  }
}

ProfilingDemo.demonstrateInlineCaching();
ProfilingDemo.demonstrateCallSitePolymorphism();
```

### Type Feedback and Speculation

```javascript
// How engines use type feedback for speculation
class TypeFeedbackDemo {
  static demonstrateTypeSpecialization() {
    // Arithmetic operations with type feedback
    function calculate(a, b, c) {
      return a + b * c;
    }
    
    // Train with integers
    console.log('Training with integers:');
    for (let i = 0; i < 1000; i++) {
      calculate(i, i + 1, i + 2);
    }
    
    // Engine speculates: "This function works with integers"
    // Generates optimized integer arithmetic code
    
    console.log('Integer calculation:', calculate(5, 10, 2)); // 25
    
    // Introduce floating point numbers
    console.log('Floating point calculation:', calculate(1.5, 2.5, 3.5)); // 10.25
    // May cause deoptimization if engine was too aggressive
    
    // Introduce strings (major type change)
    console.log('String calculation:', calculate('Hello', ' ', 'World')); // "Hello World"
    // Definitely causes deoptimization
  }
  
  static demonstrateArrayElementSpecialization() {
    // Array element type speculation
    function sumArray(arr) {
      let sum = 0;
      for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
      }
      return sum;
    }
    
    // Train with integer arrays
    const intArrays = [
      [1, 2, 3, 4, 5],
      [10, 20, 30],
      [100, 200, 300, 400]
    ];
    
    console.log('Training with integer arrays:');
    intArrays.forEach(arr => {
      console.log('Sum:', sumArray(arr));
    });
    
    // Engine optimizes for integer array elements
    
    // Introduce floating point array
    const floatArray = [1.1, 2.2, 3.3, 4.4];
    console.log('Float array sum:', sumArray(floatArray));
    
    // Introduce mixed array
    const mixedArray = [1, 'hello', 3, null, 5];
    console.log('Mixed array sum:', sumArray(mixedArray)); // NaN
    // This will likely cause deoptimization
  }
  
  static demonstrateObjectShapeSpecialization() {
    // Object shape speculation
    function getFullName(person) {
      return person.firstName + ' ' + person.lastName;
    }
    
    // Train with consistent object shape
    const people = [
      { firstName: 'John', lastName: 'Doe', age: 30 },
      { firstName: 'Jane', lastName: 'Smith', age: 25 },
      { firstName: 'Bob', lastName: 'Johnson', age: 35 }
    ];
    
    console.log('Training with consistent object shape:');
    people.forEach(person => {
      console.log(getFullName(person));
    });
    
    // Engine optimizes for this specific object shape
    
    // Introduce object with different shape
    const differentPerson = { 
      firstName: 'Alice', 
      lastName: 'Brown', 
      middleName: 'Marie',  // Extra property
      age: 28 
    };
    
    console.log('Different shape:', getFullName(differentPerson));
    // May cause deoptimization depending on engine strategy
    
    // Introduce object with missing property
    const incompletePerson = { firstName: 'Charlie' };
    console.log('Incomplete object:', getFullName(incompletePerson));
    // "Charlie undefined" - likely causes deoptimization
  }
}

TypeFeedbackDemo.demonstrateTypeSpecialization();
TypeFeedbackDemo.demonstrateArrayElementSpecialization();
TypeFeedbackDemo.demonstrateObjectShapeSpecialization();
```

## Optimization Strategies

### Function Inlining

```javascript
// Understanding function inlining optimization
class InliningDemo {
  static demonstrateInlining() {
    // Small, frequently called functions are candidates for inlining
    function add(a, b) {
      return a + b;
    }
    
    function multiply(a, b) {
      return a * b;
    }
    
    function calculate(x, y) {
      // These function calls may be inlined
      const sum = add(x, y);
      const product = multiply(x, y);
      return sum + product;
    }
    
    // After optimization, calculate might become:
    // function calculate(x, y) {
    //   const sum = x + y;        // add() inlined
    //   const product = x * y;    // multiply() inlined
    //   return sum + product;
    // }
    
    console.log('Result:', calculate(5, 3)); // 23
  }
  
  static demonstrateInliningLimitations() {
    // Large functions are less likely to be inlined
    function largeFunction(x) {
      let result = x;
      for (let i = 0; i < 100; i++) {
        result = result * 1.1 + Math.sin(result) - Math.cos(result);
        result = Math.abs(result) % 1000;
      }
      return result;
    }
    
    function caller(value) {
      return largeFunction(value); // Unlikely to be inlined
    }
    
    // Polymorphic functions are harder to inline
    function polymorphicCaller(fn, value) {
      return fn(value); // Hard to inline - fn could be anything
    }
    
    console.log('Large function result:', caller(10));
    console.log('Polymorphic result:', polymorphicCaller(Math.sqrt, 16));
  }
}

InliningDemo.demonstrateInlining();
InliningDemo.demonstrateInliningLimitations();
```

### Loop Optimizations

```javascript
// Loop optimization techniques
class LoopOptimizationDemo {
  static demonstrateLoopInvariantCodeMotion() {
    // Loop invariant code motion
    function processArray(arr, multiplier) {
      const result = [];
      for (let i = 0; i < arr.length; i++) {
        // Math.sqrt(multiplier) is loop invariant
        result.push(arr[i] * Math.sqrt(multiplier));
      }
      return result;
    }
    
    // Engine can optimize this to:
    // function processArray(arr, multiplier) {
    //   const result = [];
    //   const sqrtMultiplier = Math.sqrt(multiplier); // Moved outside loop
    //   for (let i = 0; i < arr.length; i++) {
    //     result.push(arr[i] * sqrtMultiplier);
    //   }
    //   return result;
    // }
    
    const data = [1, 2, 3, 4, 5];
    console.log('Processed array:', processArray(data, 4));
  }
  
  static demonstrateLoopUnrolling() {
    // Simple loop that might be unrolled
    function sumArray(arr) {
      let sum = 0;
      for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
      }
      return sum;
    }
    
    // Engine might unroll this to:
    // function sumArray(arr) {
    //   let sum = 0;
    //   let i = 0;
    //   // Process 4 elements at a time
    //   for (; i < arr.length - 3; i += 4) {
    //     sum += arr[i] + arr[i+1] + arr[i+2] + arr[i+3];
    //   }
    //   // Handle remaining elements
    //   for (; i < arr.length; i++) {
    //     sum += arr[i];
    //   }
    //   return sum;
    // }
    
    const largeArray = Array.from({ length: 10000 }, (_, i) => i);
    console.log('Array sum:', sumArray(largeArray));
  }
  
  static demonstrateBoundsCheckElimination() {
    // Bounds check elimination
    function processFixedArray(arr) {
      // Engine knows arr.length is constant in this loop
      for (let i = 0; i < arr.length; i++) {
        arr[i] = arr[i] * 2; // Bounds check can be eliminated
      }
    }
    
    // vs. dynamic bounds
    function processDynamicArray(arr) {
      let len = arr.length;
      for (let i = 0; i < len; i++) {
        arr[i] = arr[i] * 2;
        if (Math.random() < 0.001) {
          arr.push(0); // Length might change - harder to optimize
        }
      }
    }
    
    const testArray = [1, 2, 3, 4, 5];
    processFixedArray([...testArray]);
    console.log('Fixed array processing completed');
  }
}

LoopOptimizationDemo.demonstrateLoopInvariantCodeMotion();
LoopOptimizationDemo.demonstrateLoopUnrolling();
LoopOptimizationDemo.demonstrateBoundsCheckElimination();
```

## Deoptimization and Bailouts

### Understanding Deoptimization

```javascript
// When and why deoptimization occurs
class DeoptimizationDemo {
  static demonstrateTypeDeoptimization() {
    function flexibleAdd(a, b) {
      return a + b;
    }
    
    // Train with numbers
    console.log('Training with numbers:');
    for (let i = 0; i < 1000; i++) {
      flexibleAdd(i, i + 1);
    }
    console.log('Number result:', flexibleAdd(10, 20)); // 30
    
    // Cause deoptimization with strings
    console.log('Causing deoptimization with strings:');
    console.log('String result:', flexibleAdd('Hello', ' World')); // "Hello World"
    
    // Function is now deoptimized and will handle both cases generically
    console.log('After deoptimization:');
    console.log('Number result:', flexibleAdd(5, 15)); // 20
    console.log('String result:', flexibleAdd('Good', 'bye')); // "Goodbye"
  }
  
  static demonstrateShapeDeoptimization() {
    function getPersonInfo(person) {
      return `${person.name} is ${person.age} years old`;
    }
    
    // Train with consistent shape
    const people = [
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
      { name: 'Charlie', age: 35 }
    ];
    
    console.log('Training with consistent shape:');
    people.forEach(person => {
      console.log(getPersonInfo(person));
    });
    
    // Introduce different shape
    console.log('Introducing different shape:');
    const differentPerson = { age: 40, name: 'David', city: 'New York' };
    console.log(getPersonInfo(differentPerson));
    
    // Introduce incomplete shape
    console.log('Introducing incomplete shape:');
    const incompletePerson = { name: 'Eve' }; // Missing age
    console.log(getPersonInfo(incompletePerson)); // "Eve is undefined years old"
  }
  
  static demonstrateArrayDeoptimization() {
    function processArray(arr) {
      let sum = 0;
      for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
      }
      return sum;
    }
    
    // Train with dense integer arrays
    console.log('Training with dense integer arrays:');
    const denseArrays = [
      [1, 2, 3, 4, 5],
      [10, 20, 30, 40],
      [100, 200, 300]
    ];
    
    denseArrays.forEach(arr => {
      console.log('Sum:', processArray(arr));
    });
    
    // Introduce sparse array
    console.log('Introducing sparse array:');
    const sparseArray = [1, , , 4, 5]; // Has holes
    console.log('Sparse sum:', processArray(sparseArray)); // NaN due to undefined
    
    // Introduce array with non-numeric elements
    console.log('Introducing mixed array:');
    const mixedArray = [1, 'hello', 3, null, 5];
    console.log('Mixed sum:', processArray(mixedArray)); // NaN
  }
}

DeoptimizationDemo.demonstrateTypeDeoptimization();
DeoptimizationDemo.demonstrateShapeDeoptimization();
DeoptimizationDemo.demonstrateArrayDeoptimization();
```

## Writing Optimization-Friendly Code

### Best Practices for Speculative Execution

```javascript
// Writing code that engines can optimize well
class OptimizationFriendlyCode {
  static consistentTypes() {
    // ✅ Good: Consistent types
    function addNumbers(a, b) {
      // Always expect numbers
      if (typeof a !== 'number' || typeof b !== 'number') {
        throw new Error('Expected numbers');
      }
      return a + b;
    }
    
    // ❌ Bad: Inconsistent types
    function flexibleAdd(a, b) {
      return a + b; // Could be numbers, strings, etc.
    }
    
    console.log('Consistent types:', addNumbers(5, 10));
  }
  
  static consistentObjectShapes() {
    // ✅ Good: Consistent object shapes
    class Person {
      constructor(name, age) {
        this.name = name;
        this.age = age;
        // Always initialize all properties
      }
      
      getInfo() {
        return `${this.name} is ${this.age} years old`;
      }
    }
    
    // ❌ Bad: Inconsistent shapes
    function createPerson(name, age, hasEmail) {
      const person = { name, age };
      if (hasEmail) {
        person.email = `${name}@example.com`; // Shape changes
      }
      return person;
    }
    
    const people = [
      new Person('Alice', 30),
      new Person('Bob', 25),
      new Person('Charlie', 35)
    ];
    
    people.forEach(person => {
      console.log(person.getInfo());
    });
  }
  
  static avoidPolymorphism() {
    // ✅ Good: Monomorphic function calls
    function processNumbers(processor, numbers) {
      return numbers.map(processor);
    }
    
    const doubler = x => x * 2;
    const numbers = [1, 2, 3, 4, 5];
    
    console.log('Monomorphic:', processNumbers(doubler, numbers));
    
    // ✅ Better: Specialized functions
    function doubleNumbers(numbers) {
      return numbers.map(x => x * 2);
    }
    
    function squareNumbers(numbers) {
      return numbers.map(x => x * x);
    }
    
    console.log('Specialized doubling:', doubleNumbers(numbers));
    console.log('Specialized squaring:', squareNumbers(numbers));
  }
  
  static optimizeArrays() {
    // ✅ Good: Dense arrays with consistent element types
    const intArray = new Array(1000);
    for (let i = 0; i < intArray.length; i++) {
      intArray[i] = i; // Dense, all integers
    }
    
    // ❌ Bad: Sparse arrays or mixed types
    const badArray = [];
    badArray[0] = 1;
    badArray[100] = 'hello'; // Sparse and mixed types
    badArray[200] = { obj: true };
    
    function sumIntegers(arr) {
      let sum = 0;
      for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
      }
      return sum;
    }
    
    console.log('Dense array sum:', sumIntegers(intArray.slice(0, 10)));
  }
  
  static avoidDeoptimizationTriggers() {
    // ✅ Good: Avoid operations that trigger deoptimization
    const obj = { a: 1, b: 2, c: 3 };
    
    // Don't delete properties
    // delete obj.b; // ❌ Bad: Triggers deoptimization
    
    // Instead, set to undefined or null
    obj.b = undefined; // ✅ Better
    
    // Don't change property types
    // obj.a = 'string'; // ❌ Bad: Changes type
    
    // Don't add properties after creation if possible
    // obj.d = 4; // ❌ Less optimal
    
    // ✅ Better: Define all properties upfront
    const betterObj = { a: 1, b: 2, c: 3, d: null };
    betterObj.d = 4; // Just changing value, not shape
    
    console.log('Optimized object:', betterObj);
  }
}

OptimizationFriendlyCode.consistentTypes();
OptimizationFriendlyCode.consistentObjectShapes();
OptimizationFriendlyCode.avoidPolymorphism();
OptimizationFriendlyCode.optimizeArrays();
OptimizationFriendlyCode.avoidDeoptimizationTriggers();
```

## Key Takeaways

* **Speculative execution** optimizes code based on runtime behavior patterns
* **Type feedback** helps engines make optimization decisions
* **Consistent types and shapes** enable better optimizations
* **Deoptimization** occurs when assumptions prove wrong
* **Monomorphic code** is easier to optimize than polymorphic code
* **Function inlining** eliminates call overhead for small functions
* **Loop optimizations** can significantly improve performance
* **Writing predictable code** helps engines optimize better
* **Understanding engine behavior** leads to better performance decisions
