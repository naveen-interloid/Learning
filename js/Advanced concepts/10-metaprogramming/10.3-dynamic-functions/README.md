# **10.3 Dynamic Function Creation**

Dynamic function creation allows you to generate and compile functions at runtime, enabling powerful code generation, templating systems, and adaptive programming patterns.

## Function Constructor

### Basic Function Creation

```javascript
// Creating functions dynamically with Function constructor
class DynamicFunctionBasics {
  static basicFunctionCreation() {
    console.log('=== Basic Function Creation ===');
    
    // Simple function creation
    const add = new Function('a', 'b', 'return a + b');
    console.log('Dynamic add function:', add(5, 3));
    
    // Function with multiple statements
    const greet = new Function('name', `
      const greeting = 'Hello, ' + name + '!';
      console.log(greeting);
      return greeting;
    `);
    console.log('Dynamic greet result:', greet('World'));
    
    // Function with no parameters
    const getCurrentTime = new Function('return new Date().toISOString()');
    console.log('Current time:', getCurrentTime());
    
    // Function with complex logic
    const factorial = new Function('n', `
      if (n <= 1) return 1;
      let result = 1;
      for (let i = 2; i <= n; i++) {
        result *= i;
      }
      return result;
    `);
    console.log('Factorial of 5:', factorial(5));
  }
  
  static functionWithClosures() {
    console.log('\n=== Functions with Closures ===');
    
    // Dynamic function that creates closures
    function createCounter(initial = 0) {
      const counterCode = `
        let count = ${initial};
        return function() {
          return ++count;
        };
      `;
      
      return new Function(counterCode)();
    }
    
    const counter1 = createCounter(10);
    const counter2 = createCounter(100);
    
    console.log('Counter 1:', counter1(), counter1(), counter1());
    console.log('Counter 2:', counter2(), counter2());
  }
  
  static parametricFunctions() {
    console.log('\n=== Parametric Functions ===');
    
    // Create functions based on parameters
    function createMathFunction(operation, operand) {
      const operations = {
        add: `return x + ${operand}`,
        multiply: `return x * ${operand}`,
        power: `return Math.pow(x, ${operand})`,
        modulo: `return x % ${operand}`
      };
      
      if (!operations[operation]) {
        throw new Error(`Unknown operation: ${operation}`);
      }
      
      return new Function('x', operations[operation]);
    }
    
    const add10 = createMathFunction('add', 10);
    const multiply3 = createMathFunction('multiply', 3);
    const square = createMathFunction('power', 2);
    
    console.log('add10(5):', add10(5));
    console.log('multiply3(7):', multiply3(7));
    console.log('square(4):', square(4));
  }
}

DynamicFunctionBasics.basicFunctionCreation();
DynamicFunctionBasics.functionWithClosures();
DynamicFunctionBasics.parametricFunctions();
```

## Code Generation Patterns

### Template-based Code Generation

