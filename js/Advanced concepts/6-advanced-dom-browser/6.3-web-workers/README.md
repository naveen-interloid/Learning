# **6.3 Web Workers & Service Workers**

Web Workers enable background processing in JavaScript, allowing CPU-intensive tasks to run without blocking the main thread. Service Workers provide offline functionality and network request interception.

## Web Workers Fundamentals

### Basic Web Worker Implementation

```javascript
// main-thread.js - Main thread worker management
class WebWorkerManager {
  constructor() {
    this.workers = new Map();
    this.taskQueue = [];
    this.completedTasks = new Map();
  }
  
  // Create and manage a web worker
  createWorker(workerScript, workerId = null) {
    const id = workerId || this.generateWorkerId();
    
    try {
      // Create worker from script URL
      const worker = new Worker(workerScript);
      
      // Set up message handling
      worker.onmessage = (event) => {
        this.handleWorkerMessage(id, event);
      };
      
      worker.onerror = (error) => {
        this.handleWorkerError(id, error);
      };
      
      // Store worker metadata
      this.workers.set(id, {
        worker,
        script: workerScript,
        createdAt: Date.now(),
        tasksCompleted: 0,
        isActive: true
      });
      
      console.log(`Worker ${id} created from ${workerScript}`);
      return id;
      
    } catch (error) {
      console.error(`Failed to create worker ${id}:`, error);
      return null;
    }
  }
  
  // Create worker from inline code
  createInlineWorker(workerCode, workerId = null) {
    const id = workerId || this.generateWorkerId();
    
    try {
      // Create blob URL from code
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const workerUrl = URL.createObjectURL(blob);
      
      const worker = new Worker(workerUrl);
      
      worker.onmessage = (event) => {
        this.handleWorkerMessage(id, event);
      };
      
      worker.onerror = (error) => {
        this.handleWorkerError(id, error);
      };
      
      this.workers.set(id, {
        worker,
        script: 'inline',
        blobUrl: workerUrl,
        createdAt: Date.now(),
        tasksCompleted: 0,
        isActive: true
      });
      
      console.log(`Inline worker ${id} created`);
      return id;
      
    } catch (error) {
      console.error(`Failed to create inline worker ${id}:`, error);
      return null;
    }
  }
  
  // Send task to worker
  sendTask(workerId, taskData, taskId = null) {
    const workerData = this.workers.get(workerId);
    if (!workerData || !workerData.isActive) {
      console.error(`Worker ${workerId} not found or inactive`);
      return null;
    }
    
    const id = taskId || this.generateTaskId();
    const task = {
      id,
      data: taskData,
      sentAt: Date.now(),
      workerId
    };
    
    workerData.worker.postMessage({
      taskId: id,
      ...taskData
    });
    
    this.taskQueue.push(task);
    console.log(`Task ${id} sent to worker ${workerId}`);
    
    return id;
  }
  
  // Handle worker messages
  handleWorkerMessage(workerId, event) {
    const { taskId, result, error, type } = event.data;
    
    if (error) {
      console.error(`Worker ${workerId} task ${taskId} failed:`, error);
      return;
    }
    
    const workerData = this.workers.get(workerId);
    if (workerData) {
      workerData.tasksCompleted++;
    }
    
    // Find and complete task
    const taskIndex = this.taskQueue.findIndex(task => task.id === taskId);
    if (taskIndex > -1) {
      const task = this.taskQueue.splice(taskIndex, 1)[0];
      const completedTask = {
        ...task,
        result,
        completedAt: Date.now(),
        duration: Date.now() - task.sentAt
      };
      
      this.completedTasks.set(taskId, completedTask);
      console.log(`Task ${taskId} completed in ${completedTask.duration}ms`);
      
      // Emit custom event for task completion
      this.emitTaskComplete(completedTask);
    }
  }
  
  // Handle worker errors
  handleWorkerError(workerId, error) {
    console.error(`Worker ${workerId} error:`, error);
    
    const workerData = this.workers.get(workerId);
    if (workerData) {
      workerData.isActive = false;
    }
  }
  
  // Terminate worker
  terminateWorker(workerId) {
    const workerData = this.workers.get(workerId);
    if (workerData) {
      workerData.worker.terminate();
      workerData.isActive = false;
      
      // Clean up blob URL if inline worker
      if (workerData.blobUrl) {
        URL.revokeObjectURL(workerData.blobUrl);
      }
      
      this.workers.delete(workerId);
      console.log(`Worker ${workerId} terminated`);
      return true;
    }
    return false;
  }
  
  // Terminate all workers
  terminateAllWorkers() {
    for (const workerId of this.workers.keys()) {
      this.terminateWorker(workerId);
    }
  }
  
  // Get worker statistics
  getWorkerStats() {
    const stats = {
      totalWorkers: this.workers.size,
      activeWorkers: 0,
      totalTasksCompleted: 0,
      pendingTasks: this.taskQueue.length,
      workers: {}
    };
    
    for (const [id, data] of this.workers) {
      if (data.isActive) stats.activeWorkers++;
      stats.totalTasksCompleted += data.tasksCompleted;
      
      stats.workers[id] = {
        script: data.script,
        tasksCompleted: data.tasksCompleted,
        isActive: data.isActive,
        uptime: Date.now() - data.createdAt
      };
    }
    
    return stats;
  }
  
  // Utility methods
  generateWorkerId() {
    return `worker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  emitTaskComplete(task) {
    const event = new CustomEvent('workerTaskComplete', {
      detail: task
    });
    document.dispatchEvent(event);
  }
}

