# 🚀 JavaScript Interview Questions & Answers
## Complete Guide from Basic to Advanced

---

## 📚 **BASIC LEVEL (Junior Developer)**

### **1. Introduction & Fundamentals**

**Q1: What is JavaScript and what are its key features?**

**Answer:**
JavaScript is a high-level, interpreted programming language primarily used for web development. Key features include:

- **Dynamic typing**: Variables don't need explicit type declarations
- **Event-driven**: Responds to user interactions and system events
- **Interpreted**: No compilation step required
- **Multi-paradigm**: Supports OOP, functional, and procedural programming
- **Cross-platform**: Runs in browsers and servers (Node.js)
- **Prototype-based**: Objects can inherit directly from other objects

```javascript
// Example demonstrating key features
let message = "Hello"; // Dynamic typing
message = 42; // Can change type

// Event-driven
document.addEventListener('click', function() {
    console.log('Clicked!');
});

// Multi-paradigm
const obj = { name: 'Alice' }; // Object-oriented
const add = (a, b) => a + b; // Functional
```

---

**Q2: What's the difference between `==` and `===`?**

**Answer:**
- `==` (loose equality): Performs type coercion before comparison
- `===` (strict equality): Compares both value and type without coercion

```javascript
// Loose equality (==) - performs type coercion
console.log(5 == "5");        // true (string "5" converted to number)
console.log(true == 1);       // true (boolean converted to number)
console.log(null == undefined); // true (special case)
console.log(0 == false);      // true (both converted to 0)

// Strict equality (===) - no type coercion
console.log(5 === "5");       // false (different types)
console.log(true === 1);      // false (different types)
console.log(null === undefined); // false (different types)
console.log(0 === false);    // false (different types)

// Best practice: Always use === unless you specifically need type coercion
```

---

### **2. Variables & Data Types**

**Q3: Explain the differences between `var`, `let`, and `const`.**

**Answer:**

| Feature | var | let | const |
|---------|-----|-----|-------|
| Scope | Function/Global | Block | Block |
| Hoisting | Yes (undefined) | Yes (TDZ) | Yes (TDZ) |
| Reassignment | Yes | Yes | No |
| Redeclaration | Yes | No | No |
| Temporal Dead Zone | No | Yes | Yes |

```javascript
// Scope differences
function scopeExample() {
    if (true) {
        var a = 1;    // Function-scoped
        let b = 2;    // Block-scoped
        const c = 3;  // Block-scoped
    }
    
    console.log(a); // 1 (accessible)
    console.log(b); // ReferenceError: b is not defined
    console.log(c); // ReferenceError: c is not defined
}

// Hoisting differences
console.log(x); // undefined (var is hoisted)
console.log(y); // ReferenceError: Cannot access 'y' before initialization
console.log(z); // ReferenceError: Cannot access 'z' before initialization

var x = 1;
let y = 2;
const z = 3;

// Reassignment
var a = 1; a = 2; // ✅ Works
let b = 1; b = 2; // ✅ Works
const c = 1; c = 2; // ❌ TypeError: Assignment to constant variable

// Objects with const
const obj = { name: 'Alice' };
obj.name = 'Bob'; // ✅ Works (object content can change)
obj.age = 25;     // ✅ Works
// obj = {}; // ❌ TypeError: Assignment to constant variable
```

---

**Q4: What are JavaScript's primitive data types?**

**Answer:**
JavaScript has 7 primitive data types:

1. **string** - Text data
2. **number** - Integers and floating-point numbers
3. **bigint** - Large integers beyond Number.MAX_SAFE_INTEGER
4. **boolean** - true or false
5. **undefined** - Uninitialized variables
6. **null** - Intentional absence of value
7. **symbol** - Unique identifiers

```javascript
// Examples of each primitive type
let str = "Hello World";           // string
let num = 42;                      // number
let bigNum = 123456789012345678901234567890n; // bigint
let bool = true;                   // boolean
let undef;                         // undefined
let empty = null;                  // null
let sym = Symbol('id');            // symbol

// Type checking
console.log(typeof str);    // "string"
console.log(typeof num);    // "number"
console.log(typeof bigNum); // "bigint"
console.log(typeof bool);   // "boolean"
console.log(typeof undef);  // "undefined"
console.log(typeof empty);  // "object" (historical bug)
console.log(typeof sym);    // "symbol"

// Primitives are immutable
let original = "hello";
let modified = original.toUpperCase(); // Creates new string
console.log(original); // "hello" (unchanged)
console.log(modified); // "HELLO"
```

---

**Q5: What's the difference between `null` and `undefined`?**

**Answer:**

| Aspect | undefined | null |
|--------|-----------|------|
| Meaning | Variable declared but not assigned | Intentional absence of value |
| Type | "undefined" | "object" (historical bug) |
| Default value | Yes (uninitialized variables) | No (must be explicitly assigned) |
| JSON | Omitted from JSON | Included as null |

```javascript
// undefined examples
let a;                    // undefined (declared but not assigned)
let obj = {};
console.log(obj.prop);    // undefined (property doesn't exist)

function test(param) {
    console.log(param);   // undefined if no argument passed
}
test();

// null examples
let b = null;             // Explicitly set to null
let data = JSON.parse('{"value": null}'); // null from JSON

// Comparisons
console.log(undefined == null);  // true (loose equality)
console.log(undefined === null); // false (strict equality)

// Type checking
console.log(typeof undefined);   // "undefined"
console.log(typeof null);        // "object" (historical bug)

// Best practices
function getUserData() {
    // Return null when no data is found (intentional)
    return null;
}

let userInput; // undefined until user provides input
```

---

### **3. Functions**

**Q6: What are the different ways to create functions in JavaScript?**

**Answer:**

```javascript
// 1. Function Declaration
function declaration() {
    return "Function Declaration";
}

// 2. Function Expression
const expression = function() {
    return "Function Expression";
};

// 3. Arrow Function (ES6)
const arrow = () => {
    return "Arrow Function";
};

// Arrow function shorthand
const arrowShort = () => "Arrow Function Short";

// 4. Constructor Function
function ConstructorFunc(name) {
    this.name = name;
    this.greet = function() {
        return `Hello, ${this.name}`;
    };
}

// 5. Method in Object
const obj = {
    // Method shorthand (ES6)
    method() {
        return "Object Method";
    },
    
    // Traditional method
    traditionalMethod: function() {
        return "Traditional Method";
    },
    
    // Arrow method (be careful with 'this')
    arrowMethod: () => {
        return "Arrow Method";
    }
};

// 6. Function Constructor (rarely used)
const funcConstructor = new Function('a', 'b', 'return a + b');

// 7. Generator Function
function* generator() {
    yield 1;
    yield 2;
    yield 3;
}

// 8. Async Function
async function asyncFunc() {
    return "Async Function";
}

// Usage examples
console.log(declaration());           // "Function Declaration"
console.log(expression());            // "Function Expression"
console.log(arrow());                 // "Arrow Function"

const instance = new ConstructorFunc("Alice");
console.log(instance.greet());        // "Hello, Alice"

console.log(obj.method());            // "Object Method"
console.log(funcConstructor(2, 3));   // 5

const gen = generator();
console.log(gen.next().value);        // 1
```

---

**Q7: What is function hoisting?**

**Answer:**
Function hoisting is JavaScript's behavior of moving function declarations to the top of their scope during compilation. This allows you to call functions before they're declared in the code.

