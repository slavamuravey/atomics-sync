import assert from "node:assert";
import { describe, it } from "node:test";

import { Worker } from "worker_threads";

import { Condition, Mutex } from "../dist/index.js";

describe("Condition", () => {
  it("init creates a new condition variable", () => {
    const cond = Condition.init();
    assert.ok(cond instanceof Int32Array);
    assert.equal(cond.length, 1);
  });

  it("signal wakes up one waiting thread", async () => {
    const cond = Condition.init();
    const mtx = Mutex.init();
    const threadId = 123;
    const promises = [];
    const THREADS = 10;
    const shared = new Int32Array(new SharedArrayBuffer(4));

    for (let i = 0; i < THREADS; i++) {
      const worker = new Worker("./src/workers/waiter.mjs", { workerData: { cond, mtx, shared, threadId: i + 1 } });
      promises.push(
        new Promise(resolve => {
          worker.on("message", () => {
            resolve();
            setTimeout(() => {
              worker.terminate();
            }, 100);
          });
        })
      );
    }

    await Promise.all(promises);

    Mutex.lock(mtx, threadId);
    Condition.signal(cond);
    Mutex.unlock(mtx, threadId);

    setTimeout(() => {
      assert.equal(shared[0], 1);
    }, 100);
  });

  it("broadcast wakes up all waiting threads", async () => {
    const cond = Condition.init();
    const mtx = Mutex.init();
    const threadId = 123;
    const promises = [];
    const THREADS = 10;
    const shared = new Int32Array(new SharedArrayBuffer(4));

    for (let i = 0; i < THREADS; i++) {
      const worker = new Worker("./src/workers/waiter.mjs", {
        workerData: { cond, mtx, shared, threadId: i + 1 }
      });
      promises.push(
        new Promise(resolve => {
          worker.on("message", () => {
            resolve();
            setTimeout(() => {
              worker.terminate();
            }, 100);
          });
        })
      );
    }

    await Promise.all(promises);

    Mutex.lock(mtx, threadId);
    Condition.broadcast(cond);
    Mutex.unlock(mtx, threadId);

    setTimeout(() => {
      assert.equal(shared[0], THREADS);
    }, 100);
  });

  it("timedWait should return false on timeout", () => {
    const cond = Condition.init();
    const mtx = Mutex.init();
    const threadId = 123;
    Mutex.lock(mtx, threadId);
    const success = Condition.timedWait(cond, mtx, threadId, Date.now() + 100);
    assert.equal(success, false);
  });
});
