# **Loops and Iterations in JavaScript** 🔄

Loops are fundamental programming constructs that allow you to execute code repeatedly based on certain conditions. They are essential for automating repetitive tasks, processing collections of data, and implementing algorithms efficiently.

## **Why Do We Need Loops?**

Without loops, you'd have to write repetitive code:
```javascript
// Without loops - repetitive and inefficient
console.log("Hello 1");
console.log("Hello 2");
console.log("Hello 3");
console.log("Hello 4");
console.log("Hello 5");

// With loops - clean and scalable
for (let i = 1; i <= 5; i++) {
  console.log(`Hello ${i}`);
}
```

---

## **1. `for` Loop - The Precision Tool** 🎯

The `for` loop is the most structured and commonly used loop when you know exactly how many iterations you need.

### **Syntax Breakdown:**
```javascript
for (initialization; condition; increment/decrement) {
  // Code to execute
}
```

### **Detailed Examples:**

#### **Basic Counting:**
```javascript
// Count from 0 to 4
for (let i = 0; i < 5; i++) {
  console.log(`Iteration: ${i}`);
}
// Output: Iteration: 0, Iteration: 1, Iteration: 2, Iteration: 3, Iteration: 4
```

#### **Array Processing:**
```javascript
const fruits = ['apple', 'banana', 'orange', 'grape'];
for (let i = 0; i < fruits.length; i++) {
  console.log(`Index ${i}: ${fruits[i]}`);
}
// Output: Index 0: apple, Index 1: banana, Index 2: orange, Index 3: grape
```

#### **Reverse Iteration:**
```javascript
for (let i = 5; i > 0; i--) {
  console.log(`Countdown: ${i}`);
}
// Output: Countdown: 5, Countdown: 4, Countdown: 3, Countdown: 2, Countdown: 1
```

#### **Step by Different Values:**
```javascript
// Count by 2s
for (let i = 0; i <= 10; i += 2) {
  console.log(i); // 0, 2, 4, 6, 8, 10
}
```

### **Advanced `for` Loop Patterns:**

#### **Nested Loops (Multiplication Table):**
```javascript
for (let i = 1; i <= 3; i++) {
  for (let j = 1; j <= 3; j++) {
    console.log(`${i} x ${j} = ${i * j}`);
  }
}
```

#### **Multiple Variables:**
```javascript
for (let i = 0, j = 10; i < 5; i++, j--) {
  console.log(`i: ${i}, j: ${j}`);
}
```

---

## **2. `do...while` Loop - Execute First, Ask Questions Later** ✅

The `do...while` loop guarantees at least one execution because it checks the condition **after** running the code block.

### **Syntax:**
```javascript
do {
  // Code to execute
} while (condition);
```

### **Detailed Examples:**

#### **User Input Validation:**
```javascript
let userInput;
do {
  userInput = prompt("Enter a number between 1 and 10:");
  if (userInput < 1 || userInput > 10) {
    alert("Invalid input! Please try again.");
  }
} while (userInput < 1 || userInput > 10);
console.log(`Valid input received: ${userInput}`);
```

#### **Menu System:**
```javascript
let choice;
do {
  console.log("\n=== MENU ===");
  console.log("1. View Profile");
  console.log("2. Settings");
  console.log("3. Exit");
  choice = parseInt(prompt("Enter your choice:"));
  
  switch(choice) {
    case 1: console.log("Viewing profile..."); break;
    case 2: console.log("Opening settings..."); break;
    case 3: console.log("Goodbye!"); break;
    default: console.log("Invalid choice!");
  }
} while (choice !== 3);
```

#### **Game Loop Example:**
```javascript
let playAgain;
do {
  let randomNumber = Math.floor(Math.random() * 10) + 1;
  let guess = parseInt(prompt("Guess a number between 1-10:"));
  
  if (guess === randomNumber) {
    console.log("Correct! You win!");
  } else {
    console.log(`Wrong! The number was ${randomNumber}`);
  }
  
  playAgain = confirm("Play again?");
} while (playAgain);
```

