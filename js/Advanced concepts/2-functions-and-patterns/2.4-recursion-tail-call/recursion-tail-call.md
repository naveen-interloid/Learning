# **4. Recursion & Tail Call Optimization**

### 1️⃣ Explanation

**Recursion** is when a function calls itself to solve a problem by breaking it into smaller subproblems.

**Tail Call Optimization** (TCO) is when the recursive call is the last operation in the function, allowing the engine to optimize memory usage.

Key concepts:
* **Base case** - condition to stop recursion
* **Recursive case** - function calls itself
* **Stack overflow** - too many recursive calls

---

### 2️⃣ Basic Examples

**Simple Recursion:**
```javascript
function factorial(n) {
  // Base case
  if (n <= 1) return 1;
  
  // Recursive case
  return n * factorial(n - 1);
}

console.log(factorial(5)); // 120
```

**Tail-Recursive Version:**
```javascript
function factorialTail(n, acc = 1) {
  if (n <= 1) return acc;
  return factorialTail(n - 1, n * acc); // Tail call
}

console.log(factorialTail(5)); // 120
```

---

### 3️⃣ Common Patterns

**Fibonacci:**
```javascript
// Regular recursion (inefficient)
function fib(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
}

// Tail-recursive with memoization
function fibTail(n, a = 0, b = 1) {
  if (n === 0) return a;
  return fibTail(n - 1, b, a + b);
}
```

**Tree Traversal:**
```javascript
function sumTree(node) {
  if (!node) return 0;
  return node.value + sumTree(node.left) + sumTree(node.right);
}
```

---

### 4️⃣ Key Takeaways

* Recursion breaks problems into smaller subproblems
* Always need a **base case** to prevent infinite recursion
* **Tail recursion** can be optimized by JavaScript engines
* Watch out for **stack overflow** with deep recursion
* Consider **iterative solutions** for better performance
