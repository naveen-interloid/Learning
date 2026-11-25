# **2. Currying & Partial Application**

### 1️⃣ Explanation

**Currying** transforms a function that takes multiple arguments into a sequence of functions that each take a single argument.

**Partial Application** fixes some arguments of a function, producing another function with fewer arguments.

Think of it as:
* **Currying**: `f(a, b, c)` → `f(a)(b)(c)`
* **Partial Application**: `f(a, b, c)` → `f(a, b, _)` where `_` is filled later
* Both enable **function composition** and **reusability**

---

### 2️⃣ Mental Model

```
Regular Function:
add(2, 3) → 5

Curried Function:
add(2)(3) → 5

Partial Application:
addTwo = add(2, _)
addTwo(3) → 5
```

---

### 3️⃣ Currying Examples

**Manual Currying:**
```javascript
// Regular function
function add(a, b, c) {
  return a + b + c;
}

// Curried version
function curriedAdd(a) {
  return function(b) {
    return function(c) {
      return a + b + c;
    };
  };
}

// Usage
console.log(add(1, 2, 3));           // 6
console.log(curriedAdd(1)(2)(3));    // 6

// Partial application with currying
const addOne = curriedAdd(1);
const addOneTwo = addOne(2);
console.log(addOneTwo(3)); // 6
```

**Arrow Function Currying:**
```javascript
const multiply = a => b => c => a * b * c;

console.log(multiply(2)(3)(4)); // 24

// Create specialized functions
const double = multiply(2);
const doubleAndTriple = double(3);
console.log(doubleAndTriple(5)); // 30
```

**Generic Curry Function:**
```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    } else {
      return function(...args2) {
        return curried.apply(this, args.concat(args2));
      };
    }
  };
}

// Usage
function sum(a, b, c) {
  return a + b + c;
}

const curriedSum = curry(sum);
console.log(curriedSum(1)(2)(3)); // 6
console.log(curriedSum(1, 2)(3)); // 6
console.log(curriedSum(1)(2, 3)); // 6
```

---

### 4️⃣ Partial Application Examples

**Manual Partial Application:**
```javascript
function greet(greeting, name, punctuation) {
  return `${greeting}, ${name}${punctuation}`;
}

// Partial application
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

const sayHello = partial(greet, 'Hello');
const sayHelloJohn = partial(greet, 'Hello', 'John');

console.log(sayHello('Alice', '!')); // "Hello, Alice!"
console.log(sayHelloJohn('.')); // "Hello, John."
```

**Bind for Partial Application:**
```javascript
function calculate(operation, a, b) {
  switch(operation) {
    case 'add': return a + b;
    case 'multiply': return a * b;
    case 'subtract': return a - b;
    default: return 0;
  }
}

// Using bind for partial application
const add = calculate.bind(null, 'add');
const multiply = calculate.bind(null, 'multiply');

console.log(add(5, 3)); // 8
console.log(multiply(4, 6)); // 24
```

---

### 5️⃣ Real-World Applications

**Event Handling:**
```javascript
const handleClick = curry((action, element, event) => {
  console.log(`${action} on ${element.id}`);
  // Handle the action
});

// Create specialized handlers
const handleSave = handleClick('save');
const handleDelete = handleClick('delete');

// Use in event listeners
document.getElementById('saveBtn').onclick = handleSave(document.getElementById('saveBtn'));
document.getElementById('deleteBtn').onclick = handleDelete(document.getElementById('deleteBtn'));
```

**API Requests:**
```javascript
const makeRequest = curry((method, url, data) => {
  return fetch(url, {
    method: method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
});

// Create specialized request functions
const get = makeRequest('GET');
const post = makeRequest('POST');
const put = makeRequest('PUT');

// Usage
const getUsers = get('/api/users');
const createUser = post('/api/users');

getUsers().then(response => response.json());
createUser({ name: 'John', email: 'john@example.com' });
```

**Validation:**
```javascript
const validate = curry((rule, message, value) => {
  if (!rule(value)) {
    throw new Error(message);
  }
  return value;
});

// Create validation rules
const isRequired = value => value != null && value !== '';
const isEmail = value => /\S+@\S+\.\S+/.test(value);
const minLength = min => value => value.length >= min;

// Create validators
const validateRequired = validate(isRequired, 'Field is required');
const validateEmail = validate(isEmail, 'Invalid email format');
const validateMinLength = validate(minLength(8), 'Minimum 8 characters');

// Usage
try {
  const email = validateRequired(validateEmail('user@example.com'));
  const password = validateRequired(validateMinLength('password123'));
  console.log('Validation passed');
} catch (error) {
  console.error(error.message);
}
```

---

### 6️⃣ Key Takeaways

* **Currying** transforms multi-argument functions into single-argument function chains
* **Partial Application** fixes some arguments, creating specialized functions
* Both enable better **function composition** and **reusability**
* Useful for creating **specialized functions** from general ones
* Great for **functional programming** patterns
