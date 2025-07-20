## Atomics Sync

Atomics Sync is lightweight library providing thread-safe synchronization primitives for JavaScript environments 
with shared memory support (Web Workers, Node.js worker_threads). 
Implements essential concurrency control mechanisms using SharedArrayBuffer and Atomics API.

### Features

- [Mutex](docs/classes/Mutex.md) - Mutual exclusion lock for critical sections
- [SpinLock](docs/classes/SpinLock.md) - Low-level busy-wait lock for very short operations
- [Semaphore](docs/classes/Semaphore.md) - Counting semaphore for resource management
- [Condition](docs/classes/Condition.md) - Condition variables for thread signaling
- [Barrier](docs/classes/Barrier.md) - Synchronization point for multiple threads
- [Once](docs/classes/Once.md) - One-time initialization primitive

**Important**: For browsers, your server must send these headers:
```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

### Installation

```shell
npm install atomics-sync
```

### Why This Library?

Modern JavaScript applications increasingly use:
- Web Workers for parallel processing
- SharedArrayBuffer for shared memory
- CPU-intensive tasks (WASM, WebGL, etc.)

These primitives help coordinate work between threads while preventing:
- Race conditions
- Data corruption
- Deadlocks

### Usage Examples

**Important**: There is no reliable way for a thread to know its own ID automatically in JavaScript environments.
The parent/main thread must explicitly assign and pass a unique thread ID to each worker thread it creates.

#### Mutex

Init `mutex` to work safely with `shared` data:
```javascript
const shared = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
const mutex = Mutex.init();
```

Pass `mutex` and `shared` to threads. Remember about `threadId`:
```javascript
const worker = new Worker("./worker.js", {
  workerData: { threadId, shared, mutex }
});
```

Within thread use lock/unlock methods to wrap critical section:
```javascript
try {
  Mutex.lock(mutex, threadId);
  // work with shared data here
} finally {
  Mutex.unlock(mutex, threadId);
}
```

See [full example](example/mutex.mjs).

#### Semaphore

Here's a practical example demonstrating how to use a semaphore to make one thread 
wait for another thread to complete certain actions:

Init semaphore:
```javascript
const sem = Semaphore.init(0);
```

One thread creates another thread and must wait some initialization actions within it:

```javascript
new Worker("./worker.js", { workerData: { sem } });
Semaphore.wait(sem);
// continue execution
// ...
```

Created thread performs necessary operations and notify parent thread:

```javascript
// ...
initSomeImportantThings();
Semaphore.post(sem);
```

See [full example](example/semaphore.mjs).

#### Condition

Using a condition variable, we can make one thread wait for a change in a shared variable (protected by a mutex) before proceeding with its operation.

Init condition variable and mutex, allocate shared variable:
```javascript
const cond = Condition.init();
const mtx = Mutex.init();
const shared = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
shared[0] = -1;
```

One thread produces value:
```javascript
Mutex.lock(mtx, threadId);
shared[0] = Math.floor(Math.random() * 10);
Condition.signal(cond);
Mutex.unlock(mtx, threadId);
```

Another thread consumes the value and makes some work with it:
```javascript
Mutex.lock(mtx, threadId);

while (shared[0] < 0) {
  Condition.wait(cond, mtx, threadId);
}

shared[0] *= 10;
Mutex.unlock(mtx, threadId);
```

See [full example](example/condition.mjs).

#### SpinLock

A spinlock provides an interface nearly identical to a mutex (lock()/unlock()), 
but is optimized for very short wait times where spinning (busy-waiting) is more efficient than thread suspension.

#### Barrier

A barrier synchronizes multiple threads at a specific execution point.

In this example, we launch 10 threads that execute at variable speeds and create a barrier with a count of 5.

```javascript
// main.js

const barrier = Barrier.init(5);

for (let i = 0; i < 10; i++) {
  const threadId = i + 1;
  const worker = new Worker("./worker.js", {
    workerData: { threadId, barrier }
  });
}

// worker.js

setTimeout(() => {
  // ...
  Barrier.wait(barrier, threadId);
  // ...
}, threadId * 100);
```

The first 5 threads to reach the barrier will block and wait.

Once the 5th thread arrives, the barrier releases all waiting threads.

The remaining 5 threads then proceed through the barrier in the same way.

See [full example](example/barrier.mjs).

#### Once

A Once primitive ensures one-time initialization in concurrent environments.

Init once value:

```javascript
const once = Once.init();
```

Pass it into some threads:

```javascript
const worker = new Worker("./worker.js", {
  workerData: { once }
});
```

Within thread:

```javascript
Once.execute(once, () => {
  // some logic that should be executed only once
});
```

See [full example](example/once.mjs).

### Documentation

For complete API reference, see
[API documentation](docs/README.md).