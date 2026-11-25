# **6.1 Event System & Delegation**

The DOM event system is fundamental to interactive web applications. Understanding event flow, delegation patterns, and performance optimization techniques is crucial for building responsive user interfaces.

## Event Flow and Phases

### Event Propagation Mechanics

```javascript
// event-propagation.js - Understanding event flow
class EventFlowDemo {
  static setupEventFlowExample() {
    console.log('=== Event Flow Demonstration ===');
    
    // Create nested elements
    const outer = document.createElement('div');
    outer.id = 'outer';
    outer.style.cssText = 'padding: 20px; background: lightblue; cursor: pointer;';
    outer.textContent = 'Outer Element';
    
    const middle = document.createElement('div');
    middle.id = 'middle';
    middle.style.cssText = 'padding: 20px; background: lightgreen; cursor: pointer;';
    middle.textContent = 'Middle Element';
    
    const inner = document.createElement('div');
    inner.id = 'inner';
    inner.style.cssText = 'padding: 20px; background: lightcoral; cursor: pointer;';
    inner.textContent = 'Inner Element (Click me!)';
    
    // Nest elements
    middle.appendChild(inner);
    outer.appendChild(middle);
    document.body.appendChild(outer);
    
    // Add event listeners for all phases
    [outer, middle, inner].forEach(element => {
      // Capturing phase (third parameter = true)
      element.addEventListener('click', (event) => {
        console.log(`CAPTURING: ${element.id} - target: ${event.target.id}, currentTarget: ${event.currentTarget.id}`);
      }, true);
      
      // Bubbling phase (default)
      element.addEventListener('click', (event) => {
        console.log(`BUBBLING: ${element.id} - target: ${event.target.id}, currentTarget: ${event.currentTarget.id}`);
      }, false);
    });
    
    // Demonstrate event methods
    inner.addEventListener('click', (event) => {
      console.log('\n--- Event Control Methods ---');
      console.log('event.stopPropagation() - stops further propagation');
      console.log('event.stopImmediatePropagation() - stops all remaining listeners');
      console.log('event.preventDefault() - prevents default behavior');
      
      // Uncomment to test:
      // event.stopPropagation(); // Stops bubbling to parent elements
      // event.preventDefault(); // Prevents default click behavior
    });
  }
  
  static demonstrateEventProperties() {
    console.log('\n=== Event Object Properties ===');
    
    document.addEventListener('click', (event) => {
      const eventInfo = {
        type: event.type,
        target: event.target.tagName,
        currentTarget: event.currentTarget.tagName,
        eventPhase: this.getPhaseDescription(event.eventPhase),
        bubbles: event.bubbles,
        cancelable: event.cancelable,
        defaultPrevented: event.defaultPrevented,
        isTrusted: event.isTrusted,
        timeStamp: event.timeStamp,
        clientX: event.clientX,
        clientY: event.clientY,
        pageX: event.pageX,
        pageY: event.pageY,
        screenX: event.screenX,
        screenY: event.screenY,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        altKey: event.altKey,
        metaKey: event.metaKey
      };
      
      console.log('Event Properties:', eventInfo);
    }, { once: true }); // Remove after first execution
  }
  
  static getPhaseDescription(phase) {
    const phases = {
      0: 'NONE',
      1: 'CAPTURING_PHASE',
      2: 'AT_TARGET',
      3: 'BUBBLING_PHASE'
    };
    return phases[phase] || 'UNKNOWN';
  }
}

// Initialize event flow demo
EventFlowDemo.setupEventFlowExample();
EventFlowDemo.demonstrateEventProperties();
```

### Advanced Event Handling Patterns

