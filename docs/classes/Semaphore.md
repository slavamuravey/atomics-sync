[**atomics-sync**](../README.md)

***

[atomics-sync](../README.md) / Semaphore

# Class: Semaphore

Defined in: [src/semaphore.ts:11](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/semaphore.ts#L11)

A counting semaphore implementation for thread synchronization.
Controls access to shared resources with a counter that atomically tracks available permits.
Supports blocking, timed, and non-blocking acquisition of permits.

## Constructors

### Constructor

> **new Semaphore**(): `Semaphore`

#### Returns

`Semaphore`

## Methods

### getValue()

> `static` **getValue**(`sem`): `number`

Defined in: [src/semaphore.ts:126](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/semaphore.ts#L126)

Gets the current number of available permits

#### Parameters

##### sem

`Int32Array`\<`SharedArrayBuffer`\>

The semaphore to check

#### Returns

`number`

Current semaphore value (number of available permits)

***

### init()

> `static` **init**(`value`): `Int32Array`\<`SharedArrayBuffer`\>

Defined in: [src/semaphore.ts:22](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/semaphore.ts#L22)

Initializes a new semaphore with the specified initial value

#### Parameters

##### value

`number`

Initial number of available permits (must be non-negative integer)

#### Returns

`Int32Array`\<`SharedArrayBuffer`\>

A new Int32Array backed by SharedArrayBuffer

#### Throws

If value is not an integer

#### Throws

If value is negative or exceeds INT32_MAX_VALUE

***

### post()

> `static` **post**(`sem`): `void`

Defined in: [src/semaphore.ts:104](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/semaphore.ts#L104)

Releases a permit back to the semaphore

#### Parameters

##### sem

`Int32Array`\<`SharedArrayBuffer`\>

The semaphore to post to

#### Returns

`void`

#### Throws

If incrementing would exceed INT32_MAX_VALUE

#### Remarks

Wakes one waiting thread if counter transitions from 0 to 1

***

### timedWait()

> `static` **timedWait**(`sem`, `timestamp`): `boolean`

Defined in: [src/semaphore.ts:63](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/semaphore.ts#L63)

Attempts to acquire a permit with a timeout

#### Parameters

##### sem

`Int32Array`\<`SharedArrayBuffer`\>

The semaphore to wait on

##### timestamp

`number`

Absolute timeout timestamp in milliseconds

#### Returns

`boolean`

true if permit acquired, false if timed out

***

### tryWait()

> `static` **tryWait**(`sem`): `boolean`

Defined in: [src/semaphore.ts:85](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/semaphore.ts#L85)

Attempts to acquire a permit without blocking

#### Parameters

##### sem

`Int32Array`\<`SharedArrayBuffer`\>

The semaphore to try

#### Returns

`boolean`

true if permit was acquired, false if no permits available

***

### wait()

> `static` **wait**(`sem`): `void`

Defined in: [src/semaphore.ts:44](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/semaphore.ts#L44)

Acquires a permit, blocking until one is available

#### Parameters

##### sem

`Int32Array`\<`SharedArrayBuffer`\>

The semaphore to wait on

#### Returns

`void`

#### Remarks

- Uses atomic compare-exchange to safely decrement counter
- Efficiently waits when no permits are available
