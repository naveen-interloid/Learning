# **6.2 Observer APIs & Intersection**

Modern browser Observer APIs provide efficient ways to monitor DOM changes, element visibility, size changes, and performance metrics without polling or expensive event handlers.

## MutationObserver

### Basic DOM Change Detection

```javascript
// mutation-observer.js - DOM change monitoring
class DOMChangeMonitor {
  constructor() {
    this.observers = new Map();
    this.changeHistory = [];
    this.maxHistorySize = 1000;
  }
  
  // Create MutationObserver for element
  observeElement(element, options = {}) {
    const defaultOptions = {
      childList: true,
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true,
      subtree: true
    };
    
    const observerOptions = { ...defaultOptions, ...options };
    
    const observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations, element);
    });
    
    observer.observe(element, observerOptions);
    
    const observerId = this.generateObserverId();
    this.observers.set(observerId, {
      observer,
      element,
      options: observerOptions,
      createdAt: new Date()
    });
    
    console.log(`MutationObserver created for:`, element.tagName || element.constructor.name);
    return observerId;
  }
  
  // Handle mutation records
  handleMutations(mutations, element) {
    mutations.forEach(mutation => {
      const changeRecord = {
        type: mutation.type,
        target: mutation.target,
        timestamp: Date.now(),
        elementInfo: this.getElementInfo(mutation.target)
      };
      
      switch (mutation.type) {
        case 'childList':
          changeRecord.addedNodes = Array.from(mutation.addedNodes);
          changeRecord.removedNodes = Array.from(mutation.removedNodes);
          this.logChildListChange(changeRecord);
          break;
          
        case 'attributes':
          changeRecord.attributeName = mutation.attributeName;
          changeRecord.oldValue = mutation.oldValue;
          changeRecord.newValue = mutation.target.getAttribute(mutation.attributeName);
          this.logAttributeChange(changeRecord);
          break;
          
        case 'characterData':
          changeRecord.oldValue = mutation.oldValue;
          changeRecord.newValue = mutation.target.textContent;
          this.logCharacterDataChange(changeRecord);
          break;
      }
      
      this.addToHistory(changeRecord);
    });
  }
  
  // Log different types of changes
  logChildListChange(record) {
    if (record.addedNodes.length > 0) {
      console.log('Nodes added:', record.addedNodes.map(node => 
        node.tagName || node.nodeType === Node.TEXT_NODE ? 'TEXT' : node.constructor.name
      ));
    }
    
    if (record.removedNodes.length > 0) {
      console.log('Nodes removed:', record.removedNodes.map(node => 
        node.tagName || node.nodeType === Node.TEXT_NODE ? 'TEXT' : node.constructor.name
      ));
    }
  }
  
  logAttributeChange(record) {
    console.log(`Attribute changed: ${record.attributeName}`, {
      element: record.elementInfo,
      oldValue: record.oldValue,
      newValue: record.newValue
    });
  }
  
  logCharacterDataChange(record) {
    console.log('Text content changed:', {
      element: record.elementInfo,
      oldValue: record.oldValue,
      newValue: record.newValue
    });
  }
  
  // Get element information
  getElementInfo(element) {
    return {
      tagName: element.tagName,
      id: element.id,
      className: element.className,
      nodeType: element.nodeType
    };
  }
  
  // Add change to history
  addToHistory(record) {
    this.changeHistory.push(record);
    
    if (this.changeHistory.length > this.maxHistorySize) {
      this.changeHistory = this.changeHistory.slice(-this.maxHistorySize);
    }
  }
  
  // Generate observer ID
  generateObserverId() {
    return `observer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Disconnect observer
  disconnect(observerId) {
    const observerData = this.observers.get(observerId);
    if (observerData) {
      observerData.observer.disconnect();
      this.observers.delete(observerId);
      console.log('MutationObserver disconnected');
      return true;
    }
    return false;
  }
  
  // Disconnect all observers
  disconnectAll() {
    for (const observerId of this.observers.keys()) {
      this.disconnect(observerId);
    }
  }
  
  // Get change statistics
  getChangeStats() {
    const stats = {
      totalChanges: this.changeHistory.length,
      changeTypes: {},
      recentChanges: this.changeHistory.slice(-10),
      activeObservers: this.observers.size
    };
    
    this.changeHistory.forEach(record => {
      stats.changeTypes[record.type] = (stats.changeTypes[record.type] || 0) + 1;
    });
    
    return stats;
  }
}

