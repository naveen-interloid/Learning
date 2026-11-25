# **8.2 CommonJS & AMD**

CommonJS and AMD (Asynchronous Module Definition) are legacy module systems that preceded ES6 modules. Understanding these systems is crucial for working with Node.js applications and legacy browser code.

## CommonJS (Node.js Modules)

### Basic CommonJS Syntax

```javascript
// math-utils.js - CommonJS exports
const PI = 3.14159;
const E = 2.71828;

function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

function subtract(a, b) {
  return a - b;
}

// Named exports using module.exports
module.exports = {
  PI,
  E,
  add,
  multiply,
  subtract
};

// Alternative: individual exports
// exports.PI = PI;
// exports.add = add;
// exports.multiply = multiply;
```

```javascript
// calculator.js - CommonJS class export
class Calculator {
  constructor() {
    this.result = 0;
  }
  
  add(value) {
    this.result += value;
    return this;
  }
  
  multiply(value) {
    this.result *= value;
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

// Default export (single export)
module.exports = Calculator;

// Or with additional metadata
module.exports = Calculator;
module.exports.version = '1.0.0';
module.exports.author = 'Developer';
```

```javascript
// main.js - CommonJS imports
const { PI, add, multiply } = require('./math-utils');
const Calculator = require('./calculator');

console.log('PI:', PI);
console.log('5 + 3 =', add(5, 3));
console.log('4 * 7 =', multiply(4, 7));

const calc = new Calculator();
const result = calc.add(10).multiply(2).getValue();
console.log('Calculator result:', result);

// Import entire module
const mathUtils = require('./math-utils');
console.log('All math utils:', Object.keys(mathUtils));

// Dynamic requires (runtime loading)
function loadModule(moduleName) {
  try {
    return require(moduleName);
  } catch (error) {
    console.error(`Failed to load module: ${moduleName}`, error);
    return null;
  }
}

const dynamicModule = loadModule('./optional-module');
```

### Advanced CommonJS Patterns

```javascript
// config-manager.js - Configuration module
const fs = require('fs');
const path = require('path');

class ConfigManager {
  constructor() {
    this.config = {};
    this.configPath = path.join(process.cwd(), 'config.json');
    this.loadConfig();
  }
  
  loadConfig() {
    try {
      if (fs.existsSync(this.configPath)) {
        const configData = fs.readFileSync(this.configPath, 'utf8');
        this.config = JSON.parse(configData);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      this.config = this.getDefaultConfig();
    }
  }
  
  getDefaultConfig() {
    return {
      port: 3000,
      host: 'localhost',
      debug: false
    };
  }
  
  get(key) {
    return this.config[key];
  }
  
  set(key, value) {
    this.config[key] = value;
    this.saveConfig();
  }
  
  saveConfig() {
    try {
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }
}

// Export singleton instance
module.exports = new ConfigManager();

// Also export the class
module.exports.ConfigManager = ConfigManager;
```

```javascript
// logger.js - Logger with different levels
const util = require('util');

const LogLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor(level = LogLevels.INFO, prefix = '') {
    this.level = level;
    this.prefix = prefix;
  }
  
  error(...args) {
    if (this.level >= LogLevels.ERROR) {
      console.error(this.formatMessage('ERROR', ...args));
    }
  }
  
  warn(...args) {
    if (this.level >= LogLevels.WARN) {
      console.warn(this.formatMessage('WARN', ...args));
    }
  }
  
  info(...args) {
    if (this.level >= LogLevels.INFO) {
      console.info(this.formatMessage('INFO', ...args));
    }
  }
  
  debug(...args) {
    if (this.level >= LogLevels.DEBUG) {
      console.log(this.formatMessage('DEBUG', ...args));
    }
  }
  
  formatMessage(level, ...args) {
    const timestamp = new Date().toISOString();
    const prefix = this.prefix ? `[${this.prefix}] ` : '';
    const message = args.map(arg => 
      typeof arg === 'object' ? util.inspect(arg) : String(arg)
    ).join(' ');
    
    return `${timestamp} ${prefix}[${level}] ${message}`;
  }
}

// Factory function
function createLogger(options = {}) {
  const { level = LogLevels.INFO, prefix = '' } = options;
  return new Logger(level, prefix);
}

// Exports
module.exports = {
  Logger,
  LogLevels,
  createLogger,
  // Default logger instance
  default: createLogger()
};
```

