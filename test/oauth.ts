import test from 'ava';
import { rest } from 'msw';
import { DiscogsError } from '../lib/error.js';
import { DiscogsOAuth, toAuthHeader } from '../lib/oauth.js';
import { setupMockAPI } from './_setup.js';

const server = setupMockAPI();

test.serial('OAuth: Get a request token', async t => {
    t.plan(4);

    server.use(
        rest.get('https://api.discogs.com/oauth/request_token', (req, res, ctx) => {
            t.is(req.headers.get('Content-Type'), 'application/x-www-form-urlencoded');
            let authHeader = req.headers.get('Authorization');
            t.regex(
                authHeader as string,
                /^OAuth oauth_consumer_key="consumer_key", oauth_nonce=".+", oauth_signature="consumer_secret&", oauth_signature_method="PLAINTEXT", oauth_timestamp="\d+", oauth_callback="https%3A%2F%2Fexample.com%2Foauth_callback_endpoint"$/
            );
            t.true(req.headers.get('User-Agent')?.startsWith('@lionralfs/discogs-client/'));
            return res(
                ctx.status(200),
                ctx.text('oauth_token=some-token&oauth_token_secret=some-token-secret&oauth_callback_confirmed=true')
            );
        })
    );

    let oauth = new DiscogsOAuth('consumer_key', 'consumer_secret');
    let response = await oauth.getRequestToken('https://example.com/oauth_callback_endpoint');
    t.deepEqual(response, {
        token: 'some-token',
        tokenSecret: 'some-token-secret',
        callbackConfirmed: true,
        authorizeUrl: 'https://discogs.com/oauth/authorize?oauth_token=some-token',
    });
});

test.serial('OAuth: Get a request token (error)', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/oauth/request_token', (req, res, ctx) => {
            return res(ctx.status(401), ctx.text('Invalid consumer.'));
        })
    );

    let oauth = new DiscogsOAuth('invalid_key', 'invalid_secret');

    await t.throwsAsync(() => oauth.getRequestToken('https://example.com/oauth_callback_endpoint'), {
        instanceOf: DiscogsError,
        message: 'Invalid consumer.',
    });
});

test.serial('OAuth: Get an access token', async t => {
    t.plan(4);

    server.use(
        rest.post('https://api.discogs.com/oauth/access_token', (req, res, ctx) => {
            t.is(req.headers.get('Content-Type'), 'application/x-www-form-urlencoded');
            let authHeader = req.headers.get('Authorization');
            t.regex(
                authHeader as string,
                /^OAuth oauth_consumer_key="consumer_key", oauth_nonce=".+", oauth_token="oauth_token_received_from_step_2", oauth_signature="consumer_secret&token_secret", oauth_signature_method="PLAINTEXT", oauth_timestamp="\d+", oauth_verifier="users_verifier"$/
            );
            t.true(req.headers.get('User-Agent')?.startsWith('@lionralfs/discogs-client/'));
            return res(ctx.status(200), ctx.text('oauth_token=abc123&oauth_token_secret=xyz789'));
        })
    );

    let oauth = new DiscogsOAuth('consumer_key', 'consumer_secret');
    let response = await oauth.getAccessToken('oauth_token_received_from_step_2', 'token_secret', 'users_verifier');
    t.deepEqual(response, {
        accessToken: 'abc123',
        accessTokenSecret: 'xyz789',
    });
});

test.serial('OAuth: Get an access token (error)', async t => {
    t.plan(1);

    server.use(
        rest.post('https://api.discogs.com/oauth/access_token', (req, res, ctx) => {
            return res(ctx.status(401), ctx.text('Invalid consumer.'));
        })
    );

    let oauth = new DiscogsOAuth('consumer_key', 'consumer_secret');
    await t.throwsAsync(
        () => oauth.getAccessToken('oauth_token_received_from_step_2', 'token_secret', 'users_verifier'),
        {
            instanceOf: DiscogsError,
            message: 'Invalid consumer.',
        }
    );
});

test('OAuth: toAuthHeader', t => {
    t.regex(
        toAuthHeader('consumer_key', 'consumer_secret', 'access_token', 'access_token_secret'),
        /^OAuth oauth_consumer_key="consumer_key", oauth_token="access_token", oauth_signature_method="PLAINTEXT", oauth_signature="consumer_secret&access_token_secret", oauth_timestamp="\d+", oauth_nonce=".+", oauth_token_secret="access_token_secret", oauth_version="1.0"$/
    );
});