```javascript
// This works due to hoisting
console.log(hoistedFunction()); // "I'm hoisted!"

function hoistedFunction() {
    return "I'm hoisted!";
}

// Function expressions are NOT hoisted
console.log(notHoisted()); // TypeError: notHoisted is not a function

var notHoisted = function() {
    return "I'm not hoisted!";
};

// Let and const function expressions
console.log(letFunc()); // ReferenceError: Cannot access 'letFunc' before initialization

let letFunc = function() {
    return "Let function";
};

// Arrow functions follow the same rules as function expressions
console.log(arrowFunc()); // ReferenceError or TypeError

const arrowFunc = () => "Arrow function";

// Hoisting with var vs let/const
console.log(typeof varFunc);   // "undefined"
console.log(typeof letFunc);   // ReferenceError
console.log(typeof constFunc); // ReferenceError

var varFunc = function() {};
let letFunc = function() {};
const constFunc = function() {};

// Function declarations vs expressions in blocks
if (true) {
    // Function declaration (hoisted to function scope)
    function blockDeclaration() {
        return "Block declaration";
    }
    
    // Function expression (not hoisted)
    var blockExpression = function() {
        return "Block expression";
    };
}

console.log(blockDeclaration()); // Works (hoisted)
console.log(blockExpression());  // Works (var is function-scoped)
```

---

## 🔥 **INTERMEDIATE LEVEL (Mid-Level Developer)**

### **4. Arrays & Objects**

**Q8: How do you check if a variable is an array?**

**Answer:**
There are several methods to check if a variable is an array:

```javascript
const arr = [1, 2, 3];
const obj = { 0: 1, 1: 2, 2: 3, length: 3 }; // Array-like object

// 1. Array.isArray() - RECOMMENDED
console.log(Array.isArray(arr)); // true
console.log(Array.isArray(obj)); // false

// 2. instanceof Array
console.log(arr instanceof Array); // true
console.log(obj instanceof Array); // false

// 3. Object.prototype.toString.call()
console.log(Object.prototype.toString.call(arr)); // "[object Array]"
console.log(Object.prototype.toString.call(obj)); // "[object Object]"

// 4. constructor property (not reliable)
console.log(arr.constructor === Array); // true
console.log(obj.constructor === Array); // false

// Why Array.isArray() is preferred:
// - Works across different frames/windows
// - More reliable than instanceof
// - Specifically designed for this purpose

// Edge cases
console.log(Array.isArray([]));           // true
console.log(Array.isArray(null));        // false
console.log(Array.isArray(undefined));   // false
console.log(Array.isArray("string"));    // false
console.log(Array.isArray(arguments));   // false (in function)
```

---

**Q9: What's the difference between `.forEach()` and `.map()`?**

**Answer:**

| Aspect | forEach() | map() |
|--------|-----------|-------|
| Return value | undefined | New array |
| Purpose | Side effects | Transformation |
| Mutates original | No | No |
| Chainable | No | Yes |
| Performance | Slightly faster | Slightly slower |

```javascript
const numbers = [1, 2, 3, 4, 5];

// forEach - for side effects, returns undefined
const forEachResult = numbers.forEach(num => {
    console.log(num * 2); // Side effect: logging
});
console.log(forEachResult); // undefined

// map - for transformation, returns new array
const mapResult = numbers.map(num => num * 2);
console.log(mapResult); // [2, 4, 6, 8, 10]

// Practical examples

// forEach - updating DOM elements
const elements = document.querySelectorAll('.item');
elements.forEach(element => {
    element.style.color = 'red'; // Side effect
});

// map - transforming data
const users = [
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 30 }
];

const userNames = users.map(user => user.name);
console.log(userNames); // ['Alice', 'Bob']

// Chaining with map
const result = numbers
    .map(num => num * 2)
    .map(num => num + 1)
    .filter(num => num > 5);
console.log(result); // [7, 9, 11]

// forEach cannot be chained
// numbers.forEach(num => num * 2).filter(...); // Error!

// When to use which:
// Use forEach when: performing side effects, no return value needed
// Use map when: transforming data, need new array
```

---

### **5. Scope & Closures**

**Q10: Explain closures with a practical example.**

**Answer:**
A closure is a function that has access to variables from its outer (enclosing) scope even after the outer function has finished executing. The inner function "closes over" the outer variables.

```javascript
// Basic closure example
function createCounter() {
    let count = 0; // Private variable
    
    return function() {
        count++; // Access to outer variable
        return count;
    };
}

const counter1 = createCounter();
const counter2 = createCounter();

console.log(counter1()); // 1
console.log(counter1()); // 2
console.log(counter2()); // 1 (separate closure)
console.log(counter1()); // 3

// Practical example: Module pattern
function createBankAccount(initialBalance) {
    let balance = initialBalance; // Private variable
    
    return {
        deposit(amount) {
            if (amount > 0) {
                balance += amount;
                return balance;
            }
            throw new Error('Amount must be positive');
        },
        
        withdraw(amount) {
            if (amount > 0 && amount <= balance) {
                balance -= amount;
                return balance;
            }
            throw new Error('Invalid withdrawal amount');
        },
        
        getBalance() {
            return balance;
        }
    };
}

const account = createBankAccount(100);
console.log(account.deposit(50));  // 150
console.log(account.withdraw(30)); // 120
console.log(account.getBalance()); // 120
// console.log(account.balance); // undefined (private)

// Closure in event handlers
function setupButtons() {
    for (let i = 0; i < 3; i++) {
        const button = document.createElement('button');
        button.textContent = `Button ${i}`;
        
        // Closure captures the current value of i
        button.addEventListener('click', function() {
            console.log(`Button ${i} clicked`);
        });
        
        document.body.appendChild(button);
    }
}

// Function factory with closures
function createMultiplier(multiplier) {
    return function(number) {
        return number * multiplier;
    };
}

const double = createMultiplier(2);
const triple = createMultiplier(3);

console.log(double(5)); // 10
console.log(triple(5)); // 15
```

---

**Q11: What will this code output and why?**

**Answer:**

```javascript
// Problem code with var
for (var i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3

// Fixed code with let
for (let i = 0; i < 3; i++) {
    setTimeout(() => console.log(i), 100);
}
// Output: 0, 1, 2

// Explanation:
// With var: 
// - var is function-scoped, so there's only one 'i' variable
// - The loop completes before setTimeout callbacks execute
// - All callbacks reference the same 'i' which has value 3

// With let:
// - let is block-scoped, creating a new 'i' for each iteration
// - Each setTimeout callback captures its own copy of 'i'

// Alternative solutions with var:

// Solution 1: IIFE (Immediately Invoked Function Expression)
for (var i = 0; i < 3; i++) {
    (function(index) {
        setTimeout(() => console.log(index), 100);
    })(i);
}

// Solution 2: bind()
for (var i = 0; i < 3; i++) {
    setTimeout(console.log.bind(null, i), 100);
}

// Solution 3: Additional parameter to setTimeout
for (var i = 0; i < 3; i++) {
    setTimeout((index) => console.log(index), 100, i);
}

// Solution 4: forEach (creates new scope)
[0, 1, 2].forEach(i => {
    setTimeout(() => console.log(i), 100);
});
```

---

### **6. `this` Binding**

**Q12: Explain the different ways `this` can be bound.**