// Usage example
const domMonitor = new DOMChangeMonitor();

// Create test container
const testContainer = document.createElement('div');
testContainer.id = 'test-container';
testContainer.innerHTML = '<p>Initial content</p>';
document.body.appendChild(testContainer);

// Start monitoring
const observerId = domMonitor.observeElement(testContainer);

// Test DOM changes
setTimeout(() => {
  console.log('\n=== Testing DOM Changes ===');
  
  // Add element
  const newDiv = document.createElement('div');
  newDiv.textContent = 'New div added';
  testContainer.appendChild(newDiv);
  
  // Modify attribute
  testContainer.setAttribute('data-test', 'value1');
  
  // Change text content
  const paragraph = testContainer.querySelector('p');
  paragraph.textContent = 'Modified content';
  
  // Remove element after delay
  setTimeout(() => {
    testContainer.removeChild(newDiv);
    
    // Show statistics
    setTimeout(() => {
      console.log('Change statistics:', domMonitor.getChangeStats());
    }, 100);
  }, 1000);
}, 1000);
```

### Advanced Mutation Filtering

```javascript
// advanced-mutation-observer.js - Advanced mutation filtering and processing
class AdvancedMutationObserver {
  constructor() {
    this.filters = new Map();
    this.processors = new Map();
    this.batchSize = 50;
    this.batchTimeout = 100;
    this.pendingMutations = [];
    this.batchTimer = null;
  }
  
  // Create filtered observer
  createFilteredObserver(element, config) {
    const {
      filters = {},
      processors = {},
      batchProcessing = true,
      ...observerOptions
    } = config;
    
    const observer = new MutationObserver((mutations) => {
      if (batchProcessing) {
        this.addToBatch(mutations, filters, processors);
      } else {
        this.processImmediately(mutations, filters, processors);
      }
    });
    
    observer.observe(element, observerOptions);
    return observer;
  }
  
  // Add mutations to batch for processing
  addToBatch(mutations, filters, processors) {
    this.pendingMutations.push(...mutations.map(mutation => ({
      mutation,
      filters,
      processors
    })));
    
    // Clear existing timer
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    
    // Process batch if size limit reached or after timeout
    if (this.pendingMutations.length >= this.batchSize) {
      this.processBatch();
    } else {
      this.batchTimer = setTimeout(() => this.processBatch(), this.batchTimeout);
    }
  }
  
  // Process mutations immediately
  processImmediately(mutations, filters, processors) {
    mutations.forEach(mutation => {
      if (this.passesFilters(mutation, filters)) {
        this.applyProcessors(mutation, processors);
      }
    });
  }
  
  // Process batched mutations
  processBatch() {
    if (this.pendingMutations.length === 0) return;
    
    const batch = this.pendingMutations.splice(0);
    this.batchTimer = null;
    
    console.log(`Processing batch of ${batch.length} mutations`);
    
    // Group by filters and processors for efficient processing
    const groups = new Map();
    
    batch.forEach(({ mutation, filters, processors }) => {
      const key = JSON.stringify({ filters, processors });
      if (!groups.has(key)) {
        groups.set(key, { mutations: [], filters, processors });
      }
      groups.get(key).mutations.push(mutation);
    });
    
    // Process each group
    groups.forEach(({ mutations, filters, processors }) => {
      const filteredMutations = mutations.filter(mutation => 
        this.passesFilters(mutation, filters)
      );
      
      filteredMutations.forEach(mutation => {
        this.applyProcessors(mutation, processors);
      });
    });
  }
  
  // Check if mutation passes filters
  passesFilters(mutation, filters) {
    // Element filters
    if (filters.elements) {
      const elementFilter = filters.elements;
      if (elementFilter.tagNames && !elementFilter.tagNames.includes(mutation.target.tagName)) {
        return false;
      }
      if (elementFilter.classes && !elementFilter.classes.some(cls => 
        mutation.target.classList.contains(cls))) {
        return false;
      }
      if (elementFilter.ids && !elementFilter.ids.includes(mutation.target.id)) {
        return false;
      }
    }
    
    // Attribute filters
    if (filters.attributes && mutation.type === 'attributes') {
      const attrFilter = filters.attributes;
      if (attrFilter.names && !attrFilter.names.includes(mutation.attributeName)) {
        return false;
      }
      if (attrFilter.values && !attrFilter.values.includes(
        mutation.target.getAttribute(mutation.attributeName))) {
        return false;
      }
    }
    
    // Change type filters
    if (filters.changeTypes && !filters.changeTypes.includes(mutation.type)) {
      return false;
    }
    
    // Custom filter function
    if (filters.custom && !filters.custom(mutation)) {
      return false;
    }
    
    return true;
  }
  
