import { rest } from 'msw';
import { DiscogsError } from '@lib/error.js';
import { DiscogsOAuth } from '@lib/oauth.js';
import { setupMockAPI } from './setup.js';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('OAuth', () => {
    test('Get a request token', async () => {
        server.use(
            rest.get('https://api.discogs.com/oauth/request_token', (req, res, ctx) => {
                expect(req.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
                const authHeader = req.headers.get('Authorization');
                expect(authHeader as string).toMatch(
                    /^OAuth oauth_consumer_key="consumer_key", oauth_nonce=".+", oauth_signature="consumer_secret&", oauth_signature_method="PLAINTEXT", oauth_timestamp="\d+", oauth_callback="https%3A%2F%2Fexample.com%2Foauth_callback_endpoint"$/
                );
                expect(req.headers.get('User-Agent')?.startsWith('@lionralfs/discogs-client/'));
                return res(
                    ctx.status(200),
                    ctx.text(
                        'oauth_token=some-token&oauth_token_secret=some-token-secret&oauth_callback_confirmed=true'
                    )
                );
            })
        );

        const oauth = new DiscogsOAuth('consumer_key', 'consumer_secret');
        const response = await oauth.getRequestToken('https://example.com/oauth_callback_endpoint');
        expect(response).toStrictEqual({
            token: 'some-token',
            tokenSecret: 'some-token-secret',
            callbackConfirmed: true,
            authorizeUrl: 'https://discogs.com/oauth/authorize?oauth_token=some-token',
        });
    });

    test('Get a request token (error)', async () => {
        server.use(
            rest.get('https://api.discogs.com/oauth/request_token', (req, res, ctx) => {
                return res(ctx.status(401), ctx.text('Invalid consumer.'));
            })
        );

        const oauth = new DiscogsOAuth('invalid_key', 'invalid_secret');

        await expect(oauth.getRequestToken('https://example.com/oauth_callback_endpoint')).rejects.toThrowError(
            new DiscogsError(401, 'Invalid consumer.')
        );
    });

    test('Get an access token', async () => {
        server.use(
            rest.post('https://api.discogs.com/oauth/access_token', (req, res, ctx) => {
                expect(req.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
                const authHeader = req.headers.get('Authorization');
                expect(authHeader as string).toMatch(
                    /^OAuth oauth_consumer_key="consumer_key", oauth_nonce=".+", oauth_token="oauth_token_received_from_step_2", oauth_signature="consumer_secret&token_secret", oauth_signature_method="PLAINTEXT", oauth_timestamp="\d+", oauth_verifier="users_verifier"$/
                );
                expect(req.headers.get('User-Agent')?.startsWith('@lionralfs/discogs-client/'));
                return res(ctx.status(200), ctx.text('oauth_token=abc123&oauth_token_secret=xyz789'));
            })
        );

        const oauth = new DiscogsOAuth('consumer_key', 'consumer_secret');
        const response = await oauth.getAccessToken(
            'oauth_token_received_from_step_2',
            'token_secret',
            'users_verifier'
        );
        expect(response).toStrictEqual({
            accessToken: 'abc123',
            accessTokenSecret: 'xyz789',
        });
    });

    test('Get an access token (error)', async () => {
        server.use(
            rest.post('https://api.discogs.com/oauth/access_token', (req, res, ctx) => {
                return res(ctx.status(401), ctx.text('Invalid consumer.'));
            })
        );

        const oauth = new DiscogsOAuth('consumer_key', 'consumer_secret');
        await expect(
            oauth.getAccessToken('oauth_token_received_from_step_2', 'token_secret', 'users_verifier')
        ).rejects.toThrowError(new DiscogsError(401, 'Invalid consumer.'));
    });
});
