import { http, HttpResponse } from 'msw';
import { DiscogsError } from '@lib/error.js';
import { DiscogsOAuth } from '@lib/oauth.js';
import { setupMockAPI } from './setup.js';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('OAuth', () => {
    test('Get a request token', async () => {
        server.use(
            http.get('https://api.discogs.com/oauth/request_token', ({ request }) => {
                expect(request.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
                const authHeader = request.headers.get('Authorization');
                expect(authHeader as string).toMatch(
                    /^OAuth oauth_consumer_key="consumer_key", oauth_nonce=".+", oauth_signature="consumer_secret&", oauth_signature_method="PLAINTEXT", oauth_timestamp="\d+", oauth_callback="https%3A%2F%2Fexample.com%2Foauth_callback_endpoint"$/
                );
                expect(request.headers.get('User-Agent')?.startsWith('@lionralfs/discogs-client/'));
                return HttpResponse.text('oauth_token=some-token&oauth_token_secret=some-token-secret&oauth_callback_confirmed=true', { status: 200 });
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
            http.get('https://api.discogs.com/oauth/request_token', () => {
                return HttpResponse.text('Invalid consumer.', { status: 401 });
            })
        );

        const oauth = new DiscogsOAuth('invalid_key', 'invalid_secret');

        await expect(oauth.getRequestToken('https://example.com/oauth_callback_endpoint')).rejects.toThrowError(
            new DiscogsError(401, 'Invalid consumer.')
        );
    });

    test('Get an access token', async () => {
        server.use(
            http.post('https://api.discogs.com/oauth/access_token', ({ request }) => {
                expect(request.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
                const authHeader = request.headers.get('Authorization');
                expect(authHeader as string).toMatch(
                    /^OAuth oauth_consumer_key="consumer_key", oauth_nonce=".+", oauth_token="oauth_token_received_from_step_2", oauth_signature="consumer_secret&token_secret", oauth_signature_method="PLAINTEXT", oauth_timestamp="\d+", oauth_verifier="users_verifier"$/
                );
                expect(request.headers.get('User-Agent')?.startsWith('@lionralfs/discogs-client/'));
                return HttpResponse.text('oauth_token=abc123&oauth_token_secret=xyz789', { status: 200 });
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
            http.post('https://api.discogs.com/oauth/access_token', () => {
                return HttpResponse.text('Invalid consumer.', { status: 401 });
            })
        );

        const oauth = new DiscogsOAuth('consumer_key', 'consumer_secret');
        await expect(
            oauth.getAccessToken('oauth_token_received_from_step_2', 'token_secret', 'users_verifier')
        ).rejects.toThrowError(new DiscogsError(401, 'Invalid consumer.'));
    });
});