  // Apply processors to mutation
  applyProcessors(mutation, processors) {
    if (processors.logger) {
      this.logMutation(mutation, processors.logger);
    }
    
    if (processors.counter) {
      this.countMutation(mutation, processors.counter);
    }
    
    if (processors.validator) {
      this.validateMutation(mutation, processors.validator);
    }
    
    if (processors.custom) {
      processors.custom.forEach(processor => processor(mutation));
    }
  }
  
  // Log mutation with custom format
  logMutation(mutation, loggerConfig) {
    const { level = 'info', format = 'default' } = loggerConfig;
    
    let message;
    switch (format) {
      case 'detailed':
        message = `[${mutation.type.toUpperCase()}] ${this.getDetailedMutationInfo(mutation)}`;
        break;
      case 'compact':
        message = `${mutation.type}:${mutation.target.tagName}`;
        break;
      default:
        message = `Mutation: ${mutation.type} on ${mutation.target.tagName}`;
    }
    
    console[level](message);
  }
  
  // Count mutations
  countMutation(mutation, counterConfig) {
    const { storage = 'memory' } = counterConfig;
    
    if (storage === 'memory') {
      if (!this.mutationCounts) {
        this.mutationCounts = {};
      }
      const key = `${mutation.type}:${mutation.target.tagName}`;
      this.mutationCounts[key] = (this.mutationCounts[key] || 0) + 1;
    }
  }
  
  // Validate mutations
  validateMutation(mutation, validatorConfig) {
    const { rules = [] } = validatorConfig;
    
    rules.forEach(rule => {
      if (!rule.validate(mutation)) {
        console.warn('Mutation validation failed:', rule.message, mutation);
      }
    });
  }
  
  // Get detailed mutation information
  getDetailedMutationInfo(mutation) {
    const info = [`Target: ${mutation.target.tagName}`];
    
    if (mutation.type === 'attributes') {
      info.push(`Attribute: ${mutation.attributeName}`);
      info.push(`Old: ${mutation.oldValue}`);
      info.push(`New: ${mutation.target.getAttribute(mutation.attributeName)}`);
    } else if (mutation.type === 'childList') {
      info.push(`Added: ${mutation.addedNodes.length}`);
      info.push(`Removed: ${mutation.removedNodes.length}`);
    }
    
    return info.join(', ');
  }
  
  // Get mutation counts
  getMutationCounts() {
    return { ...this.mutationCounts };
  }
}

// Usage example
const advancedObserver = new AdvancedMutationObserver();

// Create test area
const advancedTestArea = document.createElement('div');
advancedTestArea.id = 'advanced-test-area';
document.body.appendChild(advancedTestArea);

// Create filtered observer
const filteredObserver = advancedObserver.createFilteredObserver(advancedTestArea, {
  childList: true,
  attributes: true,
  attributeOldValue: true,
  subtree: true,
  
  filters: {
    elements: {
      tagNames: ['DIV', 'SPAN', 'P'],
      classes: ['monitored']
    },
    attributes: {
      names: ['class', 'data-value']
    },
    changeTypes: ['childList', 'attributes']
  },
  
  processors: {
    logger: {
      level: 'info',
      format: 'detailed'
    },
    counter: {
      storage: 'memory'
    },
    validator: {
      rules: [
        {
          validate: (mutation) => mutation.target.tagName !== 'SCRIPT',
          message: 'Script elements should not be dynamically added'
        }
      ]
    },
    custom: [
      (mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          console.log('Class attribute changed on:', mutation.target.tagName);
        }
      }
    ]
  },
  
  batchProcessing: true
});

