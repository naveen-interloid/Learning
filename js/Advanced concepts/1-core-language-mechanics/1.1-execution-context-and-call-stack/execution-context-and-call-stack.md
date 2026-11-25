# **1. Execution Context & Call Stack**

### 1️⃣ Explanation

In JavaScript, code doesn’t just run randomly — it runs inside an **Execution Context**.

Think of it as:

* A **container** where code is evaluated and executed
* Keeps track of **variables**, **functions**, and **`this` value**
* Has two phases:

  1. **Creation Phase** – JS sets up memory for variables & functions (**hoisting** happens here)
  2. **Execution Phase** – JS actually runs your code line by line

The **Call Stack** is like a stack of plates:

* Every time you call a function, a new Execution Context is **pushed** on top.
* When the function finishes, that Execution Context is **popped** off.
* The browser keeps doing this until the stack is empty.

---

### 2️⃣ Mental Model

```
Call Stack (top is last called):
┌──────────────┐
│ sayHello()   │ ← currently running
├──────────────┤
│ main()       │
└──────────────┘
```

---

### 3️⃣ Example Code

```javascript
function greet(name) {
  console.log("Hello " + name);
}

function sayHello() {
  greet("Vikram");
}

function main() {
  sayHello();
}

main();
```

**Call Stack Steps**:

1. `main()` → pushed
2. `sayHello()` → pushed
3. `greet("Vikram")` → pushed
4. `console.log()` → pushed
5. `console.log()` → popped
6. `greet()` → popped
7. `sayHello()` → popped
8. `main()` → popped

---

### 4️⃣ Gotchas & Best Practices

* Too much recursion can cause **"Maximum call stack size exceeded"** error.
* Keep functions short to avoid deep stack nesting.
* JS is **single-threaded** — only one Call Stack at a time.

---

### 5️⃣ Mini Challenge

Predict the order of logs:

```javascript
function a() {
  console.log("A1");
  b();
  console.log("A2");
}

function b() {
  console.log("B1");
  c();
  console.log("B2");
}

function c() {
  console.log("C1");
}

a();
```
