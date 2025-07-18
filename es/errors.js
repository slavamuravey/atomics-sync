export class DeadlockError extends Error {
    constructor(message) {
        super(message);
        this.name = "DeadlockError";
    }
}
export class PermissionError extends Error {
    constructor(message) {
        super(message);
        this.name = "PermissionError";
    }
}
export class InvalidError extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidError";
    }
}
//# sourceMappingURL=errors.js.map