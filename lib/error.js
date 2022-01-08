/**
 * Discogs generic error
 * @param {number} [statusCode] - A HTTP status code
 * @param {string} [message] - The error message
 * @returns {DiscogsError}
 */

export class DiscogsError extends Error {
    constructor(statusCode = 404, message = 'Unknown error.') {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
        this.statusCode = statusCode;
        this.message = message;
    }

    toString() {
        return this.name + ': ' + this.statusCode + ' ' + this.message;
    }
}

/**
 * Discogs authorization error
 * @returns {AuthError}
 */

export class AuthError extends DiscogsError {
    constructor() {
        super(401, 'You must authenticate to access this resource.');
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
