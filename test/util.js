import { log, assert, test as _test } from 'wru';
import { stripVariation, escape, addParams } from '../lib/util.js';

var tests = (module.exports = [
    {
        name: 'Util: Test stripVariation()',
        test: function () {
            var stripped = stripVariation('Artist (2)');
            log('Artist name "Artist (2)" becomes: ' + stripped);
            assert('Strip artist variation', stripped === 'Artist');
        },
    },
    {
        name: 'Util: Test escape()',
        test: function () {
            var escaped = escape('!@#$%^&*()+');
            log('Escaped string: ' + escaped);
            assert('Escape string "!@#$%^&*()+"', escaped === '!%40%23%24%25%5E%26*()%2B');
        },
    },
    {
        name: 'Util: Test addParams()',
        test: function () {
            assert(
                'URL with no query string',
                addParams('http://an-url.com', { foo: 'bar', baz: 1 }) === 'http://an-url.com?foo=bar&baz=1'
            );
            assert(
                'URL with existing query string',
                addParams('http://an-url.com?y=5', { foo: 'bar', baz: 1 }) === 'http://an-url.com?y=5&foo=bar&baz=1'
            );
        },
    },
]);

if (!module.parent) {
    _test(tests);
}
