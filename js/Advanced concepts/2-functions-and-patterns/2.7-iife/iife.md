# **7. Immediately Invoked Function Expressions (IIFE)**

### 1️⃣ Explanation

**IIFE** (Immediately Invoked Function Expression) is a function that executes immediately when it's defined.

Benefits:
* **Creates private scope** (avoids global pollution)
* **Executes code immediately**
* **Module pattern foundation**
* **Prevents variable conflicts**

---

### 2️⃣ Basic Syntax

**Standard IIFE:**
```javascript
(function() {
  console.log('IIFE executed!');
})();

// Alternative syntax
(function() {
  console.log('Alternative IIFE!');
}());
```

**Arrow Function IIFE:**
```javascript
(() => {
  console.log('Arrow IIFE!');
})();
```

**With Parameters:**
```javascript
(function(name, age) {
  console.log(`Hello ${name}, you are ${age} years old`);
})('Alice', 25);
```

---

### 3️⃣ Private Scope Creation

**Avoiding Global Pollution:**
```javascript
// ❌ Global variables
var counter = 0;
var increment = function() { counter++; };
var decrement = function() { counter--; };

// ✅ IIFE with private scope
const counterModule = (function() {
  let counter = 0; // Private variable
  
  return {
    increment: function() { counter++; },
    decrement: function() { counter--; },
    getCount: function() { return counter; }
  };
})();

console.log(counterModule.getCount()); // 0
counterModule.increment();
console.log(counterModule.getCount()); // 1
```

---

### 4️⃣ Module Pattern

**Classic Module Pattern:**
```javascript
const Calculator = (function() {
  // Private variables and functions
  let result = 0;
  
  function log(operation, value) {
    console.log(`${operation}: ${value}`);
  }
  
  // Public API
  return {
    add: function(x) {
      result += x;
      log('Add', x);
      return this;
    },
    
    multiply: function(x) {
      result *= x;
      log('Multiply', x);
      return this;
    },
    
    getResult: function() {
      return result;
    },
    
    reset: function() {
      result = 0;
      return this;
    }
  };
})();

// Usage
Calculator.add(5).multiply(2).getResult(); // 10
```

---

### 5️⃣ Real-World Applications

**Library Initialization:**
```javascript
(function(window, document) {
  'use strict';
  
  // Private helper functions
  function createElement(tag, className) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    return element;
  }
  
  // Public API
  window.MyLibrary = {
    createButton: function(text, onClick) {
      const button = createElement('button', 'my-button');
      button.textContent = text;
      button.onclick = onClick;
      return button;
    }
  };
  
})(window, document);

// Usage
const button = MyLibrary.createButton('Click me', () => alert('Clicked!'));
```

**Configuration Setup:**
```javascript
(function(config) {
  // Initialize app with configuration
  const app = {
    apiUrl: config.apiUrl,
    debug: config.debug,
    
    init: function() {
      if (this.debug) {
        console.log('App initialized in debug mode');
      }
      // Setup code here
    }
  };
  
  app.init();
  window.MyApp = app;
  
})({
  apiUrl: 'https://api.example.com',
  debug: true
});
```

---

### 6️⃣ Key Takeaways

* **IIFE** executes immediately and creates private scope
* **Prevents global pollution** and variable conflicts
* **Foundation for module pattern** before ES6 modules
* **Still useful** for initialization code and libraries
* **Creates closures** for data privacy
