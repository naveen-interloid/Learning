# Review questions and explanations

[Course home](README.md) · [Learning path](LEARNING_PATH.md)

Try answering aloud before expanding each answer. Explain the rule and give a
small counterexample; memorizing an output is not enough.

## Beginner

1. What is the difference between assignment, mutation, and copying?
2. Why do `1 == 1.0` and `1 == "1"` give different results?
3. Why is `bool("False")` true?
4. When should a collection be a list, tuple, dictionary, or set?
5. How do break, continue, and a loop's else affect execution?
6. How do print and return differ?
7. Why is an empty-list function default often a bug?
8. What can happen when a program opens an existing file with mode `"w"`?

<details>
<summary>Beginner answers</summary>

1. Assignment binds a name. Mutation changes an object. A copy creates another
   object at some depth; a shallow copy can still share nested objects.
2. Numeric values can compare equal across numeric types. Equality does not normally
   convert a string into a number.
3. It is a nonempty string. Truth testing does not parse English words.
4. A list is an editable ordered sequence; a tuple is a fixed sequence of references;
   a dictionary maps keys to values; a set stores distinct hashable values.
5. break leaves the nearest loop. continue skips to its next iteration. Loop else
   runs when the loop completes without break, including zero iterations.
6. print displays something. return supplies the function's result to its caller.
7. Defaults are evaluated at definition time, so calls can share one mutable list.
   Use None and create a list inside when omission means a fresh list.
8. Write mode truncates existing contents. Choose append when that is the intended operation.

</details>

## Intermediate

1. Does a type hint reject an invalid JSON field at runtime?
2. Why does a successful import sometimes execute code unexpectedly?
3. How do an exception handler and a finally block have different responsibilities?
4. Why can a CSV row not always be parsed with split(',')?
5. What should a unit test replace, and what should an integration test check?
6. Why use SQL parameter binding even if a value looks harmless?
7. Does a SQLite connection's context manager close the connection?
8. What does a virtual environment isolate, and what does activation do?

<details>
<summary>Intermediate answers</summary>

1. No. Validate the decoded object's shape and values explicitly or through an
   appropriate validation tool. Type hints primarily describe static contracts.
2. A module's top-level code runs when it is initialized. Put application actions
   in an entry function and use a main guard.
3. A handler decides what to do about a failure. finally releases or restores
   something when leaving the statement, including on a failure path.
4. CSV fields may contain quoted commas, newlines, and escaped quotes. Use csv.
5. Unit tests isolate behavior from changing external dependencies. Integration
   tests check real interactions across selected boundaries.
6. Binding keeps data separate from SQL syntax and correctly handles values such
   as apostrophes. It is the interface contract, not a guess about one input.
7. No. It manages transaction completion under its documented conditions. Close
   the connection separately or use contextlib.closing.
8. It separates project package installations. Activation changes shell lookup;
   an explicit environment interpreter path works without activation.

</details>

## Advanced

1. Why can several lambdas created in a loop return the same value?
2. When is nonlocal needed?
3. What information should a decorator preserve?
4. Does a frozen dataclass make nested values immutable?
5. What does iterating an exhausted generator produce?
6. Why does merely calling an async function not run its body?
7. Does gather's result order establish its tasks' completion order?
8. Why should cancellation normally be propagated after cleanup?
9. Does the GIL make a multi-step application operation thread-safe?
10. How would you decide whether a faster-looking algorithm is actually better?

<details>
<summary>Advanced answers</summary>

1. Closures can read the same enclosing binding at call time. Capture an iteration
   value deliberately when each callable needs its own value.
2. When rebinding an existing name in an enclosing function. Reading it or mutating
   its referenced object does not itself require nonlocal.
3. Preserve argument forwarding and results; wraps preserves useful metadata and
   access to the original through __wrapped__. Document intentional changes.
4. No. Normal field assignment is blocked, but referenced lists or dictionaries
   can still be mutable.
5. No further values. A direct next call raises StopIteration unless given a default.
6. Calling async def creates a coroutine object. It must be awaited or scheduled
   through an event loop to execute.
7. No. gather returns results in input order while task completion can differ.
8. Swallowing cancellation can prevent shutdown and break structured task lifetime.
   Use finally for cleanup and re-raise if you catch CancelledError.
9. No. Steps may interleave, native code can behave differently, and not every
   Python implementation or build uses the same GIL model.
10. Establish correctness, estimate time and space growth, include setup costs,
    then measure representative inputs. Consider readability and memory as well.

</details>

## Explain this bug

```python
rows = [[0]] * 2
rows[0].append(1)
print(rows)
```

Output:

```text
[[0, 1], [0, 1]]
```

<details>
<summary>Explanation and correction</summary>

Both outer positions refer to the same inner list. A comprehension constructs
independent inner lists:

```python
rows = [[0] for _ in range(2)]
rows[0].append(1)
print(rows)
```

Output:

```text
[[0, 1], [0]]
```

</details>
