// Deep & Shallow Copy Examples

// Example 1: Shallow Copy Problem
console.log('=== Shallow Copy Problem ===');
const user = {
    name: 'John',
    preferences: {
        theme: 'dark',
        language: 'en'
    }
};

const userCopy = { ...user };
userCopy.name = 'Jane'; // Safe
userCopy.preferences.theme = 'light'; // Dangerous!

console.log('Original user theme:', user.preferences.theme); // 'light' - modified!
console.log('Copy user theme:', userCopy.preferences.theme); // 'light'

// Example 2: Array Shallow Copy Issues
console.log('\n=== Array Shallow Copy Issues ===');
const matrix = [[1, 2], [3, 4]];
const matrixCopy = [...matrix];

matrixCopy[0][0] = 999;
console.log('Original matrix:', matrix); // [[999, 2], [3, 4]] - modified!

// Example 3: Proper Deep Copy
console.log('\n=== Proper Deep Copy ===');
function deepCopy(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (Array.isArray(obj)) return obj.map(item => deepCopy(item));
    
    const copy = {};
    for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
            copy[key] = deepCopy(obj[key]);
        }
    }
    return copy;
}

const originalData = {
    id: 1,
    user: {
        name: 'Alice',
        settings: {
            notifications: true,
            privacy: 'public'
        }
    },
    tags: ['javascript', 'programming']
};

const deepCopyData = deepCopy(originalData);
deepCopyData.user.name = 'Bob';
deepCopyData.tags.push('learning');

console.log('Original user name:', originalData.user.name); // 'Alice' - unchanged
console.log('Copy user name:', deepCopyData.user.name); // 'Bob'
console.log('Original tags length:', originalData.tags.length); // 2 - unchanged
console.log('Copy tags length:', deepCopyData.tags.length); // 3

// Example 4: Circular Reference Handling
console.log('\n=== Circular Reference Handling ===');
const circularObj = { name: 'circular' };
circularObj.self = circularObj;

function deepCopyWithCircular(obj, visited = new WeakMap()) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (visited.has(obj)) return visited.get(obj);
    
    let copy;
    if (Array.isArray(obj)) {
        copy = [];
        visited.set(obj, copy);
        obj.forEach((item, index) => {
            copy[index] = deepCopyWithCircular(item, visited);
        });
    } else {
        copy = {};
        visited.set(obj, copy);
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                copy[key] = deepCopyWithCircular(obj[key], visited);
            }
        }
    }
    return copy;
}

const circularCopy = deepCopyWithCircular(circularObj);
console.log('Circular copy successful:', circularCopy.self === circularCopy); // true

// Example 5: Performance Comparison
console.log('\n=== Performance Comparison ===');
const largeObject = {
    data: Array.from({length: 1000}, (_, i) => ({
        id: i,
        value: Math.random(),
        nested: { deep: { value: i * 2 } }
    }))
};

// JSON method
console.time('JSON stringify/parse');
for (let i = 0; i < 100; i++) {
    JSON.parse(JSON.stringify(largeObject));
}
console.timeEnd('JSON stringify/parse');

// Custom deep copy
console.time('Custom deep copy');
for (let i = 0; i < 100; i++) {
    deepCopy(largeObject);
}
console.timeEnd('Custom deep copy');

// structuredClone (if available)
if (typeof structuredClone !== 'undefined') {
    console.time('structuredClone');
    for (let i = 0; i < 100; i++) {
        structuredClone(largeObject);
    }
    console.timeEnd('structuredClone');
}

// Example 6: Real-world Use Case - State Management
console.log('\n=== State Management Example ===');
class StateManager {
    constructor(initialState) {
        this.state = deepCopy(initialState);
        this.history = [deepCopy(initialState)];
    }
    
    setState(newState) {
        // Always work with copies to prevent mutations
        this.state = deepCopy({ ...this.state, ...newState });
        this.history.push(deepCopy(this.state));
    }
    
    getState() {
        // Return a copy to prevent external mutations
        return deepCopy(this.state);
    }
    
    undo() {
        if (this.history.length > 1) {
            this.history.pop();
            this.state = deepCopy(this.history[this.history.length - 1]);
        }
    }
}

const stateManager = new StateManager({
    user: { name: 'John', age: 30 },
    settings: { theme: 'dark' }
});

console.log('Initial state:', stateManager.getState());

stateManager.setState({ user: { name: 'Jane', age: 25 } });
console.log('After update:', stateManager.getState());

stateManager.undo();
console.log('After undo:', stateManager.getState());
