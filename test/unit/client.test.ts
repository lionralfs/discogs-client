import test from 'ava';
import { DiscogsClient } from '@lib/client.js';

test('DiscogsClient: Test instance', t => {
    t.true(new DiscogsClient() instanceof DiscogsClient);
});

test('DiscogsClient: Test authenticated()', t => {
    t.false(new DiscogsClient().authenticated(1), 'Authentication level 1 === false');
});

test('DiscogsClient: Test setConfig with exponential backoff parameters', t => {
    // Given
    const client = new DiscogsClient();

    // When
    client.setConfig({
        exponentialBackoffMaxRetries: 333,
        exponentialBackoffIntervalMs: 444,
        exponentialBackoffRate: 555,
    });

    // Then
    t.is(client['config'].exponentialBackoffMaxRetries, 333);
    t.is(client['config'].exponentialBackoffIntervalMs, 444);
    t.is(client['config'].exponentialBackoffRate, 555);
});

test('DiscogsClient: Auth (Full OAuth)', t => {
    const client = new DiscogsClient({
        auth: {
            method: 'oauth',
            consumerKey: 'consumerKey',
            consumerSecret: 'consumerSecret',
            accessToken: 'accessToken',
            accessTokenSecret: 'accessTokenSecret',
        },
    });

    t.deepEqual(client['auth'], {
        method: 'oauth',
        level: 2,
        consumerKey: 'consumerKey',
        consumerSecret: 'consumerSecret',
        accessToken: 'accessToken',
        accessTokenSecret: 'accessTokenSecret',
    });
});

test('DiscogsClient: Auth (OAuth without tokens)', t => {
    const client = new DiscogsClient({
        auth: {
            method: 'oauth',
            consumerKey: 'consumerKey',
            consumerSecret: 'consumerSecret',
        },
    });

    t.deepEqual(client['auth'], {
        method: 'oauth',
        level: 1,
        consumerKey: 'consumerKey',
        consumerSecret: 'consumerSecret',
    });
});
