# **3. Getters & Setters**

### 1️⃣ Explanation

**Getters** and **Setters** are special methods that allow you to define how properties are accessed and modified. They provide controlled access to object properties.

Benefits:
* **Data validation** on property assignment
* **Computed properties** that derive from other values
* **Encapsulation** - hide internal implementation
* **Backward compatibility** when changing internal structure

---

### 2️⃣ Basic Syntax

**Object Literal Getters/Setters:**
```javascript
const person = {
  _name: '',
  _age: 0,
  
  get name() {
    return this._name.toUpperCase();
  },
  
  set name(value) {
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error('Name must be a non-empty string');
    }
    this._name = value;
  },
  
  get age() {
    return this._age;
  },
  
  set age(value) {
    if (value < 0 || value > 150) {
      throw new Error('Age must be between 0 and 150');
    }
    this._age = value;
  }
};

person.name = 'alice';
console.log(person.name); // "ALICE"

person.age = 25;
console.log(person.age); // 25

// person.age = -5; // Error: Age must be between 0 and 150
```

---

### 3️⃣ Class Getters/Setters

**ES6 Class Syntax:**
```javascript
class Temperature {
  constructor(celsius = 0) {
    this._celsius = celsius;
  }
  
  get celsius() {
    return this._celsius;
  }
  
  set celsius(value) {
    if (value < -273.15) {
      throw new Error('Temperature cannot be below absolute zero');
    }
    this._celsius = value;
  }
  
  get fahrenheit() {
    return (this._celsius * 9/5) + 32;
  }
  
  set fahrenheit(value) {
    this.celsius = (value - 32) * 5/9;
  }
  
  get kelvin() {
    return this._celsius + 273.15;
  }
  
  set kelvin(value) {
    this.celsius = value - 273.15;
  }
}

const temp = new Temperature(25);
console.log(temp.celsius);    // 25
console.log(temp.fahrenheit); // 77
console.log(temp.kelvin);     // 298.15

temp.fahrenheit = 100;
console.log(temp.celsius);    // 37.78 (approximately)
```

---

### 4️⃣ Object.defineProperty()

**Dynamic Property Definition:**
```javascript
function createUser(name, email) {
  const user = {
    _name: name,
    _email: email,
    _isActive: true
  };
  
  Object.defineProperty(user, 'name', {
    get() {
      return this._name;
    },
    set(value) {
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error('Name must be a non-empty string');
      }
      this._name = value.trim();
    },
    enumerable: true,
    configurable: true
  });
  
  Object.defineProperty(user, 'email', {
    get() {
      return this._email;
    },
    set(value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        throw new Error('Invalid email format');
      }
      this._email = value.toLowerCase();
    },
    enumerable: true,
    configurable: true
  });
  
  Object.defineProperty(user, 'status', {
    get() {
      return this._isActive ? 'active' : 'inactive';
    },
    set(value) {
      this._isActive = value === 'active';
    },
    enumerable: true,
    configurable: true
  });
  
  return user;
}

const user = createUser('John Doe', 'john@example.com');
console.log(user.name);   // "John Doe"
console.log(user.status); // "active"

user.email = 'JOHN.DOE@EXAMPLE.COM';
console.log(user.email);  // "john.doe@example.com"
```

---

### 5️⃣ Real-World Examples

**Shopping Cart with Computed Properties:**
```javascript
class ShoppingCart {
  constructor() {
    this._items = [];
    this._taxRate = 0.08;
  }
  
  addItem(name, price, quantity = 1) {
    this._items.push({ name, price, quantity });
  }
  
  get items() {
    return [...this._items]; // Return copy to prevent mutation
  }
  
  get subtotal() {
    return this._items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
  }
  
  get tax() {
    return this.subtotal * this._taxRate;
  }
  
  get total() {
    return this.subtotal + this.tax;
  }
  
  get itemCount() {
    return this._items.reduce((count, item) => 
      count + item.quantity, 0
    );
  }
  
  set taxRate(rate) {
    if (rate < 0 || rate > 1) {
      throw new Error('Tax rate must be between 0 and 1');
    }
    this._taxRate = rate;
  }
}

const cart = new ShoppingCart();
cart.addItem('Laptop', 999.99, 1);
cart.addItem('Mouse', 29.99, 2);

console.log(`Subtotal: $${cart.subtotal.toFixed(2)}`); // $1059.97
console.log(`Tax: $${cart.tax.toFixed(2)}`);           // $84.80
console.log(`Total: $${cart.total.toFixed(2)}`);       // $1144.77
console.log(`Items: ${cart.itemCount}`);               // 3
```

**User Profile with Validation:**
```javascript
class UserProfile {
  constructor(username) {
    this._username = username;
    this._email = '';
    this._firstName = '';
    this._lastName = '';
  }
  
  get username() {
    return this._username;
  }
  
  get email() {
    return this._email;
  }
  
  set email(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error('Invalid email format');
    }
    this._email = value;
  }
  
  get firstName() {
    return this._firstName;
  }
  
  set firstName(value) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('First name must be a non-empty string');
    }
    this._firstName = value.trim();
  }
  
  get lastName() {
    return this._lastName;
  }
  
  set lastName(value) {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new Error('Last name must be a non-empty string');
    }
    this._lastName = value.trim();
  }
  
  get fullName() {
    return `${this._firstName} ${this._lastName}`.trim();
  }
  
  get displayName() {
    return this.fullName || this._username;
  }
}

const profile = new UserProfile('johndoe');
profile.firstName = 'John';
profile.lastName = 'Doe';
profile.email = 'john@example.com';

console.log(profile.displayName); // "John Doe"
console.log(profile.fullName);    // "John Doe"
```

---

### 6️⃣ Key Takeaways

* **Getters/Setters** provide controlled property access
* **Validation** can be performed in setters
* **Computed properties** derive values from other properties
* **Object.defineProperty()** allows dynamic property definition
* **Encapsulation** - hide internal implementation details
* **Backward compatibility** when refactoring code
