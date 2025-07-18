import { DeadlockError, InvalidError, PermissionError } from "./errors.js";
import { INT32_MAX_VALUE, INT32_MIN_VALUE } from "./limits.js";

const { compareExchange, store, load } = Atomics;

export class SpinLock {
  private static readonly OWNER_EMPTY = 0;

  private static readonly STATE_UNLOCKED = 0;

  private static readonly STATE_LOCKED = 1;

  private static readonly INDEX_STATE = 0;

  private static readonly INDEX_OWNER = 1;

  static init() {
    const lock = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 2));
    store(lock, SpinLock.INDEX_STATE, SpinLock.STATE_UNLOCKED);
    store(lock, SpinLock.INDEX_OWNER, SpinLock.OWNER_EMPTY);

    return lock;
  }

  static lock(lock: Int32Array<SharedArrayBuffer>, threadId: number) {
    SpinLock.checkThreadIdBeforeLock(lock, threadId);

    for (;;) {
      if (
        compareExchange(lock, SpinLock.INDEX_STATE, SpinLock.STATE_UNLOCKED, SpinLock.STATE_LOCKED) ===
        SpinLock.STATE_UNLOCKED
      ) {
        store(lock, SpinLock.INDEX_OWNER, threadId);

        return;
      }

      // @ts-ignore
      if (typeof Atomics.pause === "function") {
        // @ts-ignore
        Atomics.pause();
      }
    }
  }

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

  static unlock(lock: Int32Array<SharedArrayBuffer>, threadId: number) {
    SpinLock.checkThreadIdIsValid(threadId);

    if (load(lock, SpinLock.INDEX_OWNER) !== threadId) {
      throw new PermissionError("current thread is not owner of lock");
    }

    if (
      compareExchange(lock, SpinLock.INDEX_STATE, SpinLock.STATE_LOCKED, SpinLock.STATE_UNLOCKED) ===
      SpinLock.STATE_UNLOCKED
    ) {
      throw new PermissionError("lock was not locked");
    }

    store(lock, SpinLock.INDEX_OWNER, SpinLock.OWNER_EMPTY);
  }

  private static checkThreadIdBeforeLock(lock: Int32Array<SharedArrayBuffer>, threadId: number) {
    SpinLock.checkThreadIdIsValid(threadId);

    if (load(lock, SpinLock.INDEX_OWNER) === threadId) {
      throw new DeadlockError("thread already owns this lock");
    }
  }

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
