# **6. Prototype Chain & Inheritance**

### 1️⃣ Explanation

JavaScript uses **Prototypal Inheritance** instead of classical inheritance. Every object in JavaScript has an internal link to another object called its **prototype**.

Think of it as:
* A **chain of objects** linked together
* When you access a property, JS looks up the chain until it finds it
* Enables **inheritance** and **method sharing**
* The foundation of how JavaScript objects work

**Key Concepts:**
* `__proto__` - internal link to prototype (deprecated, use `Object.getPrototypeOf()`)
* `prototype` - property on constructor functions
* `Object.prototype` - top of the prototype chain
* `null` - end of the prototype chain

---

### 2️⃣ Mental Model

```
Prototype Chain Lookup:
┌─────────────────┐
│ myObject        │
│ name: "Alice"   │ ← 1. Check own properties first
└─────────────────┘
         │ __proto__
         ▼
┌─────────────────┐
│ Person.prototype│
│ greet: function │ ← 2. Check prototype
└─────────────────┘
         │ __proto__
         ▼
┌─────────────────┐
│ Object.prototype│
│ toString: fn    │ ← 3. Check Object.prototype
└─────────────────┘
         │ __proto__
         ▼
       null ← 4. End of chain
```

---

### 3️⃣ Basic Prototype Examples

**Object Literal Prototype:**
```javascript
const person = {
  name: 'John',
  age: 30
};

console.log(person.toString()); // "[object Object]"
// toString comes from Object.prototype

console.log(Object.getPrototypeOf(person) === Object.prototype); // true
```

**Constructor Function Prototype:**
```javascript
function Person(name, age) {
  this.name = name;
  this.age = age;
}

// Add methods to prototype (shared by all instances)
Person.prototype.greet = function() {
  return `Hello, I'm ${this.name}`;
};

Person.prototype.getAge = function() {
  return this.age;
};

const alice = new Person('Alice', 25);
const bob = new Person('Bob', 30);

console.log(alice.greet()); // "Hello, I'm Alice"
console.log(bob.greet());   // "Hello, I'm Bob"

// Both instances share the same method
console.log(alice.greet === bob.greet); // true
```

**Prototype Chain Inspection:**
```javascript
console.log(alice.__proto__ === Person.prototype); // true
console.log(Person.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null); // true

// Better way (not deprecated):
console.log(Object.getPrototypeOf(alice) === Person.prototype); // true
```

---

### 4️⃣ Inheritance Patterns

**Classical Inheritance Pattern:**
```javascript
// Parent constructor
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function() {
  return `${this.name} makes a sound`;
};

Animal.prototype.move = function() {
  return `${this.name} moves`;
};

// Child constructor
function Dog(name, breed) {
  Animal.call(this, name); // Call parent constructor
  this.breed = breed;
}

// Set up inheritance
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// Add child-specific methods
Dog.prototype.bark = function() {
  return `${this.name} barks!`;
};

Dog.prototype.speak = function() {
  return `${this.name} barks loudly!`;
};

const myDog = new Dog('Buddy', 'Golden Retriever');
console.log(myDog.speak()); // "Buddy barks loudly!"
console.log(myDog.move());  // "Buddy moves" (inherited)
console.log(myDog.bark());  // "Buddy barks!"
```

**Modern ES6 Class Syntax:**
```javascript
class Animal {
  constructor(name) {
    this.name = name;
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
    super(name); // Call parent constructor
    this.breed = breed;
  }
  
  speak() {
    return `${this.name} barks loudly!`;
  }
  
  bark() {
    return `${this.name} barks!`;
  }
}

const myDog = new Dog('Buddy', 'Golden Retriever');
console.log(myDog.speak()); // "Buddy barks loudly!"
console.log(myDog.move());  // "Buddy moves"
```

---

### 5️⃣ Prototype Methods and Properties

**Object.create():**
```javascript
const personPrototype = {
  greet: function() {
    return `Hello, I'm ${this.name}`;
  },
  
  setAge: function(age) {
    this.age = age;
  }
};

// Create object with specific prototype
const john = Object.create(personPrototype);
john.name = 'John';
john.age = 25;

console.log(john.greet()); // "Hello, I'm John"

// Check prototype relationship
console.log(Object.getPrototypeOf(john) === personPrototype); // true
```

**hasOwnProperty vs in operator:**
```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.species = 'Homo sapiens';

const alice = new Person('Alice');

console.log('name' in alice);           // true
console.log(alice.hasOwnProperty('name')); // true

