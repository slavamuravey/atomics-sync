import { Worker } from "worker_threads";

import { Barrier, Mutex } from "../dist/index.js";

const THREADS = 10;
const shared = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
const barrier = Barrier.init(5);
const mtx = Mutex.init();

for (let i = 0; i < THREADS; i++) {
  const threadId = i + 1;
  const worker = new Worker("./workers/barrier/incrementer.mjs", {
    workerData: { threadId, shared, barrier, mtx }
  });
  worker.on("message", value => {
    console.log(`${threadId}: ${value}`);
  });
}

// From 1 to 5 threads should get 5, from 6 to 10 threads should get 10
