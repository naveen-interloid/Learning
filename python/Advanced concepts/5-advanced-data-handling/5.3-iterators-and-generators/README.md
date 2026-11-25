# Iterators and Generators

An iterator produces values one at a time with `next()`. A function containing `yield` creates a generator, which is a kind of iterator. Each `yield` pauses the function; the next request resumes it. A `for` loop handles exhaustion automatically.

## Simple example

```python
def small_numbers():
    yield 1
    yield 2

numbers = small_numbers()
print(next(numbers))
print(next(numbers))
print(list(numbers))
```

## Output

```text
1
2
[]
```

## Flow diagram

```mermaid
flowchart LR
    A[Create generator] --> B[First next yields 1]
    B --> C[Second next yields 2]
    C --> D[No values remain]
    D --> E[list returns an empty list]
```

## Common mistake

Expecting an exhausted generator to restart. Create a new generator by calling the function again. Calling `next()` without a default after exhaustion raises `StopIteration`.

[Back to Advanced Data Handling](../README.md)

## Deeper understanding

An iterable can provide an iterator through iter. An iterator supplies values through next until StopIteration. A list can create fresh iterators; a generator object is its own iterator and is consumed once. next(iterator, default) handles exhaustion without raising.

A generator pauses at yield and retains local state. yield from delegates to another iterable. Avoid retaining unexpectedly large objects inside a long-lived generator. When a generator owns a resource, define how early termination will close it rather than depending on collection timing.

### Use an exhaustion default

A sentinel default can simplify optional consumption.

```python
values = iter([10])
print(next(values, "done"))
print(next(values, "done"))
```

Output:

```text
10
done
```

### Delegate with yield from

Delegation supplies each value rather than yielding the list as one object.

```python
def numbers():
    yield from [1, 2]
    yield 3

print(list(numbers()))
```

Output:

```text
[1, 2, 3]
```

## Practice

How does yield [1, 2] differ from yield from [1, 2]?

<details>
<summary>Show the answer</summary>

The first yields one list object. The second yields the two individual elements.

</details>
