# **8.3 Module Design Patterns**

Module design patterns provide proven approaches to organizing and structuring JavaScript code. These patterns help create maintainable, reusable, and well-encapsulated modules.

## Classic Module Pattern

### IIFE-Based Module Pattern

```javascript
// basic-module-pattern.js - Classic module pattern
const MathModule = (function() {
  // Private variables and functions
  let privateCounter = 0;
  const privateConstant = 'SECRET';
  
  function privateFunction(x) {
    return x * 2;
  }
  
  function incrementCounter() {
    privateCounter++;
  }
  
  // Public API
  return {
    // Public methods
    add: function(a, b) {
      incrementCounter();
      return a + b;
    },
    
    multiply: function(a, b) {
      incrementCounter();
      return privateFunction(a) * b;
    },
    
    getUsageCount: function() {
      return privateCounter;
    },
    
    // Public constants
    PI: 3.14159,
    E: 2.71828
  };
})();

// Usage
console.log(MathModule.add(5, 3)); // 8
console.log(MathModule.multiply(4, 2)); // 16
console.log(MathModule.getUsageCount()); // 2

// Private members are not accessible
// console.log(MathModule.privateCounter); // undefined
// console.log(MathModule.privateConstant); // undefined
```

### Parameterized Module Pattern

```javascript
// parameterized-module.js - Module with configuration
const ConfigurableLogger = (function(config) {
  // Default configuration
  const defaultConfig = {
    level: 'info',
    prefix: 'LOG',
    timestamp: true,
    colors: false
  };
  
  // Merge configurations
  const settings = Object.assign({}, defaultConfig, config);
  
  // Private variables
  const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3
  };
  
  let logHistory = [];
  
  // Private functions
  function shouldLog(level) {
    return logLevels[level] <= logLevels[settings.level];
  }
  
  function formatMessage(level, message) {
    let formatted = '';
    
    if (settings.timestamp) {
      formatted += `[${new Date().toISOString()}] `;
    }
    
    formatted += `[${settings.prefix}] [${level.toUpperCase()}] ${message}`;
    
    return formatted;
  }
  
  function addToHistory(level, message) {
    logHistory.push({
      level: level,
      message: message,
      timestamp: new Date()
    });
    
    // Keep only last 100 entries
    if (logHistory.length > 100) {
      logHistory = logHistory.slice(-100);
    }
  }
  
  // Public API
  return {
    error: function(message) {
      if (shouldLog('error')) {
        const formatted = formatMessage('error', message);
        console.error(formatted);
        addToHistory('error', message);
      }
    },
    
    warn: function(message) {
      if (shouldLog('warn')) {
        const formatted = formatMessage('warn', message);
        console.warn(formatted);
        addToHistory('warn', message);
      }
    },
    
    info: function(message) {
      if (shouldLog('info')) {
        const formatted = formatMessage('info', message);
        console.info(formatted);
        addToHistory('info', message);
      }
    },
    
    debug: function(message) {
      if (shouldLog('debug')) {
        const formatted = formatMessage('debug', message);
        console.log(formatted);
        addToHistory('debug', message);
      }
    },
    
    getHistory: function() {
      return [...logHistory]; // Return copy
    },
    
    clearHistory: function() {
      logHistory = [];
    },
    
    getConfig: function() {
      return Object.assign({}, settings); // Return copy
    }
  };
});

// Create configured instances
const appLogger = ConfigurableLogger({
  level: 'debug',
  prefix: 'APP',
  timestamp: true
});

const errorLogger = ConfigurableLogger({
  level: 'error',
  prefix: 'ERROR',
  timestamp: true,
  colors: true
});

// Usage
appLogger.info('Application started');
appLogger.debug('Debug information');
errorLogger.error('Critical error occurred');
```

## Revealing Module Pattern

### Basic Revealing Module Pattern