---

## **3. `while` Loop - The Conditional Repeater** 🔄

The `while` loop checks the condition **before** each iteration, making it perfect for situations where you don't know the exact number of iterations needed.

### **Syntax:**
```javascript
while (condition) {
  // Code to execute
  // Don't forget to update the condition!
}
```

### **Detailed Examples:**

#### **Basic Counter:**
```javascript
let count = 0;
while (count < 5) {
  console.log(`Count is: ${count}`);
  count++; // Critical: update the condition variable
}
```

#### **Processing Until Condition Met:**
```javascript
let numbers = [1, 3, 5, 8, 9, 12];
let index = 0;
let firstEven;

while (index < numbers.length) {
  if (numbers[index] % 2 === 0) {
    firstEven = numbers[index];
    break; // Exit when first even number is found
  }
  index++;
}
console.log(`First even number: ${firstEven}`); // 8
```

#### **Reading Data Until End:**
```javascript
let data = ["apple", "banana", "", "orange", "grape"];
let i = 0;

while (i < data.length && data[i] !== "") {
  console.log(`Processing: ${data[i]}`);
  i++;
}
console.log("Stopped at empty string or end of array");
```

#### **Infinite Loop Prevention:**
```javascript
let attempts = 0;
let maxAttempts = 5;
let success = false;

while (!success && attempts < maxAttempts) {
  console.log(`Attempt ${attempts + 1}`);
  // Simulate some operation that might succeed
  success = Math.random() > 0.7; // 30% chance of success
  attempts++;
}

if (success) {
  console.log("Operation succeeded!");
} else {
  console.log("Max attempts reached. Operation failed.");
}
```

---

## **4. `break` and `continue` - Flow Control Masters** 🚦

These statements provide fine-grained control over loop execution flow.

### **`break` Statement - Emergency Exit:**

#### **Exit Loop Completely:**
```javascript
for (let i = 0; i < 10; i++) {
  if (i === 5) {
    console.log("Breaking at 5");
    break; // Exits the entire loop
  }
  console.log(i); // Outputs: 0, 1, 2, 3, 4
}
console.log("Loop ended");
```

#### **Search and Stop:**
```javascript
const users = ['john', 'jane', 'admin', 'bob', 'alice'];
let adminFound = false;

for (let i = 0; i < users.length; i++) {
  console.log(`Checking user: ${users[i]}`);
  if (users[i] === 'admin') {
    console.log("Admin user found!");
    adminFound = true;
    break; // Stop searching once found
  }
}
```

#### **Breaking from Nested Loops:**
```javascript
outerLoop: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (i === 1 && j === 1) {
      console.log("Breaking from both loops");
      break outerLoop; // Breaks from the labeled outer loop
    }
    console.log(`i: ${i}, j: ${j}`);
  }
}
```

### **`continue` Statement - Skip and Move On:**

#### **Skip Specific Values:**
```javascript
for (let i = 0; i < 10; i++) {
  if (i % 2 === 0) {
    continue; // Skip even numbers
  }
  console.log(`Odd number: ${i}`); // Outputs: 1, 3, 5, 7, 9
}
```

#### **Data Filtering:**
```javascript
const scores = [85, -1, 92, 0, 78, -5, 88];

for (let i = 0; i < scores.length; i++) {
  if (scores[i] < 0) {
    console.log(`Skipping invalid score: ${scores[i]}`);
    continue; // Skip invalid scores
  }
  
  if (scores[i] === 0) {
    console.log("Skipping zero score");
    continue;
  }
  
  console.log(`Valid score: ${scores[i]}`);
}
```

