import { DeadlockError, InvalidError, PermissionError } from "./errors.js";
import { INT32_MAX_VALUE, INT32_MIN_VALUE } from "./limits.js";
const { compareExchange, store, load } = Atomics;
export class SpinLock {
    static init() {
        const lock = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2));
        store(lock, SpinLock.INDEX_STATE, SpinLock.STATE_UNLOCKED);
        store(lock, SpinLock.INDEX_OWNER, SpinLock.OWNER_EMPTY);
        return lock;
    }
    static lock(lock, threadId) {
        SpinLock.checkThreadIdBeforeLock(lock, threadId);
        for (;;) {
            if (compareExchange(lock, SpinLock.INDEX_STATE, SpinLock.STATE_UNLOCKED, SpinLock.STATE_LOCKED) ===
                SpinLock.STATE_UNLOCKED) {
                store(lock, SpinLock.INDEX_OWNER, threadId);
                return;
            }
            // @ts-ignore
            if (typeof Atomics.pause === "function") {
                // @ts-ignore
                Atomics.pause();
            }
        }
    }
    static tryLock(lock, threadId) {
        SpinLock.checkThreadIdBeforeLock(lock, threadId);
        if (compareExchange(lock, SpinLock.INDEX_STATE, SpinLock.STATE_UNLOCKED, SpinLock.STATE_LOCKED) ===
            SpinLock.STATE_UNLOCKED) {
            store(lock, SpinLock.INDEX_OWNER, threadId);
            return true;
        }
        return false;
    }
    static unlock(lock, threadId) {
        SpinLock.checkThreadIdIsValid(threadId);
        if (load(lock, SpinLock.INDEX_OWNER) !== threadId) {
            throw new PermissionError("current thread is not owner of lock");
        }
        if (compareExchange(lock, SpinLock.INDEX_STATE, SpinLock.STATE_LOCKED, SpinLock.STATE_UNLOCKED) ===
            SpinLock.STATE_UNLOCKED) {
            throw new PermissionError("lock was not locked");
        }
        store(lock, SpinLock.INDEX_OWNER, SpinLock.OWNER_EMPTY);
    }
    static checkThreadIdBeforeLock(lock, threadId) {
        SpinLock.checkThreadIdIsValid(threadId);
        if (load(lock, SpinLock.INDEX_OWNER) === threadId) {
            throw new DeadlockError("thread already owns this lock");
        }
    }
    static checkThreadIdIsValid(threadId) {
        if (!Number.isInteger(threadId)) {
            throw new InvalidError("threadId should be int32");
        }
        if (threadId < INT32_MIN_VALUE || threadId > INT32_MAX_VALUE) {
            throw new RangeError("threadId is out of int32 range");
        }
        if (threadId === SpinLock.OWNER_EMPTY) {
            throw new InvalidError("threadId is empty owner");
        }
    }
}
SpinLock.OWNER_EMPTY = 0;
SpinLock.STATE_UNLOCKED = 0;
SpinLock.STATE_LOCKED = 1;
SpinLock.INDEX_STATE = 0;
SpinLock.INDEX_OWNER = 1;
//# sourceMappingURL=spinlock.js.map