```javascript
// Advanced code generation using templates
class CodeGenerator {
  static createValidatorFunction(schema) {
    let code = `
      return function validate(obj) {
        const errors = [];
        
    `;
    
    for (const [field, rules] of Object.entries(schema)) {
      code += `
        // Validate ${field}
        if (obj.${field} === undefined || obj.${field} === null) {
          ${rules.required ? `errors.push('${field} is required');` : ''}
        } else {
      `;
      
      if (rules.type) {
        code += `
          if (typeof obj.${field} !== '${rules.type}') {
            errors.push('${field} must be of type ${rules.type}');
          }
        `;
      }
      
      if (rules.min !== undefined) {
        code += `
          if (obj.${field} < ${rules.min}) {
            errors.push('${field} must be >= ${rules.min}');
          }
        `;
      }
      
      if (rules.max !== undefined) {
        code += `
          if (obj.${field} > ${rules.max}) {
            errors.push('${field} must be <= ${rules.max}');
          }
        `;
      }
      
      if (rules.pattern) {
        code += `
          if (!/${rules.pattern.source}/${rules.pattern.flags}.test(obj.${field})) {
            errors.push('${field} format is invalid');
          }
        `;
      }
      
      code += `}`;
    }
    
    code += `
        return {
          valid: errors.length === 0,
          errors: errors
        };
      };
    `;
    
    return new Function(code)();
  }
  
  static createQueryBuilder(tableName, fields) {
    const selectCode = `
      return {
        select: function(columns = '*') {
          this._select = Array.isArray(columns) ? columns.join(', ') : columns;
          return this;
        },
        
        where: function(condition) {
          this._where = this._where ? this._where + ' AND ' + condition : condition;
          return this;
        },
        
        orderBy: function(column, direction = 'ASC') {
          this._orderBy = column + ' ' + direction;
          return this;
        },
        
        limit: function(count) {
          this._limit = count;
          return this;
        },
        
        build: function() {
          let query = 'SELECT ' + (this._select || '*') + ' FROM ${tableName}';
          
          if (this._where) {
            query += ' WHERE ' + this._where;
          }
          
          if (this._orderBy) {
            query += ' ORDER BY ' + this._orderBy;
          }
          
          if (this._limit) {
            query += ' LIMIT ' + this._limit;
          }
          
          return query;
        },
        
        _select: null,
        _where: null,
        _orderBy: null,
        _limit: null
      };
    `;
    
    return new Function(selectCode)();
  }
  
  static demonstrate() {
    console.log('=== Code Generation Patterns ===');
    
    // Test validator generation
    const userSchema = {
      name: { type: 'string', required: true },
      age: { type: 'number', required: true, min: 0, max: 150 },
      email: { 
        type: 'string', 
        required: true, 
        pattern: { source: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', flags: '' }
      }
    };
    
    const validateUser = this.createValidatorFunction(userSchema);
    
    const validUser = { name: 'John', age: 30, email: 'john@example.com' };
    const invalidUser = { name: 'Jane', age: 200, email: 'invalid' };
    
    console.log('Valid user:', validateUser(validUser));
    console.log('Invalid user:', validateUser(invalidUser));
    
    // Test query builder generation
    const userQuery = this.createQueryBuilder('users', ['id', 'name', 'email']);
    
    const query = userQuery
      .select(['name', 'email'])
      .where('age > 18')
      .where('active = 1')
      .orderBy('name', 'ASC')
      .limit(10)
      .build();
    
    console.log('Generated query:', query);
  }
}

CodeGenerator.demonstrate();
```

### Runtime Function Compilation

