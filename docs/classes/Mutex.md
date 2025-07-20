[**atomics-sync**](../README.md)

***

[atomics-sync](../README.md) / Mutex

# Class: Mutex

Defined in: [src/mutex.ts:12](https://github.com/slavamuravey/atomics-sync/blob/e6320d46ab97f64759045c6429441230b766eb51/src/mutex.ts#L12)

A mutual exclusion lock implementation for thread synchronization.
Uses SharedArrayBuffer and Atomics for cross-thread operations.
Provides basic lock/unlock functionality with additional timed and try variants.
Tracks owning thread to prevent deadlocks and enforce proper usage.

## Constructors

### Constructor

> **new Mutex**(): `Mutex`

#### Returns

`Mutex`

## Methods

### init()

> `static` **init**(): `Int32Array`\<`SharedArrayBuffer`\>

Defined in: [src/mutex.ts:30](https://github.com/slavamuravey/atomics-sync/blob/e6320d46ab97f64759045c6429441230b766eb51/src/mutex.ts#L30)

Initializes a new mutex in shared memory

#### Returns

`Int32Array`\<`SharedArrayBuffer`\>

A new Int32Array backed by SharedArrayBuffer with:
         - index 0: state (initially unlocked)
         - index 1: owner (initially empty)

***

### lock()

> `static` **lock**(`mutex`, `threadId`): `void`

Defined in: [src/mutex.ts:45](https://github.com/slavamuravey/atomics-sync/blob/e6320d46ab97f64759045c6429441230b766eb51/src/mutex.ts#L45)

Acquires the mutex, blocking until available

#### Parameters

##### mutex

`Int32Array`\<`SharedArrayBuffer`\>

The mutex to lock

##### threadId

`number`

Unique identifier for the calling thread

#### Returns

`void`

#### Throws

If thread already owns the mutex

#### Throws

If threadId is invalid

***

### timedLock()

> `static` **timedLock**(`mutex`, `threadId`, `timestamp`): `boolean`

Defined in: [src/mutex.ts:73](https://github.com/slavamuravey/atomics-sync/blob/e6320d46ab97f64759045c6429441230b766eb51/src/mutex.ts#L73)

Attempts to acquire the mutex with a timeout

#### Parameters

##### mutex

`Int32Array`\<`SharedArrayBuffer`\>

The mutex to lock

##### threadId

`number`

Unique identifier for the calling thread

##### timestamp

`number`

Absolute timeout timestamp in milliseconds

#### Returns

`boolean`

true if lock acquired, false if timed out

#### Throws

If thread already owns the mutex

#### Throws

If threadId is invalid

***

### tryLock()

> `static` **tryLock**(`mutex`, `threadId`): `boolean`

Defined in: [src/mutex.ts:101](https://github.com/slavamuravey/atomics-sync/blob/e6320d46ab97f64759045c6429441230b766eb51/src/mutex.ts#L101)

Attempts to acquire the mutex without blocking

#### Parameters

##### mutex

`Int32Array`\<`SharedArrayBuffer`\>

The mutex to lock

##### threadId

`number`

Unique identifier for the calling thread

#### Returns

`boolean`

true if lock acquired, false if mutex was busy

#### Throws

If thread already owns the mutex

#### Throws

If threadId is invalid

***

### unlock()

> `static` **unlock**(`mutex`, `threadId`): `void`

Defined in: [src/mutex.ts:120](https://github.com/slavamuravey/atomics-sync/blob/e6320d46ab97f64759045c6429441230b766eb51/src/mutex.ts#L120)

Releases the mutex

#### Parameters

##### mutex

`Int32Array`\<`SharedArrayBuffer`\>

The mutex to unlock

##### threadId

`number`

Unique identifier for the calling thread

#### Returns

`void`

#### Throws

If thread doesn't own the mutex or mutex wasn't locked

#### Throws

If threadId is invalid