```javascript
// advanced-event-patterns.js - Advanced event handling techniques
class AdvancedEventHandling {
  constructor() {
    this.eventListeners = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
  }
  
  // Enhanced event listener with metadata
  addListener(element, eventType, handler, options = {}) {
    const listenerId = this.generateListenerId();
    const enhancedOptions = {
      once: false,
      passive: false,
      capture: false,
      signal: null,
      ...options
    };
    
    // Wrap handler with additional functionality
    const wrappedHandler = (event) => {
      // Add to event history
      this.addToHistory(event, listenerId);
      
      // Performance timing
      const startTime = performance.now();
      
      try {
        // Call original handler
        const result = handler.call(element, event);
        
        // Log performance
        const endTime = performance.now();
        if (endTime - startTime > 16) { // > 1 frame at 60fps
          console.warn(`Slow event handler (${(endTime - startTime).toFixed(2)}ms):`, eventType, listenerId);
        }
        
        return result;
      } catch (error) {
        console.error('Event handler error:', error, { eventType, listenerId });
        throw error;
      }
    };
    
    // Add event listener
    element.addEventListener(eventType, wrappedHandler, enhancedOptions);
    
    // Store metadata
    this.eventListeners.set(listenerId, {
      element,
      eventType,
      handler: wrappedHandler,
      originalHandler: handler,
      options: enhancedOptions,
      addedAt: new Date()
    });
    
    return listenerId;
  }
  
  // Remove event listener
  removeListener(listenerId) {
    const listenerData = this.eventListeners.get(listenerId);
    if (listenerData) {
      listenerData.element.removeEventListener(
        listenerData.eventType,
        listenerData.handler,
        listenerData.options
      );
      this.eventListeners.delete(listenerId);
      return true;
    }
    return false;
  }
  
  // Remove all listeners for an element
  removeAllListeners(element) {
    let removedCount = 0;
    for (const [listenerId, listenerData] of this.eventListeners) {
      if (listenerData.element === element) {
        this.removeListener(listenerId);
        removedCount++;
      }
    }
    return removedCount;
  }
  
  // Generate unique listener ID
  generateListenerId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Add event to history
  addToHistory(event, listenerId) {
    this.eventHistory.push({
      type: event.type,
      target: event.target.tagName || event.target.constructor.name,
      listenerId,
      timestamp: Date.now(),
      coordinates: event.clientX !== undefined ? { x: event.clientX, y: event.clientY } : null
    });
    
    // Limit history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }
  }
  
  // Get event statistics
  getEventStats() {
    const stats = {
      totalListeners: this.eventListeners.size,
      eventTypes: {},
      elements: {},
      recentEvents: this.eventHistory.slice(-10)
    };
    
    // Count by event type
    for (const listenerData of this.eventListeners.values()) {
      stats.eventTypes[listenerData.eventType] = (stats.eventTypes[listenerData.eventType] || 0) + 1;
      
      const elementType = listenerData.element.tagName || listenerData.element.constructor.name;
      stats.elements[elementType] = (stats.elements[elementType] || 0) + 1;
    }
    
    return stats;
  }
  
  // Cleanup all listeners
  cleanup() {
    for (const listenerId of this.eventListeners.keys()) {
      this.removeListener(listenerId);
    }
    this.eventHistory = [];
  }
}

// Create enhanced event handler
const eventManager = new AdvancedEventHandling();

// Usage examples
const button = document.createElement('button');
button.textContent = 'Enhanced Event Button';
document.body.appendChild(button);

// Add enhanced event listener
const listenerId = eventManager.addListener(button, 'click', function(event) {
  console.log('Button clicked with enhanced handling!');
  console.log('Event stats:', eventManager.getEventStats());
}, { once: false, passive: false });

// Add multiple listeners
eventManager.addListener(document, 'mousemove', function(event) {
  // This will trigger performance warnings if it takes too long
  // Simulate slow operation occasionally
  if (Math.random() < 0.01) {
    const start = Date.now();
    while (Date.now() - start < 20) {} // Block for 20ms
  }
}, { passive: true });

// Cleanup example
setTimeout(() => {
  console.log('Cleaning up event listeners...');
  eventManager.cleanup();
}, 10000);
```

## Event Delegation Patterns

### Basic Event Delegation