#### **Complex Condition Skipping:**
```javascript
const products = [
  { name: 'Laptop', price: 1000, inStock: true },
  { name: 'Phone', price: 500, inStock: false },
  { name: 'Tablet', price: 300, inStock: true },
  { name: 'Watch', price: 200, inStock: false }
];

for (let i = 0; i < products.length; i++) {
  // Skip out-of-stock items
  if (!products[i].inStock) {
    console.log(`${products[i].name} is out of stock - skipping`);
    continue;
  }
  
  // Skip expensive items
  if (products[i].price > 800) {
    console.log(`${products[i].name} is too expensive - skipping`);
    continue;
  }
  
  console.log(`Available: ${products[i].name} - $${products[i].price}`);
}
```

---

## **5. `for...of` Loop - The Value Iterator** 🎯

Modern ES6 loop that iterates over **values** of iterable objects. It's cleaner and more readable than traditional `for` loops when you don't need indices.

### **Syntax:**
```javascript
for (const/let variable of iterable) {
  // Code to execute
}
```

### **Detailed Examples:**

#### **Array Iteration:**
```javascript
const colors = ['red', 'green', 'blue', 'yellow'];

for (const color of colors) {
  console.log(`Color: ${color}`);
}
// Output: Color: red, Color: green, Color: blue, Color: yellow
```

#### **String Iteration:**
```javascript
const message = "Hello";

for (const char of message) {
  console.log(`Character: ${char}`);
}
// Output: Character: H, Character: e, Character: l, Character: l, Character: o
```

#### **Working with Objects in Arrays:**
```javascript
const students = [
  { name: 'Alice', grade: 85 },
  { name: 'Bob', grade: 92 },
  { name: 'Charlie', grade: 78 }
];

for (const student of students) {
  console.log(`${student.name}: ${student.grade}%`);
  if (student.grade >= 90) {
    console.log(`${student.name} gets an A!`);
  }
}
```

#### **Set and Map Iteration:**
```javascript
// With Set
const uniqueNumbers = new Set([1, 2, 3, 2, 1, 4]);
for (const num of uniqueNumbers) {
  console.log(num); // 1, 2, 3, 4 (duplicates removed)
}

// With Map
const userRoles = new Map([
  ['john', 'admin'],
  ['jane', 'user'],
  ['bob', 'moderator']
]);

for (const [username, role] of userRoles) {
  console.log(`${username}: ${role}`);
}
```

#### **Destructuring in `for...of`:**
```javascript
const coordinates = [[0, 0], [1, 2], [3, 4]];

for (const [x, y] of coordinates) {
  console.log(`Point: (${x}, ${y})`);
}
```

---

## **6. `for...in` Loop - The Property Explorer** 🔍

Iterates over **enumerable properties** (keys) of an object. Best used with objects, not arrays.

### **Syntax:**
```javascript
for (const/let key in object) {
  // Code to execute
}
```

### **Detailed Examples:**

#### **Object Property Iteration:**
```javascript
const person = {
  name: 'John Doe',
  age: 30,
  city: 'New York',
  occupation: 'Developer'
};

for (const key in person) {
  console.log(`${key}: ${person[key]}`);
}
// Output: name: John Doe, age: 30, city: New York, occupation: Developer
```

#### **Dynamic Object Processing:**
```javascript
const config = {
  theme: 'dark',
  language: 'en',
  notifications: true,
  autoSave: false
};

console.log("Current Settings:");
for (const setting in config) {
  const value = config[setting];
  const status = typeof value === 'boolean' ? (value ? 'enabled' : 'disabled') : value;
  console.log(`${setting}: ${status}`);
}
```

#### **Object Validation:**
```javascript
const requiredFields = ['name', 'email', 'password'];
const userInput = {
  name: 'Alice',
  email: 'alice@example.com',
  age: 25
  // password is missing
};

const missingFields = [];
for (const field of requiredFields) {
  if (!(field in userInput)) {
    missingFields.push(field);
  }
}

if (missingFields.length > 0) {
  console.log(`Missing required fields: ${missingFields.join(', ')}`);
} else {
  console.log("All required fields present");
}
```

