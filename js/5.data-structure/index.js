try {
    const invalidJson = '{"name": "Bob", "age": }'; // Invalid JSON
    const result = JSON.parse(invalidJson);
} catch (error) {
    console.log("JSON parsing failed:", error.message);
}

// Object
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

const string = JSON.stringify(user, (key, value) => {
    if (key === "isActive") {
        return undefined
    }
    return value
}, 4);
console.log(string);

const mixedSet = new Set();
mixedSet.add(42);
mixedSet.add("hello");
mixedSet.add(true);
mixedSet.add({ name: "object" });
mixedSet.add([1, 2, 3]);
console.log(mixedSet);

// set to array
const set = new Set([123, 12, 1211, 55, 532])
console.log(typeof set, set);

// Array.from(set) -- for adding expression
const arr1 = Array.from(set, v => v - 100);
console.log(typeof arr1, arr1);

// using spreed operator -- use this for quick converstion
const arr2 = [...set];
console.log(typeof arr2, arr2);

// Using loop 
const newArray = []
for (let element of set) {
    newArray.push(element);
}
console.log(newArray);

// ========== Set Operations =================
// Union 
const set1 = new Set([1,2,3,4,3]);
const set2 = new Set([3,4,5,6,2]);

const uSet = new Set([...set1, ...set2]);
console.log(uSet);

// Intersection 
const iSet = new Set([...set1].filter( x => set2.has(x)));
console.log(iSet);

// Difference 
const dSet = new Set([...set2].filter(x => !set1.has(x)));
console.log(dSet);

// ===========================================

// Map to Array
const map = new Map([
    ["name", "Vikram"],
    ["age", 24],
]);

// using spreed operator 
const a1 = [...map]; // for both key and value
console.log(a1)
const a2 = [...map.keys()];
console.log("keys:", a2);
const a3 = [...map.values()];
console.log("values:", a3);

// using Array.from(Map)
const map2 = new Map([
    ["a", 1],
    ["b", 2],
    ["c", 3],
]);
    // Transform both key and value
const array1 = Array.from(map2, ([k, v]) => [k, v * 10]);
console.log(array1);

    // Transform only keys
const array2 = Array.from(map2.keys(), k => k.toUpperCase());
console.log(array2);

    // Transform only values
const array3 = Array.from(map2.values(), v => (v + v) * 10)
console.log(array3);

// ================= Indexed collection ==========================
// Array creation 
const fruits = ["apple", "banana", "orange"];
const numbers = [1, 2, 3, 4, 5];
const mixed = [1, "hello", true, { name: "vikram" }, [1, 2, 3]];

// Array accessing 
    // array[index]
console.log(mixed[4][2]) //  for nested array
console.log(mixed[3].name); // for accessing object

// Adding element 
    // array.push()
console.log(fruits)
console.log(fruits.push(12)) // added to the end of the array
console.log(fruits)
console.log(fruits.push(12))
console.log(fruits)

    // array.unshift()
console.log(numbers);
console.log(numbers.unshift('vikram')); // added to beginning of the array
console.log(numbers);

// Removing element
    // array.pop()
console.log(mixed);
console.log(mixed.pop()); // remove the last element from the array
console.log(mixed);

    // array.shift()
console.log(numbers);
console.log(numbers.shift()); // shift the element from beginning of the array
console.log(numbers);

// ===== Array methods - Iteration =====
const numbers2 = [1, 2, 3, 4, 5, 9, 222, 11, 99];

// forEach - Execute function for each element
const addNumber = []
numbers2.forEach((v, i) => {
    if(v % 2 !== 0){
        addNumber.push(v);
    }
})
console.log(addNumber)

// map - create new array with transformed element
const double = numbers2.map(num => num + num);
console.log(typeof double, double);

// filter
const flt = double.filter(n => n % 4 === 0);
console.log(flt);

// reduce 
const mixed2 = [1, 2, 3, 4];
const red = mixed2.reduce((a, c) => a + c, 0);
console.log(red);

// find
const array4 = [2,1,22,22];
const find = array4.find(c => c === 22);
console.log(find);

// ===== Array methods - Modification =====

    // array.splic(starting , no of eleement to remove, number of element to add)
let colors = ["red", "green", "blue", 123, 111];
const c = colors.splice(3, 0, 'vikram1', 'vikram2', 'vikram3');
console.log(colors);

    // array.slice() -- it can not modify the original array 
colors = ["red", "green", "blue", 123, 111];
const slice = colors.slice(colors.length - 2, colors.length); // create new arrray by slice from original array
console.log(colors);
console.log(slice);

// ===== Array methods - Ordering =====
    // array.sort()
    // by default JS consider the number in the array as string
const mArray = [12, 'a', 2];
console.log(mArray.sort()); // [ 12, 2, 'a' ]

    // array.sort() - ascending order
const unsort = [123, 44, 22,11,123];
console.log(typeof unsort[0]);
const asc = unsort.sort((s, b) => s - b);
console.log(asc);
    
    // array.sort() - descending order
const desc = unsort.sort((s, b) => b - s);
console.log(desc);

// ============== Matrix ===============
const matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
];

console.log(matrix[2][1]); // 8

// Array destructuring
const [, second, third] = matrix
console.log(third[1]);