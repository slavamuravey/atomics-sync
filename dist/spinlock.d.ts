export declare class SpinLock {
    private static readonly OWNER_EMPTY;
    private static readonly STATE_UNLOCKED;
    private static readonly STATE_LOCKED;
    private static readonly INDEX_STATE;
    private static readonly INDEX_OWNER;
    static init(): Int32Array<SharedArrayBuffer>;
    static lock(lock: Int32Array<SharedArrayBuffer>, threadId: number): void;
    static tryLock(lock: Int32Array<SharedArrayBuffer>, threadId: number): boolean;
    static unlock(lock: Int32Array<SharedArrayBuffer>, threadId: number): void;
    private static checkThreadIdBeforeLock;
    private static checkThreadIdIsValid;
}