**Answer:**
The value of `this` depends on how a function is called. There are four main binding rules:

```javascript
// 1. Default Binding (global object or undefined in strict mode)
function globalFunction() {
    console.log(this); // Window object (browser) or global (Node.js)
}

"use strict";
function strictFunction() {
    console.log(this); // undefined
}

// 2. Implicit Binding (object method)
const obj = {
    name: 'Alice',
    greet: function() {
        console.log(`Hello, ${this.name}`); // this = obj
    },
    
    // Arrow functions don't have their own 'this'
    greetArrow: () => {
        console.log(`Hello, ${this.name}`); // this = global/undefined
    }
};

obj.greet();      // "Hello, Alice"
obj.greetArrow(); // "Hello, undefined"

// Lost binding
const greet = obj.greet;
greet(); // "Hello, undefined" (this = global/undefined)

// 3. Explicit Binding (call, apply, bind)
function introduce(age, city) {
    console.log(`I'm ${this.name}, ${age} years old from ${city}`);
}

const person = { name: 'Bob' };

// call() - arguments passed individually
introduce.call(person, 25, 'New York');

// apply() - arguments passed as array
introduce.apply(person, [25, 'New York']);

// bind() - returns new function with bound 'this'
const boundIntroduce = introduce.bind(person);
boundIntroduce(25, 'New York');

// 4. new Binding (constructor functions)
function Person(name) {
    this.name = name;
    this.greet = function() {
        console.log(`Hello, I'm ${this.name}`);
    };
}

const alice = new Person('Alice');
alice.greet(); // "Hello, I'm Alice"

// Arrow functions and 'this'
const arrowObj = {
    name: 'Charlie',
    
    regularMethod: function() {
        console.log(this.name); // 'Charlie'
        
        const innerArrow = () => {
            console.log(this.name); // 'Charlie' (inherits from regularMethod)
        };
        
        function innerRegular() {
            console.log(this.name); // undefined (new 'this' context)
        }
        
        innerArrow();
        innerRegular();
    }
};

// Event handlers and 'this'
const button = document.createElement('button');

// Regular function - 'this' is the button element
button.addEventListener('click', function() {
    console.log(this); // button element
});

// Arrow function - 'this' is from surrounding scope
button.addEventListener('click', () => {
    console.log(this); // global object or undefined
});

// Class methods and 'this'
class MyClass {
    constructor(name) {
        this.name = name;
    }
    
    method() {
        console.log(this.name);
    }
    
    arrowMethod = () => {
        console.log(this.name); // Always bound to instance
    }
}

const instance = new MyClass('David');
const method = instance.method;
const arrowMethod = instance.arrowMethod;

method();      // undefined (lost binding)
arrowMethod(); // 'David' (arrow function binding)
```

---

**Q13: How do `call`, `apply`, and `bind` work?**

**Answer:**
These methods allow explicit control over the `this` context and function arguments:

```javascript
function greet(greeting, punctuation) {
    return `${greeting}, I'm ${this.name}${punctuation}`;
}

const person = { name: 'Alice' };

// call() - invoke immediately with individual arguments
const result1 = greet.call(person, 'Hello', '!');
console.log(result1); // "Hello, I'm Alice!"

// apply() - invoke immediately with arguments array
const result2 = greet.apply(person, ['Hi', '.']);
console.log(result2); // "Hi, I'm Alice."

// bind() - return new function with bound context
const boundGreet = greet.bind(person);
const result3 = boundGreet('Hey', '?');
console.log(result3); // "Hey, I'm Alice?"

// Partial application with bind()
const boundGreetHello = greet.bind(person, 'Hello');
const result4 = boundGreetHello('!!!');
console.log(result4); // "Hello, I'm Alice!!!"

// Practical examples

// 1. Borrowing methods
const numbers = [1, 2, 3, 4, 5];
const max = Math.max.apply(null, numbers);
console.log(max); // 5

// Modern alternative with spread
const maxSpread = Math.max(...numbers);

// 2. Converting array-like objects
function example() {
    // arguments is array-like but not an array
    const argsArray = Array.prototype.slice.call(arguments);
    return argsArray;
}

console.log(example(1, 2, 3)); // [1, 2, 3]

// Modern alternative
function modernExample() {
    return Array.from(arguments);
    // or [...arguments]
}

// 3. Function composition
function multiply(a, b) {
    return a * b;
}

function add(a, b) {
    return a + b;
}

// Creating specialized functions
const double = multiply.bind(null, 2);
const addFive = add.bind(null, 5);

console.log(double(4));  // 8
console.log(addFive(3)); // 8

// 4. Event handler binding
class Counter {
    constructor() {
        this.count = 0;
        this.element = document.createElement('button');
        this.element.textContent = 'Click me';
        
        // Bind to preserve 'this' context
        this.element.addEventListener('click', this.increment.bind(this));
    }
    
    increment() {
        this.count++;
        console.log(`Count: ${this.count}`);
    }
}

// 5. Polyfill example for bind()
if (!Function.prototype.bind) {
    Function.prototype.bind = function(context) {
        const fn = this;
        const args = Array.prototype.slice.call(arguments, 1);
        
        return function() {
            const allArgs = args.concat(Array.prototype.slice.call(arguments));
            return fn.apply(context, allArgs);
        };
    };
}

// Performance considerations
// call() and apply() are slightly faster than bind() for one-time use
// bind() is better for reusable functions
// Modern engines optimize these methods well
```
---

## 🎯 **ADVANCED LEVEL (Senior Developer)**

### **7. Prototypes & Inheritance**

**Q14: Explain prototypal inheritance.**

**Answer:**
JavaScript uses prototypal inheritance where objects can inherit properties and methods from other objects through the prototype chain.

```javascript
// Constructor function approach
function Animal(name) {
    this.name = name;
}

Animal.prototype.speak = function() {
    console.log(`${this.name} makes a sound`);
};

Animal.prototype.eat = function() {
    console.log(`${this.name} is eating`);
};

function Dog(name, breed) {
    // Call parent constructor
    Animal.call(this, name);
    this.breed = breed;
}

// Set up inheritance - Dog inherits from Animal
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

// Add Dog-specific methods
Dog.prototype.bark = function() {
    console.log(`${this.name} barks!`);
};

Dog.prototype.speak = function() {
    console.log(`${this.name} barks loudly!`);
};

// Usage
const dog = new Dog('Buddy', 'Golden Retriever');
dog.speak(); // "Buddy barks loudly!" (overridden method)
dog.eat();   // "Buddy is eating" (inherited method)
dog.bark();  // "Buddy barks!" (own method)

console.log(dog instanceof Dog);    // true
console.log(dog instanceof Animal); // true

// ES6 Class syntax (syntactic sugar over prototypes)
class ModernAnimal {
    constructor(name) {
        this.name = name;
    }
    
    speak() {
        console.log(`${this.name} makes a sound`);
    }
    
    eat() {
        console.log(`${this.name} is eating`);
    }
}

class ModernDog extends ModernAnimal {
    constructor(name, breed) {
        super(name); // Call parent constructor
        this.breed = breed;
    }
    
    speak() {
        console.log(`${this.name} barks loudly!`);
    }
    
    bark() {
        console.log(`${this.name} barks!`);
    }
}

// Object.create() approach
const animalPrototype = {
    speak() {
        console.log(`${this.name} makes a sound`);
    },
    
    eat() {
        console.log(`${this.name} is eating`);
    }
};