```javascript
// Compile functions at runtime based on configuration
class RuntimeCompiler {
  static createCalculator(operations) {
    let code = `
      return {
    `;
    
    for (const [name, config] of Object.entries(operations)) {
      const { params, body, description } = config;
      
      code += `
        ${name}: function(${params.join(', ')}) {
          // ${description}
          ${body}
        },
      `;
    }
    
    code += `
      };
    `;
    
    return new Function(code)();
  }
  
  static createStateMachine(states, transitions) {
    let code = `
      return function StateMachine(initialState) {
        let currentState = initialState || '${Object.keys(states)[0]}';
        const states = ${JSON.stringify(states)};
        const transitions = ${JSON.stringify(transitions)};
        
        return {
          getCurrentState() {
            return currentState;
          },
          
          canTransition(event) {
            const stateTransitions = transitions[currentState];
            return stateTransitions && stateTransitions[event];
          },
          
          transition(event) {
            if (!this.canTransition(event)) {
              throw new Error(\`Cannot transition from \${currentState} with event \${event}\`);
            }
            
            const newState = transitions[currentState][event];
            const oldState = currentState;
            currentState = newState;
            
            // Execute state actions
            if (states[newState] && states[newState].onEnter) {
              states[newState].onEnter(oldState, newState);
            }
            
            return newState;
          },
          
          getAvailableEvents() {
            const stateTransitions = transitions[currentState];
            return stateTransitions ? Object.keys(stateTransitions) : [];
          }
        };
      };
    `;
    
    return new Function(code)();
  }
  
  static demonstrate() {
    console.log('\n=== Runtime Function Compilation ===');
    
    // Create a calculator with dynamic operations
    const mathOperations = {
      add: {
        params: ['a', 'b'],
        body: 'return a + b;',
        description: 'Add two numbers'
      },
      multiply: {
        params: ['a', 'b'],
        body: 'return a * b;',
        description: 'Multiply two numbers'
      },
      power: {
        params: ['base', 'exponent'],
        body: 'return Math.pow(base, exponent);',
        description: 'Raise base to the power of exponent'
      },
      factorial: {
        params: ['n'],
        body: `
          if (n <= 1) return 1;
          let result = 1;
          for (let i = 2; i <= n; i++) {
            result *= i;
          }
          return result;
        `,
        description: 'Calculate factorial'
      }
    };
    
    const calculator = this.createCalculator(mathOperations);
    
    console.log('Calculator operations:');
    console.log('add(5, 3):', calculator.add(5, 3));
    console.log('multiply(4, 7):', calculator.multiply(4, 7));
    console.log('power(2, 8):', calculator.power(2, 8));
    console.log('factorial(5):', calculator.factorial(5));
    
    // Create a state machine
    const doorStates = {
      closed: { onEnter: () => console.log('Door is now closed') },
      open: { onEnter: () => console.log('Door is now open') },
      locked: { onEnter: () => console.log('Door is now locked') }
    };
    
    const doorTransitions = {
      closed: { open: 'open', lock: 'locked' },
      open: { close: 'closed' },
      locked: { unlock: 'closed' }
    };
    
    const createDoorStateMachine = this.createStateMachine(doorStates, doorTransitions);
    const door = createDoorStateMachine('closed');
    
    console.log('\nState machine demo:');
    console.log('Initial state:', door.getCurrentState());
    console.log('Available events:', door.getAvailableEvents());
    
    door.transition('open');
    console.log('After opening:', door.getCurrentState());
    
    door.transition('close');
    door.transition('lock');
    console.log('After locking:', door.getCurrentState());
  }
}

RuntimeCompiler.demonstrate();
```

## Security Considerations

### Safe Dynamic Function Creation

```javascript
// Secure patterns for dynamic function creation
class SecureDynamicFunctions {
  static createSafeEvaluator(allowedOperations = []) {
    // Whitelist approach for safe evaluation
    const safeOperations = new Set(allowedOperations);
    
    return function safeEval(expression) {
      // Basic validation
      if (typeof expression !== 'string') {
        throw new Error('Expression must be a string');
      }
      
      // Check for dangerous patterns
      const dangerousPatterns = [
        /eval\s*\(/,
        /Function\s*\(/,
        /constructor/,
        /prototype/,
        /__proto__/,
        /import\s*\(/,
        /require\s*\(/,
        /process/,
        /global/,
        /window/,
        /document/
      ];
      
      for (const pattern of dangerousPatterns) {
        if (pattern.test(expression)) {
          throw new Error(`Dangerous pattern detected: ${pattern}`);
        }
      }
      
      // Create safe context
      const safeContext = {
        Math: Math,
        parseInt: parseInt,
        parseFloat: parseFloat,
        isNaN: isNaN,
        isFinite: isFinite
      };
      
      // Add allowed operations
      for (const op of allowedOperations) {
        if (typeof window !== 'undefined' && window[op]) {
          safeContext[op] = window[op];
        }
      }
      
      // Create function with limited scope
      const contextKeys = Object.keys(safeContext);
      const contextValues = Object.values(safeContext);
      
      try {
        const func = new Function(...contextKeys, `return (${expression})`);
        return func(...contextValues);
      } catch (error) {
        throw new Error(`Evaluation failed: ${error.message}`);
      }
    };
  }
  
  static createTemplateEngine(options = {}) {
    const { 
      allowedHelpers = [],
      maxIterations = 1000,
      timeout = 5000 
    } = options;
    
    return function renderTemplate(template, data) {
      // Sanitize template
      const sanitizedTemplate = template
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
      
      // Create safe rendering context
      const context = {
        data: data || {},
        helpers: {},
        _iterations: 0,
        _maxIterations: maxIterations
      };
      
      // Add allowed helpers
      for (const helper of allowedHelpers) {
        if (typeof helper === 'function') {
          context.helpers[helper.name] = helper;
        }
      }
      
      // Simple template processing (basic example)
      let processed = sanitizedTemplate.replace(
        /\{\{([^}]+)\}\}/g,
        (match, expression) => {
          try {
            // Very basic expression evaluation
            const trimmed = expression.trim();
            if (trimmed.startsWith('data.')) {
              const path = trimmed.substring(5);
              return this.getNestedValue(data, path) || '';
            }
            return '';
          } catch (error) {
            return `[Error: ${error.message}]`;
          }
        }
      );
      
      return processed;
    };
  }
  
  static getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
  
  static demonstrate() {
    console.log('\n=== Secure Dynamic Functions ===');
    
    // Test safe evaluator
    const safeEval = this.createSafeEvaluator(['Math']);
    
    try {
      console.log('Safe math:', safeEval('Math.sqrt(16) + Math.pow(2, 3)'));
      console.log('Safe arithmetic:', safeEval('(5 + 3) * 2'));
      
      // This should fail
      safeEval('eval("alert(1)")');
    } catch (error) {
      console.log('Security check passed:', error.message);
    }
    
    // Test template engine
    const renderTemplate = this.createTemplateEngine({
      allowedHelpers: [
        function uppercase(str) { return str.toUpperCase(); }
      ]
    });
    
    const template = 'Hello {{data.name}}, you are {{data.age}} years old!';
    const data = { name: 'Alice', age: 25 };
    
    console.log('Template result:', renderTemplate(template, data));
  }
}

SecureDynamicFunctions.demonstrate();
```

## Performance Optimization

### Function Caching and Memoization

```javascript
// Optimize dynamic function creation with caching
class FunctionOptimization {
  static createMemoizedFunctionFactory() {
    const cache = new Map();
    
    return function createFunction(signature, body) {
      const key = `${signature}:${body}`;
      
      if (cache.has(key)) {
        console.log('Cache hit for function:', signature);
        return cache.get(key);
      }
      
      console.log('Creating new function:', signature);
      const func = new Function(signature, body);
      cache.set(key, func);
      
      return func;
    };
  }
  
  static createOptimizedCalculator() {
    const functionFactory = this.createMemoizedFunctionFactory();
    
    return {
      createOperation(name, params, body) {
        const signature = params.join(', ');
        return functionFactory(signature, body);
      },
      
      // Pre-compiled common operations
      add: functionFactory('a, b', 'return a + b'),
      subtract: functionFactory('a, b', 'return a - b'),
      multiply: functionFactory('a, b', 'return a * b'),
      divide: functionFactory('a, b', 'return b !== 0 ? a / b : NaN')
    };
  }
  
  static benchmarkFunctionCreation() {
    console.log('\n=== Function Creation Benchmark ===');
    
    const iterations = 10000;
    
    // Benchmark without caching
    console.time('Without caching');
    for (let i = 0; i < iterations; i++) {
      new Function('x', 'return x * 2');
    }
    console.timeEnd('Without caching');
    
    // Benchmark with caching
    const cachedFactory = this.createMemoizedFunctionFactory();
    console.time('With caching');
    for (let i = 0; i < iterations; i++) {
      cachedFactory('x', 'return x * 2');
    }
    console.timeEnd('With caching');
  }
  
  static demonstrate() {
    console.log('\n=== Function Optimization ===');
    
    const calculator = this.createOptimizedCalculator();
    
    // Test pre-compiled operations
    console.log('Pre-compiled add:', calculator.add(5, 3));
    console.log('Pre-compiled multiply:', calculator.multiply(4, 7));
    
    // Create custom operations (will be cached)
    const power = calculator.createOperation('power', ['base', 'exp'], 
      'return Math.pow(base, exp)');
    const power2 = calculator.createOperation('power', ['base', 'exp'], 
      'return Math.pow(base, exp)'); // Should hit cache
    
    console.log('Custom power operation:', power(2, 8));
    console.log('Same function from cache:', power === power2);
    
    // Benchmark
    this.benchmarkFunctionCreation();
  }
}

FunctionOptimization.demonstrate();
```

## Best Practices

### Dynamic Function Best Practices

```javascript
// Best practices for dynamic function creation
class DynamicFunctionBestPractices {
  static demonstrate() {
    console.log('\n=== Dynamic Function Best Practices ===');
    
    // ✅ Good: Validate inputs
    function createSafeFunction(params, body) {
      if (!Array.isArray(params)) {
        throw new Error('Parameters must be an array');
      }
      
      if (typeof body !== 'string') {
        throw new Error('Function body must be a string');
      }
      
      // Validate parameter names
      const validParamRegex = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
      for (const param of params) {
        if (!validParamRegex.test(param)) {
          throw new Error(`Invalid parameter name: ${param}`);
        }
      }
      
      return new Function(...params, body);
    }
    
    // ✅ Good: Use templates for complex code generation
    function createValidatorFromTemplate(fieldName, rules) {
      const template = `
        function validate${fieldName}(value) {
          const errors = [];
          
          ${rules.required ? `
            if (value == null) {
              errors.push('${fieldName} is required');
            }
          ` : ''}
          
          ${rules.type ? `
            if (value != null && typeof value !== '${rules.type}') {
              errors.push('${fieldName} must be of type ${rules.type}');
            }
          ` : ''}
          
          return {
            valid: errors.length === 0,
            errors: errors
          };
        }
        
        return validate${fieldName};
      `;
      
      return new Function(template)();
    }
    
    // ✅ Good: Cache generated functions
    const functionCache = new Map();
    
    function getCachedFunction(key, generator) {
      if (functionCache.has(key)) {
        return functionCache.get(key);
      }
      
      const func = generator();
      functionCache.set(key, func);
      return func;
    }
    
    // Test the practices
    try {
      const safeAdd = createSafeFunction(['a', 'b'], 'return a + b');
      console.log('Safe function created:', safeAdd(5, 3));
      
      const nameValidator = createValidatorFromTemplate('Name', {
        required: true,
        type: 'string'
      });
      
      console.log('Validator result:', nameValidator('John'));
      console.log('Validator result (invalid):', nameValidator(null));
      
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
  
  static avoidCommonMistakes() {
    console.log('\n=== Common Mistakes to Avoid ===');
    
    // ❌ Bad: Using eval instead of Function constructor
    console.log('❌ Never use eval() for dynamic code execution');
    
    // ❌ Bad: Not validating input
    console.log('❌ Always validate parameters and function body');
    
    // ❌ Bad: Creating functions in loops without caching
    console.log('❌ Cache generated functions to avoid performance issues');
    
    // ❌ Bad: Not handling errors in generated functions
    console.log('❌ Include error handling in generated function bodies');
    
    // ❌ Bad: Exposing dangerous globals in function scope
    console.log('❌ Limit scope access in dynamically created functions');
  }
}

DynamicFunctionBestPractices.demonstrate();
DynamicFunctionBestPractices.avoidCommonMistakes();
```

## Key Takeaways

* **Function constructor** enables runtime function creation
* **Code generation** allows building functions from templates
* **Security validation** is crucial when creating functions from user input
* **Caching generated functions** improves performance significantly
* **Template-based generation** provides cleaner, more maintainable code
* **Avoid eval()** - use Function constructor for safer dynamic execution
* **Validate all inputs** before creating dynamic functions
* **Consider performance implications** of frequent function creation
* **Use appropriate scoping** to limit access to dangerous globals
* **Handle errors gracefully** in both generation and execution phases
