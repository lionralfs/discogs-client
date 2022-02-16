export class DiscogsError extends Error {
    statusCode: number;

    /**
     * Discogs generic error
     * @param {number} [statusCode] - A HTTP status code
     * @param {string} [message] - The error message
     */
    constructor(statusCode?: number, message?: string) {
        super(message || 'Unknown error.');
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
        this.statusCode = statusCode || 404;
    }

    toString() {
        return this.name + ': ' + this.statusCode + ' ' + this.message;
    }
}

/**
 * Discogs authorization error
 */
export class AuthError extends DiscogsError {
    constructor() {
        super(401, 'You must authenticate to access this resource.');
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
