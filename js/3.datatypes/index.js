// Data types in JavaScript
// Primitive data types

// --------------------------
// string - string are represented useing ('', "", ``)
let str = 'vikram';
console.log(typeof str); // string
let str2 = "vikram";
console.log(typeof str2); // string
let str3 = "vikram";
console.log(typeof str3); // string

// number 
let n1 = 12;
console.log(n1, ":", typeof n1); // number
let n2 = 12.12;
console.log(typeof n2); // number

// boolean - is representation of logical value
let isTrue = 1 === 1;
console.log(typeof isTrue); // boolean

// undefined - variables are declared but not initialized 
let x;
console.log(typeof x); // undefined

// null - the type of null is object
let y = null;
console.log(typeof y); // object

// symbol - used to create unique property key for objects
let a = 12;
let a2 = 12;
console.log(a === a2); // true 

let s = Symbol(12);
let s2 = Symbol(12);
console.log(s === s2); // false - always unique and imutable
console.log(s, ":", typeof s)

// bigint - used to define large integer
let num = 12312;
console.log(typeof num);
let bigNum = 12312n;
console.log(typeof bigNum);

// --------------------------------------------------------------------------------

// typeof operator 
console.log(typeof 'vikram'); // string
console.log(typeof "vikram"); // string
console.log(typeof `vikram`); // string
console.log(typeof 12); // number
console.log(typeof 12.12); // number
console.log(typeof true); // boolean
console.log(typeof false); // boolean
console.log(typeof undefined); // undefined
console.log(typeof null); // object
console.log(typeof Symbol()); // symbol
console.log(typeof {}); // object
console.log(typeof []) // object (array is an type of object)
console.log(typeof function () { }); // function

// --------------------------------------------------------------------------------

// object 
// object is collection of key-value pairs. They are used to store complex data

const obj = {
    array: [
        {
            name: 'vikram',
            age: 12,
        },
        {
            name: 'vikram',
            age: 23,
        }
    ],
    object: {
        array: ['12', 12, 12],
        object: { 12: 12 }
    },
    func: function () {
        console.log('vikram');
    }
}
console.log(typeof obj.array);
console.log(typeof obj);
console.log(typeof obj.func);

// object prototype
// In Java Script every object has prototype, another object it inherits properties from.

const obj1 = {
    Name: 'vikram',
    signin() {
        return console.log('You are signin in now');
    },
    signup() {
        return console.log("Your are signup in now");
    }
}

const obj2 = Object.create(obj1);
console.log(obj2.Name);
obj2.signup();
// -----------------------------

// manual prototype
let person = {
    func1() {
        console.log('Hello ' + this.name);
        return "hi"
    },
    object1: {
        Name: 'vikram',
        age: 123,
    }
}

let property_1 = {
    obj1: {
        Department: "Mechatronics",
        Degree: "Engineering"
    }
}

const user = Object.create(person) // inherits objects from the person 
user.name = 'vikram'
console.log(user.func1()) // it is person properties

user.__proto__ = property_1; // recreate remove the person properties and reassign the property_1 properties

console.log(user);
console.log(user.obj1);

user.newProbs = "Adding new properties to the user object"; // adding new properties
console.log(user);

Object.assign(user, person);
console.log(user);
console.log(user.func1())
// -----------------------------------
const parent = {
    obj1: {
        Department: "Mechatronics",
        Degree: "Engineering"
    }
}

const child1 = Object.create(parent);
child1.local = [123, 1, 12, 2];
console.log(child1); // it return its own value  [123,1, 12, 2]
console.log(child1.obj1.Degree); // it return value from the parent reference

let child2 = {};
child2.__proto__ = parent;
child2.local = [12, 13, 43];
console.log(child2); // it return its own value 
console.log(child1.obj1.Degree); // it returns its partents reference value
// -----------------------
// GetPrototypeOf
const parent2 = { // parent 2
    obj1: {
        Department: "Mechatronics",
        Degree: "Engineering"
    },
    func1: function1 = function () {
        console.log('This is function for parent2');
        return null;
    }
}

const parent1 = { // parent 1
    func2: function () {
        console.log('This is parent 1 function')
    },
    obj1: function1 = function() {
        console.log('Hi this is Object from parent 1')
        return 'hi'
    },
    function() {
        console.log("Hi this is object from the parent 1")
    },
}

let child3 = {}
Object.setPrototypeOf(child3, parent2)
console.log(child3.func1());

const child4 = Object.create(parent1);
console.log(child4);
console.log(Object.getPrototypeOf(child3) === parent1);

