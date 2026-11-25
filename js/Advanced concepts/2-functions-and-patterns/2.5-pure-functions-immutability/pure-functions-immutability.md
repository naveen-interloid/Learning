# **5. Pure Functions & Immutability**

### 1️⃣ Explanation

**Pure Functions** are functions that:
1. Always return the same output for the same input
2. Have no side effects (don't modify external state)

**Immutability** means data cannot be changed after creation. Instead of modifying, create new data.

Benefits:
* **Predictable** and **testable**
* **No side effects**
* **Easier debugging**
* **Thread-safe** (important for concurrency)

---

### 2️⃣ Pure vs Impure Functions

**Pure Functions:**
```javascript
// Pure - same input, same output, no side effects
function add(a, b) {
  return a + b;
}

function multiply(arr, factor) {
  return arr.map(x => x * factor); // Returns new array
}
```

**Impure Functions:**
```javascript
let count = 0;

// Impure - modifies external state
function increment() {
  count++; // Side effect
  return count;
}

// Impure - depends on external state
function getCount() {
  return count; // Depends on external variable
}

// Impure - modifies input
function addToArray(arr, item) {
  arr.push(item); // Mutates input
  return arr;
}
```

---

### 3️⃣ Immutability Patterns

**Array Operations:**
```javascript
const numbers = [1, 2, 3];

// ❌ Mutating (impure)
numbers.push(4);
numbers[0] = 10;

// ✅ Immutable (pure)
const newNumbers = [...numbers, 4];
const updatedNumbers = numbers.map((x, i) => i === 0 ? 10 : x);
```

**Object Operations:**
```javascript
const user = { name: 'John', age: 30 };

// ❌ Mutating
user.age = 31;

// ✅ Immutable
const updatedUser = { ...user, age: 31 };
const updatedUser2 = Object.assign({}, user, { age: 31 });
```

---

### 4️⃣ Real-World Examples

**State Management:**
```javascript
// Pure reducer function
function todosReducer(state = [], action) {
  switch (action.type) {
    case 'ADD_TODO':
      return [...state, action.todo]; // New array
    
    case 'TOGGLE_TODO':
      return state.map(todo =>
        todo.id === action.id
          ? { ...todo, completed: !todo.completed }
          : todo
      );
    
    default:
      return state;
  }
}
```

**Data Processing:**
```javascript
const users = [
  { name: 'Alice', age: 25, active: true },
  { name: 'Bob', age: 30, active: false }
];

// Pure function pipeline
const processUsers = (users) =>
  users
    .filter(user => user.active)
    .map(user => ({ ...user, name: user.name.toUpperCase() }))
    .sort((a, b) => a.age - b.age);

const processed = processUsers(users);
// Original users array unchanged
```

---

### 5️⃣ Key Takeaways

* **Pure functions** are predictable and testable
* **Immutability** prevents unexpected data changes
* Use **spread operator** and **array methods** for immutable operations
* Essential for **functional programming** and **state management**
* Makes code more **reliable** and **maintainable**
