# **4. Closures & Lexical Environment**

### 1️⃣ Explanation

A **Closure** is when a function "remembers" variables from its outer scope, even after that outer function has finished executing.

Think of it as:
* A **backpack** that a function carries with it
* Contains all the variables it needs from its parent scope
* Allows **data privacy** and **persistent state**

**Lexical Environment** = the place where variables live + reference to the outer environment.

Key concepts:
* **Lexical Scope** – determined by where code is written (not where it's called)
* **Environment Record** – stores variables and function declarations
* **Outer Reference** – link to the parent lexical environment

---

### 2️⃣ Mental Model

```
Outer Function Scope
┌─────────────────────────┐
│ let outerVar = "Hello"  │
│                         │
│ Inner Function Scope    │
│ ┌─────────────────────┐ │
│ │ let innerVar = "!"  │ │
│ │ return outerVar +   │ │ ← Closure: Inner function
│ │        innerVar     │ │   "closes over" outerVar
│ └─────────────────────┘ │
└─────────────────────────┘
```

---

### 3️⃣ Example Code

**Basic Closure:**
```javascript
function outerFunction(x) {
  // This is the outer function's scope
  
  function innerFunction(y) {
    // Inner function has access to outer function's variables
    return x + y; // x is "closed over"
  }
  
  return innerFunction;
}

const addFive = outerFunction(5);
console.log(addFive(3)); // 8

// Even though outerFunction finished executing,
// innerFunction still remembers x = 5
```

**Practical Example - Counter:**
```javascript
function createCounter() {
  let count = 0; // Private variable
  
  return {
    increment: function() {
      count++;
      return count;
    },
    decrement: function() {
      count--;
      return count;
    },
    getCount: function() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getCount());  // 2

// count is private - can't access it directly
console.log(counter.count); // undefined
```

**Function Factory:**
```javascript
function multiplyBy(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = multiplyBy(2);
const triple = multiplyBy(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

---

### 4️⃣ Common Pitfalls

**Loop Closure Problem:**
```javascript
// ❌ Wrong - all functions log 3
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 3, 3, 3
  }, 100);
}

// ✅ Solution 1 - Use let (block scope)
for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 0, 1, 2
  }, 100);
}

// ✅ Solution 2 - IIFE to create closure
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(function() {
      console.log(j); // 0, 1, 2
    }, 100);
  })(i);
}
```

---

### 5️⃣ Real-World Applications

**Module Pattern:**
```javascript
const Calculator = (function() {
  let result = 0; // Private state
  
  return {
    add: function(x) {
      result += x;
      return this;
    },
    multiply: function(x) {
      result *= x;
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

Calculator.add(5).multiply(2).getResult(); // 10
```

**Event Handlers with State:**
```javascript
function createButtonHandler(name) {
  let clickCount = 0;
  
  return function() {
    clickCount++;
    console.log(`${name} clicked ${clickCount} times`);
  };
}

document.getElementById('btn1').onclick = createButtonHandler('Button 1');
document.getElementById('btn2').onclick = createButtonHandler('Button 2');
```

---

### 6️⃣ Memory Considerations

**Memory Leaks:**
```javascript
// ❌ Potential memory leak
function attachListeners() {
  let largeData = new Array(1000000).fill('data');
  
  document.getElementById('button').onclick = function() {
    // This closure keeps largeData in memory
    console.log('Button clicked');
  };
}

// ✅ Better approach
function attachListeners() {
  let largeData = new Array(1000000).fill('data');
  
  function handleClick() {
    console.log('Button clicked');
    // largeData is not referenced, can be garbage collected
  }
  
  document.getElementById('button').onclick = handleClick;
}
```

---

### 7️⃣ Mini Challenge

Create a function that returns an object with methods to:
1. Add items to a private shopping cart
2. Remove items from the cart
3. Get the total number of items
4. Clear the cart

```javascript
function createShoppingCart() {
  // Your code here
}

const cart = createShoppingCart();
cart.addItem('Apple');
cart.addItem('Banana');
console.log(cart.getTotal()); // Should return 2
cart.removeItem('Apple');
console.log(cart.getTotal()); // Should return 1
```

---

### 8️⃣ Key Takeaways

* Closures enable **data privacy** and **persistent state**
* Inner functions have access to outer function variables
* Closures are created every time a function is created
* Be mindful of memory usage with closures
* Essential for module patterns and functional programming