// Example worker code for CPU-intensive tasks
const heavyComputationWorkerCode = `
  // Heavy computation worker
  self.onmessage = function(event) {
    const { taskId, operation, data } = event.data;
    
    try {
      let result;
      
      switch (operation) {
        case 'fibonacci':
          result = fibonacci(data.n);
          break;
          
        case 'primeFactors':
          result = primeFactors(data.number);
          break;
          
        case 'matrixMultiply':
          result = matrixMultiply(data.matrixA, data.matrixB);
          break;
          
        case 'sortLargeArray':
          result = data.array.sort((a, b) => a - b);
          break;
          
        default:
          throw new Error('Unknown operation: ' + operation);
      }
      
      self.postMessage({
        taskId,
        result,
        type: 'success'
      });
      
    } catch (error) {
      self.postMessage({
        taskId,
        error: error.message,
        type: 'error'
      });
    }
  };
  
  // Fibonacci calculation
  function fibonacci(n) {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }
  
  // Prime factorization
  function primeFactors(n) {
    const factors = [];
    let divisor = 2;
    
    while (n >= 2) {
      if (n % divisor === 0) {
        factors.push(divisor);
        n = n / divisor;
      } else {
        divisor++;
      }
    }
    
    return factors;
  }
  
  // Matrix multiplication
  function matrixMultiply(a, b) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < b.length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }
`;

// Usage example
const workerManager = new WebWorkerManager();

// Create inline worker for heavy computations
const computeWorkerId = workerManager.createInlineWorker(heavyComputationWorkerCode);

// Listen for task completion
document.addEventListener('workerTaskComplete', (event) => {
  const task = event.detail;
  console.log('Task completed:', {
    taskId: task.id,
    duration: task.duration,
    result: task.result
  });
});

// Send various tasks to worker
if (computeWorkerId) {
  // Fibonacci calculation
  workerManager.sendTask(computeWorkerId, {
    operation: 'fibonacci',
    data: { n: 40 }
  });
  
  // Prime factorization
  workerManager.sendTask(computeWorkerId, {
    operation: 'primeFactors',
    data: { number: 1234567 }
  });
  
  // Matrix multiplication
  const matrixA = [[1, 2], [3, 4]];
  const matrixB = [[5, 6], [7, 8]];
  workerManager.sendTask(computeWorkerId, {
    operation: 'matrixMultiply',
    data: { matrixA, matrixB }
  });
  
  // Large array sorting
  const largeArray = Array.from({ length: 100000 }, () => Math.random());
  workerManager.sendTask(computeWorkerId, {
    operation: 'sortLargeArray',
    data: { array: largeArray }
  });
}

