# **3. Function Composition**

### 1️⃣ Explanation

**Function Composition** is combining simple functions to build more complex operations. It's based on the mathematical concept: `f(g(x))`.

Think of it as:
* **Chaining functions** together
* **Output of one** becomes **input of next**
* Creates **readable** and **maintainable** code
* **Right-to-left** execution (like math)

---

### 2️⃣ Mental Model

```
compose(f, g, h)(x) = f(g(h(x)))

x → h(x) → g(h(x)) → f(g(h(x)))
```

---

### 3️⃣ Basic Examples

**Manual Composition:**
```javascript
const add = x => x + 1;
const multiply = x => x * 2;
const square = x => x * x;

// Manual composition
const result = add(multiply(square(3)));
console.log(result); // 19 (3² = 9, 9*2 = 18, 18+1 = 19)

// Compose function
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

const transform = compose(add, multiply, square);
console.log(transform(3)); // 19
```

**Pipe (Left-to-Right):**
```javascript
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

const transform2 = pipe(square, multiply, add);
console.log(transform2(3)); // 19
```

---

### 4️⃣ Real-World Example

**Data Processing Pipeline:**
```javascript
const users = [
  { name: 'alice', age: 25, active: true },
  { name: 'bob', age: 30, active: false },
  { name: 'carol', age: 35, active: true }
];

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);
const getActiveUsers = users => users.filter(user => user.active);
const getNames = users => users.map(user => user.name);
const capitalizeNames = names => names.map(capitalize);

// Composed pipeline
const processUsers = pipe(
  getActiveUsers,
  getNames,
  capitalizeNames
);

console.log(processUsers(users)); // ['Alice', 'Carol']
```

---

### 5️⃣ Key Takeaways

* Combines simple functions into complex operations
* **Compose** = right-to-left, **Pipe** = left-to-right
* Creates readable data processing pipelines
* Essential for functional programming
* Promotes code reusability
