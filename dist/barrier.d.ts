export interface BarrierObject {
    barrier: BigInt64Array<SharedArrayBuffer>;
    mutex: Int32Array<SharedArrayBuffer>;
    cond: Int32Array<SharedArrayBuffer>;
}
export declare class Barrier {
    private static readonly INDEX_COUNT;
    private static readonly INDEX_WAITED;
    private static readonly INDEX_GENERATION;
    static init(count: number): BarrierObject;
    static wait(barrier: BarrierObject, threadId: number): boolean;
    private static validateCount;
}