// Show worker statistics after some time
setTimeout(() => {
  console.log('Worker Statistics:', workerManager.getWorkerStats());
}, 5000);

// Cleanup workers when page unloads
window.addEventListener('beforeunload', () => {
  workerManager.terminateAllWorkers();
});
```

### Advanced Web Worker Patterns

```javascript
// worker-pool.js - Worker pool implementation
class WorkerPool {
  constructor(workerScript, poolSize = 4) {
    this.workerScript = workerScript;
    this.poolSize = poolSize;
    this.workers = [];
    this.availableWorkers = [];
    this.busyWorkers = new Set();
    this.taskQueue = [];
    this.completedTasks = new Map();
    
    this.initializePool();
  }
  
  // Initialize worker pool
  initializePool() {
    for (let i = 0; i < this.poolSize; i++) {
      this.createPoolWorker(i);
    }
    console.log(`Worker pool initialized with ${this.poolSize} workers`);
  }
  
  // Create individual pool worker
  createPoolWorker(index) {
    const worker = new Worker(this.workerScript);
    const workerId = `pool_worker_${index}`;
    
    const workerData = {
      id: workerId,
      worker,
      index,
      tasksCompleted: 0,
      currentTask: null,
      createdAt: Date.now()
    };
    
    worker.onmessage = (event) => {
      this.handleWorkerComplete(workerId, event);
    };
    
    worker.onerror = (error) => {
      this.handleWorkerError(workerId, error);
    };
    
    this.workers.push(workerData);
    this.availableWorkers.push(workerData);
  }
  
  // Execute task using worker pool
  executeTask(taskData, priority = 0) {
    return new Promise((resolve, reject) => {
      const taskId = this.generateTaskId();
      const task = {
        id: taskId,
        data: taskData,
        priority,
        resolve,
        reject,
        createdAt: Date.now(),
        startedAt: null,
        completedAt: null
      };
      
      // Add to queue with priority
      this.addToQueue(task);
      
      // Process queue
      this.processQueue();
    });
  }
  
  // Add task to queue with priority sorting
  addToQueue(task) {
    this.taskQueue.push(task);
    
    // Sort by priority (higher priority first)
    this.taskQueue.sort((a, b) => b.priority - a.priority);
  }
  
