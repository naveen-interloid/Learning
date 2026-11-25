# **8. Observables (RxJS Basics)**

### 1️⃣ Understanding Observables

**What are Observables?**
Observables are a way to handle asynchronous data streams. They represent a collection of future values or events that can be observed over time.

```javascript
// Basic Observable concept (without RxJS)
class SimpleObservable {
  constructor(subscribeFn) {
    this.subscribeFn = subscribeFn;
  }
  
  subscribe(observer) {
    return this.subscribeFn(observer);
  }
}

// Create an observable
const observable = new SimpleObservable((observer) => {
  observer.next('Hello');
  observer.next('World');
  observer.complete();
  
  // Return cleanup function
  return () => {
    console.log('Cleanup');
  };
});

// Subscribe to the observable
const subscription = observable.subscribe({
  next: value => console.log('Received:', value),
  complete: () => console.log('Complete')
});
```

**RxJS Observable:**
```javascript
import { Observable } from 'rxjs';

const observable = new Observable(subscriber => {
  subscriber.next('Hello');
  subscriber.next('World');
  subscriber.complete();
  
  // Cleanup function
  return () => {
    console.log('Cleanup executed');
  };
});

const subscription = observable.subscribe({
  next: value => console.log('Value:', value),
  error: error => console.error('Error:', error),
  complete: () => console.log('Completed')
});

// Later, unsubscribe to trigger cleanup
subscription.unsubscribe();
```

---

### 2️⃣ Observable vs Promise vs Callback

**Comparison:**
```javascript
import { Observable, of, from } from 'rxjs';

// Callback approach
function fetchDataCallback(callback) {
  setTimeout(() => {
    callback(null, 'Data from callback');
  }, 1000);
}

// Promise approach
function fetchDataPromise() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('Data from promise');
    }, 1000);
  });
}

// Observable approach
function fetchDataObservable() {
  return new Observable(subscriber => {
    setTimeout(() => {
      subscriber.next('Data from observable');
      subscriber.complete();
    }, 1000);
  });
}

// Usage comparison
// Callback - single value, no cancellation
fetchDataCallback((error, data) => {
  console.log('Callback:', data);
});

// Promise - single value, no cancellation
fetchDataPromise().then(data => {
  console.log('Promise:', data);
});

// Observable - multiple values, cancellable
const subscription = fetchDataObservable().subscribe({
  next: data => console.log('Observable:', data),
  complete: () => console.log('Observable completed')
});

// Can cancel the observable
// subscription.unsubscribe();
```

**Key Differences:**
- **Callbacks**: Single value, no cancellation, callback hell
- **Promises**: Single value, no cancellation, better composition
- **Observables**: Multiple values, cancellable, powerful operators

---

### 3️⃣ Creating Observables

**Using Observable Constructor:**
```javascript
import { Observable } from 'rxjs';

// Timer observable
const timer = new Observable(subscriber => {
  let count = 0;
  const intervalId = setInterval(() => {
    subscriber.next(count++);
    
    if (count > 5) {
      subscriber.complete();
    }
  }, 1000);
  
  // Cleanup function
  return () => {
    clearInterval(intervalId);
    console.log('Timer cleaned up');
  };
});

timer.subscribe({
  next: value => console.log('Timer:', value),
  complete: () => console.log('Timer completed')
});
```

**Using Creation Operators:**
```javascript
import { of, from, interval, fromEvent, ajax } from 'rxjs';

// of - emit values in sequence
const values = of(1, 2, 3, 4, 5);
values.subscribe(value => console.log('of:', value));

// from - convert array, promise, or iterable to observable
const fromArray = from([1, 2, 3, 4, 5]);
const fromPromise = from(fetch('/api/data'));

// interval - emit values at regular intervals
const intervalObs = interval(1000); // Every second
const sub = intervalObs.subscribe(value => console.log('Interval:', value));
setTimeout(() => sub.unsubscribe(), 5000); // Stop after 5 seconds

// fromEvent - convert DOM events to observable
const button = document.getElementById('myButton');
const clicks = fromEvent(button, 'click');
clicks.subscribe(event => console.log('Button clicked:', event));

// ajax - HTTP requests
const request = ajax('/api/users');
request.subscribe({
  next: response => console.log('Users:', response.response),
  error: error => console.error('Request failed:', error)
});
```

