import { assert, test as _test } from 'wru';
import { DiscogsError, AuthError } from '../lib/error.js';

var tests = (module.exports = [
    {
        name: 'Error: Test DiscogsError',
        test: function () {
            var discogsError = new DiscogsError(403, 'Test');
            assert('Instance of DiscogsError', discogsError instanceof DiscogsError);
            assert('Instance of Error', discogsError instanceof Error);
            assert('Status code === 403', discogsError.statusCode === 403);
        },
    },
    {
        name: 'Error: Test AuthError',
        test: function () {
            var authError = new AuthError();
            assert('Instance of AuthError', authError instanceof AuthError);
            assert('Instance of Error', authError instanceof Error);
            assert('Status code === 401', authError.statusCode === 401);
        },
    },
]);

if (!module.parent) {
    _test(tests);
}
