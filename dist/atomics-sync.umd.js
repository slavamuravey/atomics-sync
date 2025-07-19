(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global["atomics-sync"] = {}));
})(this, (function (exports) { 'use strict';

    /**
     * Error thrown when a deadlock situation is detected in synchronization primitives.
     * This typically occurs when threads are circularly waiting for resources/locks
     * held by each other.
     */
    class DeadlockError extends Error {
        constructor(message) {
            super(message);
            this.name = "DeadlockError";
        }
    }
    /**
     * Error thrown when a thread attempts an operation it doesn't have permission for,
     * such as unlocking a mutex it doesn't own or accessing protected resources.
     */
    class PermissionError extends Error {
        constructor(message) {
            super(message);
            this.name = "PermissionError";
        }
    }
    /**
     * Error thrown when invalid arguments or operations are detected,
     * such as passing non-integer values where integers are required,
     * or attempting operations on improperly initialized objects.
     */
    class InvalidError extends Error {
        constructor(message) {
            super(message);
            this.name = "InvalidError";
        }
    }

    /**
     * The maximum safe 32-bit signed integer value (2^31 - 1).
     * This is the largest value that can be stored in an Int32Array or similar typed array.
     * Useful for boundary checking in integer operations.
     */
    const INT32_MAX_VALUE = 2147483647;
    /**
     * The minimum safe 32-bit signed integer value (-2^31).
     * This is the smallest value that can be stored in an Int32Array or similar typed array.
     * Useful for boundary checking in integer operations.
     */
    const INT32_MIN_VALUE = -2147483648;

    const { compareExchange: compareExchange$3, wait: wait$2, notify: notify$2, store: store$4, load: load$3 } = Atomics;
    /**
     * A mutual exclusion lock implementation for thread synchronization.
     * Uses SharedArrayBuffer and Atomics for cross-thread operations.
     * Provides basic lock/unlock functionality with additional timed and try variants.
     * Tracks owning thread to prevent deadlocks and enforce proper usage.
     */
    class Mutex {
        /**
         * Initializes a new mutex in shared memory
         * @returns A new Int32Array backed by SharedArrayBuffer with:
         *          - index 0: state (initially unlocked)
         *          - index 1: owner (initially empty)
         */
        static init() {
            const mutex = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2));
            store$4(mutex, Mutex.INDEX_STATE, Mutex.STATE_UNLOCKED);
            store$4(mutex, Mutex.INDEX_OWNER, Mutex.OWNER_EMPTY);
            return mutex;
        }
        /**
         * Acquires the mutex, blocking until available
         * @param mutex The mutex to lock
         * @param threadId Unique identifier for the calling thread
         * @throws {DeadlockError} If thread already owns the mutex
         * @throws {InvalidError} If threadId is invalid
         */
        static lock(mutex, threadId) {
            Mutex.checkThreadIdBeforeLock(mutex, threadId);
            // Spin-wait loop with atomic compare-exchange
            for (;;) {
                // Attempt atomic acquisition
                if (compareExchange$3(mutex, Mutex.INDEX_STATE, Mutex.STATE_UNLOCKED, Mutex.STATE_LOCKED) === Mutex.STATE_UNLOCKED) {
                    store$4(mutex, Mutex.INDEX_OWNER, threadId);
                    return;
                }
                // Wait efficiently if mutex is locked
                wait$2(mutex, Mutex.INDEX_STATE, Mutex.STATE_LOCKED);
            }
        }
        /**
         * Attempts to acquire the mutex with a timeout
         * @param mutex The mutex to lock
         * @param threadId Unique identifier for the calling thread
         * @param timestamp Absolute timeout timestamp in milliseconds
         * @returns true if lock acquired, false if timed out
         * @throws {DeadlockError} If thread already owns the mutex
         * @throws {InvalidError} If threadId is invalid
         */
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
        /**
         * Attempts to acquire the mutex without blocking
         * @param mutex The mutex to lock
         * @param threadId Unique identifier for the calling thread
         * @returns true if lock acquired, false if mutex was busy
         * @throws {DeadlockError} If thread already owns the mutex
         * @throws {InvalidError} If threadId is invalid
         */
        static tryLock(mutex, threadId) {
            Mutex.checkThreadIdBeforeLock(mutex, threadId);
            if (compareExchange$3(mutex, Mutex.INDEX_STATE, Mutex.STATE_UNLOCKED, Mutex.STATE_LOCKED) === Mutex.STATE_UNLOCKED) {
                store$4(mutex, Mutex.INDEX_OWNER, threadId);
                return true;
            }
            return false;
        }
        /**
         * Releases the mutex
         * @param mutex The mutex to unlock
         * @param threadId Unique identifier for the calling thread
         * @throws {PermissionError} If thread doesn't own the mutex or mutex wasn't locked
         * @throws {InvalidError} If threadId is invalid
         */
        static unlock(mutex, threadId) {
            Mutex.checkThreadIdIsValid(threadId);
            // Verify ownership
            if (load$3(mutex, Mutex.INDEX_OWNER) !== threadId) {
                throw new PermissionError("current thread is not owner of mutex");
            }
            // Clear owner first to prevent race conditions
            store$4(mutex, Mutex.INDEX_OWNER, Mutex.OWNER_EMPTY);
            // Verify locked state while unlocking
            if (compareExchange$3(mutex, Mutex.INDEX_STATE, Mutex.STATE_LOCKED, Mutex.STATE_UNLOCKED) === Mutex.STATE_UNLOCKED) {
                throw new PermissionError("mutex was not locked");
            }
            // Wake one waiting thread
            notify$2(mutex, Mutex.INDEX_STATE, 1);
        }
        /**
         * Validates threadId and checks for deadlock conditions before locking
         * @param mutex The mutex being locked
         * @param threadId The thread attempting to lock
         * @throws {DeadlockError} If thread already owns mutex
         * @throws {InvalidError} If threadId is invalid
         */
        static checkThreadIdBeforeLock(mutex, threadId) {
            Mutex.checkThreadIdIsValid(threadId);
            if (load$3(mutex, Mutex.INDEX_OWNER) === threadId) {
                throw new DeadlockError("thread already owns this mutex");
            }
        }
        /**
         * Validates that a threadId is properly formatted and within range
         * @param threadId The thread ID to validate
         * @throws {InvalidError} If threadId is not an integer or is empty
         * @throws {RangeError} If threadId is outside int32 range
         */
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
    // Constants for mutex state management
    Mutex.OWNER_EMPTY = 0; // Value indicating no owner
    Mutex.STATE_UNLOCKED = 0; // Mutex is available
    Mutex.STATE_LOCKED = 1; // Mutex is acquired
    Mutex.INDEX_STATE = 0; // Index for state in array
    Mutex.INDEX_OWNER = 1; // Index for owner in array

    const { compareExchange: compareExchange$2, wait: wait$1, notify: notify$1, store: store$3, load: load$2 } = Atomics;
    /**
     * A counting semaphore implementation for thread synchronization.
     * Controls access to shared resources with a counter that atomically tracks available permits.
     * Supports blocking, timed, and non-blocking acquisition of permits.
     */
    class Semaphore {
        /**
         * Initializes a new semaphore with the specified initial value
         * @param value Initial number of available permits (must be non-negative integer)
         * @returns A new Int32Array backed by SharedArrayBuffer
         * @throws {InvalidError} If value is not an integer
         * @throws {RangeError} If value is negative or exceeds INT32_MAX_VALUE
         */
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
        /**
         * Acquires a permit, blocking until one is available
         * @param sem The semaphore to wait on
         * @note Uses atomic compare-exchange to safely decrement counter
         * @note Efficiently waits when no permits are available
         */
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
        /**
         * Attempts to acquire a permit with a timeout
         * @param sem The semaphore to wait on
         * @param timestamp Absolute timeout timestamp in milliseconds
         * @returns true if permit acquired, false if timed out
         */
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
        /**
         * Attempts to acquire a permit without blocking
         * @param sem The semaphore to try
         * @returns true if permit was acquired, false if no permits available
         */
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
        /**
         * Releases a permit back to the semaphore
         * @param sem The semaphore to post to
         * @throws {RangeError} If incrementing would exceed INT32_MAX_VALUE
         * @note Wakes one waiting thread if counter transitions from 0 to 1
         */
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
        /**
         * Gets the current number of available permits
         * @param sem The semaphore to check
         * @returns Current semaphore value (number of available permits)
         */
        static getValue(sem) {
            return load$2(sem, Semaphore.INDEX_VALUE);
        }
    }
    // Index for the value in the shared array
    Semaphore.INDEX_VALUE = 0;

    const { wait, notify } = Atomics;
    /**
     * A condition variable implementation for thread synchronization.
     * Allows threads to wait for some condition to become true while properly releasing
     * and reacquiring a mutex lock. Uses SharedArrayBuffer for cross-thread communication.
     */
    class Condition {
        /**
         * Initializes a new condition variable in shared memory
         * @returns A new Int32Array backed by SharedArrayBuffer
         */
        static init() {
            return new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
        }
        /**
         * Wakes up one thread waiting on the condition variable
         * @param cond The condition variable to signal
         */
        static signal(cond) {
            notify(cond, 0, 1);
        }
        /**
         * Wakes up all threads waiting on the condition variable
         * @param cond The condition variable to broadcast to
         */
        static broadcast(cond) {
            notify(cond, 0);
        }
        /**
         * Blocks the current thread until the condition variable is signaled
         * @param cond The condition variable to wait on
         * @param mutex The associated mutex to release while waiting
         * @param threadId The ID of the current thread
         * @note Automatically releases mutex before waiting and reacquires after
         */
        static wait(cond, mutex, threadId) {
            Mutex.unlock(mutex, threadId);
            wait(cond, 0, 0);
            Mutex.lock(mutex, threadId);
        }
        /**
         * Blocks the current thread until either:
         * - The condition variable is signaled, or
         * - The specified timeout expires
         * @param cond The condition variable to wait on
         * @param mutex The associated mutex to release while waiting
         * @param threadId The ID of the current thread
         * @param timestamp The absolute timeout timestamp in milliseconds
         * @returns true if the condition was signaled, false if timed out
         * @note Automatically releases mutex before waiting and reacquires after
         */
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
    /**
     * A synchronization primitive that enables multiple threads to wait for each other
     * to reach a common execution point before continuing.
     *
     * Implements a reusable barrier using shared memory, mutex and condition variable.
     */
    class Barrier {
        /**
         * Initializes a new barrier with the specified thread count
         * @param count Number of threads that must reach the barrier before continuing
         * @returns Initialized BarrierObject with shared structures
         * @throws {InvalidError} If count is not an integer
         * @throws {RangeError} If count is <= 0
         */
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
        /**
         * Makes the calling thread wait at the barrier until all threads have arrived
         * @param barrier The barrier object to wait on
         * @param threadId Unique identifier for the calling thread
         * @returns true if this thread was the last to arrive (releases others), false otherwise
         */
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
        /**
         * Validates that the thread count is a positive integer
         * @param count Number to validate
         * @throws {InvalidError} If count is not an integer
         * @throws {RangeError} If count is <= 0
         */
        static validateCount(count) {
            if (!Number.isInteger(count)) {
                throw new InvalidError("count should be integer");
            }
            if (count <= 0) {
                throw new RangeError("count should be greater zero");
            }
        }
    }
    // Indexes for accessing different values in the barrier array
    Barrier.INDEX_COUNT = 0; // Stores total threads required
    Barrier.INDEX_WAITED = 1; // Stores number of threads currently waiting
    Barrier.INDEX_GENERATION = 2; // Stores current barrier generation

    const { compareExchange: compareExchange$1, store: store$1, load } = Atomics;
    /**
     * A spin lock implementation for low-level thread synchronization.
     * Uses busy-waiting with atomic operations for acquiring the lock.
     * More efficient than mutexes for very short critical sections.
     * Tracks owning thread to prevent deadlocks and enforce proper usage.
     */
    class SpinLock {
        /**
         * Initializes a new spin lock in shared memory
         * @returns A new Int32Array backed by SharedArrayBuffer with:
         *          - index 0: state (initially unlocked)
         *          - index 1: owner (initially empty)
         */
        static init() {
            const lock = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2));
            store$1(lock, SpinLock.INDEX_STATE, SpinLock.STATE_UNLOCKED);
            store$1(lock, SpinLock.INDEX_OWNER, SpinLock.OWNER_EMPTY);
            return lock;
        }
        /**
         * Acquires the lock, spinning until available
         * @param lock The spin lock to acquire
         * @param threadId Unique identifier for the calling thread
         * @throws {DeadlockError} If thread already owns the lock
         * @throws {InvalidError} If threadId is invalid
         * @note Uses Atomics.pause() when available to reduce contention
         */
        static lock(lock, threadId) {
            SpinLock.checkThreadIdBeforeLock(lock, threadId);
            // Spin-wait loop with atomic compare-exchange
            for (;;) {
                // Attempt atomic acquisition
                if (compareExchange$1(lock, SpinLock.INDEX_STATE, SpinLock.STATE_UNLOCKED, SpinLock.STATE_LOCKED) ===
                    SpinLock.STATE_UNLOCKED) {
                    store$1(lock, SpinLock.INDEX_OWNER, threadId);
                    return;
                }
                // Use pause instruction to reduce contention when available
                // @ts-ignore
                if (typeof Atomics.pause === "function") {
                    // @ts-ignore
                    Atomics.pause();
                }
            }
        }
        /**
         * Attempts to acquire the lock without spinning
         * @param lock The spin lock to try
         * @param threadId Unique identifier for the calling thread
         * @returns true if lock acquired, false if lock was busy
         * @throws {DeadlockError} If thread already owns the lock
         * @throws {InvalidError} If threadId is invalid
         */
        static tryLock(lock, threadId) {
            SpinLock.checkThreadIdBeforeLock(lock, threadId);
            if (compareExchange$1(lock, SpinLock.INDEX_STATE, SpinLock.STATE_UNLOCKED, SpinLock.STATE_LOCKED) ===
                SpinLock.STATE_UNLOCKED) {
                store$1(lock, SpinLock.INDEX_OWNER, threadId);
                return true;
            }
            return false;
        }
        /**
         * Releases the lock
         * @param lock The spin lock to release
         * @param threadId Unique identifier for the calling thread
         * @throws {PermissionError} If thread doesn't own the lock or lock wasn't locked
         * @throws {InvalidError} If threadId is invalid
         */
        static unlock(lock, threadId) {
            SpinLock.checkThreadIdIsValid(threadId);
            // Verify ownership
            if (load(lock, SpinLock.INDEX_OWNER) !== threadId) {
                throw new PermissionError("current thread is not owner of lock");
            }
            // Clear owner first to prevent race conditions
            store$1(lock, SpinLock.INDEX_OWNER, SpinLock.OWNER_EMPTY);
            // Verify locked state while unlocking
            if (compareExchange$1(lock, SpinLock.INDEX_STATE, SpinLock.STATE_LOCKED, SpinLock.STATE_UNLOCKED) ===
                SpinLock.STATE_UNLOCKED) {
                throw new PermissionError("lock was not locked");
            }
        }
        /**
         * Validates threadId and checks for deadlock conditions before locking
         * @param lock The spin lock being acquired
         * @param threadId The thread attempting to lock
         * @throws {DeadlockError} If thread already owns lock
         * @throws {InvalidError} If threadId is invalid
         */
        static checkThreadIdBeforeLock(lock, threadId) {
            SpinLock.checkThreadIdIsValid(threadId);
            if (load(lock, SpinLock.INDEX_OWNER) === threadId) {
                throw new DeadlockError("thread already owns this lock");
            }
        }
        /**
         * Validates that a threadId is properly formatted and within range
         * @param threadId The thread ID to validate
         * @throws {InvalidError} If threadId is not an integer or is empty
         * @throws {RangeError} If threadId is outside int32 range
         */
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
    // Constants for lock state management
    SpinLock.OWNER_EMPTY = 0; // Value indicating no owner
    SpinLock.STATE_UNLOCKED = 0; // Lock is available
    SpinLock.STATE_LOCKED = 1; // Lock is acquired
    SpinLock.INDEX_STATE = 0; // Index for state in array
    SpinLock.INDEX_OWNER = 1; // Index for owner in array

    const { compareExchange, store } = Atomics;
    /**
     * A synchronization primitive that ensures a function is executed only once,
     * even when called from multiple threads.
     * Uses atomic operations for thread-safe execution tracking.
     */
    class Once {
        /**
         * Initializes a new Once primitive in shared memory
         * @returns A new Int32Array backed by SharedArrayBuffer initialized to NOT_EXECUTED
         */
        static init() {
            const once = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
            store(once, Once.INDEX_EXECUTED, Once.EXECUTED_NO);
            return once;
        }
        /**
         * Executes the provided function exactly once, even if called from multiple threads
         * @param once The Once primitive to use for synchronization
         * @param fn The function to execute (will be called at most once)
         * @note The function will be called by whichever thread wins the atomic race
         */
        static execute(once, fn) {
            if (compareExchange(once, Once.INDEX_EXECUTED, Once.EXECUTED_NO, Once.EXECUTED_YES) === Once.EXECUTED_NO) {
                fn();
            }
        }
        /**
         * Checks if the function has been executed
         * @param once The Once primitive to check
         * @returns true if the function has been executed, false otherwise
         */
        static isExecuted(once) {
            return Atomics.load(once, Once.INDEX_EXECUTED) === Once.EXECUTED_YES;
        }
    }
    // Index for the execution state in the shared array
    Once.INDEX_EXECUTED = 0;
    // Possible execution states
    Once.EXECUTED_NO = 0; // Function has not been executed
    Once.EXECUTED_YES = 1; // Function has been executed

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
