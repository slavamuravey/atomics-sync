[**atomics-sync**](../README.md)

***

[atomics-sync](../README.md) / SpinLock

# Class: SpinLock

Defined in: [src/spinlock.ts:12](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/spinlock.ts#L12)

A spin lock implementation for low-level thread synchronization.
Uses busy-waiting with atomic operations for acquiring the lock.
More efficient than mutexes for very short critical sections.
Tracks owning thread to prevent deadlocks and enforce proper usage.

## Constructors

### Constructor

> **new SpinLock**(): `SpinLock`

#### Returns

`SpinLock`

## Methods

### init()

> `static` **init**(): `Int32Array`\<`SharedArrayBuffer`\>

Defined in: [src/spinlock.ts:30](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/spinlock.ts#L30)

Initializes a new spin lock in shared memory

#### Returns

`Int32Array`\<`SharedArrayBuffer`\>

A new Int32Array backed by SharedArrayBuffer with:
         - index 0: state (initially unlocked)
         - index 1: owner (initially empty)

***

### lock()

> `static` **lock**(`lock`, `threadId`): `void`

Defined in: [src/spinlock.ts:46](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/spinlock.ts#L46)

Acquires the lock, spinning until available

#### Parameters

##### lock

`Int32Array`\<`SharedArrayBuffer`\>

The spin lock to acquire

##### threadId

`number`

Unique identifier for the calling thread

#### Returns

`void`

#### Throws

If thread already owns the lock

#### Throws

If threadId is invalid

#### Remarks

Uses Atomics.pause() when available to reduce contention

***

### tryLock()

> `static` **tryLock**(`lock`, `threadId`): `boolean`

Defined in: [src/spinlock.ts:78](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/spinlock.ts#L78)

Attempts to acquire the lock without spinning

#### Parameters

##### lock

`Int32Array`\<`SharedArrayBuffer`\>

The spin lock to try

##### threadId

`number`

Unique identifier for the calling thread

#### Returns

`boolean`

true if lock acquired, false if lock was busy

#### Throws

If thread already owns the lock

#### Throws

If threadId is invalid

***

### unlock()

> `static` **unlock**(`lock`, `threadId`): `void`

Defined in: [src/spinlock.ts:100](https://github.com/slavamuravey/atomics-sync/blob/75e5db5e81c583024857ae60b2746ded23c99a17/src/spinlock.ts#L100)

Releases the lock

#### Parameters

##### lock

`Int32Array`\<`SharedArrayBuffer`\>

The spin lock to release

##### threadId

`number`

Unique identifier for the calling thread

#### Returns

`void`

#### Throws

If thread doesn't own the lock or lock wasn't locked

#### Throws

If threadId is invalid
