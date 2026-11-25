# **3. Scope (Global, Local, Block, Lexical)**

### 1️⃣ Explanation

**Scope** defines **where** variables and functions can be accessed in your code.

Types of scope in JavaScript:

1. **Global Scope** – variables accessible from anywhere in the code.
2. **Function Scope (Local)** – variables declared inside a function are only accessible inside that function.
3. **Block Scope** – variables declared with `let` and `const` inside `{}` are only accessible within that block.
4. **Lexical Scope** – a function can access variables from the scope in which it was **created**, even if called from somewhere else.

---

### 2️⃣ Mental Model

```
Global Scope
 ├── Function Scope
 │     └── Block Scope
 └── Another Function Scope

Lexical Scope:
Outer variables are remembered by inner functions.
```

---

### 3️⃣ Example Code

```javascript
// Global Scope
let globalVar = "I am global";

function outer() {
  // Function Scope
  let outerVar = "I am outer";

  if (true) {
    // Block Scope
    let blockVar = "I am block";
    console.log(globalVar); // ✅ Accessible
    console.log(outerVar);  // ✅ Accessible
    console.log(blockVar);  // ✅ Accessible
  }

  // console.log(blockVar); // ❌ ReferenceError
}

outer();

// Lexical Scope Example
function parent() {
  let name = "Vikram";

  function child() {
    console.log(name); // ✅ Can access parent's variable
  }

  return child;
}

const myFunc = parent();
myFunc(); // "Vikram"
```

---

### 4️⃣ Gotchas & Best Practices

* `var` is **function-scoped**, not block-scoped → can leak outside `{}`.
* Always prefer `let` and `const` for predictable scope behavior.
* Lexical scope is **decided at write-time**, not at run-time.

---

### 5️⃣ Mini Challenge

Predict the output:

```javascript
var a = 1;

function test() {
  var a = 2;
  if (true) {
    let a = 3;
    console.log(a); // ?
  }
  console.log(a); // ?
}

test();
console.log(a); // ?
```