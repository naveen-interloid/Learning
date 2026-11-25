# JavaScript Data Structures

JavaScript provides several built-in data structures for storing and organizing data efficiently. They can be broadly categorized into **Structured Data**, **Keyed Collections**, and **Indexed Collections**.

---

## 1) Structured Data

### JSON (JavaScript Object Notation)
A lightweight, text-based format for representing structured data, widely used for data exchange between servers and web applications.

**Key Features:**
- Human-readable format
- Language-independent
- Supports strings, numbers, booleans, arrays, objects, and null
- Does NOT support functions, undefined, or comments

**Detailed Examples:**

```javascript
// Creating and converting objects to JSON
const user = {
    name: "Alice Johnson",
    age: 28,
    isActive: true,
    hobbies: ["reading", "coding", "hiking"],
    address: {
        city: "New York",
        zipCode: "10001"
    }
};

// Object → JSON string
const jsonString = JSON.stringify(user);
console.log(jsonString);
// Output: {"name":"Alice Johnson","age":28,"isActive":true,"hobbies":["reading","coding","hiking"],"address":{"city":"New York","zipCode":"10001"}}

// JSON string → Object
const parsedUser = JSON.parse(jsonString);
console.log(parsedUser.name); // "Alice Johnson"
console.log(parsedUser.hobbies[1]); // "coding"

// Pretty printing JSON
const prettyJson = JSON.stringify(user, null, 2);
console.log(prettyJson);
/*
{
  "name": "Alice Johnson",
  "age": 28,
  "isActive": true,
  "hobbies": [
    "reading",
    "coding",
    "hiking"
  ],
  "address": {
    "city": "New York",
    "zipCode": "10001"
  }
}
*/

// Handling JSON parsing errors
try {
    const invalidJson = '{"name": "Bob", "age": }'; // Invalid JSON
    const result = JSON.parse(invalidJson);
} catch (error) {
    console.log("JSON parsing failed:", error.message);
}
```

---

## 2) Keyed Collections

These data structures store data as **key-value pairs** with enhanced functionality compared to plain objects.

### Map
A collection that holds key-value pairs where keys can be of **any type** and maintains insertion order.

**Key Features:**
- Keys can be objects, functions, or primitives
- Maintains insertion order
- Has a size property
- Iterable

**Detailed Examples:**

```javascript
// Creating and using Maps
const userRoles = new Map();

// Setting values with different key types
userRoles.set("john_doe", "admin");
userRoles.set(123, "user");
userRoles.set(true, "guest");

// Using objects as keys
const userObj = { id: 1, name: "Alice" };
userRoles.set(userObj, "moderator");

console.log(userRoles.get("john_doe")); // "admin"
console.log(userRoles.get(123)); // "user"
console.log(userRoles.get(userObj)); // "moderator"

// Map properties and methods
console.log(userRoles.size); // 4
console.log(userRoles.has("john_doe")); // true

// Iterating over Maps
for (const [key, value] of userRoles) {
    console.log(`${key} => ${value}`);
}

// Using forEach
userRoles.forEach((value, key) => {
    console.log(`Key: ${key}, Value: ${value}`);
});

// Converting Map to Array
const mapArray = Array.from(userRoles);
console.log(mapArray); // [["john_doe", "admin"], [123, "user"], ...]

// Clearing and deleting
userRoles.delete("john_doe");
console.log(userRoles.size); // 3
userRoles.clear();
console.log(userRoles.size); // 0
```

### WeakMap
Similar to Map, but with **object-only keys** that are held weakly, allowing garbage collection.

**Key Features:**
- Keys must be objects (not primitives)
- Keys are weakly referenced
- Not iterable
- No size property
- Useful for private data storage

**Detailed Examples:**

```javascript
// Creating WeakMap for private data
const privateData = new WeakMap();

class User {
    constructor(name, email) {
        // Store private data using WeakMap
        privateData.set(this, {
            name: name,
            email: email,
            createdAt: new Date()
        });
    }
    
    getName() {
        return privateData.get(this).name;
    }
    
    getEmail() {
        return privateData.get(this).email;
    }
    
    updateEmail(newEmail) {
        const data = privateData.get(this);
        data.email = newEmail;
    }
}

const user1 = new User("Bob Smith", "bob@example.com");
const user2 = new User("Carol White", "carol@example.com");

console.log(user1.getName()); // "Bob Smith"
console.log(user2.getEmail()); // "carol@example.com"

// WeakMap with DOM elements (common use case)
const elementData = new WeakMap();
const button = document.createElement('button');

elementData.set(button, {
    clickCount: 0,
    lastClicked: null
});

// When button is removed from DOM and no other references exist,
// the WeakMap entry will be garbage collected automatically
```

### Set
A collection of **unique values** of any type, maintaining insertion order.

**Key Features:**
- Stores only unique values
- Maintains insertion order
- Values can be of any type
- Iterable with size property

