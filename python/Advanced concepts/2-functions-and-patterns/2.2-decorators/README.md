# Decorators

A decorator takes a function and returns a replacement, often a wrapper that adds behavior. `@announce` applies `announce` when the function is defined. `wraps` preserves useful details such as the original function's name.

## Simple example

```python
from functools import wraps

def announce(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        print("Starting")
        return function(*args, **kwargs)
    return wrapper

@announce
def greet(name):
    return f"Hello, {name}"

print(greet("Mia"))
```

## Output

```text
Starting
Hello, Mia
```

## Flow diagram

```mermaid
flowchart LR
    A[Call decorated greet] --> B[Wrapper prints Starting]
    B --> C[Call original greet]
    C --> D[Return greeting]
    D --> E[Print greeting]
```

## Common mistake

Forgetting `return function(...)` inside the wrapper discards the wrapped function's result, so the decorated function returns `None`.

[Back to Functions and Patterns](../README.md)

## Deeper understanding

Decorator syntax replaces a function name with the decorator's result at definition time. The returned wrapper usually runs at call time. These are separate phases. A wrapper should forward arguments, preserve the result, and use functools.wraps so names and documentation remain useful.

A decorator factory accepts configuration and returns the actual decorator. Stacked decorators apply from the bottom upward: @outer above @inner is equivalent to outer(inner(function)). Decorating a coroutine requires an async-aware wrapper if behavior must happen around the awaited work.

### Preserve metadata

wraps helps inspection reveal the original function's identity.

```python
from functools import wraps
def decorate(function):
    @wraps(function)
    def wrapper(*args, **kwargs):
        return function(*args, **kwargs)
    return wrapper

@decorate
def greet():
    return "Hi"
print(greet.__name__, greet())
```

Output:

```text
greet Hi
```

### Configure a decorator

This intentionally small wrapper accepts no arguments; general wrappers should forward them.

```python
from functools import wraps
def prefix(text):
    def decorate(function):
        @wraps(function)
        def wrapper():
            return text + function()
        return wrapper
    return decorate

@prefix("Hello, ")
def name():
    return "Maya"
print(name())
```

Output:

```text
Hello, Maya
```

## Practice

What changes if a wrapper calls the original function but forgets to return its result?

<details>
<summary>Show the answer</summary>

The original function still runs, but the decorated call returns None. Preserve the result unless changing it is the intended contract.

</details>