  // Process task queue
  processQueue() {
    while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.taskQueue.shift();
      const workerData = this.availableWorkers.shift();
      
      this.assignTaskToWorker(task, workerData);
    }
  }
  
  // Assign task to specific worker
  assignTaskToWorker(task, workerData) {
    task.startedAt = Date.now();
    task.workerId = workerData.id;
    
    workerData.currentTask = task;
    this.busyWorkers.add(workerData);
    
    // Send task to worker
    workerData.worker.postMessage({
      taskId: task.id,
      ...task.data
    });
    
    console.log(`Task ${task.id} assigned to worker ${workerData.id}`);
  }
  
  // Handle worker task completion
  handleWorkerComplete(workerId, event) {
    const workerData = this.workers.find(w => w.id === workerId);
    if (!workerData || !workerData.currentTask) return;
    
    const task = workerData.currentTask;
    const { result, error } = event.data;
    
    task.completedAt = Date.now();
    task.duration = task.completedAt - task.startedAt;
    
    // Update worker stats
    workerData.tasksCompleted++;
    workerData.currentTask = null;
    
    // Move worker back to available pool
    this.busyWorkers.delete(workerData);
    this.availableWorkers.push(workerData);
    
    // Store completed task
    this.completedTasks.set(task.id, task);
    
    // Resolve or reject promise
    if (error) {
      task.reject(new Error(error));
      console.error(`Task ${task.id} failed:`, error);
    } else {
      task.resolve(result);
      console.log(`Task ${task.id} completed in ${task.duration}ms`);
    }
    
    // Process next task in queue
    this.processQueue();
  }
  
  // Handle worker errors
  handleWorkerError(workerId, error) {
    console.error(`Worker ${workerId} error:`, error);
    
    const workerData = this.workers.find(w => w.id === workerId);
    if (workerData && workerData.currentTask) {
      workerData.currentTask.reject(error);
      workerData.currentTask = null;
      
      // Move worker back to available pool
      this.busyWorkers.delete(workerData);
      this.availableWorkers.push(workerData);
    }
  }
  
  // Get pool statistics
  getPoolStats() {
    return {
      poolSize: this.poolSize,
      availableWorkers: this.availableWorkers.length,
      busyWorkers: this.busyWorkers.size,
      queuedTasks: this.taskQueue.length,
      completedTasks: this.completedTasks.size,
      totalTasksCompleted: this.workers.reduce((sum, w) => sum + w.tasksCompleted, 0),
      workers: this.workers.map(w => ({
        id: w.id,
        tasksCompleted: w.tasksCompleted,
        currentTask: w.currentTask ? w.currentTask.id : null,
        uptime: Date.now() - w.createdAt
      }))
    };
  }
  
  // Terminate all workers in pool
  terminate() {
    this.workers.forEach(workerData => {
      workerData.worker.terminate();
    });
    
    this.workers = [];
    this.availableWorkers = [];
    this.busyWorkers.clear();
    
    // Reject pending tasks
    this.taskQueue.forEach(task => {
      task.reject(new Error('Worker pool terminated'));
    });
    this.taskQueue = [];
    
    console.log('Worker pool terminated');
  }
  
  generateTaskId() {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Example usage with worker pool
const poolWorkerCode = `
  self.onmessage = function(event) {
    const { taskId, operation, data } = event.data;
    
    try {
      let result;
      
      switch (operation) {
        case 'heavyComputation':
          result = performHeavyComputation(data.iterations);
          break;
          
        case 'dataProcessing':
          result = processData(data.items);
          break;
          
        case 'imageProcessing':
          result = processImage(data.imageData);
          break;
          
        default:
          throw new Error('Unknown operation');
      }
      
      self.postMessage({ taskId, result });
      
    } catch (error) {
      self.postMessage({ taskId, error: error.message });
    }
  };
  
  function performHeavyComputation(iterations) {
    let result = 0;
    for (let i = 0; i < iterations; i++) {
      result += Math.sqrt(i) * Math.sin(i);
    }
    return result;
  }
  
  function processData(items) {
    return items
      .filter(item => item.value > 0)
      .map(item => ({ ...item, processed: true, timestamp: Date.now() }))
      .sort((a, b) => b.value - a.value);
  }
  
  function processImage(imageData) {
    // Simulate image processing
    const processed = new Array(imageData.length);
    for (let i = 0; i < imageData.length; i += 4) {
      // Convert to grayscale
      const gray = (imageData[i] + imageData[i + 1] + imageData[i + 2]) / 3;
      processed[i] = gray;     // R
      processed[i + 1] = gray; // G
      processed[i + 2] = gray; // B
      processed[i + 3] = imageData[i + 3]; // A
    }
    return processed;
  }
`;

// Create worker pool
const blob = new Blob([poolWorkerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(blob);
const workerPool = new WorkerPool(workerUrl, 4);

// Execute tasks with different priorities
async function runPoolDemo() {
  console.log('=== Worker Pool Demo ===');
  
  try {
    // High priority task
    const highPriorityTask = workerPool.executeTask({
      operation: 'heavyComputation',
      data: { iterations: 1000000 }
    }, 10);
    
    // Normal priority tasks
    const normalTasks = [];
    for (let i = 0; i < 5; i++) {
      normalTasks.push(workerPool.executeTask({
        operation: 'dataProcessing',
        data: {
          items: Array.from({ length: 1000 }, (_, j) => ({
            id: j,
            value: Math.random() * 100
          }))
        }
      }, 5));
    }
    
    // Low priority task
    const lowPriorityTask = workerPool.executeTask({
      operation: 'imageProcessing',
      data: {
        imageData: new Array(1000000).fill(0).map(() => Math.floor(Math.random() * 255))
      }
    }, 1);
    
    // Wait for all tasks
    const results = await Promise.all([
      highPriorityTask,
      ...normalTasks,
      lowPriorityTask
    ]);
    
    console.log('All tasks completed');
    console.log('Pool stats:', workerPool.getPoolStats());
    
  } catch (error) {
    console.error('Task execution failed:', error);
  }
}

// Run demo
runPoolDemo();

// Cleanup
window.addEventListener('beforeunload', () => {
  workerPool.terminate();
  URL.revokeObjectURL(workerUrl);
});
```

## Service Workers

### Basic Service Worker Implementation

```javascript
// service-worker-manager.js - Service Worker management
class ServiceWorkerManager {
  constructor() {
    this.registration = null;
    this.isSupported = 'serviceWorker' in navigator;
    this.updateAvailable = false;
    this.eventListeners = new Map();
  }
  
  // Register service worker
  async registerServiceWorker(scriptUrl, options = {}) {
    if (!this.isSupported) {
      throw new Error('Service Workers not supported');
    }
    
    try {
      console.log('Registering service worker:', scriptUrl);
      
      this.registration = await navigator.serviceWorker.register(scriptUrl, {
        scope: '/',
        ...options
      });
      
      console.log('Service worker registered:', this.registration.scope);
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Check for updates
      this.checkForUpdates();
      
      return this.registration;
      
    } catch (error) {
      console.error('Service worker registration failed:', error);
      throw error;
    }
  }
  
  // Set up service worker event listeners
  setupEventListeners() {
    if (!this.registration) return;
    
    // Listen for service worker updates
    this.registration.addEventListener('updatefound', () => {
      console.log('Service worker update found');
      this.handleUpdateFound();
    });
    
    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event);
    });
    
    // Listen for controller changes
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service worker controller changed');
      this.emit('controllerchange');
    });
  }
  
  // Handle service worker updates
  handleUpdateFound() {
    const newWorker = this.registration.installing;
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New service worker available
          this.updateAvailable = true;
          console.log('New service worker available');
          this.emit('updateavailable', newWorker);
        } else {
          // First time installation
          console.log('Service worker installed for first time');
          this.emit('installed', newWorker);
        }
      }
    });
  }
  
  // Handle messages from service worker
  handleServiceWorkerMessage(event) {
    const { type, payload } = event.data;
    
    console.log('Message from service worker:', type, payload);
    
    switch (type) {
      case 'CACHE_UPDATED':
        this.emit('cacheupdated', payload);
        break;
        
      case 'OFFLINE_READY':
        this.emit('offlineready', payload);
        break;
        
      case 'UPDATE_AVAILABLE':
        this.updateAvailable = true;
        this.emit('updateavailable', payload);
        break;
        
      default:
        this.emit('message', { type, payload });
    }
  }
  
  // Send message to service worker
  sendMessage(message) {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage(message);
    } else {
      console.warn('No service worker controller available');
    }
  }
  
  // Skip waiting and activate new service worker
  async skipWaiting() {
    if (this.registration && this.registration.waiting) {
      this.sendMessage({ type: 'SKIP_WAITING' });
      return true;
    }
    return false;
  }
  
  // Check for service worker updates
  async checkForUpdates() {
    if (this.registration) {
      try {
        await this.registration.update();
        console.log('Checked for service worker updates');
      } catch (error) {
        console.error('Failed to check for updates:', error);
      }
    }
  }
  
  // Unregister service worker
  async unregister() {
    if (this.registration) {
      try {
        const result = await this.registration.unregister();
        console.log('Service worker unregistered:', result);
        this.registration = null;
        return result;
      } catch (error) {
        console.error('Failed to unregister service worker:', error);
        throw error;
      }
    }
    return false;
  }
  
  // Get service worker status
  getStatus() {
    if (!this.isSupported) {
      return { supported: false };
    }
    
    return {
      supported: true,
      registered: !!this.registration,
      scope: this.registration?.scope,
      updateAvailable: this.updateAvailable,
      controller: !!navigator.serviceWorker.controller,
      state: this.registration?.active?.state
    };
  }
  
  // Event emitter methods
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }
  
  off(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  emit(event, data) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Event listener error:', error);
        }
      });
    }
  }
}

