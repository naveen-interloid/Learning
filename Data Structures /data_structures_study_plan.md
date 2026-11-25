# Data Structures Study Plan (Python + FastAPI Developer)

**Duration:** ~9 weeks | **Time:** 1-2 hrs/day | **Starting point:** Comfortable with list, tuple, set, dict, string

**How each topic is laid out:**
- **Concepts:** what you must know
- **Python tools:** what to use / implement
- **Where it's used:** real-world and FastAPI/backend scenarios
- **Major scenarios:** the situations where you reach for this structure
- **Main problems:** practice problems, easy to hard

---

## Progress Tracker

| Week | Topic | Done |
|---|---|---|
| 0 | Big-O and complexity | [ ] |
| 1 | Linked lists | [ ] |
| 2 | Stacks and queues | [ ] |
| 3 | Hashing patterns + array patterns | [ ] |
| 4 | Trees and BSTs | [ ] |
| 5 | Heaps and tries | [ ] |
| 6 | Graphs (BFS/DFS/topological sort) | [ ] |
| 7 | Union-Find and Dijkstra | [ ] |
| 8 | Binary search, recursion, backtracking | [ ] |
| 9 | Intro DP + capstone projects | [ ] |

---

## Step 0: Big-O and Complexity (2-3 days)

### Concepts
- Time vs. space complexity
- O(1), O(log n), O(n), O(n log n), O(n²), O(2ⁿ)
- Best / average / worst case
- Amortized cost (why `list.append` is O(1) amortized)

### Python complexity cheat sheet
| Operation | list | dict / set | deque |
|---|---|---|---|
| Access by index | O(1) | n/a | O(n) in the middle |
| Search (`x in`) | **O(n)** | **O(1)** avg | O(n) |
| Append | O(1) amortized | O(1) | O(1) |
| Insert / pop at front | **O(n)** | n/a | **O(1)** |
| Delete by value | O(n) | O(1) | O(n) |

### Where it's used
- Deciding why an endpoint is slow: a `for` loop with `if x in some_list` inside is O(n²)
- Choosing `set` instead of `list` for permission or ID lookups in request handlers
- Reviewing code and spotting hidden O(n²)

### Main scenarios
- Deduplicating 1M records
- Checking if a user ID is in a blocklist on every request
- Merging two large lists of IDs

### Main problems
- Analyze the complexity of 10 of your own FastAPI functions
- Rewrite an O(n²) "find duplicates" into O(n) using a set

---

## Step 1: Linked Lists (Week 1)

