import { parentPort, workerData } from "worker_threads";

import { Mutex } from "../../../dist/index.js";

const { shared, mtx, threadId } = workerData;
Mutex.lock(mtx, threadId);
const v = shared[0];
for (let j = 0; j < 1000000; j++) {
  /* empty */
}
shared[0] = v + 1;
Mutex.unlock(mtx, threadId);

parentPort.postMessage(true);
