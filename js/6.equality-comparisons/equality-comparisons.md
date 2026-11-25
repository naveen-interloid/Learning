# 🟨 Equality Comparisons in JavaScript

JavaScript provides three main ways to compare values for equality. Understanding the differences between these operators is crucial for writing reliable code and avoiding common pitfalls.

## Table of Contents
- [Overview](#overview)
- [ECMAScript Specification Algorithms](#ecmascript-specification-algorithms)
- [Loose Equality (`==`)](#1--loose-equality)
- [Strict Equality (`===`)](#2--strict-equality)
- [Same Value Equality (`Object.is()`)](#3-objectis--same-value-equality)
- [Type Coercion Rules](#type-coercion-rules)
- [Algorithm Comparison Table](#algorithm-comparison-table)
- [Common Pitfalls](#common-pitfalls)
- [Performance Considerations](#performance-considerations)
- [Best Practices](#best-practices)
- [Interactive Examples](#interactive-examples)
- [Summary](#summary)

---

## Overview

| Operator      | Type Conversion? | Special Cases              | Use Case |
| ------------- | ---------------- | -------------------------- | -------- |
| `==`          | ✅ Yes            | `null == undefined` → true | Legacy code, specific scenarios |
| `===`         | ❌ No             | `NaN !== NaN`, `+0 === -0` | **Default choice** for most comparisons |
| `Object.is()` | ❌ No             | `NaN === NaN`, `+0 !== -0` | When you need precise equality |

---

## ECMAScript Specification Algorithms

JavaScript's equality comparisons are built on **four core algorithms** defined in the ECMAScript specification. Understanding these algorithms helps explain why the operators behave the way they do.

### **1. `isLooselyEqual` (Abstract Equality Comparison)**
- **Used by:** `==` operator
- **Behavior:** Allows type coercion before comparison
- **Specification:** Converts operands to the same type, then compares

```javascript
// Examples of isLooselyEqual algorithm
console.log(2 == "2");        // true (string "2" → number 2)
console.log(true == 1);       // true (boolean true → number 1)
console.log(null == undefined); // true (special case in spec)
```

### **2. `isStrictlyEqual` (Strict Equality Comparison)**
- **Used by:** `===` operator
- **Behavior:** No type coercion, types and values must match exactly
- **Specification:** If types differ, return false; otherwise compare values

```javascript
// Examples of isStrictlyEqual algorithm
console.log(2 === "2");       // false (different types)
console.log(NaN === NaN);     // false (NaN special case)
console.log(+0 === -0);       // true (signed zeros treated as equal)
```

### **3. `SameValueZero`**
- **Used by:** `Array.prototype.includes()`, `Map`, `Set`, `Array.prototype.indexOf()` (in some cases)
- **Behavior:** Like `===` but treats `NaN` as equal to `NaN`
- **Specification:** Same as strict equality, except `NaN` equals `NaN`

```javascript
// Examples of SameValueZero algorithm
console.log([1, 2, NaN].includes(NaN));     // true
console.log(new Set([NaN, NaN]).size);      // 1 (NaN treated as same value)
console.log(new Map([[NaN, 'value']]).has(NaN)); // true

// Note: +0 and -0 are still considered equal
const set = new Set([+0, -0]);
console.log(set.size);                       // 1 (treated as same value)
```

### **4. `SameValue`**
- **Used by:** `Object.is()`, `Object.defineProperty()`, property descriptors
- **Behavior:** Most precise equality - `NaN` equals `NaN`, but `+0` ≠ `-0`
- **Specification:** True mathematical equality

```javascript
// Examples of SameValue algorithm
console.log(Object.is(NaN, NaN));           // true
console.log(Object.is(+0, -0));             // false (distinguishes signed zeros)
console.log(Object.is(2, 2));               // true
console.log(Object.is("test", "test"));     // true
```

### **Algorithm Usage in JavaScript APIs:**

```javascript
// Different APIs use different algorithms
const arr = [1, 2, NaN, +0];

// Uses SameValueZero
console.log(arr.includes(NaN));             // true
console.log(arr.includes(-0));              // true (finds +0)

// Uses isStrictlyEqual (===)
console.log(arr.indexOf(NaN));              // -1 (not found)
console.log(arr.indexOf(-0));               // 3 (finds +0)

// Uses SameValue
console.log(Object.is(arr[2], NaN));        // true
console.log(Object.is(arr[3], -0));         // false (arr[3] is +0)
```

---

## **1) `==` – Loose Equality**

The loose equality operator performs **type coercion** before comparison, which can lead to unexpected results.

### How it works:
1. If both operands are the same type, compare them directly
2. If types differ, convert them using specific coercion rules
3. Compare the converted values

### Examples:

```javascript
// Basic type coercion
console.log(5 == "5");        // true (string "5" → number 5)
console.log(true == 1);       // true (true → 1)
console.log(false == 0);      // true (false → 0)
console.log("" == 0);         // true (empty string → 0)

// Special cases
console.log(null == undefined);  // true (special rule in ECMAScript)
console.log("0" == false);       // true ("0" → 0, false → 0)
console.log([] == "");           // true ([] → "", "" == "")
console.log([1] == "1");         // true ([1] → "1", "1" == "1")

// Surprising results
console.log("" == 0);            // true
console.log("0" == 0);           // true
console.log("" == "0");          // false (!!)
```

### ⚠️ **Common Gotchas:**

```javascript
// These can cause bugs in conditional statements
if ([] == false) {
    console.log("Empty array equals false!"); // This runs!
}

if ("0" == false) {
    console.log("String '0' equals false!"); // This also runs!
}

// Array comparisons
console.log([] == []);           // false (different objects)
console.log([1,2] == "1,2");     // true (array → string)
```

---

## **2) `===` – Strict Equality**

The strict equality operator compares both **value and type** without any conversion.

### How it works:
1. If types are different, return `false`
2. If types are the same, compare values directly
3. No type coercion is performed

### Examples:

```javascript
// Type and value must match
console.log(5 === "5");          // false (number vs string)
console.log(true === 1);         // false (boolean vs number)
console.log(false === 0);        // false (boolean vs number)
console.log("" === 0);           // false (string vs number)

// Same type comparisons
console.log(5 === 5);            // true
console.log("hello" === "hello"); // true
console.log(true === true);      // true

// Special values
console.log(null === null);      // true
console.log(undefined === undefined); // true
console.log(null === undefined); // false (different types)

// NaN special case
console.log(NaN === NaN);        // false (NaN is never equal to itself)
console.log(Number.isNaN(NaN));  // true (use this to check for NaN)
```

### Object and Array Comparisons:

```javascript
// Objects and arrays are compared by reference
const obj1 = { a: 1 };
const obj2 = { a: 1 };
const obj3 = obj1;

console.log(obj1 === obj2);      // false (different objects)
console.log(obj1 === obj3);      // true (same reference)

const arr1 = [1, 2, 3];
const arr2 = [1, 2, 3];
console.log(arr1 === arr2);      // false (different arrays)
```

---

## **3) `Object.is()` – Same Value Equality**

`Object.is()` provides the most precise equality comparison, handling edge cases that `===` doesn't.

### Key Differences from `===`:
1. `NaN` is considered equal to `NaN`
2. `+0` and `-0` are considered different

### Examples:

```javascript
// Same as === for most cases
console.log(Object.is(5, 5));           // true
console.log(Object.is("test", "test")); // true
console.log(Object.is(true, true));     // true

// Special NaN handling
console.log(Object.is(NaN, NaN));       // true (unlike ===)
console.log(NaN === NaN);               // false

// Zero handling
console.log(Object.is(+0, -0));         // false (unlike ===)
console.log(+0 === -0);                 // true

// Other special values
console.log(Object.is(null, null));     // true
console.log(Object.is(undefined, undefined)); // true
console.log(Object.is(null, undefined)); // false
```

### When to use `Object.is()`:

```javascript
// Checking for NaN values
function isActuallyNaN(value) {
    return Object.is(value, NaN);
}

// Distinguishing between +0 and -0
function isNegativeZero(value) {
    return Object.is(value, -0);
}

// Creating a more precise equality function
function sameValue(x, y) {
    return Object.is(x, y);
}
```

---

## Algorithm Comparison Table

Here's a comprehensive side-by-side comparison showing how each algorithm behaves with tricky values:

| Test Case | `==` (isLooselyEqual) | `===` (isStrictlyEqual) | SameValueZero | SameValue (Object.is) |
|-----------|----------------------|------------------------|---------------|----------------------|
| `5 == "5"` | ✅ `true` | ❌ `false` | ❌ `false` | ❌ `false` |
| `true == 1` | ✅ `true` | ❌ `false` | ❌ `false` | ❌ `false` |
| `null == undefined` | ✅ `true` | ❌ `false` | ❌ `false` | ❌ `false` |
| `NaN == NaN` | ❌ `false` | ❌ `false` | ✅ `true` | ✅ `true` |
| `NaN === NaN` | ❌ `false` | ❌ `false` | ✅ `true` | ✅ `true` |
| `+0 === -0` | ✅ `true` | ✅ `true` | ✅ `true` | ❌ `false` |
| `"" == 0` | ✅ `true` | ❌ `false` | ❌ `false` | ❌ `false` |
| `[] == ""` | ✅ `true` | ❌ `false` | ❌ `false` | ❌ `false` |
| `false == 0` | ✅ `true` | ❌ `false` | ❌ `false` | ❌ `false` |

### **Real-World Usage Examples:**

```javascript
// 1. Array.includes() uses SameValueZero
const numbers = [1, 2, NaN, +0];
console.log(numbers.includes(NaN));    // true (SameValueZero)
console.log(numbers.includes(-0));     // true (finds +0, SameValueZero)

// 2. Array.indexOf() uses isStrictlyEqual (===)
console.log(numbers.indexOf(NaN));     // -1 (not found, === behavior)
console.log(numbers.indexOf(-0));      // 3 (finds +0, === behavior)

// 3. Map and Set use SameValueZero
const map = new Map();
map.set(NaN, 'found');
console.log(map.has(NaN));             // true (SameValueZero)

const set = new Set([+0, -0, NaN, NaN]);
console.log(set.size);                 // 2 (NaN deduplicated, +0/-0 treated as same)

// 4. Object.is() uses SameValue
console.log(Object.is(+0, -0));        // false (SameValue)
console.log(Object.is(NaN, NaN));      // true (SameValue)

// 5. Switch statements use isStrictlyEqual (===)
const value = NaN;
switch (value) {
    case NaN:
        console.log("This won't run"); // NaN !== NaN
        break;
    default:
        console.log("This runs");      // Default case executes
}
```

### **Which Algorithm Does Each API Use?**

| JavaScript API | Algorithm | Notes |
|----------------|-----------|-------|
| `==` operator | isLooselyEqual | Type coercion |
| `===` operator | isStrictlyEqual | No coercion |
| `Object.is()` | SameValue | Most precise |
| `Array.includes()` | SameValueZero | Can find NaN |
| `Array.indexOf()` | isStrictlyEqual | Cannot find NaN |
| `Map.has()` | SameValueZero | NaN keys work |
| `Set.has()` | SameValueZero | NaN values work |
| `switch` cases | isStrictlyEqual | No NaN matching |
| `Object.defineProperty()` | SameValue | Property descriptors |

---

## Type Coercion Rules

Understanding how `==` performs type coercion:

### Conversion Priority:
1. **Boolean** → Number (`true` → 1, `false` → 0)
2. **String** → Number (when compared with number)
3. **Object** → Primitive (using `valueOf()` or `toString()`)

### Detailed Coercion Table:

| Type A | Type B | Conversion |
|--------|--------|------------|
| Number | String | String → Number |
| Boolean | Any | Boolean → Number, then compare |
| Object | Primitive | Object → Primitive |
| null | undefined | Always `true` |

### Examples with step-by-step conversion:

```javascript
// "5" == 5
// Step 1: "5" (string) → 5 (number)
// Step 2: 5 == 5 → true

// true == "1"
// Step 1: true → 1 (number)
// Step 2: 1 == "1"
// Step 3: "1" → 1 (number)
// Step 4: 1 == 1 → true

// [] == ""
// Step 1: [] → "" (using toString())
// Step 2: "" == "" → true
```

---

## Common Pitfalls

### 1. Falsy Value Comparisons

```javascript
// These are all falsy, but not equal to each other
console.log(false == 0);         // true
console.log(false == "");        // true
console.log(false == []);        // true
console.log(0 == "");            // true
console.log(0 == []);            // true
console.log("" == []);           // true

// But this is false!
console.log("" == "0");          // false
```

### 2. Array and Object Gotchas

```javascript
// Arrays convert to strings for comparison
console.log([1,2,3] == "1,2,3"); // true
console.log([1] == 1);           // true
console.log([[]] == "");         // true

// Empty arrays are truthy but equal to false
if ([]) {
    console.log("Empty array is truthy"); // This runs
}
console.log([] == false);        // true (but array is truthy!)
```

### 3. Null and Undefined

```javascript
// Only equal to each other with ==
console.log(null == undefined);  // true
console.log(null == 0);          // false
console.log(undefined == 0);     // false
console.log(null == false);      // false
console.log(undefined == false); // false
```

---

## Performance Considerations

```javascript
// Performance test example (results may vary)
const iterations = 1000000;

// === is generally faster (no conversion needed)
console.time('strict equality');
for (let i = 0; i < iterations; i++) {
    5 === 5;
}
console.timeEnd('strict equality');

// == is slower due to type coercion
console.time('loose equality');
for (let i = 0; i < iterations; i++) {
    5 == "5";
}
console.timeEnd('loose equality');

// Object.is() has similar performance to ===
console.time('Object.is');
for (let i = 0; i < iterations; i++) {
    Object.is(5, 5);
}
console.timeEnd('Object.is');
```

---

## Best Practices

### ✅ **Recommended:**

```javascript
// 1. Use === by default
if (user.age === 18) {
    // Handle adult user
}

// 2. Use Object.is() for special cases
if (Object.is(result, NaN)) {
    // Handle NaN result
}

// 3. Be explicit about type conversion
if (Number(userInput) === 42) {
    // Convert string to number explicitly
}

// 4. Use specific checks for null/undefined
if (value === null || value === undefined) {
    // Handle null or undefined
}
// Or use nullish coalescing
const result = value ?? defaultValue;
```

### ❌ **Avoid:**

```javascript
// 1. Don't rely on == coercion
if (userAge == "18") { // Avoid this
    // Unexpected behavior possible
}

// 2. Don't use == for null/undefined checks
if (value == null) { // Avoid this pattern
    // Use explicit checks instead
}

// 3. Don't assume falsy values are equal
if (value == false) { // Dangerous
    // Many values coerce to false
}
```

---

## Interactive Examples

Try these examples in your browser console:

```javascript
// Test your understanding
console.log("Quiz: What will these return?");

console.log([] + [] === "");        // ?
console.log([] + {} === "[object Object]"); // ?
console.log({} + [] === 0);         // ?
console.log(true + false === 1);    // ?
console.log("5" - 3 === 2);         // ?
console.log("5" + 3 === "53");      // ?

// Answers:
// true, true, false (depends on context), true, true, true
```

### Create Your Own Tests:

```javascript
function testEquality(a, b) {
    console.log(`Testing: ${a} and ${b}`);
    console.log(`== result: ${a == b}`);
    console.log(`=== result: ${a === b}`);
    console.log(`Object.is result: ${Object.is(a, b)}`);
    console.log('---');
}

// Try these:
testEquality(0, false);
testEquality("", 0);
testEquality(null, undefined);
testEquality(NaN, NaN);
testEquality(+0, -0);
```

---

## Summary

### Quick Decision Guide:

```
Need to compare values?
├── Are you checking for NaN? → Use Object.is(value, NaN) or Number.isNaN()
├── Need to distinguish +0 and -0? → Use Object.is()
├── Working with legacy code that expects == behavior? → Use == carefully
└── Everything else → Use === (strict equality)
```

### Key Takeaways:

1. **`===` is your default choice** - it's predictable and fast
2. **`==` can be dangerous** - type coercion leads to unexpected results
3. **`Object.is()` is most precise** - use for edge cases with NaN and signed zeros
4. **Always be explicit** - convert types manually when needed
5. **Test thoroughly** - equality comparisons can have surprising edge cases

### Memory Aid:

```
== : "Equal-ish" (with type conversion magic)
=== : "Exactly equal" (type and value must match)
Object.is() : "Mathematically equal" (handles special cases correctly)
```

---

**Next Steps:**
- Practice with the interactive examples above
- Review your existing code for `==` usage
- Consider using ESLint rules to enforce `===` usage
- Learn about comparison operators (`<`, `>`, `<=`, `>=`) which also perform type coercion
