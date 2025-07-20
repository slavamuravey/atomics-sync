import { workerData } from "worker_threads";

import { Condition, Mutex } from "../../../dist/index.js";

const { mtx, cond, threadId, shared } = workerData;

Mutex.lock(mtx, threadId);

for (let j = 0; j < 1000000; j++) {
  /* empty */
}

shared[0] = Math.floor(Math.random() * 10);
Condition.signal(cond);
Mutex.unlock(mtx, threadId);