```javascript
// event-delegation.js - Event delegation patterns
class EventDelegation {
  constructor(container) {
    this.container = container;
    this.delegatedHandlers = new Map();
    this.setupDelegation();
  }
  
  setupDelegation() {
    // Single event listener for all delegated events
    this.container.addEventListener('click', this.handleDelegatedClick.bind(this));
    this.container.addEventListener('change', this.handleDelegatedChange.bind(this));
    this.container.addEventListener('input', this.handleDelegatedInput.bind(this));
    this.container.addEventListener('submit', this.handleDelegatedSubmit.bind(this));
  }
  
  // Register delegated event handler
  on(selector, eventType, handler) {
    const key = `${eventType}:${selector}`;
    if (!this.delegatedHandlers.has(key)) {
      this.delegatedHandlers.set(key, []);
    }
    this.delegatedHandlers.get(key).push(handler);
  }
  
  // Unregister delegated event handler
  off(selector, eventType, handler) {
    const key = `${eventType}:${selector}`;
    const handlers = this.delegatedHandlers.get(key);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        if (handlers.length === 0) {
          this.delegatedHandlers.delete(key);
        }
      }
    }
  }
  
  // Handle delegated click events
  handleDelegatedClick(event) {
    this.executeHandlers('click', event);
  }
  
  // Handle delegated change events
  handleDelegatedChange(event) {
    this.executeHandlers('change', event);
  }
  
  // Handle delegated input events
  handleDelegatedInput(event) {
    this.executeHandlers('input', event);
  }
  
  // Handle delegated submit events
  handleDelegatedSubmit(event) {
    this.executeHandlers('submit', event);
  }
  
  // Execute matching handlers
  executeHandlers(eventType, event) {
    for (const [key, handlers] of this.delegatedHandlers) {
      const [type, selector] = key.split(':');
      
      if (type === eventType) {
        // Check if event target matches selector
        const matchingElement = this.findMatchingElement(event.target, selector);
        if (matchingElement) {
          handlers.forEach(handler => {
            try {
              handler.call(matchingElement, event, matchingElement);
            } catch (error) {
              console.error('Delegated event handler error:', error);
            }
          });
        }
      }
    }
  }
  
  // Find element that matches selector (bubbling up)
  findMatchingElement(element, selector) {
    let current = element;
    
    while (current && current !== this.container) {
      if (current.matches && current.matches(selector)) {
        return current;
      }
      current = current.parentElement;
    }
    
    return null;
  }
  
  // Get delegation statistics
  getStats() {
    const stats = {
      totalHandlers: 0,
      eventTypes: {},
      selectors: {}
    };
    
    for (const [key, handlers] of this.delegatedHandlers) {
      const [eventType, selector] = key.split(':');
      stats.totalHandlers += handlers.length;
      stats.eventTypes[eventType] = (stats.eventTypes[eventType] || 0) + handlers.length;
      stats.selectors[selector] = (stats.selectors[selector] || 0) + handlers.length;
    }
    
    return stats;
  }
}

// Usage example
const appContainer = document.createElement('div');
appContainer.id = 'app-container';
document.body.appendChild(appContainer);

const delegator = new EventDelegation(appContainer);

// Add delegated event handlers
delegator.on('.btn-primary', 'click', function(event, element) {
  console.log('Primary button clicked:', element.textContent);
});

delegator.on('.btn-secondary', 'click', function(event, element) {
  console.log('Secondary button clicked:', element.textContent);
});

delegator.on('input[type="text"]', 'input', function(event, element) {
  console.log('Text input changed:', element.value);
});

delegator.on('form', 'submit', function(event, element) {
  event.preventDefault();
  console.log('Form submitted:', element.id);
});

// Create dynamic content
function addDynamicContent() {
  const content = `
    <div>
      <button class="btn-primary">Primary Button 1</button>
      <button class="btn-secondary">Secondary Button 1</button>
      <input type="text" placeholder="Type something...">
      <form id="test-form">
        <input type="text" name="username" placeholder="Username">
        <button type="submit">Submit</button>
      </form>
    </div>
  `;
  
  appContainer.innerHTML = content;
}

// Add content and test delegation
addDynamicContent();

// Add more content dynamically
setTimeout(() => {
  const newButton = document.createElement('button');
  newButton.className = 'btn-primary';
  newButton.textContent = 'Dynamic Primary Button';
  appContainer.appendChild(newButton);
  
  console.log('Delegation stats:', delegator.getStats());
}, 2000);
```

### Advanced Delegation with Custom Events