```javascript
// revealing-module.js - Revealing module pattern
const UserManager = (function() {
  // Private variables
  let users = [];
  let currentUser = null;
  let nextId = 1;
  
  // Private functions
  function validateUser(user) {
    return user && 
           typeof user.name === 'string' && 
           user.name.length > 0 &&
           typeof user.email === 'string' &&
           user.email.includes('@');
  }
  
  function generateId() {
    return nextId++;
  }
  
  function findUserById(id) {
    return users.find(user => user.id === id);
  }
  
  function findUserByEmail(email) {
    return users.find(user => user.email === email);
  }
  
  function notifyUserChange(action, user) {
    console.log(`User ${action}:`, user.name);
  }
  
  // Public functions
  function addUser(userData) {
    if (!validateUser(userData)) {
      throw new Error('Invalid user data');
    }
    
    if (findUserByEmail(userData.email)) {
      throw new Error('User with this email already exists');
    }
    
    const user = {
      id: generateId(),
      name: userData.name,
      email: userData.email,
      createdAt: new Date(),
      active: true
    };
    
    users.push(user);
    notifyUserChange('added', user);
    return user;
  }
  
  function removeUser(id) {
    const index = users.findIndex(user => user.id === id);
    if (index === -1) {
      throw new Error('User not found');
    }
    
    const user = users[index];
    users.splice(index, 1);
    
    if (currentUser && currentUser.id === id) {
      currentUser = null;
    }
    
    notifyUserChange('removed', user);
    return user;
  }
  
  function updateUser(id, updates) {
    const user = findUserById(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Validate updates
    if (updates.email && updates.email !== user.email) {
      if (findUserByEmail(updates.email)) {
        throw new Error('Email already in use');
      }
    }
    
    Object.assign(user, updates);
    notifyUserChange('updated', user);
    return user;
  }
  
  function getUser(id) {
    const user = findUserById(id);
    return user ? Object.assign({}, user) : null; // Return copy
  }
  
  function getAllUsers() {
    return users.map(user => Object.assign({}, user)); // Return copies
  }
  
  function setCurrentUser(id) {
    const user = findUserById(id);
    if (!user) {
      throw new Error('User not found');
    }
    
    currentUser = user;
    return user;
  }
  
  function getCurrentUser() {
    return currentUser ? Object.assign({}, currentUser) : null;
  }
  
  function getUserCount() {
    return users.length;
  }
  
  // Reveal public interface
  return {
    addUser: addUser,
    removeUser: removeUser,
    updateUser: updateUser,
    getUser: getUser,
    getAllUsers: getAllUsers,
    setCurrentUser: setCurrentUser,
    getCurrentUser: getCurrentUser,
    getUserCount: getUserCount
  };
})();

// Usage
const user1 = UserManager.addUser({
  name: 'John Doe',
  email: 'john@example.com'
});

const user2 = UserManager.addUser({
  name: 'Jane Smith',
  email: 'jane@example.com'
});

UserManager.setCurrentUser(user1.id);
console.log('Current user:', UserManager.getCurrentUser());
console.log('Total users:', UserManager.getUserCount());
```

### Advanced Revealing Module with Events

