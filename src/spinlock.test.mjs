import assert from "node:assert";
import { describe, it } from "node:test";

import { Worker } from "worker_threads";

import { DeadlockError, INT32_MIN_VALUE, InvalidError, PermissionError, SpinLock } from "../dist/index.js";

describe("SpinLock", () => {
  const OWNER_EMPTY = 0;
  const STATE_UNLOCKED = 0;
  const INDEX_STATE = 0;
  const INDEX_OWNER = 1;

  it("should initialize as Int32Array with size 2 in unlocked state and empty owner", () => {
    const lock = SpinLock.init();
    assert.ok(lock instanceof Int32Array);
    assert.equal(lock.length, 2);
    assert.equal(Atomics.load(lock, INDEX_STATE), STATE_UNLOCKED);
    assert.equal(Atomics.load(lock, INDEX_OWNER), OWNER_EMPTY);
  });

  it("should lock and unlock correctly", () => {
    const lock = SpinLock.init();
    SpinLock.lock(lock, 123);
    assert.equal(Atomics.load(lock, 1), 123);
    SpinLock.unlock(lock, 123);
    assert.equal(Atomics.load(lock, INDEX_STATE), STATE_UNLOCKED);
  });

  it("should throw DeadlockError when same thread tries to lock twice", () => {
    const lock = SpinLock.init();
    SpinLock.lock(lock, 123);
    assert.throws(() => SpinLock.lock(lock, 123), DeadlockError);
  });

  it("should throw when unlocking already unlocked lock", () => {
    const lock = SpinLock.init();
    assert.throws(() => SpinLock.unlock(lock, 123), PermissionError);
  });

  it("should throw PermissionError when non-owner tries to unlock", () => {
    const lock = SpinLock.init();
    SpinLock.lock(lock, 123);
    assert.throws(() => SpinLock.unlock(lock, 456), PermissionError);
  });

  it("should throw InvalidError for non-integer threadId", () => {
    const lock = SpinLock.init();
    assert.throws(() => SpinLock.lock(lock, "invalid_threadId"), InvalidError);
  });

  it("should throw InvalidError for empty owner", () => {
    const lock = SpinLock.init();
    assert.throws(() => SpinLock.lock(lock, OWNER_EMPTY), InvalidError);
  });

  it("should throw RangeError for out of range threadId", () => {
    const lock = SpinLock.init();
    assert.throws(() => SpinLock.lock(lock, INT32_MIN_VALUE - 1), RangeError);
  });

  it("tryLock should return true when lock is free", () => {
    const lock = SpinLock.init();
    assert.equal(SpinLock.tryLock(lock, 123), true);
  });

  it("tryLock should return false when lock is locked", () => {
    const lock = SpinLock.init();
    SpinLock.lock(lock, 123);
    assert.equal(SpinLock.tryLock(lock, 456), false);
  });

  it("lock/unlock should be fast", () => {
    const lock = SpinLock.init();
    const start = performance.now();

    for (let i = 0; i < 10000; i++) {
      SpinLock.lock(lock, 123);
      SpinLock.unlock(lock, 123);
    }
    const duration = performance.now() - start;
    assert(duration < 10, `Expected <10ms, got ${duration}ms`);
  });

  it("should handle concurrent access (stress test)", async () => {
    const THREADS = 10;
    const promises = [];
    const lock = SpinLock.init();
    const shared = new Int32Array(new SharedArrayBuffer(4));

    for (let i = 0; i < THREADS; i++) {
      const worker = new Worker("./src/workers/spinlock/incrementer.mjs", {
        workerData: { threadId: i + 1, shared, lock }
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
