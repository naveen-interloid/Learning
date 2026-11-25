// ============== Type Casting =====================
// Type casting is process of converting the data type of a value to another data type 
// Type casting - Type conversion manually done by you - (explicit)
// Coercion - Type conversion automatically changed by JavaScript - (implicit)


// === Implicit Type Casting ===
console.log("12" + 12); 
console.log("vikram" + 12); // here the number is consider as string when you add with the string value

console.log("12" - 1); // here when you `-` operator the string typed number is converted to number type



// === Explicit Type Casting ===

// string to number
const nstr = "123";
console.log(typeof nstr, nstr);

    // Number(value) - convert to number
console.log(typeof Number(nstr), Number(nstr)); // it return the number

    // parseInt(value) - convert to number
console.log(typeof parseInt('123.123'), parseInt('123.123'));
console.log(typeof parseInt('123value'), parseInt('123value')); // it stop at first not int value

    // parseFloat(value) - convert to floating value
console.log(typeof parseFloat('123.123'), parseFloat('123.123'));


const str = 'vikram';
console.log(typeof str);
console.log(typeof Number(str), Number(str)); // it return NaN (Not a Number), when you try to convert the alpha string to number it return NaN

// String to Boolean
const str2 = "vikram";
console.log(typeof str2);
console.log(typeof Boolean(str2), Boolean(str2)); // it return the ture if the string value is present when you convert from string to boolean

const str3 = "";
console.log(typeof str3);
console.log(typeof Boolean(str3), Boolean(str3)); // it return the false if the string is empty

// String to Date
let date1 = new Date("2025-08-02");
console.log(date1.toISOString());

let date2 = new Date("August 12, 2025");
console.log(date2.getFullYear());

// String to Array
let str1 = "123,12,3,45,6"
let arrStr = str1.split(',')
console.log(arrStr);

// String to JSON
let jsStr = `{"key1": "value1", "key2": "value2"}`
let objStr = JSON.parse(jsStr);
console.log(typeof objStr, objStr);

// String to BigInt
let bigInt = BigInt('123123123123');
console.log(typeof bigInt, bigInt);

// String to Symbol
let sym = Symbol('vikram');
console.log(typeof sym, sym);

// =============================================================
// ============= Number =============
// Implicit - Type conversion automatically done by JavaScript based on the operator
console.log("123" - 1); // 122
console.log("123" * 1); // 123
console.log("123" / 1); // 123
console.log("123" % 2); // 1
console.log("123" + 1); // 1231 - here it act as a string concatenation, so instead of adding it concat

// Explicit - Type conversion done manually

// Number(value)
console.log(Number("123") + 1); 
console.log(Number('42'));        // 42
console.log(Number('  42  '));    // 42 (trims spaces)
console.log(Number('42.5'));      // 42.5
console.log(Number('0xF'));       // 15 (hex)
console.log(Number('Hello'));     // NaN

// parseInt(value)
console.log(parseInt('42'));       // 42
console.log(parseInt('42px'));     // 42 (stops parsing at first non-digit)
console.log(parseInt('   42  '));  // 42
console.log(parseInt('0xF'));      // 15 (hex)
console.log(parseInt('1010', 2));  // 10 (binary with radix 2)
console.log(parseInt('Hello'));    // NaN

// parseFloat(value)
console.log(parseFloat('42.56'));     // 42.56
console.log(parseFloat('42.56px'));   // 42.56
console.log(parseFloat('  3.14  '));  // 3.14
console.log(parseFloat('Hello'));     // NaN

// Unary Plus - quick shorthand for Number()
console.log(typeof +"123", +"123");
console.log(typeof +"123.12", +"123.12");

// Edge cases
console.log(Number("")); // 0
console.log(Number(" ")); // 0
console.log(Number(null)); // 0
console.log(Number(undefined)); // NaN
console.log(Number(true)); // 1 
console.log(Number(false)); // 0

// Number to String
console.log(typeof String(123)); // string
let num = 123.123;
console.log(typeof num.toPrecision(5), num.toPrecision(2));
console.log(typeof num.toExponential(1));
console.log(typeof [num].join('')) // string
console.log(typeof JSON.stringify(num)) // string
console.log(typeof num.toString()) // string
console.log(typeof num.toFixed(11), num.toFixed(11)) // string
console.log(typeof `${num}`);


// Number to Boolean
console.log(typeof Boolean(1), Boolean(1)); // boolean true
console.log(typeof Boolean(1), Boolean(121)); // boolean true
console.log(typeof Boolean(0), Boolean(0)); // boolean false
console.log(typeof Boolean(-0), Boolean(-0)); // boolean false
console.log(typeof Boolean(-1), Boolean(-1)); // boolean true
console.log(typeof Boolean(NaN), Boolean(NaN)); // boolean false
console.log(typeof !!234, !!234); // boolean false
console.log(typeof !!Number("234"), !!Number("234")); // boolean false

console.log(typeof Number.isNaN(Number("vikram")), Number.isNaN(Number("vikram"))); // boolean

// Number to Object 
let num1 = 123;
console.log(typeof new Number(num1));
console.log(typeof Object(num1));

// Number to other numeric form
let num2 = 123.12;
console.log(num2.toString(2)); // convert to binary form
console.log(Math.round(num2));
console.log(parseInt(num2));