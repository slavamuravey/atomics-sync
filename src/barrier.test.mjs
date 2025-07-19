import assert from "node:assert";
import { describe, it } from "node:test";

import { Worker } from "worker_threads";

import { Barrier, InvalidError, Mutex } from "../dist/index.js";

describe("Barrier", () => {
  const INDEX_COUNT = 0;
  const INDEX_WAITED = 1;
  const INDEX_GENERATION = 2;

  describe("init", () => {
    it("should initialize barrier with correct count", () => {
      const count = 3;
      const barrier = Barrier.init(count);

      assert.ok(barrier.barrier instanceof BigInt64Array);
      assert.ok(barrier.mutex instanceof Int32Array);
      assert.ok(barrier.cond instanceof Int32Array);

      assert.equal(Atomics.load(barrier.barrier, INDEX_COUNT), BigInt(count));
      assert.equal(Atomics.load(barrier.barrier, INDEX_WAITED), 0n);
      assert.equal(Atomics.load(barrier.barrier, INDEX_GENERATION), 0n);
    });

    it("should throw error for non-integer count", () => {
      assert.throws(() => Barrier.init(3.5), InvalidError);
    });

    it("should throw error for zero or negative count", () => {
      assert.throws(() => Barrier.init(0), RangeError);
      assert.throws(() => Barrier.init(-1), RangeError);
    });
  });

  it("should block until all threads reach the barrier", async () => {
    const THREADS = 10;
    const promises = [];
    const shared = new Int32Array(new SharedArrayBuffer(4));
    const barrier = Barrier.init(5);
    const mtx = Mutex.init();
    const results = [5, 5, 5, 5, 5, 10, 10, 10, 10, 10];

    for (let i = 0; i < THREADS; i++) {
      const worker = new Worker("./src/workers/barrier/incrementer.mjs", {
        workerData: { threadId: i + 1, shared, barrier, mtx }
      });
      promises.push(
        new Promise(resolve => {
          worker.on("message", value => {
            assert.equal(value, results[i]);
            worker.terminate().then(resolve);
          });
        })
      );
    }
    await Promise.all(promises);
  });
});
