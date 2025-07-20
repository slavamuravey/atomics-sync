[**atomics-sync**](../README.md)

***

[atomics-sync](../README.md) / Once

# Class: Once

Defined in: [src/once.ts:8](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/once.ts#L8)

A synchronization primitive that ensures a function is executed only once,
even when called from multiple threads.
Uses atomic operations for thread-safe execution tracking.

## Constructors

### Constructor

> **new Once**(): `Once`

#### Returns

`Once`

## Methods

### execute()

> `static` **execute**(`once`, `fn`): `void`

Defined in: [src/once.ts:34](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/once.ts#L34)

Executes the provided function exactly once, even if called from multiple threads

#### Parameters

##### once

`Int32Array`\<`SharedArrayBuffer`\>

The Once primitive to use for synchronization

##### fn

() => `void`

The function to execute (will be called at most once)

#### Returns

`void`

#### Remarks

The function will be called by whichever thread wins the atomic race

***

### init()

> `static` **init**(): `Int32Array`\<`SharedArrayBuffer`\>

Defined in: [src/once.ts:21](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/once.ts#L21)

Initializes a new Once primitive in shared memory

#### Returns

`Int32Array`\<`SharedArrayBuffer`\>

A new Int32Array backed by SharedArrayBuffer initialized to NOT_EXECUTED

***

### isExecuted()

> `static` **isExecuted**(`once`): `boolean`

Defined in: [src/once.ts:45](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/once.ts#L45)

Checks if the function has been executed

#### Parameters

##### once

`Int32Array`\<`SharedArrayBuffer`\>

The Once primitive to check

#### Returns

`boolean`

true if the function has been executed, false otherwise