```javascript
// custom-event-delegation.js - Custom events with delegation
class CustomEventSystem {
  constructor(container) {
    this.container = container;
    this.customEventHandlers = new Map();
    this.eventQueue = [];
    this.processing = false;
    
    this.setupCustomEventDelegation();
  }
  
  setupCustomEventDelegation() {
    // Listen for custom events
    this.container.addEventListener('customEvent', this.handleCustomEvent.bind(this));
  }
  
  // Register custom event handler
  onCustom(eventName, selector, handler) {
    const key = `${eventName}:${selector}`;
    if (!this.customEventHandlers.has(key)) {
      this.customEventHandlers.set(key, []);
    }
    this.customEventHandlers.get(key).push(handler);
  }
  
  // Dispatch custom event
  dispatch(eventName, element, data = {}) {
    const customEvent = new CustomEvent('customEvent', {
      bubbles: true,
      cancelable: true,
      detail: {
        eventName,
        originalTarget: element,
        data
      }
    });
    
    element.dispatchEvent(customEvent);
  }
  
  // Queue custom event for batch processing
  queueEvent(eventName, element, data = {}) {
    this.eventQueue.push({ eventName, element, data });
    this.processQueue();
  }
  
  // Process event queue
  async processQueue() {
    if (this.processing || this.eventQueue.length === 0) {
      return;
    }
    
    this.processing = true;
    
    // Process events in batches
    while (this.eventQueue.length > 0) {
      const batch = this.eventQueue.splice(0, 10); // Process 10 at a time
      
      for (const { eventName, element, data } of batch) {
        this.dispatch(eventName, element, data);
      }
      
      // Yield control to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    this.processing = false;
  }
  
  // Handle custom event delegation
  handleCustomEvent(event) {
    const { eventName, originalTarget, data } = event.detail;
    
    for (const [key, handlers] of this.customEventHandlers) {
      const [name, selector] = key.split(':');
      
      if (name === eventName) {
        const matchingElement = this.findMatchingElement(originalTarget, selector);
        if (matchingElement) {
          handlers.forEach(handler => {
            try {
              handler.call(matchingElement, {
                ...event,
                target: originalTarget,
                currentTarget: matchingElement,
                data
              });
            } catch (error) {
              console.error('Custom event handler error:', error);
            }
          });
        }
      }
    }
  }
  
  // Find matching element (same as before)
  findMatchingElement(element, selector) {
    let current = element;
    
    while (current && current !== this.container) {
      if (current.matches && current.matches(selector)) {
        return current;
      }
      current = current.parentElement;
    }
    
    return null;
  }
  
  // Create event emitter for elements
  createEmitter(element) {
    return {
      emit: (eventName, data) => this.dispatch(eventName, element, data),
      queue: (eventName, data) => this.queueEvent(eventName, element, data),
      on: (eventName, handler) => {
        const selector = this.getElementSelector(element);
        this.onCustom(eventName, selector, handler);
      }
    };
  }
  
  // Generate selector for element
  getElementSelector(element) {
    if (element.id) {
      return `#${element.id}`;
    }
    
    if (element.className) {
      return `.${element.className.split(' ').join('.')}`;
    }
    
    return element.tagName.toLowerCase();
  }
}

// Usage example
const customEventContainer = document.createElement('div');
customEventContainer.id = 'custom-event-container';
document.body.appendChild(customEventContainer);

const customEvents = new CustomEventSystem(customEventContainer);

// Register custom event handlers
customEvents.onCustom('dataLoaded', '.data-component', function(event) {
  console.log('Data loaded in component:', event.data);
  this.classList.add('loaded');
});

customEvents.onCustom('userAction', '.interactive-element', function(event) {
  console.log('User action on element:', event.data.action);
});

customEvents.onCustom('stateChange', '*', function(event) {
  console.log('State changed:', event.data.newState);
});

// Create test elements
const dataComponent = document.createElement('div');
dataComponent.className = 'data-component';
dataComponent.textContent = 'Data Component';
customEventContainer.appendChild(dataComponent);

const interactiveElement = document.createElement('button');
interactiveElement.className = 'interactive-element';
interactiveElement.textContent = 'Interactive Button';
customEventContainer.appendChild(interactiveElement);

// Create emitters
const dataEmitter = customEvents.createEmitter(dataComponent);
const interactiveEmitter = customEvents.createEmitter(interactiveElement);

// Dispatch custom events
setTimeout(() => {
  dataEmitter.emit('dataLoaded', { items: 10, source: 'api' });
}, 1000);

setTimeout(() => {
  interactiveEmitter.emit('userAction', { action: 'click', timestamp: Date.now() });
}, 2000);

// Queue multiple events
for (let i = 0; i < 5; i++) {
  customEvents.queueEvent('stateChange', dataComponent, { newState: `state-${i}` });
}
```

## Performance Optimization

### Event Throttling and Debouncing

```javascript
// event-optimization.js - Performance optimization techniques
class EventOptimization {
  // Throttle function - limits execution frequency
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
  
