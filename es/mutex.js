import { DeadlockError, InvalidError, PermissionError } from "./errors.js";
import { INT32_MAX_VALUE, INT32_MIN_VALUE } from "./limits.js";
const { compareExchange, wait, notify, store, load } = Atomics;
export class Mutex {
    static init() {
        const mutex = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2));
        store(mutex, Mutex.INDEX_STATE, Mutex.STATE_UNLOCKED);
        store(mutex, Mutex.INDEX_OWNER, Mutex.OWNER_EMPTY);
        return mutex;
    }
    static lock(mutex, threadId) {
        Mutex.checkThreadIdBeforeLock(mutex, threadId);
        for (;;) {
            if (compareExchange(mutex, Mutex.INDEX_STATE, Mutex.STATE_UNLOCKED, Mutex.STATE_LOCKED) === Mutex.STATE_UNLOCKED) {
                store(mutex, Mutex.INDEX_OWNER, threadId);
                return;
            }
            wait(mutex, Mutex.INDEX_STATE, Mutex.STATE_LOCKED);
        }
    }
    static timedLock(mutex, threadId, timestamp) {
        Mutex.checkThreadIdBeforeLock(mutex, threadId);
        for (;;) {
            if (compareExchange(mutex, Mutex.INDEX_STATE, Mutex.STATE_UNLOCKED, Mutex.STATE_LOCKED) === Mutex.STATE_UNLOCKED) {
                store(mutex, Mutex.INDEX_OWNER, threadId);
                return true;
            }
            const timeout = timestamp - Date.now();
            const waitResult = wait(mutex, Mutex.INDEX_STATE, Mutex.STATE_LOCKED, timeout);
            if (waitResult === "timed-out") {
                return false;
            }
        }
    }
    static tryLock(mutex, threadId) {
        Mutex.checkThreadIdBeforeLock(mutex, threadId);
        if (compareExchange(mutex, Mutex.INDEX_STATE, Mutex.STATE_UNLOCKED, Mutex.STATE_LOCKED) === Mutex.STATE_UNLOCKED) {
            store(mutex, Mutex.INDEX_OWNER, threadId);
            return true;
        }
        return false;
    }
    static unlock(mutex, threadId) {
        Mutex.checkThreadIdIsValid(threadId);
        if (load(mutex, Mutex.INDEX_OWNER) !== threadId) {
            throw new PermissionError("current thread is not owner of mutex");
        }
        if (compareExchange(mutex, Mutex.INDEX_STATE, Mutex.STATE_LOCKED, Mutex.STATE_UNLOCKED) === Mutex.STATE_UNLOCKED) {
            throw new PermissionError("mutex was not locked");
        }
        store(mutex, Mutex.INDEX_OWNER, Mutex.OWNER_EMPTY);
        notify(mutex, Mutex.INDEX_STATE, 1);
    }
    static checkThreadIdBeforeLock(mutex, threadId) {
        Mutex.checkThreadIdIsValid(threadId);
        if (load(mutex, Mutex.INDEX_OWNER) === threadId) {
            throw new DeadlockError("thread already owns this mutex");
        }
    }
    static checkThreadIdIsValid(threadId) {
        if (!Number.isInteger(threadId)) {
            throw new InvalidError("threadId should be int32");
        }
        if (threadId < INT32_MIN_VALUE || threadId > INT32_MAX_VALUE) {
            throw new RangeError("threadId is out of int32 range");
        }
        if (threadId === Mutex.OWNER_EMPTY) {
            throw new InvalidError("threadId is empty owner");
        }
    }
}
Mutex.OWNER_EMPTY = 0;
Mutex.STATE_UNLOCKED = 0;
Mutex.STATE_LOCKED = 1;
Mutex.INDEX_STATE = 0;
Mutex.INDEX_OWNER = 1;
//# sourceMappingURL=mutex.js.map