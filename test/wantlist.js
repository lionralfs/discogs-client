import test from 'ava';
import { rest } from 'msw';
import { DiscogsClient } from '../lib/client.js';
import { setupMockAPI } from './_setup.js';

const server = setupMockAPI();

test.serial("Wantlist: Get releases in user's wantlist", async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/users/rodneyfool/wants', (req, res, ctx) => {
            t.deepEqual(
                [...req.url.searchParams.entries()],
                [
                    ['page', '2'],
                    ['per_page', '4'],
                ]
            );
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient('agent', { userToken: 'test-token' });
    await client.user().wantlist().getReleases('rodneyfool', { page: 2, per_page: 4 });
});
