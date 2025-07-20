import { workerData } from "worker_threads";

import { Semaphore } from "../../../dist/index.js";

const { sem, shared } = workerData;

shared[0] = 2;
Semaphore.post(sem);
