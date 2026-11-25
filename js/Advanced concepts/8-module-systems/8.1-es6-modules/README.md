# **8.1 ES6 Modules (ESM)**

ES6 Modules are the native JavaScript module system introduced in ECMAScript 2015. They provide a standardized way to organize and share code with static import/export syntax that enables powerful optimizations like tree shaking.

## Basic Import/Export Syntax

### Named Exports and Imports

```javascript
// math.js - Named exports
export const PI = 3.14159;
export const E = 2.71828;

export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// Alternative syntax - export at the end
const subtract = (a, b) => a - b;
const divide = (a, b) => b !== 0 ? a / b : NaN;

export { subtract, divide };

// Renaming exports
const power = (base, exponent) => Math.pow(base, exponent);
export { power as pow };
```

```javascript
// main.js - Named imports
import { PI, E, add, multiply } from './math.js';

console.log('PI:', PI);
console.log('E:', E);
console.log('5 + 3 =', add(5, 3));
console.log('4 * 7 =', multiply(4, 7));

// Import with renaming
import { subtract as minus, divide as div, pow } from './math.js';

console.log('10 - 3 =', minus(10, 3));
console.log('15 / 3 =', div(15, 3));
console.log('2^8 =', pow(2, 8));

// Import all named exports
import * as MathUtils from './math.js';

console.log('Using namespace:', MathUtils.add(1, 2));
console.log('All exports:', Object.keys(MathUtils));
```

### Default Exports and Imports

```javascript
// calculator.js - Default export
class Calculator {
  constructor() {
    this.result = 0;
  }
  
  add(value) {
    this.result += value;
    return this;
  }
  
  subtract(value) {
    this.result -= value;
    return this;
  }
  
  multiply(value) {
    this.result *= value;
    return this;
  }
  
  divide(value) {
    if (value !== 0) {
      this.result /= value;
    }
    return this;
  }
  
  getValue() {
    return this.result;
  }
  
  reset() {
    this.result = 0;
    return this;
  }
}

// Default export
export default Calculator;

// You can also have named exports alongside default
export const version = '1.0.0';
export const author = 'Developer';
```

```javascript
// app.js - Default import
import Calculator from './calculator.js';
import { version, author } from './calculator.js';

// Or import both default and named
import Calculator, { version, author } from './calculator.js';

const calc = new Calculator();
const result = calc
  .add(10)
  .multiply(2)
  .subtract(5)
  .divide(3)
  .getValue();

console.log('Result:', result);
console.log('Calculator version:', version);
console.log('Author:', author);
```

## Advanced Export Patterns

### Re-exports and Barrel Exports

```javascript
// components/Button.js
export default class Button {
  constructor(text) {
    this.text = text;
  }
  
  render() {
    return `<button>${this.text}</button>`;
  }
}

export const ButtonTypes = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DANGER: 'danger'
};
```

```javascript
// components/Input.js
export default class Input {
  constructor(type = 'text') {
    this.type = type;
  }
  
  render() {
    return `<input type="${this.type}">`;
  }
}

export const InputTypes = {
  TEXT: 'text',
  EMAIL: 'email',
  PASSWORD: 'password',
  NUMBER: 'number'
};
```

```javascript
// components/index.js - Barrel export
export { default as Button, ButtonTypes } from './Button.js';
export { default as Input, InputTypes } from './Input.js';

// Re-export with renaming
export { default as UIButton } from './Button.js';

// Aggregate and re-export
export * from './Button.js';
export * from './Input.js';

// Create a combined export
import Button from './Button.js';
import Input from './Input.js';

export const Components = {
  Button,
  Input
};
```

```javascript
// main.js - Using barrel exports
import { Button, Input, ButtonTypes, InputTypes } from './components/index.js';

// Or import the aggregate
import { Components } from './components/index.js';

const button = new Button('Click me');
const input = new Input(InputTypes.EMAIL);

console.log(button.render());
console.log(input.render());
```

### Conditional Exports

```javascript
// config.js - Environment-based exports
const development = {
  apiUrl: 'http://localhost:3000',
  debug: true,
  logLevel: 'verbose'
};

const production = {
  apiUrl: 'https://api.example.com',
  debug: false,
  logLevel: 'error'
};

const testing = {
  apiUrl: 'http://test.example.com',
  debug: true,
  logLevel: 'info'
};

// Export based on environment
const env = process.env.NODE_ENV || 'development';

let config;
switch (env) {
  case 'production':
    config = production;
    break;
  case 'testing':
    config = testing;
    break;
  default:
    config = development;
}

export default config;
export { development, production, testing };

// Named export for current environment
export const currentEnv = env;
```

## Module Loading and Resolution

### Static vs Dynamic Analysis

```javascript
// static-imports.js - Static imports (analyzable at build time)
import { utils } from './utils.js';
import config from './config.js';

// These imports are hoisted and resolved at compile time
console.log('Static imports loaded');

// ❌ This won't work - imports must be at top level
if (someCondition) {
  // import { feature } from './feature.js'; // SyntaxError
}

// ❌ This won't work - import path must be string literal
const moduleName = 'utils';
// import { something } from moduleName; // SyntaxError
```

