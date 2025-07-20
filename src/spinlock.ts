import { DeadlockError, InvalidError, PermissionError } from "./errors.js";
import { INT32_MAX_VALUE, INT32_MIN_VALUE } from "./limits.js";

const { compareExchange, store, load } = Atomics;

/**
 * A spin lock implementation for low-level thread synchronization.
 * Uses busy-waiting with atomic operations for acquiring the lock.
 * More efficient than mutexes for very short critical sections.
 * Tracks owning thread to prevent deadlocks and enforce proper usage.
 */
export class SpinLock {
  // Constants for lock state management
  private static readonly OWNER_EMPTY = 0; // Value indicating no owner

  private static readonly STATE_UNLOCKED = 0; // Lock is available

  private static readonly STATE_LOCKED = 1; // Lock is acquired

  private static readonly INDEX_STATE = 0; // Index for state in array

  private static readonly INDEX_OWNER = 1; // Index for owner in array

  /**
   * Initializes a new spin lock in shared memory
   * @returns A new Int32Array backed by SharedArrayBuffer with:
   *          - index 0: state (initially unlocked)
   *          - index 1: owner (initially empty)
   */
  static init() {
    const lock = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2));
    store(lock, SpinLock.INDEX_STATE, SpinLock.STATE_UNLOCKED);
    store(lock, SpinLock.INDEX_OWNER, SpinLock.OWNER_EMPTY);

    return lock;
  }

  /**
   * Acquires the lock, spinning until available
   * @param lock The spin lock to acquire
   * @param threadId Unique identifier for the calling thread
   * @throws {DeadlockError} If thread already owns the lock
   * @throws {InvalidError} If threadId is invalid
   * @remarks Uses Atomics.pause() when available to reduce contention
   */
  static lock(lock: Int32Array<SharedArrayBuffer>, threadId: number) {
    SpinLock.checkThreadIdBeforeLock(lock, threadId);

    // Spin-wait loop with atomic compare-exchange
    for (;;) {
      // Attempt atomic acquisition
      if (
        compareExchange(lock, SpinLock.INDEX_STATE, SpinLock.STATE_UNLOCKED, SpinLock.STATE_LOCKED) ===
        SpinLock.STATE_UNLOCKED
      ) {
        store(lock, SpinLock.INDEX_OWNER, threadId);

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
  static tryLock(lock: Int32Array<SharedArrayBuffer>, threadId: number) {
    SpinLock.checkThreadIdBeforeLock(lock, threadId);

    if (
      compareExchange(lock, SpinLock.INDEX_STATE, SpinLock.STATE_UNLOCKED, SpinLock.STATE_LOCKED) ===
      SpinLock.STATE_UNLOCKED
    ) {
      store(lock, SpinLock.INDEX_OWNER, threadId);

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
  static unlock(lock: Int32Array<SharedArrayBuffer>, threadId: number) {
    SpinLock.checkThreadIdIsValid(threadId);

    // Verify ownership
    if (load(lock, SpinLock.INDEX_OWNER) !== threadId) {
      throw new PermissionError("current thread is not owner of lock");
    }

    // Clear owner first to prevent race conditions
    store(lock, SpinLock.INDEX_OWNER, SpinLock.OWNER_EMPTY);

    // Verify locked state while unlocking
    if (
      compareExchange(lock, SpinLock.INDEX_STATE, SpinLock.STATE_LOCKED, SpinLock.STATE_UNLOCKED) ===
      SpinLock.STATE_UNLOCKED
    ) {
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
  private static checkThreadIdBeforeLock(lock: Int32Array<SharedArrayBuffer>, threadId: number) {
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
  private static checkThreadIdIsValid(threadId: number) {
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