const dogPrototype = Object.create(animalPrototype);
dogPrototype.bark = function() {
    console.log(`${this.name} barks!`);
};

function createDog(name, breed) {
    const dog = Object.create(dogPrototype);
    dog.name = name;
    dog.breed = breed;
    return dog;
}

const myDog = createDog('Max', 'Labrador');
myDog.speak(); // "Max makes a sound"
myDog.bark();  // "Max barks!"

// Prototype chain visualization
console.log(dog.__proto__ === Dog.prototype);                    // true
console.log(Dog.prototype.__proto__ === Animal.prototype);       // true
console.log(Animal.prototype.__proto__ === Object.prototype);    // true
console.log(Object.prototype.__proto__ === null);               // true
```

---

**Q15: What's the difference between `__proto__` and `prototype`?**

**Answer:**

| Aspect | `__proto__` | `prototype` |
|--------|-------------|-------------|
| What it is | Property of instances | Property of constructor functions |
| Purpose | Points to prototype object | Template for instances |
| Accessibility | On all objects | Only on functions |
| Standard | Non-standard (use Object.getPrototypeOf) | Standard |

```javascript
function Person(name) {
    this.name = name;
}

Person.prototype.greet = function() {
    return `Hello, I'm ${this.name}`;
};

const john = new Person('John');

// prototype - property of constructor function
console.log(Person.prototype); // { greet: function, constructor: Person }
console.log(typeof Person.prototype); // "object"

// __proto__ - property of instances (points to constructor's prototype)
console.log(john.__proto__ === Person.prototype); // true
console.log(john.__proto__.greet === Person.prototype.greet); // true

// Standard way to access prototype
console.log(Object.getPrototypeOf(john) === Person.prototype); // true

// Setting prototype
const newProto = { newMethod() { return 'new'; } };
Object.setPrototypeOf(john, newProto);

// Prototype chain example
function Animal() {}
Animal.prototype.type = 'animal';

function Dog() {}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.sound = 'bark';

const buddy = new Dog();

// Prototype chain: buddy -> Dog.prototype -> Animal.prototype -> Object.prototype -> null
console.log(buddy.__proto__ === Dog.prototype);                    // true
console.log(buddy.__proto__.__proto__ === Animal.prototype);       // true
console.log(buddy.__proto__.__proto__.__proto__ === Object.prototype); // true

// Property lookup
console.log(buddy.sound); // 'bark' (found in Dog.prototype)
console.log(buddy.type);  // 'animal' (found in Animal.prototype)
console.log(buddy.toString); // function (found in Object.prototype)

// Own properties vs inherited properties
buddy.name = 'Buddy';

console.log(buddy.hasOwnProperty('name'));  // true
console.log(buddy.hasOwnProperty('sound')); // false
console.log(buddy.hasOwnProperty('type'));  // false

// Enumerating properties
for (let prop in buddy) {
    if (buddy.hasOwnProperty(prop)) {
        console.log(`Own property: ${prop}`);
    } else {
        console.log(`Inherited property: ${prop}`);
    }
}

// Modern alternatives
console.log(Object.getOwnPropertyNames(buddy));     // Own properties
console.log(Object.getPrototypeOf(buddy));          // Get prototype
console.log(Object.keys(buddy));                    // Enumerable own properties
```

---

### **8. Asynchronous JavaScript**

**Q16: Explain the event loop and call stack.**

**Answer:**
The event loop is JavaScript's mechanism for handling asynchronous operations in a single-threaded environment.

```javascript
// Call Stack, Web APIs, Callback Queue, Event Loop demonstration

console.log('1'); // Synchronous - goes to call stack

setTimeout(() => console.log('2'), 0); // Asynchronous - goes to Web APIs

Promise.resolve().then(() => console.log('3')); // Microtask - higher priority

console.log('4'); // Synchronous - goes to call stack

// Output: 1, 4, 3, 2

/* Execution flow:
1. console.log('1') - Call Stack → Execute immediately
2. setTimeout() - Call Stack → Web APIs → Callback Queue (after 0ms)
3. Promise.resolve().then() - Call Stack → Microtask Queue
4. console.log('4') - Call Stack → Execute immediately
5. Call stack empty → Event loop checks Microtask Queue first
6. Execute Promise callback (console.log('3'))
7. Microtask queue empty → Event loop checks Callback Queue
8. Execute setTimeout callback (console.log('2'))
*/

// More complex example
function complexExample() {
    console.log('Start');
    
    setTimeout(() => console.log('Timeout 1'), 0);
    
    Promise.resolve().then(() => {
        console.log('Promise 1');
        return Promise.resolve();
    }).then(() => console.log('Promise 2'));
    
    setTimeout(() => console.log('Timeout 2'), 0);
    
    Promise.resolve().then(() => console.log('Promise 3'));
    
    console.log('End');
}

complexExample();
// Output: Start, End, Promise 1, Promise 3, Promise 2, Timeout 1, Timeout 2

// Event Loop phases (Node.js)
/*
┌───────────────────────────┐
┌─>│           timers          │  ← setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     pending callbacks     │  ← I/O callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       idle, prepare       │  ← Internal use
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           poll            │  ← Fetching new I/O events
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │           check           │  ← setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤      close callbacks      │  ← close event callbacks
   └───────────────────────────┘
*/

// Microtasks vs Macrotasks
console.log('=== Microtasks vs Macrotasks ===');

// Macrotasks (Task Queue)
setTimeout(() => console.log('setTimeout'), 0);
setImmediate(() => console.log('setImmediate')); // Node.js only

// Microtasks (Job Queue) - Higher priority
Promise.resolve().then(() => console.log('Promise'));
queueMicrotask(() => console.log('queueMicrotask'));

// Process.nextTick (Node.js) - Highest priority
process.nextTick(() => console.log('nextTick')); // Node.js only

// Blocking the event loop (bad practice)
function blockingOperation() {
    const start = Date.now();
    while (Date.now() - start < 1000) {
        // Blocking for 1 second
    }
    console.log('Blocking operation complete');
}

// This would block the event loop
// blockingOperation();

// Non-blocking alternative
function nonBlockingOperation(callback) {
    setTimeout(() => {
        console.log('Non-blocking operation complete');
        callback();
    }, 1000);
}
```

---

**Q17: Convert this callback-based function to use Promises and async/await.**

**Answer:**

```javascript
// Original callback-based function
function fetchData(callback) {
    setTimeout(() => {
        const data = { id: 1, name: 'User', email: 'user@example.com' };
        const error = Math.random() > 0.8 ? new Error('Network error') : null;
        
        if (error) {
            callback(error, null);
        } else {
            callback(null, data);
        }
    }, 1000);
}

// Usage with callbacks (callback hell potential)
fetchData((error, data) => {
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Data:', data);
        
        // Nested callback for additional operation
        fetchData((error2, data2) => {
            if (error2) {
                console.error('Error 2:', error2.message);
            } else {
                console.log('Data 2:', data2);
            }
        });
    }
});

// 1. Promise-based version
function fetchDataPromise() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const data = { id: 1, name: 'User', email: 'user@example.com' };
            const error = Math.random() > 0.8 ? new Error('Network error') : null;
            
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        }, 1000);
    });
}

