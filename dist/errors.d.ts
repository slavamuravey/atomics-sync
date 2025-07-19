/**
 * Error thrown when a deadlock situation is detected in synchronization primitives.
 * This typically occurs when threads are circularly waiting for resources/locks
 * held by each other.
 */
export declare class DeadlockError extends Error {
    constructor(message: string);
}
/**
 * Error thrown when a thread attempts an operation it doesn't have permission for,
 * such as unlocking a mutex it doesn't own or accessing protected resources.
 */
export declare class PermissionError extends Error {
    constructor(message: string);
}
/**
 * Error thrown when invalid arguments or operations are detected,
 * such as passing non-integer values where integers are required,
 * or attempting operations on improperly initialized objects.
 */
export declare class InvalidError extends Error {
    constructor(message: string);
}
