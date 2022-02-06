// @ts-check
import test from 'ava';
import { rest } from 'msw';
import { DiscogsClient } from '../lib/client.js';
import { setupMockAPI } from './_setup.js';

const server = setupMockAPI();

test.serial('Marketplace: Get a listing', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/marketplace/listings/172723812', (req, res, ctx) => {
            t.deepEqual([...req.url.searchParams.entries()], []);
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
    await client.marketplace().getListing(172723812);
});

test.serial('Marketplace: Get a listing (with currency arg)', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/marketplace/listings/172723812', (req, res, ctx) => {
            t.deepEqual([...req.url.searchParams.entries()], [['curr_abbr', 'USD']]);
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
    await client.marketplace().getListing(172723812, 'USD');
});
