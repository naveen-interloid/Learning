# Higher-Order Functions

A higher-order function accepts another function or returns a function. This lets you reuse the same steps with different behavior.

## Simple example

```python
def double(number):
    return number * 2

def apply_twice(action, value):
    return action(action(value))

print(apply_twice(double, 3))
```

## Output

```text
12
```

## Flow diagram

```mermaid
flowchart LR
    A[Start with 3] --> B[double gives 6]
    B --> C[double gives 12]
    C --> D[Return 12]
```

## Common mistake

Writing `double()` when passing the function. `double` passes the function itself; parentheses call it immediately and, in this example, omit its required argument.

[Back to Functions and Patterns](../README.md)

## Deeper understanding

A function is a value that can be stored, passed, or returned. Higher-order functions separate an operation's mechanics from the behavior supplied by a caller. sorted accepts a key function; map applies a function lazily to values; filter keeps values whose predicate is true.

Prefer a comprehension when it expresses the transformation more clearly. functools.partial fixes some arguments in advance without writing another full function. Composition means passing one function's result into another. Keep input and output contracts compatible, and avoid hiding side effects inside transformations.

### Sort using a key function

The key determines ordering; the original strings remain the output values.

```python
names = ["Maya", "Jo", "Alexander"]
print(sorted(names, key=len))
```

Output:

```text
['Jo', 'Maya', 'Alexander']
```

### Fix an argument with partial

partial creates a callable with the first argument supplied.

```python
from functools import partial
def multiply(a, b):
    return a * b

double = partial(multiply, 2)
print(double(6))
```

Output:

```text
12
```

## Practice

When does map execute the supplied function, and why can consuming it twice surprise you?

<details>
<summary>Show the answer</summary>

map returns an iterator. Work occurs as values are requested. After exhaustion, consuming the same iterator again produces no values.

</details>
