# **1. Higher-Order Functions**

### 1️⃣ Explanation

A **Higher-Order Function** is a function that either:
1. **Takes one or more functions as arguments**, or
2. **Returns a function as its result**

Think of it as:
* Functions that **operate on other functions**
* **Meta-functions** - functions about functions
* Enable **functional programming** patterns
* Make code more **modular** and **reusable**

---

### 2️⃣ Mental Model

```
Higher-Order Function
┌─────────────────────────┐
│ function process(fn) {  │
│   return function(data) │ ← Returns function
│     return fn(data);    │ ← Uses function parameter
│   }                     │
│ }                       │
└─────────────────────────┘
         ▲
         │
    Takes function
    as parameter
```

---

### 3️⃣ Basic Examples

**Function as Parameter:**
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

function shout(name) {
  return `HELLO, ${name.toUpperCase()}!`;
}

// Higher-order function
function processName(name, formatter) {
  return formatter(name);
}

console.log(processName("Alice", greet)); // "Hello, Alice!"
console.log(processName("Bob", shout));   // "HELLO, BOB!"
```

**Function as Return Value:**
```javascript
function createMultiplier(factor) {
  return function(number) {
    return number * factor;
  };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(4)); // 12
```

---

### 4️⃣ Built-in Higher-Order Functions

**Array Methods:**
```javascript
const numbers = [1, 2, 3, 4, 5];

// map() - transforms each element
const doubled = numbers.map(x => x * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// filter() - selects elements
const evens = numbers.filter(x => x % 2 === 0);
console.log(evens); // [2, 4]

// reduce() - combines elements
const sum = numbers.reduce((acc, x) => acc + x, 0);
console.log(sum); // 15

// forEach() - executes function for each element
numbers.forEach(x => console.log(x * x)); // 1, 4, 9, 16, 25
```

**Practical Example:**
```javascript
const users = [
  { name: 'Alice', age: 25, active: true },
  { name: 'Bob', age: 30, active: false },
  { name: 'Carol', age: 35, active: true }
];

// Chain higher-order functions
const activeUserNames = users
  .filter(user => user.active)
  .map(user => user.name)
  .map(name => name.toUpperCase());

console.log(activeUserNames); // ['ALICE', 'CAROL']
```

---

### 5️⃣ Custom Higher-Order Functions

**Retry Function:**
```javascript
function retry(fn, maxAttempts) {
  return function(...args) {
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        return fn(...args);
      } catch (error) {
        attempts++;
        if (attempts >= maxAttempts) {
          throw error;
        }
        console.log(`Attempt ${attempts} failed, retrying...`);
      }
    }
  };
}

// Usage
const unreliableAPI = () => {
  if (Math.random() < 0.7) throw new Error('API failed');
  return 'Success!';
};

const reliableAPI = retry(unreliableAPI, 3);
console.log(reliableAPI()); // Will retry up to 3 times
```

**Logger Decorator:**
```javascript
function withLogging(fn) {
  return function(...args) {
    console.log(`Calling ${fn.name} with args:`, args);
    const result = fn(...args);
    console.log(`${fn.name} returned:`, result);
    return result;
  };
}

function add(a, b) {
  return a + b;
}

const loggedAdd = withLogging(add);
loggedAdd(2, 3); 
// Calling add with args: [2, 3]
// add returned: 5
```

---

### 6️⃣ Key Takeaways

* Higher-order functions take functions as parameters or return functions
* Enable powerful functional programming patterns
* Built-in array methods are common examples
* Great for creating reusable, composable code
* Foundation for advanced patterns like currying and composition
