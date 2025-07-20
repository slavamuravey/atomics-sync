import { workerData } from "worker_threads";

import { Condition, Mutex } from "../../../dist/index.js";

const { mtx, cond, threadId, shared } = workerData;

Mutex.lock(mtx, threadId);

while (shared[0] < 0) {
  Condition.wait(cond, mtx, threadId);
}

shared[0] *= 10;
Mutex.unlock(mtx, threadId);

console.log(shared[0]); // should be 0 to 100, not -1
