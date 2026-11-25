# **6.4 Web Components & Shadow DOM**

Web Components provide a way to create reusable, encapsulated HTML elements with their own styling and behavior. They consist of Custom Elements, Shadow DOM, and HTML Templates.

## Custom Elements

### Basic Custom Element Creation

```javascript
// custom-elements.js - Basic custom element implementation
class BasicButton extends HTMLElement {
  constructor() {
    super();
    
    // Initialize properties
    this.clickCount = 0;
    this.disabled = false;
    
    // Bind methods
    this.handleClick = this.handleClick.bind(this);
  }
  
  // Called when element is added to DOM
  connectedCallback() {
    console.log('BasicButton connected to DOM');
    
    // Set up initial HTML
    this.innerHTML = `
      <button class="custom-button">
        ${this.getAttribute('text') || 'Click me'}
      </button>
      <span class="click-count">Clicks: ${this.clickCount}</span>
    `;
    
    // Add event listeners
    this.querySelector('button').addEventListener('click', this.handleClick);
    
    // Apply initial attributes
    this.updateFromAttributes();
  }
  
  // Called when element is removed from DOM
  disconnectedCallback() {
    console.log('BasicButton disconnected from DOM');
    
    // Clean up event listeners
    const button = this.querySelector('button');
    if (button) {
      button.removeEventListener('click', this.handleClick);
    }
  }
  
  // Called when attributes change
  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute ${name} changed: ${oldValue} -> ${newValue}`);
    
    if (this.isConnected) {
      this.updateFromAttributes();
    }
  }
  
  // Called when element is moved to new document
  adoptedCallback() {
    console.log('BasicButton adopted by new document');
  }
  
  // Define which attributes to observe
  static get observedAttributes() {
    return ['text', 'disabled', 'variant'];
  }
  
  // Handle button clicks
  handleClick(event) {
    if (this.disabled) {
      event.preventDefault();
      return;
    }
    
    this.clickCount++;
    this.updateClickCount();
    
    // Dispatch custom event
    this.dispatchEvent(new CustomEvent('button-clicked', {
      detail: {
        clickCount: this.clickCount,
        timestamp: Date.now()
      },
      bubbles: true
    }));
  }
  
  // Update from attributes
  updateFromAttributes() {
    const button = this.querySelector('button');
    if (!button) return;
    
    // Update text
    const text = this.getAttribute('text');
    if (text) {
      button.textContent = text;
    }
    
    // Update disabled state
    this.disabled = this.hasAttribute('disabled');
    button.disabled = this.disabled;
    
    // Update variant class
    const variant = this.getAttribute('variant');
    button.className = `custom-button ${variant ? `custom-button--${variant}` : ''}`;
  }
  
  // Update click count display
  updateClickCount() {
    const countSpan = this.querySelector('.click-count');
    if (countSpan) {
      countSpan.textContent = `Clicks: ${this.clickCount}`;
    }
  }
  
  // Public API methods
  reset() {
    this.clickCount = 0;
    this.updateClickCount();
  }
  
  setDisabled(disabled) {
    if (disabled) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
  }
  
  setText(text) {
    this.setAttribute('text', text);
  }
}

// Register the custom element
customElements.define('basic-button', BasicButton);

// Advanced custom element with more features
class AdvancedCard extends HTMLElement {
  constructor() {
    super();
    
    this.state = {
      expanded: false,
      loading: false,
      data: null
    };
    
    // Create shadow root for encapsulation
    this.attachShadow({ mode: 'open' });
  }
  
  connectedCallback() {
    this.render();
    this.setupEventListeners();
    
    // Load data if data-src attribute is present
    const dataSrc = this.getAttribute('data-src');
    if (dataSrc) {
      this.loadData(dataSrc);
    }
  }
  
  disconnectedCallback() {
    this.cleanup();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    if (this.shadowRoot && oldValue !== newValue) {
      this.render();
    }
  }
  
  static get observedAttributes() {
    return ['title', 'subtitle', 'image', 'expandable', 'data-src'];
  }
  
