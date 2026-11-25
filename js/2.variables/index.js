// Variables
    // There are three ways to declare variables in JavaScript:
    // var
    // let
    // const
// ------------------------------------------------------------------------------

// var
var firstName; // Variable Declaration
firstName = "vikram" // Variable Assignment
console.log(firstName) // vikram

// vairable declared using `var` can be redeclared and reassigned
// Globally declared variables are accessible throughout the code
// But vairable declared inside the function can not be accessed outside of function scope (localvar)
var firstName;
firstName = "gloablName"; // Global scope available everywhere

var firstName = "firstName"; // You can redeclare the `var` 
var lastName = "lastName";
function sampleFunction() {
    firstName = "localname"; // Variable Declaration
    var localvar = "localvar"; // local Variable Assignment";
    localvar2 = "localvar2";
    console.log(localvar);
    console.log(firstName); // vikram
    console.log(lastName); // global variable are accessed inside the function
}

sampleFunction() // vikram
console.log(firstName); // localname inside the function the variable is reassigned
// console.log(localvar); // can not accessed outside of function
console.log(localvar2); // without declaring variable with var keyword, it will be treated as global variable and can be accessed outside of function

// ------------------------------------------------------------------------------

// let
let x = 12; // Variable Declaration
// let x = 13; // You can not redeclare the `let` variable
x = 13; // But You can reassign the 'let' variable

var y = 14;
let y = 15; // You can't redeclare the same variable declared by var 

x = 16;
function sampleFunction() {
    let x = "functionscope"; // function scope 
    console.log(x);  // it is available only inside the function
    {
        let x = "blockscope"; // block scope
        // let x = "localname3"; // You can not redeclare the `let` variable
        console.log(x); // it is available only inside the block
    }
}

sampleFunction()
console.log(x) // it is global scope variable

// ------------------------------------------------------------------------------

// const - constant immutable reference once set, they can not be reassigned
/*
const constVariable; // The const variable must be be initialized during the declaration
constVariable = "vikram" 
*/
const c1 = "vikram";
console.log(c1) // vikram available globally
// c1 = "gloablName" // You can not reassign the `const` variable";

function sampleFunction() {
    const c1 = "cons with function scope";
    console.log(c1);
    {
        const c1 = "const with block scope";
        console.log(c1);
    }
}
sampleFunction()
console.log(c1)

// ------------------------------------------------------------------------------

// Hoisting
/*
    Hoisting is a JavaScript mechanism where variables and function declarations are moved to the top of their scope before code execution.
    This means that you can use variables and functions before they are declared in the code.
    However, only the declarations are hoisted, not the initializations.
    The initializations are not hoisted.
*/
// `var` is hoisted 
console.log(v) // undefined - it works
var v = 12;
console.log(v) // 12
// behind the scenes
var v;
console.log(v) // undefined
v = 12;
console.log(v) // 12

//////

// `let` and `const` are hoisted and 
console.log(l)
let l = 12;
console.log(l) // 13

// function hoisting - function declaration are hoisted with their full body
sampleFunction()
function sampleFunction() {
    console.log("function hoisting")    
}

// function expression are not hoisted
sampleFunction2() // TypeError: sampleFunction2 is not a function

var sampleFunction2 = function() {
    console.log("function expression")
}

// let and const are hoisted but not initialized
try {
  console.log(b); // ❌ ReferenceError
} catch (e) {
  console.error("Error accessing b:", e.message);
}
let b = 10;

try {
  console.log(c); // ❌ ReferenceError
} catch (e) {
  console.error("Error accessing c:", e.message);
}
const c = 20;

// ------------------------------------------------------------------------------
// varibale naming rule
/*
    Variable names can contain letters, digits, underscores, and dollar signs.
    Variable names cannot start with a digit.
    Variable names are case-sensitive.
    Variable names cannot be reserved keywords.
*/

// valid variable name
var $ = "dollar"; 
console.log($); // dollar
var _ = "underscore";   
console.log(_); // underscore
var $1 = "dollar1";
console.log($1) // dollar1
var name1_$ = "vikram"
console.log(name1_$);

// invalid vairable name
// var 1 = 'one'; // can not start with number 
// var var = 'variable' // can not use the reserved keywords like let, var, class, for, ...

// ------------------------------------------------------------------------------

// Variable scope 
// Global scope 
var global = 'vikram'; // Accessible from anywhere in the code
function fun1() {
    console.log(global);
}
console.log(global);

// Function scope 
var a = 'gloabal variable';
function func2 () {
    let f = 'function scope variable'; // Accessible only inside the function.
    console.log(f);
}
func2()
console.log(f); 

// Block scope 
// using var
{
    var a = 'variable 1'; // using `var` inside the block is treated as global scope it accessible globally
    console.log(a);
} 
console.log(a); // the variable is accessible outside the block if you using var keyword to declare a variable

// using let and const
{
    let a = 'let block scope';
    const b = 'const block scope';
    console.log(a,'\n',b);
}
console.log(a, b); 

// Lexical scope (closure)

function outer() {
    let count = 0;

    function inner() {
        count++
        console.log(count);
    }

    return inner
}
outer()
const counter = outer();
for (let i = 1; i <= 10000; i++) {
    counter()
}



const counter2 = outer();

// Lexical scope with example 

function secretHolder() {
    let secret = "vikram";

    function func1() {
        return secret;
    }
    function func2(newSecret) {
        secret = newSecret
    }

    return {
        getSecret: func1,
        setSecret: func2,
    }
}

const a = secretHolder()
console.log(a.getSecret())
a.setSecret('saranya')
console.log(a.getSecret())




