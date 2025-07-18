export declare class Mutex {
    private static readonly OWNER_EMPTY;
    private static readonly STATE_UNLOCKED;
    private static readonly STATE_LOCKED;
    private static readonly INDEX_STATE;
    private static readonly INDEX_OWNER;
    static init(): Int32Array<SharedArrayBuffer>;
    static lock(mutex: Int32Array<SharedArrayBuffer>, threadId: number): void;
    static timedLock(mutex: Int32Array<SharedArrayBuffer>, threadId: number, timestamp: number): boolean;
    static tryLock(mutex: Int32Array<SharedArrayBuffer>, threadId: number): boolean;
    static unlock(mutex: Int32Array<SharedArrayBuffer>, threadId: number): void;
    private static checkThreadIdBeforeLock;
    private static checkThreadIdIsValid;
}
