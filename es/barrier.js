import { Condition } from "./condition";
import { InvalidError } from "./errors";
import { Mutex } from "./mutex";
const { store, load, add } = Atomics;
export class Barrier {
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
    static validateCount(count) {
        if (!Number.isInteger(count)) {
            throw new InvalidError("count should be integer");
        }
        if (count <= 0) {
            throw new RangeError("count should be greater zero");
        }
    }
}
Barrier.INDEX_COUNT = 0;
Barrier.INDEX_WAITED = 1;
Barrier.INDEX_GENERATION = 2;
//# sourceMappingURL=barrier.js.map