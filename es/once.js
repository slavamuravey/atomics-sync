const { compareExchange, store } = Atomics;
export class Once {
    static init() {
        const once = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
        store(once, Once.INDEX_EXECUTED, Once.EXECUTED_NO);
        return once;
    }
    static execute(once, fn) {
        if (compareExchange(once, Once.INDEX_EXECUTED, Once.EXECUTED_NO, Once.EXECUTED_YES) === Once.EXECUTED_NO) {
            fn();
        }
    }
    static isExecuted(once) {
        return Atomics.load(once, Once.INDEX_EXECUTED) === Once.EXECUTED_YES;
    }
}
Once.INDEX_EXECUTED = 0;
Once.EXECUTED_NO = 0;
Once.EXECUTED_YES = 1;
//# sourceMappingURL=once.js.map