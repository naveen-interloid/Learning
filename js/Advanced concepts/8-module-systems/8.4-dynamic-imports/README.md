# **8.4 Dynamic Imports & Code Splitting**

Dynamic imports allow you to load modules at runtime, enabling code splitting, lazy loading, and conditional module loading. This is crucial for performance optimization in modern web applications.

## Basic Dynamic Import Syntax

### Simple Dynamic Imports

```javascript
// basic-dynamic-imports.js - Basic dynamic import examples
async function loadMathUtils() {
  try {
    // Dynamic import returns a Promise
    const mathModule = await import('./math-utils.js');
    
    // Access named exports
    console.log('PI:', mathModule.PI);
    console.log('5 + 3 =', mathModule.add(5, 3));
    
    // Access default export
    if (mathModule.default) {
      const Calculator = mathModule.default;
      const calc = new Calculator();
      console.log('Calculator result:', calc.add(10).multiply(2).getValue());
    }
    
    return mathModule;
  } catch (error) {
    console.error('Failed to load math utils:', error);
    return null;
  }
}

// Using .then() syntax
function loadMathUtilsWithThen() {
  import('./math-utils.js')
    .then(mathModule => {
      console.log('Math utils loaded:', Object.keys(mathModule));
      return mathModule.add(2, 3);
    })
    .then(result => {
      console.log('Addition result:', result);
    })
    .catch(error => {
      console.error('Import failed:', error);
    });
}

// Conditional loading
async function loadBasedOnCondition(condition) {
  if (condition === 'advanced') {
    const { AdvancedMath } = await import('./advanced-math.js');
    return new AdvancedMath();
  } else if (condition === 'basic') {
    const { BasicMath } = await import('./basic-math.js');
    return new BasicMath();
  } else {
    // Fallback to inline implementation
    return {
      add: (a, b) => a + b,
      subtract: (a, b) => a - b
    };
  }
}

// Usage
loadMathUtils().then(mathModule => {
  if (mathModule) {
    console.log('Math module loaded successfully');
  }
});

loadMathUtilsWithThen();

loadBasedOnCondition('advanced').then(mathInstance => {
  console.log('Conditional loading result:', mathInstance);
});
```

### Dynamic Import with Destructuring

```javascript
// destructuring-imports.js - Dynamic imports with destructuring
async function loadSpecificFunctions() {
  try {
    // Import and destructure in one step
    const { add, multiply, PI } = await import('./math-utils.js');
    
    console.log('Loaded functions:', { add, multiply, PI });
    console.log('Calculation:', add(multiply(PI, 2), 1));
    
    return { add, multiply, PI };
  } catch (error) {
    console.error('Failed to load specific functions:', error);
    return {};
  }
}

async function loadWithRenaming() {
  try {
    // Import with renaming
    const { 
      add: addition, 
      multiply: multiplication,
      default: Calculator 
    } = await import('./math-utils.js');
    
    console.log('Renamed functions:', addition(5, 3));
    
    if (Calculator) {
      const calc = new Calculator();
      console.log('Calculator with renamed imports:', calc.add(10).getValue());
    }
    
    return { addition, multiplication, Calculator };
  } catch (error) {
    console.error('Failed to load with renaming:', error);
    return {};
  }
}

// Multiple dynamic imports
async function loadMultipleModules() {
  try {
    const [
      mathModule,
      stringModule,
      arrayModule
    ] = await Promise.all([
      import('./math-utils.js'),
      import('./string-utils.js'),
      import('./array-utils.js')
    ]);
    
    console.log('All modules loaded');
    
    // Use functions from different modules
    const result = mathModule.add(5, 3);
    const formatted = stringModule.capitalize(`result is ${result}`);
    const array = arrayModule.chunk([1, 2, 3, 4, 5, 6], 2);
    
    console.log('Combined result:', { formatted, array });
    
    return { mathModule, stringModule, arrayModule };
  } catch (error) {
    console.error('Failed to load multiple modules:', error);
    return {};
  }
}

// Usage
loadSpecificFunctions();
loadWithRenaming();
loadMultipleModules();
```

## Code Splitting Strategies

### Route-Based Code Splitting

