import { InvalidError } from "./errors.js";
import { INT32_MAX_VALUE } from "./limits.js";
const { compareExchange, wait, notify, store, load } = Atomics;
export class Semaphore {
    static init(value) {
        if (!Number.isInteger(value)) {
            throw new InvalidError("initial value should be int32");
        }
        if (value < 0 || value > INT32_MAX_VALUE) {
            throw new RangeError("initial value should be greater or equal zero and less or equal maximum int32 value");
        }
        const sem = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
        store(sem, Semaphore.INDEX_VALUE, value);
        return sem;
    }
    static wait(sem) {
        for (;;) {
            const value = load(sem, Semaphore.INDEX_VALUE);
            if (value > 0) {
                if (compareExchange(sem, Semaphore.INDEX_VALUE, value, value - 1) === value) {
                    return;
                }
            }
            else {
                wait(sem, Semaphore.INDEX_VALUE, value);
            }
        }
    }
    static timedWait(sem, timestamp) {
        for (;;) {
            const value = load(sem, Semaphore.INDEX_VALUE);
            if (value > 0) {
                if (compareExchange(sem, Semaphore.INDEX_VALUE, value, value - 1) === value) {
                    return true;
                }
            }
            else {
                const timeout = timestamp - Date.now();
                const waitResult = wait(sem, Semaphore.INDEX_VALUE, value, timeout);
                if (waitResult === "timed-out") {
                    return false;
                }
            }
        }
    }
    static tryWait(sem) {
        for (;;) {
            const value = load(sem, Semaphore.INDEX_VALUE);
            if (value === 0) {
                return false;
            }
            if (compareExchange(sem, Semaphore.INDEX_VALUE, value, value - 1) === value) {
                return true;
            }
        }
    }
    static post(sem) {
        for (;;) {
            const value = load(sem, Semaphore.INDEX_VALUE);
            if (value === INT32_MAX_VALUE) {
                throw new RangeError("maximum limit reached for semaphore value");
            }
            if (compareExchange(sem, Semaphore.INDEX_VALUE, value, value + 1) === value) {
                if (value === 0) {
                    notify(sem, Semaphore.INDEX_VALUE, 1);
                }
                return;
            }
        }
    }
    static getValue(sem) {
        return load(sem, Semaphore.INDEX_VALUE);
    }
}
Semaphore.INDEX_VALUE = 0;
//# sourceMappingURL=semaphore.js.map