```javascript
// dynamic-imports.js - Dynamic imports (runtime loading)
async function loadModule() {
  // ✅ Dynamic imports work anywhere
  if (someCondition) {
    const { feature } = await import('./feature.js');
    return feature();
  }
  
  // ✅ Dynamic import paths can be variables
  const moduleName = './utils.js';
  const module = await import(moduleName);
  return module.default;
}

// ✅ Conditional loading
async function loadBasedOnUserRole(role) {
  switch (role) {
    case 'admin':
      return await import('./admin-features.js');
    case 'user':
      return await import('./user-features.js');
    default:
      return await import('./guest-features.js');
  }
}
```

### Module Resolution Examples

```javascript
// resolution-examples.js
// Relative imports
import { helper } from './utils/helper.js';           // Same directory
import { config } from '../config/app-config.js';    // Parent directory
import { component } from './components/Button.js';   // Subdirectory

// Absolute imports (with proper configuration)
import { library } from '/src/lib/library.js';

// Node modules (when using bundler)
import lodash from 'lodash';
import { debounce } from 'lodash';

// URL imports (supported in some environments)
import { something } from 'https://cdn.example.com/module.js';

// File extension handling
import data from './data.json';        // JSON import
import styles from './styles.css';     // CSS import (with bundler)
import worker from './worker.js?worker'; // Web Worker (with bundler)
```

## Tree Shaking and Dead Code Elimination

### Optimizable Code

```javascript
// tree-shakable.js - Tree-shakable exports
export const usedFunction = () => {
  return 'This will be included in bundle';
};

export const unusedFunction = () => {
  return 'This will be removed by tree shaking';
};

export const partiallyUsedObject = {
  usedMethod() {
    return 'This method is used';
  },
  unusedMethod() {
    return 'This method is not used';
  }
};

// Side-effect free exports are tree-shakable
export const pureFunction = (x) => x * 2;

// Functions with side effects are not tree-shakable
export const impureFunction = (x) => {
  console.log('Side effect!'); // This prevents tree shaking
  return x * 2;
};
```

```javascript
// consumer.js - Only imports what's needed
import { usedFunction, partiallyUsedObject } from './tree-shakable.js';

// Only usedFunction and partiallyUsedObject will be included
console.log(usedFunction());
console.log(partiallyUsedObject.usedMethod());

// unusedFunction will be eliminated by tree shaking
```

### Tree Shaking Best Practices

```javascript
// good-for-tree-shaking.js
// ✅ Use named exports
export const function1 = () => 'function1';
export const function2 = () => 'function2';

// ✅ Avoid side effects in module scope
const privateHelper = () => 'helper';

export const publicFunction = () => {
  return privateHelper();
};

// ✅ Use pure functions
export const add = (a, b) => a + b;
export const multiply = (a, b) => a * b;
```

```javascript
// bad-for-tree-shaking.js
// ❌ Side effects prevent tree shaking
console.log('Module loaded!'); // Side effect

// ❌ Default export of object prevents granular tree shaking
export default {
  function1: () => 'function1',
  function2: () => 'function2',
  function3: () => 'function3'
};

// ❌ Modifying global objects
window.myGlobal = 'value'; // Side effect

// ❌ Immediately invoked functions
(function() {
  // This runs when module loads
  console.log('IIFE executed');
})();
```

## Module Patterns and Best Practices

### Singleton Pattern with Modules

```javascript
// singleton-service.js
class ApiService {
  constructor() {
    if (ApiService.instance) {
      return ApiService.instance;
    }
    
    this.baseUrl = 'https://api.example.com';
    this.cache = new Map();
    ApiService.instance = this;
  }
  
  async get(endpoint) {
    if (this.cache.has(endpoint)) {
      return this.cache.get(endpoint);
    }
    
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    const data = await response.json();
    this.cache.set(endpoint, data);
    return data;
  }
  
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export default new ApiService();

// Also export class for testing
export { ApiService };
```

### Factory Pattern with Modules

```javascript
// logger-factory.js
class Logger {
  constructor(level, prefix) {
    this.level = level;
    this.prefix = prefix;
  }
  
  log(message) {
    if (this.shouldLog('log')) {
      console.log(`[${this.prefix}] ${message}`);
    }
  }
  
  warn(message) {
    if (this.shouldLog('warn')) {
      console.warn(`[${this.prefix}] ${message}`);
    }
  }
  
  error(message) {
    if (this.shouldLog('error')) {
      console.error(`[${this.prefix}] ${message}`);
    }
  }
  
  shouldLog(type) {
    const levels = { error: 0, warn: 1, log: 2, debug: 3 };
    return levels[type] <= levels[this.level];
  }
}

// Factory function
export function createLogger(options = {}) {
  const { level = 'log', prefix = 'APP' } = options;
  return new Logger(level, prefix);
}

// Pre-configured loggers
export const appLogger = createLogger({ prefix: 'APP', level: 'log' });
export const dbLogger = createLogger({ prefix: 'DB', level: 'warn' });
export const apiLogger = createLogger({ prefix: 'API', level: 'debug' });

// Export class for advanced usage
export { Logger };
```

## Key Takeaways

* **ES6 modules provide static analysis** enabling tree shaking and optimization
* **Named exports are preferred** for better tree shaking and explicit imports
* **Default exports work well** for single-purpose modules and classes
* **Barrel exports simplify** importing from multiple related modules
* **Circular dependencies should be avoided** or resolved with shared modules
* **Static imports are hoisted** and resolved at compile time
* **Module resolution follows** predictable rules for relative and absolute paths
* **Tree shaking eliminates unused code** when using named exports properly
* **Testing modules requires** proper mocking and isolation strategies
* **ES6 modules are the future** of JavaScript module systems