```javascript
// route-based-splitting.js - Route-based code splitting
class Router {
  constructor() {
    this.routes = new Map();
    this.currentRoute = null;
    this.loadingElement = null;
  }
  
  // Register route with dynamic import
  addRoute(path, importFunction, options = {}) {
    this.routes.set(path, {
      import: importFunction,
      component: null,
      loaded: false,
      loading: false,
      ...options
    });
  }
  
  // Navigate to route
  async navigate(path) {
    if (!this.routes.has(path)) {
      console.error(`Route '${path}' not found`);
      return;
    }
    
    const route = this.routes.get(path);
    
    // Show loading indicator
    this.showLoading();
    
    try {
      // Load component if not already loaded
      if (!route.loaded && !route.loading) {
        route.loading = true;
        console.log(`Loading route: ${path}`);
        
        const module = await route.import();
        route.component = module.default || module;
        route.loaded = true;
        route.loading = false;
        
        console.log(`Route '${path}' loaded successfully`);
      }
      
      // Hide loading indicator
      this.hideLoading();
      
      // Render component
      if (route.component) {
        this.renderComponent(route.component, path);
        this.currentRoute = path;
      }
      
    } catch (error) {
      console.error(`Failed to load route '${path}':`, error);
      this.hideLoading();
      this.showError(`Failed to load page: ${path}`);
    }
  }
  
  showLoading() {
    if (!this.loadingElement) {
      this.loadingElement = document.createElement('div');
      this.loadingElement.textContent = 'Loading...';
      this.loadingElement.className = 'loading';
    }
    document.body.appendChild(this.loadingElement);
  }
  
  hideLoading() {
    if (this.loadingElement && this.loadingElement.parentNode) {
      this.loadingElement.parentNode.removeChild(this.loadingElement);
    }
  }
  
  renderComponent(component, path) {
    // Clear previous content
    const appElement = document.getElementById('app') || document.body;
    appElement.innerHTML = '';
    
    // Render new component
    if (typeof component === 'function') {
      const instance = new component();
      if (instance.render) {
        appElement.innerHTML = instance.render();
      }
    } else if (component.render) {
      appElement.innerHTML = component.render();
    } else {
      appElement.innerHTML = `<div>Component loaded for route: ${path}</div>`;
    }
  }
  
  showError(message) {
    const appElement = document.getElementById('app') || document.body;
    appElement.innerHTML = `<div class="error">${message}</div>`;
  }
  
  // Preload route
  async preload(path) {
    if (!this.routes.has(path)) {
      return;
    }
    
    const route = this.routes.get(path);
    
    if (!route.loaded && !route.loading) {
      try {
        route.loading = true;
        console.log(`Preloading route: ${path}`);
        
        const module = await route.import();
        route.component = module.default || module;
        route.loaded = true;
        route.loading = false;
        
        console.log(`Route '${path}' preloaded successfully`);
      } catch (error) {
        console.error(`Failed to preload route '${path}':`, error);
        route.loading = false;
      }
    }
  }
  
  // Get route status
  getRouteStatus(path) {
    const route = this.routes.get(path);
    if (!route) return 'not-found';
    
    if (route.loaded) return 'loaded';
    if (route.loading) return 'loading';
    return 'not-loaded';
  }
  
  // List all routes
  getRoutes() {
    return Array.from(this.routes.keys());
  }
}

// Create router instance
const router = new Router();

// Register routes with dynamic imports
router.addRoute('/', () => import('./pages/HomePage.js'));
router.addRoute('/about', () => import('./pages/AboutPage.js'));
router.addRoute('/contact', () => import('./pages/ContactPage.js'));
router.addRoute('/dashboard', () => import('./pages/DashboardPage.js'));
router.addRoute('/profile', () => import('./pages/ProfilePage.js'));

// Navigation functions
function navigateTo(path) {
  router.navigate(path);
  
  // Update URL (in real app, you'd use History API)
  window.location.hash = path;
}

// Preload important routes
router.preload('/dashboard');
router.preload('/profile');

// Usage
console.log('Available routes:', router.getRoutes());

// Simulate navigation
navigateTo('/');
setTimeout(() => navigateTo('/about'), 2000);
setTimeout(() => navigateTo('/dashboard'), 4000);
```

