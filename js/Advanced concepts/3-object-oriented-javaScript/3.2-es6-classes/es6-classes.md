# **2. ES6 Classes & Class Fields**

### 1️⃣ Explanation

**ES6 Classes** provide a cleaner, more familiar syntax for creating objects and implementing inheritance. They're **syntactic sugar** over JavaScript's existing prototype-based inheritance.

Key features:
* **Class declarations** and **expressions**
* **Constructor method** for initialization
* **Static methods** and **properties**
* **Private fields** and **methods** (modern browsers)
* **Inheritance** with `extends` and `super`

---

### 2️⃣ Basic Class Syntax

**Class Declaration:**
```javascript
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    return `Hello, I'm ${this.name}`;
  }
  
  getAge() {
    return this.age;
  }
  
  // Static method
  static getSpecies() {
    return 'Homo sapiens';
  }
}

const alice = new Person('Alice', 25);
console.log(alice.greet()); // "Hello, I'm Alice"
console.log(Person.getSpecies()); // "Homo sapiens"
```

**Class Expression:**
```javascript
const Animal = class {
  constructor(name) {
    this.name = name;
  }
  
  speak() {
    return `${this.name} makes a sound`;
  }
};

const dog = new Animal('Buddy');
console.log(dog.speak()); // "Buddy makes a sound"
```

---

### 3️⃣ Inheritance with extends

**Basic Inheritance:**
```javascript
class Animal {
  constructor(name, species) {
    this.name = name;
    this.species = species;
  }
  
  speak() {
    return `${this.name} makes a sound`;
  }
  
  move() {
    return `${this.name} moves`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name, 'Canine'); // Call parent constructor
    this.breed = breed;
  }
  
  speak() {
    return `${this.name} barks!`;
  }
  
  wagTail() {
    return `${this.name} wags tail`;
  }
}

const myDog = new Dog('Buddy', 'Golden Retriever');
console.log(myDog.speak()); // "Buddy barks!"
console.log(myDog.move());  // "Buddy moves" (inherited)
```

---

### 4️⃣ Class Fields (Modern JavaScript)

**Public and Private Fields:**
```javascript
class BankAccount {
  // Public field
  accountType = 'checking';
  
  // Private field (# prefix)
  #balance = 0;
  #accountNumber;
  
  constructor(accountNumber, initialBalance = 0) {
    this.#accountNumber = accountNumber;
    this.#balance = initialBalance;
  }
  
  // Public method
  deposit(amount) {
    if (amount > 0) {
      this.#balance += amount;
      return this.#balance;
    }
    throw new Error('Amount must be positive');
  }
  
  // Private method
  #validateWithdrawal(amount) {
    return amount > 0 && amount <= this.#balance;
  }
  
  withdraw(amount) {
    if (this.#validateWithdrawal(amount)) {
      this.#balance -= amount;
      return this.#balance;
    }
    throw new Error('Invalid withdrawal amount');
  }
  
  getBalance() {
    return this.#balance;
  }
  
  // Static field
  static bankName = 'MyBank';
  
  // Static method
  static createSavingsAccount(accountNumber) {
    const account = new BankAccount(accountNumber);
    account.accountType = 'savings';
    return account;
  }
}

const account = new BankAccount('12345', 1000);
console.log(account.deposit(500)); // 1500
console.log(account.getBalance()); // 1500

// console.log(account.#balance); // SyntaxError: Private field '#balance' must be declared in an enclosing class
```

---

### 5️⃣ Advanced Class Patterns

**Abstract Base Class:**
```javascript
class Shape {
  constructor() {
    if (this.constructor === Shape) {
      throw new Error('Cannot instantiate abstract class');
    }
  }
  
  // Abstract method
  area() {
    throw new Error('Must implement area method');
  }
  
  // Concrete method
  describe() {
    return `This shape has an area of ${this.area()}`;
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }
  
  area() {
    return Math.PI * this.radius ** 2;
  }
}

const circle = new Circle(5);
console.log(circle.describe()); // "This shape has an area of 78.54..."
```

**Mixin with Classes:**
```javascript
const Flyable = (superclass) => class extends superclass {
  fly() {
    return `${this.name} is flying!`;
  }
};

const Swimmable = (superclass) => class extends superclass {
  swim() {
    return `${this.name} is swimming!`;
  }
};

class Animal {
  constructor(name) {
    this.name = name;
  }
}

class Duck extends Swimmable(Flyable(Animal)) {
  constructor(name) {
    super(name);
  }
  
  quack() {
    return `${this.name} says quack!`;
  }
}

const donald = new Duck('Donald');
console.log(donald.fly());   // "Donald is flying!"
console.log(donald.swim());  // "Donald is swimming!"
console.log(donald.quack()); // "Donald says quack!"
```

---

### 6️⃣ Class vs Function Comparison

**Function Constructor:**
```javascript
function PersonFunc(name, age) {
  this.name = name;
  this.age = age;
}

PersonFunc.prototype.greet = function() {
  return `Hello, I'm ${this.name}`;
};

PersonFunc.getSpecies = function() {
  return 'Homo sapiens';
};
```

**ES6 Class (Equivalent):**
```javascript
class PersonClass {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  
  greet() {
    return `Hello, I'm ${this.name}`;
  }
  
  static getSpecies() {
    return 'Homo sapiens';
  }
}
```

---

### 7️⃣ Key Takeaways

* **ES6 classes** are syntactic sugar over prototypes
* **extends** and **super** make inheritance cleaner
* **Private fields** (#) provide true encapsulation
* **Static methods** belong to the class, not instances
* **Classes are hoisted** but not initialized (temporal dead zone)
* **More familiar syntax** for developers from other languages
