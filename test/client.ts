// @ts-check
import test from 'ava';
import { rest } from 'msw';
import { DiscogsClient } from '../lib/client.js';
import { setupMockAPI } from './_setup.js';

const server = setupMockAPI();

test('DiscogsClient: Test instance', t => {
    t.true(new DiscogsClient() instanceof DiscogsClient);
});

test('DiscogsClient: Test authenticated()', t => {
    t.false(new DiscogsClient().authenticated(1), 'Authentication level 1 === false');
});

test.serial('DiscogsClient: Test get()', async t => {
    t.plan(1);
    server.use(
        rest.get('https://api.discogs.com/labels/1', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({}));
        })
    );
    let client = new DiscogsClient();
    await client.get({ url: '/labels/1' });
});

test.serial('DiscogsClient: Test custom configuration', async t => {
    t.plan(1);
    server.use(
        rest.get('https://www.example.com/labels/1', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({}));
        })
    );
    let client = new DiscogsClient().setConfig({ host: 'www.example.com' });
    await client.get({ url: '/labels/1' });
});

test.serial('DiscogsClient: Media Types (none, default)', async t => {
    t.plan(1);
    server.use(
        rest.get('https://api.discogs.com', (req, res, ctx) => {
            t.is(req.headers.get('Accept'), 'application/vnd.discogs.v2.discogs+json');
            return res(ctx.status(200), ctx.json({}));
        })
    );
    let client = new DiscogsClient();
    await client.about();
});

test.serial('DiscogsClient: Media Types (html)', async t => {
    t.plan(1);
    server.use(
        rest.get('https://api.discogs.com', (req, res, ctx) => {
            t.is(req.headers.get('Accept'), 'application/vnd.discogs.v2.html+json');
            return res(ctx.status(200), ctx.json({}));
        })
    );
    let client = new DiscogsClient().setConfig({ outputFormat: 'html' });
    await client.about();
});

test.serial('DiscogsClient: Media Types (plaintext)', async t => {
    t.plan(1);
    server.use(
        rest.get('https://api.discogs.com', (req, res, ctx) => {
            t.is(req.headers.get('Accept'), 'application/vnd.discogs.v2.plaintext+json');
            return res(ctx.status(200), ctx.json({}));
        })
    );
    let client = new DiscogsClient().setConfig({ outputFormat: 'plaintext' });
    await client.about();
});

// test.serial('DiscogsClient: User Agent (default)', async t => {
//     t.plan(1);
//     server.use(
//         rest.get('https://api.discogs.com', (req, res, ctx) => {
//             t.regex(req.headers.get('User-Agent'), /^DisConnectClient\/(.+) \+https:\/\/github\.com\/(.+)$/);
//             return res(ctx.status(200), ctx.json({}));
//         })
//     );
//     let client = new DiscogsClient();
//     await client.about();
// });

test.serial('DiscogsClient: User Agent (custom)', async t => {
    t.plan(1);
    server.use(
        rest.get('https://api.discogs.com', (req, res, ctx) => {
            t.is(req.headers.get('User-Agent'), 'MyDiscogsClient/1.0 +https://example.org');
            return res(ctx.status(200), ctx.json({}));
        })
    );
    let client = new DiscogsClient({ userAgent: 'MyDiscogsClient/1.0 +https://example.org' });
    await client.about();
});

test.serial('DiscogsClient: Auth (userToken)', async t => {
    t.plan(1);
    server.use(
        rest.get('https://api.discogs.com/oauth/identity', (req, res, ctx) => {
            t.is(req.headers.get('Authorization'), 'Discogs token=testtoken12345');
            return res(ctx.status(200), ctx.json({}));
        })
    );
    let client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.getIdentity();
});
