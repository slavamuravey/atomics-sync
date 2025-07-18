import assert from "node:assert";
import { describe, it } from "node:test";

import { Worker } from "worker_threads";

import { DeadlockError, INT32_MIN_VALUE, InvalidError, Mutex, PermissionError } from "../dist/index.js";

describe("Mutex", () => {
  const OWNER_EMPTY = 0;
  const STATE_UNLOCKED = 0;
  const INDEX_STATE = 0;
  const INDEX_OWNER = 1;

  it("should initialize as Int32Array with size 2 in unlocked state and empty owner", () => {
    const mutex = Mutex.init();
    assert.ok(mutex instanceof Int32Array);
    assert.equal(mutex.length, 2);
    assert.equal(Atomics.load(mutex, INDEX_STATE), STATE_UNLOCKED);
    assert.equal(Atomics.load(mutex, INDEX_OWNER), OWNER_EMPTY);
  });

  it("should lock and unlock correctly", () => {
    const mutex = Mutex.init();
    Mutex.lock(mutex, 123);
    assert.equal(Atomics.load(mutex, 1), 123);
    Mutex.unlock(mutex, 123);
    assert.equal(Atomics.load(mutex, INDEX_STATE), STATE_UNLOCKED);
  });

  it("should throw DeadlockError when same thread tries to lock twice", () => {
    const mutex = Mutex.init();
    Mutex.lock(mutex, 123);
    assert.throws(() => Mutex.lock(mutex, 123), DeadlockError);
  });

  it("should throw when unlocking already unlocked mutex", () => {
    const mutex = Mutex.init();
    assert.throws(() => Mutex.unlock(mutex, 123), PermissionError);
  });

  it("should throw PermissionError when non-owner tries to unlock", () => {
    const mutex = Mutex.init();
    Mutex.lock(mutex, 123);
    assert.throws(() => Mutex.unlock(mutex, 456), PermissionError);
  });

  it("should throw InvalidError for non-integer threadId", () => {
    const mutex = Mutex.init();
    assert.throws(() => Mutex.lock(mutex, "invalid_threadId"), InvalidError);
  });

  it("should throw InvalidError for empty owner", () => {
    const mutex = Mutex.init();
    assert.throws(() => Mutex.lock(mutex, OWNER_EMPTY), InvalidError);
  });

  it("should throw RangeError for out of range threadId", () => {
    const mutex = Mutex.init();
    assert.throws(() => Mutex.lock(mutex, INT32_MIN_VALUE - 1), RangeError);
  });

  it("tryLock should return true when mutex is free", () => {
    const mutex = Mutex.init();
    assert.equal(Mutex.tryLock(mutex, 123), true);
  });

  it("tryLock should return false when mutex is locked", () => {
    const mutex = Mutex.init();
    Mutex.lock(mutex, 123);
    assert.equal(Mutex.tryLock(mutex, 456), false);
  });

  it("lock/unlock should be fast", () => {
    const mutex = Mutex.init();
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      Mutex.lock(mutex, 123);
      Mutex.unlock(mutex, 123);
    }
    const duration = performance.now() - start;
    assert(duration < 10, `Expected <10ms, got ${duration}ms`);
  });

  it("timedLock should return false after timeout", () => {
    const mutex = Mutex.init();
    Mutex.lock(mutex, 123);
    const start = Date.now();
    assert.equal(Mutex.timedLock(mutex, 456, start + 100), false);
    assert(Date.now() - start >= 100);
  });

  it("should handle concurrent access (stress test)", async () => {
    const THREADS = 10;
    const promises = [];

    const mtx = Mutex.init();
    const shared = new Int32Array(new SharedArrayBuffer(4));
    for (let i = 0; i < THREADS; i++) {
      const worker = new Worker("./src/workers/mutex/incrementer.mjs", {
        workerData: { threadId: i + 1, shared, mtx }
      });
      promises.push(
        new Promise(resolve => {
          worker.on("message", () => {
            worker.terminate().then(resolve);
          });
        })
      );
    }
    await Promise.all(promises);
    assert.equal(shared[0], THREADS);
  });
});
