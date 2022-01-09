import test from 'ava';
import { rest } from 'msw';
import { DiscogsClient } from '../lib/client.js';
import { setupMockAPI } from './_setup.js';

const server = setupMockAPI();

test.serial('Database: Test search without query but with params', async t => {
    server.use(
        rest.get('https://api.discogs.com/database/search', (req, res, ctx) => {
            let success =
                [...req.url.searchParams.entries()].length === 2 &&
                req.url.searchParams.get('artist') === 'X' &&
                req.url.searchParams.get('title') === 'Y';
            return res(ctx.status(200), ctx.json({ result: success ? 'success' : 'error' }));
        })
    );
    let client = new DiscogsClient('agent', { consumerKey: 'u', consumerSecret: 'p' });
    let db = client.database();
    let data = await db.search({ artist: 'X', title: 'Y' });
    t.is(data.result, 'success', 'Correct response data');
});

test.serial('Database: Test search with query and params', async t => {
    server.use(
        rest.get('https://api.discogs.com/database/search', (req, res, ctx) => {
            let success =
                [...req.url.searchParams.entries()].length === 3 &&
                req.url.searchParams.get('artist') === 'X' &&
                req.url.searchParams.get('title') === 'Y' &&
                req.url.searchParams.get('q') === 'somequery';
            return res(ctx.status(200), ctx.json({ result: success ? 'success' : 'error' }));
        })
    );
    let client = new DiscogsClient('agent', { consumerKey: 'u', consumerSecret: 'p' });
    let db = client.database();
    let data = await db.search('somequery', { artist: 'X', title: 'Y' });
    t.is(data.result, 'success', 'Correct response data');
});

test.serial('Database: Test search with query only', async t => {
    server.use(
        rest.get('https://api.discogs.com/database/search', (req, res, ctx) => {
            let success =
                [...req.url.searchParams.entries()].length === 1 && req.url.searchParams.get('q') === 'somequery';
            return res(ctx.status(200), ctx.json({ result: success ? 'success' : 'error' }));
        })
    );
    let client = new DiscogsClient('agent', { consumerKey: 'u', consumerSecret: 'p' });
    let db = client.database();
    let data = await db.search('somequery');
    t.is(data.result, 'success', 'Correct response data');
});

test.serial('Database: Get release', async t => {
    t.plan(2);
    server.use(
        rest.get('https://api.discogs.com/releases/249504', (req, res, ctx) => {
            let params = req.url.searchParams;
            t.is([...params.entries()].length, 0);
            return res(ctx.status(200), ctx.json({ id: 249504 }));
        })
    );

    let client = new DiscogsClient('agent', { userToken: 'test-token' });
    let data = await client.database().getRelease(249504);
    t.is(data.id, 249504);
});

test.serial('Database: Get release with currency', async t => {
    t.plan(3);
    server.use(
        rest.get('https://api.discogs.com/releases/249504', (req, res, ctx) => {
            let params = req.url.searchParams;
            t.is([...params.entries()].length, 1);
            t.is(params.get('curr_abbr'), 'USD');
            return res(ctx.status(200), ctx.json({ id: 249504 }));
        })
    );

    let client = new DiscogsClient('agent', { userToken: 'test-token' });
    let data = await client.database().getRelease(249504, 'USD');
    t.is(data.id, 249504);
});

test.serial('Database: Get a users release rating', async t => {
    t.plan(2);
    server.use(
        rest.get('https://api.discogs.com/releases/249504/rating/someuser', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({ release_id: 249504, username: 'someuser', rating: 3 }));
        })
    );

    let client = new DiscogsClient('agent', { userToken: 'test-token' });
    let data = await client.database().getReleaseRating(249504, 'someuser');
    t.is(data.release_id, 249504);
});
