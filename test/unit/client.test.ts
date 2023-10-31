import { DiscogsClient } from '@lib/client.js';
import { expect, test, describe } from 'vitest';

describe('DiscogsClient', () => {
    test('Test instance', () => {
        expect(new DiscogsClient() instanceof DiscogsClient);
    });

    test('Test authenticated()', () => {
        expect(new DiscogsClient().authenticated(1)).toBe(false);
    });

    test('Test setConfig with exponential backoff parameters', () => {
        // Given
        const client = new DiscogsClient();

        // When
        client.setConfig({
            exponentialBackoffMaxRetries: 333,
            exponentialBackoffIntervalMs: 444,
            exponentialBackoffRate: 555,
        });

        // Then
        expect(client['config'].exponentialBackoffMaxRetries).toBe(333);
        expect(client['config'].exponentialBackoffIntervalMs).toBe(444);
        expect(client['config'].exponentialBackoffRate).toBe(555);
    });

    test('Auth (Full OAuth)', () => {
        const client = new DiscogsClient({
            auth: {
                method: 'oauth',
                consumerKey: 'consumerKey',
                consumerSecret: 'consumerSecret',
                accessToken: 'accessToken',
                accessTokenSecret: 'accessTokenSecret',
            },
        });

        expect(client['auth']).toStrictEqual({
            method: 'oauth',
            level: 2,
            consumerKey: 'consumerKey',
            consumerSecret: 'consumerSecret',
            accessToken: 'accessToken',
            accessTokenSecret: 'accessTokenSecret',
        });
    });

    test('Auth (OAuth without tokens)', () => {
        const client = new DiscogsClient({
            auth: {
                method: 'oauth',
                consumerKey: 'consumerKey',
                consumerSecret: 'consumerSecret',
            },
        });

        expect(client['auth']).toStrictEqual({
            method: 'oauth',
            level: 1,
            consumerKey: 'consumerKey',
            consumerSecret: 'consumerSecret',
        });
    });
});
