# **7.1 Garbage Collection Mechanisms**

JavaScript's automatic memory management through garbage collection is fundamental to understanding performance characteristics and memory usage patterns in applications.

## Garbage Collection Fundamentals

### Memory Allocation and Object Lifecycle

```javascript
// memory-lifecycle.js - Understanding object lifecycle and GC
class MemoryLifecycleDemo {
  static demonstrateObjectLifecycle() {
    console.log('=== Object Lifecycle Demonstration ===');
    
    // Phase 1: Allocation
    console.log('1. Object Allocation Phase');
    let user = {
      name: 'John Doe',
      email: 'john@example.com',
      preferences: {
        theme: 'dark',
        language: 'en'
      }
    };
    
    let userData = new Array(1000).fill(0).map((_, i) => ({
      id: i,
      name: `User ${i}`,
      data: new Array(100).fill(Math.random())
    }));
    
    console.log('Objects allocated in memory');
    this.logMemoryUsage('After allocation');
    
    // Phase 2: Usage
    console.log('\n2. Object Usage Phase');
    const processedData = userData
      .filter(u => u.id % 2 === 0)
      .map(u => ({ ...u, processed: true }));
    
    console.log(`Processed ${processedData.length} users`);
    this.logMemoryUsage('After processing');
    
    // Phase 3: Dereferencing (preparing for GC)
    console.log('\n3. Object Dereferencing Phase');
    user = null;
    userData = null;
    // processedData still referenced, won't be collected
    
    console.log('Large objects dereferenced');
    this.logMemoryUsage('After dereferencing');
    
    // Force garbage collection if available (Chrome DevTools)
    if (global.gc) {
      console.log('\n4. Forced Garbage Collection');
      global.gc();
      this.logMemoryUsage('After forced GC');
    } else {
      console.log('\n4. Garbage Collection (automatic)');
      console.log('GC will run automatically when needed');
    }
    
    return processedData;
  }
  
  static logMemoryUsage(label) {
    if (performance.memory) {
      const memory = performance.memory;
      console.log(`${label}:`, {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
      });
    } else {
      console.log(`${label}: Memory API not available`);
    }
  }
  
  static demonstrateReachability() {
    console.log('\n=== Reachability and GC Roots ===');
    
    // Global variables are GC roots
    window.globalUser = { name: 'Global User' };
    
    // Function scope variables
    function createScope() {
      let localUser = { name: 'Local User' };
      let closureData = { value: 42 };
      
      // This closure keeps closureData reachable
      return function() {
        return closureData.value;
      };
    }
    
    const closureFunction = createScope();
    // localUser is no longer reachable after createScope returns
    // closureData remains reachable through the closure
    
    console.log('Closure value:', closureFunction());
    
    // DOM elements are GC roots when attached
    const element = document.createElement('div');
    element.textContent = 'Temporary element';
    document.body.appendChild(element);
    
    // Element becomes unreachable when removed from DOM
    setTimeout(() => {
      document.body.removeChild(element);
      console.log('Element removed from DOM');
    }, 1000);
  }
}

// Run demonstrations
MemoryLifecycleDemo.demonstrateObjectLifecycle();
MemoryLifecycleDemo.demonstrateReachability();
```

### Mark-and-Sweep Algorithm

