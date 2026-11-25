# 1. What is complexity?

When we write a program, we need to understand two things:
- **Time complexity**: How does the amount of work increase as the input size increases?
- **Space complexity**: How does the additional memory required increase as the input size increases?

# 2. What is Big-O notation?
Big-O describes how an algorithm's resource usage grows as the input size \(n\) increases.

O(1) — Constant time
The number of operations stays approximately constant regardless of how many elements are in the collection.

```python
numbers = [10, 20, 30, 40, 50]
print(numbers[2])

Output:
30
```

numbers[2] accesses an element directly by index. For a Python list, this takes O(1) time.

### 1. Why is it O(1)?
**Whether the list contains 5 elements or 1 million elements, accessing an element by a valid index takes constant-time work.**

## Important: This assumes the index is already known. Searching for an element by its value is a different operation.

### 2. What is O(n)?
O(n) means the amount of work grows linearly with the input size.

If the input contains 10 elements, we may need to process 10 elements. If it contains 1,000 elements, we may need to process 1,000 elements.

Here, \(n\) represents the number of input elements.

**Why do we use O(n)?**
- Consider a FastAPI endpoint that receives job IDs and needs to find a particular ID.

- We don't know where the ID is located, so we may need to check each element until we find it or reach the end.

**Why is this O(n)?**
- Best case: the target is the first element, so only one comparison is needed — O(1).
- Worst case: the target is last or absent, so all \(n\) elements may be checked — O(n).
- Overall worst-case time complexity: O(n).

### 3. What is O(log n)?
O(log n) means we reduce the remaining search space by a fixed fraction at each step, usually by half.

A classic example is binary search.

Imagine you have a sorted list of 1,000 numbers. Instead of checking each number one by one, you check the middle element and eliminate half of the remaining candidates.

This is why logarithmic algorithms can be much faster than linear algorithms for large inputs.

**Why do we use O(log n)?**

Suppose your ADI platform stores job IDs in a sorted list. You need to find a specific ID.
- O(n): Check each ID sequentially.
- O(log n): Check the middle ID, then search only the relevant half.
Important: Binary search requires sorted data. You cannot safely apply it to an arbitrary unsorted list.


