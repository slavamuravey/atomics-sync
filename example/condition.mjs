import { Worker } from "worker_threads";

import { Condition, Mutex } from "../dist/index.js";

const cond = Condition.init();
const mtx = Mutex.init();
const shared = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
shared[0] = -1;

// eslint-disable-next-line no-new
new Worker("./workers/condition/producer.mjs", {
  workerData: { cond, mtx, shared, threadId: 1 }
});

// eslint-disable-next-line no-new
new Worker("./workers/condition/consumer.mjs", {
  workerData: { cond, mtx, shared, threadId: 2 }
});