  // Debounce function - delays execution until after delay
  static debounce(func, delay) {
    let timeoutId;
    return function(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }
  
  // Advanced throttle with leading and trailing options
  static advancedThrottle(func, limit, options = {}) {
    const { leading = true, trailing = true } = options;
    let timeout;
    let previous = 0;
    let result;
    
    const later = function(context, args) {
      previous = leading === false ? 0 : Date.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    
    return function(...args) {
      const now = Date.now();
      if (!previous && leading === false) previous = now;
      const remaining = limit - (now - previous);
      
      if (remaining <= 0 || remaining > limit) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(this, args);
        if (!timeout) args = null;
      } else if (!timeout && trailing !== false) {
        timeout = setTimeout(() => later(this, args), remaining);
      }
      
      return result;
    };
  }
  
  // Passive event listener helper
  static addPassiveListener(element, eventType, handler) {
    element.addEventListener(eventType, handler, { passive: true });
  }
  
  // Batch DOM operations
  static batchDOMOperations(operations) {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        operations.forEach(op => op());
        resolve();
      });
    });
  }
  
  // Performance monitoring for event handlers
  static monitorEventPerformance(element, eventType, handler, threshold = 16) {
    const monitoredHandler = function(event) {
      const start = performance.now();
      const result = handler.call(this, event);
      const end = performance.now();
      const duration = end - start;
      
      if (duration > threshold) {
        console.warn(`Slow event handler detected:`, {
          eventType,
          duration: `${duration.toFixed(2)}ms`,
          element: element.tagName || element.constructor.name,
          threshold: `${threshold}ms`
        });
      }
      
      return result;
    };
    
    element.addEventListener(eventType, monitoredHandler);
    return monitoredHandler;
  }
}

// Usage examples
console.log('=== Event Optimization Examples ===');

// Throttled scroll handler
const throttledScrollHandler = EventOptimization.throttle((event) => {
  console.log('Throttled scroll:', window.scrollY);
}, 100);

window.addEventListener('scroll', throttledScrollHandler);

// Debounced input handler
const debouncedInputHandler = EventOptimization.debounce((event) => {
  console.log('Debounced input:', event.target.value);
}, 300);

const searchInput = document.createElement('input');
searchInput.type = 'text';
searchInput.placeholder = 'Search (debounced)...';
searchInput.addEventListener('input', debouncedInputHandler);
document.body.appendChild(searchInput);

// Advanced throttled resize handler
const advancedThrottledResize = EventOptimization.advancedThrottle((event) => {
  console.log('Advanced throttled resize:', window.innerWidth, window.innerHeight);
}, 250, { leading: true, trailing: true });

window.addEventListener('resize', advancedThrottledResize);

// Passive touch event listener
const touchArea = document.createElement('div');
touchArea.style.cssText = 'width: 200px; height: 200px; background: lightgray; touch-action: none;';
touchArea.textContent = 'Touch Area';
document.body.appendChild(touchArea);

EventOptimization.addPassiveListener(touchArea, 'touchmove', (event) => {
  // This won't block scrolling
  console.log('Passive touch move');
});

// Monitored click handler
const monitoredButton = document.createElement('button');
monitoredButton.textContent = 'Monitored Button';
document.body.appendChild(monitoredButton);

EventOptimization.monitorEventPerformance(monitoredButton, 'click', function(event) {
  // Simulate slow operation
  const start = Date.now();
  while (Date.now() - start < 20) {} // Block for 20ms
  console.log('Slow button click processed');
}, 10); // 10ms threshold

// Batch DOM operations example
const batchButton = document.createElement('button');
batchButton.textContent = 'Batch DOM Operations';
batchButton.addEventListener('click', () => {
  const operations = [];
  
  // Prepare batch operations
  for (let i = 0; i < 10; i++) {
    operations.push(() => {
      const div = document.createElement('div');
      div.textContent = `Batch item ${i}`;
      div.style.padding = '5px';
      div.style.margin = '2px';
      div.style.background = `hsl(${i * 36}, 50%, 80%)`;
      document.body.appendChild(div);
    });
  }
  
  // Execute batch
  EventOptimization.batchDOMOperations(operations).then(() => {
    console.log('Batch DOM operations completed');
  });
});

document.body.appendChild(batchButton);
```

## Key Takeaways

* **Event flow has three phases** - capturing, target, and bubbling
* **Event delegation reduces memory usage** and handles dynamic content
* **Custom events enable component communication** without tight coupling
* **Throttling and debouncing optimize** high-frequency event handlers
* **Passive listeners improve scroll performance** by not blocking default behavior
* **Event cleanup prevents memory leaks** in single-page applications
* **Performance monitoring helps identify** slow event handlers
* **Batch DOM operations** reduce layout thrashing and improve performance
* **Event delegation patterns** scale better than individual listeners
* **Understanding event propagation** is crucial for complex interactions
