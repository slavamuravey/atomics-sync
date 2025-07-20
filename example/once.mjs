import { Worker } from "worker_threads";

import { Once } from "../dist/index.js";

const once = Once.init();
const THREADS = 10;
const promises = [];

for (let i = 0; i < THREADS; i++) {
  const worker = new Worker("./workers/once/worker.mjs", {
    workerData: { once }
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
