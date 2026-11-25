# **10.4 Code Introspection**

Code introspection allows you to examine and analyze code structure, function properties, and object characteristics at runtime, enabling powerful debugging, testing, and meta-programming capabilities.

## Function Introspection

### Function Properties and Metadata

```javascript
// Analyzing function properties and characteristics
class FunctionIntrospection {
  static analyzeFunctionProperties() {
    console.log('=== Function Properties Analysis ===');
    
    function sampleFunction(param1, param2 = 'default', ...rest) {
      return param1 + param2;
    }
    
    const arrowFunction = (x, y) => x * y;
    const asyncFunction = async function(data) {
      return await Promise.resolve(data);
    };
    
    function* generatorFunction(start) {
      yield start;
      yield start + 1;
    }
    
    // Analyze different function types
    const functions = [
      { name: 'Regular Function', func: sampleFunction },
      { name: 'Arrow Function', func: arrowFunction },
      { name: 'Async Function', func: asyncFunction },
      { name: 'Generator Function', func: generatorFunction }
    ];
    
    functions.forEach(({ name, func }) => {
      console.log(`\n${name}:`);
      console.log('  Name:', func.name || 'anonymous');
      console.log('  Length (arity):', func.length);
      console.log('  String representation:', func.toString().substring(0, 50) + '...');
      console.log('  Constructor:', func.constructor.name);
      console.log('  Is async:', func.constructor.name === 'AsyncFunction');
      console.log('  Is generator:', func.constructor.name === 'GeneratorFunction');
    });
  }
  
  static analyzeParameterSignature() {
    console.log('\n=== Parameter Signature Analysis ===');
    
    function complexFunction(required, optional = 42, { destructured = 'value' } = {}, ...rest) {
      return { required, optional, destructured, rest };
    }
    
    // Extract parameter information from function string
    const funcString = complexFunction.toString();
    const paramMatch = funcString.match(/\(([^)]*)\)/);
    
    if (paramMatch) {
      const params = paramMatch[1];
      console.log('Raw parameters:', params);
      
      // Parse parameter types
      const paramAnalysis = this.parseParameters(params);
      console.log('Parameter analysis:', paramAnalysis);
    }
    
    // Test with actual calls
    console.log('\nFunction calls:');
    console.log('complexFunction("test"):', complexFunction("test"));
    console.log('complexFunction("test", 100):', complexFunction("test", 100));
    console.log('complexFunction("test", 100, {destructured: "custom"}, "extra", "args"):', 
                complexFunction("test", 100, {destructured: "custom"}, "extra", "args"));
  }
  
  static parseParameters(paramString) {
    const params = paramString.split(',').map(p => p.trim()).filter(p => p);
    
    return params.map(param => {
      const analysis = {
        name: param,
        hasDefault: param.includes('='),
        isDestructured: param.includes('{') || param.includes('['),
        isRest: param.startsWith('...'),
        type: 'unknown'
      };
      
      if (analysis.isRest) {
        analysis.name = param.substring(3);
        analysis.type = 'rest';
      } else if (analysis.isDestructured) {
        analysis.type = param.includes('{') ? 'object-destructured' : 'array-destructured';
      } else if (analysis.hasDefault) {
        analysis.name = param.split('=')[0].trim();
        analysis.defaultValue = param.split('=')[1].trim();
        analysis.type = 'optional';
      } else {
        analysis.type = 'required';
      }
      
      return analysis;
    });
  }
}

FunctionIntrospection.analyzeFunctionProperties();
FunctionIntrospection.analyzeParameterSignature();
```

## Object Structure Analysis

### Deep Object Inspection

