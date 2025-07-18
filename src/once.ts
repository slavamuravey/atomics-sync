const { compareExchange, store } = Atomics;

export class Once {
  private static readonly INDEX_EXECUTED = 0;

  private static readonly EXECUTED_NO = 0;

  private static readonly EXECUTED_YES = 1;

  static init() {
    const once = new Int32Array(new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT));
    store(once, Once.INDEX_EXECUTED, Once.EXECUTED_NO);

    return once;
  }

  static execute(once: Int32Array<SharedArrayBuffer>, fn: () => void) {
    if (compareExchange(once, Once.INDEX_EXECUTED, Once.EXECUTED_NO, Once.EXECUTED_YES) === Once.EXECUTED_NO) {
      fn();
    }
  }

  static isExecuted(once: Int32Array<SharedArrayBuffer>): boolean {
    return Atomics.load(once, Once.INDEX_EXECUTED) === Once.EXECUTED_YES;
  }
}
