# **5. Method Chaining**

### 1️⃣ Explanation

**Method Chaining** (also known as Fluent Interface) is a pattern where methods return the object itself (`this`), allowing multiple method calls to be chained together in a single statement.

Benefits:
* **Readable code** that flows like natural language
* **Concise syntax** for multiple operations
* **Immutable-style operations** (when done right)
* **Builder pattern** implementation

---

### 2️⃣ Basic Method Chaining

**Simple Calculator:**
```javascript
class Calculator {
  constructor(value = 0) {
    this.value = value;
  }
  
  add(num) {
    this.value += num;
    return this; // Return this for chaining
  }
  
  subtract(num) {
    this.value -= num;
    return this;
  }
  
  multiply(num) {
    this.value *= num;
    return this;
  }
  
  divide(num) {
    if (num !== 0) {
      this.value /= num;
    }
    return this;
  }
  
  getResult() {
    return this.value;
  }
  
  reset() {
    this.value = 0;
    return this;
  }
}

// Method chaining in action
const result = new Calculator(10)
  .add(5)
  .multiply(2)
  .subtract(3)
  .getResult();

console.log(result); // 27
```

---

### 3️⃣ String Builder Pattern

**StringBuilder Class:**
```javascript
class StringBuilder {
  constructor() {
    this.parts = [];
  }
  
  append(str) {
    this.parts.push(str);
    return this;
  }
  
  prepend(str) {
    this.parts.unshift(str);
    return this;
  }
  
  insert(index, str) {
    this.parts.splice(index, 0, str);
    return this;
  }
  
  replace(oldStr, newStr) {
    this.parts = this.parts.map(part => 
      part.replace(oldStr, newStr)
    );
    return this;
  }
  
  toUpperCase() {
    this.parts = this.parts.map(part => part.toUpperCase());
    return this;
  }
  
  toLowerCase() {
    this.parts = this.parts.map(part => part.toLowerCase());
    return this;
  }
  
  toString() {
    return this.parts.join('');
  }
  
  clear() {
    this.parts = [];
    return this;
  }
}

const html = new StringBuilder()
  .append('<div class="container">')
  .append('<h1>')
  .append('Welcome')
  .append('</h1>')
  .append('<p>')
  .append('Hello World!')
  .append('</p>')
  .append('</div>')
  .toString();

console.log(html);
```

---

### 4️⃣ Query Builder Pattern

**SQL Query Builder:**
```javascript
class QueryBuilder {
  constructor() {
    this.query = {
      select: [],
      from: '',
      where: [],
      orderBy: [],
      limit: null
    };
  }
  
  select(...columns) {
    this.query.select.push(...columns);
    return this;
  }
  
  from(table) {
    this.query.from = table;
    return this;
  }
  
  where(condition) {
    this.query.where.push(condition);
    return this;
  }
  
  orderBy(column, direction = 'ASC') {
    this.query.orderBy.push(`${column} ${direction}`);
    return this;
  }
  
  limitTo(count) {
    this.query.limit = count;
    return this;
  }
  
  build() {
    let sql = `SELECT ${this.query.select.join(', ')}`;
    sql += ` FROM ${this.query.from}`;
    
    if (this.query.where.length > 0) {
      sql += ` WHERE ${this.query.where.join(' AND ')}`;
    }
    
    if (this.query.orderBy.length > 0) {
      sql += ` ORDER BY ${this.query.orderBy.join(', ')}`;
    }
    
    if (this.query.limit) {
      sql += ` LIMIT ${this.query.limit}`;
    }
    
    return sql;
  }
}

const query = new QueryBuilder()
  .select('name', 'email', 'age')
  .from('users')
  .where('age > 18')
  .where('active = 1')
  .orderBy('name', 'ASC')
  .limitTo(10)
  .build();

console.log(query);
// SELECT name, email, age FROM users WHERE age > 18 AND active = 1 ORDER BY name ASC LIMIT 10
```

---

### 5️⃣ DOM Manipulation Chaining

**jQuery-style DOM Wrapper:**
```javascript
class DOMElement {
  constructor(selector) {
    if (typeof selector === 'string') {
      this.elements = Array.from(document.querySelectorAll(selector));
    } else if (selector instanceof HTMLElement) {
      this.elements = [selector];
    } else {
      this.elements = [];
    }
  }
  
  addClass(className) {
    this.elements.forEach(el => el.classList.add(className));
    return this;
  }
  
  removeClass(className) {
    this.elements.forEach(el => el.classList.remove(className));
    return this;
  }
  
  toggleClass(className) {
    this.elements.forEach(el => el.classList.toggle(className));
    return this;
  }
  
  css(property, value) {
    if (value !== undefined) {
      this.elements.forEach(el => el.style[property] = value);
      return this;
    } else {
      return this.elements[0]?.style[property];
    }
  }
  
  text(content) {
    if (content !== undefined) {
      this.elements.forEach(el => el.textContent = content);
      return this;
    } else {
      return this.elements[0]?.textContent;
    }
  }
  
  on(event, handler) {
    this.elements.forEach(el => el.addEventListener(event, handler));
    return this;
  }
  
  hide() {
    return this.css('display', 'none');
  }
  
  show() {
    return this.css('display', 'block');
  }
  
  fadeIn(duration = 300) {
    this.css('opacity', '0').show();
    
    this.elements.forEach(el => {
      el.style.transition = `opacity ${duration}ms`;
      setTimeout(() => el.style.opacity = '1', 10);
    });
    
    return this;
  }
}

// Factory function for convenience
function $(selector) {
  return new DOMElement(selector);
}

// Usage
$('.button')
  .addClass('active')
  .css('background-color', 'blue')
  .css('color', 'white')
  .on('click', () => console.log('Clicked!'))
  .fadeIn(500);
```

---

### 6️⃣ Immutable Method Chaining

**Immutable Array Operations:**
```javascript
class ImmutableArray {
  constructor(items = []) {
    this.items = [...items];
  }
  
  add(item) {
    return new ImmutableArray([...this.items, item]);
  }
  
  remove(index) {
    return new ImmutableArray(
      this.items.filter((_, i) => i !== index)
    );
  }
  
  map(fn) {
    return new ImmutableArray(this.items.map(fn));
  }
  
  filter(fn) {
    return new ImmutableArray(this.items.filter(fn));
  }
  
  sort(compareFn) {
    return new ImmutableArray([...this.items].sort(compareFn));
  }
  
  reverse() {
    return new ImmutableArray([...this.items].reverse());
  }
  
  toArray() {
    return [...this.items];
  }
  
  get length() {
    return this.items.length;
  }
}

const numbers = new ImmutableArray([1, 2, 3, 4, 5]);

const result = numbers
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .add(10)
  .sort((a, b) => b - a)
  .toArray();

console.log(result); // [10, 8, 4]
console.log(numbers.toArray()); // [1, 2, 3, 4, 5] (original unchanged)
```

---

### 7️⃣ Key Takeaways

* **Method chaining** creates fluent, readable APIs
* **Return `this`** for mutable chaining
* **Return new instance** for immutable chaining
* **Great for builders**, configuration, and DSLs
* **Popular in libraries** like jQuery, Lodash, and D3
* **Balance readability** with performance considerations