### Component-Based Code Splitting

```javascript
// component-splitting.js - Component-based code splitting
class ComponentLoader {
  constructor() {
    this.cache = new Map();
    this.loading = new Set();
  }
  
  // Load component dynamically
  async loadComponent(name, importPath) {
    // Return cached component
    if (this.cache.has(name)) {
      return this.cache.get(name);
    }
    
    // Prevent duplicate loading
    if (this.loading.has(name)) {
      // Wait for ongoing load
      while (this.loading.has(name)) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      return this.cache.get(name);
    }
    
    try {
      this.loading.add(name);
      console.log(`Loading component: ${name}`);
      
      const module = await import(importPath);
      const component = module.default || module;
      
      this.cache.set(name, component);
      console.log(`Component '${name}' loaded and cached`);
      
      return component;
    } catch (error) {
      console.error(`Failed to load component '${name}':`, error);
      throw error;
    } finally {
      this.loading.delete(name);
    }
  }
  
  // Load multiple components
  async loadComponents(components) {
    const promises = Object.entries(components).map(async ([name, path]) => {
      const component = await this.loadComponent(name, path);
      return [name, component];
    });
    
    const results = await Promise.all(promises);
    return Object.fromEntries(results);
  }
  
  // Lazy component wrapper
  createLazyComponent(name, importPath, fallback = null) {
    return {
      name: name,
      importPath: importPath,
      component: null,
      loaded: false,
      
      async render(props = {}) {
        if (!this.loaded) {
          // Show fallback while loading
          if (fallback) {
            const fallbackElement = document.createElement('div');
            fallbackElement.innerHTML = fallback;
            return fallbackElement;
          }
          
          // Load component
          this.component = await this.loadComponent(name, importPath);
          this.loaded = true;
        }
        
        // Render component
        if (typeof this.component === 'function') {
          const instance = new this.component(props);
          return instance.render ? instance.render() : instance;
        } else if (this.component.render) {
          return this.component.render(props);
        }
        
        return this.component;
      }.bind(this)
    };
  }
  
  // Preload components
  async preloadComponents(components) {
    const preloadPromises = components.map(({ name, path }) => 
      this.loadComponent(name, path).catch(error => {
        console.warn(`Failed to preload component '${name}':`, error);
      })
    );
    
    await Promise.allSettled(preloadPromises);
    console.log('Component preloading completed');
  }
  
  // Get cache status
  getCacheStatus() {
    return {
      cached: Array.from(this.cache.keys()),
      loading: Array.from(this.loading),
      cacheSize: this.cache.size
    };
  }
  
  // Clear cache
  clearCache() {
    this.cache.clear();
    console.log('Component cache cleared');
  }
}

// Create component loader
const componentLoader = new ComponentLoader();

// Create lazy components
const LazyModal = componentLoader.createLazyComponent(
  'Modal',
  './components/Modal.js',
  '<div>Loading modal...</div>'
);

const LazyChart = componentLoader.createLazyComponent(
  'Chart',
  './components/Chart.js',
  '<div>Loading chart...</div>'
);

const LazyDataTable = componentLoader.createLazyComponent(
  'DataTable',
  './components/DataTable.js',
  '<div>Loading data table...</div>'
);

// Usage example
async function showModal() {
  const modalElement = await LazyModal.render({
    title: 'Dynamic Modal',
    content: 'This modal was loaded dynamically!'
  });
  
  document.body.appendChild(modalElement);
}

async function showChart() {
  const chartElement = await LazyChart.render({
    type: 'bar',
    data: [1, 2, 3, 4, 5]
  });
  
  const container = document.getElementById('chart-container');
  if (container) {
    container.appendChild(chartElement);
  }
}

// Preload components that might be needed soon
componentLoader.preloadComponents([
  { name: 'Modal', path: './components/Modal.js' },
  { name: 'Chart', path: './components/Chart.js' }
]);

// Load multiple components at once
async function loadDashboardComponents() {
  const components = await componentLoader.loadComponents({
    'UserProfile': './components/UserProfile.js',
    'ActivityFeed': './components/ActivityFeed.js',
    'NotificationPanel': './components/NotificationPanel.js'
  });
  
  console.log('Dashboard components loaded:', Object.keys(components));
  return components;
}

// Check cache status
console.log('Cache status:', componentLoader.getCacheStatus());
```

