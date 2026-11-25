# Beginner DOM Topics

---

# 1) DOM Introduction

## What is the DOM?

DOM stands for **Document Object Model**.

When a browser loads an HTML page, it converts the HTML into a **tree-like structure** of objects called the DOM.

JavaScript can use the DOM to:

* Access HTML elements
* Change content
* Modify styles
* Add/remove elements
* Handle user interactions

---

## DOM Structure Example

### HTML

```html id="04pxm3"
<!DOCTYPE html>
<html>
<head>
  <title>DOM</title>
</head>
<body>
  <h1>Hello</h1>
  <p>Welcome</p>
</body>
</html>
```

### DOM Tree

```text id="m2h5t4"
Document
 └── html
      ├── head
      │    └── title
      └── body
           ├── h1
           └── p
```

---

## Accessing the Document Object

```javascript id="4e9s1f"
console.log(document);
```

The `document` object represents the whole webpage.

---

## Common DOM Properties

```javascript id="dfl9q7"
document.title
document.body
document.head
document.URL
```

---

## Changing the Page Title

```javascript id="6x9mzz"
document.title = "New Title";
```

---

## Summary Table

| Concept  | Description                         |
| -------- | ----------------------------------- |
| DOM      | Structure created from HTML         |
| document | Root object of the webpage          |
| DOM Tree | Hierarchical representation of HTML |

---

# 2) Selecting Elements

JavaScript provides several methods to select HTML elements from the DOM.

---

## Selecting by ID

```html id="f70m1u"
<h1 id="title">Hello</h1>
```

```javascript id="s5h58n"
const heading = document.getElementById("title");
console.log(heading);
```

---

## Selecting by Class Name

```html id="08um0k"
<p class="text">Paragraph</p>
```

```javascript id="6mx0eq"
const elements = document.getElementsByClassName("text");
console.log(elements);
```

Returns an HTMLCollection.

---

## Selecting by Tag Name

```javascript id="f79lxu"
const paragraphs = document.getElementsByTagName("p");
```

---

## querySelector()

Selects the first matching element.

```javascript id="dbv1jl"
const element = document.querySelector(".text");
```

---

## querySelectorAll()

Selects all matching elements.

```javascript id="a3g5a8"
const items = document.querySelectorAll(".text");
```

Returns a NodeList.

---

## Difference Between querySelector and querySelectorAll

| Method           | Returns                |
| ---------------- | ---------------------- |
| querySelector    | First matching element |
| querySelectorAll | All matching elements  |

---

# 3) Changing Text and Styles

JavaScript can dynamically modify content and styles.

---

## Changing Text using innerText

```html id="s3xvlg"
<h1 id="heading">Old Text</h1>
```

```javascript id="18rj2g"
document.getElementById("heading").innerText = "New Text";
```

---

## textContent

```javascript id="0yls1r"
element.textContent = "Hello";
```

Includes hidden text as well.

---

## innerHTML

```javascript id="m2w0zz"
element.innerHTML = "<span>New HTML</span>";
```

Parses HTML content.

---

## Difference Table

| Property    | Purpose      |
| ----------- | ------------ |
| innerText   | Visible text |
| textContent | All text     |
| innerHTML   | HTML content |

---

## Changing Styles

```javascript id="djlwm6"
element.style.color = "red";
element.style.backgroundColor = "yellow";
```

---

## Multiple Styles

```javascript id="7zc9cq"
element.style.cssText = "color:white; background:black;";
```

---

# 4) Events in JavaScript

Events are actions performed by the user or browser.

Examples:

* click
* keypress
* mouseover
* submit

---

## Click Event

```html id="ajq9wq"
<button id="btn">Click</button>
```

```javascript id="8jvwgl"
const btn = document.getElementById("btn");

btn.addEventListener("click", function () {
  console.log("Button clicked");
});
```

---

## Keyboard Event

```javascript id="p2m3ho"
document.addEventListener("keydown", function (event) {
  console.log(event.key);
});
```

---

## Mouse Event

```javascript id="yr9nkk"
element.addEventListener("mouseover", () => {
  console.log("Mouse over");
});
```

---

## Common Events

| Event   | Description     |
| ------- | --------------- |
| click   | Mouse click     |
| input   | Typing          |
| change  | Value changes   |
| submit  | Form submission |
| keydown | Key pressed     |

---

# 5) Class Manipulation

Classes help apply CSS dynamically.

---

## Adding a Class

```javascript id="h2l0mt"
element.classList.add("active");
```

---

## Removing a Class

```javascript id="sl13e4"
element.classList.remove("active");
```

---

## Toggling a Class

```javascript id="4qt9m9"
element.classList.toggle("dark");
```

---

## Checking a Class

```javascript id="ftyl2x"
element.classList.contains("active");
```

---

## Replacing a Class

```javascript id="0o5z4r"
element.classList.replace("old", "new");
```

---

## Why classList is Preferred

Older approach:

```javascript id="p1h4r6"
element.className = "active";
```

Problem:

* Replaces all existing classes

`classList` is safer and more flexible.

---

# Intermediate DOM Topics

---

# 6) Creating and Removing Elements

JavaScript can dynamically create and remove HTML elements.

---

## Creating an Element

```javascript id="t4t0tc"
const heading = document.createElement("h1");
heading.innerText = "Hello DOM";
```

---

## Adding Element to the Page

```javascript id="dtrj57"
document.body.appendChild(heading);
```

