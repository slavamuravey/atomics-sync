import assert from "node:assert";
import { describe, it } from "node:test";

import { Worker } from "worker_threads";

import { Mutex, Once } from "../dist/index.js";

describe("Once", () => {
  it("init creates Int32Array with size 1", () => {
    const once = Once.init();
    assert.ok(once instanceof Int32Array);
    assert.equal(once.length, 1);
  });

  it("isExecuted returns false before execution", () => {
    const once = Once.init();
    assert.equal(Once.isExecuted(once), false);
  });

  it("isExecuted returns true after execution", () => {
    const once = Once.init();
    Once.execute(once, () => {});
    assert.equal(Once.isExecuted(once), true);
  });

  it("execute invokes function once", async () => {
    const once = Once.init();
    const THREADS = 10;
    const promises = [];
    const mtx = Mutex.init();
    const shared = new Int32Array(new SharedArrayBuffer(4));

    for (let i = 0; i < THREADS; i++) {
      const worker = new Worker("./src/workers/once/incrementer.mjs", {
        workerData: { threadId: i + 1, shared, mtx, once }
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
    assert.equal(shared[0], 1);
  });
});
