import { DeadlockError, InvalidError, PermissionError } from "./errors.js";
import { INT32_MAX_VALUE, INT32_MIN_VALUE } from "./limits.js";
const { compareExchange, wait, notify, store, load } = Atomics;
/**
 * A mutual exclusion lock implementation for thread synchronization.
 * Uses SharedArrayBuffer and Atomics for cross-thread operations.
 * Provides basic lock/unlock functionality with additional timed and try variants.
 * Tracks owning thread to prevent deadlocks and enforce proper usage.
 */
export class Mutex {
    /**
     * Initializes a new mutex in shared memory
     * @returns A new Int32Array backed by SharedArrayBuffer with:
     *          - index 0: state (initially unlocked)
     *          - index 1: owner (initially empty)
     */
    static init() {
        const mutex = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2));
        store(mutex, Mutex.INDEX_STATE, Mutex.STATE_UNLOCKED);
        store(mutex, Mutex.INDEX_OWNER, Mutex.OWNER_EMPTY);
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
            if (compareExchange(mutex, Mutex.INDEX_STATE, Mutex.STATE_UNLOCKED, Mutex.STATE_LOCKED) === Mutex.STATE_UNLOCKED) {
                store(mutex, Mutex.INDEX_OWNER, threadId);
                return;
            }
            // Wait efficiently if mutex is locked
            wait(mutex, Mutex.INDEX_STATE, Mutex.STATE_LOCKED);
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
        if (compareExchange(mutex, Mutex.INDEX_STATE, Mutex.STATE_UNLOCKED, Mutex.STATE_LOCKED) === Mutex.STATE_UNLOCKED) {
            store(mutex, Mutex.INDEX_OWNER, threadId);
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
        if (load(mutex, Mutex.INDEX_OWNER) !== threadId) {
            throw new PermissionError("current thread is not owner of mutex");
        }
        // Clear owner first to prevent race conditions
        store(mutex, Mutex.INDEX_OWNER, Mutex.OWNER_EMPTY);
        // Verify locked state while unlocking
        if (compareExchange(mutex, Mutex.INDEX_STATE, Mutex.STATE_LOCKED, Mutex.STATE_UNLOCKED) === Mutex.STATE_UNLOCKED) {
            throw new PermissionError("mutex was not locked");
        }
        // Wake one waiting thread
        notify(mutex, Mutex.INDEX_STATE, 1);
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
        if (load(mutex, Mutex.INDEX_OWNER) === threadId) {
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
//# sourceMappingURL=mutex.js.map