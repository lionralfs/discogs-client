import { http, HttpResponse } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { setupMockAPI } from './setup.js';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('Lists', () => {
    test("Get user's list", async () => {
        server.use(
            http.get('https://api.discogs.com/users/rodneyfool/lists', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([
                    ['page', '3'],
                    ['per_page', '25'],
                ]);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.user().getLists('rodneyfool', { page: 3, per_page: 25 });
    });

    test("Get items from user's list", async () => {
        server.use(
            http.get('https://api.discogs.com/lists/123', ({ request }) => {
                expect(request.method).toBeDefined()
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.user().list().getItems(123);
    });
});
