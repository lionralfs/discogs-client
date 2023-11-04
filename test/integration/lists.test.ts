import { rest } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { setupMockAPI } from './setup.js';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('Lists', () => {
    test("Get user's list", async () => {
        server.use(
            rest.get('https://api.discogs.com/users/rodneyfool/lists', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([
                    ['page', '3'],
                    ['per_page', '25'],
                ]);
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.user().getLists('rodneyfool', { page: 3, per_page: 25 });
    });

    test("Get items from user's list", async () => {
        server.use(
            rest.get('https://api.discogs.com/lists/123', (req, res, ctx) => {
                expect(req.method).toBeDefined()
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.user().list().getItems(123);
    });
});
