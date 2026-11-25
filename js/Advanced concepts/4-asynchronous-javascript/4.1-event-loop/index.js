// Event loop 
// Simple example
console.log('Program starts running...'); // it will execute first

setTimeout(() => {
    console.log('Timeout execution');
}, 5000) // wait for 5 seconds then it execute till it move to execute for next line

console.log('Program stops'); // it will execute before the `setTimeout`
//  --------------------------
// complex example
// multiple async operations
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));
Promise.resolve().then(() => console.log('4'))

console.log('5');

// ----------------------------------
// Event Loop Phases

function eventLoop() {
    console.log('==== Event Loop Demo ====');

    // Imediate execution
    console.log('1: Synchronus'); // 1

    // MacroTask (Timer)
    setTimeout(() => console.log('2: setTimeout macrotask'), 5000); // 5

    // MicroTask (Promise)
    Promise.resolve().then(() => console.log('3: Promise.then microtask')); // 3

    // Imediate execution
    console.log('4: Synchronus'); // 2

    // Microtask 
    queueMicrotask(() => {
        console.log('5: queue Microtask'); // 4
    })

    // Macrotask
    setTimeout(() => {
        console.log('6: another setTimeout'); // 6
    })
}

eventLoop();

// ____________________________________________________________________________________________________________
// Real world example 
// DOM event handling 

const button = document.getElementById('myButton');

console.log('Script start');

button.addEventListener('click', () => {
    console.log('Button clicked!');

    Promise.resolve().then(() => {
        console.log('Promise in click handler');
    });

    setTimeout(() => {
        console.log('setTimeout in click handler');
    }, 0);
});

console.log('Script end');