#### **Filtering Object Properties:**
```javascript
const data = {
  id: 1,
  name: 'Product A',
  price: 99.99,
  _internal: 'secret',
  __proto: 'inherited'
};

console.log("Public properties:");
for (const key in data) {
  // Skip private properties (starting with _)
  if (key.startsWith('_')) {
    continue;
  }
  console.log(`${key}: ${data[key]}`);
}
```

---

## **Performance Comparison and Best Practices** ⚡

### **Performance Rankings (fastest to slowest):**
1. **Traditional `for` loop** - Fastest for arrays with indices
2. **`while` loop** - Very fast, good for unknown iterations
3. **`for...of` loop** - Fast and readable for values
4. **`for...in` loop** - Slower, use only for objects

### **When to Use Each Loop:**

| Loop Type | Best For | Avoid When |
|-----------|----------|------------|
| `for` | Known iterations, need index, performance critical | Simple value iteration |
| `while` | Unknown iterations, complex conditions | Known iteration count |
| `do...while` | Need at least one execution | Condition might be false initially |
| `for...of` | Iterating values, readability important | Need index, performance critical |
| `for...in` | Object properties | Arrays, performance critical |

### **Common Pitfalls and Solutions:**

#### **1. Infinite Loops:**
```javascript
// ❌ Bad - infinite loop
let i = 0;
while (i < 10) {
  console.log(i);
  // Forgot to increment i!
}

// ✅ Good - proper increment
let i = 0;
while (i < 10) {
  console.log(i);
  i++; // Always update condition variable
}
```

#### **2. Using `for...in` with Arrays:**
```javascript
const arr = ['a', 'b', 'c'];
arr.customProperty = 'custom';

// ❌ Bad - includes custom properties
for (const key in arr) {
  console.log(key); // 0, 1, 2, customProperty
}

// ✅ Good - only array elements
for (const value of arr) {
  console.log(value); // a, b, c
}
```

#### **3. Modifying Arrays During Iteration:**
```javascript
const numbers = [1, 2, 3, 4, 5];

// ❌ Bad - modifying array while iterating
for (let i = 0; i < numbers.length; i++) {
  if (numbers[i] % 2 === 0) {
    numbers.splice(i, 1); // This changes array length!
  }
}

// ✅ Good - iterate backwards when removing
for (let i = numbers.length - 1; i >= 0; i--) {
  if (numbers[i] % 2 === 0) {
    numbers.splice(i, 1);
  }
}
```

---

## **Advanced Loop Patterns** 🚀

### **1. Loop with Error Handling:**
```javascript
const urls = ['url1', 'url2', 'url3'];

for (const url of urls) {
  try {
    // Simulate API call
    console.log(`Processing ${url}`);
    if (Math.random() > 0.7) {
      throw new Error('Network error');
    }
    console.log(`✅ ${url} processed successfully`);
  } catch (error) {
    console.log(`❌ Failed to process ${url}: ${error.message}`);
    continue; // Continue with next URL
  }
}
```

### **2. Async Loops (Sequential vs Parallel):**
```javascript
const delays = [1000, 2000, 1500];

// Sequential processing
console.log("Sequential processing:");
for (const delay of delays) {
  await new Promise(resolve => setTimeout(resolve, delay));
  console.log(`Processed after ${delay}ms`);
}

// Parallel processing
console.log("Parallel processing:");
const promises = delays.map(delay => 
  new Promise(resolve => setTimeout(() => resolve(delay), delay))
);
const results = await Promise.all(promises);
console.log("All processed:", results);
```

### **3. Generator Functions with Loops:**
```javascript
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
for (let i = 0; i < 10; i++) {
  console.log(fib.next().value);
}
```

---

## **Real-World Examples** 🌍

