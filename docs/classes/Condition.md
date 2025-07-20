[**atomics-sync**](../README.md)

***

[atomics-sync](../README.md) / Condition

# Class: Condition

Defined in: [src/condition.ts:10](https://github.com/slavamuravey/atomics-sync/blob/e6320d46ab97f64759045c6429441230b766eb51/src/condition.ts#L10)

A condition variable implementation for thread synchronization.
Allows threads to wait for some condition to become true while properly releasing
and reacquiring a mutex lock. Uses SharedArrayBuffer for cross-thread communication.

## Constructors

### Constructor

> **new Condition**(): `Condition`

#### Returns

`Condition`

## Methods

### broadcast()

> `static` **broadcast**(`cond`): `void`

Defined in: [src/condition.ts:31](https://github.com/slavamuravey/atomics-sync/blob/e6320d46ab97f64759045c6429441230b766eb51/src/condition.ts#L31)

Wakes up all threads waiting on the condition variable

#### Parameters

##### cond

`Int32Array`\<`SharedArrayBuffer`\>

The condition variable to broadcast to

#### Returns

`void`

***

### init()

> `static` **init**(): `Int32Array`\<`SharedArrayBuffer`\>

Defined in: [src/condition.ts:15](https://github.com/slavamuravey/atomics-sync/blob/e6320d46ab97f64759045c6429441230b766eb51/src/condition.ts#L15)

Initializes a new condition variable in shared memory

#### Returns

`Int32Array`\<`SharedArrayBuffer`\>

A new Int32Array backed by SharedArrayBuffer

***

### signal()

> `static` **signal**(`cond`): `void`

Defined in: [src/condition.ts:23](https://github.com/slavamuravey/atomics-sync/blob/e6320d46ab97f64759045c6429441230b766eb51/src/condition.ts#L23)

Wakes up one thread waiting on the condition variable

#### Parameters

##### cond

`Int32Array`\<`SharedArrayBuffer`\>

The condition variable to signal

#### Returns

`void`

***

### timedWait()

> `static` **timedWait**(`cond`, `mutex`, `threadId`, `timestamp`): `boolean`

Defined in: [src/condition.ts:61](https://github.com/slavamuravey/atomics-sync/blob/e6320d46ab97f64759045c6429441230b766eb51/src/condition.ts#L61)

Blocks the current thread until either:
- The condition variable is signaled, or
- The specified timeout expires

#### Parameters

##### cond

`Int32Array`\<`SharedArrayBuffer`\>

The condition variable to wait on

##### mutex

`Int32Array`\<`SharedArrayBuffer`\>

The associated mutex to release while waiting

##### threadId

`number`

The ID of the current thread

##### timestamp

`number`

The absolute timeout timestamp in milliseconds

#### Returns

`boolean`

true if the condition was signaled, false if timed out

#### Remarks

Automatically releases mutex before waiting and reacquires after

***

### wait()

> `static` **wait**(`cond`, `mutex`, `threadId`): `void`

Defined in: [src/condition.ts:42](https://github.com/slavamuravey/atomics-sync/blob/e6320d46ab97f64759045c6429441230b766eb51/src/condition.ts#L42)

Blocks the current thread until the condition variable is signaled

#### Parameters

##### cond

`Int32Array`

The condition variable to wait on

##### mutex

`Int32Array`\<`SharedArrayBuffer`\>

The associated mutex to release while waiting

##### threadId

`number`

The ID of the current thread

#### Returns

`void`

#### Remarks

Automatically releases mutex before waiting and reacquires after
