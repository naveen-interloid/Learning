# Iterators & Iterable Protocols

The iteration protocols define how to produce a sequence of values from an object. Understanding these protocols is essential for creating custom data structures and working with modern JavaScript features.

## The Iteration Protocol

### Iterator Protocol

An object is an iterator when it implements a `next()` method that returns `{value, done}`.

```javascript
// Simple iterator implementation
function createNumberIterator(start, end) {
    let current = start;
    
    return {
        next() {
            if (current <= end) {
                return { value: current++, done: false };
            } else {
                return { done: true };
            }
        }
    };
}

const iterator = createNumberIterator(1, 3);
console.log(iterator.next()); // { value: 1, done: false }
console.log(iterator.next()); // { value: 2, done: false }
console.log(iterator.next()); // { value: 3, done: false }
console.log(iterator.next()); // { done: true }
```

### Iterable Protocol

An object is iterable when it implements the `Symbol.iterator` method that returns an iterator.

```javascript
// Simple iterable implementation
const numberRange = {
    start: 1,
    end: 5,
    
    [Symbol.iterator]() {
        let current = this.start;
        const end = this.end;
        
        return {
            next() {
                if (current <= end) {
                    return { value: current++, done: false };
                } else {
                    return { done: true };
                }
            }
        };
    }
};

// Now it works with for...of
for (const num of numberRange) {
    console.log(num); // 1, 2, 3, 4, 5
}

// And with spread operator
console.log([...numberRange]); // [1, 2, 3, 4, 5]
```

## Custom Iterable Classes

### Basic Iterable Class

```javascript
class Range {
    constructor(start, end, step = 1) {
        this.start = start;
        this.end = end;
        this.step = step;
    }
    
    [Symbol.iterator]() {
        let current = this.start;
        const end = this.end;
        const step = this.step;
        
        return {
            next() {
                if ((step > 0 && current <= end) || (step < 0 && current >= end)) {
                    const value = current;
                    current += step;
                    return { value, done: false };
                } else {
                    return { done: true };
                }
            }
        };
    }
}

// Usage
const range = new Range(0, 10, 2);
console.log([...range]); // [0, 2, 4, 6, 8, 10]

const reverseRange = new Range(10, 0, -2);
console.log([...reverseRange]); // [10, 8, 6, 4, 2, 0]
```

### Iterable with Multiple Iteration Modes

```javascript
class FlexibleCollection {
    constructor(data) {
        this.data = data;
    }
    
    // Default iteration
    [Symbol.iterator]() {
        return this.values();
    }
    
    // Iterate over values
    *values() {
        for (const item of this.data) {
            yield item;
        }
    }
    
    // Iterate over indices
    *keys() {
        for (let i = 0; i < this.data.length; i++) {
            yield i;
        }
    }
    
    // Iterate over [index, value] pairs
    *entries() {
        for (let i = 0; i < this.data.length; i++) {
            yield [i, this.data[i]];
        }
    }
    
    // Reverse iteration
    *reverse() {
        for (let i = this.data.length - 1; i >= 0; i--) {
            yield this.data[i];
        }
    }
}

const collection = new FlexibleCollection(['a', 'b', 'c']);

console.log([...collection]); // ['a', 'b', 'c']
console.log([...collection.keys()]); // [0, 1, 2]
console.log([...collection.entries()]); // [[0, 'a'], [1, 'b'], [2, 'c']]
console.log([...collection.reverse()]); // ['c', 'b', 'a']
```

## Generator Functions as Iterators

### Basic Generator

```javascript
function* simpleGenerator() {
    yield 1;
    yield 2;
    yield 3;
}

const gen = simpleGenerator();
console.log([...gen]); // [1, 2, 3]

// Generators are both iterators and iterables
function* fibonacci(limit) {
    let a = 0, b = 1;
    while (a <= limit) {
        yield a;
        [a, b] = [b, a + b];
    }
}

console.log([...fibonacci(20)]); // [0, 1, 1, 2, 3, 5, 8, 13]
```

### Advanced Generator Patterns

```javascript
// Generator with parameters
function* parameterizedGenerator(start, multiplier) {
    let current = start;
    while (true) {
        const received = yield current;
        if (received !== undefined) {
            current = received;
        } else {
            current *= multiplier;
        }
    }
}

const gen = parameterizedGenerator(1, 2);
console.log(gen.next().value); // 1
console.log(gen.next().value); // 2
console.log(gen.next(10).value); // 10
console.log(gen.next().value); // 20

// Generator delegation
function* innerGenerator() {
    yield 'inner1';
    yield 'inner2';
}

function* outerGenerator() {
    yield 'outer1';
    yield* innerGenerator(); // Delegate to inner generator
    yield 'outer2';
}

console.log([...outerGenerator()]); // ['outer1', 'inner1', 'inner2', 'outer2']
```

## Async Iterators

### Basic Async Iterator

```javascript
// Async iterator implementation
const asyncIterable = {
    [Symbol.asyncIterator]() {
        let count = 0;
        
        return {
            async next() {
                if (count < 3) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    return { value: `async-${count++}`, done: false };
                } else {
                    return { done: true };
                }
            }
        };
    }
};

// Usage with for-await-of
async function useAsyncIterable() {
    for await (const value of asyncIterable) {
        console.log(value); // async-0, async-1, async-2
    }
}
```

### Async Generator

