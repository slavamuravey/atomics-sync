/**
 * Barrier object containing shared memory structures for synchronization
 * barrier - stores barrier state (thread count, waited count, and generation)
 * mutex - mutex for protecting barrier access
 * cond - condition variable for threads to wait on
 */
export interface BarrierObject {
    barrier: BigInt64Array<SharedArrayBuffer>;
    mutex: Int32Array<SharedArrayBuffer>;
    cond: Int32Array<SharedArrayBuffer>;
}
/**
 * A synchronization primitive that enables multiple threads to wait for each other
 * to reach a common execution point before continuing.
 *
 * Implements a reusable barrier using shared memory, mutex and condition variable.
 */
export declare class Barrier {
    private static readonly INDEX_COUNT;
    private static readonly INDEX_WAITED;
    private static readonly INDEX_GENERATION;
    /**
     * Initializes a new barrier with the specified thread count
     * @param count Number of threads that must reach the barrier before continuing
     * @returns Initialized BarrierObject with shared structures
     * @throws {InvalidError} If count is not an integer
     * @throws {RangeError} If count is <= 0
     */
    static init(count: number): BarrierObject;
    /**
     * Makes the calling thread wait at the barrier until all threads have arrived
     * @param barrier The barrier object to wait on
     * @param threadId Unique identifier for the calling thread
     * @returns true if this thread was the last to arrive (releases others), false otherwise
     */
    static wait(barrier: BarrierObject, threadId: number): boolean;
    /**
     * Validates that the thread count is a positive integer
     * @param count Number to validate
     * @throws {InvalidError} If count is not an integer
     * @throws {RangeError} If count is <= 0
     */
    private static validateCount;
}
