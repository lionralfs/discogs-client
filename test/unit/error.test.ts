import { DiscogsError, AuthError } from '@lib/error.js';
import { expect, test, describe } from 'vitest';

describe('Error', () => {
    test('Test DiscogsError', () => {
        const discogsError = new DiscogsError(403, 'Test');
        // t.true(discogsError instanceof DiscogsError, 'Instance of DiscogsError');
        expect(discogsError instanceof Error);
        expect(discogsError.statusCode).toBe(403);
    });

    test('Test AuthError', () => {
        const authError = new AuthError();
        // t.true(authError instanceof AuthError, 'Instance of AuthError');
        expect(authError instanceof Error);
        expect(authError.statusCode).toBe(401);
    });
});