```javascript
// Comprehensive object structure analysis
class ObjectIntrospection {
  static analyzeObjectStructure(obj, name = 'object') {
    console.log(`\n=== ${name} Structure Analysis ===`);
    
    const analysis = {
      type: typeof obj,
      constructor: obj?.constructor?.name || 'unknown',
      prototype: Object.getPrototypeOf(obj)?.constructor?.name || 'null',
      isArray: Array.isArray(obj),
      isFunction: typeof obj === 'function',
      isPromise: obj instanceof Promise,
      keys: [],
      methods: [],
      properties: [],
      symbols: [],
      descriptors: {}
    };
    
    if (obj && typeof obj === 'object') {
      // Get all property names (including non-enumerable)
      const allKeys = Object.getOwnPropertyNames(obj);
      const enumKeys = Object.keys(obj);
      const symbols = Object.getOwnPropertySymbols(obj);
      
      analysis.keys = allKeys;
      analysis.symbols = symbols;
      
      // Categorize properties
      allKeys.forEach(key => {
        const descriptor = Object.getOwnPropertyDescriptor(obj, key);
        analysis.descriptors[key] = descriptor;
        
        if (typeof obj[key] === 'function') {
          analysis.methods.push({
            name: key,
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable
          });
        } else {
          analysis.properties.push({
            name: key,
            value: obj[key],
            type: typeof obj[key],
            enumerable: descriptor.enumerable,
            configurable: descriptor.configurable,
            writable: descriptor.writable
          });
        }
      });
      
      // Analyze symbols
      symbols.forEach(symbol => {
        const descriptor = Object.getOwnPropertyDescriptor(obj, symbol);
        analysis.descriptors[symbol] = descriptor;
      });
    }
    
    return analysis;
  }
  
  static printAnalysis(analysis) {
    console.log('Type:', analysis.type);
    console.log('Constructor:', analysis.constructor);
    console.log('Prototype:', analysis.prototype);
    console.log('Is Array:', analysis.isArray);
    console.log('Is Function:', analysis.isFunction);
    
    if (analysis.properties.length > 0) {
      console.log('\nProperties:');
      analysis.properties.forEach(prop => {
        console.log(`  ${prop.name}: ${prop.type} = ${JSON.stringify(prop.value)}`);
        console.log(`    enumerable: ${prop.enumerable}, writable: ${prop.writable}, configurable: ${prop.configurable}`);
      });
    }
    
    if (analysis.methods.length > 0) {
      console.log('\nMethods:');
      analysis.methods.forEach(method => {
        console.log(`  ${method.name}()`);
        console.log(`    enumerable: ${method.enumerable}, writable: ${method.writable}, configurable: ${method.configurable}`);
      });
    }
    
    if (analysis.symbols.length > 0) {
      console.log('\nSymbols:');
      analysis.symbols.forEach(symbol => {
        console.log(`  ${symbol.toString()}`);
      });
    }
  }
  
  static demonstrateObjectAnalysis() {
    // Test with different object types
    const testObjects = [
      { name: 'Plain Object', obj: { a: 1, b: 'test', c: () => 'method' } },
      { name: 'Array', obj: [1, 2, 3] },
      { name: 'Function', obj: function namedFunc() { return 'test'; } },
      { name: 'Class Instance', obj: new Date() },
      { name: 'Custom Class', obj: new (class CustomClass {
        constructor() {
          this.prop = 'value';
        }
        method() {
          return 'custom method';
        }
      })() }
    ];
    
    testObjects.forEach(({ name, obj }) => {
      const analysis = this.analyzeObjectStructure(obj, name);
      this.printAnalysis(analysis);
    });
  }
}

ObjectIntrospection.demonstrateObjectAnalysis();
```

## Prototype Chain Analysis

### Inheritance and Prototype Inspection