// -------------------------------------------------------

const parent3 = {
    func1() {
        console.log("this is func1 from the parent 3");
        return null;
    },
    func2() {
        console.log('this is func2 from the parent 3')
    }
}
let child5 = {};
console.log(child5);

console.log(Object.getPrototypeOf(parent3) === child5);
console.log(child5);

child5 = Object.create(parent3);
console.log(child5);

console.log(child5.func1())

console.log(Object.getPrototypeOf(child5) === parent3);

const parent4 = {
    func1() {
        console.log("this is func1 from the parent 4");
        return null;
    },
    func2() {
        console.log('this is func2 from the parent 4')
    }
}
child6 = {}
Object.setPrototypeOf(child6, parent4)
console.log(Object.getPrototypeOf(child6) === Object.getPrototypeOf(parent4));

// ----------------------------------------------------------------------------------------------------------------------------------
// prototypal inheritance
// JavaScript use prototype inheritance to allow object to inherits from other objects
function main(name){
    this.name = name
    return name
}

main.prototype.func1 = function() {
    greet = `Hi ${this.name}` ;
    return greet
};

let mainFunction = new main('vikram');
result = mainFunction.func1();
console.log(result);

main.prototype.func2 = function() {
    console.log("this is function two added to the main function using prototype")
}

mainFunction = new main('vikram');
mainFunction.func1();
mainFunction.func2();

// _______________________________________________________________________________
// Built in types 
// Fundamental objects
const func1 = function() { console.log('this is function')};
console.log(typeof func1); // function

const object1 = {key1: 'value1', key2:"value2"}
console.log(typeof object1); // object

const bool = 1 === 1;
console.log(typeof bool); // boolean

const symbol = Symbol('uuid');
console.log(typeof symbol); // symbol



// Numbers and Dates
const num1 = Number(1);
console.log(typeof num1); // number

const bigNum2 = 1231231n;
console.log(typeof bigNum2); // bigint

const pi = Math.PI
console.log(pi);
console.log(typeof pi); // number

const now = new Date(); // date



// Text Processing
const str4 = new String('vikram');
console.log(typeof str4, str4); // object [String: 'vikram']


const regex =  /world/i; // RegExp
console.log(typeof regex.test('hello world')); 



// Indexed collection
let arr = [1,2,3,127,-128, 32000, -32768, 32767, 40000 ]
console.log(typeof arr, arr);
    // int array it is able to store negative and positive value
const int8 = new Int8Array(arr); // it take one bite per element, it is able to store from -128 to 127
console.log(typeof int8, int8); // int8

const int16 = new Int16Array(arr); // it take two bite per element, it is able to store from -32768 to 32767
console.log(typeof int16, int16); // int16

const int32 = new Int32Array(arr); // it take four bite per element, it is able to store from -2,147,483,648 to 2,147,483,647
console.log(typeof int32, int32); // int32


    // -----------------------------------------------


arr = [1,-2,3,127,-128, 32000, -32768, 32767, 40000, 429496729 ]
console.log(typeof arr, arr);

    // uint array - it is used to store only positive value
const uint8 = new Uint8Array(arr); // it take one bite to store one element, it is able to store 0 to 255
console.log(uint8); // uint8 

const uint16 = new Uint16Array(arr); // it take two bite to store one element, it is able to store 0 to 65535
console.log(uint16); // uint16

const uint32 = new Uint32Array(arr); // it take four bite to store one element, it is able to store 0 to 4,294,967,295
console.log(uint32); // uint32

arr = [1.2, 3.3, 64.4123, 12, 12]; // it take four bite to store one element, it is used to store 1.2e-38 to 3.4e38 (approx)
const float32 = new Float32Array(arr);
console.log(float32); // float32

const float64 = new Float64Array(arr); // it take eight bite to store one element, it is used to store 5.0e-324 to 1.8e308 (approx)
console.log(float64);

// ------------------------------------------------------------------------------------------------------
// Keyed collection
// ======== Map =========
let map = new Map([
    [12, 123], 
    [13,13],
    ["Name", "vikram"],
    ["age", 24],
])

const array1 = ['Department', "MCT"]

console.log(typeof map, map);
// 1.set(key, value)
map.set(['Department', "MCT"], {data:[123, 12, [123]]}); // set(key, value), it is used to add new element to the Map, here the array is newly created so when checking it show null 
map.set(array1, {data:[123, 12, [123]]}) // here the key is point out to some array reference so it return true in below code
console.log(map);