// Service worker script content
const serviceWorkerScript = `
// service-worker.js - Service worker implementation
const CACHE_NAME = 'app-cache-v1';
const OFFLINE_URL = '/offline.html';

// Files to cache on install
const CACHE_URLS = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/offline.html'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  console.log('Service worker installing');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching app shell');
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service worker activating');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients
        return self.clients.claim();
      })
      .then(() => {
        // Notify clients that offline functionality is ready
        return self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'OFFLINE_READY',
              payload: { cacheName: CACHE_NAME }
            });
          });
        });
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache
          return cachedResponse;
        }
        
        // Fetch from network
        return fetch(event.request)
          .then((response) => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone response for caching
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Network failed, try to serve offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            
            // For other requests, return a generic offline response
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_CACHE_STATUS':
      getCacheStatus().then((status) => {
        event.ports[0].postMessage({
          type: 'CACHE_STATUS',
          payload: status
        });
      });
      break;
      
    case 'CLEAR_CACHE':
      clearCache().then((result) => {
        event.ports[0].postMessage({
          type: 'CACHE_CLEARED',
          payload: result
        });
      });
      break;
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Push event for notifications
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/explore-icon.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/close-icon.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('App Notification', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Helper functions
async function getCacheStatus() {
  const cache = await caches.open(CACHE_NAME);
  const keys = await cache.keys();
  
  return {
    cacheName: CACHE_NAME,
    cachedUrls: keys.map(request => request.url),
    cacheSize: keys.length
  };
}

async function clearCache() {
  const cacheNames = await caches.keys();
  const deletePromises = cacheNames.map(name => caches.delete(name));
  
  await Promise.all(deletePromises);
  
  return {
    cleared: cacheNames,
    count: cacheNames.length
  };
}

async function doBackgroundSync() {
  // Implement background sync logic
  console.log('Performing background sync');
  
  try {
    // Sync pending data
    const pendingData = await getPendingData();
    
    for (const data of pendingData) {
      await syncData(data);
    }
    
    console.log('Background sync completed');
  } catch (error) {
    console.error('Background sync failed:', error);
    throw error;
  }
}

async function getPendingData() {
  // Get data that needs to be synced
  return [];
}

async function syncData(data) {
  // Sync individual data item
  return fetch('/api/sync', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
`;

