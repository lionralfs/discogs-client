import test from 'ava';
import { stripVariation, escape, toQueryString } from '@lib/util.js';

test('Util: Test stripVariation()', t => {
    const stripped = stripVariation('Artist (2)');
    t.is(stripped, 'Artist', 'Strip artist variation');
});

test('Util: Test escape()', t => {
    const escaped = escape('!@#$%^&*()+');
    t.is(escaped, '!%40%23%24%25%5E%26*()%2B', 'Escape string "!@#$%^&*()+"');
});

test('Util: Test toQueryString()', t => {
    t.is(toQueryString(), '');
    t.is(toQueryString({ foo: 'bar', baz: 1 }), '?foo=bar&baz=1');
});
