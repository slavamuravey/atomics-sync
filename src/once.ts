const { compareExchange, store } = Atomics;

/**
 * A synchronization primitive that ensures a function is executed only once,
 * even when called from multiple threads.
 * Uses atomic operations for thread-safe execution tracking.
 */
export class Once {
  // Index for the execution state in the shared array
  private static readonly INDEX_EXECUTED = 0;

  // Possible execution states
  private static readonly EXECUTED_NO = 0; // Function has not been executed

  private static readonly EXECUTED_YES = 1; // Function has been executed

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
   * @remarks The function will be called by whichever thread wins the atomic race
   */
  static execute(once: Int32Array<SharedArrayBuffer>, fn: () => void) {
    if (compareExchange(once, Once.INDEX_EXECUTED, Once.EXECUTED_NO, Once.EXECUTED_YES) === Once.EXECUTED_NO) {
      fn();
    }
  }

  /**
   * Checks if the function has been executed
   * @param once The Once primitive to check
   * @returns true if the function has been executed, false otherwise
   */
  static isExecuted(once: Int32Array<SharedArrayBuffer>): boolean {
    return Atomics.load(once, Once.INDEX_EXECUTED) === Once.EXECUTED_YES;
  }
}
