import { parentPort, workerData } from "worker_threads";

import { Once } from "../../../dist/index.js";

const { once } = workerData;

Once.execute(once, () => {
  console.log("executed once");
});

parentPort.postMessage(true);
