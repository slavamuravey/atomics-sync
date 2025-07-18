import { parentPort, workerData } from "worker_threads";

import { SpinLock } from "../../../dist/index.js";

const { shared, lock, threadId } = workerData;
SpinLock.lock(lock, threadId);
const v = shared[0];
for (let j = 0; j < 1000000; j++) {
  /* empty */
}
shared[0] = v + 1;
SpinLock.unlock(lock, threadId);

parentPort.postMessage(true);
