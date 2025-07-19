import { parentPort, workerData } from "worker_threads";

import { Barrier, Mutex } from "../../../dist/index.js";

const { shared, barrier, threadId, mtx } = workerData;

setTimeout(() => {
  Mutex.lock(mtx, threadId);
  shared[0]++;
  Mutex.unlock(mtx, threadId);
  Barrier.wait(barrier, threadId);
  parentPort.postMessage(shared[0]);
}, threadId * 100);
