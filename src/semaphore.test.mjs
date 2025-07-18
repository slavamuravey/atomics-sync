import assert from "node:assert";
import { describe, it } from "node:test";

import { Worker } from "worker_threads";

import { INT32_MAX_VALUE, InvalidError, Semaphore } from "../dist/index.js";

describe("Semaphore", () => {
  it("should initialize semaphore as Int32Array with size 1 and value 5", () => {
    const sem = Semaphore.init(5);
    assert.ok(sem instanceof Int32Array);
    assert.equal(sem.length, 1);
    assert.equal(Semaphore.getValue(sem), 5);
  });

  it("should throw InvalidError if initial value is not integer", () => {
    assert.throws(() => Semaphore.init(3.14), InvalidError);
  });

  it("should throw RangeError if initial value is negative", () => {
    assert.throws(() => Semaphore.init(-1), RangeError);
  });

  it("should throw RangeError if initial value exceeds INT32_MAX_VALUE", () => {
    assert.throws(() => Semaphore.init(INT32_MAX_VALUE + 1), RangeError);
  });

  it("should decrement semaphore value on wait", () => {
    const sem = Semaphore.init(2);
    Semaphore.wait(sem);
    assert.equal(Semaphore.getValue(sem), 1);
  });

  it("tryWait should return true and decrement value if semaphore > 0", () => {
    const sem = Semaphore.init(1);
    assert.equal(Semaphore.tryWait(sem), true);
    assert.equal(Semaphore.getValue(sem), 0);
  });

  it("tryWait should return false if semaphore is zero", () => {
    const sem = Semaphore.init(0);
    assert.equal(Semaphore.tryWait(sem), false);
  });

  it("timedWait should return true if semaphore is available", () => {
    const sem = Semaphore.init(1);
    const success = Semaphore.timedWait(sem, Date.now() + 100);
    assert.equal(success, true);
    assert.equal(Semaphore.getValue(sem), 0);
  });

  it("timedWait should return false on timeout", () => {
    const sem = Semaphore.init(0);
    const start = Date.now();
    assert.equal(Semaphore.timedWait(sem, start + 100), false);
    assert(Date.now() - start >= 100);
  });

  it("post should increment semaphore value", () => {
    const sem = Semaphore.init(0);
    Semaphore.post(sem);
    assert.equal(Semaphore.getValue(sem), 1);
  });

  it("post should throw RangeError if max value reached", () => {
    const sem = Semaphore.init(INT32_MAX_VALUE);
    assert.throws(() => Semaphore.post(sem), RangeError);
  });

  it("getValue should return current semaphore value", () => {
    const sem = Semaphore.init(42);
    assert.equal(Semaphore.getValue(sem), 42);
  });

  it("post should notify waiting threads", () => {
    const sem = Semaphore.init(0);
    const shared = new Int32Array(new SharedArrayBuffer(4));
    // eslint-disable-next-line no-new
    new Worker("./src/workers/semaphore/notificator.mjs", { workerData: { sem, shared } });
    Semaphore.wait(sem);
    assert.equal(shared[0], 42);
  });
});