```javascript
// mark-and-sweep-simulation.js - Simulating mark-and-sweep GC
class MarkAndSweepSimulator {
  constructor() {
    this.objects = new Map();
    this.gcRoots = new Set();
    this.nextId = 1;
  }
  
  // Create object in simulated heap
  createObject(data, references = []) {
    const id = this.nextId++;
    const obj = {
      id,
      data,
      references: new Set(references),
      marked: false,
      allocated: Date.now()
    };
    
    this.objects.set(id, obj);
    console.log(`Created object ${id}:`, data);
    return id;
  }
  
  // Add reference between objects
  addReference(fromId, toId) {
    const fromObj = this.objects.get(fromId);
    const toObj = this.objects.get(toId);
    
    if (fromObj && toObj) {
      fromObj.references.add(toId);
      console.log(`Added reference: ${fromId} -> ${toId}`);
    }
  }
  
  // Remove reference between objects
  removeReference(fromId, toId) {
    const fromObj = this.objects.get(fromId);
    if (fromObj) {
      fromObj.references.delete(toId);
      console.log(`Removed reference: ${fromId} -> ${toId}`);
    }
  }
  
  // Add object as GC root
  addGCRoot(objectId) {
    this.gcRoots.add(objectId);
    console.log(`Added GC root: ${objectId}`);
  }
  
  // Remove object from GC roots
  removeGCRoot(objectId) {
    this.gcRoots.delete(objectId);
    console.log(`Removed GC root: ${objectId}`);
  }
  
  // Mark phase: mark all reachable objects
  markPhase() {
    console.log('\n--- Mark Phase ---');
    
    // Clear all marks
    for (const obj of this.objects.values()) {
      obj.marked = false;
    }
    
    // Mark from GC roots
    const toMark = [...this.gcRoots];
    const marked = new Set();
    
    while (toMark.length > 0) {
      const objectId = toMark.pop();
      
      if (marked.has(objectId)) continue;
      
      const obj = this.objects.get(objectId);
      if (obj) {
        obj.marked = true;
        marked.add(objectId);
        console.log(`Marked object ${objectId}`);
        
        // Add referenced objects to marking queue
        for (const refId of obj.references) {
          if (!marked.has(refId)) {
            toMark.push(refId);
          }
        }
      }
    }
    
    return marked;
  }
  
  // Sweep phase: deallocate unmarked objects
  sweepPhase() {
    console.log('\n--- Sweep Phase ---');
    
    const toDelete = [];
    
    for (const [id, obj] of this.objects) {
      if (!obj.marked) {
        toDelete.push(id);
      }
    }
    
    let freedMemory = 0;
    for (const id of toDelete) {
      const obj = this.objects.get(id);
      console.log(`Deallocating object ${id}:`, obj.data);
      freedMemory += this.estimateObjectSize(obj);
      this.objects.delete(id);
    }
    
    console.log(`Freed ${toDelete.length} objects, ~${freedMemory} bytes`);
    return toDelete.length;
  }
  
  // Run complete mark-and-sweep cycle
  runGarbageCollection() {
    console.log('\n=== Running Garbage Collection ===');
    const startTime = performance.now();
    
    const markedObjects = this.markPhase();
    const freedObjects = this.sweepPhase();
    
    const endTime = performance.now();
    const gcTime = endTime - startTime;
    
    console.log('\n--- GC Summary ---');
    console.log(`Objects before GC: ${this.objects.size + freedObjects}`);
    console.log(`Objects after GC: ${this.objects.size}`);
    console.log(`Objects freed: ${freedObjects}`);
    console.log(`GC time: ${gcTime.toFixed(2)}ms`);
    
    return {
      objectsBefore: this.objects.size + freedObjects,
      objectsAfter: this.objects.size,
      objectsFreed: freedObjects,
      gcTime
    };
  }
  
  // Estimate object size (simplified)
  estimateObjectSize(obj) {
    const dataSize = JSON.stringify(obj.data).length;
    const referencesSize = obj.references.size * 8; // 8 bytes per reference
    return dataSize + referencesSize + 64; // base object overhead
  }
  
  // Get current heap status
  getHeapStatus() {
    const totalObjects = this.objects.size;
    const totalSize = Array.from(this.objects.values())
      .reduce((sum, obj) => sum + this.estimateObjectSize(obj), 0);
    
    return {
      totalObjects,
      totalSize,
      gcRoots: this.gcRoots.size,
      averageObjectSize: totalObjects > 0 ? totalSize / totalObjects : 0
    };
  }
}

// Demonstration
const gcSimulator = new MarkAndSweepSimulator();

// Create object graph
const root1 = gcSimulator.createObject({ type: 'root', name: 'Root 1' });
const root2 = gcSimulator.createObject({ type: 'root', name: 'Root 2' });
const child1 = gcSimulator.createObject({ type: 'child', name: 'Child 1' });
const child2 = gcSimulator.createObject({ type: 'child', name: 'Child 2' });
const orphan = gcSimulator.createObject({ type: 'orphan', name: 'Orphan' });

// Create references
gcSimulator.addReference(root1, child1);
gcSimulator.addReference(root2, child2);
gcSimulator.addReference(child1, child2); // Cross-reference

// Set GC roots
gcSimulator.addGCRoot(root1);
gcSimulator.addGCRoot(root2);

console.log('\nInitial heap status:', gcSimulator.getHeapStatus());

// Run GC - should not collect anything (all reachable)
gcSimulator.runGarbageCollection();

// Remove one root
gcSimulator.removeGCRoot(root2);

// Run GC again - should collect root2 and child2 if not referenced elsewhere
gcSimulator.runGarbageCollection();

console.log('\nFinal heap status:', gcSimulator.getHeapStatus());
```

