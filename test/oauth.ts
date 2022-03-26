import test from 'ava';
import { rest } from 'msw';
import { DiscogsError } from '../lib/error.js';
import { DiscogsOAuth } from '../lib/oauth.js';
import { setupMockAPI } from './_setup.js';

const server = setupMockAPI();

test.serial('OAuth: Get a request token', async t => {
    t.plan(3);

    server.use(
        rest.get('https://api.discogs.com/oauth/request_token', (req, res, ctx) => {
            t.is(req.headers.get('Content-Type'), 'application/x-www-form-urlencoded');
            let authHeader = req.headers.get('Authorization');
            t.regex(
                authHeader as string,
                /^OAuth oauth_consumer_key="consumer_key", oauth_nonce=".+", oauth_signature="consumer_secret&", oauth_signature_method="PLAINTEXT", oauth_timestamp="\d+", oauth_callback="https%3A%2F%2Fexample.com%2Foauth_callback_endpoint"$/
            );
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