// Usage with Promises
fetchDataPromise()
    .then(data => {
        console.log('Data:', data);
        return fetchDataPromise(); // Chain another promise
    })
    .then(data2 => {
        console.log('Data 2:', data2);
    })
    .catch(error => {
        console.error('Error:', error.message);
    });

// 2. Async/Await version
async function fetchDataAsync() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const data = { id: 1, name: 'User', email: 'user@example.com' };
            const error = Math.random() > 0.8 ? new Error('Network error') : null;
            
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        }, 1000);
    });
}

// Usage with async/await
async function handleData() {
    try {
        const data = await fetchDataAsync();
        console.log('Data:', data);
        
        const data2 = await fetchDataAsync();
        console.log('Data 2:', data2);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

handleData();

// 3. Promisify utility function
function promisify(fn) {
    return function(...args) {
        return new Promise((resolve, reject) => {
            fn(...args, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    };
}

// Convert callback function to promise
const fetchDataPromisified = promisify(fetchData);

// Usage
fetchDataPromisified()
    .then(data => console.log('Promisified data:', data))
    .catch(error => console.error('Promisified error:', error.message));

// 4. Multiple async operations
async function fetchMultipleData() {
    try {
        // Sequential (one after another)
        console.time('Sequential');
        const data1 = await fetchDataAsync();
        const data2 = await fetchDataAsync();
        const data3 = await fetchDataAsync();
        console.timeEnd('Sequential');
        
        // Parallel (all at once)
        console.time('Parallel');
        const [parallelData1, parallelData2, parallelData3] = await Promise.all([
            fetchDataAsync(),
            fetchDataAsync(),
            fetchDataAsync()
        ]);
        console.timeEnd('Parallel');
        
        return { data1, data2, data3, parallelData1, parallelData2, parallelData3 };
        
    } catch (error) {
        console.error('Multiple fetch error:', error.message);
        throw error; // Re-throw if needed
    }
}

// 5. Error handling patterns
async function robustErrorHandling() {
    // Try-catch for async/await
    try {
        const data = await fetchDataAsync();
        return data;
    } catch (error) {
        console.error('Caught error:', error.message);
        
        // Retry logic
        try {
            console.log('Retrying...');
            const retryData = await fetchDataAsync();
            return retryData;
        } catch (retryError) {
            console.error('Retry failed:', retryError.message);
            throw retryError;
        }
    }
}

// Promise-based error handling
function promiseErrorHandling() {
    return fetchDataPromise()
        .catch(error => {
            console.error('Promise error:', error.message);
            
            // Retry
            return fetchDataPromise();
        })
        .catch(retryError => {
            console.error('Retry failed:', retryError.message);
            throw retryError;
        });
}
```

---

### **9. Advanced Functions & Patterns**

**Q18: Implement a curry function.**

**Answer:**

```javascript
// Basic curry implementation
function curry(fn) {
    return function curried(...args) {
        // If we have enough arguments, call the original function
        if (args.length >= fn.length) {
            return fn.apply(this, args);
        }
        
        // Otherwise, return a new function that collects more arguments
        return function(...nextArgs) {
            return curried.apply(this, args.concat(nextArgs));
        };
    };
}

// Test function
function add(a, b, c) {
    return a + b + c;
}

const curriedAdd = curry(add);

// Usage examples
console.log(curriedAdd(1)(2)(3));     // 6
console.log(curriedAdd(1, 2)(3));     // 6
console.log(curriedAdd(1)(2, 3));     // 6
console.log(curriedAdd(1, 2, 3));     // 6

// Advanced curry with placeholder support
function advancedCurry(fn, placeholder = Symbol('placeholder')) {
    return function curried(...args) {
        const hasPlaceholder = args.some(arg => arg === placeholder);
        
        if (args.length >= fn.length && !hasPlaceholder) {
            return fn.apply(this, args);
        }
        
        return function(...nextArgs) {
            const newArgs = args.slice();
            let nextIndex = 0;
            
            // Replace placeholders with new arguments
            for (let i = 0; i < newArgs.length && nextIndex < nextArgs.length; i++) {
                if (newArgs[i] === placeholder) {
                    newArgs[i] = nextArgs[nextIndex++];
                }
            }
            
            // Add remaining arguments
            while (nextIndex < nextArgs.length) {
                newArgs.push(nextArgs[nextIndex++]);
            }
            
            return curried.apply(this, newArgs);
        };
    };
}

const _ = Symbol('placeholder');
const advancedCurriedAdd = advancedCurry(add, _);

console.log(advancedCurriedAdd(_, 2, _)(1)(3)); // 6
console.log(advancedCurriedAdd(1, _, 3)(2));    // 6

// Practical curry examples

// 1. Event handling
const addEventListener = curry((event, selector, handler) => {
    document.querySelector(selector).addEventListener(event, handler);
});

const addClickListener = addEventListener('click');
const addClickToButton = addClickListener('#myButton');
addClickToButton(() => console.log('Button clicked!'));

// 2. Array operations
const map = curry((fn, array) => array.map(fn));
const filter = curry((predicate, array) => array.filter(predicate));

const numbers = [1, 2, 3, 4, 5];

const double = map(x => x * 2);
const isEven = filter(x => x % 2 === 0);

console.log(double(numbers));        // [2, 4, 6, 8, 10]
console.log(isEven(numbers));        // [2, 4]

// 3. Function composition with curry
const compose = (...fns) => (value) => fns.reduceRight((acc, fn) => fn(acc), value);

const addOne = x => x + 1;
const multiplyByTwo = x => x * 2;
const square = x => x * x;

const transform = compose(square, multiplyByTwo, addOne);
console.log(transform(3)); // ((3 + 1) * 2)² = 64

// 4. Partial application utility
function partial(fn, ...partialArgs) {
    return function(...remainingArgs) {
        return fn(...partialArgs, ...remainingArgs);
    };
}

const multiply = (a, b, c) => a * b * c;
const multiplyByTwo = partial(multiply, 2);
const multiplyByTwoAndThree = partial(multiply, 2, 3);

console.log(multiplyByTwo(3, 4));     // 24
console.log(multiplyByTwoAndThree(5)); // 30

// 5. Curry with method binding
function curryMethod(obj, methodName) {
    const method = obj[methodName];
    return curry(method.bind(obj));
}

const calculator = {
    add(a, b, c) {
        return a + b + c;
    },
    
    multiply(a, b, c) {
        return a * b * c;
    }
};

const curriedCalculatorAdd = curryMethod(calculator, 'add');
console.log(curriedCalculatorAdd(1)(2)(3)); // 6
```

---

**Q19: Implement debounce and throttle functions.**

**Answer:**

```javascript
// Debounce - delays execution until after wait time has elapsed since last call
function debounce(func, wait, immediate = false) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        
        const callNow = immediate && !timeout;
        
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(this, args);
    };
}

// Throttle - limits execution to once per wait period
function throttle(func, wait) {
    let inThrottle;
    
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, wait);
        }
    };
}

// Advanced throttle with leading and trailing options
function advancedThrottle(func, wait, options = {}) {
    let timeout, context, args, result;
    let previous = 0;
    
    const { leading = true, trailing = true } = options;
    
    const later = function() {
        previous = leading === false ? 0 : Date.now();
        timeout = null;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
    };
    
    return function throttled(...newArgs) {
        const now = Date.now();
        
        if (!previous && leading === false) previous = now;
        
        const remaining = wait - (now - previous);
        context = this;
        args = newArgs;
        
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            result = func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
        
        return result;
    };
}

