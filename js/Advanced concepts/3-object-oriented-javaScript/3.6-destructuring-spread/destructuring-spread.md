# **6. Object Destructuring & Rest/Spread Operators**

### 1️⃣ Explanation

**Destructuring** extracts properties from objects and elements from arrays into distinct variables. **Rest/Spread** operators (`...`) collect or spread elements.

Benefits:
* **Cleaner code** for extracting values
* **Default values** for missing properties
* **Function parameter** simplification
* **Object/array manipulation** made easy

---

### 2️⃣ Basic Object Destructuring

**Simple Destructuring:**
```javascript
const user = {
  name: 'Alice',
  age: 25,
  email: 'alice@example.com',
  city: 'New York'
};

// Extract properties
const { name, age, email } = user;
console.log(name);  // "Alice"
console.log(age);   // 25
console.log(email); // "alice@example.com"

// Rename variables
const { name: userName, age: userAge } = user;
console.log(userName); // "Alice"
console.log(userAge);  // 25

// Default values
const { name, country = 'USA' } = user;
console.log(country); // "USA" (default value)
```

---

### 3️⃣ Advanced Destructuring Patterns

**Nested Destructuring:**
```javascript
const user = {
  name: 'Bob',
  address: {
    street: '123 Main St',
    city: 'Boston',
    coordinates: {
      lat: 42.3601,
      lng: -71.0589
    }
  },
  preferences: {
    theme: 'dark',
    notifications: true
  }
};

// Nested destructuring
const {
  name,
  address: {
    city,
    coordinates: { lat, lng }
  },
  preferences: { theme }
} = user;

console.log(name);  // "Bob"
console.log(city);  // "Boston"
console.log(lat);   // 42.3601
console.log(theme); // "dark"
```

**Array Destructuring:**
```javascript
const colors = ['red', 'green', 'blue', 'yellow'];

// Basic array destructuring
const [first, second, third] = colors;
console.log(first);  // "red"
console.log(second); // "green"

// Skip elements
const [primary, , tertiary] = colors;
console.log(primary);  // "red"
console.log(tertiary); // "blue"

// Rest elements
const [head, ...tail] = colors;
console.log(head); // "red"
console.log(tail); // ["green", "blue", "yellow"]
```

---

### 4️⃣ Function Parameters

**Destructured Parameters:**
```javascript
// Object parameter destructuring
function createUser({ name, email, age = 18, role = 'user' }) {
  return {
    id: Date.now(),
    name,
    email,
    age,
    role,
    createdAt: new Date()
  };
}

const newUser = createUser({
  name: 'Charlie',
  email: 'charlie@example.com',
  age: 30
});

// Array parameter destructuring
function processCoordinates([x, y, z = 0]) {
  return {
    x: x * 2,
    y: y * 2,
    z: z * 2
  };
}

const result = processCoordinates([10, 20]);
console.log(result); // { x: 20, y: 40, z: 0 }
```

**Rest Parameters:**
```javascript
function sum(first, ...numbers) {
  return first + numbers.reduce((acc, num) => acc + num, 0);
}

console.log(sum(1, 2, 3, 4, 5)); // 15

function createTeam(leader, ...members) {
  return {
    leader,
    members,
    size: members.length + 1
  };
}

const team = createTeam('Alice', 'Bob', 'Charlie', 'David');
console.log(team);
// { leader: 'Alice', members: ['Bob', 'Charlie', 'David'], size: 4 }
```

---

### 5️⃣ Spread Operator

**Object Spread:**
```javascript
const baseUser = {
  id: 1,
  name: 'John',
  email: 'john@example.com'
};

// Spread in object literals
const adminUser = {
  ...baseUser,
  role: 'admin',
  permissions: ['read', 'write', 'delete']
};

// Override properties
const updatedUser = {
  ...baseUser,
  name: 'John Doe', // Override name
  lastLogin: new Date()
};

console.log(adminUser);
// { id: 1, name: 'John', email: 'john@example.com', role: 'admin', permissions: [...] }
```

**Array Spread:**
```javascript
const fruits = ['apple', 'banana'];
const vegetables = ['carrot', 'broccoli'];

// Combine arrays
const food = [...fruits, ...vegetables];
console.log(food); // ['apple', 'banana', 'carrot', 'broccoli']

// Add elements
const moreFruits = [...fruits, 'orange', 'grape'];
console.log(moreFruits); // ['apple', 'banana', 'orange', 'grape']

// Copy array
const fruitsCopy = [...fruits];
```

---

### 6️⃣ Real-World Examples

**API Response Handling:**
```javascript
async function fetchUserProfile(userId) {
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.json();
  
  // Destructure API response
  const {
    user: {
      id,
      name,
      email,
      profile: {
        avatar,
        bio,
        location = 'Not specified'
      }
    },
    settings: {
      theme = 'light',
      notifications = true
    } = {}
  } = data;
  
  return {
    id,
    name,
    email,
    avatar,
    bio,
    location,
    theme,
    notifications
  };
}
```

**Configuration Merging:**
```javascript
const defaultConfig = {
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    retries: 3
  },
  ui: {
    theme: 'light',
    language: 'en'
  },
  features: {
    analytics: true,
    notifications: true
  }
};

function createConfig(userConfig = {}) {
  return {
    ...defaultConfig,
    ...userConfig,
    api: {
      ...defaultConfig.api,
      ...userConfig.api
    },
    ui: {
      ...defaultConfig.ui,
      ...userConfig.ui
    },
    features: {
      ...defaultConfig.features,
      ...userConfig.features
    }
  };
}

const config = createConfig({
  api: { timeout: 10000 },
  ui: { theme: 'dark' }
});
```

**React-style Props Handling:**
```javascript
function Button({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  onClick,
  ...restProps 
}) {
  const className = `btn btn-${variant} btn-${size}`;
  
  return {
    type: 'button',
    className,
    disabled,
    onClick,
    children,
    ...restProps // Spread remaining props
  };
}

const buttonProps = Button({
  children: 'Click me',
  variant: 'secondary',
  'data-testid': 'submit-button',
  'aria-label': 'Submit form'
});
```

---

### 7️⃣ Key Takeaways

* **Destructuring** extracts values cleanly from objects/arrays
* **Default values** handle missing properties gracefully
* **Rest operator** collects remaining elements
* **Spread operator** expands objects/arrays
* **Great for function parameters** and API responses
* **Enables clean object composition** and configuration merging
