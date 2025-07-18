export declare class Semaphore {
    private static readonly INDEX_VALUE;
    static init(value: number): Int32Array<SharedArrayBuffer>;
    static wait(sem: Int32Array<SharedArrayBuffer>): void;
    static timedWait(sem: Int32Array<SharedArrayBuffer>, timestamp: number): boolean;
    static tryWait(sem: Int32Array<SharedArrayBuffer>): boolean;
    static post(sem: Int32Array<SharedArrayBuffer>): void;
    static getValue(sem: Int32Array<SharedArrayBuffer>): number;
}
