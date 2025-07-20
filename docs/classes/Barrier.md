[**atomics-sync**](../README.md)

***

[atomics-sync](../README.md) / Barrier

# Class: Barrier

Defined in: [src/barrier.ts:25](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/barrier.ts#L25)

A synchronization primitive that enables multiple threads to wait for each other
to reach a common execution point before continuing.

Implements a reusable barrier using shared memory, mutex and condition variable.

## Constructors

### Constructor

> **new Barrier**(): `Barrier`

#### Returns

`Barrier`

## Methods

### init()

> `static` **init**(`count`): [`BarrierObject`](../interfaces/BarrierObject.md)

Defined in: [src/barrier.ts:40](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/barrier.ts#L40)

Initializes a new barrier with the specified thread count

#### Parameters

##### count

`number`

Number of threads that must reach the barrier before continuing

#### Returns

[`BarrierObject`](../interfaces/BarrierObject.md)

Initialized BarrierObject with shared structures

#### Throws

If count is not an integer

#### Throws

If count is <= 0

***

### wait()

> `static` **wait**(`barrier`, `threadId`): `boolean`

Defined in: [src/barrier.ts:63](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/barrier.ts#L63)

Makes the calling thread wait at the barrier until all threads have arrived

#### Parameters

##### barrier

[`BarrierObject`](../interfaces/BarrierObject.md)

The barrier object to wait on

##### threadId

`number`

Unique identifier for the calling thread

#### Returns

`boolean`

true if this thread was the last to arrive (releases others), false otherwise
