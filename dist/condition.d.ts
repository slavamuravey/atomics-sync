/**
 * A condition variable implementation for thread synchronization.
 * Allows threads to wait for some condition to become true while properly releasing
 * and reacquiring a mutex lock. Uses SharedArrayBuffer for cross-thread communication.
 */
export declare class Condition {
    /**
     * Initializes a new condition variable in shared memory
     * @returns A new Int32Array backed by SharedArrayBuffer
     */
    static init(): Int32Array<SharedArrayBuffer>;
    /**
     * Wakes up one thread waiting on the condition variable
     * @param cond The condition variable to signal
     */
    static signal(cond: Int32Array<SharedArrayBuffer>): void;
    /**
     * Wakes up all threads waiting on the condition variable
     * @param cond The condition variable to broadcast to
     */
    static broadcast(cond: Int32Array<SharedArrayBuffer>): void;
    /**
     * Blocks the current thread until the condition variable is signaled
     * @param cond The condition variable to wait on
     * @param mutex The associated mutex to release while waiting
     * @param threadId The ID of the current thread
     * @note Automatically releases mutex before waiting and reacquires after
     */
    static wait(cond: Int32Array, mutex: Int32Array<SharedArrayBuffer>, threadId: number): void;
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
    static timedWait(cond: Int32Array<SharedArrayBuffer>, mutex: Int32Array<SharedArrayBuffer>, threadId: number, timestamp: number): boolean;
}