```javascript
// Analyze prototype chains and inheritance patterns
class PrototypeIntrospection {
  static analyzePrototypeChain(obj, name = 'object') {
    console.log(`\n=== ${name} Prototype Chain ===`);
    
    const chain = [];
    let current = obj;
    let depth = 0;
    
    while (current && depth < 10) { // Prevent infinite loops
      const proto = Object.getPrototypeOf(current);
      
      chain.push({
        depth: depth,
        constructor: current.constructor?.name || 'unknown',
        prototype: proto?.constructor?.name || 'null',
        ownProperties: Object.getOwnPropertyNames(current),
        methods: Object.getOwnPropertyNames(current).filter(
          key => typeof current[key] === 'function'
        )
      });
      
      current = proto;
      depth++;
      
      if (proto === null) break;
    }
    
    return chain;
  }
  
  static printPrototypeChain(chain) {
    chain.forEach(level => {
      const indent = '  '.repeat(level.depth);
      console.log(`${indent}Level ${level.depth}: ${level.constructor}`);
      console.log(`${indent}  Prototype: ${level.prototype}`);
      console.log(`${indent}  Own Properties: [${level.ownProperties.join(', ')}]`);
      console.log(`${indent}  Methods: [${level.methods.join(', ')}]`);
    });
  }
  
  static findMethodOrigin(obj, methodName) {
    console.log(`\n=== Finding origin of method '${methodName}' ===`);
    
    let current = obj;
    let depth = 0;
    
    while (current && depth < 10) {
      if (current.hasOwnProperty(methodName)) {
        console.log(`Method '${methodName}' found at level ${depth} (${current.constructor?.name || 'unknown'})`);
        return { level: depth, constructor: current.constructor?.name, object: current };
      }
      
      current = Object.getPrototypeOf(current);
      depth++;
      
      if (current === null) break;
    }
    
    console.log(`Method '${methodName}' not found in prototype chain`);
    return null;
  }
  
  static demonstratePrototypeAnalysis() {
    // Create inheritance hierarchy
    class Animal {
      constructor(name) {
        this.name = name;
      }
      
      speak() {
        return `${this.name} makes a sound`;
      }
      
      move() {
        return `${this.name} moves`;
      }
    }
    
    class Dog extends Animal {
      constructor(name, breed) {
        super(name);
        this.breed = breed;
      }
      
      speak() {
        return `${this.name} barks`;
      }
      
      wagTail() {
        return `${this.name} wags tail`;
      }
    }
    
    class Puppy extends Dog {
      constructor(name, breed, age) {
        super(name, breed);
        this.age = age;
      }
      
      play() {
        return `${this.name} plays`;
      }
    }
    
    const puppy = new Puppy('Rex', 'Golden Retriever', 6);
    
    // Analyze prototype chain
    const chain = this.analyzePrototypeChain(puppy, 'Puppy Instance');
    this.printPrototypeChain(chain);
    
    // Find method origins
    this.findMethodOrigin(puppy, 'speak');
    this.findMethodOrigin(puppy, 'move');
    this.findMethodOrigin(puppy, 'wagTail');
    this.findMethodOrigin(puppy, 'play');
    this.findMethodOrigin(puppy, 'toString');
  }
}

PrototypeIntrospection.demonstratePrototypeAnalysis();
```

## Runtime Code Analysis

### Dynamic Code Examination

