import test from 'ava';
import { rest } from 'msw';
import { setupServer } from 'msw/node/lib/index.js';
import { DiscogsClient } from '../lib/client.js';

const server = setupServer();

// Enable API mocking before tests.
test.before(() => server.listen());

// Reset any runtime request handlers we may add during the tests.
test.afterEach.always(() => server.resetHandlers());

// Disable API mocking after the tests are done.
test.after(() => server.close());

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
    t.is(data?.result, 'success', 'Correct response data');
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
    t.is(data?.result, 'success', 'Correct response data');
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
    t.is(data?.result, 'success', 'Correct response data');
});
