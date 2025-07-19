/**
 * A spin lock implementation for low-level thread synchronization.
 * Uses busy-waiting with atomic operations for acquiring the lock.
 * More efficient than mutexes for very short critical sections.
 * Tracks owning thread to prevent deadlocks and enforce proper usage.
 */
export declare class SpinLock {
    private static readonly OWNER_EMPTY;
    private static readonly STATE_UNLOCKED;
    private static readonly STATE_LOCKED;
    private static readonly INDEX_STATE;
    private static readonly INDEX_OWNER;
    /**
     * Initializes a new spin lock in shared memory
     * @returns A new Int32Array backed by SharedArrayBuffer with:
     *          - index 0: state (initially unlocked)
     *          - index 1: owner (initially empty)
     */
    static init(): Int32Array<SharedArrayBuffer>;
    /**
     * Acquires the lock, spinning until available
     * @param lock The spin lock to acquire
     * @param threadId Unique identifier for the calling thread
     * @throws {DeadlockError} If thread already owns the lock
     * @throws {InvalidError} If threadId is invalid
     * @note Uses Atomics.pause() when available to reduce contention
     */
    static lock(lock: Int32Array<SharedArrayBuffer>, threadId: number): void;
    /**
     * Attempts to acquire the lock without spinning
     * @param lock The spin lock to try
     * @param threadId Unique identifier for the calling thread
     * @returns true if lock acquired, false if lock was busy
     * @throws {DeadlockError} If thread already owns the lock
     * @throws {InvalidError} If threadId is invalid
     */
    static tryLock(lock: Int32Array<SharedArrayBuffer>, threadId: number): boolean;
    /**
     * Releases the lock
     * @param lock The spin lock to release
     * @param threadId Unique identifier for the calling thread
     * @throws {PermissionError} If thread doesn't own the lock or lock wasn't locked
     * @throws {InvalidError} If threadId is invalid
     */
    static unlock(lock: Int32Array<SharedArrayBuffer>, threadId: number): void;
    /**
     * Validates threadId and checks for deadlock conditions before locking
     * @param lock The spin lock being acquired
     * @param threadId The thread attempting to lock
     * @throws {DeadlockError} If thread already owns lock
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
