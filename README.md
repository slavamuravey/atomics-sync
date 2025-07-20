## Atomics Sync

Atomics Sync is lightweight library providing thread-safe synchronization primitives for JavaScript environments 
with shared memory support (Web Workers, Node.js worker_threads). 
Implements essential concurrency control mechanisms using SharedArrayBuffer and Atomics API.

### Features

- Mutex - Mutual exclusion lock for critical sections
- SpinLock - Low-level busy-wait lock for very short operations
- Semaphore - Counting semaphore for resource management
- Condition - Condition variables for thread signaling
- Barrier - Synchronization point for multiple threads
- Once - One-time initialization primitive

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
const shared = new Int32Array(new SharedArrayBuffer(4));
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
