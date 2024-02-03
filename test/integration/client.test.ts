import { http, HttpResponse } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { setupMockAPI } from './setup.js';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('DiscogsClient', () => {
    test('get()', async () => {
        server.use(
            http.get('https://api.discogs.com/labels/1', () => {
                return HttpResponse.json({}, { status: 200 });
            })
        );
        const client = new DiscogsClient();
        const result = await client.get({ url: '/labels/1' });
        expect(result.data).toStrictEqual({});
    });

    test('Custom configuration', async () => {
        server.use(
            http.get('https://www.example.com/labels/1', () => {
                return HttpResponse.json({}, { status: 200 });
            })
        );
        const client = new DiscogsClient().setConfig({ host: 'www.example.com' });
        const result = await client.get({ url: '/labels/1' });
        expect(result.data).toStrictEqual({});
    });

    test('Media Types (none, default)', async () => {
        server.use(
            http.get('https://api.discogs.com', ({ request }) => {
                expect(request.headers.get('Accept')).toBe('application/vnd.discogs.v2.discogs+json');
                return HttpResponse.json({}, { status: 200 });
            })
        );
        const client = new DiscogsClient();
        await client.about();
    });

    test('Media Types (html)', async () => {
        server.use(
            http.get('https://api.discogs.com', ({ request }) => {
                expect(request.headers.get('Accept')).toBe('application/vnd.discogs.v2.html+json');
                return HttpResponse.json({}, { status: 200 });
            })
        );
        const client = new DiscogsClient().setConfig({ outputFormat: 'html' });
        await client.about();
    });

    test('Media Types (plaintext)', async () => {
        server.use(
            http.get('https://api.discogs.com', ({ request }) => {
                expect(request.headers.get('Accept')).toBe('application/vnd.discogs.v2.plaintext+json');
                return HttpResponse.json({}, { status: 200 });
            })
        );
        const client = new DiscogsClient().setConfig({ outputFormat: 'plaintext' });
        await client.about();
    });

    test('User Agent (default)', async () => {
        server.use(
            http.get('https://api.discogs.com', ({ request }) => {
                expect(request.headers.get('User-Agent')).toMatch(
                    /^@lionralfs\/discogs-client\/dev \+https:\/\/github\.com\/(.+)$/
                );
                return HttpResponse.json({}, { status: 200 });
            })
        );
        const client = new DiscogsClient();
        await client.about();
    });

    test('User Agent (custom)', async () => {
        server.use(
            http.get('https://api.discogs.com', ({ request }) => {
                expect(request.headers.get('User-Agent')).toBe('MyDiscogsClient/1.0 +https://example.org');
                return HttpResponse.json({}, { status: 200 });
            })
        );
        const client = new DiscogsClient({ userAgent: 'MyDiscogsClient/1.0 +https://example.org' });
        await client.about();
    });

    test('Auth (userToken)', async () => {
        server.use(
            http.get('https://api.discogs.com/oauth/identity', ({ request }) => {
                expect(request.headers.get('Authorization')).toBe('Discogs token=testtoken12345');
                return HttpResponse.json({}, { status: 200 });
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.getIdentity();
    });

    test('Sends OAuth header', async () => {
        server.use(
            http.get('https://api.discogs.com/oauth/identity', ({ request }) => {
                expect(request.headers.get('Authorization')?.startsWith('OAuth '));
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({
            auth: {
                method: 'oauth',
                consumerKey: 'consumerKey',
                consumerSecret: 'consumerSecret',
                accessToken: 'accessToken',
                accessTokenSecret: 'accessTokenSecret',
            },
        });

        await client.getIdentity();
    });

    test('Retrieves and passes rate limit info to caller', async () => {
        server.use(
            http.get('https://api.discogs.com/oauth/identity', ({ request }) => {
                expect(request.headers.get('Authorization')?.startsWith('OAuth '));
                return HttpResponse.json(
                    {},
                    {
                        status: 200,
                        headers: {
                            'X-Discogs-Ratelimit': '60',
                            'X-Discogs-Ratelimit-Used': '23',
                            'X-Discogs-Ratelimit-Remaining': '37',
                        },
                    }
                );
            })
        );

        const client = new DiscogsClient({
            auth: {
                method: 'oauth',
                consumerKey: 'consumerKey',
                consumerSecret: 'consumerSecret',
                accessToken: 'accessToken',
                accessTokenSecret: 'accessTokenSecret',
            },
        });

        const resp = await client.getIdentity();
        expect(resp.rateLimit).toStrictEqual({ limit: 60, used: 23, remaining: 37 });
    });

    test('Retries when rate limited', async () => {
        let n = 0;
        server.use(
            http.get('https://api.discogs.com/oauth/identity', () => {
                if (n++ == 0) {
                    return HttpResponse.json(
                        { message: "you're rate limited" },
                        {
                            status: 429,
                            headers: {
                                'X-Discogs-Ratelimit': '60',
                                'X-Discogs-Ratelimit-Used': '60',
                                'X-Discogs-Ratelimit-Remaining': '0',
                            },
                        }
                    );
                } else {
                    return HttpResponse.json(
                        { message: "you're good" },
                        {
                            status: 200,
                            headers: {
                                'X-Discogs-Ratelimit': '60',
                                'X-Discogs-Ratelimit-Used': '59',
                                'X-Discogs-Ratelimit-Remaining': '1',
                            },
                        }
                    );
                }
            })
        );

        const client = new DiscogsClient({ auth: { userToken: 'fake-token' } });
        client.setConfig({
            exponentialBackoffMaxRetries: 1,
            exponentialBackoffIntervalMs: 100,
            exponentialBackoffRate: 2,
        });

        type FakeResponse = {
            data: {
                message: string;
            };
        };

        const resp = (await client.getIdentity()) as unknown as FakeResponse;
        expect(resp.data).toStrictEqual({ message: "you're good" });
    });

    test('Throws when retrying but end of retries is reached', async () => {
        let n = 0;
        server.use(
            http.get('https://api.discogs.com/oauth/identity', () => {
                if (n++ == 0) {
                    return HttpResponse.json({ message: "you're rate limited 1" }, { status: 429 });
                } else {
                    return HttpResponse.json({ message: "you're rate limited 2" }, { status: 429 });
                }
            })
        );

        const client = new DiscogsClient({ auth: { userToken: 'fake-token' } });
        client.setConfig({
            exponentialBackoffMaxRetries: 1,
            exponentialBackoffIntervalMs: 100,
            exponentialBackoffRate: 2,
        });

        await expect(client.getIdentity()).rejects.toThrow("you're rate limited 2");
    });

    test('Should return client and server info in about call', async () => {
        server.use(
            http.get('https://api.discogs.com', () => {
                return HttpResponse.json(
                    {
                        hello: 'Welcome to the Discogs API.',
                        api_version: 'v2',
                        documentation_url: 'http://www.discogs.com/developers/',
                        statistics: { releases: 16327979, artists: 8602060, labels: 1991222 },
                    },
                    {
                        status: 200,
                        headers: {
                            'X-Discogs-Ratelimit': '60',
                            'X-Discogs-Ratelimit-Used': '59',
                            'X-Discogs-Ratelimit-Remaining': '1',
                        },
                    }
                );
            })
        );
        const client = new DiscogsClient();
        const result = await client.about();
        expect(result).toStrictEqual({
            data: {
                hello: 'Welcome to the Discogs API.',
                api_version: 'v2',
                documentation_url: 'http://www.discogs.com/developers/',
                statistics: { releases: 16327979, artists: 8602060, labels: 1991222 },
                clientInfo: {
                    version: 'dev',
                    userAgent: '@lionralfs/discogs-client/dev +https://github.com/lionralfs/discogs-client',
                    authMethod: 'none',
                    authLevel: 0,
                },
            },
            rateLimit: {
                limit: 60,
                used: 59,
                remaining: 1,
            },
        });
    });
});
