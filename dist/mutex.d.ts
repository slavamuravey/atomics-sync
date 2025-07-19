/**
 * A mutual exclusion lock implementation for thread synchronization.
 * Uses SharedArrayBuffer and Atomics for cross-thread operations.
 * Provides basic lock/unlock functionality with additional timed and try variants.
 * Tracks owning thread to prevent deadlocks and enforce proper usage.
 */
export declare class Mutex {
    private static readonly OWNER_EMPTY;
    private static readonly STATE_UNLOCKED;
    private static readonly STATE_LOCKED;
    private static readonly INDEX_STATE;
    private static readonly INDEX_OWNER;
    /**
     * Initializes a new mutex in shared memory
     * @returns A new Int32Array backed by SharedArrayBuffer with:
     *          - index 0: state (initially unlocked)
     *          - index 1: owner (initially empty)
     */
    static init(): Int32Array<SharedArrayBuffer>;
    /**
     * Acquires the mutex, blocking until available
     * @param mutex The mutex to lock
     * @param threadId Unique identifier for the calling thread
     * @throws {DeadlockError} If thread already owns the mutex
     * @throws {InvalidError} If threadId is invalid
     */
    static lock(mutex: Int32Array<SharedArrayBuffer>, threadId: number): void;
    /**
     * Attempts to acquire the mutex with a timeout
     * @param mutex The mutex to lock
     * @param threadId Unique identifier for the calling thread
     * @param timestamp Absolute timeout timestamp in milliseconds
     * @returns true if lock acquired, false if timed out
     * @throws {DeadlockError} If thread already owns the mutex
     * @throws {InvalidError} If threadId is invalid
     */
    static timedLock(mutex: Int32Array<SharedArrayBuffer>, threadId: number, timestamp: number): boolean;
    /**
     * Attempts to acquire the mutex without blocking
     * @param mutex The mutex to lock
     * @param threadId Unique identifier for the calling thread
     * @returns true if lock acquired, false if mutex was busy
     * @throws {DeadlockError} If thread already owns the mutex
     * @throws {InvalidError} If threadId is invalid
     */
    static tryLock(mutex: Int32Array<SharedArrayBuffer>, threadId: number): boolean;
    /**
     * Releases the mutex
     * @param mutex The mutex to unlock
     * @param threadId Unique identifier for the calling thread
     * @throws {PermissionError} If thread doesn't own the mutex or mutex wasn't locked
     * @throws {InvalidError} If threadId is invalid
     */
    static unlock(mutex: Int32Array<SharedArrayBuffer>, threadId: number): void;
    /**
     * Validates threadId and checks for deadlock conditions before locking
     * @param mutex The mutex being locked
     * @param threadId The thread attempting to lock
     * @throws {DeadlockError} If thread already owns mutex
     * @throws {InvalidError} If threadId is invalid
     */
    private static checkThreadIdBeforeLock;
    /**
     * Validates that a threadId is properly formatted and within range
     * @param threadId The thread ID to validate
     * @throws {InvalidError} If threadId is not an integer or is empty
     * @throws {RangeError} If threadId is outside int32 range
     */
    private static checkThreadIdIsValid;
}
