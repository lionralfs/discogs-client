import test from 'ava';
import { DiscogsError, AuthError } from '@lib/error.js';

test('Error: Test DiscogsError', t => {
    const discogsError = new DiscogsError(403, 'Test');
    // t.true(discogsError instanceof DiscogsError, 'Instance of DiscogsError');
    t.true(discogsError instanceof Error, 'Instance of Error');
    t.is(discogsError.statusCode, 403, 'Status code === 403');
});

test('Error: Test AuthError', t => {
    const authError = new AuthError();
    // t.true(authError instanceof AuthError, 'Instance of AuthError');
    t.true(authError instanceof Error, 'Instance of Error');
    t.is(authError.statusCode, 401, 'Status code === 401');
});