---

## prepend()

```javascript id="gb9zto"
document.body.prepend(heading);
```

Adds at the beginning.

---

## Removing Elements

```javascript id="jlwmf6"
heading.remove();
```

---

## removeChild()

```javascript id="qgwvdf"
parent.removeChild(child);
```

---

# 7) DOM Traversing

DOM traversing means moving between related elements.

---

## Parent Element

```javascript id="6n5c7x"
element.parentElement
```

---

## Children

```javascript id="6v5t9v"
element.children
```

---

## First Child

```javascript id="v27fl0"
element.firstElementChild
```

---

## Last Child

```javascript id="k0k5zn"
element.lastElementChild
```

---

## Siblings

```javascript id="8bz0ci"
element.nextElementSibling
element.previousElementSibling
```

---

## children vs childNodes

| Property   | Includes                   |
| ---------- | -------------------------- |
| children   | Elements only              |
| childNodes | Text + comments + elements |

---

# 8) Forms in JavaScript

Forms are used to collect user input.

---

## Accessing Input Values

```html id="g7o40t"
<input type="text" id="username">
```

```javascript id="4k1n0z"
const input = document.getElementById("username");

console.log(input.value);
```

---

## Form Submit Event

```javascript id="3jlwm0"
form.addEventListener("submit", function (event) {
  event.preventDefault();
  console.log("Form submitted");
});
```

---

## preventDefault()

Stops page refresh.

---

## Checkbox Example

```javascript id="87qkpn"
checkbox.checked
```

---

## Focus and Blur

```javascript id="yv8tkt"
input.focus();
input.blur();
```

---

# 9) Event Bubbling and Delegation

---

# Event Bubbling

When an event happens on a child element, it moves upward to parent elements.

---

## Example

```html id="odx0rt"
<div id="parent">
  <button id="child">Click</button>
</div>
```

```javascript id="e6m8po"
document.getElementById("parent")
.addEventListener("click", () => {
  console.log("Parent clicked");
});

document.getElementById("child")
.addEventListener("click", () => {
  console.log("Child clicked");
});
```

Output:

```text id="skqjj2"
Child clicked
Parent clicked
```

---

# stopPropagation()

Stops bubbling.

```javascript id="d7fh5r"
event.stopPropagation();
```

---

# Event Delegation

Attaching one event listener to a parent instead of multiple children.

---

## Example

```javascript id="zyf9xg"
ul.addEventListener("click", function (event) {
  if (event.target.tagName === "LI") {
    console.log(event.target.innerText);
  }
});
```

---

## Advantages

* Better performance
* Handles dynamically added elements
* Less memory usage

---

# Advanced DOM Topics

---

# 10) Storage in JavaScript

JavaScript provides browser storage mechanisms.

---

# localStorage

Stores data permanently.

```javascript id="gx0bz6"
localStorage.setItem("name", "Sparrow");
```

Get data:

```javascript id="6kwrdo"
localStorage.getItem("name");
```

Remove:

```javascript id="6l4y8j"
localStorage.removeItem("name");
```

---

# sessionStorage

Stores data temporarily for one browser tab.

```javascript id="d49ys0"
sessionStorage.setItem("theme", "dark");
```

---

## Difference Table

| Feature | localStorage | sessionStorage   |
| ------- | ------------ | ---------------- |
| Expiry  | Permanent    | Until tab closes |
| Scope   | All tabs     | Single tab       |

---

# 11) Mutation Observer

A Mutation Observer watches DOM changes.

---

## Example

```javascript id="mzb7ix"
const observer = new MutationObserver((mutations) => {
  console.log("DOM changed");
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
```

---

## Use Cases

* Detect added elements
* Auto-update UI
* Watch dynamic content

---

# 12) Shadow DOM

Shadow DOM creates isolated DOM trees.

Used heavily in Web Components.

---

## Creating Shadow DOM

```javascript id="2b2o7j"
const shadow = element.attachShadow({
  mode: "open"
});
```

---

## Adding Content

```javascript id="slajp8"
shadow.innerHTML = `
  <style>
    p { color:red; }
  </style>
  <p>Hello Shadow DOM</p>
`;
```

---

## Benefits

* Style encapsulation
* Component isolation
* Avoid CSS conflicts

---

# 13) Performance Optimization

DOM operations can be expensive.

---

# Debouncing

Limits how often a function runs.

```javascript id="1h1y6y"
function debounce(fn, delay) {
  let timeout;

  return function () {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      fn();
    }, delay);
  };
}
```

---

# Throttling

Runs function at fixed intervals.

---

# Document Fragment

Efficiently add multiple elements.

```javascript id="r0mvs4"
const fragment = document.createDocumentFragment();
```

---

# Minimize Reflows

Bad:

```javascript id="7y4t2d"
element.style.width = "100px";
element.style.height = "200px";
```

Better:

```javascript id="z9wlls"
element.style.cssText = `
  width:100px;
  height:200px;
`;
```

---

# Lazy Loading

Load resources only when needed.

```html id="wgttr0"
<img loading="lazy" src="image.jpg">
```

---

# Summary Table

| Optimization     | Purpose                 |
| ---------------- | ----------------------- |
| Debouncing       | Reduce repeated calls   |
| Throttling       | Limit execution rate    |
| DocumentFragment | Efficient DOM updates   |
| Lazy Loading     | Improve page load speed |
