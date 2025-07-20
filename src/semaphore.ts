import { InvalidError } from "./errors.js";
import { INT32_MAX_VALUE } from "./limits.js";

const { compareExchange, wait, notify, store, load } = Atomics;

/**
 * A counting semaphore implementation for thread synchronization.
 * Controls access to shared resources with a counter that atomically tracks available permits.
 * Supports blocking, timed, and non-blocking acquisition of permits.
 */
export class Semaphore {
  // Index for the value in the shared array
  private static readonly INDEX_VALUE = 0;

  /**
   * Initializes a new semaphore with the specified initial value
   * @param value Initial number of available permits (must be non-negative integer)
   * @returns A new Int32Array backed by SharedArrayBuffer
   * @throws {InvalidError} If value is not an integer
   * @throws {RangeError} If value is negative or exceeds INT32_MAX_VALUE
   */
  static init(value: number) {
    if (!Number.isInteger(value)) {
      throw new InvalidError("initial value should be int32");
    }

    if (value < 0 || value > INT32_MAX_VALUE) {
      throw new RangeError("initial value should be greater or equal zero and less or equal maximum int32 value");
    }

    const sem = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
    store(sem, Semaphore.INDEX_VALUE, value);

    return sem;
  }

  /**
   * Acquires a permit, blocking until one is available
   * @param sem The semaphore to wait on
   * @remarks
   * - Uses atomic compare-exchange to safely decrement counter
   * - Efficiently waits when no permits are available
   */
  static wait(sem: Int32Array<SharedArrayBuffer>) {
    for (;;) {
      const value = load(sem, Semaphore.INDEX_VALUE);
      if (value > 0) {
        if (compareExchange(sem, Semaphore.INDEX_VALUE, value, value - 1) === value) {
          return;
        }
      } else {
        wait(sem, Semaphore.INDEX_VALUE, value);
      }
    }
  }

  /**
   * Attempts to acquire a permit with a timeout
   * @param sem The semaphore to wait on
   * @param timestamp Absolute timeout timestamp in milliseconds
   * @returns true if permit acquired, false if timed out
   */
  static timedWait(sem: Int32Array<SharedArrayBuffer>, timestamp: number) {
    for (;;) {
      const value = load(sem, Semaphore.INDEX_VALUE);
      if (value > 0) {
        if (compareExchange(sem, Semaphore.INDEX_VALUE, value, value - 1) === value) {
          return true;
        }
      } else {
        const timeout = timestamp - Date.now();
        const waitResult = wait(sem, Semaphore.INDEX_VALUE, value, timeout);
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
  static tryWait(sem: Int32Array<SharedArrayBuffer>) {
    for (;;) {
      const value = load(sem, Semaphore.INDEX_VALUE);
      if (value === 0) {
        return false;
      }

      if (compareExchange(sem, Semaphore.INDEX_VALUE, value, value - 1) === value) {
        return true;
      }
    }
  }

  /**
   * Releases a permit back to the semaphore
   * @param sem The semaphore to post to
   * @throws {RangeError} If incrementing would exceed INT32_MAX_VALUE
   * @remarks Wakes one waiting thread if counter transitions from 0 to 1
   */
  static post(sem: Int32Array<SharedArrayBuffer>) {
    for (;;) {
      const value = load(sem, Semaphore.INDEX_VALUE);
      if (value === INT32_MAX_VALUE) {
        throw new RangeError("maximum limit reached for semaphore value");
      }

      if (compareExchange(sem, Semaphore.INDEX_VALUE, value, value + 1) === value) {
        if (value === 0) {
          notify(sem, Semaphore.INDEX_VALUE, 1);
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
  static getValue(sem: Int32Array<SharedArrayBuffer>) {
    return load(sem, Semaphore.INDEX_VALUE);
  }
}
