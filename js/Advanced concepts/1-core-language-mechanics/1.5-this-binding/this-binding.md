# **5. `this` Binding & Rules**

### 1️⃣ Explanation

`this` is a special keyword in JavaScript that refers to the **context** in which a function is called. Unlike other programming languages, `this` in JavaScript is determined by **how** a function is called, not where it's defined.

Think of `this` as:
* A **reference** to an object
* **Dynamic** - changes based on call site
* **Context-dependent** - same function can have different `this` values

**4 Rules of `this` Binding:**
1. **Default Binding** - standalone function calls
2. **Implicit Binding** - method calls on objects
3. **Explicit Binding** - using call(), apply(), bind()
4. **New Binding** - constructor functions with `new`

---

### 2️⃣ Mental Model

```
Function Call Hierarchy (Priority Order):
┌─────────────────────┐
│ 1. new binding      │ ← Highest priority
├─────────────────────┤
│ 2. Explicit binding │
├─────────────────────┤
│ 3. Implicit binding │
├─────────────────────┤
│ 4. Default binding  │ ← Lowest priority
└─────────────────────┘
```

---

### 3️⃣ The Four Rules

**1. Default Binding**
```javascript
function sayHello() {
  console.log(this); // Window object (or undefined in strict mode)
}

sayHello(); // Standalone function call

// In strict mode:
"use strict";
function strictHello() {
  console.log(this); // undefined
}
strictHello();
```

**2. Implicit Binding**
```javascript
const person = {
  name: 'Alice',
  greet: function() {
    console.log(`Hello, I'm ${this.name}`);
  }
};

person.greet(); // "Hello, I'm Alice"
// this = person object

// Lost implicit binding:
const greetFunc = person.greet;
greetFunc(); // "Hello, I'm undefined" (this = window/undefined)
```

**3. Explicit Binding**
```javascript
function introduce() {
  console.log(`Hi, I'm ${this.name} and I'm ${this.age} years old`);
}

const person1 = { name: 'Bob', age: 25 };
const person2 = { name: 'Carol', age: 30 };

// call() - immediate invocation
introduce.call(person1); // "Hi, I'm Bob and I'm 25 years old"
introduce.call(person2); // "Hi, I'm Carol and I'm 30 years old"

// apply() - with arguments array
function greetWithTitle(title, greeting) {
  console.log(`${greeting} ${title} ${this.name}`);
}

greetWithTitle.apply(person1, ['Mr.', 'Hello']); // "Hello Mr. Bob"

// bind() - returns new function
const boundIntroduce = introduce.bind(person1);
boundIntroduce(); // "Hi, I'm Bob and I'm 25 years old"
```

**4. New Binding**
```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
  this.greet = function() {
    console.log(`Hello, I'm ${this.name}`);
  };
}

const alice = new Person('Alice', 28);
alice.greet(); // "Hello, I'm Alice"
// this = newly created object
```

---

### 4️⃣ Arrow Functions - Special Case

Arrow functions **don't have their own `this`** - they inherit from enclosing scope:

```javascript
const obj = {
  name: 'David',
  
  // Regular function
  regularMethod: function() {
    console.log(`Regular: ${this.name}`); // this = obj
    
    // Arrow function inside
    const arrowInside = () => {
      console.log(`Arrow inside: ${this.name}`); // this = obj (inherited)
    };
    arrowInside();
  },
  
  // Arrow function as method
  arrowMethod: () => {
    console.log(`Arrow method: ${this.name}`); // this = window/undefined
  }
};

obj.regularMethod(); 
// "Regular: David"
// "Arrow inside: David"

obj.arrowMethod(); 
// "Arrow method: undefined"
```

**Practical Arrow Function Example:**
```javascript
class Timer {
  constructor() {
    this.seconds = 0;
  }
  
  start() {
    // ❌ Regular function loses 'this'
    // setInterval(function() {
    //   this.seconds++; // this = window
    // }, 1000);
    
    // ✅ Arrow function preserves 'this'
    setInterval(() => {
      this.seconds++; // this = Timer instance
      console.log(this.seconds);
    }, 1000);
  }
}

const timer = new Timer();
timer.start();
```

---

### 5️⃣ Common Pitfalls

**Lost Context in Callbacks:**
```javascript
class Button {
  constructor(element) {
    this.element = element;
    this.clickCount = 0;
  }
  
  // ❌ Wrong way
  handleClickWrong() {
    this.clickCount++;
    console.log(`Clicked ${this.clickCount} times`);
  }
  
  // ✅ Right way - arrow function
  handleClickRight = () => {
    this.clickCount++;
    console.log(`Clicked ${this.clickCount} times`);
  }
  
  init() {
    // ❌ This loses context
    this.element.addEventListener('click', this.handleClickWrong);
    
    // ✅ These preserve context
    this.element.addEventListener('click', this.handleClickRight);
    // OR
    this.element.addEventListener('click', this.handleClickWrong.bind(this));
  }
}
```

**Method Assignment:**
```javascript
const calculator = {
  value: 0,
  add: function(num) {
    this.value += num;
    return this;
  }
};

// ❌ Lost context
const addFunction = calculator.add;
addFunction(5); // Error: Cannot read property 'value' of undefined

// ✅ Preserve context
const boundAdd = calculator.add.bind(calculator);
boundAdd(5); // Works correctly
```

---

### 6️⃣ Real-World Examples

**Event Handling in Classes:**
```javascript
class TodoApp {
  constructor() {
    this.todos = [];
    this.init();
  }
  
  addTodo = (text) => {
    this.todos.push({ id: Date.now(), text, completed: false });
    this.render();
  }
  
  toggleTodo = (id) => {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.render();
    }
  }
  
  init() {
    document.getElementById('add-btn').onclick = () => {
      const input = document.getElementById('todo-input');
      this.addTodo(input.value);
      input.value = '';
    };
  }
  
  render() {
    // Render todos to DOM
    console.log('Current todos:', this.todos);
  }
}
```

**API Calls with Context:**
```javascript
class UserService {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.users = [];
  }
  
  fetchUsers = async () => {
    try {
      const response = await fetch(`${this.apiUrl}/users`);
      this.users = await response.json();
      this.onUsersLoaded();
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }
  
  onUsersLoaded() {
    console.log(`Loaded ${this.users.length} users`);
  }
}

const userService = new UserService('https://api.example.com');
// Arrow function preserves 'this' context
setTimeout(userService.fetchUsers, 1000);
```

---

### 7️⃣ Mini Challenge

Fix the `this` binding issues in this code:

```javascript
const game = {
  score: 0,
  level: 1,
  
  increaseScore: function(points) {
    this.score += points;
    console.log(`Score: ${this.score}`);
  },
  
  levelUp: function() {
    this.level++;
    console.log(`Level: ${this.level}`);
  },
  
  start: function() {
    // These will lose 'this' context - fix them!
    setTimeout(this.increaseScore, 1000);
    setInterval(this.levelUp, 5000);
  }
};

game.start();
```

---

### 8️⃣ Key Takeaways

* `this` is determined by **call site**, not definition site
* **4 binding rules** with priority order: new > explicit > implicit > default
* **Arrow functions** inherit `this` from enclosing scope
* Use **bind()**, **call()**, **apply()** for explicit control
* **Arrow functions** are great for preserving context in callbacks
* Always consider `this` context when passing methods as callbacks
