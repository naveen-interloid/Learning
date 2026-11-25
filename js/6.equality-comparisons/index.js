console.log("" == 0);            // true
console.log("0" == 0);           // true
console.log("" == "0"); 


// Performance test example (results may vary)
const iterations = 1000000;

// === is generally faster (no conversion needed)
console.time('strict equality');
for (let i = 0; i < iterations; i++) {
    5 === 5;
}
console.timeEnd('strict equality');

// == is slower due to type coercion
console.time('loose equality');
for (let i = 0; i < iterations; i++) {
    5 == "5";
}
console.timeEnd('loose equality');

// Object.is() has similar performance to ===
console.time('Object.is');
for (let i = 0; i < iterations; i++) {
    Object.is(5, 5);
}
console.timeEnd('Object.is');