```javascript
// event-driven-module.js - Module with event system
const EventDrivenModule = (function() {
  // Private variables
  let data = {};
  let listeners = {};
  let history = [];
  
  // Private event system
  function emit(eventName, eventData) {
    if (listeners[eventName]) {
      listeners[eventName].forEach(callback => {
        try {
          callback(eventData);
        } catch (error) {
          console.error(`Event listener error for '${eventName}':`, error);
        }
      });
    }
    
    // Add to history
    history.push({
      event: eventName,
      data: eventData,
      timestamp: new Date()
    });
    
    // Keep only last 50 events
    if (history.length > 50) {
      history = history.slice(-50);
    }
  }
  
  function validateKey(key) {
    return typeof key === 'string' && key.length > 0;
  }
  
  // Public functions
  function set(key, value) {
    if (!validateKey(key)) {
      throw new Error('Invalid key');
    }
    
    const oldValue = data[key];
    data[key] = value;
    
    emit('dataChanged', {
      key: key,
      oldValue: oldValue,
      newValue: value,
      action: 'set'
    });
    
    return value;
  }
  
  function get(key) {
    if (!validateKey(key)) {
      throw new Error('Invalid key');
    }
    
    const value = data[key];
    
    emit('dataAccessed', {
      key: key,
      value: value,
      action: 'get'
    });
    
    return value;
  }
  
  function remove(key) {
    if (!validateKey(key)) {
      throw new Error('Invalid key');
    }
    
    const value = data[key];
    delete data[key];
    
    emit('dataChanged', {
      key: key,
      oldValue: value,
      newValue: undefined,
      action: 'remove'
    });
    
    return value;
  }
  
  function has(key) {
    return validateKey(key) && key in data;
  }
  
  function keys() {
    return Object.keys(data);
  }
  
  function clear() {
    const oldData = Object.assign({}, data);
    data = {};
    
    emit('dataCleared', {
      clearedData: oldData,
      action: 'clear'
    });
  }
  
  function on(eventName, callback) {
    if (typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }
    
    if (!listeners[eventName]) {
      listeners[eventName] = [];
    }
    
    listeners[eventName].push(callback);
    
    // Return unsubscribe function
    return function unsubscribe() {
      const index = listeners[eventName].indexOf(callback);
      if (index > -1) {
        listeners[eventName].splice(index, 1);
      }
    };
  }
  
  function off(eventName, callback) {
    if (listeners[eventName]) {
      if (callback) {
        const index = listeners[eventName].indexOf(callback);
        if (index > -1) {
          listeners[eventName].splice(index, 1);
        }
      } else {
        // Remove all listeners for this event
        listeners[eventName] = [];
      }
    }
  }
  
  function getHistory() {
    return [...history]; // Return copy
  }
  
  function getStats() {
    return {
      dataKeys: Object.keys(data).length,
      eventTypes: Object.keys(listeners).length,
      totalListeners: Object.values(listeners).reduce((sum, arr) => sum + arr.length, 0),
      historyLength: history.length
    };
  }
  
  // Reveal public interface
  return {
    set: set,
    get: get,
    remove: remove,
    has: has,
    keys: keys,
    clear: clear,
    on: on,
    off: off,
    getHistory: getHistory,
    getStats: getStats
  };
})();

// Usage with event listeners
const unsubscribe1 = EventDrivenModule.on('dataChanged', function(event) {
  console.log('Data changed:', event);
});

const unsubscribe2 = EventDrivenModule.on('dataAccessed', function(event) {
  console.log('Data accessed:', event.key);
});

EventDrivenModule.set('name', 'John');
EventDrivenModule.set('age', 30);
console.log('Name:', EventDrivenModule.get('name'));
console.log('Stats:', EventDrivenModule.getStats());

// Unsubscribe from events
unsubscribe1();
unsubscribe2();
```

## Namespace Pattern

### Hierarchical Namespace Pattern