## Lazy Loading Patterns

### Intersection Observer Lazy Loading

```javascript
// lazy-loading-observer.js - Lazy loading with Intersection Observer
class LazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    };
    
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      this.options
    );
    
    this.loadingElements = new Map();
  }
  
  // Register element for lazy loading
  observe(element, importFunction, options = {}) {
    const config = {
      import: importFunction,
      loaded: false,
      loading: false,
      placeholder: options.placeholder || 'Loading...',
      errorMessage: options.errorMessage || 'Failed to load content',
      onLoad: options.onLoad || null,
      onError: options.onError || null
    };
    
    this.loadingElements.set(element, config);
    
    // Set initial placeholder
    if (config.placeholder) {
      element.innerHTML = config.placeholder;
    }
    
    this.observer.observe(element);
  }
  
  // Handle intersection
  async handleIntersection(entries) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const element = entry.target;
        const config = this.loadingElements.get(element);
        
        if (config && !config.loaded && !config.loading) {
          await this.loadContent(element, config);
        }
      }
    }
  }
  
  // Load content for element
  async loadContent(element, config) {
    try {
      config.loading = true;
      
      // Load module
      const module = await config.import();
      const content = module.default || module;
      
      // Render content
      if (typeof content === 'function') {
        const instance = new content();
        element.innerHTML = instance.render ? instance.render() : String(instance);
      } else if (content.render) {
        element.innerHTML = content.render();
      } else if (typeof content === 'string') {
        element.innerHTML = content;
      } else {
        element.innerHTML = JSON.stringify(content);
      }
      
      config.loaded = true;
      
      // Call onLoad callback
      if (config.onLoad) {
        config.onLoad(element, content);
      }
      
      // Stop observing this element
      this.observer.unobserve(element);
      
    } catch (error) {
      console.error('Failed to load lazy content:', error);
      
      element.innerHTML = config.errorMessage;
      
      // Call onError callback
      if (config.onError) {
        config.onError(element, error);
      }
    } finally {
      config.loading = false;
    }
  }
  
  // Manually trigger loading
  async loadElement(element) {
    const config = this.loadingElements.get(element);
    if (config && !config.loaded && !config.loading) {
      await this.loadContent(element, config);
    }
  }
  
  // Disconnect observer
  disconnect() {
    this.observer.disconnect();
    this.loadingElements.clear();
  }
  
  // Get loading status
  getStatus() {
    const status = {
      total: this.loadingElements.size,
      loaded: 0,
      loading: 0,
      pending: 0
    };
    
    for (const config of this.loadingElements.values()) {
      if (config.loaded) status.loaded++;
      else if (config.loading) status.loading++;
      else status.pending++;
    }
    
    return status;
  }
}

// Create lazy loader
const lazyLoader = new LazyLoader({
  rootMargin: '100px',
  threshold: 0.1
});

// Usage example
function setupLazyLoading() {
  // Lazy load heavy components
  const chartContainer = document.getElementById('chart-section');
  if (chartContainer) {
    lazyLoader.observe(
      chartContainer,
      () => import('./components/HeavyChart.js'),
      {
        placeholder: '<div class="loading">Loading chart...</div>',
        onLoad: (element, content) => {
          console.log('Chart loaded successfully');
          element.classList.add('loaded');
        }
      }
    );
  }
  
  const dataTableContainer = document.getElementById('data-table-section');
  if (dataTableContainer) {
    lazyLoader.observe(
      dataTableContainer,
      () => import('./components/DataTable.js'),
      {
        placeholder: '<div class="loading">Loading data table...</div>',
        onLoad: (element, content) => {
          console.log('Data table loaded successfully');
        }
      }
    );
  }
  
  const mapContainer = document.getElementById('map-section');
  if (mapContainer) {
    lazyLoader.observe(
      mapContainer,
      () => import('./components/InteractiveMap.js'),
      {
        placeholder: '<div class="loading">Loading map...</div>',
        errorMessage: '<div class="error">Failed to load map</div>'
      }
    );
  }
}

// Initialize lazy loading
setupLazyLoading();

// Check loading status
setInterval(() => {
  console.log('Lazy loading status:', lazyLoader.getStatus());
}, 5000);
```

