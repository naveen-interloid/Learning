# **4. Mixins**

### 1️⃣ Explanation

**Mixins** are a way to achieve multiple inheritance in JavaScript by combining functionality from multiple sources into a single object or class. They follow the principle of "composition over inheritance."

Benefits:
* **Multiple inheritance** simulation
* **Code reusability** across different classes
* **Flexible composition** of behaviors
* **Avoid deep inheritance hierarchies**

---

### 2️⃣ Basic Mixin Pattern

**Object.assign() Mixin:**
```javascript
const CanFly = {
  fly() {
    return `${this.name} is flying!`;
  },
  
  land() {
    return `${this.name} has landed.`;
  }
};

const CanSwim = {
  swim() {
    return `${this.name} is swimming!`;
  },
  
  dive() {
    return `${this.name} dives underwater.`;
  }
};

function Duck(name) {
  this.name = name;
}

// Apply mixins to prototype
Object.assign(Duck.prototype, CanFly, CanSwim);

const donald = new Duck('Donald');
console.log(donald.fly());  // "Donald is flying!"
console.log(donald.swim()); // "Donald is swimming!"
```

---

### 3️⃣ Factory Function Mixins

**Functional Mixin Pattern:**
```javascript
const withLogging = (target) => {
  target.log = function(message) {
    console.log(`[${this.constructor.name}] ${message}`);
  };
  return target;
};

const withTimestamp = (target) => {
  target.getTimestamp = function() {
    return new Date().toISOString();
  };
  return target;
};

const withValidation = (target) => {
  target.validate = function(data, rules) {
    for (const field in rules) {
      if (!rules[field](data[field])) {
        throw new Error(`Validation failed for ${field}`);
      }
    }
    return true;
  };
  return target;
};

function User(name, email) {
  this.name = name;
  this.email = email;
}

// Apply mixins
withLogging(User.prototype);
withTimestamp(User.prototype);
withValidation(User.prototype);

const user = new User('John', 'john@example.com');
user.log('User created'); // [User] User created
console.log(user.getTimestamp()); // 2023-12-07T10:30:00.000Z
```

---

### 4️⃣ Class-based Mixins

**Mixin Functions for Classes:**
```javascript
const Timestamped = (superclass) => class extends superclass {
  constructor(...args) {
    super(...args);
    this.createdAt = new Date();
  }
  
  getAge() {
    return Date.now() - this.createdAt.getTime();
  }
};

const Serializable = (superclass) => class extends superclass {
  serialize() {
    return JSON.stringify(this);
  }
  
  static deserialize(json) {
    const data = JSON.parse(json);
    return new this(data);
  }
};

const Validatable = (superclass) => class extends superclass {
  validate() {
    // Override in subclasses
    return true;
  }
  
  isValid() {
    try {
      return this.validate();
    } catch (error) {
      return false;
    }
  }
};

class BaseModel {
  constructor(data = {}) {
    Object.assign(this, data);
  }
}

// Compose mixins
class User extends Validatable(Serializable(Timestamped(BaseModel))) {
  constructor(name, email) {
    super();
    this.name = name;
    this.email = email;
  }
  
  validate() {
    if (!this.name || this.name.length === 0) {
      throw new Error('Name is required');
    }
    if (!this.email || !this.email.includes('@')) {
      throw new Error('Valid email is required');
    }
    return true;
  }
}

const user = new User('Alice', 'alice@example.com');
console.log(user.isValid()); // true
console.log(user.serialize()); // JSON string
console.log(user.getAge()); // milliseconds since creation
```

---

### 5️⃣ Advanced Mixin Patterns

**Conditional Mixins:**
```javascript
const withCache = (target, options = {}) => {
  const cacheSize = options.maxSize || 100;
  const cache = new Map();
  
  target.cached = function(key, computeFn) {
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = computeFn();
    
    if (cache.size >= cacheSize) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    
    cache.set(key, result);
    return result;
  };
  
  target.clearCache = function() {
    cache.clear();
  };
  
  return target;
};

const withRetry = (target, maxRetries = 3) => {
  target.retry = async function(fn, ...args) {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn.apply(this, args);
      } catch (error) {
        lastError = error;
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
      }
    }
    
    throw lastError;
  };
  
  return target;
};

class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  
  async fetchData(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return response.json();
  }
}

// Apply mixins conditionally
withCache(ApiService.prototype, { maxSize: 50 });
withRetry(ApiService.prototype, 3);

const api = new ApiService('https://api.example.com');

// Use mixed-in functionality
const data = await api.retry(api.fetchData, '/users');
const cachedData = api.cached('users', () => api.fetchData('/users'));
```

---

### 6️⃣ Mixin Composition Utility

**Generic Mixin Composer:**
```javascript
function compose(...mixins) {
  return (superclass) => {
    return mixins.reduce((cls, mixin) => mixin(cls), superclass);
  };
}

// Usage
class Product extends compose(
  Timestamped,
  Serializable,
  Validatable
)(BaseModel) {
  constructor(name, price) {
    super();
    this.name = name;
    this.price = price;
  }
  
  validate() {
    if (!this.name) throw new Error('Name required');
    if (this.price <= 0) throw new Error('Price must be positive');
    return true;
  }
}

const product = new Product('Laptop', 999.99);
console.log(product.isValid()); // true
console.log(product.getAge()); // milliseconds
```

---

### 7️⃣ Key Takeaways

* **Mixins** enable multiple inheritance in JavaScript
* **Object.assign()** is the simplest mixin approach
* **Functional mixins** provide more flexibility
* **Class mixins** work well with ES6 class syntax
* **Composition over inheritance** - more flexible than deep hierarchies
* **Avoid naming conflicts** when combining mixins