```javascript
// namespace-pattern.js - Hierarchical namespace organization
const MyApp = MyApp || {};

// Create namespace structure
MyApp.Utils = MyApp.Utils || {};
MyApp.Components = MyApp.Components || {};
MyApp.Services = MyApp.Services || {};
MyApp.Models = MyApp.Models || {};

// Utility functions namespace
MyApp.Utils.String = (function() {
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  function truncate(str, length) {
    return str.length > length ? str.substring(0, length) + '...' : str;
  }
  
  function slugify(str) {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  return {
    capitalize: capitalize,
    truncate: truncate,
    slugify: slugify
  };
})();

MyApp.Utils.Array = (function() {
  function unique(arr) {
    return [...new Set(arr)];
  }
  
  function chunk(arr, size) {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }
  
  function flatten(arr) {
    return arr.reduce((flat, item) => {
      return flat.concat(Array.isArray(item) ? flatten(item) : item);
    }, []);
  }
  
  return {
    unique: unique,
    chunk: chunk,
    flatten: flatten
  };
})();

// Component namespace
MyApp.Components.Button = (function() {
  function Button(element, options) {
    this.element = element;
    this.options = Object.assign({
      text: 'Click me',
      disabled: false,
      onClick: null
    }, options);
    
    this.init();
  }
  
  Button.prototype.init = function() {
    this.element.textContent = this.options.text;
    this.element.disabled = this.options.disabled;
    
    if (this.options.onClick) {
      this.element.addEventListener('click', this.options.onClick);
    }
  };
  
  Button.prototype.setText = function(text) {
    this.options.text = text;
    this.element.textContent = text;
  };
  
  Button.prototype.setDisabled = function(disabled) {
    this.options.disabled = disabled;
    this.element.disabled = disabled;
  };
  
  return Button;
})();

// Service namespace
MyApp.Services.Api = (function() {
  const baseUrl = 'https://api.example.com';
  let authToken = null;
  
  function setAuthToken(token) {
    authToken = token;
  }
  
  function getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return headers;
  }
  
  async function request(endpoint, options = {}) {
    const url = `${baseUrl}${endpoint}`;
    const config = {
      headers: getHeaders(),
      ...options
    };
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
  
  function get(endpoint) {
    return request(endpoint, { method: 'GET' });
  }
  
  function post(endpoint, data) {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  function put(endpoint, data) {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  function del(endpoint) {
    return request(endpoint, { method: 'DELETE' });
  }
  
  return {
    setAuthToken: setAuthToken,
    get: get,
    post: post,
    put: put,
    delete: del
  };
})();

// Usage
console.log(MyApp.Utils.String.capitalize('hello world'));
console.log(MyApp.Utils.Array.unique([1, 2, 2, 3, 3, 4]));

// Create button component
const buttonElement = document.createElement('button');
const button = new MyApp.Components.Button(buttonElement, {
  text: 'Save',
  onClick: () => console.log('Button clicked!')
});

// Use API service
MyApp.Services.Api.setAuthToken('your-token-here');
MyApp.Services.Api.get('/users')
  .then(users => console.log('Users:', users))
  .catch(error => console.error('Failed to fetch users:', error));
```

### Dynamic Namespace Creation

```javascript
// dynamic-namespace.js - Dynamic namespace creation utility
const NamespaceManager = (function() {
  const root = {};
  
  function createNamespace(path, obj) {
    const parts = path.split('.');
    let current = root;
    
    // Create nested structure
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    // Set the final object
    const finalPart = parts[parts.length - 1];
    current[finalPart] = obj;
    
    return obj;
  }
  
  function getNamespace(path) {
    const parts = path.split('.');
    let current = root;
    
    for (const part of parts) {
      if (!current[part]) {
        return undefined;
      }
      current = current[part];
    }
    
    return current;
  }
  
  function hasNamespace(path) {
    return getNamespace(path) !== undefined;
  }
  
  function removeNamespace(path) {
    const parts = path.split('.');
    const parentPath = parts.slice(0, -1).join('.');
    const finalPart = parts[parts.length - 1];
    
    if (parentPath) {
      const parent = getNamespace(parentPath);
      if (parent && parent[finalPart]) {
        delete parent[finalPart];
        return true;
      }
    } else {
      if (root[finalPart]) {
        delete root[finalPart];
        return true;
      }
    }
    
    return false;
  }
  
  function listNamespaces(path = '') {
    const namespace = path ? getNamespace(path) : root;
    if (!namespace) {
      return [];
    }
    
    const result = [];
    
    function traverse(obj, currentPath) {
      for (const key in obj) {
        const fullPath = currentPath ? `${currentPath}.${key}` : key;
        result.push(fullPath);
        
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          traverse(obj[key], fullPath);
        }
      }
    }
    
    traverse(namespace, path);
    return result;
  }
  
  function getRoot() {
    return root;
  }
  
  return {
    create: createNamespace,
    get: getNamespace,
    has: hasNamespace,
    remove: removeNamespace,
    list: listNamespaces,
    root: getRoot
  };
})();

// Usage
NamespaceManager.create('App.Utils.Math', {
  add: (a, b) => a + b,
  multiply: (a, b) => a * b
});

NamespaceManager.create('App.Utils.String', {
  reverse: str => str.split('').reverse().join(''),
  repeat: (str, times) => str.repeat(times)
});

NamespaceManager.create('App.Components.Modal', {
  show: () => console.log('Modal shown'),
  hide: () => console.log('Modal hidden')
});

// Access namespaces
const mathUtils = NamespaceManager.get('App.Utils.Math');
console.log('5 + 3 =', mathUtils.add(5, 3));

const stringUtils = NamespaceManager.get('App.Utils.String');
console.log('Reversed:', stringUtils.reverse('hello'));

// List all namespaces
console.log('All namespaces:', NamespaceManager.list());

// Access the root object
const app = NamespaceManager.root();
console.log('Direct access:', app.App.Utils.Math.multiply(4, 5));
```