**Detailed Examples:**

```javascript
// Creating Sets and handling duplicates
const uniqueNumbers = new Set([1, 2, 3, 2, 1, 4]);
console.log(uniqueNumbers); // Set { 1, 2, 3, 4 }

const tags = new Set();
tags.add("javascript");
tags.add("programming");
tags.add("web-dev");
tags.add("javascript"); // Duplicate - won't be added

console.log(tags.size); // 3
console.log(tags.has("javascript")); // true

// Working with different data types
const mixedSet = new Set();
mixedSet.add(42);
mixedSet.add("hello");
mixedSet.add(true);
mixedSet.add({ name: "object" });
mixedSet.add([1, 2, 3]);

// Note: Objects and arrays are compared by reference
mixedSet.add({ name: "object" }); // This will be added (different reference)
console.log(mixedSet.size); // 6

// Iterating over Sets
for (const value of tags) {
    console.log(value);
}

// Converting Set to Array
const tagArray = [...tags];
console.log(tagArray); // ["javascript", "programming", "web-dev"]

// Array deduplication using Set
const numbersWithDuplicates = [1, 2, 2, 3, 4, 4, 5];
const uniqueArray = [...new Set(numbersWithDuplicates)];
console.log(uniqueArray); // [1, 2, 3, 4, 5]

// Set operations
const setA = new Set([1, 2, 3, 4]);
const setB = new Set([3, 4, 5, 6]);

// Union
const union = new Set([...setA, ...setB]);
console.log(union); // Set { 1, 2, 3, 4, 5, 6 }

// Intersection
const intersection = new Set([...setA].filter(x => setB.has(x)));
console.log(intersection); // Set { 3, 4 }

// Difference
const difference = new Set([...setA].filter(x => !setB.has(x)));
console.log(difference); // Set { 1, 2 }
```

### WeakSet
Similar to Set, but can only store **objects** that are weakly referenced.

**Key Features:**
- Can only store objects
- Objects are weakly referenced
- Not iterable
- No size property
- Useful for tracking object states

**Detailed Examples:**

```javascript
// Creating WeakSet for object tracking
const processedObjects = new WeakSet();

class DataProcessor {
    static process(obj) {
        if (processedObjects.has(obj)) {
            console.log("Object already processed");
            return;
        }
        
        // Process the object
        console.log("Processing object:", obj);
        processedObjects.add(obj);
    }
}

const data1 = { id: 1, value: "test" };
const data2 = { id: 2, value: "example" };

DataProcessor.process(data1); // "Processing object: {id: 1, value: 'test'}"
DataProcessor.process(data1); // "Object already processed"
DataProcessor.process(data2); // "Processing object: {id: 2, value: 'example'}"

// WeakSet for DOM element tracking
const clickedElements = new WeakSet();

function handleClick(element) {
    if (clickedElements.has(element)) {
        console.log("Element was already clicked");
    } else {
        console.log("First time clicking this element");
        clickedElements.add(element);
    }
}

// When elements are removed from DOM, they're automatically
// removed from WeakSet through garbage collection
```

---

## 3) Indexed Collections

These data structures store elements with **numeric indices** in ordered sequences.

### Arrays
Ordered lists that can store any type of data with zero-based indexing.

**Key Features:**
- Dynamic size
- Can store mixed data types
- Zero-based indexing
- Rich set of built-in methods

**Detailed Examples:**

```javascript
// Array creation and basic operations
const fruits = ["apple", "banana", "orange"];
const numbers = [1, 2, 3, 4, 5];
const mixed = [1, "hello", true, { name: "object" }, [1, 2, 3]];

// Accessing elements
console.log(fruits[0]); // "apple"
console.log(fruits[fruits.length - 1]); // "orange"

// Adding elements
fruits.push("grape"); // Add to end
fruits.unshift("mango"); // Add to beginning
console.log(fruits); // ["mango", "apple", "banana", "orange", "grape"]

// Removing elements
const lastFruit = fruits.pop(); // Remove from end
const firstFruit = fruits.shift(); // Remove from beginning
console.log(lastFruit); // "grape"
console.log(firstFruit); // "mango"

// Array methods - Iteration
const numbers2 = [1, 2, 3, 4, 5];

// forEach - execute function for each element
numbers2.forEach((num, index) => {
    console.log(`Index ${index}: ${num}`);
});

// map - create new array with transformed elements
const doubled = numbers2.map(num => num * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

// filter - create new array with elements that pass test
const evenNumbers = numbers2.filter(num => num % 2 === 0);
console.log(evenNumbers); // [2, 4]

// reduce - reduce array to single value
const sum = numbers2.reduce((acc, num) => acc + num, 0);
console.log(sum); // 15

// find - find first element that matches condition
const found = numbers2.find(num => num > 3);
console.log(found); // 4

// Array methods - Modification
const colors = ["red", "green", "blue"];

// splice - add/remove elements at specific position
colors.splice(1, 1, "yellow", "purple"); // Remove 1 element at index 1, add 2 new
console.log(colors); // ["red", "yellow", "purple", "blue"]

// slice - extract portion of array (doesn't modify original)
const subset = colors.slice(1, 3);
console.log(subset); // ["yellow", "purple"]
console.log(colors); // Original unchanged

// Multidimensional arrays
const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

console.log(matrix[1][2]); // 6 (row 1, column 2)

// Array destructuring
const [first, second, ...rest] = numbers2;
console.log(first); // 1
console.log(second); // 2
console.log(rest); // [3, 4, 5]
```

