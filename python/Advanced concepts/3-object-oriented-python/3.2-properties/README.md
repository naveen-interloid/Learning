# Properties

`@property` lets you calculate a value through attribute access. A property without a setter cannot be assigned directly. The example calculates a square's area each time `area` is read.

## Simple example

```python
class Square:
    def __init__(self, side):
        self.side = side

    @property
    def area(self):
        return self.side ** 2

square = Square(3)
print(square.area)
```

## Output

```text
9
```

## Flow diagram

```mermaid
flowchart LR
    A[Read square.area] --> B[Run the property getter]
    B --> C[Calculate side times side]
    C --> D[Return 9]
```

## Common mistake

Writing `square.area()` calls the integer result as though it were a function and raises `TypeError`. Read this property with `square.area`.

[Back to Object-Oriented Python](../README.md)

## Deeper understanding

A property presents method behavior through attribute syntax. It is useful for computed values or validation at a stable interface. A setter can reject an update before it changes stored state. Use a separate backing attribute, commonly with a leading underscore, to avoid recursively assigning the same property.

A read-only property does not make the entire object immutable. Other attributes may still change, and the computed result may vary on the next access. Keep property access unsurprising: expensive I/O is often better expressed as an explicit method call.

### Validate a property update

The setter stores a valid value under a different name.

```python
class Score:
    @property
    def value(self):
        return self._value
    @value.setter
    def value(self, number):
        if number < 0:
            raise ValueError("Negative score")
        self._value = number

score = Score()
score.value = 8
print(score.value)
```

Output:

```text
8
```

### Recalculate a computed property

The property calculates from current state rather than storing a stale area.

```python
class Square:
    def __init__(self, side):
        self.side = side
    @property
    def area(self):
        return self.side ** 2

square = Square(2)
square.side = 3
print(square.area)
```

Output:

```text
9
```

## Practice

Why would self.value = number inside the value setter recurse?

<details>
<summary>Show the answer</summary>

That assignment invokes the same setter again. Store the validated value in a different backing attribute such as self._value.

</details>
