/**
 * A synchronization primitive that ensures a function is executed only once,
 * even when called from multiple threads.
 * Uses atomic operations for thread-safe execution tracking.
 */
export declare class Once {
    private static readonly INDEX_EXECUTED;
    private static readonly EXECUTED_NO;
    private static readonly EXECUTED_YES;
    /**
     * Initializes a new Once primitive in shared memory
     * @returns A new Int32Array backed by SharedArrayBuffer initialized to NOT_EXECUTED
     */
    static init(): Int32Array<SharedArrayBuffer>;
    /**
     * Executes the provided function exactly once, even if called from multiple threads
     * @param once The Once primitive to use for synchronization
     * @param fn The function to execute (will be called at most once)
     * @remarks The function will be called by whichever thread wins the atomic race
     */
    static execute(once: Int32Array<SharedArrayBuffer>, fn: () => void): void;
    /**
     * Checks if the function has been executed
     * @param once The Once primitive to check
     * @returns true if the function has been executed, false otherwise
     */
    static isExecuted(once: Int32Array<SharedArrayBuffer>): boolean;
}