### Typed Arrays
Specialized arrays for handling **binary data** with fixed element sizes and types.

**Key Features:**
- Fixed element size and type
- Better performance for numerical computations
- Direct memory access
- Useful for graphics, audio, and file processing

**Detailed Examples:**

```javascript
// Creating ArrayBuffer and Typed Array views
const buffer = new ArrayBuffer(16); // 16 bytes buffer

// Different views of the same buffer
const int8View = new Int8Array(buffer);
const int16View = new Int16Array(buffer);
const int32View = new Int32Array(buffer);
const float32View = new Float32Array(buffer);

console.log(int8View.length); // 16 (16 bytes, 1 byte each)
console.log(int16View.length); // 8 (16 bytes, 2 bytes each)
console.log(int32View.length); // 4 (16 bytes, 4 bytes each)
console.log(float32View.length); // 4 (16 bytes, 4 bytes each)

// Working with specific typed arrays
const temperatures = new Float32Array([20.5, 25.3, 18.7, 22.1]);
console.log(temperatures[0]); // 20.5

// Typed arrays have array-like methods
const celsiusToFahrenheit = temperatures.map(c => (c * 9/5) + 32);
console.log(celsiusToFahrenheit); // Float32Array [68.9, 77.54, 65.66, 71.78]

// Creating typed arrays with specific sizes
const pixels = new Uint8ClampedArray(1024); // For image data (0-255 range)
const audioSamples = new Float32Array(44100); // For audio data

// Working with binary data
const binaryData = new Uint8Array([72, 101, 108, 108, 111]); // "Hello" in ASCII
const text = String.fromCharCode(...binaryData);
console.log(text); // "Hello"

// DataView for mixed data types in same buffer
const mixedBuffer = new ArrayBuffer(12);
const dataView = new DataView(mixedBuffer);

// Write different types at different offsets
dataView.setInt32(0, 42); // 4 bytes at offset 0
dataView.setFloat32(4, 3.14); // 4 bytes at offset 4
dataView.setInt16(8, 256); // 2 bytes at offset 8

// Read the data back
console.log(dataView.getInt32(0)); // 42
console.log(dataView.getFloat32(4)); // 3.14
console.log(dataView.getInt16(8)); // 256

// Practical example: Processing image data
function processImageData(imageData) {
    const pixels = new Uint8ClampedArray(imageData);
    
    // Convert to grayscale (simplified)
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        
        pixels[i] = gray;     // Red
        pixels[i + 1] = gray; // Green
        pixels[i + 2] = gray; // Blue
        // pixels[i + 3] is alpha, leave unchanged
    }
    
    return pixels;
}
```

---

## 📌 Comprehensive Comparison Table

| Category | Structure | Key Features | Use Cases | Performance |
|----------|-----------|--------------|-----------|-------------|
| **Structured Data** | JSON | Text format, serializable | Data exchange, APIs, config files | N/A (format) |
| **Keyed Collections** | Map | Any key type, ordered, iterable | Caching, metadata storage | O(1) access |
| | WeakMap | Object keys, weak references | Private data, DOM associations | O(1) access |
| | Set | Unique values, ordered, iterable | Deduplication, membership testing | O(1) operations |
| | WeakSet | Object values, weak references | Object state tracking | O(1) operations |
| **Indexed Collections** | Array | Dynamic, mixed types, rich methods | General data storage, lists | O(1) access, O(n) search |
| | TypedArray | Fixed type, binary data | Graphics, audio, scientific computing | O(1) access, better memory |

---

## 🎯 Best Practices

1. **Use Map over Object** when you need non-string keys or frequent additions/deletions
2. **Use Set for uniqueness** instead of array filtering for better performance
3. **Use WeakMap/WeakSet** for memory-sensitive applications with object associations
4. **Use TypedArrays** for numerical computations and binary data processing
5. **Use JSON** for data serialization and API communication
6. **Choose Arrays** for ordered collections with rich manipulation needs

---

## 🔍 Performance Considerations

- **Map/Set**: O(1) for add, delete, has operations
- **WeakMap/WeakSet**: O(1) operations but no iteration capability
- **Arrays**: O(1) for index access, O(n) for search operations
- **TypedArrays**: Better memory efficiency and performance for numerical data
