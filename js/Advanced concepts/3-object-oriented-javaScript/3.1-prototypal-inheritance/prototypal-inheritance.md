# **1. Prototypal Inheritance (OOP Context)**

### 1️⃣ Explanation

In the context of Object-Oriented Programming, **Prototypal Inheritance** allows objects to inherit properties and methods from other objects, creating hierarchical relationships.

Key OOP concepts:
* **Inheritance** - child objects inherit from parent objects
* **Polymorphism** - same method name, different implementations
* **Encapsulation** - data and methods bundled together

---

### 2️⃣ Classical OOP Pattern

**Parent-Child Relationship:**
```javascript
// Parent constructor
function Animal(name, species) {
  this.name = name;
  this.species = species;
}

Animal.prototype.speak = function() {
  return `${this.name} makes a sound`;
};

Animal.prototype.move = function() {
  return `${this.name} moves`;
};

// Child constructor
function Dog(name, breed) {
  Animal.call(this, name, 'Canine'); // Call parent constructor
  this.breed = breed;
}

// Set up inheritance
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// Override parent method (Polymorphism)
Dog.prototype.speak = function() {
  return `${this.name} barks!`;
};

// Add child-specific method
Dog.prototype.wagTail = function() {
  return `${this.name} wags tail happily!`;
};

const myDog = new Dog('Buddy', 'Golden Retriever');
console.log(myDog.speak()); // "Buddy barks!"
console.log(myDog.move());  // "Buddy moves" (inherited)
console.log(myDog.wagTail()); // "Buddy wags tail happily!"
```

---

### 3️⃣ Multiple Inheritance Simulation

**Mixin Pattern:**
```javascript
const CanFly = {
  fly() {
    return `${this.name} is flying!`;
  }
};

const CanSwim = {
  swim() {
    return `${this.name} is swimming!`;
  }
};

function Duck(name) {
  Animal.call(this, name, 'Bird');
}

Duck.prototype = Object.create(Animal.prototype);
Duck.prototype.constructor = Duck;

// Add multiple behaviors
Object.assign(Duck.prototype, CanFly, CanSwim);

const donald = new Duck('Donald');
console.log(donald.fly());  // "Donald is flying!"
console.log(donald.swim()); // "Donald is swimming!"
```

---

### 4️⃣ Abstract Base Class Pattern

```javascript
function Shape() {
  if (this.constructor === Shape) {
    throw new Error('Cannot instantiate abstract class');
  }
}

Shape.prototype.area = function() {
  throw new Error('Must implement area method');
};

Shape.prototype.perimeter = function() {
  throw new Error('Must implement perimeter method');
};

function Rectangle(width, height) {
  Shape.call(this);
  this.width = width;
  this.height = height;
}

Rectangle.prototype = Object.create(Shape.prototype);
Rectangle.prototype.constructor = Rectangle;

Rectangle.prototype.area = function() {
  return this.width * this.height;
};

Rectangle.prototype.perimeter = function() {
  return 2 * (this.width + this.height);
};

const rect = new Rectangle(5, 3);
console.log(rect.area()); // 15
```

---

### 5️⃣ Key Takeaways

* **Prototypal inheritance** enables OOP patterns in JavaScript
* Use **Object.create()** for clean inheritance setup
* **Mixins** simulate multiple inheritance
* **Method overriding** provides polymorphism
* Foundation for understanding ES6 classes