### **1. Data Processing Pipeline:**
```javascript
const rawData = [
  { name: 'john', age: '25', email: 'JOHN@EXAMPLE.COM' },
  { name: 'jane', age: '30', email: 'jane@example.com' },
  { name: '', age: '35', email: 'invalid-email' }
];

const processedData = [];

for (const record of rawData) {
  // Skip records with missing name
  if (!record.name.trim()) {
    console.log('Skipping record with missing name');
    continue;
  }
  
  // Process and clean data
  const processed = {
    name: record.name.charAt(0).toUpperCase() + record.name.slice(1).toLowerCase(),
    age: parseInt(record.age),
    email: record.email.toLowerCase()
  };
  
  // Validate email format
  if (!processed.email.includes('@')) {
    console.log(`Invalid email for ${processed.name}, skipping`);
    continue;
  }
  
  processedData.push(processed);
}

console.log('Processed data:', processedData);
```

### **2. Shopping Cart Calculator:**
```javascript
const cart = [
  { name: 'Laptop', price: 999.99, quantity: 1, discount: 0.1 },
  { name: 'Mouse', price: 29.99, quantity: 2, discount: 0 },
  { name: 'Keyboard', price: 79.99, quantity: 1, discount: 0.05 }
];

let totalAmount = 0;
let totalItems = 0;

console.log('=== SHOPPING CART ===');
for (const item of cart) {
  const itemTotal = item.price * item.quantity;
  const discountAmount = itemTotal * item.discount;
  const finalPrice = itemTotal - discountAmount;
  
  console.log(`${item.name}: $${item.price} x ${item.quantity} = $${itemTotal.toFixed(2)}`);
  if (item.discount > 0) {
    console.log(`  Discount (${(item.discount * 100)}%): -$${discountAmount.toFixed(2)}`);
    console.log(`  Final: $${finalPrice.toFixed(2)}`);
  }
  
  totalAmount += finalPrice;
  totalItems += item.quantity;
}

console.log(`\nTotal Items: ${totalItems}`);
console.log(`Total Amount: $${totalAmount.toFixed(2)}`);
```

### **3. Form Validation:**
```javascript
const formData = {
  username: 'john_doe',
  email: 'john@example.com',
  password: 'mypassword123',
  confirmPassword: 'mypassword123',
  age: '25'
};

const validationRules = {
  username: { required: true, minLength: 3, maxLength: 20 },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  password: { required: true, minLength: 8 },
  confirmPassword: { required: true, mustMatch: 'password' },
  age: { required: true, min: 18, max: 120 }
};

const errors = [];

for (const field in validationRules) {
  const value = formData[field];
  const rules = validationRules[field];
  
  // Check required
  if (rules.required && (!value || value.trim() === '')) {
    errors.push(`${field} is required`);
    continue;
  }
  
  // Check minimum length
  if (rules.minLength && value.length < rules.minLength) {
    errors.push(`${field} must be at least ${rules.minLength} characters`);
  }
  
  // Check maximum length
  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(`${field} must be no more than ${rules.maxLength} characters`);
  }
  
  // Check pattern
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push(`${field} format is invalid`);
  }
  
  // Check numeric range
  if (rules.min !== undefined || rules.max !== undefined) {
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      errors.push(`${field} must be a number`);
    } else {
      if (rules.min !== undefined && numValue < rules.min) {
        errors.push(`${field} must be at least ${rules.min}`);
      }
      if (rules.max !== undefined && numValue > rules.max) {
        errors.push(`${field} must be no more than ${rules.max}`);
      }
    }
  }
  
  // Check field matching
  if (rules.mustMatch && value !== formData[rules.mustMatch]) {
    errors.push(`${field} must match ${rules.mustMatch}`);
  }
}

if (errors.length > 0) {
  console.log('Validation errors:');
  for (const error of errors) {
    console.log(`- ${error}`);
  }
} else {
  console.log('Form validation passed!');
}
```

---

## **Summary** 📝

Loops are essential tools for efficient programming. Choose the right loop for your specific use case:

- **`for`**: When you know the iteration count
- **`while`**: For condition-based repetition
- **`do...while`**: When you need at least one execution
- **`for...of`**: For clean value iteration
- **`for...in`**: For object property enumeration

Remember to always ensure your loops have proper exit conditions and consider performance implications for large datasets. Master these concepts, and you'll be able to handle any repetitive programming task efficiently!