// Test advanced filtering
setTimeout(() => {
  console.log('\n=== Testing Advanced Mutation Filtering ===');
  
  // This will be monitored (DIV with monitored class)
  const monitoredDiv = document.createElement('div');
  monitoredDiv.className = 'monitored';
  monitoredDiv.textContent = 'Monitored div';
  advancedTestArea.appendChild(monitoredDiv);
  
  // This will be filtered out (no monitored class)
  const unmonitoredDiv = document.createElement('div');
  unmonitoredDiv.textContent = 'Unmonitored div';
  advancedTestArea.appendChild(unmonitoredDiv);
  
  // This will be monitored (class attribute change)
  setTimeout(() => {
    monitoredDiv.setAttribute('data-value', 'test');
    monitoredDiv.className = 'monitored updated';
    
    // Show counts after processing
    setTimeout(() => {
      console.log('Mutation counts:', advancedObserver.getMutationCounts());
    }, 200);
  }, 500);
}, 1000);
```

## IntersectionObserver

### Visibility Detection and Lazy Loading

```javascript
// intersection-observer.js - Visibility detection and lazy loading
class VisibilityManager {
  constructor() {
    this.observers = new Map();
    this.visibilityCallbacks = new Map();
    this.lazyLoadQueue = new Set();
  }
  
  // Create intersection observer
  createIntersectionObserver(options = {}) {
    const defaultOptions = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: [0, 0.25, 0.5, 0.75, 1.0]
    };
    
    const observerOptions = { ...defaultOptions, ...options };
    
    const observer = new IntersectionObserver((entries) => {
      this.handleIntersections(entries);
    }, observerOptions);
    
    const observerId = this.generateObserverId();
    this.observers.set(observerId, {
      observer,
      options: observerOptions,
      elements: new Set(),
      createdAt: new Date()
    });
    
    return observerId;
  }
  
  // Observe element for visibility changes
  observeVisibility(observerId, element, callback) {
    const observerData = this.observers.get(observerId);
    if (!observerData) {
      throw new Error('Observer not found');
    }
    
    observerData.observer.observe(element);
    observerData.elements.add(element);
    
    // Store callback
    const callbackId = `${observerId}_${this.generateElementId(element)}`;
    this.visibilityCallbacks.set(callbackId, {
      element,
      callback,
      observerId
    });
    
    return callbackId;
  }
  
  // Handle intersection changes
  handleIntersections(entries) {
    entries.forEach(entry => {
      const element = entry.target;
      const observerId = this.findObserverIdForElement(element);
      
      if (observerId) {
        const callbackId = `${observerId}_${this.generateElementId(element)}`;
        const callbackData = this.visibilityCallbacks.get(callbackId);
        
        if (callbackData) {
          const visibilityInfo = {
            isVisible: entry.isIntersecting,
            visibilityRatio: entry.intersectionRatio,
            boundingRect: entry.boundingClientRect,
            intersectionRect: entry.intersectionRect,
            rootBounds: entry.rootBounds,
            time: entry.time
          };
          
          try {
            callbackData.callback(element, visibilityInfo);
          } catch (error) {
            console.error('Visibility callback error:', error);
          }
        }
      }
    });
  }
  
  // Create lazy loading observer
  createLazyLoader(options = {}) {
    const {
      rootMargin = '50px',
      threshold = 0.1,
      loadingClass = 'loading',
      loadedClass = 'loaded',
      errorClass = 'error'
    } = options;
    
    const observerId = this.createIntersectionObserver({
      rootMargin,
      threshold: [threshold]
    });
    
    return {
      observerId,
      addLazyElement: (element, loadFunction) => {
        this.observeVisibility(observerId, element, async (el, visibility) => {
          if (visibility.isVisible && !el.classList.contains(loadedClass)) {
            el.classList.add(loadingClass);
            
            try {
              await loadFunction(el);
              el.classList.remove(loadingClass);
              el.classList.add(loadedClass);
              
              // Stop observing this element
              this.unobserveElement(observerId, el);
            } catch (error) {
              console.error('Lazy loading failed:', error);
              el.classList.remove(loadingClass);
              el.classList.add(errorClass);
            }
          }
        });
      }
    };
  }
  
  // Create viewport analytics observer
  createViewportAnalytics(options = {}) {
    const {
      thresholds = [0.1, 0.25, 0.5, 0.75, 1.0],
      trackingCallback = null
    } = options;
    
    const observerId = this.createIntersectionObserver({
      threshold: thresholds
    });
    
    const analytics = {
      elementViews: new Map(),
      totalViews: 0,
      averageViewTime: 0
    };
    
    return {
      observerId,
      analytics,
      trackElement: (element, metadata = {}) => {
        const elementId = this.generateElementId(element);
        analytics.elementViews.set(elementId, {
          element,
          metadata,
          viewStartTime: null,
          totalViewTime: 0,
          maxVisibility: 0,
          viewCount: 0
        });
        
        this.observeVisibility(observerId, element, (el, visibility) => {
          const viewData = analytics.elementViews.get(elementId);
          
          if (visibility.isVisible) {
            if (!viewData.viewStartTime) {
              viewData.viewStartTime = Date.now();
              viewData.viewCount++;
              analytics.totalViews++;
            }
            
            viewData.maxVisibility = Math.max(viewData.maxVisibility, visibility.visibilityRatio);
          } else {
            if (viewData.viewStartTime) {
              const viewDuration = Date.now() - viewData.viewStartTime;
              viewData.totalViewTime += viewDuration;
              viewData.viewStartTime = null;
              
              // Update average
              const totalViewTime = Array.from(analytics.elementViews.values())
                .reduce((sum, data) => sum + data.totalViewTime, 0);
              analytics.averageViewTime = totalViewTime / analytics.totalViews;
              
              if (trackingCallback) {
                trackingCallback({
                  element: el,
                  viewDuration,
                  totalViewTime: viewData.totalViewTime,
                  maxVisibility: viewData.maxVisibility,
                  viewCount: viewData.viewCount
                });
              }
            }
          }
        });
      },
      getAnalytics: () => ({ ...analytics })
    };
  }
  
  // Utility methods
  generateObserverId() {
    return `observer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  generateElementId(element) {
    return element.id || `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  findObserverIdForElement(element) {
    for (const [observerId, observerData] of this.observers) {
      if (observerData.elements.has(element)) {
        return observerId;
      }
    }
    return null;
  }
  
  unobserveElement(observerId, element) {
    const observerData = this.observers.get(observerId);
    if (observerData) {
      observerData.observer.unobserve(element);
      observerData.elements.delete(element);
      
      const callbackId = `${observerId}_${this.generateElementId(element)}`;
      this.visibilityCallbacks.delete(callbackId);
    }
  }
  
  disconnect(observerId) {
    const observerData = this.observers.get(observerId);
    if (observerData) {
      observerData.observer.disconnect();
      
      // Clean up callbacks
      for (const element of observerData.elements) {
        const callbackId = `${observerId}_${this.generateElementId(element)}`;
        this.visibilityCallbacks.delete(callbackId);
      }
      
      this.observers.delete(observerId);
      return true;
    }
    return false;
  }
}