---

### 4️⃣ Basic Operators

**Map Operator:**
```javascript
import { of } from 'rxjs';
import { map } from 'rxjs/operators';

const numbers = of(1, 2, 3, 4, 5);
const doubled = numbers.pipe(
  map(x => x * 2)
);

doubled.subscribe(value => console.log('Doubled:', value));
// Output: 2, 4, 6, 8, 10
```

**Filter Operator:**
```javascript
import { of } from 'rxjs';
import { filter } from 'rxjs/operators';

const numbers = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
const evenNumbers = numbers.pipe(
  filter(x => x % 2 === 0)
);

evenNumbers.subscribe(value => console.log('Even:', value));
// Output: 2, 4, 6, 8, 10
```

**Combining Operators:**
```javascript
import { of } from 'rxjs';
import { map, filter, take } from 'rxjs/operators';

const numbers = of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10);
const result = numbers.pipe(
  filter(x => x % 2 === 0),  // Only even numbers
  map(x => x * x),           // Square them
  take(3)                    // Take first 3
);

result.subscribe(value => console.log('Result:', value));
// Output: 4, 16, 36
```

---

### 5️⃣ Error Handling

**Basic Error Handling:**
```javascript
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

const riskyObservable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.error(new Error('Something went wrong!'));
  subscriber.next(3); // This won't be emitted
});

riskyObservable.pipe(
  catchError(error => {
    console.error('Caught error:', error.message);
    return of('Error handled'); // Return fallback observable
  })
).subscribe({
  next: value => console.log('Value:', value),
  complete: () => console.log('Completed')
});
```

**Retry Logic:**
```javascript
import { ajax } from 'rxjs/ajax';
import { retry, catchError, delay } from 'rxjs/operators';
import { of } from 'rxjs';

const apiCall = ajax('/api/unreliable-endpoint').pipe(
  retry(3), // Retry up to 3 times
  catchError(error => {
    console.error('All retries failed:', error);
    return of({ error: 'Service unavailable' });
  })
);

apiCall.subscribe({
  next: response => console.log('Response:', response),
  error: error => console.error('Final error:', error)
});
```

**Advanced Error Handling:**
```javascript
import { of, throwError } from 'rxjs';
import { mergeMap, catchError, retryWhen, delay, take } from 'rxjs/operators';

function fetchWithRetry(url) {
  return ajax(url).pipe(
    retryWhen(errors => 
      errors.pipe(
        delay(1000), // Wait 1 second before retry
        take(3),     // Maximum 3 retries
        catchError(() => throwError('Max retries exceeded'))
      )
    ),
    catchError(error => {
      console.error('Request failed:', error);
      return of({ error: 'Failed to fetch data' });
    })
  );
}
```

---

### 6️⃣ Async Operations with Observables

**HTTP Requests:**
```javascript
import { ajax } from 'rxjs/ajax';
import { map, catchError, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

// Simple GET request
const getUsers = ajax.getJSON('/api/users').pipe(
  map(users => users.filter(user => user.active)),
  catchError(error => {
    console.error('Failed to fetch users:', error);
    return of([]);
  })
);

getUsers.subscribe(users => {
  console.log('Active users:', users);
});

// Chained requests
const getUserPosts = (userId) => {
  return ajax.getJSON(`/api/users/${userId}`).pipe(
    switchMap(user => 
      ajax.getJSON(`/api/users/${userId}/posts`).pipe(
        map(posts => ({ user, posts }))
      )
    ),
    catchError(error => {
      console.error('Failed to fetch user posts:', error);
      return of({ user: null, posts: [] });
    })
  );
};

getUserPosts(1).subscribe(result => {
  console.log('User and posts:', result);
});
```

