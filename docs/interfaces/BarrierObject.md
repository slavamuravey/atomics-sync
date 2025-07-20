[**atomics-sync**](../README.md)

***

[atomics-sync](../README.md) / BarrierObject

# Interface: BarrierObject

Defined in: [src/barrier.ts:13](https://github.com/slavamuravey/atomics-sync/blob/e6320d46ab97f64759045c6429441230b766eb51/src/barrier.ts#L13)

Barrier object containing shared memory structures for synchronization
barrier - stores barrier state (thread count, waited count, and generation)
mutex - mutex for protecting barrier access
cond - condition variable for threads to wait on

## Properties

### barrier

> **barrier**: `BigInt64Array`\<`SharedArrayBuffer`\>

Defined in: [src/barrier.ts:14](https://github.com/slavamuravey/atomics-sync/blob/e6320d46ab97f64759045c6429441230b766eb51/src/barrier.ts#L14)

***

### cond

> **cond**: `Int32Array`\<`SharedArrayBuffer`\>

Defined in: [src/barrier.ts:16](https://github.com/slavamuravey/atomics-sync/blob/e6320d46ab97f64759045c6429441230b766eb51/src/barrier.ts#L16)

***

### mutex

> **mutex**: `Int32Array`\<`SharedArrayBuffer`\>

Defined in: [src/barrier.ts:15](https://github.com/slavamuravey/atomics-sync/blob/e6320d46ab97f64759045c6429441230b766eb51/src/barrier.ts#L15)