### Generational Garbage Collection

```javascript
// generational-gc.js - Understanding generational garbage collection
class GenerationalGCDemo {
  constructor() {
    this.youngGeneration = new Set();
    this.oldGeneration = new Set();
    this.survivorCounts = new Map();
    this.promotionThreshold = 2;
    this.allocationCount = 0;
  }
  
  // Allocate object in young generation
  allocateObject(data) {
    const obj = {
      id: ++this.allocationCount,
      data,
      allocatedAt: Date.now(),
      generation: 'young',
      survivalCount: 0
    };
    
    this.youngGeneration.add(obj);
    this.survivorCounts.set(obj.id, 0);
    
    console.log(`Allocated object ${obj.id} in young generation`);
    return obj;
  }
  
  // Simulate minor GC (young generation only)
  minorGC() {
    console.log('\n--- Minor GC (Young Generation) ---');
    const startTime = performance.now();
    
    const survivors = new Set();
    const promoted = new Set();
    
    // Simulate marking reachable objects in young generation
    for (const obj of this.youngGeneration) {
      // Simulate: 70% survival rate for demonstration
      if (Math.random() > 0.3) {
        const survivalCount = this.survivorCounts.get(obj.id) + 1;
        this.survivorCounts.set(obj.id, survivalCount);
        obj.survivalCount = survivalCount;
        
        // Promote to old generation if survived enough times
        if (survivalCount >= this.promotionThreshold) {
          obj.generation = 'old';
          promoted.add(obj);
          this.oldGeneration.add(obj);
          console.log(`Promoted object ${obj.id} to old generation`);
        } else {
          survivors.add(obj);
          console.log(`Object ${obj.id} survived (count: ${survivalCount})`);
        }
      } else {
        console.log(`Object ${obj.id} collected`);
        this.survivorCounts.delete(obj.id);
      }
    }
    
    // Update young generation
    this.youngGeneration = survivors;
    
    const endTime = performance.now();
    const gcTime = endTime - startTime;
    
    console.log(`Minor GC completed in ${gcTime.toFixed(2)}ms`);
    console.log(`Survivors: ${survivors.size}, Promoted: ${promoted.size}`);
    
    return {
      survivors: survivors.size,
      promoted: promoted.size,
      collected: this.allocationCount - survivors.size - promoted.size - this.oldGeneration.size,
      gcTime
    };
  }
  
  // Simulate major GC (both generations)
  majorGC() {
    console.log('\n--- Major GC (All Generations) ---');
    const startTime = performance.now();
    
    const youngSurvivors = new Set();
    const oldSurvivors = new Set();
    
    // Process young generation
    for (const obj of this.youngGeneration) {
      if (Math.random() > 0.2) { // Higher survival rate in major GC
        youngSurvivors.add(obj);
      } else {
        console.log(`Young object ${obj.id} collected in major GC`);
        this.survivorCounts.delete(obj.id);
      }
    }
    
    // Process old generation
    for (const obj of this.oldGeneration) {
      if (Math.random() > 0.1) { // Very high survival rate for old objects
        oldSurvivors.add(obj);
      } else {
        console.log(`Old object ${obj.id} collected in major GC`);
        this.survivorCounts.delete(obj.id);
      }
    }
    
    this.youngGeneration = youngSurvivors;
    this.oldGeneration = oldSurvivors;
    
    const endTime = performance.now();
    const gcTime = endTime - startTime;
    
    console.log(`Major GC completed in ${gcTime.toFixed(2)}ms`);
    
    return {
      youngSurvivors: youngSurvivors.size,
      oldSurvivors: oldSurvivors.size,
      gcTime
    };
  }
  
  // Get generation statistics
  getGenerationStats() {
    return {
      youngGeneration: {
        count: this.youngGeneration.size,
        objects: Array.from(this.youngGeneration).map(obj => ({
          id: obj.id,
          survivalCount: obj.survivalCount
        }))
      },
      oldGeneration: {
        count: this.oldGeneration.size,
        objects: Array.from(this.oldGeneration).map(obj => ({
          id: obj.id,
          survivalCount: obj.survivalCount
        }))
      },
      totalAllocations: this.allocationCount
    };
  }
  
  // Simulate allocation pressure
  simulateAllocationPressure(count = 20) {
    console.log(`\n=== Simulating ${count} allocations ===`);
    
    for (let i = 0; i < count; i++) {
      this.allocateObject({
        type: 'data',
        value: Math.random(),
        timestamp: Date.now()
      });
      
      // Trigger minor GC every 10 allocations
      if ((i + 1) % 10 === 0) {
        this.minorGC();
      }
    }
    
    // Trigger major GC at the end
    this.majorGC();
    
    console.log('\nFinal generation stats:', this.getGenerationStats());
  }
}

// Run generational GC demonstration
const genGC = new GenerationalGCDemo();
genGC.simulateAllocationPressure(30);
```

