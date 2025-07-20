import { Worker } from "worker_threads";

import { Semaphore } from "../dist/index.js";

const sem = Semaphore.init(0);
const shared = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
// eslint-disable-next-line no-new
new Worker("./workers/semaphore/notificator.mjs", { workerData: { sem, shared } });
shared[0] = 1;
Semaphore.wait(sem);
console.log(shared[0]); // should be 2
