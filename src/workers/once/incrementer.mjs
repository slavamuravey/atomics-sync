import { parentPort, workerData } from "worker_threads";

import { Mutex, Once } from "../../../dist/index.js";

const { shared, once, mtx, threadId } = workerData;

Once.execute(once, () => {
  Mutex.lock(mtx, threadId);
  const v = shared[0];
  for (let j = 0; j < 1000000; j++) {
    /* empty */
  }
  shared[0] = v + 1;
  Mutex.unlock(mtx, threadId);
});

parentPort.postMessage(true);
