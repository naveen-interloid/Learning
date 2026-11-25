# JavaScript Type Casting

Type casting (also called **type conversion**) is the process of changing a value from one data type to another.

JavaScript does this **either automatically (implicit)** or **manually (explicit)**.

---

## 1) Type Conversion vs Coercion

**Type Conversion**:  
- The process of changing data from one type to another.  
- Can be **explicit** (you manually do it) or **implicit** (JavaScript does it for you).

**Type Coercion**:  
- A type conversion **done automatically by JavaScript** during an operation.  
- Often happens when different types are combined in an expression.

**Example:**
```javascript
// Coercion (implicit conversion)
console.log("5" + 1); // "51" (number 1 coerced to string)
console.log("5" - 1); // 4   (string "5" coerced to number)

// Explicit conversion
console.log(Number("5") + 1); // 6
```

---

## 2) Implicit Type Casting

JavaScript **automatically** converts types when needed.

**Common cases:**

* When using `+` with a string → number is coerced to string.
* When using arithmetic operators (`-`, `*`, `/`) → strings are coerced to numbers.

**Example:**

```javascript
console.log("10" + 5);  // "105"  (number → string)
console.log("10" - 5);  // 5      (string → number)
console.log(1 == "1");  // true   (string → number for comparison)
```

⚠ Implicit casting can cause **unexpected results**, so be careful.

---

## 3) Explicit Type Casting

You **manually** convert one type to another using functions or constructors.

**String Conversion:**

```javascript
let num = 123;
console.log(String(num));    // "123"
console.log(num.toString()); // "123"
```

**Number Conversion:**

```javascript
let str = "456";
console.log(Number(str));    // 456
console.log(parseInt(str));  // 456
console.log(parseFloat("3.14")); // 3.14
```

**Boolean Conversion:**

```javascript
console.log(Boolean(1));     // true
console.log(Boolean(0));     // false
console.log(Boolean(""));    // false
console.log(Boolean("hi"));  // true
```

---

### Summary Table

| Concept                     | Done By   | Example           | Output |
| --------------------------- | --------- | ----------------- | ------ |
| Implicit Casting (Coercion) | JS Engine | `"5" + 1`         | `"51"` |
| Explicit Casting            | Developer | `Number("5") + 1` | `6`    |

---

 **Tip:** Use **explicit casting** when possible to avoid unexpected behavior caused by implicit coercion.