// Usage example
const swManager = new ServiceWorkerManager();

// Create service worker blob and register
const swBlob = new Blob([serviceWorkerScript], { type: 'application/javascript' });
const swUrl = URL.createObjectURL(swBlob);

// Register service worker
swManager.registerServiceWorker(swUrl)
  .then(() => {
    console.log('Service worker setup complete');
  })
  .catch((error) => {
    console.error('Service worker setup failed:', error);
  });

// Listen for service worker events
swManager.on('updateavailable', () => {
  console.log('Update available - showing notification');
  
  // Show update notification to user
  if (confirm('A new version is available. Update now?')) {
    swManager.skipWaiting();
    window.location.reload();
  }
});

swManager.on('offlineready', () => {
  console.log('App is ready to work offline');
});

swManager.on('cacheupdated', (data) => {
  console.log('Cache updated:', data);
});

// Periodic update checks
setInterval(() => {
  swManager.checkForUpdates();
}, 60000); // Check every minute

// Show service worker status
setTimeout(() => {
  console.log('Service Worker Status:', swManager.getStatus());
}, 2000);
```

## SharedArrayBuffer and Atomics

### Shared Memory Between Workers

```javascript
// shared-memory.js - SharedArrayBuffer and Atomics usage
class SharedMemoryManager {
  constructor() {
    this.isSupported = typeof SharedArrayBuffer !== 'undefined';
    this.sharedBuffers = new Map();
    this.workers = [];
  }
  