  // Render the component
  render() {
    const title = this.getAttribute('title') || 'Card Title';
    const subtitle = this.getAttribute('subtitle') || '';
    const image = this.getAttribute('image') || '';
    const expandable = this.hasAttribute('expandable');
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: box-shadow 0.3s ease;
          max-width: 400px;
        }
        
        :host(:hover) {
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        
        :host([loading]) {
          opacity: 0.6;
          pointer-events: none;
        }
        
        .card-header {
          padding: 16px;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
        }
        
        .card-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
          display: block;
        }
        
        .card-title {
          margin: 0 0 8px 0;
          font-size: 1.25rem;
          font-weight: bold;
          color: #333;
        }
        
        .card-subtitle {
          margin: 0;
          font-size: 0.9rem;
          color: #666;
        }
        
        .card-content {
          padding: 16px;
        }
        
        .card-actions {
          padding: 16px;
          border-top: 1px solid #eee;
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        
        .expand-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
        }
        
        .expand-button:hover {
          background: #0056b3;
        }
        
        .expanded-content {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        
        .expanded-content.open {
          max-height: 500px;
        }
        
        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid #f3f3f3;
          border-top: 2px solid #007bff;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .error-message {
          color: #dc3545;
          font-size: 0.9rem;
          padding: 8px;
          background: #f8d7da;
          border-radius: 4px;
          margin: 8px 0;
        }
      </style>
      
      <div class="card">
        ${image ? `<img src="${image}" alt="${title}" class="card-image">` : ''}
        
        <div class="card-header">
          <h3 class="card-title">${title}</h3>
          ${subtitle ? `<p class="card-subtitle">${subtitle}</p>` : ''}
        </div>
        
        <div class="card-content">
          <slot name="content">Default content goes here</slot>
          
          ${this.state.loading ? '<div class="loading-spinner"></div>' : ''}
          
          <div class="expanded-content ${this.state.expanded ? 'open' : ''}">
            <slot name="expanded">Expanded content goes here</slot>
            ${this.state.data ? `<pre>${JSON.stringify(this.state.data, null, 2)}</pre>` : ''}
          </div>
        </div>
        
        ${expandable ? `
          <div class="card-actions">
            <button class="expand-button" data-action="toggle">
              ${this.state.expanded ? 'Collapse' : 'Expand'}
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  // Set up event listeners
  setupEventListeners() {
    this.shadowRoot.addEventListener('click', (event) => {
      const action = event.target.dataset.action;
      
      if (action === 'toggle') {
        this.toggle();
      }
    });
  }
  
  // Load external data
  async loadData(url) {
    this.setState({ loading: true });
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      this.setState({ data, loading: false });
      
      // Dispatch data loaded event
      this.dispatchEvent(new CustomEvent('data-loaded', {
        detail: { data },
        bubbles: true
      }));
      
    } catch (error) {
      console.error('Failed to load data:', error);
      this.setState({ loading: false });
      
      // Show error in component
      const content = this.shadowRoot.querySelector('.card-content');
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.textContent = `Failed to load data: ${error.message}`;
      content.appendChild(errorDiv);
      
      // Dispatch error event
      this.dispatchEvent(new CustomEvent('data-error', {
        detail: { error },
        bubbles: true
      }));
    }
  }
  
  // Update component state
  setState(newState) {
    this.state = { ...this.state, ...newState };
    
    // Update loading attribute
    if (this.state.loading) {
      this.setAttribute('loading', '');
    } else {
      this.removeAttribute('loading');
    }
    
    this.render();
  }
  
  // Toggle expanded state
  toggle() {
    this.setState({ expanded: !this.state.expanded });
    
    // Dispatch toggle event
    this.dispatchEvent(new CustomEvent('card-toggled', {
      detail: { expanded: this.state.expanded },
      bubbles: true
    }));
  }
  
  // Public API
  expand() {
    if (!this.state.expanded) {
      this.toggle();
    }
  }
  
  collapse() {
    if (this.state.expanded) {
      this.toggle();
    }
  }
  
  refresh() {
    const dataSrc = this.getAttribute('data-src');
    if (dataSrc) {
      this.loadData(dataSrc);
    }
  }
  
  // Cleanup
  cleanup() {
    // Remove any external resources or timers
  }
}

// Register advanced card element
customElements.define('advanced-card', AdvancedCard);

// Usage examples
console.log('=== Custom Elements Demo ===');

// Create basic button programmatically
const basicBtn = document.createElement('basic-button');
basicBtn.setAttribute('text', 'Dynamic Button');
basicBtn.setAttribute('variant', 'primary');
basicBtn.addEventListener('button-clicked', (event) => {
  console.log('Button clicked:', event.detail);
});

document.body.appendChild(basicBtn);

// Create advanced card
const card = document.createElement('advanced-card');
card.setAttribute('title', 'Dynamic Card');
card.setAttribute('subtitle', 'Created programmatically');
card.setAttribute('expandable', '');
card.innerHTML = `
  <div slot="content">
    <p>This is the main content of the card.</p>
  </div>
  <div slot="expanded">
    <p>This is the expanded content that shows when toggled.</p>
    <ul>
      <li>Feature 1</li>
      <li>Feature 2</li>
      <li>Feature 3</li>
    </ul>
  </div>
`;

card.addEventListener('card-toggled', (event) => {
  console.log('Card toggled:', event.detail);
});

document.body.appendChild(card);

// Test with data loading
setTimeout(() => {
  card.setAttribute('data-src', 'https://jsonplaceholder.typicode.com/posts/1');
}, 2000);
```

### Custom Element Lifecycle and Best Practices

```javascript
// lifecycle-management.js - Advanced lifecycle management
class LifecycleAwareElement extends HTMLElement {
  constructor() {
    super();
    
    this.state = {
      initialized: false,
      connected: false,
      rendered: false
    };
    
    this.observers = [];
    this.timers = [];
    this.eventListeners = [];
    
    console.log('Constructor called');
  }
  
  connectedCallback() {
    console.log('Connected to DOM');
    
    this.state.connected = true;
    
    // Initialize only once
    if (!this.state.initialized) {
      this.initialize();
    }
    
    this.render();
    this.setupObservers();
    this.startTimers();
  }
  
  disconnectedCallback() {
    console.log('Disconnected from DOM');
    
    this.state.connected = false;
    this.cleanup();
  }
  
  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute changed: ${name} = ${newValue}`);
    
