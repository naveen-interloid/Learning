# **7. Factory Functions vs Constructor Functions**

### 1️⃣ Explanation

**Factory Functions** and **Constructor Functions** are two different approaches to creating objects in JavaScript. Each has its own advantages and use cases.

**Factory Function**: Regular function that returns a new object
**Constructor Function**: Function called with `new` keyword to create instances

---

### 2️⃣ Constructor Functions

**Basic Constructor:**
```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

Person.prototype.greet = function() {
  return `Hello, I'm ${this.name}`;
};

Person.prototype.getAge = function() {
  return this.age;
};

// Usage
const alice = new Person('Alice', 25);
const bob = new Person('Bob', 30);

console.log(alice.greet()); // "Hello, I'm Alice"
console.log(alice instanceof Person); // true
```

**Pros of Constructor Functions:**
- **Prototype chain** - memory efficient method sharing
- **instanceof** works correctly
- **Familiar OOP pattern** for developers from other languages
- **Performance** - methods shared via prototype

**Cons of Constructor Functions:**
- **Must remember `new`** keyword (can cause bugs)
- **`this` binding** can be confusing
- **Less flexible** than factory functions

---

### 3️⃣ Factory Functions

**Basic Factory:**
```javascript
function createPerson(name, age) {
  return {
    name,
    age,
    greet() {
      return `Hello, I'm ${this.name}`;
    },
    getAge() {
      return this.age;
    }
  };
}

// Usage
const alice = createPerson('Alice', 25);
const bob = createPerson('Bob', 30);

console.log(alice.greet()); // "Hello, I'm Alice"
console.log(alice instanceof Object); // true (but not specific type)
```

**Pros of Factory Functions:**
- **No `new` keyword** required
- **More flexible** - can return different object types
- **Private variables** through closures
- **Easier to understand** for beginners

**Cons of Factory Functions:**
- **Memory usage** - each instance gets its own methods
- **No prototype chain** by default
- **instanceof** doesn't work for custom types

---

### 4️⃣ Advanced Patterns

**Factory with Private Variables:**
```javascript
function createBankAccount(initialBalance = 0) {
  let balance = initialBalance; // Private variable
  let transactionHistory = []; // Private variable
  
  return {
    deposit(amount) {
      if (amount > 0) {
        balance += amount;
        transactionHistory.push({ type: 'deposit', amount, date: new Date() });
        return balance;
      }
      throw new Error('Amount must be positive');
    },
    
    withdraw(amount) {
      if (amount > 0 && amount <= balance) {
        balance -= amount;
        transactionHistory.push({ type: 'withdrawal', amount, date: new Date() });
        return balance;
      }
      throw new Error('Invalid withdrawal amount');
    },
    
    getBalance() {
      return balance;
    },
    
    getHistory() {
      return [...transactionHistory]; // Return copy
    }
  };
}

const account = createBankAccount(1000);
console.log(account.deposit(500)); // 1500
console.log(account.getBalance()); // 1500
// console.log(account.balance); // undefined (private)
```

**Constructor with Private Variables (using closures):**
```javascript
function BankAccount(initialBalance = 0) {
  let balance = initialBalance;
  let transactionHistory = [];
  
  this.deposit = function(amount) {
    if (amount > 0) {
      balance += amount;
      transactionHistory.push({ type: 'deposit', amount, date: new Date() });
      return balance;
    }
    throw new Error('Amount must be positive');
  };
  
  this.withdraw = function(amount) {
    if (amount > 0 && amount <= balance) {
      balance -= amount;
      transactionHistory.push({ type: 'withdrawal', amount, date: new Date() });
      return balance;
    }
    throw new Error('Invalid withdrawal amount');
  };
  
  this.getBalance = function() {
    return balance;
  };
  
  this.getHistory = function() {
    return [...transactionHistory];
  };
}

const account2 = new BankAccount(1000);
console.log(account2 instanceof BankAccount); // true
```

---

### 5️⃣ Hybrid Approach

**Factory with Prototype:**
```javascript
function createUser(name, email) {
  const user = Object.create(createUser.prototype);
  user.name = name;
  user.email = email;
  user.createdAt = new Date();
  return user;
}

createUser.prototype.greet = function() {
  return `Hello, I'm ${this.name}`;
};

createUser.prototype.getAge = function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
};

const user = createUser('Alice', 'alice@example.com');
console.log(user.greet()); // "Hello, I'm Alice"
console.log(user instanceof createUser); // false (limitation)
```

**Modern Class Syntax (Best of Both):**
```javascript
class User {
  #id; // Private field
  
  constructor(name, email) {
    this.name = name;
    this.email = email;
    this.#id = Math.random().toString(36);
    this.createdAt = new Date();
  }
  
  greet() {
    return `Hello, I'm ${this.name}`;
  }
  
  getId() {
    return this.#id;
  }
  
  static createGuest() {
    return new User('Guest', 'guest@example.com');
  }
}

const user = new User('Alice', 'alice@example.com');
const guest = User.createGuest();
```

---

### 6️⃣ When to Use Which

**Use Constructor Functions/Classes when:**
- You need **prototype-based inheritance**
- **Memory efficiency** is important (shared methods)
- You want **instanceof** to work
- Building **large applications** with many instances
- Working with **frameworks** that expect constructor patterns

**Use Factory Functions when:**
- You need **true private variables**
- **Flexibility** in return types is important
- You want to avoid **`new` keyword** confusion
- Creating **configuration objects** or **utilities**
- **Functional programming** approach preferred

---

### 7️⃣ Performance Comparison

```javascript
// Constructor - methods shared via prototype
function ConstructorPerson(name) {
  this.name = name;
}
ConstructorPerson.prototype.greet = function() {
  return `Hello, ${this.name}`;
};

// Factory - methods created for each instance
function factoryPerson(name) {
  return {
    name,
    greet() {
      return `Hello, ${this.name}`;
    }
  };
}

// Memory usage test
const constructorInstances = [];
const factoryInstances = [];

for (let i = 0; i < 1000; i++) {
  constructorInstances.push(new ConstructorPerson(`Person${i}`));
  factoryInstances.push(factoryPerson(`Person${i}`));
}

// Constructor instances share the greet method
// Factory instances each have their own greet method
```

---

### 8️⃣ Key Takeaways

* **Constructor functions** use prototypes for memory efficiency
* **Factory functions** provide more flexibility and privacy
* **ES6 classes** combine benefits of both approaches
* **Choose based on your specific needs**: memory, privacy, inheritance
* **Modern JavaScript** favors classes for OOP patterns
* **Factory functions** excel for functional programming styles