## Dependency Injection Pattern

### Simple Dependency Injection

```javascript
// dependency-injection.js - Simple DI container
const DIContainer = (function() {
  const services = new Map();
  const singletons = new Map();
  
  function register(name, factory, options = {}) {
    if (typeof factory !== 'function') {
      throw new Error('Factory must be a function');
    }
    
    services.set(name, {
      factory: factory,
      singleton: options.singleton || false,
      dependencies: options.dependencies || []
    });
  }
  
  function resolve(name) {
    if (!services.has(name)) {
      throw new Error(`Service '${name}' not found`);
    }
    
    const service = services.get(name);
    
    // Return singleton instance if exists
    if (service.singleton && singletons.has(name)) {
      return singletons.get(name);
    }
    
    // Resolve dependencies
    const dependencies = service.dependencies.map(dep => resolve(dep));
    
    // Create instance
    const instance = service.factory(...dependencies);
    
    // Store singleton
    if (service.singleton) {
      singletons.set(name, instance);
    }
    
    return instance;
  }
  
  function has(name) {
    return services.has(name);
  }
  
  function clear() {
    services.clear();
    singletons.clear();
  }
  
  function getRegistered() {
    return Array.from(services.keys());
  }
  
  return {
    register: register,
    resolve: resolve,
    has: has,
    clear: clear,
    getRegistered: getRegistered
  };
})();

// Register services
DIContainer.register('logger', function() {
  return {
    log: (message) => console.log(`[LOG] ${message}`),
    error: (message) => console.error(`[ERROR] ${message}`)
  };
}, { singleton: true });

DIContainer.register('config', function() {
  return {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3
  };
}, { singleton: true });

DIContainer.register('httpClient', function(logger, config) {
  return {
    async get(url) {
      logger.log(`GET request to ${url}`);
      // Simulate HTTP request
      return { data: 'mock data', status: 200 };
    },
    
    async post(url, data) {
      logger.log(`POST request to ${url}`);
      // Simulate HTTP request
      return { data: 'created', status: 201 };
    },
    
    getConfig() {
      return config;
    }
  };
}, { dependencies: ['logger', 'config'] });

DIContainer.register('userService', function(httpClient, logger) {
  return {
    async getUser(id) {
      try {
        const response = await httpClient.get(`/users/${id}`);
        return response.data;
      } catch (error) {
        logger.error(`Failed to get user ${id}: ${error.message}`);
        throw error;
      }
    },
    
    async createUser(userData) {
      try {
        const response = await httpClient.post('/users', userData);
        logger.log(`User created: ${userData.name}`);
        return response.data;
      } catch (error) {
        logger.error(`Failed to create user: ${error.message}`);
        throw error;
      }
    }
  };
}, { dependencies: ['httpClient', 'logger'] });

// Usage
const userService = DIContainer.resolve('userService');
const logger = DIContainer.resolve('logger');

userService.getUser(123).then(user => {
  logger.log('User retrieved successfully');
});

userService.createUser({ name: 'John Doe', email: 'john@example.com' });

console.log('Registered services:', DIContainer.getRegistered());
```

