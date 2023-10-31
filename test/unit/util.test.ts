import { describe, expect, test } from 'vitest';
import { stripVariation, escape, toQueryString } from '@lib/util.js';

describe('Util', () => {
    test('stripVariation()', () => {
        const stripped = stripVariation('Artist (2)');
        expect(stripped).toBe('Artist');
    });

    test('escape()', () => {
        const escaped = escape('!@#$%^&*()+');
        expect(escaped).toBe('!%40%23%24%25%5E%26*()%2B');
    });

    test('toQueryString()', () => {
        expect(toQueryString()).toBe('');
        expect(toQueryString({ foo: 'bar', baz: 1 })).toBe('?foo=bar&baz=1');
    });
});
