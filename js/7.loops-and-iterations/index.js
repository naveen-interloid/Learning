// ============== for loop ==================
// syntax
// for (initialization; condition; increment){ code }
for (
    let i = 0;
    i <= 10;
    i++
) {
    console.log(i)
}

for (let i = 1; i <= 3; i++) {
    for (let j = 1; j <= 3; j++) {
        console.log(`${i} x ${j} = ${i * j}`);
    }
}

for (let i = 0, j = 10; i < 5, j > 5; i++, j--) {
    console.log(`i: ${i}, j: ${j}`);
}

// ============== do while ====================
// syntax 
// do { code } while (condition);
let count = 0;
do {
    console.log(count);
    if (count === 3) {
        break; // break, stop the iteration
    }
    count++;
} while (count < 10);

// ============== while ====================
// syntax 
// while(condition) { code }
let a = 0;
while (a < 22) {
    console.log(a);
    // if (a === 6) {
    //     continue
    // }
    a += 3
}

// ============== for of ====================
// syntax
// for (const/let variable of iterable) { code }

const colors = ['red', 'green', 'blue', 'yellow']; 
for (const color of colors) { // using array
    console.log(color);
}

const message = "Hello";

for (const char of message) { // using string
    console.log(`Character: ${char}`);
}

// ============== for of ====================
