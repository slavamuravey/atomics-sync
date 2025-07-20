/**
 * A counting semaphore implementation for thread synchronization.
 * Controls access to shared resources with a counter that atomically tracks available permits.
 * Supports blocking, timed, and non-blocking acquisition of permits.
 */
export declare class Semaphore {
    private static readonly INDEX_VALUE;
    /**
     * Initializes a new semaphore with the specified initial value
     * @param value Initial number of available permits (must be non-negative integer)
     * @returns A new Int32Array backed by SharedArrayBuffer
     * @throws {InvalidError} If value is not an integer
     * @throws {RangeError} If value is negative or exceeds INT32_MAX_VALUE
     */
    static init(value: number): Int32Array<SharedArrayBuffer>;
    /**
     * Acquires a permit, blocking until one is available
     * @param sem The semaphore to wait on
     * @remarks
     * - Uses atomic compare-exchange to safely decrement counter
     * - Efficiently waits when no permits are available
     */
    static wait(sem: Int32Array<SharedArrayBuffer>): void;
    /**
     * Attempts to acquire a permit with a timeout
     * @param sem The semaphore to wait on
     * @param timestamp Absolute timeout timestamp in milliseconds
     * @returns true if permit acquired, false if timed out
     */
    static timedWait(sem: Int32Array<SharedArrayBuffer>, timestamp: number): boolean;
    /**
     * Attempts to acquire a permit without blocking
     * @param sem The semaphore to try
     * @returns true if permit was acquired, false if no permits available
     */
    static tryWait(sem: Int32Array<SharedArrayBuffer>): boolean;
    /**
     * Releases a permit back to the semaphore
     * @param sem The semaphore to post to
     * @throws {RangeError} If incrementing would exceed INT32_MAX_VALUE
     * @remarks Wakes one waiting thread if counter transitions from 0 to 1
     */
    static post(sem: Int32Array<SharedArrayBuffer>): void;
    /**
     * Gets the current number of available permits
     * @param sem The semaphore to check
     * @returns Current semaphore value (number of available permits)
     */
    static getValue(sem: Int32Array<SharedArrayBuffer>): number;
}