### Concepts
- Node and pointer (reference) idea
- Singly vs. doubly vs. circular
- Head / tail pointers, dummy (sentinel) node trick
- Fast and slow pointers (Floyd's cycle detection)
- In-place reversal

### Python tools
- Implement a `Node` and `LinkedList` class yourself (no built-in equivalent)
- Insert, delete, search, reverse, find middle

### Where it's used
- Building block of **LRU caches**, **queues**, and **hash table chaining**
- Browser history (doubly linked: back/forward)
- Undo / redo stacks, music playlists
- Memory allocators, OS process lists

### Major scenarios
- Frequent insert/delete in the middle when you already hold a reference to the node
- Needing O(1) removal from the middle (doubly linked, used in LRU)
- Detecting loops in chains of references (e.g. circular dependencies)

### Main problems
| Level | Problem |
|---|---|
| Easy | Reverse Linked List |
| Easy | Merge Two Sorted Lists |
| Easy | Linked List Cycle |
| Medium | Remove Nth Node From End |
| Medium | Reorder List |
| Medium | Add Two Numbers |
| Hard | Merge K Sorted Lists (needs a heap) |
| Medium | **LRU Cache** (dict + doubly linked list) |

---

## Step 2: Stacks and Queues (Week 2)

### Concepts
- **Stack:** LIFO (push / pop / peek)
- **Queue:** FIFO (enqueue / dequeue)
- **Deque:** double-ended, O(1) at both ends
- **Monotonic stack:** stack that stays sorted, used for "next greater element"
- **Monotonic deque:** used for sliding window maximum

### Python tools
- Stack: plain `list` (`append` / `pop`)
- Queue and deque: `collections.deque` (**never** `list.pop(0)`)
- Thread-safe queue: `queue.Queue`, `asyncio.Queue`

### Where it's used
- **Function call stack** and recursion
- **Undo/redo** in editors
- **Expression parsing** and compilers (parentheses matching)
- **Task queues** and message brokers (Celery, RabbitMQ, Kafka concepts)
- **FastAPI/async:** `asyncio.Queue` for producer/consumer workers
- **Rate limiting:** sliding window with a deque of timestamps
- **BFS** (queue) and **DFS** (stack) in graphs and trees

### Major scenarios
- Matching nested structures (brackets, HTML tags, JSON)
- Processing jobs in arrival order (background tasks)
- "Next greater/smaller element" style problems
- Keeping only the last N events (bounded `deque(maxlen=N)`)

### Main problems
| Level | Problem |
|---|---|
| Easy | Valid Parentheses |
| Easy | Implement Queue using Stacks |
| Medium | Min Stack |
| Medium | Daily Temperatures (monotonic stack) |
| Medium | Evaluate Reverse Polish Notation |
| Medium | Decode String |
| Hard | Largest Rectangle in Histogram |
| Hard | Sliding Window Maximum (monotonic deque) |

### Mini project
**Sliding-window rate limiter:** store request timestamps per user in a `deque`; drop old ones; reject if count exceeds the limit. Plug it into a FastAPI dependency.

---

## Step 3: Hashing and Array Patterns (Week 3)

You already know `dict` and `set`. This week is about **solving problems** with them and with arrays.

### Concepts
- Hash function, collisions, load factor
- Frequency counting, grouping by key, complement lookup
- Prefix sum + hashmap
- **Two pointers** (sorted arrays, palindromes)
- **Sliding window** (fixed and variable)
- **Prefix sums** (range queries)

### Python tools
- `collections.Counter`, `defaultdict`
- `set` operations: `|`, `&`, `-`
- Tuples as dict keys (hashable)

### Where it's used
- **Caching** and memoization
- **Indexing** and joins (hash join in databases)
- **Deduplication** pipelines and idempotency keys for APIs
- **Session stores** and lookups by token
- **Analytics:** counting events, top endpoints, rolling metrics
- **Sliding window:** rolling averages, rate limiting, log analysis

### Major scenarios
- "Have I seen this before?" (set)
- "How many times?" (Counter)
- "Group these by some property" (defaultdict)
- "Find a pair/subarray that satisfies X" (hashmap + prefix sum / two pointers)
- "Longest/shortest substring or subarray with condition" (sliding window)

### Main problems
| Pattern | Problems |
|---|---|
| Hash lookup | Two Sum, Contains Duplicate, Valid Anagram |
| Grouping | Group Anagrams, Top K Frequent Elements |
| Prefix + hash | Subarray Sum Equals K, Longest Consecutive Sequence |
| Two pointers | Two Sum II, 3Sum, Container With Most Water, Valid Palindrome |
| Sliding window | Best Time to Buy and Sell Stock, Longest Substring Without Repeating Characters, Minimum Window Substring |
| Prefix sum | Product of Array Except Self, Range Sum Query |

---

## Step 4: Trees and BSTs (Week 4)

### Concepts
- Root, parent, child, leaf, height, depth
- Binary tree vs. **binary search tree** (left < node < right)
- Traversals: **inorder, preorder, postorder** (DFS), **level-order** (BFS)
- Recursive and iterative versions
- Balanced trees (AVL, red-black: know the idea, not the implementation)
- Lowest Common Ancestor (LCA)

### Python tools
- `TreeNode` class with `val`, `left`, `right`
- `collections.deque` for level-order
- `sortedcontainers` or `bisect` as practical stand-ins for balanced BSTs

### Where it's used
- **Database indexes** (B-trees / B+ trees in PostgreSQL, MySQL)
- **File systems** and directory trees
- **JSON / HTML / XML (DOM)** parsing: your API payloads are trees
- **Nested comments**, category hierarchies, org charts
- **Decision trees** and expression trees
- **Pydantic nested models** are trees you traverse during validation

### Major scenarios
- Hierarchical data (categories, comment threads, menus)
- Fast ordered lookups (BST concept behind indexes)
- Recursively processing nested JSON
- Range queries ("all values between A and B")

### Main problems
| Level | Problem |
|---|---|
| Easy | Maximum Depth of Binary Tree |
| Easy | Invert Binary Tree |
| Easy | Same Tree / Symmetric Tree |
| Medium | Binary Tree Level Order Traversal |
| Medium | Validate Binary Search Tree |
| Medium | Lowest Common Ancestor of a BST / Binary Tree |
| Medium | Kth Smallest Element in a BST |
| Medium | Construct Binary Tree from Preorder and Inorder |
| Hard | Binary Tree Maximum Path Sum |
| Hard | Serialize and Deserialize Binary Tree |

---

## Step 5: Heaps and Tries (Week 5)

### Heaps

**Concepts**
- Min-heap vs. max-heap, complete binary tree stored in an array
- `push` / `pop` are O(log n), `peek` is O(1), heapify is O(n)
- Top-K pattern, two-heap pattern (median)

**Python tools**
- `heapq` (min-heap only; negate values for a max-heap)
- `heapq.nlargest`, `heapq.nsmallest`, `heapq.merge`
- `asyncio.PriorityQueue`, `queue.PriorityQueue`

**Where it's used**
- **Priority task scheduling** (urgent jobs first)
- **Dijkstra / A\*** shortest-path
- **Top-K** leaderboards, trending items
- **Merging sorted streams** (log files, DB external sort)
- **Event simulation**, timers, delayed jobs

**Major scenarios**
- "Give me the K largest/smallest/most frequent"
- Always process the smallest/most urgent item next
- Running median of a stream
- Merge K sorted sources

**Main problems**
| Level | Problem |
|---|---|
| Easy | Kth Largest Element in a Stream |
| Medium | Kth Largest Element in an Array |
| Medium | Top K Frequent Elements |
| Medium | K Closest Points to Origin |
| Medium | Task Scheduler |
| Hard | Merge K Sorted Lists |
| Hard | Find Median from Data Stream |

### Tries (prefix trees)

**Concepts**
- Each node = one character; path from root = a prefix
- Insert / search / startsWith in O(L), where L is word length
- Trade-off: fast prefix lookup vs. higher memory

**Python tools**
- Node with `children = {}` (dict) and `is_end` flag

**Where it's used**
- **Autocomplete / search suggestions**
- **Spell checkers**
- **IP routing** (longest prefix match)
- **URL / route matching** in web frameworks (FastAPI/Starlette route resolution is conceptually prefix-based)
- Dictionary word games

**Major scenarios**
- Type-ahead search endpoints
- Matching many patterns against text by prefix
- Word-search on a grid

**Main problems**
| Level | Problem |
|---|---|
| Medium | Implement Trie (Prefix Tree) |
| Medium | Design Add and Search Words Data Structure |
| Hard | Word Search II |

### Mini projects
- **Autocomplete endpoint** in FastAPI backed by a trie
- **Priority job queue** with `heapq` and a worker loop

---

## Step 6: Graphs (Weeks 6-7)

### Week 6: Core graph skills

**Concepts**
- Vertices, edges, directed vs. undirected, weighted vs. unweighted
- Representations: **adjacency list** (default), adjacency matrix, edge list
- **BFS** (shortest path in unweighted graphs, level by level)
- **DFS** (explore deep, backtracking, cycle detection)
- Connected components
- **Topological sort** (Kahn's algorithm and DFS-based) for DAGs
- Cycle detection (directed vs. undirected)

**Python tools**
- `defaultdict(list)` for adjacency lists
- `deque` for BFS, recursion or explicit stack for DFS
- `visited` set

**Where it's used**
- **Dependency resolution:** package managers (pip), build systems, task pipelines (Airflow DAGs), **FastAPI's own dependency injection graph**
- **Social networks:** friends, followers, recommendations
- **Maps and routing**
- **Web crawlers**
- **Microservice call graphs**, permission/role inheritance
- **Database migrations** ordering

**Major scenarios**
- "What must run before what?" (topological sort)
- "Is there a circular dependency?" (cycle detection)
- "Shortest number of hops" (BFS)
- "How many separate groups?" (connected components)
- Grid problems (islands, flood fill, mazes): a grid is a graph

**Main problems**
| Level | Problem |
|---|---|
| Medium | Number of Islands |
| Medium | Clone Graph |
| Medium | Max Area of Island |
| Medium | Rotting Oranges (multi-source BFS) |
| Medium | Pacific Atlantic Water Flow |
| Medium | **Course Schedule I** (cycle detection) |
| Medium | **Course Schedule II** (topological sort) |
| Medium | Word Ladder (BFS) |
| Medium | Number of Connected Components |
| Hard | Alien Dictionary (topological sort) |

### Week 7: Union-Find and Dijkstra

**Union-Find (Disjoint Set Union)**
- Concepts: `find` with path compression, `union` by rank/size
- Where used: network connectivity, Kruskal's MST, grouping duplicates/accounts, image segmentation
- Scenarios: "are these two items in the same group?", dynamic connectivity
- Problems: Number of Provinces, Redundant Connection, Accounts Merge, Graph Valid Tree

**Dijkstra (weighted shortest path)**
- Concepts: min-heap of `(distance, node)`, relax edges; **no negative weights**
- Where used: GPS routing, network latency routing, game pathfinding
- Scenarios: cheapest/fastest route with weights
- Problems: Network Delay Time, Path With Minimum Effort, Cheapest Flights Within K Stops (Bellman-Ford variation), Swim in Rising Water

### Mini project
**Task dependency runner:** parse tasks with dependencies, detect cycles, produce a valid execution order with topological sort. Expose it as a FastAPI endpoint that returns the order or an error on circular dependency.

---

## Step 7: Algorithms on Top of Structures (Weeks 8-9)

### Binary Search

**Concepts**
- Search on a sorted array in O(log n)
- Lower bound / upper bound
- **Binary search on the answer** (min/max feasible value)

**Python tools:** `bisect.bisect_left`, `bisect.bisect_right`, `bisect.insort`

**Where it's used:** database index lookups, finding versions in sorted logs, pagination by cursor/timestamp, capacity planning ("minimum capacity to ship in D days")

**Problems:** Binary Search, Search in Rotated Sorted Array, Find Minimum in Rotated Sorted Array, Koko Eating Bananas, Capacity to Ship Packages, Median of Two Sorted Arrays (hard)

### Recursion and Backtracking

**Concepts:** base case, recursive case, call stack depth, decision tree, choose / explore / un-choose, pruning

**Where it's used:** permission/rule engines, search with constraints, parsing nested data, generating combinations (test cases, config options), puzzle solvers (Sudoku, N-Queens)

**Problems:** Subsets, Permutations, Combination Sum, Word Search, Palindrome Partitioning, Generate Parentheses, N-Queens (hard)

### Sorting
**Concepts:** merge sort, quicksort, stability, `sorted()` and `key=` (Timsort, O(n log n))
**Where it's used:** ordering API results, merge steps in external sort, preprocessing for two pointers and intervals
**Problems:** Sort Colors, Merge Intervals, Meeting Rooms II, Insert Interval

### Intro Dynamic Programming

**Concepts**
- Overlapping subproblems + optimal substructure
- Top-down (memoization) vs. bottom-up (tabulation)
- State definition and recurrence relation

**Python tools:** `functools.lru_cache`, `functools.cache`, dict memo

**Where it's used:** diff tools (edit distance), spell correction, resource allocation, caching expensive recursive computations, text similarity

**Problems (in order):** Climbing Stairs, House Robber, Coin Change, Longest Increasing Subsequence, Unique Paths, Longest Common Subsequence, Edit Distance, 0/1 Knapsack (Partition Equal Subset Sum)

### Greedy
**Concepts:** locally optimal choice leads to the global optimum (needs a proof or counterexample check)
**Problems:** Jump Game, Gas Station, Non-overlapping Intervals, Task Scheduler

---

## Capstone Projects (tie it all to FastAPI)

| Project | Structures used | Skill proven |
|---|---|---|
| **LRU cache** (compare with `functools.lru_cache`) | dict + doubly linked list | O(1) design |
| **Rate limiter** dependency | deque / sliding window, dict | Real middleware |
| **Autocomplete endpoint** | trie (+ heap for top suggestions) | Prefix search |
| **Background priority job queue** | heap, `asyncio.Queue` | Scheduling |
| **Dependency/task graph runner** | graph, topological sort, cycle detection | DAG logic |
| **URL shortener with analytics** | dict/hash, heap (top-K), counters | System design basics |

---

## Pattern Recognition Cheat Sheet

| If you see... | Think... |
|---|---|
| "Have I seen this?" / duplicates | `set` |
| Count, frequency, group | `Counter` / `defaultdict` |
| Pair or complement lookup | hash map |
| Sorted array, pair/triplet | two pointers |
| Longest/shortest subarray or substring | sliding window |
| Range sum queries | prefix sums |
| Matching / nested / "undo" | stack |
| Next greater / smaller | monotonic stack |
| Process in order / level by level | queue / BFS |
| Top K / k-th / always need min or max | heap |
| Prefix, autocomplete, word dictionary | trie |
| Hierarchy / nested data | tree + DFS |
| Shortest path, unweighted | BFS |
| Shortest path, weighted (no negatives) | Dijkstra |
| Ordering with dependencies | topological sort |
| Groups / connectivity | Union-Find or DFS |
| Sorted data, "minimum feasible X" | binary search |
| Generate all combinations / permutations | backtracking |
| Overlapping subproblems, count ways / min cost | dynamic programming |

---

## Weekly Routine

| Day | Activity |
|---|---|
| Mon | Learn concept, read, watch a visualization (VisuAlgo) |
| Tue | Implement the structure from scratch in Python |
| Wed-Fri | Solve 2-3 problems (easy, then medium) |
| Sat | Redo hardest problem from memory, review mistakes |
| Sun | Mini project or rest |

## Rules for Real Mastery
1. **Implement before you import.** Build it yourself, then use the library version.
2. **State time and space complexity** for every solution.
3. **Struggle 20-30 minutes** before reading a solution, then rewrite it from memory.
4. **Track mistakes** in a notebook and redo them after 7 days.
5. **Learn patterns, not problems.** Tag each solved problem with its pattern.
6. **Connect to your work.** Ask "where would this appear in my FastAPI app?"

## Resources
- **Practice:** NeetCode 150, LeetCode
- **Visualizers:** VisuAlgo.net, Python Tutor
- **Book:** *Grokking Algorithms* (beginner-friendly), *Problem Solving with Algorithms and Data Structures Using Python* (free online)
- **Python docs:** `collections`, `heapq`, `bisect`, `functools`, `itertools`

## Final Checklist
- [ ] Can explain Big-O of any code I write
- [ ] Implemented: linked list, stack, queue, heap, trie, BST, graph, union-find
- [ ] Solved 100+ problems across all patterns
- [ ] Built at least 3 capstone projects into a FastAPI app
- [ ] Can pick the right structure for a new problem in under a minute