### Reference Counting and Circular References

```javascript
// reference-counting.js - Understanding reference counting limitations
class ReferenceCountingDemo {
  constructor() {
    this.objects = new Map();
    this.referenceCounts = new Map();
    this.nextId = 1;
  }
  
  // Create object with reference counting
  createObject(data) {
    const id = this.nextId++;
    const obj = {
      id,
      data,
      references: new Set()
    };
    
    this.objects.set(id, obj);
    this.referenceCounts.set(id, 0);
    
    console.log(`Created object ${id}:`, data);
    return id;
  }
  
  // Add reference (increment count)
  addReference(fromId, toId) {
    const fromObj = this.objects.get(fromId);
    const toObj = this.objects.get(toId);
    
    if (fromObj && toObj) {
      fromObj.references.add(toId);
      const currentCount = this.referenceCounts.get(toId);
      this.referenceCounts.set(toId, currentCount + 1);
      
      console.log(`Added reference ${fromId} -> ${toId} (count: ${currentCount + 1})`);
    }
  }
  
  // Remove reference (decrement count)
  removeReference(fromId, toId) {
    const fromObj = this.objects.get(fromId);
    
    if (fromObj && fromObj.references.has(toId)) {
      fromObj.references.delete(toId);
      const currentCount = this.referenceCounts.get(toId);
      const newCount = currentCount - 1;
      this.referenceCounts.set(toId, newCount);
      
      console.log(`Removed reference ${fromId} -> ${toId} (count: ${newCount})`);
      
      // Collect object if reference count reaches zero
      if (newCount === 0) {
        this.collectObject(toId);
      }
    }
  }
  
  // Collect object with zero references
  collectObject(objectId) {
    const obj = this.objects.get(objectId);
    if (obj) {
      console.log(`Collecting object ${objectId} (zero references)`);
      
      // Remove references from this object to others
      for (const refId of obj.references) {
        this.removeReference(objectId, refId);
      }
      
      this.objects.delete(objectId);
      this.referenceCounts.delete(objectId);
    }
  }
  
  // Demonstrate circular reference problem
  demonstrateCircularReferences() {
    console.log('\n=== Circular Reference Problem ===');
    
    // Create two objects
    const obj1 = this.createObject({ name: 'Object 1' });
    const obj2 = this.createObject({ name: 'Object 2' });
    
    // Create circular references
    this.addReference(obj1, obj2);
    this.addReference(obj2, obj1);
    
    console.log('\nCurrent reference counts:');
    console.log(`Object ${obj1}: ${this.referenceCounts.get(obj1)} references`);
    console.log(`Object ${obj2}: ${this.referenceCounts.get(obj2)} references`);
    
    // Try to "delete" objects by removing external references
    // In real scenario, these would be the only references
    console.log('\nRemoving external references...');
    
    // Objects still reference each other, so they won't be collected
    console.log('Objects still exist due to circular references:');
    console.log(`Object ${obj1} exists: ${this.objects.has(obj1)}`);
    console.log(`Object ${obj2} exists: ${this.objects.has(obj2)}`);
    
    // Manual cleanup required
    console.log('\nManual cleanup of circular references:');
    this.removeReference(obj1, obj2);
    this.removeReference(obj2, obj1);
  }
  
  // Get current state
  getCurrentState() {
    const state = {
      totalObjects: this.objects.size,
      objects: []
    };
    
    for (const [id, obj] of this.objects) {
      state.objects.push({
        id,
        data: obj.data,
        referenceCount: this.referenceCounts.get(id),
        references: Array.from(obj.references)
      });
    }
    
    return state;
  }
}

// Demonstrate reference counting
const refCountDemo = new ReferenceCountingDemo();

// Create simple reference chain
const root = refCountDemo.createObject({ type: 'root' });
const child1 = refCountDemo.createObject({ type: 'child1' });
const child2 = refCountDemo.createObject({ type: 'child2' });

refCountDemo.addReference(root, child1);
refCountDemo.addReference(root, child2);
refCountDemo.addReference(child1, child2);

console.log('\nState after creating references:');
console.log(refCountDemo.getCurrentState());

// Remove some references
refCountDemo.removeReference(root, child1);
refCountDemo.removeReference(child1, child2);

console.log('\nState after removing some references:');
console.log(refCountDemo.getCurrentState());

// Demonstrate circular reference problem
refCountDemo.demonstrateCircularReferences();
```

