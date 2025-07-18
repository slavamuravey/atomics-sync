export declare class Once {
    private static readonly INDEX_EXECUTED;
    private static readonly EXECUTED_NO;
    private static readonly EXECUTED_YES;
    static init(): Int32Array<SharedArrayBuffer>;
    static execute(once: Int32Array<SharedArrayBuffer>, fn: () => void): void;
    static isExecuted(once: Int32Array<SharedArrayBuffer>): boolean;
}
