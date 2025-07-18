import { Mutex } from "./mutex";
const { wait, notify } = Atomics;
export class Condition {
    static init() {
        return new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
    }
    static signal(cond) {
        notify(cond, 0, 1);
    }
    static broadcast(cond) {
        notify(cond, 0);
    }
    static wait(cond, mutex, threadId) {
        Mutex.unlock(mutex, threadId);
        wait(cond, 0, 0);
        Mutex.lock(mutex, threadId);
    }
    static timedWait(cond, mutex, threadId, timestamp) {
        try {
            Mutex.unlock(mutex, threadId);
            return wait(cond, 0, 0, timestamp - Date.now()) !== "timed-out";
        }
        finally {
            Mutex.lock(mutex, threadId);
        }
    }
}
//# sourceMappingURL=condition.js.map