// 2.get(key)
console.log(map.get("Name")); // get(key), it is used to get the value of the specified key

// 3.has(key)
console.log(map.has(['Department', "MCT"])); // has(has), it return boolean value (true or false) based on the key is present or not
console.log(map.has(array1));

// 4.delete(key)
// map.delete(array1) // delete(key), it is used to delete the values in the map using key
console.log(map.has(array1));
console.log(map);

// 5.clear() 
// map.clear(); // it is used to clear the element in the map
console.log(map);

// 6.size - return the number of key value pairs in the Map
console.log(map.size)

// 7.keys - return the keys in the map
console.log(map.keys());

// 8.values - return the values in the map
map = new Map([
    [12, 123], 
    [13,13],
    ["Name", "vikram"],
    ["age", 24],
])
console.log(map.values());

// 9.entries()
console.log(map.entries());
for (const [key, value] of map.entries()) {
    console.log(key,": ", value);
}

// 10.forEach
map = new Map([
    [12, 123], 
    [13,13],
    ["Name", "vikram"],
    ["age", 24],
])
console.log(map.entries());

map.forEach((key, values) => {
    console.log(`${key}:${values}`);
})
console.log(map.entries());

//  ___________________________________________________________________________

// ======== Set =========
// it is remove the duplicates from the set
let a1 = [1,2,2,2,33,2,33,4,5]
const set = new Set(a1);
console.log(typeof set, set);

//  Set Methods
// 1.add(value) - it add the value to the set
set.add(2); // it is not added becasuse 2 is already there
console.log(set);
set.add(88); // it added to the set
console.log(set)

// 2.delete(value) - it remove the value from the set
set.delete(9);
set.delete(33);
console.log(set);

// 3.has(value) - it return boolean value based on the occurance of the value in the set
a1 = [1,2,2,2,33,2,33,4,5]
const set2 = new Set(a1);
console.log(set2.has(2)) // true

// 4.clear() - it clear the values from the set
console.log(set2);
// set2.clear() // remove the values
console.log(set2)

// 5.size - it return the number of element in the set
// console.log(set2.size);

// 6.values()
for (let value of set2.values()) {
    console.log(value)
}

// 7.keys()
console.log(set2.keys());

// 8.entries()
console.log(set2.entries());

// 9.forEach(callback)
a1 = [1,2,2,2,33,2,33,4,5]
const set3 = new Set(a1);

set3.forEach((v) => {
    console.log(v);
})

// ======== WeakMap =========
// Weak Map the key must be object not primitive data types like string, number
const wm = new WeakMap();

const A = {name: "vikram"};
const B = [12, 23, 34, 12];

// set(key, value)
wm.set(A, "info");
wm.set(B, 'marks');

// get(key)
console.log(wm.get(A)); // get the value
console.log(wm.get(B)); // get the value

// has(key)
console.log(wm.has(A));
console.log(wm.has(B));

// delete(key)
wm.delete(A);
console.log(wm.has(A));

// can not use the string to add into the weak map
wm.set('name', 'vikram'); // TypeError: Invalid value used as weak map key

// ======== WeakSet =========
// In WeakSet the value must be a obj
const ws = new WeakSet();
console.log(ws);

// ws.add(12); // in weak set also you can not use the primitive data type as value, 
const t1 = {arr:[12,123]};
const t2 = {obj:{childObj:[23,234]}}

// add(value)
ws.add(t1);
ws.add(t2);

// has(value)
console.log(ws.has(t1));
console.log(ws.has(t2));

// delete(value)
ws.delete(t1)
console.log(ws.has(t1));

// =======================================================================================================================================

// Structured data 
// JSON - convert JavaScript value into JSON string
// Universal format that can be understood by other systems and languages
const raw = {
    obj1: {
        childObj1: [12,123,4],
    },
    obj2: [12, 12],
    obj3: "Object 3"
}
console.log(typeof raw, raw);

const string = JSON.stringify(raw);
console.log(typeof string, string);

// ArrayBuffer and DataView
// ArrayBuffer are fixed lenght chunk of raw memory
// You can not directly read or write
// You need a view to read/write

const buffer = new ArrayBuffer(16);
console.log(buffer.byteLength);

const view = new DataView(buffer);
console.log(view);

view.setInt8(0, 65);
view.setUint8(1, -1);
view.setInt16(2, 2555);
view.setInt8(3, 123);
view.setInt32(4, 1231231);
view.setInt8(5, 123);

console.log(view);
console.log(view.setInt32(4));

// =======================================================================================================================================