```javascript
// Analyze code structure and behavior at runtime
class RuntimeCodeAnalysis {
  static analyzeCallStack() {
    console.log('\n=== Call Stack Analysis ===');
    
    function level1() {
      return level2();
    }
    
    function level2() {
      return level3();
    }
    
    function level3() {
      // Capture stack trace
      const error = new Error();
      const stack = error.stack;
      
      console.log('Current call stack:');
      console.log(stack);
      
      // Parse stack trace
      const stackLines = stack.split('\n').slice(1); // Remove error message
      const parsedStack = stackLines.map(line => {
        const match = line.match(/at\s+(.+?)\s+\((.+):(\d+):(\d+)\)/);
        if (match) {
          return {
            function: match[1],
            file: match[2],
            line: parseInt(match[3]),
            column: parseInt(match[4])
          };
        }
        return { raw: line.trim() };
      });
      
      console.log('\nParsed stack:');
      parsedStack.forEach((frame, index) => {
        if (frame.function) {
          console.log(`  ${index}: ${frame.function} at ${frame.file}:${frame.line}:${frame.column}`);
        } else {
          console.log(`  ${index}: ${frame.raw}`);
        }
      });
      
      return 'stack analyzed';
    }
    
    return level1();
  }
  
  static analyzeExecutionTime() {
    console.log('\n=== Execution Time Analysis ===');
    
    function createTimingWrapper(func, name) {
      return function(...args) {
        const start = performance.now();
        const result = func.apply(this, args);
        const end = performance.now();
        
        console.log(`${name} executed in ${(end - start).toFixed(4)}ms`);
        return result;
      };
    }
    
    // Test functions with different complexities
    const fastFunction = () => 42;
    const slowFunction = () => {
      let sum = 0;
      for (let i = 0; i < 100000; i++) {
        sum += Math.random();
      }
      return sum;
    };
    
    const timedFast = createTimingWrapper(fastFunction, 'Fast Function');
    const timedSlow = createTimingWrapper(slowFunction, 'Slow Function');
    
    // Execute and measure
    timedFast();
    timedSlow();
    
    // Measure multiple executions
    console.log('\nMultiple execution analysis:');
    const iterations = 5;
    
    for (let i = 0; i < iterations; i++) {
      timedFast();
    }
    
    for (let i = 0; i < iterations; i++) {
      timedSlow();
    }
  }
  
  static analyzeMemoryUsage() {
    console.log('\n=== Memory Usage Analysis ===');
    
    // Note: performance.memory is only available in some environments
    if (typeof performance !== 'undefined' && performance.memory) {
      const memBefore = performance.memory.usedJSHeapSize;
      
      // Create some objects to use memory
      const largeArray = new Array(100000).fill(0).map((_, i) => ({
        id: i,
        data: `item-${i}`,
        timestamp: Date.now()
      }));
      
      const memAfter = performance.memory.usedJSHeapSize;
      const memDiff = memAfter - memBefore;
      
      console.log(`Memory before: ${(memBefore / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Memory after: ${(memAfter / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Memory used: ${(memDiff / 1024 / 1024).toFixed(2)} MB`);
      
      // Clean up
      largeArray.length = 0;
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        console.log(`Memory after GC: ${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      }
    } else {
      console.log('Memory analysis not available in this environment');
    }
  }
  
  static analyzeFunctionComplexity(func) {
    console.log('\n=== Function Complexity Analysis ===');
    
    const funcString = func.toString();
    
    // Basic complexity metrics
    const metrics = {
      lines: funcString.split('\n').length,
      characters: funcString.length,
      cyclomaticComplexity: this.calculateCyclomaticComplexity(funcString),
      keywords: this.countKeywords(funcString),
      nesting: this.calculateNestingDepth(funcString)
    };
    
    console.log('Function complexity metrics:');
    console.log(`  Lines of code: ${metrics.lines}`);
    console.log(`  Characters: ${metrics.characters}`);
    console.log(`  Cyclomatic complexity: ${metrics.cyclomaticComplexity}`);
    console.log(`  Control flow keywords: ${metrics.keywords}`);
    console.log(`  Maximum nesting depth: ${metrics.nesting}`);
    
    return metrics;
  }
  
  static calculateCyclomaticComplexity(code) {
    // Count decision points (simplified)
    const patterns = [
      /\bif\b/g,
      /\belse\b/g,
      /\bwhile\b/g,
      /\bfor\b/g,
      /\bswitch\b/g,
      /\bcase\b/g,
      /\bcatch\b/g,
      /\?\s*.*?\s*:/g, // ternary operator
      /&&/g,
      /\|\|/g
    ];
    
    let complexity = 1; // Base complexity
    
    patterns.forEach(pattern => {
      const matches = code.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });
    
    return complexity;
  }
  
  static countKeywords(code) {
    const keywords = [
      'if', 'else', 'while', 'for', 'switch', 'case', 'break', 'continue',
      'return', 'throw', 'try', 'catch', 'finally', 'function', 'class'
    ];
    
    let count = 0;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      const matches = code.match(regex);
      if (matches) {
        count += matches.length;
      }
    });
    
    return count;
  }
  
  static calculateNestingDepth(code) {
    let maxDepth = 0;
    let currentDepth = 0;
    
    for (let i = 0; i < code.length; i++) {
      if (code[i] === '{') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (code[i] === '}') {
        currentDepth--;
      }
    }
    
    return maxDepth;
  }
  
  static demonstrate() {
    this.analyzeCallStack();
    this.analyzeExecutionTime();
    this.analyzeMemoryUsage();
    
    // Analyze a complex function
    function complexFunction(data) {
      if (!data) {
        return null;
      }
      
      const results = [];
      
      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        
        if (item.type === 'A') {
          if (item.value > 10) {
            results.push(item.value * 2);
          } else {
            results.push(item.value);
          }
        } else if (item.type === 'B') {
          try {
            const processed = item.value / 2;
            results.push(processed);
          } catch (error) {
            console.error('Processing error:', error);
          }
        } else {
          results.push(item.value || 0);
        }
      }
      
      return results.length > 0 ? results : null;
    }
    
    this.analyzeFunctionComplexity(complexFunction);
  }
}