### Module Caching in CommonJS

```javascript
// cached-module.js - Demonstrates module caching
console.log('Module loaded and executed');

let counter = 0;

function increment() {
  return ++counter;
}

function getCounter() {
  return counter;
}

module.exports = {
  increment,
  getCounter
};
```

```javascript
// cache-demo.js - Shows how modules are cached
const module1 = require('./cached-module');
const module2 = require('./cached-module'); // Same instance (cached)

console.log('First require:', module1.increment()); // 1
console.log('Second require:', module2.increment()); // 2 (same instance)
console.log('Are they the same?', module1 === module2); // true

// Clear module cache (for testing purposes)
delete require.cache[require.resolve('./cached-module')];
const module3 = require('./cached-module'); // Fresh instance
console.log('After cache clear:', module3.getCounter()); // 0
```

## AMD (Asynchronous Module Definition)

### Basic AMD Syntax with RequireJS

```javascript
// math-utils.js - AMD module definition
define('mathUtils', [], function() {
  const PI = 3.14159;
  const E = 2.71828;
  
  function add(a, b) {
    return a + b;
  }
  
  function multiply(a, b) {
    return a * b;
  }
  
  function subtract(a, b) {
    return a - b;
  }
  
  // Return public API
  return {
    PI: PI,
    E: E,
    add: add,
    multiply: multiply,
    subtract: subtract
  };
});
```

```javascript
// calculator.js - AMD module with dependencies
define('calculator', ['mathUtils'], function(mathUtils) {
  function Calculator() {
    this.result = 0;
  }
  
  Calculator.prototype.add = function(value) {
    this.result = mathUtils.add(this.result, value);
    return this;
  };
  
  Calculator.prototype.multiply = function(value) {
    this.result = mathUtils.multiply(this.result, value);
    return this;
  };
  
  Calculator.prototype.getValue = function() {
    return this.result;
  };
  
  Calculator.prototype.reset = function() {
    this.result = 0;
    return this;
  };
  
  return Calculator;
});
```

```javascript
// main.js - AMD module consumption
require(['calculator', 'mathUtils'], function(Calculator, mathUtils) {
  console.log('PI:', mathUtils.PI);
  console.log('5 + 3 =', mathUtils.add(5, 3));
  
  const calc = new Calculator();
  const result = calc.add(10).multiply(2).getValue();
  console.log('Calculator result:', result);
});
```

### RequireJS Configuration

```javascript
// require-config.js - RequireJS configuration
require.config({
  baseUrl: 'js',
  paths: {
    'jquery': 'lib/jquery-3.6.0.min',
    'lodash': 'lib/lodash.min',
    'backbone': 'lib/backbone-min',
    'utils': 'modules/utils',
    'components': 'modules/components'
  },
  shim: {
    'backbone': {
      deps: ['jquery', 'lodash'],
      exports: 'Backbone'
    },
    'jquery-plugin': {
      deps: ['jquery'],
      exports: 'jQuery.fn.plugin'
    }
  },
  waitSeconds: 15
});

// Start the application
require(['app'], function(App) {
  App.initialize();
});
```

### Advanced AMD Patterns