// Usage examples

// 1. Search input debouncing
const searchInput = document.getElementById('search');
const performSearch = (query) => {
    console.log(`Searching for: ${query}`);
    // API call here
};

const debouncedSearch = debounce((event) => {
    performSearch(event.target.value);
}, 300);

searchInput?.addEventListener('input', debouncedSearch);

// 2. Scroll event throttling
const handleScroll = () => {
    console.log('Scroll position:', window.scrollY);
    // Update UI based on scroll position
};

const throttledScroll = throttle(handleScroll, 100);
window.addEventListener('scroll', throttledScroll);

// 3. Button click debouncing (prevent double-clicks)
const submitButton = document.getElementById('submit');
const handleSubmit = () => {
    console.log('Form submitted');
    // Submit form
};

const debouncedSubmit = debounce(handleSubmit, 1000, true); // immediate = true
submitButton?.addEventListener('click', debouncedSubmit);

// 4. Resize event handling
const handleResize = () => {
    console.log('Window resized:', window.innerWidth, window.innerHeight);
    // Recalculate layout
};

const debouncedResize = debounce(handleResize, 250);
window.addEventListener('resize', debouncedResize);

// 5. API rate limiting
class APIClient {
    constructor() {
        this.makeRequest = throttle(this._makeRequest.bind(this), 1000);
    }
    
    _makeRequest(url, options) {
        console.log(`Making request to: ${url}`);
        return fetch(url, options);
    }
}

const client = new APIClient();

// 6. Debounce with cancel functionality
function debounceCancelable(func, wait) {
    let timeout;
    
    const debounced = function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
    
    debounced.cancel = function() {
        clearTimeout(timeout);
        timeout = null;
    };
    
    debounced.flush = function() {
        if (timeout) {
            clearTimeout(timeout);
            func.apply(this, arguments);
        }
    };
    
    return debounced;
}

const cancellableDebounced = debounceCancelable(() => {
    console.log('Executed');
}, 1000);

// Cancel the debounced function
cancellableDebounced.cancel();

// Force immediate execution
cancellableDebounced.flush();

// 7. Performance comparison
function performanceTest() {
    let normalCount = 0;
    let debouncedCount = 0;
    let throttledCount = 0;
    
    const normalHandler = () => normalCount++;
    const debouncedHandler = debounce(() => debouncedCount++, 100);
    const throttledHandler = throttle(() => throttledCount++, 100);
    
    // Simulate rapid events
    const interval = setInterval(() => {
        normalHandler();
        debouncedHandler();
        throttledHandler();
    }, 10);
    
    setTimeout(() => {
        clearInterval(interval);
        console.log('Normal calls:', normalCount);
        console.log('Debounced calls:', debouncedCount);
        console.log('Throttled calls:', throttledCount);
    }, 1000);
}

// performanceTest();

// Key differences:
// Debounce: Waits for quiet period, then executes once
// Throttle: Executes at regular intervals during activity
// Use debounce for: search inputs, form validation, window resize
// Use throttle for: scroll events, mouse movement, API calls
```
---

## 🧠 **EXPERT LEVEL (Architect/Lead)**

### **10. Memory Management & Performance**

**Q20: What causes memory leaks in JavaScript? Provide examples.**

**Answer:**
Memory leaks occur when objects are no longer needed but aren't garbage collected due to unwanted references.

```javascript
// 1. Detached DOM Nodes
function createMemoryLeak() {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    
    // Store reference to child
    const childRef = child;
    
    // Remove parent from DOM but keep reference to child
    document.body.appendChild(parent);
    document.body.removeChild(parent);
    
    // Memory leak: child is detached but still referenced
    return childRef; // This prevents garbage collection
}

// Fix: Remove references to detached nodes
function fixedDOMHandling() {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);
    
    document.body.appendChild(parent);
    document.body.removeChild(parent);
    
    // No references kept = can be garbage collected
    return null;
}

// 2. Event Listeners Not Removed
class ComponentWithLeak {
    constructor() {
        this.data = new Array(1000000).fill('data'); // Large data
        
        // Event listener keeps reference to 'this'
        this.handleClick = () => {
            console.log(this.data.length);
        };
        
        document.addEventListener('click', this.handleClick);
    }
    
    // Missing cleanup method
}

class ComponentFixed {
    constructor() {
        this.data = new Array(1000000).fill('data');
        
        this.handleClick = () => {
            console.log(this.data.length);
        };
        
        document.addEventListener('click', this.handleClick);
    }
    
    destroy() {
        // Remove event listener to prevent memory leak
        document.removeEventListener('click', this.handleClick);
        this.data = null; // Clear large data
    }
}

// 3. Closures Holding References
function createClosureLeak() {
    const largeData = new Array(1000000).fill('data');
    
    function innerFunction() {
        // This closure keeps largeData in memory
        return largeData.length;
    }
    
    // Even if we only return a simple function,
    // the entire scope (including largeData) is kept
    return function() {
        return 'simple function';
    };
}

function fixedClosure() {
    const largeData = new Array(1000000).fill('data');
    const dataLength = largeData.length; // Extract only what's needed
    
    return function() {
        return dataLength; // Only keeps the number, not the array
    };
}

// 4. Timers Not Cleared
function timerLeak() {
    const data = new Array(1000000).fill('data');
    
    const intervalId = setInterval(() => {
        console.log(data.length); // Keeps reference to data
    }, 1000);
    
    // Missing: clearInterval(intervalId);
    return intervalId;
}

function fixedTimer() {
    const data = new Array(1000000).fill('data');
    
    const intervalId = setInterval(() => {
        console.log(data.length);
    }, 1000);
    
    // Return cleanup function
    return () => {
        clearInterval(intervalId);
    };
}

// 5. Global Variables
// Bad: Global variables are never garbage collected
window.globalData = new Array(1000000).fill('data');

// Better: Use modules or proper scoping
(function() {
    const moduleData = new Array(1000000).fill('data');
    
    // Export only what's needed
    window.myModule = {
        getDataLength: () => moduleData.length,
        cleanup: () => { moduleData.length = 0; }
    };
})();

// 6. Circular References (less common in modern JS)
function circularReference() {
    const obj1 = {};
    const obj2 = {};
    
    obj1.ref = obj2;
    obj2.ref = obj1; // Circular reference
    
    // Modern JS engines handle this, but can be problematic
    // in older environments or with DOM nodes
    
    return { obj1, obj2 };
}

// 7. WeakMap vs Map for memory management
class CacheWithLeak {
    constructor() {
        this.cache = new Map(); // Strong references
    }
    
    set(key, value) {
        this.cache.set(key, value);
        // Objects used as keys won't be garbage collected
    }
}

class CacheFixed {
    constructor() {
        this.cache = new WeakMap(); // Weak references
    }
    
    set(key, value) {
        this.cache.set(key, value);
        // Objects can be garbage collected when no other references exist
    }
}

