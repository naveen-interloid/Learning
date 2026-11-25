## 🟨 JavaScript Data Types

JavaScript has two major categories of data types:

* **Primitive Types** (immutable)
* **Objects** (mutable)

## 1) Primitive Types

Primitive data types are **not objects** and have **no methods**. They are:

| Type        | Description                         |
| ----------- | ----------------------------------- |
| `string`    | Textual data                        |
| `number`    | Integers and floating-point numbers |
| `bigint`    | Large integers                      |
| `boolean`   | `true` or `false`                   |
| `undefined` | Uninitialized variables             |
| `null`      | Intentional absence of any value    |
| `symbol`    | Unique and immutable identifier     |

#### Example:

```javascript
let name = "Alice";       // string
let age = 30;             // number
let isOnline = true;      // boolean
let x;                    // undefined
let y = null;             // null
let id = Symbol("id");    // symbol
let big = 12345678901234567890n; // bigint
```

## 2) `typeof` Operator

The `typeof` operator is used to check the **type of a variable**.

#### Example:

```javascript
console.log(typeof "Hello");    // string
console.log(typeof 42);         // number
console.log(typeof true);       // boolean
console.log(typeof undefined);  // undefined
console.log(typeof null);       // object (⚠ known JS quirk)
console.log(typeof Symbol());   // symbol
console.log(typeof 123n);       // bigint
console.log(typeof {});         // object
console.log(typeof []);         // object (array is a type of object)
console.log(typeof function(){}); // function
```

## 3) Objects

Objects are collections of **key-value pairs**. They're used to store complex data.

#### Example:

```javascript
const person = {
  name: "Vikram",
  age: 28,
  greet: function() {
    console.log("Hi, I'm " + this.name);
  }
};

person.greet(); // Hi, I'm Vikram
```

## 4) Object Prototype

In JavaScript, every object has a **prototype**—another object it inherits properties from.

#### Example:

```javascript
const user = {
  sayHi() {
    console.log("Hi!");
  }
};

const admin = Object.create(user);
admin.sayHi(); // Inherited from user
```

## 5) Prototypal Inheritance

JavaScript uses **prototypal inheritance** to allow objects to inherit directly from other objects.

#### Example:

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  console.log(this.name + " makes a noise.");
};

const dog = new Animal("Doggo");
dog.speak(); // Doggo makes a noise.
```
Got it — here’s just the **Built-in Objects** section for your `datatype.md`:

---

## 6) Built-in Objects

JavaScript provides many **built-in objects** that are available globally without importing anything.

| Category                | Examples                                                                        |
| ----------------------- | ------------------------------------------------------------------------------- |
| **Fundamental**         | `Object`, `Function`, `Boolean`, `Symbol`                                       |
| **Numbers & Dates**     | `Number`, `BigInt`, `Math`, `Date`                                              |
| **Text Processing**     | `String`, `RegExp`                                                              |
| **Indexed Collections** | `Array`, `Int8Array`, `Uint8Array`, `Float32Array`                              |
| **Keyed Collections**   | `Map`, `Set`, `WeakMap`, `WeakSet`                                              |
| **Structured Data**     | `JSON`, `ArrayBuffer`, `DataView`                                               |
| **Control Abstraction** | `Promise`, `Generator`, `GeneratorFunction`, `AsyncFunction`                    |
| **Errors**              | `Error`, `SyntaxError`, `TypeError`, `ReferenceError`, `RangeError`, `URIError` |

#### Example:

```javascript
console.log(Math.PI);          // 3.141592653589793
console.log(Date.now());       // Current timestamp
console.log(JSON.stringify({ a: 1 })); // '{"a":1}'
console.log(new Map([['x', 10], ['y', 20]])); // Map { 'x' => 10, 'y' => 20 }
```

### Fundamental Objects

```javascript
// Object
const obj = { a: 1, b: 2 };

// Function
function greet(name) { return `Hi ${name}`; }

// Boolean
const isTrue = new Boolean(true);

// Symbol
const uniqueId = Symbol('id');
```

---

### Numbers & Dates

```javascript
// Number
const num = Number(42);

// BigInt
const big = 9007199254740991n;

// Math
console.log(Math.sqrt(16)); // 4

// Date
const now = new Date();
```

---

### Text Processing

```javascript
// String
const str = new String("Hello");

// RegExp
const regex = /world/i;
console.log(regex.test("Hello World")); // true
```

---

### Indexed Collections

| Typed Array Type    | Value Range                     | Bytes per Element |
| ------------------- | ------------------------------- | ----------------- |
| `Int8Array`         | -128 to 127                     | 1                 |
| `Uint8Array`        | 0 to 255                        | 1                 |
| `Uint8ClampedArray` | 0 to 255 (clamped)              | 1                 |
| `Int16Array`        | -32768 to 32767                 | 2                 |
| `Uint16Array`       | 0 to 65535                      | 2                 |
| `Int32Array`        | -2,147,483,648 to 2,147,483,647 | 4                 |
| `Uint32Array`       | 0 to 4,294,967,295              | 4                 |
| `Float32Array`      | 1.2e-38 to 3.4e38 (approx)      | 4                 |
| `Float64Array`      | 5.0e-324 to 1.8e308 (approx)    | 8                 |


```javascript
// Array
const arr = [1, 2, 3];

// Typed Arrays
const int8 = new Int8Array([1, 2, 3]);
const uint8 = new Uint8Array([10, 20, 30]);
const float32 = new Float32Array([1.1, 2.2, 3.3]);
```

---

### Keyed Collections

```javascript
// Map
const map = new Map([["a", 1], ["b", 2]]);

// Set
const set = new Set([1, 2, 3]);

// WeakMap
const weakMap = new WeakMap();
const objKey = {};
weakMap.set(objKey, "value");

// WeakSet
const weakSet = new WeakSet();
const objVal = {};
weakSet.add(objVal);
```

---

### Structured Data

```javascript
// JSON
const jsonString = JSON.stringify({ a: 1 });

// ArrayBuffer & DataView
const buffer = new ArrayBuffer(8);
const view = new DataView(buffer);
view.setInt8(0, 42);
```

---

### Control Abstraction

```javascript
// Promise
const promise = new Promise((resolve) => resolve("Done"));

// Generator Function
function* generator() {
  yield 1;
  yield 2;
}
const gen = generator();

// Async Function
async function fetchData() {
  return "data";
}
```

---

### Errors

```javascript
try {
  throw new TypeError("Wrong type!");
} catch (err) {
  console.error(err.name, err.message);
}
```

### Summary

| Category    | Examples                            |
| ----------- | ----------------------------------- |
| Primitive   | `string`, `number`, `boolean`, etc. |
| Objects     | Arrays, Functions, Dates, etc.      |
| Inheritance | via Prototypes (`__proto__`)        |

