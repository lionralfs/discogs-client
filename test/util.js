import test from 'ava';
import { stripVariation, escape, addParams } from '../lib/util.js';

test('Util: Test stripVariation()', t => {
    let stripped = stripVariation('Artist (2)');
    t.is(stripped, 'Artist', 'Strip artist variation');
});

test('Util: Test escape()', t => {
    let escaped = escape('!@#$%^&*()+');
    t.is(escaped, '!%40%23%24%25%5E%26*()%2B', 'Escape string "!@#$%^&*()+"');
});

test('Util: Test addParams()', t => {
    t.is(
        addParams('http://an-url.com', { foo: 'bar', baz: 1 }),
        'http://an-url.com?foo=bar&baz=1',
        'URL with no query string'
    );
    t.is(
        addParams('http://an-url.com?y=5', { foo: 'bar', baz: 1 }),
        'http://an-url.com?y=5&foo=bar&baz=1',
        'URL with existing query string'
    );
});