// Memory leak detection tools and techniques
function detectMemoryLeaks() {
    // 1. Monitor memory usage
    if (performance.memory) {
        console.log('Used:', performance.memory.usedJSHeapSize);
        console.log('Total:', performance.memory.totalJSHeapSize);
        console.log('Limit:', performance.memory.jsHeapSizeLimit);
    }
    
    // 2. Use WeakRef for optional references (ES2021)
    class OptionalReference {
        constructor(target) {
            this.ref = new WeakRef(target);
        }
        
        get() {
            const target = this.ref.deref();
            if (target === undefined) {
                console.log('Target was garbage collected');
            }
            return target;
        }
    }
    
    // 3. FinalizationRegistry for cleanup (ES2021)
    const registry = new FinalizationRegistry((heldValue) => {
        console.log(`Object ${heldValue} was garbage collected`);
    });
    
    function createTrackedObject(id) {
        const obj = { id };
        registry.register(obj, id);
        return obj;
    }
}

// Best practices to prevent memory leaks:
// 1. Always remove event listeners
// 2. Clear timers and intervals
// 3. Avoid global variables
// 4. Use WeakMap/WeakSet for optional references
// 5. Nullify references when done
// 6. Use proper cleanup in component lifecycle
// 7. Monitor memory usage in development
```

---

### **11. Metaprogramming**

**Q21: Implement a Proxy that logs property access.**

**Answer:**

```javascript
// Basic logging proxy
function createLoggingProxy(target, name = 'Object') {
    return new Proxy(target, {
        get(target, property, receiver) {
            console.log(`[${name}] GET: ${String(property)}`);
            return Reflect.get(target, property, receiver);
        },
        
        set(target, property, value, receiver) {
            console.log(`[${name}] SET: ${String(property)} = ${value}`);
            return Reflect.set(target, property, value, receiver);
        },
        
        has(target, property) {
            console.log(`[${name}] HAS: ${String(property)}`);
            return Reflect.has(target, property);
        },
        
        deleteProperty(target, property) {
            console.log(`[${name}] DELETE: ${String(property)}`);
            return Reflect.deleteProperty(target, property);
        }
    });
}

// Usage
const obj = { name: 'Alice', age: 30 };
const proxy = createLoggingProxy(obj, 'User');

proxy.name;        // [User] GET: name
proxy.age = 31;    // [User] SET: age = 31
'name' in proxy;   // [User] HAS: name
delete proxy.age;  // [User] DELETE: age

// Advanced proxy with method interception
function createAdvancedProxy(target, options = {}) {
    const { 
        logAccess = true, 
        logMethods = true, 
        validateTypes = false,
        immutable = false 
    } = options;
    
    return new Proxy(target, {
        get(target, property, receiver) {
            if (logAccess) {
                console.log(`GET: ${String(property)}`);
            }
            
            const value = Reflect.get(target, property, receiver);
            
            // Intercept method calls
            if (typeof value === 'function' && logMethods) {
                return new Proxy(value, {
                    apply(target, thisArg, argumentsList) {
                        console.log(`CALL: ${String(property)}(${argumentsList.join(', ')})`);
                        const result = Reflect.apply(target, thisArg, argumentsList);
                        console.log(`RESULT: ${result}`);
                        return result;
                    }
                });
            }
            
            return value;
        },
        
        set(target, property, value, receiver) {
            if (immutable) {
                throw new Error(`Cannot modify immutable object property: ${String(property)}`);
            }
            
            if (validateTypes && property in target) {
                const currentType = typeof target[property];
                const newType = typeof value;
                
                if (currentType !== newType) {
                    throw new TypeError(
                        `Type mismatch: expected ${currentType}, got ${newType}`
                    );
                }
            }
            
            if (logAccess) {
                console.log(`SET: ${String(property)} = ${value}`);
            }
            
            return Reflect.set(target, property, value, receiver);
        }
    });
}

// Usage examples
const user = {
    name: 'Bob',
    age: 25,
    greet() {
        return `Hello, I'm ${this.name}`;
    }
};

const advancedProxy = createAdvancedProxy(user, {
    logAccess: true,
    logMethods: true,
    validateTypes: true
});

advancedProxy.greet(); // CALL: greet() -> RESULT: Hello, I'm Bob
// advancedProxy.age = 'thirty'; // TypeError: Type mismatch

// Proxy for API mocking
function createAPIMock(baseURL) {
    return new Proxy({}, {
        get(target, property) {
            return function(...args) {
                const endpoint = String(property).replace(/([A-Z])/g, '-$1').toLowerCase();
                const url = `${baseURL}/${endpoint}`;
                
                console.log(`API Call: ${url}`, args);
                
                // Mock response
                return Promise.resolve({
                    status: 200,
                    data: { message: `Mock response for ${endpoint}` }
                });
            };
        }
    });
}

const api = createAPIMock('https://api.example.com');
api.getUsers();        // API Call: https://api.example.com/get-users
api.createPost();      // API Call: https://api.example.com/create-post

// Proxy for property validation
function createValidatedObject(schema) {
    return new Proxy({}, {
        set(target, property, value) {
            const validator = schema[property];
            
            if (!validator) {
                throw new Error(`Property ${String(property)} is not allowed`);
            }
            
            if (!validator(value)) {
                throw new Error(`Invalid value for ${String(property)}: ${value}`);
            }
            
            return Reflect.set(target, property, value);
        }
    });
}

const userSchema = {
    name: (value) => typeof value === 'string' && value.length > 0,
    age: (value) => typeof value === 'number' && value >= 0 && value <= 150,
    email: (value) => typeof value === 'string' && value.includes('@')
};

const validatedUser = createValidatedObject(userSchema);
validatedUser.name = 'Alice';  // ✅ Valid
validatedUser.age = 30;        // ✅ Valid
// validatedUser.age = -5;     // ❌ Error: Invalid value for age: -5

// Proxy for nested object access
function createDeepProxy(target, handler) {
    return new Proxy(target, {
        get(target, property, receiver) {
            const value = Reflect.get(target, property, receiver);
            
            if (typeof value === 'object' && value !== null) {
                return createDeepProxy(value, handler);
            }
            
            return handler.get ? handler.get(target, property, receiver) : value;
        },
        
        set(target, property, value, receiver) {
            return handler.set ? 
                handler.set(target, property, value, receiver) : 
                Reflect.set(target, property, value, receiver);
        }
    });
}

const deepObj = {
    user: {
        profile: {
            name: 'Alice'
        }
    }
};

const deepProxy = createDeepProxy(deepObj, {
    get(target, property, receiver) {
        console.log(`Deep access: ${String(property)}`);
        return Reflect.get(target, property, receiver);
    }
});

deepProxy.user.profile.name; // Logs access at each level
```

---

## 🎪 **PRACTICAL CODING CHALLENGES**

### **Challenge 1: Implement Promise.all() from scratch**

**Answer:**

```javascript
function myPromiseAll(promises) {
    return new Promise((resolve, reject) => {
        // Handle empty array
        if (promises.length === 0) {
            resolve([]);
            return;
        }
        
        const results = new Array(promises.length);
        let completedCount = 0;
        
        promises.forEach((promise, index) => {
            // Convert non-promise values to promises
            Promise.resolve(promise)
                .then(value => {
                    results[index] = value;
                    completedCount++;
                    
                    // All promises completed
                    if (completedCount === promises.length) {
                        resolve(results);
                    }
                })
                .catch(error => {
                    // Any promise rejection rejects the whole thing
                    reject(error);
                });
        });
    });
}

// Test implementation
const promise1 = Promise.resolve(1);
const promise2 = new Promise(resolve => setTimeout(() => resolve(2), 100));
const promise3 = Promise.resolve(3);