## Modern JavaScript GC Optimizations

### Weak References and FinalizationRegistry

```javascript
// weak-references.js - Modern GC features
class WeakReferenceDemo {
  static demonstrateWeakReferences() {
    console.log('=== Weak References Demonstration ===');
    
    // Create target object
    let target = { name: 'Target Object', data: new Array(1000).fill(0) };
    
    // Create weak reference
    const weakRef = new WeakRef(target);
    
    // Create finalization registry
    const registry = new FinalizationRegistry((heldValue) => {
      console.log('Object was garbage collected:', heldValue);
    });
    
    // Register object for finalization
    registry.register(target, 'Target Object Data');
    
    console.log('Weak reference created');
    console.log('Target accessible via weak ref:', weakRef.deref()?.name);
    
    // Remove strong reference
    target = null;
    
    // Try to access via weak reference
    setTimeout(() => {
      const obj = weakRef.deref();
      if (obj) {
        console.log('Object still alive:', obj.name);
      } else {
        console.log('Object has been garbage collected');
      }
    }, 1000);
    
    // Force GC if available
    if (global.gc) {
      setTimeout(() => {
        console.log('Forcing garbage collection...');
        global.gc();
        
        setTimeout(() => {
          const obj = weakRef.deref();
          if (obj) {
            console.log('Object survived GC:', obj.name);
          } else {
            console.log('Object was collected by GC');
          }
        }, 100);
      }, 2000);
    }
  }
  
  static demonstrateWeakCollections() {
    console.log('\n=== Weak Collections Demonstration ===');
    
    // WeakMap example
    const weakMap = new WeakMap();
    const weakSet = new WeakSet();
    
    let obj1 = { id: 1, name: 'Object 1' };
    let obj2 = { id: 2, name: 'Object 2' };
    
    // Add to weak collections
    weakMap.set(obj1, 'metadata for obj1');
    weakMap.set(obj2, 'metadata for obj2');
    weakSet.add(obj1);
    weakSet.add(obj2);
    
    console.log('Objects added to weak collections');
    console.log('WeakMap has obj1:', weakMap.has(obj1));
    console.log('WeakSet has obj1:', weakSet.has(obj1));
    
    // Remove strong references
    obj1 = null;
    
    // obj1 can now be garbage collected
    // WeakMap and WeakSet entries will be automatically removed
    
    console.log('Strong reference to obj1 removed');
    console.log('WeakMap still has obj2:', weakMap.has(obj2));
    console.log('WeakSet still has obj2:', weakSet.has(obj2));
    
    // Clean up
    obj2 = null;
  }
}

// Run weak reference demonstrations
WeakReferenceDemo.demonstrateWeakReferences();
WeakReferenceDemo.demonstrateWeakCollections();
```

## Key Takeaways

* **JavaScript uses automatic garbage collection** to manage memory
* **Mark-and-sweep is the primary GC algorithm** in modern engines
* **Generational GC optimizes** for typical object lifetime patterns
* **Reference counting has circular reference problems** solved by modern GC
* **Weak references allow observation** without preventing collection
* **Understanding GC helps optimize** memory usage patterns
* **Objects become eligible for GC** when no longer reachable
* **GC timing is non-deterministic** and engine-dependent
* **Memory pressure triggers** more frequent garbage collection
* **Modern engines use incremental GC** to reduce pause times
