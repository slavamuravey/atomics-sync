export declare class Condition {
    static init(): Int32Array<SharedArrayBuffer>;
    static signal(cond: Int32Array<SharedArrayBuffer>): void;
    static broadcast(cond: Int32Array<SharedArrayBuffer>): void;
    static wait(cond: Int32Array, mutex: Int32Array<SharedArrayBuffer>, threadId: number): void;
    static timedWait(cond: Int32Array<SharedArrayBuffer>, mutex: Int32Array<SharedArrayBuffer>, threadId: number, timestamp: number): boolean;
}
