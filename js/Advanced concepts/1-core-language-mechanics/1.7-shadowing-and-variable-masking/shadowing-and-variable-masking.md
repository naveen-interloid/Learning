# **7. Shadowing & Variable Masking**

### 1️⃣ Explanation

**Shadowing** occurs when a variable in an inner scope has the same name as a variable in an outer scope. The inner variable "shadows" (hides) the outer one within that scope.

Think of it as:
* **Layers of variables** with the same name
* Inner layer **blocks access** to outer layer
* **Temporary hiding** - outer variable still exists
* Can cause confusion and bugs if not understood

---

### 2️⃣ Mental Model

```
Outer Scope
┌─────────────────────┐
│ let name = "Alice"  │
│                     │
│ Inner Scope         │
│ ┌─────────────────┐ │
│ │ let name = "Bob"│ │ ← Shadows outer 'name'
│ │ console.log(name)│ │ → "Bob"
│ └─────────────────┘ │
│                     │
│ console.log(name)   │ → "Alice"
└─────────────────────┘
```

---

### 3️⃣ Basic Examples

**Function Scope Shadowing:**
```javascript
let message = "Global message";

function showMessage() {
  let message = "Local message"; // Shadows global
  console.log(message); // "Local message"
}

showMessage();
console.log(message); // "Global message"
```

**Block Scope Shadowing:**
```javascript
let count = 10;

if (true) {
  let count = 5; // Shadows outer count
  console.log(count); // 5
}

console.log(count); // 10
```

**Parameter Shadowing:**
```javascript
let value = "outer";

function process(value) { // Parameter shadows outer variable
  console.log(value); // Uses parameter, not outer variable
}

process("inner"); // "inner"
console.log(value); // "outer"
```

---

### 4️⃣ Illegal Shadowing

**let/const cannot shadow var in same scope:**
```javascript
function example() {
  var name = "Alice";
  
  if (true) {
    let name = "Bob"; // ❌ SyntaxError: Identifier 'name' has already been declared
  }
}

// But this works (different scopes):
function example2() {
  var name = "Alice";
  
  function inner() {
    let name = "Bob"; // ✅ OK - different function scope
    console.log(name); // "Bob"
  }
  
  inner();
  console.log(name); // "Alice"
}
```

---

### 5️⃣ Common Pitfalls

**Loop Variable Shadowing:**
```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 3, 3, 3 (var has function scope)
  }, 100);
}

for (let i = 0; i < 3; i++) {
  setTimeout(function() {
    console.log(i); // 0, 1, 2 (let has block scope)
  }, 100);
}
```

**Accidental Global Creation:**
```javascript
function createUser() {
  name = "John"; // ❌ Creates global variable (no declaration)
  let age = 25;
}

createUser();
console.log(window.name); // "John" (global)
```

---

### 6️⃣ Key Takeaways

* Inner variables **shadow** outer ones with same name
* **let/const** cannot shadow **var** in same scope
* Use different names to avoid confusion
* Be careful with loop variables and closures
