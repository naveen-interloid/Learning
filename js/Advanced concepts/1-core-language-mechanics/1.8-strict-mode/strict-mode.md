# **8. Strict Mode (`"use strict"`)**

### 1️⃣ Explanation

**Strict Mode** is a way to opt into a restricted variant of JavaScript. It eliminates some JavaScript silent errors by changing them to throw errors, fixes mistakes that make it difficult for JavaScript engines to perform optimizations, and prohibits some syntax likely to be defined in future versions of ECMAScript.

Benefits:
* **Catches common coding mistakes** and throws errors
* **Prevents accidental globals**
* **Makes debugging easier**
* **Improves performance** (engines can optimize better)
* **Prepares code for future JavaScript versions**

---

### 2️⃣ How to Enable

**Global Strict Mode:**
```javascript
"use strict";

// All code in this file runs in strict mode
function myFunction() {
  // This function runs in strict mode
}
```

**Function-level Strict Mode:**
```javascript
function strictFunction() {
  "use strict";
  // Only this function runs in strict mode
}

function normalFunction() {
  // This function runs in normal mode
}
```

---

### 3️⃣ Key Differences

**1. Prevents Accidental Globals:**
```javascript
// Normal mode
function createUser() {
  name = "John"; // Creates global variable
}

// Strict mode
function createUser() {
  "use strict";
  name = "John"; // ❌ ReferenceError: name is not defined
}
```

**2. this in Functions:**
```javascript
function showThis() {
  console.log(this);
}

// Normal mode
showThis(); // Window object

// Strict mode
function showThis() {
  "use strict";
  console.log(this); // undefined
}
```

**3. Duplicate Parameters:**
```javascript
// Normal mode - allowed (last parameter wins)
function add(a, a, b) {
  return a + b; // Uses second 'a'
}

// Strict mode - error
function add(a, a, b) {
  "use strict"; // ❌ SyntaxError: Duplicate parameter name
  return a + b;
}
```

**4. Octal Literals:**
```javascript
// Normal mode
var num = 010; // 8 in decimal

// Strict mode
"use strict";
var num = 010; // ❌ SyntaxError: Octal literals are not allowed
```

---

### 4️⃣ Key Takeaways

* Use `"use strict"` to catch errors early
* Prevents accidental global variables
* Makes `this` undefined in functions
* Essential for modern JavaScript development
* All ES6 modules are automatically in strict mode