myPromiseAll([promise1, promise2, promise3])
    .then(results => console.log('All resolved:', results)) // [1, 2, 3]
    .catch(error => console.error('Error:', error));

// Test with rejection
const rejectingPromise = Promise.reject('Error!');
myPromiseAll([promise1, rejectingPromise, promise3])
    .then(results => console.log('Should not reach here'))
    .catch(error => console.log('Caught:', error)); // 'Error!'

// Implement other Promise combinators
function myPromiseRace(promises) {
    return new Promise((resolve, reject) => {
        if (promises.length === 0) {
            return; // Never resolves
        }
        
        promises.forEach(promise => {
            Promise.resolve(promise)
                .then(resolve)  // First to resolve wins
                .catch(reject); // First to reject wins
        });
    });
}

function myPromiseAllSettled(promises) {
    return new Promise(resolve => {
        if (promises.length === 0) {
            resolve([]);
            return;
        }
        
        const results = new Array(promises.length);
        let completedCount = 0;
        
        promises.forEach((promise, index) => {
            Promise.resolve(promise)
                .then(value => {
                    results[index] = { status: 'fulfilled', value };
                })
                .catch(reason => {
                    results[index] = { status: 'rejected', reason };
                })
                .finally(() => {
                    completedCount++;
                    if (completedCount === promises.length) {
                        resolve(results);
                    }
                });
        });
    });
}

function myPromiseAny(promises) {
    return new Promise((resolve, reject) => {
        if (promises.length === 0) {
            reject(new AggregateError([], 'All promises were rejected'));
            return;
        }
        
        const errors = new Array(promises.length);
        let rejectedCount = 0;
        
        promises.forEach((promise, index) => {
            Promise.resolve(promise)
                .then(resolve) // First fulfillment wins
                .catch(error => {
                    errors[index] = error;
                    rejectedCount++;
                    
                    if (rejectedCount === promises.length) {
                        reject(new AggregateError(errors, 'All promises were rejected'));
                    }
                });
        });
    });
}
```

---

### **Challenge 2: Build a Deep Clone Function**

**Answer:**

```javascript
function deepClone(obj, visited = new WeakMap()) {
    // Handle null and undefined
    if (obj === null || obj === undefined) {
        return obj;
    }
    
    // Handle primitive types
    if (typeof obj !== 'object') {
        return obj;
    }
    
    // Handle circular references
    if (visited.has(obj)) {
        return visited.get(obj);
    }
    
    // Handle Date
    if (obj instanceof Date) {
        return new Date(obj.getTime());
    }
    
    // Handle RegExp
    if (obj instanceof RegExp) {
        return new RegExp(obj.source, obj.flags);
    }
    
    // Handle Arrays
    if (Array.isArray(obj)) {
        const clonedArray = [];
        visited.set(obj, clonedArray);
        
        for (let i = 0; i < obj.length; i++) {
            clonedArray[i] = deepClone(obj[i], visited);
        }
        
        return clonedArray;
    }
    
    // Handle Map
    if (obj instanceof Map) {
        const clonedMap = new Map();
        visited.set(obj, clonedMap);
        
        for (const [key, value] of obj) {
            clonedMap.set(deepClone(key, visited), deepClone(value, visited));
        }
        
        return clonedMap;
    }
    
    // Handle Set
    if (obj instanceof Set) {
        const clonedSet = new Set();
        visited.set(obj, clonedSet);
        
        for (const value of obj) {
            clonedSet.add(deepClone(value, visited));
        }
        
        return clonedSet;
    }
    
    // Handle Functions
    if (typeof obj === 'function') {
        // Functions are typically not cloned, return reference
        return obj;
    }
    
    // Handle Objects
    const clonedObj = Object.create(Object.getPrototypeOf(obj));
    visited.set(obj, clonedObj);
    
    // Clone all enumerable and non-enumerable properties
    const descriptors = Object.getOwnPropertyDescriptors(obj);
    
    for (const key in descriptors) {
        const descriptor = descriptors[key];
        
        if (descriptor.value !== undefined) {
            descriptor.value = deepClone(descriptor.value, visited);
        }
        
        Object.defineProperty(clonedObj, key, descriptor);
    }
    
    return clonedObj;
}

// Test the deep clone function
const original = {
    name: 'Alice',
    age: 30,
    hobbies: ['reading', 'coding'],
    address: {
        street: '123 Main St',
        city: 'Anytown'
    },
    date: new Date(),
    regex: /test/gi,
    map: new Map([['key1', 'value1']]),
    set: new Set([1, 2, 3]),
    func: function() { return 'hello'; }
};

// Create circular reference
original.self = original;

const cloned = deepClone(original);

console.log('Original:', original);
console.log('Cloned:', cloned);
console.log('Are they equal?', original === cloned); // false
console.log('Deep equal?', JSON.stringify(original) === JSON.stringify(cloned)); // true (mostly)

// Modify cloned object
cloned.name = 'Bob';
cloned.hobbies.push('gaming');

console.log('Original name:', original.name); // 'Alice' (unchanged)
console.log('Cloned name:', cloned.name);     // 'Bob'
console.log('Original hobbies:', original.hobbies); // ['reading', 'coding'] (unchanged)
console.log('Cloned hobbies:', cloned.hobbies);     // ['reading', 'coding', 'gaming']

// Alternative implementations for specific use cases

// Shallow clone
function shallowClone(obj) {
    if (Array.isArray(obj)) {
        return [...obj];
    }
    
    if (typeof obj === 'object' && obj !== null) {
        return { ...obj };
    }
    
    return obj;
}

// JSON-based clone (limited but fast)
function jsonClone(obj) {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (error) {
        throw new Error('Object contains non-serializable properties');
    }
}

// Structured clone (modern browsers)
function structuredClone(obj) {
    if (typeof window !== 'undefined' && window.structuredClone) {
        return window.structuredClone(obj);
    }
    
    // Fallback for older environments
    return deepClone(obj);
}
```

---

## 📋 **INTERVIEW TIPS & BEST PRACTICES**

### **For Candidates:**

1. **Master the Fundamentals**
   - Understand scope, closures, and prototypes deeply
   - Know the event loop and asynchronous patterns
   - Practice explaining concepts clearly

2. **Code Quality**
   - Write clean, readable code
   - Handle edge cases
   - Consider performance implications
   - Use meaningful variable names

3. **Problem-Solving Approach**
   - Ask clarifying questions
   - Think out loud
   - Start with a simple solution, then optimize
   - Test your code mentally

4. **Communication**
   - Explain your thought process
   - Discuss trade-offs
   - Be honest about what you don't know
   - Ask for hints when stuck

### **For Interviewers:**

1. **Question Selection**
   - Start with basics, build complexity
   - Focus on problem-solving, not syntax
   - Include practical scenarios
   - Allow thinking time

2. **Evaluation Criteria**
   - Code correctness and efficiency
   - Understanding of concepts
   - Communication skills
   - Debugging ability

---

## 🔗 **Additional Resources**

- **MDN Web Docs**: Comprehensive JavaScript reference
- **JavaScript.info**: Modern JavaScript tutorial
- **You Don't Know JS**: Deep dive book series
- **ECMAScript Specifications**: Official language specs
- **V8 Blog**: JavaScript engine insights

---

*This comprehensive guide covers JavaScript from fundamentals to advanced concepts. Regular practice with these questions will prepare you for any JavaScript interview level!*