**WebSocket Integration:**
```javascript
import { Observable } from 'rxjs';
import { share, retry } from 'rxjs/operators';

function createWebSocketObservable(url) {
  return new Observable(subscriber => {
    const socket = new WebSocket(url);
    
    socket.onopen = () => {
      console.log('WebSocket connected');
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        subscriber.next(data);
      } catch (error) {
        subscriber.error(error);
      }
    };
    
    socket.onerror = (error) => {
      subscriber.error(error);
    };
    
    socket.onclose = () => {
      subscriber.complete();
    };
    
    // Cleanup function
    return () => {
      socket.close();
    };
  }).pipe(
    retry(3), // Retry connection up to 3 times
    share()   // Share the connection among multiple subscribers
  );
}

const websocket = createWebSocketObservable('ws://localhost:8080');
websocket.subscribe({
  next: data => console.log('WebSocket data:', data),
  error: error => console.error('WebSocket error:', error),
  complete: () => console.log('WebSocket connection closed')
});
```

---

### 7️⃣ Combining Observables

**Merge - Combine multiple observables:**
```javascript
import { interval, merge } from 'rxjs';
import { map, take } from 'rxjs/operators';

const timer1 = interval(1000).pipe(
  map(x => `Timer1: ${x}`),
  take(5)
);

const timer2 = interval(1500).pipe(
  map(x => `Timer2: ${x}`),
  take(3)
);

const merged = merge(timer1, timer2);
merged.subscribe(value => console.log(value));
```

**CombineLatest - Combine latest values:**
```javascript
import { combineLatest, interval } from 'rxjs';
import { map, take } from 'rxjs/operators';

const timer1 = interval(1000).pipe(take(5));
const timer2 = interval(1500).pipe(take(3));

const combined = combineLatest([timer1, timer2]).pipe(
  map(([val1, val2]) => `Combined: ${val1}, ${val2}`)
);

combined.subscribe(value => console.log(value));
```

**Zip - Pair values by index:**
```javascript
import { zip, of } from 'rxjs';

const letters = of('A', 'B', 'C', 'D');
const numbers = of(1, 2, 3, 4);

const zipped = zip(letters, numbers).pipe(
  map(([letter, number]) => `${letter}${number}`)
);

zipped.subscribe(value => console.log(value));
// Output: A1, B2, C3, D4
```

---

### 8️⃣ Real-World Examples

**Search with Debounce:**
```javascript
import { fromEvent } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { of } from 'rxjs';

const searchInput = document.getElementById('search');
const searchResults = document.getElementById('results');

const search$ = fromEvent(searchInput, 'input').pipe(
  map(event => event.target.value),
  debounceTime(300),                    // Wait 300ms after user stops typing
  distinctUntilChanged(),               // Only if the value has changed
  switchMap(query => {
    if (query.length < 2) {
      return of([]);                    // Return empty results for short queries
    }
    
    return ajax.getJSON(`/api/search?q=${query}`).pipe(
      catchError(error => {
        console.error('Search error:', error);
        return of([]);
      })
    );
  })
);

search$.subscribe(results => {
  searchResults.innerHTML = results
    .map(result => `<div>${result.title}</div>`)
    .join('');
});
```

**Auto-save Feature:**
```javascript
import { fromEvent, merge } from 'rxjs';
import { debounceTime, switchMap, tap, catchError } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { of } from 'rxjs';

const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const statusDiv = document.getElementById('status');

const titleChanges$ = fromEvent(titleInput, 'input');
const contentChanges$ = fromEvent(contentInput, 'input');

const autoSave$ = merge(titleChanges$, contentChanges$).pipe(
  debounceTime(2000),                   // Wait 2 seconds after user stops typing
  tap(() => {
    statusDiv.textContent = 'Saving...';
  }),
  switchMap(() => {
    const data = {
      title: titleInput.value,
      content: contentInput.value
    };
    
    return ajax.post('/api/save', data).pipe(
      tap(() => {
        statusDiv.textContent = 'Saved';
      }),
      catchError(error => {
        statusDiv.textContent = 'Save failed';
        console.error('Save error:', error);
        return of(null);
      })
    );
  })
);

autoSave$.subscribe();
```

