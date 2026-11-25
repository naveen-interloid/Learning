# **7.3 Performance Profiling**

Performance profiling involves measuring, analyzing, and optimizing JavaScript application performance using browser DevTools, Performance APIs, and custom monitoring solutions.

## Browser DevTools Profiling

### Chrome DevTools Performance Tab
- **Timeline Recording**: Capture performance data during user interactions
- **CPU Profiling**: Identify expensive function calls and bottlenecks
- **Memory Profiling**: Track heap usage and garbage collection
- **Network Analysis**: Monitor resource loading and timing

### Key Metrics to Monitor
- **First Contentful Paint (FCP)**: When first content appears
- **Largest Contentful Paint (LCP)**: When main content loads
- **Time to Interactive (TTI)**: When page becomes fully interactive
- **Total Blocking Time (TBT)**: Main thread blocking duration

## Performance APIs

### User Timing API
```javascript
// Mark performance points
performance.mark('operation-start');
expensiveOperation();
performance.mark('operation-end');

// Measure duration
performance.measure('operation-duration', 'operation-start', 'operation-end');

// Get measurements
const measures = performance.getEntriesByType('measure');
console.log('Operation took:', measures[0].duration, 'ms');
```

### Performance Observer
```javascript
// Monitor performance entries
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});

observer.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
```

## Custom Performance Monitoring

### Function Performance Wrapper
```javascript
function profileFunction(fn, name) {
  return function(...args) {
    const start = performance.now();
    const result = fn.apply(this, args);
    const end = performance.now();
    
    console.log(`${name}: ${(end - start).toFixed(2)}ms`);
    return result;
  };
}
```

### Memory Usage Tracking
```javascript
function trackMemoryUsage() {
  if (performance.memory) {
    return {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    };
  }
  return null;
}
```

## Performance Analysis Techniques

### Identifying Bottlenecks
1. **CPU Profiling**: Find slow functions
2. **Memory Analysis**: Detect leaks and excessive usage
3. **Network Monitoring**: Optimize resource loading
4. **Rendering Performance**: Minimize layout thrashing

### Common Performance Issues
- **Long Tasks**: Operations blocking main thread > 50ms
- **Memory Leaks**: Gradual memory consumption increase
- **Inefficient Algorithms**: Poor time/space complexity
- **Excessive DOM Manipulation**: Frequent layout recalculations

## Key Takeaways

* **Use browser DevTools** for comprehensive performance analysis
* **Performance APIs provide programmatic** measurement capabilities
* **Custom monitoring helps track** application-specific metrics
* **Regular profiling identifies** performance regressions early
* **Focus on user-perceived performance** metrics like LCP and FID
* **Memory profiling prevents** long-term performance degradation