```javascript
async function* asyncGenerator() {
    for (let i = 0; i < 3; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        yield `async-value-${i}`;
    }
}

async function useAsyncGenerator() {
    for await (const value of asyncGenerator()) {
        console.log(value); // async-value-0, async-value-1, async-value-2
    }
}
```

## Advanced Iterator Patterns

### Lazy Evaluation Iterator

```javascript
class LazyMap {
    constructor(iterable, mapFn) {
        this.iterable = iterable;
        this.mapFn = mapFn;
    }
    
    *[Symbol.iterator]() {
        for (const item of this.iterable) {
            yield this.mapFn(item);
        }
    }
}

class LazyFilter {
    constructor(iterable, filterFn) {
        this.iterable = iterable;
        this.filterFn = filterFn;
    }
    
    *[Symbol.iterator]() {
        for (const item of this.iterable) {
            if (this.filterFn(item)) {
                yield item;
            }
        }
    }
}

// Chain lazy operations
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const result = new LazyMap(
    new LazyFilter(numbers, x => x % 2 === 0),
    x => x * x
);

console.log([...result]); // [4, 16, 36, 64, 100]
```

### Infinite Iterator

```javascript
function* infiniteSequence(start = 0, step = 1) {
    let current = start;
    while (true) {
        yield current;
        current += step;
    }
}

// Take first n items from infinite sequence
function* take(iterable, n) {
    let count = 0;
    for (const item of iterable) {
        if (count >= n) break;
        yield item;
        count++;
    }
}

const infiniteNumbers = infiniteSequence(1, 2);
console.log([...take(infiniteNumbers, 5)]); // [1, 3, 5, 7, 9]
```

### Iterator Utilities

```javascript
class IteratorUtils {
    // Convert any iterable to array
    static toArray(iterable) {
        return [...iterable];
    }
    
    // Find first item matching predicate
    static find(iterable, predicate) {
        for (const item of iterable) {
            if (predicate(item)) {
                return item;
            }
        }
        return undefined;
    }
    
    // Check if any item matches predicate
    static some(iterable, predicate) {
        for (const item of iterable) {
            if (predicate(item)) {
                return true;
            }
        }
        return false;
    }
    
    // Check if all items match predicate
    static every(iterable, predicate) {
        for (const item of iterable) {
            if (!predicate(item)) {
                return false;
            }
        }
        return true;
    }
    
    // Reduce iterable to single value
    static reduce(iterable, reducer, initialValue) {
        let accumulator = initialValue;
        let first = true;
        
        for (const item of iterable) {
            if (first && accumulator === undefined) {
                accumulator = item;
                first = false;
            } else {
                accumulator = reducer(accumulator, item);
            }
        }
        
        return accumulator;
    }
    
    // Chain multiple iterables
    static *chain(...iterables) {
        for (const iterable of iterables) {
            yield* iterable;
        }
    }
    
    // Zip multiple iterables together
    static *zip(...iterables) {
        const iterators = iterables.map(it => it[Symbol.iterator]());
        
        while (true) {
            const results = iterators.map(it => it.next());
            if (results.some(result => result.done)) {
                break;
            }
            yield results.map(result => result.value);
        }
    }
}

// Usage examples
const range1 = new Range(1, 3);
const range2 = new Range(4, 6);

console.log([...IteratorUtils.chain(range1, range2)]); // [1, 2, 3, 4, 5, 6]
console.log([...IteratorUtils.zip([1, 2, 3], ['a', 'b', 'c'])]); // [[1, 'a'], [2, 'b'], [3, 'c']]
console.log(IteratorUtils.find(range1, x => x > 1)); // 2
console.log(IteratorUtils.reduce(range1, (a, b) => a + b, 0)); // 6
```

## Performance Considerations

```javascript
// Compare iteration methods performance
function performanceComparison() {
    const data = Array.from({length: 1000000}, (_, i) => i);
    
    // Traditional for loop
    console.time('for loop');
    let sum1 = 0;
    for (let i = 0; i < data.length; i++) {
        sum1 += data[i];
    }
    console.timeEnd('for loop');
    
    // for...of loop
    console.time('for...of');
    let sum2 = 0;
    for (const item of data) {
        sum2 += item;
    }
    console.timeEnd('for...of');
    
    // Iterator manually
    console.time('manual iterator');
    let sum3 = 0;
    const iterator = data[Symbol.iterator]();
    let result = iterator.next();
    while (!result.done) {
        sum3 += result.value;
        result = iterator.next();
    }
    console.timeEnd('manual iterator');
    
    console.log('Results equal:', sum1 === sum2 && sum2 === sum3);
}
```

## Best Practices

1. **Use generators for complex iteration logic** - They're more readable than manual iterator implementation
2. **Implement both iterator and iterable protocols** - For maximum compatibility
3. **Consider lazy evaluation** - Don't compute values until needed
4. **Handle edge cases** - Empty collections, infinite sequences
5. **Use built-in iterables when possible** - Arrays, Maps, Sets are already optimized
6. **Be mindful of performance** - Custom iterators can be slower than native loops
7. **Document iteration behavior** - Make it clear what your iterables produce

## Common Use Cases

- Creating custom data structures
- Implementing lazy evaluation
- Building data processing pipelines
- Creating infinite sequences
- Implementing pagination
- Stream processing
- Custom collection types
- API response processing