### Feature-Based Lazy Loading

```javascript
// feature-lazy-loading.js - Feature-based lazy loading
class FeatureLoader {
  constructor() {
    this.features = new Map();
    this.loadedFeatures = new Set();
    this.loadingFeatures = new Set();
  }
  
  // Register feature
  registerFeature(name, config) {
    this.features.set(name, {
      import: config.import,
      dependencies: config.dependencies || [],
      condition: config.condition || (() => true),
      priority: config.priority || 0,
      preload: config.preload || false,
      ...config
    });
    
    // Preload if specified
    if (config.preload) {
      this.preloadFeature(name);
    }
  }
  
  // Load feature
  async loadFeature(name) {
    if (this.loadedFeatures.has(name)) {
      return this.getLoadedFeature(name);
    }
    
    if (this.loadingFeatures.has(name)) {
      // Wait for ongoing load
      while (this.loadingFeatures.has(name)) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      return this.getLoadedFeature(name);
    }
    
    const feature = this.features.get(name);
    if (!feature) {
      throw new Error(`Feature '${name}' not registered`);
    }
    
    // Check condition
    if (!feature.condition()) {
      console.log(`Feature '${name}' condition not met`);
      return null;
    }
    
    try {
      this.loadingFeatures.add(name);
      console.log(`Loading feature: ${name}`);
      
      // Load dependencies first
      await this.loadDependencies(feature.dependencies);
      
      // Load feature module
      const module = await feature.import();
      const featureInstance = module.default || module;
      
      // Initialize feature if it has init method
      if (featureInstance.init) {
        await featureInstance.init();
      }
      
      this.loadedFeatures.add(name);
      console.log(`Feature '${name}' loaded successfully`);
      
      return featureInstance;
      
    } catch (error) {
      console.error(`Failed to load feature '${name}':`, error);
      throw error;
    } finally {
      this.loadingFeatures.delete(name);
    }
  }
  
  // Load dependencies
  async loadDependencies(dependencies) {
    if (dependencies.length === 0) return;
    
    const dependencyPromises = dependencies.map(dep => this.loadFeature(dep));
    await Promise.all(dependencyPromises);
  }
  
  // Preload feature
  async preloadFeature(name) {
    try {
      await this.loadFeature(name);
      console.log(`Feature '${name}' preloaded`);
    } catch (error) {
      console.warn(`Failed to preload feature '${name}':`, error);
    }
  }
  
  // Load features by priority
  async loadFeaturesByPriority() {
    const sortedFeatures = Array.from(this.features.entries())
      .sort(([, a], [, b]) => b.priority - a.priority);
    
    for (const [name, feature] of sortedFeatures) {
      if (!this.loadedFeatures.has(name) && feature.condition()) {
        try {
          await this.loadFeature(name);
        } catch (error) {
          console.warn(`Failed to load priority feature '${name}':`, error);
        }
      }
    }
  }
  
  // Check if feature is available
  isFeatureAvailable(name) {
    const feature = this.features.get(name);
    return feature && feature.condition();
  }
  
  // Get loaded feature
  getLoadedFeature(name) {
    // This would typically return the cached instance
    // For simplicity, we'll return a placeholder
    return this.loadedFeatures.has(name) ? { name, loaded: true } : null;
  }
  
  // Get feature status
  getFeatureStatus() {
    const status = {
      registered: this.features.size,
      loaded: this.loadedFeatures.size,
      loading: this.loadingFeatures.size,
      available: 0
    };
    
    for (const [name, feature] of this.features) {
      if (feature.condition()) {
        status.available++;
      }
    }
    
    return status;
  }
}

// Create feature loader
const featureLoader = new FeatureLoader();

// Register features
featureLoader.registerFeature('analytics', {
  import: () => import('./features/analytics.js'),
  condition: () => window.location.hostname !== 'localhost',
  priority: 1,
  preload: false
});

featureLoader.registerFeature('chat', {
  import: () => import('./features/chat.js'),
  dependencies: ['websocket'],
  condition: () => document.querySelector('[data-feature="chat"]') !== null,
  priority: 2
});

featureLoader.registerFeature('websocket', {
  import: () => import('./features/websocket.js'),
  condition: () => 'WebSocket' in window,
  priority: 3,
  preload: true
});

featureLoader.registerFeature('notifications', {
  import: () => import('./features/notifications.js'),
  condition: () => 'Notification' in window,
  priority: 2
});

featureLoader.registerFeature('geolocation', {
  import: () => import('./features/geolocation.js'),
  condition: () => 'geolocation' in navigator,
  priority: 1
});

featureLoader.registerFeature('camera', {
  import: () => import('./features/camera.js'),
  condition: () => 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices,
  priority: 0
});

// Usage functions
async function enableFeature(featureName) {
  try {
    const feature = await featureLoader.loadFeature(featureName);
    if (feature) {
      console.log(`Feature '${featureName}' enabled`);
      return feature;
    } else {
      console.log(`Feature '${featureName}' not available`);
      return null;
    }
  } catch (error) {
    console.error(`Failed to enable feature '${featureName}':`, error);
    return null;
  }
}

// Load features based on user interaction
function setupFeatureLoading() {
  // Load chat when chat button is clicked
  document.addEventListener('click', async (event) => {
    if (event.target.matches('[data-feature="chat"]')) {
      await enableFeature('chat');
    }
    
    if (event.target.matches('[data-feature="camera"]')) {
      await enableFeature('camera');
    }
    
    if (event.target.matches('[data-feature="geolocation"]')) {
      await enableFeature('geolocation');
    }
  });
  
  // Load notifications on page load if supported
  if (featureLoader.isFeatureAvailable('notifications')) {
    enableFeature('notifications');
  }
  
  // Load analytics after a delay
  setTimeout(() => {
    if (featureLoader.isFeatureAvailable('analytics')) {
      enableFeature('analytics');
    }
  }, 2000);
}

// Initialize feature loading
setupFeatureLoading();

// Load high-priority features
featureLoader.loadFeaturesByPriority();

// Monitor feature status
setInterval(() => {
  console.log('Feature status:', featureLoader.getFeatureStatus());
}, 10000);
```

