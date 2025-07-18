import { workerData } from "worker_threads";

import { Semaphore } from "../../../dist/index.js";

const { sem, shared } = workerData;

setTimeout(() => {
  shared[0] = 42;
  Semaphore.post(sem);
}, 100);
