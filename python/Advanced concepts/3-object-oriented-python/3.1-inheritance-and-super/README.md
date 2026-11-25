# Inheritance and `super`

Inheritance lets a class reuse and extend another class. In this single-inheritance example, `super()` lets `Dog` call `Animal`'s implementation. More generally, `super()` follows Python's method resolution order.

## Simple example

```python
class Animal:
    def speak(self):
        return "Hello"

class Dog(Animal):
    def speak(self):
        return super().speak() + ", woof!"

print(Dog().speak())
```

## Output

```text
Hello, woof!
```

## Flow diagram

```mermaid
flowchart LR
    A[Call Dog.speak] --> B[super calls Animal.speak]
    B --> C[Animal returns Hello]
    C --> D[Dog adds its own greeting]
    D --> E[Return Hello, woof!]
```

## Common mistake

Calling `self.speak()` inside this override to reach the inherited method calls `Dog.speak()` again, causing recursion. Use `super().speak()` here.

[Back to Object-Oriented Python](../README.md)

## Deeper understanding

Inheritance supplies an attribute lookup relationship and a behavioral contract. An override should remain usable where callers expect the parent behavior. super follows the method resolution order rather than meaning 'call a hard-coded parent'. Cooperative multiple inheritance works when participants consistently use compatible signatures and super.

Composition is often easier when an object has a collaborator rather than being a subtype of it. Review the responsibility you are modeling before choosing inheritance. isinstance recognizes subclasses, while type(value) is SomeClass checks the exact runtime class.

### Inspect a simple resolution order

The class hierarchy participates in attribute lookup.

```python
class Animal:
    pass
class Dog(Animal):
    pass
print([kind.__name__ for kind in Dog.__mro__])
print(isinstance(Dog(), Animal))
```

Output:

```text
['Dog', 'Animal', 'object']
True
```

### Extend initialization

The inherited initialization is explicitly included.

```python
class Named:
    def __init__(self, name):
        self.name = name
class User(Named):
    def __init__(self, name, active):
        super().__init__(name)
        self.active = active

user = User("Maya", True)
print(user.name, user.active)
```

Output:

```text
Maya True
```

## Practice

Why can replacing a parent's accepted input with a narrower input contract break callers?

<details>
<summary>Show the answer</summary>

Code written against the parent may pass values the subtype no longer accepts. Subtyping should preserve the relevant promises, not just method names.

</details>