console.log('species' in alice);           // true
console.log(alice.hasOwnProperty('species')); // false (inherited)

// Get own properties only
console.log(Object.getOwnPropertyNames(alice)); // ['name']
```

**Property Descriptor and defineProperty:**
```javascript
function Car(make, model) {
  this.make = make;
  this.model = model;
}

// Define property with descriptor
Object.defineProperty(Car.prototype, 'info', {
  get: function() {
    return `${this.make} ${this.model}`;
  },
  enumerable: true,
  configurable: true
});

const myCar = new Car('Toyota', 'Camry');
console.log(myCar.info); // "Toyota Camry"
```

---

### 6️⃣ Advanced Prototype Concepts

**Prototype Pollution (Security Concern):**
```javascript
// ❌ Dangerous - modifying Object.prototype
Object.prototype.isAdmin = true;

const user = { name: 'John' };
console.log(user.isAdmin); // true (inherited from Object.prototype)

// This affects ALL objects!
const anotherUser = {};
console.log(anotherUser.isAdmin); // true

// ✅ Better approach - use specific prototypes
function User(name) {
  this.name = name;
}

User.prototype.isAdmin = false;
```

**Mixin Pattern:**
```javascript
const CanFly = {
  fly: function() {
    return `${this.name} is flying!`;
  }
};

const CanSwim = {
  swim: function() {
    return `${this.name} is swimming!`;
  }
};

function Bird(name) {
  this.name = name;
}

function Duck(name) {
  Bird.call(this, name);
}

Duck.prototype = Object.create(Bird.prototype);

// Add mixins
Object.assign(Duck.prototype, CanFly, CanSwim);

const donald = new Duck('Donald');
console.log(donald.fly());  // "Donald is flying!"
console.log(donald.swim()); // "Donald is swimming!"
```

**Prototype-based Factory:**
```javascript
const vehiclePrototype = {
  init: function(make, model) {
    this.make = make;
    this.model = model;
    return this;
  },
  
  start: function() {
    return `${this.make} ${this.model} started`;
  },
  
  stop: function() {
    return `${this.make} ${this.model} stopped`;
  }
};

function createVehicle(make, model) {
  return Object.create(vehiclePrototype).init(make, model);
}

const car1 = createVehicle('Honda', 'Civic');
const car2 = createVehicle('Ford', 'Focus');

console.log(car1.start()); // "Honda Civic started"
console.log(car2.start()); // "Ford Focus started"
```

---

### 7️⃣ Performance Considerations

**Method Placement:**
```javascript
// ❌ Bad - methods created for each instance
function Person(name) {
  this.name = name;
  this.greet = function() {
    return `Hello, I'm ${this.name}`;
  };
}

// ✅ Good - method shared via prototype
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function() {
  return `Hello, I'm ${this.name}`;
};

// Memory usage comparison
const people1 = Array.from({length: 1000}, (_, i) => new Person(`Person${i}`));
// Each person has their own greet method (1000 functions)

const people2 = Array.from({length: 1000}, (_, i) => new Person(`Person${i}`));
// All people share the same greet method (1 function)
```

---

### 8️⃣ Mini Challenge

Create a prototype-based inheritance system for a simple game:

```javascript
// Base Character class
function Character(name, health) {
  // Your code here
}

// Add methods to Character prototype
Character.prototype.attack = function() {
  // Your code here
};

Character.prototype.takeDamage = function(damage) {
  // Your code here
};

// Warrior class that extends Character
function Warrior(name, health, weapon) {
  // Your code here
}

// Set up inheritance and add warrior-specific methods
// Your code here

// Mage class that extends Character
function Mage(name, health, spells) {
  // Your code here
}

// Set up inheritance and add mage-specific methods
// Your code here

// Test your implementation
const warrior = new Warrior('Conan', 100, 'Sword');
const mage = new Mage('Gandalf', 80, ['Fireball', 'Heal']);

console.log(warrior.attack()); // Should work
console.log(mage.castSpell('Fireball')); // Should work
```

---

### 9️⃣ Key Takeaways

* JavaScript uses **prototypal inheritance**, not classical inheritance
* Every object has a **prototype chain** that ends with `null`
* Methods should be added to **prototype** for memory efficiency
* Use `Object.create()` for clean prototype setup
* ES6 classes are **syntactic sugar** over prototypes
* Be careful of **prototype pollution** security issues
* Understanding prototypes is crucial for mastering JavaScript
