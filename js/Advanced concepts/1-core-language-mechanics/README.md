## **1. Core Language Mechanics — Overview**

### **1.1 Execution Context & Call Stack**

* **Execution Context** = the environment in which JS code runs (variables, functions, `this`).
* **Types**:

  * **Global Execution Context** → created when the script starts.
  * **Function Execution Context** → created when a function is invoked.
* **Call Stack** = keeps track of function execution order (LIFO — last in, first out).

### **1.2 Hoisting**

* JS moves **declarations** to the top of their scope before execution.
* **Variable hoisting**:

  * `var` → hoisted but initialized as `undefined`
  * `let` & `const` → hoisted but **in Temporal Dead Zone** (access before declaration → error)
* **Function hoisting**:

  * Function declarations → hoisted with full definition.
  * Function expressions → behave like variables.

### **1.3 Scope**

* **Global Scope** → accessible anywhere.
* **Function Scope** → variables accessible only inside the function.
* **Block Scope** → `let` & `const` inside `{}` are limited to that block.
* **Lexical Scope** → determined by where code is written (not called).

### **1.4 Closures & Lexical Environment**

* **Closure** = a function that “remembers” variables from its **outer scope**, even after that scope is gone.
* Enables data privacy and function factories.

### **1.5 `this` Binding & Rules**

* **Default binding**: global object (`window` in browsers) in non-strict mode, `undefined` in strict.
* **Implicit binding**: when called as an object method, `this` = object.
* **Explicit binding**: `.call()`, `.apply()`, `.bind()` set `this` manually.
* **Arrow functions**: inherit `this` from the surrounding scope (no own binding).

### **1.6 Prototype Chain & Inheritance**

* JS objects have an internal link to another object (prototype).
* Properties & methods are looked up along the chain until found or `null`.
* Enables **prototypal inheritance**.

### **1.7 Shadowing & Variable Masking**

* **Shadowing**: A variable in inner scope has the same name as one in outer scope — the inner one “shadows” the outer.
* **Illegal shadowing**: Happens when `let`/`const` variables shadow variables declared with `var` in the same scope — causes errors.

### **1.8 Strict Mode (`"use strict"`)**

* Introduces stricter parsing and error handling.
* Examples:

  * Prevents accidental global variable creation.
  * Throws errors for silent fails.
  * Makes `this` undefined in functions instead of defaulting to global object.

If you want, I can now **deep dive into each of these 8 topics with mini diagrams + example code**, so you’ll have a *visual memory* of how they work. That will make them stick in one go.

1. [Execution Context & Call Stack](./1.1-execution-context-and-call-stack/execution-context-and-call-stack.md)
2. [Hoisting (Variable & Function Hoisting)](./1.2-hoisting/hoisting.md)
3. [Scope (Global, Local, Block, Lexical)](./1.3-scope/scope.md)
4. [Closures & Lexical Environment](./1.4-closures-and-lexical-environment/closures-and-lexical-environment.md)
5. [`this` Binding & Rules](./1.5-this-binding/this-binding.md)
6. [Prototype Chain & Inheritance](./1.6-prototype-chain/prototype-chain.md)
7. [Shadowing & Variable Masking](./1.7-shadowing-and-variable-masking/shadowing-and-variable-masking.md)
8. [Strict Mode ("use strict")](./1.8-strict-mode/strict-mode.md)
