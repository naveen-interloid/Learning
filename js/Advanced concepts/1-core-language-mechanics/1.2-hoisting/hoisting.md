# **2. Hoisting (Variable & Function Hoisting)**

### 1️⃣ Explanation

**Hoisting** is JavaScript’s default behavior of moving **variable** and **function** declarations to the top of their scope **before** code execution.

Key points:

* **Function declarations** are hoisted **with their definitions** — can be called before they appear in code.
* **Variable declarations** are hoisted **without values** — initialized to `undefined` until assigned.
* `let` and `const` are also hoisted but stay in a **Temporal Dead Zone (TDZ)** until their declaration line is executed.

---

### 2️⃣ Mental Model

```
Before execution:
JS scans code → moves declarations to top of scope.

Example:
console.log(a); // undefined
var a = 5;

Internally behaves like:
var a;  // hoisted
console.log(a);
a = 5;
```

---

### 3️⃣ Example Code

```javascript
// Function Hoisting
sayHello(); // Works fine
function sayHello() {
  console.log("Hello from hoisted function");
}

// Variable Hoisting with var
console.log(num); // undefined
var num = 10;

// Variable Hoisting with let/const
console.log(age); // ❌ ReferenceError (TDZ)
let age = 25;
```

---

### 4️⃣ Gotchas & Best Practices

* Don’t rely on hoisting for clarity — **declare before use**.
* Prefer `let`/`const` over `var` to avoid accidental `undefined` values.
* Function **expressions** are **not hoisted** like declarations:

  ```javascript
  greet(); // ❌ TypeError
  var greet = function() { console.log("Hi"); };
  ```

---

### 5️⃣ Mini Challenge

Predict the output:

```javascript
greet(); 
console.log(x);
console.log(y);

function greet() {
  console.log("Hey there!");
}

var x = 5;
let y = 10;
```