RuntimeCodeAnalysis.demonstrate();
```

## Debugging and Development Tools

### Advanced Debugging Utilities

```javascript
// Create debugging and development utilities using introspection
class DebuggingUtilities {
  static createDebugWrapper(obj, name = 'object') {
    console.log(`\n=== Creating Debug Wrapper for ${name} ===`);
    
    return new Proxy(obj, {
      get(target, property, receiver) {
        const value = Reflect.get(target, property, receiver);
        
        if (typeof value === 'function') {
          return function(...args) {
            console.log(`🔍 Calling ${name}.${String(property)}(${args.map(arg => JSON.stringify(arg)).join(', ')})`);
            
            const start = performance.now();
            const result = value.apply(this, args);
            const end = performance.now();
            
            console.log(`✅ ${name}.${String(property)} returned:`, result);
            console.log(`⏱️  Execution time: ${(end - start).toFixed(4)}ms`);
            
            return result;
          };
        }
        
        console.log(`📖 Accessing ${name}.${String(property)}:`, value);
        return value;
      },
      
      set(target, property, value, receiver) {
        console.log(`✏️  Setting ${name}.${String(property)} = ${JSON.stringify(value)}`);
        return Reflect.set(target, property, value, receiver);
      }
    });
  }
  
  static createPropertyTracker(obj) {
    const accessLog = new Map();
    
    return new Proxy(obj, {
      get(target, property, receiver) {
        // Track property access
        if (!accessLog.has(property)) {
          accessLog.set(property, { reads: 0, writes: 0, lastAccess: null });
        }
        
        const stats = accessLog.get(property);
        stats.reads++;
        stats.lastAccess = new Date();
        
        return Reflect.get(target, property, receiver);
      },
      
      set(target, property, value, receiver) {
        // Track property writes
        if (!accessLog.has(property)) {
          accessLog.set(property, { reads: 0, writes: 0, lastAccess: null });
        }
        
        const stats = accessLog.get(property);
        stats.writes++;
        stats.lastAccess = new Date();
        
        return Reflect.set(target, property, value, receiver);
      },
      
      // Add method to get access statistics
      has(target, property) {
        if (property === 'getAccessStats') {
          return true;
        }
        return Reflect.has(target, property);
      },
      
      get(target, property, receiver) {
        if (property === 'getAccessStats') {
          return () => {
            const stats = {};
            for (const [prop, data] of accessLog) {
              stats[prop] = { ...data };
            }
            return stats;
          };
        }
        
        // Normal property access tracking
        if (!accessLog.has(property)) {
          accessLog.set(property, { reads: 0, writes: 0, lastAccess: null });
        }
        
        const stats = accessLog.get(property);
        stats.reads++;
        stats.lastAccess = new Date();
        
        return Reflect.get(target, property, receiver);
      }
    });
  }
  
  static demonstrate() {
    console.log('=== Debugging Utilities Demo ===');
    
    // Test debug wrapper
    const calculator = {
      add(a, b) {
        return a + b;
      },
      multiply(a, b) {
        return a * b;
      },
      value: 42
    };
    
    const debugCalculator = this.createDebugWrapper(calculator, 'Calculator');
    
    console.log('Testing debug wrapper:');
    debugCalculator.add(5, 3);
    debugCalculator.multiply(4, 7);
    console.log('Value:', debugCalculator.value);
    debugCalculator.value = 100;
    
    // Test property tracker
    console.log('\n--- Property Tracker Demo ---');
    const data = { x: 1, y: 2, z: 3 };
    const trackedData = this.createPropertyTracker(data);
    
    // Access properties
    console.log('x:', trackedData.x);
    console.log('y:', trackedData.y);
    console.log('x again:', trackedData.x);
    trackedData.z = 10;
    trackedData.newProp = 'new value';
    
    // Get access statistics
    console.log('Access statistics:', trackedData.getAccessStats());
  }
}

DebuggingUtilities.demonstrate();
```

## Key Takeaways

* **Function introspection** reveals parameter signatures, arity, and function types
* **Object structure analysis** provides deep insights into properties, methods, and descriptors
* **Prototype chain analysis** helps understand inheritance and method resolution
* **Runtime code analysis** enables performance monitoring and complexity measurement
* **Debugging utilities** can be built using Proxy for transparent object monitoring
* **Call stack analysis** helps with debugging and understanding execution flow
* **Memory usage tracking** assists in performance optimization
* **Property access tracking** provides insights into object usage patterns
* **Complexity analysis** helps identify code that may need refactoring
* **Introspection enables powerful meta-programming** and development tools
```
