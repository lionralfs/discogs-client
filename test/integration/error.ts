import test from 'ava';
import { rest } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { DiscogsError } from '@lib/error.js';
import { setupMockAPI } from './_setup.js';

const server = setupMockAPI();

test.serial('Error: Passed an instance of DiscogsError when bad status code', async t => {
    t.plan(4);

    server.use(
        rest.get('https://api.discogs.com/labels/1123123123123/releases', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(404), ctx.json({ message: 'error message' }));
        })
    );

    const client = new DiscogsClient();
    try {
        await client.database().getLabelReleases(1123123123123, { page: 3, per_page: 25 });
    } catch (err: any) {
        t.is(err.statusCode, 404);
        t.is(err.message, 'error message');
        t.true(err instanceof DiscogsError);
    }
});