```javascript
// plugin-system.js - AMD plugin system
define('pluginSystem', [], function() {
  const plugins = {};
  const hooks = {};
  
  function registerPlugin(name, plugin) {
    plugins[name] = plugin;
    
    // Initialize plugin if it has an init method
    if (typeof plugin.init === 'function') {
      plugin.init();
    }
    
    console.log(`Plugin '${name}' registered`);
  }
  
  function getPlugin(name) {
    return plugins[name];
  }
  
  function addHook(hookName, callback) {
    if (!hooks[hookName]) {
      hooks[hookName] = [];
    }
    hooks[hookName].push(callback);
  }
  
  function executeHook(hookName, ...args) {
    if (hooks[hookName]) {
      hooks[hookName].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Hook '${hookName}' error:`, error);
        }
      });
    }
  }
  
  return {
    registerPlugin: registerPlugin,
    getPlugin: getPlugin,
    addHook: addHook,
    executeHook: executeHook
  };
});
```

```javascript
// async-loader.js - Asynchronous module loader
define('asyncLoader', [], function() {
  function loadModule(moduleName) {
    return new Promise((resolve, reject) => {
      require([moduleName], function(module) {
        resolve(module);
      }, function(error) {
        reject(error);
      });
    });
  }
  
  function loadModules(moduleNames) {
    return Promise.all(moduleNames.map(loadModule));
  }
  
  function loadModuleConditionally(condition, moduleName) {
    if (condition) {
      return loadModule(moduleName);
    }
    return Promise.resolve(null);
  }
  
  return {
    loadModule: loadModule,
    loadModules: loadModules,
    loadModuleConditionally: loadModuleConditionally
  };
});

// Usage
require(['asyncLoader'], function(asyncLoader) {
  // Load module based on condition
  const isAdmin = checkUserRole();
  
  asyncLoader.loadModuleConditionally(isAdmin, 'adminPanel')
    .then(function(adminPanel) {
      if (adminPanel) {
        adminPanel.initialize();
      }
    })
    .catch(function(error) {
      console.error('Failed to load admin panel:', error);
    });
});
```

## UMD (Universal Module Definition)

### UMD Pattern Implementation

```javascript
// umd-module.js - Universal Module Definition
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['dependency'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS
    module.exports = factory(require('dependency'));
  } else {
    // Browser globals
    root.MyModule = factory(root.Dependency);
  }
}(typeof self !== 'undefined' ? self : this, function (dependency) {
  'use strict';
  
  function MyModule(options) {
    this.options = options || {};
    this.dependency = dependency;
  }
  
  MyModule.prototype.doSomething = function() {
    return 'Module doing something with ' + this.dependency.name;
  };
  
  MyModule.prototype.configure = function(newOptions) {
    this.options = Object.assign(this.options, newOptions);
    return this;
  };
  
  // Static method
  MyModule.version = '1.0.0';
  
  return MyModule;
}));
```

### UMD with Multiple Dependencies

```javascript
// complex-umd.js - UMD with multiple dependencies
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD
    define(['jquery', 'lodash', 'backbone'], factory);
  } else if (typeof exports === 'object') {
    // CommonJS
    module.exports = factory(
      require('jquery'),
      require('lodash'),
      require('backbone')
    );
  } else {
    // Browser globals
    root.ComplexModule = factory(root.$, root._, root.Backbone);
  }
}(typeof self !== 'undefined' ? self : this, function ($, _, Backbone) {
  'use strict';
  
  const ComplexModule = Backbone.View.extend({
    initialize: function(options) {
      this.options = _.defaults(options || {}, {
        autoRender: true,
        template: null
      });
      
      if (this.options.autoRender) {
        this.render();
      }
    },
    
    render: function() {
      if (this.options.template) {
        const html = _.template(this.options.template)(this.model.toJSON());
        this.$el.html(html);
      }
      return this;
    },
    
    events: {
      'click .btn': 'handleClick'
    },
    
    handleClick: function(event) {
      event.preventDefault();
      this.trigger('button:clicked', $(event.currentTarget));
    }
  });
  
  // Static utilities
  ComplexModule.utils = {
    formatDate: function(date) {
      return new Date(date).toLocaleDateString();
    },
    
    debounce: _.debounce,
    
    ajax: function(options) {
      return $.ajax(options);
    }
  };
  
  return ComplexModule;
}));
```

## Interoperability Between Module Systems

### CommonJS to ES6 Modules

```javascript
// commonjs-module.js - Original CommonJS module
function helper(data) {
  return data.toUpperCase();
}

