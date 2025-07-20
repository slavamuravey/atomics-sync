import { Worker } from "worker_threads";

import { Mutex } from "../dist/index.js";

const THREADS = 10;
const promises = [];
const mtx = Mutex.init();
const shared = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));

for (let i = 0; i < THREADS; i++) {
  const worker = new Worker("./workers/mutex/incrementer.mjs", {
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

console.log(shared[0]); // should be 10
