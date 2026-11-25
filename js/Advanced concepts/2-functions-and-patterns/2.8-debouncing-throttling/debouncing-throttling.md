# **8. Debouncing & Throttling**

### 1️⃣ Explanation

**Debouncing** delays function execution until after a specified time has passed since the last call.

**Throttling** limits function execution to at most once per specified time interval.

Use cases:
* **Debouncing**: Search input, resize events, button clicks
* **Throttling**: Scroll events, mouse movement, API calls

---

### 2️⃣ Mental Model

```
Debouncing:
Events: ||||||||    (rapid events)
Calls:           |  (only last one executes)

Throttling:
Events: ||||||||||||||||
Calls:  |   |   |   |   (regular intervals)
```

---

### 3️⃣ Debouncing Implementation

**Basic Debounce:**
```javascript
function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Usage
const searchInput = document.getElementById('search');
const debouncedSearch = debounce(function(event) {
  console.log('Searching for:', event.target.value);
  // Perform search API call
}, 300);

searchInput.addEventListener('input', debouncedSearch);
```

**Advanced Debounce with Immediate:**
```javascript
function debounce(func, delay, immediate = false) {
  let timeoutId;
  
  return function(...args) {
    const callNow = immediate && !timeoutId;
    
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) func.apply(this, args);
    }, delay);
    
    if (callNow) func.apply(this, args);
  };
}
```

---

### 4️⃣ Throttling Implementation

**Basic Throttle:**
```javascript
function throttle(func, limit) {
  let inThrottle;
  
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Usage
const throttledScroll = throttle(function() {
  console.log('Scroll event handled');
  // Handle scroll logic
}, 100);

window.addEventListener('scroll', throttledScroll);
```

**Advanced Throttle with Leading/Trailing:**
```javascript
function throttle(func, limit, options = {}) {
  let timeout;
  let previous = 0;
  
  return function(...args) {
    const now = Date.now();
    
    if (!previous && options.leading === false) {
      previous = now;
    }
    
    const remaining = limit - (now - previous);
    
    if (remaining <= 0 || remaining > limit) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      
      previous = now;
      func.apply(this, args);
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(() => {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}
```

---

### 5️⃣ Real-World Examples

**Search Autocomplete:**
```javascript
const searchBox = document.getElementById('search');
const resultsContainer = document.getElementById('results');

const performSearch = debounce(async function(query) {
  if (query.length < 2) {
    resultsContainer.innerHTML = '';
    return;
  }
  
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const results = await response.json();
    
    resultsContainer.innerHTML = results
      .map(item => `<div class="result">${item.title}</div>`)
      .join('');
  } catch (error) {
    console.error('Search failed:', error);
  }
}, 300);

searchBox.addEventListener('input', (e) => {
  performSearch(e.target.value);
});
```

**Infinite Scroll:**
```javascript
const loadMoreContent = throttle(async function() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
    console.log('Loading more content...');
    
    try {
      const response = await fetch('/api/content?page=' + currentPage);
      const newContent = await response.json();
      
      appendContentToPage(newContent);
      currentPage++;
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  }
}, 200);

window.addEventListener('scroll', loadMoreContent);
```

**Button Click Protection:**
```javascript
const saveButton = document.getElementById('save');

const debouncedSave = debounce(async function() {
  saveButton.disabled = true;
  saveButton.textContent = 'Saving...';
  
  try {
    await saveData();
    showSuccessMessage('Data saved successfully!');
  } catch (error) {
    showErrorMessage('Failed to save data');
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = 'Save';
  }
}, 500);

saveButton.addEventListener('click', debouncedSave);
```

---

### 6️⃣ Key Takeaways

* **Debouncing** waits for pause in events before executing
* **Throttling** executes at regular intervals regardless of event frequency
* **Debouncing** is great for search inputs and form validation
* **Throttling** is perfect for scroll and resize events
* Both techniques **improve performance** and **user experience**