## Performance Optimization

### Bundle Analysis and Optimization

```javascript
// bundle-analyzer.js - Bundle analysis utilities
class BundleAnalyzer {
  constructor() {
    this.loadTimes = new Map();
    this.bundleSizes = new Map();
    this.loadErrors = new Map();
  }
  
  // Measure import performance
  async measureImport(name, importFunction) {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    
    try {
      const module = await importFunction();
      const endTime = performance.now();
      const endMemory = this.getMemoryUsage();
      
      const metrics = {
        loadTime: endTime - startTime,
        memoryDelta: endMemory - startMemory,
        timestamp: new Date(),
        success: true
      };
      
      this.loadTimes.set(name, metrics);
      console.log(`Import '${name}' took ${metrics.loadTime.toFixed(2)}ms`);
      
      return module;
    } catch (error) {
      const endTime = performance.now();
      
      const metrics = {
        loadTime: endTime - startTime,
        error: error.message,
        timestamp: new Date(),
        success: false
      };
      
      this.loadErrors.set(name, metrics);
      console.error(`Import '${name}' failed after ${metrics.loadTime.toFixed(2)}ms:`, error);
      
      throw error;
    }
  }
  
  // Get memory usage (if available)
  getMemoryUsage() {
    if (performance.memory) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }
  
  // Analyze bundle performance
  getPerformanceReport() {
    const report = {
      totalImports: this.loadTimes.size,
      successfulImports: 0,
      failedImports: this.loadErrors.size,
      averageLoadTime: 0,
      slowestImports: [],
      fastestImports: [],
      totalMemoryUsed: 0
    };
    
    const loadTimeArray = Array.from(this.loadTimes.entries());
    
    if (loadTimeArray.length > 0) {
      // Calculate averages
      const totalTime = loadTimeArray.reduce((sum, [, metrics]) => sum + metrics.loadTime, 0);
      const totalMemory = loadTimeArray.reduce((sum, [, metrics]) => sum + metrics.memoryDelta, 0);
      
      report.averageLoadTime = totalTime / loadTimeArray.length;
      report.totalMemoryUsed = totalMemory;
      report.successfulImports = loadTimeArray.length;
      
      // Sort by load time
      const sortedByTime = loadTimeArray.sort(([, a], [, b]) => b.loadTime - a.loadTime);
      
      report.slowestImports = sortedByTime.slice(0, 5).map(([name, metrics]) => ({
        name,
        loadTime: metrics.loadTime,
        memoryDelta: metrics.memoryDelta
      }));
      
      report.fastestImports = sortedByTime.slice(-5).reverse().map(([name, metrics]) => ({
        name,
        loadTime: metrics.loadTime,
        memoryDelta: metrics.memoryDelta
      }));
    }
    
    return report;
  }
  
  // Recommend optimizations
  getOptimizationRecommendations() {
    const report = this.getPerformanceReport();
    const recommendations = [];
    
    if (report.averageLoadTime > 100) {
      recommendations.push({
        type: 'performance',
        message: 'Average load time is high. Consider code splitting or preloading.',
        priority: 'high'
      });
    }
    
    if (report.slowestImports.length > 0) {
      const slowest = report.slowestImports[0];
      if (slowest.loadTime > 500) {
        recommendations.push({
          type: 'bundle-size',
          message: `Module '${slowest.name}' is very slow to load. Consider breaking it down.`,
          priority: 'high'
        });
      }
    }
    
    if (report.failedImports > 0) {
      recommendations.push({
        type: 'reliability',
        message: `${report.failedImports} imports failed. Check network conditions and error handling.`,
        priority: 'medium'
      });
    }
    
    if (report.totalMemoryUsed > 10 * 1024 * 1024) { // 10MB
      recommendations.push({
        type: 'memory',
        message: 'High memory usage detected. Consider lazy loading or module cleanup.',
        priority: 'medium'
      });
    }
    
    return recommendations;
  }
  
  // Clear metrics
  clearMetrics() {
    this.loadTimes.clear();
    this.bundleSizes.clear();
    this.loadErrors.clear();
  }
}

// Create bundle analyzer
const bundleAnalyzer = new BundleAnalyzer();

// Wrapper function for measured imports
async function measuredImport(name, importFunction) {
  return bundleAnalyzer.measureImport(name, importFunction);
}

// Usage examples
async function loadAndAnalyzeModules() {
  // Load modules with measurement
  await measuredImport('math-utils', () => import('./math-utils.js'));
  await measuredImport('string-utils', () => import('./string-utils.js'));
  await measuredImport('heavy-component', () => import('./components/HeavyComponent.js'));
  await measuredImport('chart-library', () => import('./lib/chart-library.js'));
  
  // Get performance report
  const report = bundleAnalyzer.getPerformanceReport();
  console.log('Performance Report:', report);
  
  // Get optimization recommendations
  const recommendations = bundleAnalyzer.getOptimizationRecommendations();
  console.log('Optimization Recommendations:', recommendations);
}

// Load modules and analyze
loadAndAnalyzeModules();

// Periodic performance monitoring
setInterval(() => {
  const report = bundleAnalyzer.getPerformanceReport();
  if (report.totalImports > 0) {
    console.log(`Performance Summary: ${report.totalImports} imports, avg ${report.averageLoadTime.toFixed(2)}ms`);
  }
}, 30000);
```

## Key Takeaways

* **Dynamic imports enable runtime module loading** for better performance
* **Code splitting reduces initial bundle size** and improves load times
* **Route-based splitting** loads pages only when needed
* **Component-based splitting** loads UI components on demand
* **Lazy loading with Intersection Observer** loads content when visible
* **Feature-based loading** enables conditional functionality
* **Bundle analysis helps identify** performance bottlenecks
* **Preloading strategies** can improve perceived performance
* **Error handling is crucial** for dynamic imports
* **Performance monitoring** helps optimize loading strategies
```
