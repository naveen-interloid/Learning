// 2. Hoisting (Variable & Function Hoisting)
// Example

// Function hoisting

sayHello(); // it is ok to call before function declaration // don't print anything
    // before executing the above line JavaScript find all the function declaration and variable declaration in the code and hoisted
function sayHello() { 
    console.log("Hello from hoisted function");
}
sayHello(); // it print the statement in the inside of function

//  --------------- 
// Function expression - not hoisted
sayHello();
const sayHello = function () {
    console.log("Hello from function expression")
}
sayHello();


// __________________________________________________________________

// Variable hoisting with `var`

console.log(num); // it return undefined because the variable declaration are hoisted before execution of this line
var num = 10;
console.log(num); // it return the actual value 

// Variable hoisting with `let` and `const`
console.log(num2); // it show error because the variable declaration with let and const keyword are hoisted not initialized
let num2 = 10;
console.log(num2); 

// ____________________________________________________________________________________
// Example
greet(); 
console.log(x);
console.log(y);

function greet() {
    console.log('Hello from the greet function');
    
}

var x = 5;
let y = 10;

// output

// Hello from the greet function
// undefined
// Error - due to variable declared with the `let` keywork