// Usage examples
const visibilityManager = new VisibilityManager();

// Create lazy loading example
const lazyLoader = visibilityManager.createLazyLoader({
  rootMargin: '100px',
  threshold: 0.1
});

// Create lazy-loaded images
for (let i = 1; i <= 5; i++) {
  const img = document.createElement('img');
  img.style.cssText = 'width: 300px; height: 200px; display: block; margin: 20px; background: #f0f0f0;';
  img.alt = `Lazy image ${i}`;
  img.dataset.src = `https://picsum.photos/300/200?random=${i}`;
  
  document.body.appendChild(img);
  
  lazyLoader.addLazyElement(img, async (element) => {
    return new Promise((resolve, reject) => {
      const actualImg = new Image();
      actualImg.onload = () => {
        element.src = actualImg.src;
        resolve();
      };
      actualImg.onerror = reject;
      actualImg.src = element.dataset.src;
    });
  });
}

// Create viewport analytics
const viewportAnalytics = visibilityManager.createViewportAnalytics({
  thresholds: [0.1, 0.5, 1.0],
  trackingCallback: (data) => {
    console.log('Element view completed:', {
      element: data.element.tagName,
      viewDuration: `${data.viewDuration}ms`,
      maxVisibility: `${(data.maxVisibility * 100).toFixed(1)}%`,
      viewCount: data.viewCount
    });
  }
});

// Track some elements for analytics
const trackingElements = document.querySelectorAll('img');
trackingElements.forEach((element, index) => {
  viewportAnalytics.trackElement(element, { type: 'image', index });
});

// Show analytics after some time
setTimeout(() => {
  console.log('Viewport Analytics:', viewportAnalytics.getAnalytics());
}, 10000);
```

## Key Takeaways

* **MutationObserver efficiently monitors DOM changes** without polling
* **IntersectionObserver detects element visibility** for lazy loading and analytics
* **ResizeObserver tracks element size changes** for responsive components
* **PerformanceObserver monitors performance metrics** for optimization
* **Batch processing improves performance** for high-frequency observations
* **Proper cleanup prevents memory leaks** by disconnecting observers
* **Filtering reduces noise** and improves processing efficiency
* **Observer APIs are more performant** than traditional event-based monitoring
* **Threshold configuration controls** when callbacks are triggered
* **Modern browsers have excellent support** for all major Observer APIs
