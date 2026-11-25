// Execution Context & Call Stack
// Example code 

function greet(name) {
    console.log(name); // the greet function is call with value `vikram`, here the execution will start
}

function sayHello() {
    greet('vikram'); // third `sayHello` function call `greet` function (push for execution with value `vikram`)
}

function main() {
    sayHello(); // second call the `sayHello` function (push for execution)
}

main(); // first call the main function (push for execution) 

// _________________________________________________________________________________________________________________________

// Example 2

function a() {
    console.log('A1'); // <<1`A1` it will print first ==> 1
    b(); // >>2 here function b is called for execution
    console.log("A2"); // << ==> 5
}

function b() {
    console.log('B1'); // <<2 it will print second  ==> 2
    c(); // >> 3 here function c is called for execution
    console.log('B2');  // ==> 4
}

function c() {
    console.log('C1'); // <<3 ==> 3
}

a(); // >>1 here function a is called (push for execution)

// The outputs are 
// A1
// B1 
// C1
// B2
// A2