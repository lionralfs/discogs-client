import test from 'ava';
import { rest } from 'msw';
import { DiscogsClient } from '../lib/client.js';
import { setupMockAPI } from './_setup.js';

const server = setupMockAPI();

test.serial("Lists: Get user's list", async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/users/rodneyfool/lists', (req, res, ctx) => {
            t.deepEqual(
                [...req.url.searchParams.entries()],
                [
                    ['page', '3'],
                    ['per_page', '25'],
                ]
            );
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient('agent', { userToken: 'test-token' });
    await client.user().getLists('rodneyfool', { page: 3, per_page: 25 });
});
