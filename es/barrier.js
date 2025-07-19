import { Condition } from "./condition";
import { InvalidError } from "./errors";
import { Mutex } from "./mutex";
const { store, load, add } = Atomics;
/**
 * A synchronization primitive that enables multiple threads to wait for each other
 * to reach a common execution point before continuing.
 *
 * Implements a reusable barrier using shared memory, mutex and condition variable.
 */
export class Barrier {
    /**
     * Initializes a new barrier with the specified thread count
     * @param count Number of threads that must reach the barrier before continuing
     * @returns Initialized BarrierObject with shared structures
     * @throws {InvalidError} If count is not an integer
     * @throws {RangeError} If count is <= 0
     */
    static init(count) {
        Barrier.validateCount(count);
        const barrier = new BigInt64Array(new SharedArrayBuffer(BigInt64Array.BYTES_PER_ELEMENT * 3));
        store(barrier, Barrier.INDEX_COUNT, BigInt(count));
        store(barrier, Barrier.INDEX_WAITED, 0n);
        store(barrier, Barrier.INDEX_GENERATION, 0n);
        const mutex = Mutex.init();
        const cond = Condition.init();
        return {
            barrier,
            mutex,
            cond
        };
    }
    /**
     * Makes the calling thread wait at the barrier until all threads have arrived
     * @param barrier The barrier object to wait on
     * @param threadId Unique identifier for the calling thread
     * @returns true if this thread was the last to arrive (releases others), false otherwise
     */
    static wait(barrier, threadId) {
        Mutex.lock(barrier.mutex, threadId);
        const generation = load(barrier.barrier, Barrier.INDEX_GENERATION);
        const count = load(barrier.barrier, Barrier.INDEX_COUNT);
        const waited = add(barrier.barrier, Barrier.INDEX_WAITED, 1n) + 1n;
        try {
            if (waited >= count) {
                store(barrier.barrier, Barrier.INDEX_WAITED, 0n);
                add(barrier.barrier, Barrier.INDEX_GENERATION, 1n);
                Condition.broadcast(barrier.cond);
                return true;
            }
            while (load(barrier.barrier, Barrier.INDEX_GENERATION) === generation) {
                Condition.wait(barrier.cond, barrier.mutex, threadId);
            }
            return false;
        }
        finally {
            Mutex.unlock(barrier.mutex, threadId);
        }
    }
    /**
     * Validates that the thread count is a positive integer
     * @param count Number to validate
     * @throws {InvalidError} If count is not an integer
     * @throws {RangeError} If count is <= 0
     */
    static validateCount(count) {
        if (!Number.isInteger(count)) {
            throw new InvalidError("count should be integer");
        }
        if (count <= 0) {
            throw new RangeError("count should be greater zero");
        }
    }
}
// Indexes for accessing different values in the barrier array
Barrier.INDEX_COUNT = 0; // Stores total threads required
Barrier.INDEX_WAITED = 1; // Stores number of threads currently waiting
Barrier.INDEX_GENERATION = 2; // Stores current barrier generation
//# sourceMappingURL=barrier.js.map