**Real-time Data Dashboard:**
```javascript
import { interval, combineLatest } from 'rxjs';
import { switchMap, startWith, catchError } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { of } from 'rxjs';

// Fetch different types of data at different intervals
const userStats$ = interval(5000).pipe(
  startWith(0),
  switchMap(() => ajax.getJSON('/api/stats/users')),
  catchError(() => of({ count: 0, active: 0 }))
);

const salesStats$ = interval(10000).pipe(
  startWith(0),
  switchMap(() => ajax.getJSON('/api/stats/sales')),
  catchError(() => of({ total: 0, today: 0 }))
);

const systemStats$ = interval(2000).pipe(
  startWith(0),
  switchMap(() => ajax.getJSON('/api/stats/system')),
  catchError(() => of({ cpu: 0, memory: 0 }))
);

// Combine all stats
const dashboard$ = combineLatest([
  userStats$,
  salesStats$,
  systemStats$
]).pipe(
  map(([users, sales, system]) => ({
    users,
    sales,
    system,
    lastUpdated: new Date()
  }))
);

dashboard$.subscribe(stats => {
  updateDashboard(stats);
});

function updateDashboard(stats) {
  document.getElementById('user-count').textContent = stats.users.count;
  document.getElementById('active-users').textContent = stats.users.active;
  document.getElementById('total-sales').textContent = stats.sales.total;
  document.getElementById('today-sales').textContent = stats.sales.today;
  document.getElementById('cpu-usage').textContent = `${stats.system.cpu}%`;
  document.getElementById('memory-usage').textContent = `${stats.system.memory}%`;
  document.getElementById('last-updated').textContent = stats.lastUpdated.toLocaleTimeString();
}
```

---

### 9️⃣ Testing Observables

**Basic Testing:**
```javascript
import { TestScheduler } from 'rxjs/testing';
import { of } from 'rxjs';
import { map, delay } from 'rxjs/operators';

describe('Observable Tests', () => {
  let testScheduler;
  
  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      expect(actual).toEqual(expected);
    });
  });
  
  test('should map values correctly', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source$ = cold('a-b-c|', { a: 1, b: 2, c: 3 });
      const expected = 'a-b-c|';
      const expectedValues = { a: 2, b: 4, c: 6 };
      
      const result$ = source$.pipe(map(x => x * 2));
      
      expectObservable(result$).toBe(expected, expectedValues);
    });
  });
  
  test('should handle errors', () => {
    testScheduler.run(({ cold, expectObservable }) => {
      const source$ = cold('a-b-#', { a: 1, b: 2 }, new Error('test error'));
      const expected = 'a-b-#';
      
      expectObservable(source$).toBe(expected, { a: 1, b: 2 }, new Error('test error'));
    });
  });
});
```

---

### 🔟 Best Practices

**Do's:**
```javascript
// ✅ Always unsubscribe to prevent memory leaks
const subscription = observable.subscribe(data => {
  console.log(data);
});

// Later...
subscription.unsubscribe();

// ✅ Use operators to transform data
const processedData$ = rawData$.pipe(
  filter(data => data.isValid),
  map(data => data.value),
  distinctUntilChanged()
);

// ✅ Handle errors appropriately
const safeObservable$ = riskyObservable$.pipe(
  catchError(error => {
    console.error('Error occurred:', error);
    return of(defaultValue);
  })
);
```

**Don'ts:**
```javascript
// ❌ Don't forget to unsubscribe
observable.subscribe(data => {
  console.log(data);
}); // Memory leak!

// ❌ Don't nest subscriptions
observable1.subscribe(data1 => {
  observable2.subscribe(data2 => {
    // Nested subscriptions are hard to manage
  });
});

// Better: Use operators
observable1.pipe(
  switchMap(data1 => observable2)
).subscribe(data2 => {
  // Much cleaner
});
```

---

### 1️⃣1️⃣ Key Takeaways

* **Observables** handle asynchronous data streams with multiple values
* **Operators** transform, filter, and combine observables
* **Subscriptions** must be managed to prevent memory leaks
* **Error handling** is crucial for robust applications
* **RxJS** provides powerful operators for complex async scenarios
* **Testing** observables requires special tools like TestScheduler
* **Use observables** for events, HTTP requests, real-time data
* **Combine observables** for complex data flows
* **Always unsubscribe** when components are destroyed
* **Observables are lazy** - they don't execute until subscribed to