### Advanced DI with Decorators

```javascript
// advanced-di.js - Advanced DI with method decoration
const AdvancedDI = (function() {
  const container = new Map();
  const decorators = new Map();
  
  function register(name, factory, options = {}) {
    container.set(name, {
      factory: factory,
      singleton: options.singleton || false,
      dependencies: options.dependencies || [],
      decorators: options.decorators || [],
      instance: null
    });
  }
  
  function registerDecorator(name, decorator) {
    decorators.set(name, decorator);
  }
  
  function resolve(name) {
    if (!container.has(name)) {
      throw new Error(`Service '${name}' not found`);
    }
    
    const service = container.get(name);
    
    // Return singleton if exists
    if (service.singleton && service.instance) {
      return service.instance;
    }
    
    // Resolve dependencies
    const dependencies = service.dependencies.map(dep => resolve(dep));
    
    // Create instance
    let instance = service.factory(...dependencies);
    
    // Apply decorators
    for (const decoratorName of service.decorators) {
      if (decorators.has(decoratorName)) {
        const decorator = decorators.get(decoratorName);
        instance = decorator(instance, name);
      }
    }
    
    // Store singleton
    if (service.singleton) {
      service.instance = instance;
    }
    
    return instance;
  }
  
  return {
    register: register,
    registerDecorator: registerDecorator,
    resolve: resolve
  };
})();

// Register decorators
AdvancedDI.registerDecorator('timing', function(instance, serviceName) {
  const decorated = {};
  
  for (const method in instance) {
    if (typeof instance[method] === 'function') {
      decorated[method] = function(...args) {
        const start = performance.now();
        const result = instance[method].apply(this, args);
        const end = performance.now();
        
        console.log(`${serviceName}.${method} took ${(end - start).toFixed(2)}ms`);
        
        return result;
      };
    } else {
      decorated[method] = instance[method];
    }
  }
  
  return decorated;
});

AdvancedDI.registerDecorator('caching', function(instance, serviceName) {
  const cache = new Map();
  const decorated = {};
  
  for (const method in instance) {
    if (typeof instance[method] === 'function') {
      decorated[method] = function(...args) {
        const key = `${method}:${JSON.stringify(args)}`;
        
        if (cache.has(key)) {
          console.log(`Cache hit for ${serviceName}.${method}`);
          return cache.get(key);
        }
        
        const result = instance[method].apply(this, args);
        cache.set(key, result);
        
        return result;
      };
    } else {
      decorated[method] = instance[method];
    }
  }
  
  return decorated;
});

// Register services with decorators
AdvancedDI.register('calculator', function() {
  return {
    add: (a, b) => {
      // Simulate some work
      for (let i = 0; i < 1000000; i++) {}
      return a + b;
    },
    
    multiply: (a, b) => {
      // Simulate some work
      for (let i = 0; i < 1000000; i++) {}
      return a * b;
    }
  };
}, { 
  singleton: true,
  decorators: ['timing', 'caching']
});

// Usage
const calculator = AdvancedDI.resolve('calculator');

console.log('First call:', calculator.add(5, 3)); // Will show timing
console.log('Second call:', calculator.add(5, 3)); // Will show cache hit
console.log('Different args:', calculator.add(2, 4)); // Will show timing again
```

## Key Takeaways

* **Module patterns provide encapsulation** and prevent global namespace pollution
* **IIFE-based modules** create private scope and controlled public APIs
* **Revealing module pattern** makes public interface explicit and clear
* **Namespace patterns** organize related functionality hierarchically
* **Dependency injection** promotes loose coupling and testability
* **Parameterized modules** allow configuration and customization
* **Event-driven modules** enable reactive programming patterns
* **Decorators enhance modules** with cross-cutting concerns
* **Dynamic namespaces** provide flexible organization structures
* **Module patterns are foundational** to modern JavaScript architecture