    if (this.state.connected && this.state.rendered) {
      this.handleAttributeChange(name, oldValue, newValue);
    }
  }
  
  adoptedCallback() {
    console.log('Adopted by new document');
    
    // Re-setup if needed
    if (this.state.connected) {
      this.cleanup();
      this.setupObservers();
      this.startTimers();
    }
  }
  
  static get observedAttributes() {
    return ['data-value', 'active', 'theme'];
  }
  
  // Initialize component (called once)
  initialize() {
    console.log('Initializing component');
    
    this.attachShadow({ mode: 'open' });
    this.state.initialized = true;
    
    // Set up initial state
    this.setupInitialState();
  }
  
  // Set up initial state
  setupInitialState() {
    this.internalState = {
      value: this.getAttribute('data-value') || '',
      active: this.hasAttribute('active'),
      theme: this.getAttribute('theme') || 'default'
    };
  }
  
  // Render component
  render() {
    if (!this.shadowRoot) return;
    
    console.log('Rendering component');
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 16px;
          border: 2px solid #ddd;
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        :host([active]) {
          border-color: #007bff;
          background-color: #f0f8ff;
        }
        
        :host([theme="dark"]) {
          background-color: #333;
          color: white;
          border-color: #666;
        }
        
        .content {
          margin-bottom: 12px;
        }
        
        .status {
          font-size: 0.9rem;
          color: #666;
        }
        
        :host([theme="dark"]) .status {
          color: #ccc;
        }
      </style>
      
      <div class="content">
        <h3>Lifecycle Aware Element</h3>
        <p>Value: ${this.internalState.value}</p>
        <p>Active: ${this.internalState.active ? 'Yes' : 'No'}</p>
        <p>Theme: ${this.internalState.theme}</p>
      </div>
      
      <div class="status">
        Connected: ${this.state.connected} | 
        Rendered: ${this.state.rendered} |
        Observers: ${this.observers.length} |
        Timers: ${this.timers.length}
      </div>
    `;
    
    this.state.rendered = true;
    this.setupEventListeners();
  }
  
  // Handle attribute changes
  handleAttributeChange(name, oldValue, newValue) {
    switch (name) {
      case 'data-value':
        this.internalState.value = newValue || '';
        break;
        
      case 'active':
        this.internalState.active = newValue !== null;
        break;
        
      case 'theme':
        this.internalState.theme = newValue || 'default';
        break;
    }
    
    this.render();
  }
  
  // Set up observers
  setupObservers() {
    // Mutation observer for slot changes
    if (this.shadowRoot) {
      const mutationObserver = new MutationObserver((mutations) => {
        console.log('Shadow DOM mutations:', mutations.length);
      });
      
      mutationObserver.observe(this.shadowRoot, {
        childList: true,
        subtree: true
      });
      
      this.observers.push(mutationObserver);
    }
    
    // Intersection observer for visibility
    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        console.log('Visibility changed:', entry.isIntersecting);
        
        if (entry.isIntersecting) {
          this.onVisible();
        } else {
          this.onHidden();
        }
      });
    });
    
    intersectionObserver.observe(this);
    this.observers.push(intersectionObserver);
    
    // Resize observer for size changes
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        console.log('Size changed:', entry.contentRect);
        this.onResize(entry.contentRect);
      });
    });
    
    resizeObserver.observe(this);
    this.observers.push(resizeObserver);
  }
  
  // Set up event listeners
  setupEventListeners() {
    const clickHandler = (event) => {
      console.log('Element clicked');
      this.toggle();
    };
    
    this.addEventListener('click', clickHandler);
    this.eventListeners.push({ event: 'click', handler: clickHandler });
  }
  
  // Start timers
  startTimers() {
    // Update timer
    const updateTimer = setInterval(() => {
      if (this.state.connected) {
        this.onTimer();
      }
    }, 5000);
    
    this.timers.push(updateTimer);
  }
  
  // Event handlers
  onVisible() {
    console.log('Element became visible');
  }
  
  onHidden() {
    console.log('Element became hidden');
  }
  
  onResize(rect) {
    console.log('Element resized:', rect.width, 'x', rect.height);
  }
  
  onTimer() {
    console.log('Timer tick');
    this.render(); // Update status
  }
  
  // Public methods
  toggle() {
    if (this.hasAttribute('active')) {
      this.removeAttribute('active');
    } else {
      this.setAttribute('active', '');
    }
  }
  
  setValue(value) {
    this.setAttribute('data-value', value);
  }
  
  setTheme(theme) {
    this.setAttribute('theme', theme);
  }
  
  // Cleanup all resources
  cleanup() {
    console.log('Cleaning up resources');
    
    // Disconnect observers
    this.observers.forEach(observer => {
      observer.disconnect();
    });
    this.observers = [];
    
    // Clear timers
    this.timers.forEach(timer => {
      clearInterval(timer);
    });
    this.timers = [];
    
    // Remove event listeners
    this.eventListeners.forEach(({ event, handler }) => {
      this.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }
  
  // Get component info
  getInfo() {
    return {
      state: { ...this.state },
      internalState: { ...this.internalState },
      observers: this.observers.length,
      timers: this.timers.length,
      eventListeners: this.eventListeners.length
    };
  }
}

// Register lifecycle-aware element
customElements.define('lifecycle-aware', LifecycleAwareElement);

// Test lifecycle management
const lifecycleElement = document.createElement('lifecycle-aware');
lifecycleElement.setAttribute('data-value', 'Initial Value');
lifecycleElement.setAttribute('theme', 'dark');

document.body.appendChild(lifecycleElement);

// Test attribute changes
setTimeout(() => {
  lifecycleElement.setAttribute('active', '');
  lifecycleElement.setValue('Updated Value');
}, 2000);

// Test removal and re-addition
setTimeout(() => {
  console.log('Removing element from DOM');
  document.body.removeChild(lifecycleElement);
  
  setTimeout(() => {
    console.log('Re-adding element to DOM');
    document.body.appendChild(lifecycleElement);
  }, 2000);
}, 5000);

// Show component info
setTimeout(() => {
  console.log('Component info:', lifecycleElement.getInfo());
}, 8000);
```
