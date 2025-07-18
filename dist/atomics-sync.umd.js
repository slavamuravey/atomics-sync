(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["atomics-sync"] = {}));
})(this, (function (exports) { 'use strict';

    class DeadlockError extends Error {
        constructor(message) {
            super(message);
            this.name = "DeadlockError";
        }
    }
    class PermissionError extends Error {
        constructor(message) {
            super(message);
            this.name = "PermissionError";
        }
    }
    class InvalidError extends Error {
        constructor(message) {
            super(message);
            this.name = "InvalidError";
        }
    }

    const INT32_MAX_VALUE = 2147483647;
    const INT32_MIN_VALUE = -2147483648;

    const { compareExchange: compareExchange$3, wait: wait$2, notify: notify$2, store: store$4, load: load$3 } = Atomics;
    class Mutex {
        static init() {
            const mutex = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2));
            store$4(mutex, Mutex.INDEX_STATE, Mutex.STATE_UNLOCKED);
            store$4(mutex, Mutex.INDEX_OWNER, Mutex.OWNER_EMPTY);
            return mutex;
        }
        static lock(mutex, threadId) {
            Mutex.checkThreadIdBeforeLock(mutex, threadId);
            for (;;) {
                if (compareExchange$3(mutex, Mutex.INDEX_STATE, Mutex.STATE_UNLOCKED, Mutex.STATE_LOCKED) === Mutex.STATE_UNLOCKED) {
                    store$4(mutex, Mutex.INDEX_OWNER, threadId);
                    return;
                }
                wait$2(mutex, Mutex.INDEX_STATE, Mutex.STATE_LOCKED);
            }
        }
        static timedLock(mutex, threadId, timestamp) {
            Mutex.checkThreadIdBeforeLock(mutex, threadId);
            for (;;) {
                if (compareExchange$3(mutex, Mutex.INDEX_STATE, Mutex.STATE_UNLOCKED, Mutex.STATE_LOCKED) === Mutex.STATE_UNLOCKED) {
                    store$4(mutex, Mutex.INDEX_OWNER, threadId);
                    return true;
                }
                const timeout = timestamp - Date.now();
                const waitResult = wait$2(mutex, Mutex.INDEX_STATE, Mutex.STATE_LOCKED, timeout);
                if (waitResult === "timed-out") {
                    return false;
                }
            }
        }
        static tryLock(mutex, threadId) {
            Mutex.checkThreadIdBeforeLock(mutex, threadId);
            if (compareExchange$3(mutex, Mutex.INDEX_STATE, Mutex.STATE_UNLOCKED, Mutex.STATE_LOCKED) === Mutex.STATE_UNLOCKED) {
                store$4(mutex, Mutex.INDEX_OWNER, threadId);
                return true;
            }
            return false;
        }
        static unlock(mutex, threadId) {
            Mutex.checkThreadIdIsValid(threadId);
            if (load$3(mutex, Mutex.INDEX_OWNER) !== threadId) {
                throw new PermissionError("current thread is not owner of mutex");
            }
            store$4(mutex, Mutex.INDEX_OWNER, Mutex.OWNER_EMPTY);
            if (compareExchange$3(mutex, Mutex.INDEX_STATE, Mutex.STATE_LOCKED, Mutex.STATE_UNLOCKED) === Mutex.STATE_UNLOCKED) {
                throw new PermissionError("mutex was not locked");
            }
            notify$2(mutex, Mutex.INDEX_STATE, 1);
        }
        static checkThreadIdBeforeLock(mutex, threadId) {
            Mutex.checkThreadIdIsValid(threadId);
            if (load$3(mutex, Mutex.INDEX_OWNER) === threadId) {
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

    const { compareExchange: compareExchange$2, wait: wait$1, notify: notify$1, store: store$3, load: load$2 } = Atomics;
    class Semaphore {
        static init(value) {
            if (!Number.isInteger(value)) {
                throw new InvalidError("initial value should be int32");
            }
            if (value < 0 || value > INT32_MAX_VALUE) {
                throw new RangeError("initial value should be greater or equal zero and less or equal maximum int32 value");
            }
            const sem = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
            store$3(sem, Semaphore.INDEX_VALUE, value);
            return sem;
        }
        static wait(sem) {
            for (;;) {
                const value = load$2(sem, Semaphore.INDEX_VALUE);
                if (value > 0) {
                    if (compareExchange$2(sem, Semaphore.INDEX_VALUE, value, value - 1) === value) {
                        return;
                    }
                }
                else {
                    wait$1(sem, Semaphore.INDEX_VALUE, value);
                }
            }
        }
        static timedWait(sem, timestamp) {
            for (;;) {
                const value = load$2(sem, Semaphore.INDEX_VALUE);
                if (value > 0) {
                    if (compareExchange$2(sem, Semaphore.INDEX_VALUE, value, value - 1) === value) {
                        return true;
                    }
                }
                else {
                    const timeout = timestamp - Date.now();
                    const waitResult = wait$1(sem, Semaphore.INDEX_VALUE, value, timeout);
                    if (waitResult === "timed-out") {
                        return false;
                    }
                }
            }
        }
        static tryWait(sem) {
            for (;;) {
                const value = load$2(sem, Semaphore.INDEX_VALUE);
                if (value === 0) {
                    return false;
                }
                if (compareExchange$2(sem, Semaphore.INDEX_VALUE, value, value - 1) === value) {
                    return true;
                }
            }
        }
        static post(sem) {
            for (;;) {
                const value = load$2(sem, Semaphore.INDEX_VALUE);
                if (value === INT32_MAX_VALUE) {
                    throw new RangeError("maximum limit reached for semaphore value");
                }
                if (compareExchange$2(sem, Semaphore.INDEX_VALUE, value, value + 1) === value) {
                    if (value === 0) {
                        notify$1(sem, Semaphore.INDEX_VALUE, 1);
                    }
                    return;
                }
            }
        }
        static getValue(sem) {
            return load$2(sem, Semaphore.INDEX_VALUE);
        }
    }
    Semaphore.INDEX_VALUE = 0;

    const { wait, notify } = Atomics;
    class Condition {
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

    const { store: store$2, load: load$1, add } = Atomics;
    class Barrier {
        static init(count) {
            Barrier.validateCount(count);
            const barrier = new BigInt64Array(new SharedArrayBuffer(BigInt64Array.BYTES_PER_ELEMENT * 3));
            store$2(barrier, Barrier.INDEX_COUNT, BigInt(count));
            store$2(barrier, Barrier.INDEX_WAITED, 0n);
            store$2(barrier, Barrier.INDEX_GENERATION, 0n);
            const mutex = Mutex.init();
            const cond = Condition.init();
            return {
                barrier,
                mutex,
                cond
            };
        }
        static wait(barrier, threadId) {
            Mutex.lock(barrier.mutex, threadId);
            const generation = load$1(barrier.barrier, Barrier.INDEX_GENERATION);
            const count = load$1(barrier.barrier, Barrier.INDEX_COUNT);
            const waited = add(barrier.barrier, Barrier.INDEX_WAITED, 1n) + 1n;
            try {
                if (waited >= count) {
                    store$2(barrier.barrier, Barrier.INDEX_WAITED, 0n);
                    add(barrier.barrier, Barrier.INDEX_GENERATION, 1n);
                    Condition.broadcast(barrier.cond);
                    return true;
                }
                while (load$1(barrier.barrier, Barrier.INDEX_GENERATION) === generation) {
                    Condition.wait(barrier.cond, barrier.mutex, threadId);
                }
                return false;
            }
            finally {
                Mutex.unlock(barrier.mutex, threadId);
            }
        }
        static validateCount(count) {
            if (!Number.isInteger(count)) {
                throw new InvalidError("count should be integer");
            }
            if (count <= 0) {
                throw new RangeError("count should be greater zero");
            }
        }
    }
    Barrier.INDEX_COUNT = 0;
    Barrier.INDEX_WAITED = 1;
    Barrier.INDEX_GENERATION = 2;

    const { compareExchange: compareExchange$1, store: store$1, load } = Atomics;
    class SpinLock {
        static init() {
            const lock = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2));
            store$1(lock, SpinLock.INDEX_STATE, SpinLock.STATE_UNLOCKED);
            store$1(lock, SpinLock.INDEX_OWNER, SpinLock.OWNER_EMPTY);
            return lock;
        }
        static lock(lock, threadId) {
            SpinLock.checkThreadIdBeforeLock(lock, threadId);
            for (;;) {
                if (compareExchange$1(lock, SpinLock.INDEX_STATE, SpinLock.STATE_UNLOCKED, SpinLock.STATE_LOCKED) ===
                    SpinLock.STATE_UNLOCKED) {
                    store$1(lock, SpinLock.INDEX_OWNER, threadId);
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
            if (compareExchange$1(lock, SpinLock.INDEX_STATE, SpinLock.STATE_UNLOCKED, SpinLock.STATE_LOCKED) ===
                SpinLock.STATE_UNLOCKED) {
                store$1(lock, SpinLock.INDEX_OWNER, threadId);
                return true;
            }
            return false;
        }
        static unlock(lock, threadId) {
            SpinLock.checkThreadIdIsValid(threadId);
            if (load(lock, SpinLock.INDEX_OWNER) !== threadId) {
                throw new PermissionError("current thread is not owner of lock");
            }
            store$1(lock, SpinLock.INDEX_OWNER, SpinLock.OWNER_EMPTY);
            if (compareExchange$1(lock, SpinLock.INDEX_STATE, SpinLock.STATE_LOCKED, SpinLock.STATE_UNLOCKED) ===
                SpinLock.STATE_UNLOCKED) {
                throw new PermissionError("lock was not locked");
            }
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

    const { compareExchange, store } = Atomics;
    class Once {
        static init() {
            const once = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
            store(once, Once.INDEX_EXECUTED, Once.EXECUTED_NO);
            return once;
        }
        static execute(once, fn) {
            if (compareExchange(once, Once.INDEX_EXECUTED, Once.EXECUTED_NO, Once.EXECUTED_YES) === Once.EXECUTED_NO) {
                fn();
            }
        }
        static isExecuted(once) {
            return Atomics.load(once, Once.INDEX_EXECUTED) === Once.EXECUTED_YES;
        }
    }
    Once.INDEX_EXECUTED = 0;
    Once.EXECUTED_NO = 0;
    Once.EXECUTED_YES = 1;

    exports.Barrier = Barrier;
    exports.Condition = Condition;
    exports.DeadlockError = DeadlockError;
    exports.INT32_MAX_VALUE = INT32_MAX_VALUE;
    exports.INT32_MIN_VALUE = INT32_MIN_VALUE;
    exports.InvalidError = InvalidError;
    exports.Mutex = Mutex;
    exports.Once = Once;
    exports.PermissionError = PermissionError;
    exports.Semaphore = Semaphore;
    exports.SpinLock = SpinLock;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=atomics-sync.umd.js.map