  // Create shared buffer
  createSharedBuffer(name, size) {
    if (!this.isSupported) {
      throw new Error('SharedArrayBuffer not supported');
    }
    
    const buffer = new SharedArrayBuffer(size);
    const view = new Int32Array(buffer);
    
    this.sharedBuffers.set(name, {
      buffer,
      view,
      size,
      createdAt: Date.now()
    });
    
    console.log(\`Shared buffer '\${name}' created with \${size} bytes\`);
    return { buffer, view };
  }
  
  // Create worker with shared memory access
  createSharedWorker(workerCode, sharedBufferName) {
    const sharedData = this.sharedBuffers.get(sharedBufferName);
    if (!sharedData) {
      throw new Error(\`Shared buffer '\${sharedBufferName}' not found\`);
    }
    
    // Create worker with shared buffer access
    const workerScript = \`
      const sharedBuffer = new Int32Array(arguments[0]);
      
      \${workerCode}
    \`;
    
    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl, { type: 'module' });
    
    // Pass shared buffer to worker
    worker.postMessage({
      type: 'INIT_SHARED_BUFFER',
      buffer: sharedData.buffer
    });
    
    const workerId = \`shared_worker_\${Date.now()}_\${Math.random().toString(36).substr(2, 9)}\`;
    
    this.workers.push({
      id: workerId,
      worker,
      sharedBufferName,
      url: workerUrl,
      createdAt: Date.now()
    });
    
    return { workerId, worker };
  }
  
  // Demonstrate atomic operations
  demonstrateAtomics() {
    console.log('=== Atomic Operations Demo ===');
    
    if (!this.isSupported) {
      console.log('SharedArrayBuffer not supported - skipping demo');
      return;
    }
    
    // Create shared buffer for atomic operations
    const { buffer, view } = this.createSharedBuffer('atomics_demo', 64);
    
    // Initialize values
    view[0] = 100; // Counter
    view[1] = 0;   // Lock
    view[2] = 0;   // Sum
    
    console.log('Initial values:', {
      counter: view[0],
      lock: view[1],
      sum: view[2]
    });
    
    // Atomic operations
    console.log('\\nAtomic operations:');
    
    // Atomic add
    const oldValue = Atomics.add(view, 0, 10);
    console.log(\`Atomics.add(counter, 10): \${oldValue} -> \${view[0]}\`);
    
    // Atomic compare and exchange
    const exchanged = Atomics.compareExchange(view, 1, 0, 1);
    console.log(\`Atomics.compareExchange(lock, 0, 1): \${exchanged} (lock acquired: \${view[1]})\`);
    
    // Atomic load and store
    Atomics.store(view, 2, 42);
    const loaded = Atomics.load(view, 2);
    console.log(\`Atomics.store/load(sum, 42): \${loaded}\`);
    
    // Atomic exchange
    const previous = Atomics.exchange(view, 1, 0);
    console.log(\`Atomics.exchange(lock, 0): \${previous} (lock released: \${view[1]})\`);
    
    return view;
  }
  
  // Create producer-consumer example
  createProducerConsumer() {
    if (!this.isSupported) {
      console.log('SharedArrayBuffer not supported');
      return;
    }
    
    console.log('\\n=== Producer-Consumer Demo ===');
    
    // Create shared buffer for producer-consumer
    const bufferSize = 1024; // 256 int32 values
    const { buffer } = this.createSharedBuffer('producer_consumer', bufferSize);
    
    // Producer worker
    const producerCode = \`
      let sharedArray;
      
      self.onmessage = function(event) {
        if (event.data.type === 'INIT_SHARED_BUFFER') {
          sharedArray = new Int32Array(event.data.buffer);
          startProducing();
        }
      };
      
      function startProducing() {
        const BUFFER_SIZE = sharedArray.length - 2; // Reserve 2 slots for head/tail
        let head = 0;
        let produced = 0;
        
        const produce = () => {
          const tail = Atomics.load(sharedArray, 1);
          const nextHead = (head + 1) % BUFFER_SIZE;
          
          // Check if buffer is full
          if (nextHead === tail) {
            setTimeout(produce, 1); // Wait and retry
            return;
          }
          
          // Produce item
          const item = Math.floor(Math.random() * 1000);
          Atomics.store(sharedArray, 2 + head, item);
          
          // Update head atomically
          Atomics.store(sharedArray, 0, nextHead);
          head = nextHead;
          produced++;
          
          self.postMessage({
            type: 'PRODUCED',
            item,
            produced,
            head,
            tail
          });
          
          if (produced < 100) {
            setTimeout(produce, Math.random() * 10);
          }
        };
        
        produce();
      }
    \`;
    
    // Consumer worker
    const consumerCode = \`
      let sharedArray;
      
      self.onmessage = function(event) {
        if (event.data.type === 'INIT_SHARED_BUFFER') {
          sharedArray = new Int32Array(event.data.buffer);
          startConsuming();
        }
      };
      
      function startConsuming() {
        const BUFFER_SIZE = sharedArray.length - 2;
        let tail = 0;
        let consumed = 0;
        
        const consume = () => {
          const head = Atomics.load(sharedArray, 0);
          
          // Check if buffer is empty
          if (tail === head) {
            setTimeout(consume, 1); // Wait and retry
            return;
          }
          
          // Consume item
          const item = Atomics.load(sharedArray, 2 + tail);
          
          // Update tail atomically
          const nextTail = (tail + 1) % BUFFER_SIZE;
          Atomics.store(sharedArray, 1, nextTail);
          tail = nextTail;
          consumed++;
          
          self.postMessage({
            type: 'CONSUMED',
            item,
            consumed,
            head,
            tail
          });
          
          if (consumed < 100) {
            setTimeout(consume, Math.random() * 15);
          }
        };
        
        consume();
      }
    \`;
    
    // Create workers
    const { worker: producer } = this.createSharedWorker(producerCode, 'producer_consumer');
    const { worker: consumer } = this.createSharedWorker(consumerCode, 'producer_consumer');
    
    // Listen to worker messages
    producer.onmessage = (event) => {
      if (event.data.type === 'PRODUCED') {
        console.log(\`Produced: \${event.data.item} (total: \${event.data.produced})\`);
      }
    };
    
    consumer.onmessage = (event) => {
      if (event.data.type === 'CONSUMED') {
        console.log(\`Consumed: \${event.data.item} (total: \${event.data.consumed})\`);
      }
    };
    
    return { producer, consumer };
  }
  
  // Cleanup all workers and buffers
  cleanup() {
    this.workers.forEach(({ worker, url }) => {
      worker.terminate();
      URL.revokeObjectURL(url);
    });
    
    this.workers = [];
    this.sharedBuffers.clear();
    
    console.log('Shared memory manager cleaned up');
  }
  
  // Get status
  getStatus() {
    return {
      supported: this.isSupported,
      sharedBuffers: Array.from(this.sharedBuffers.keys()),
      activeWorkers: this.workers.length,
      workers: this.workers.map(w => ({
        id: w.id,
        sharedBuffer: w.sharedBufferName,
        uptime: Date.now() - w.createdAt
      }))
    };
  }
}

// Usage example
const sharedMemoryManager = new SharedMemoryManager();

// Demonstrate atomic operations
sharedMemoryManager.demonstrateAtomics();

// Create producer-consumer example
if (sharedMemoryManager.isSupported) {
  const { producer, consumer } = sharedMemoryManager.createProducerConsumer();
  
  // Cleanup after demo
  setTimeout(() => {
    console.log('\\nShared Memory Manager Status:', sharedMemoryManager.getStatus());
    sharedMemoryManager.cleanup();
  }, 10000);
} else {
  console.log('SharedArrayBuffer not supported in this environment');
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  sharedMemoryManager.cleanup();
});
```

## Key Takeaways

* **Web Workers enable background processing** without blocking the main thread
* **Worker pools manage multiple workers** efficiently for parallel processing
* **Service Workers provide offline functionality** and network request interception
* **SharedArrayBuffer enables shared memory** between workers for high-performance computing
* **Atomics provide thread-safe operations** on shared memory
* **Proper worker lifecycle management** prevents memory leaks
* **Message passing is the primary communication** method between threads
* **Service Workers cache resources** for offline-first applications
* **Background sync enables** data synchronization when connectivity returns
* **Worker termination is important** for resource cleanup
```