class Processor {
  process(input) {
    return helper(input);
  }
}

module.exports = {
  helper,
  Processor,
  version: '1.0.0'
};
```

```javascript
// es6-wrapper.js - ES6 wrapper for CommonJS module
import commonjsModule from './commonjs-module.js';

// Re-export as named exports
export const { helper, Processor, version } = commonjsModule;

// Or create a default export
export default commonjsModule;

// Add ES6-specific functionality
export function modernHelper(data) {
  return helper(data).split('').reverse().join('');
}
```

### AMD to ES6 Modules

```javascript
// amd-to-es6.js - Convert AMD to ES6
// Original AMD module would be:
// define(['dependency'], function(dep) { return { ... }; });

// ES6 equivalent:
import dependency from './dependency.js';

function originalAMDFunction() {
  return {
    method1() {
      return dependency.someMethod();
    },
    method2() {
      return 'AMD converted to ES6';
    }
  };
}

export default originalAMDFunction();
export { originalAMDFunction };
```

### Module System Detection

```javascript
// module-detector.js - Detect and adapt to module system
(function(global) {
  'use strict';
  
  function createModule() {
    const MyLibrary = {
      version: '1.0.0',
      
      init: function(options) {
        this.options = options || {};
        return this;
      },
      
      doSomething: function() {
        return 'Library doing something';
      }
    };
    
    return MyLibrary;
  }
  
  // Detect environment and export accordingly
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    // CommonJS
    module.exports = createModule();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define([], createModule);
  } else if (typeof exports !== 'undefined') {
    // ES6 modules (when transpiled)
    exports.default = createModule();
  } else {
    // Browser global
    global.MyLibrary = createModule();
  }
  
})(typeof window !== 'undefined' ? window : 
   typeof global !== 'undefined' ? global : 
   typeof self !== 'undefined' ? self : this);
```

## Migration Strategies

### CommonJS to ES6 Modules Migration

```javascript
// Before (CommonJS)
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);

async function loadConfig(configPath) {
  try {
    const data = await readFile(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Config load error:', error);
    return {};
  }
}

module.exports = {
  loadConfig,
  defaultPath: path.join(__dirname, 'config.json')
};
```

```javascript
// After (ES6 Modules)
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadConfig(configPath) {
  try {
    const data = await readFile(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Config load error:', error);
    return {};
  }
}

export const defaultPath = join(__dirname, 'config.json');
```

### Gradual Migration Approach

```javascript
// hybrid-module.js - Support both systems during migration
let exportTarget;

// ES6 module detection
if (typeof module !== 'undefined' && module.exports) {
  // CommonJS environment
  exportTarget = module.exports;
} else {
  // Assume ES6 modules
  exportTarget = {};
}

function createUtility() {
  return {
    format: (str) => str.trim().toLowerCase(),
    validate: (data) => data != null && data !== '',
    transform: (arr) => arr.map(item => String(item))
  };
}

const utility = createUtility();

// Export in both formats
if (typeof module !== 'undefined' && module.exports) {
  // CommonJS
  module.exports = utility;
} else {
  // ES6 (this would be replaced with proper export statements)
  exportTarget.format = utility.format;
  exportTarget.validate = utility.validate;
  exportTarget.transform = utility.transform;
}

// In actual ES6 migration, you'd replace the above with:
// export const { format, validate, transform } = utility;
// export default utility;
```

## Key Takeaways

* **CommonJS is synchronous** and designed for server-side environments
* **AMD is asynchronous** and designed for browser environments
* **UMD provides universal compatibility** across different module systems
* **Module caching** prevents multiple executions of the same module
* **RequireJS configuration** enables complex dependency management
* **Migration requires careful planning** and gradual conversion
* **Interoperability patterns** help bridge different module systems
* **ES6 modules are the future** but legacy systems still need support
* **Understanding all systems** is crucial for full-stack development
* **Build tools can help** with module system conversion and bundling
