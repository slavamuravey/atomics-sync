import { parentPort, workerData } from "worker_threads";

import { Condition, Mutex } from "../../dist/index.js";

const { mtx, cond, threadId, shared } = workerData;

Mutex.lock(mtx, threadId);
parentPort.postMessage(true);
Condition.wait(cond, mtx, threadId);
shared[0]++;
Mutex.unlock(mtx, threadId);
