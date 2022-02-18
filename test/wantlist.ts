// @ts-check
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

    let client = new DiscogsClient();
    await client.user().wantlist().getReleases('rodneyfool', { page: 2, per_page: 4 });
});

test.serial('Wantlist: Add release to wantlist', async t => {
    t.plan(1);

    server.use(
        rest.put('https://api.discogs.com/users/rodneyfool/wants/130076', (req, res, ctx) => {
            t.deepEqual(req.body, {
                notes: 'My favorite release',
                rating: 5,
            });
            return res(ctx.status(201), ctx.json({}));
        })
    );

    let client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.user().wantlist().addRelease('rodneyfool', 130076, { notes: 'My favorite release', rating: 5 });
});

test.serial('Wantlist: Edit wantlist notes for release', async t => {
    t.plan(1);

    server.use(
        rest.post('https://api.discogs.com/users/rodneyfool/wants/130076', (req, res, ctx) => {
            t.deepEqual(req.body, {
                notes: 'My favorite release',
                rating: 4,
            });
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.user().wantlist().editNotes('rodneyfool', 130076, { notes: 'My favorite release', rating: 4 });
});

test.serial('Wantlist: Remove release from wantlist', async t => {
    t.plan(1);

    server.use(
        rest.delete('https://api.discogs.com/users/rodneyfool/wants/130076', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(204), ctx.json({}));
        })
    );

    let client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.user().wantlist().removeRelease('rodneyfool', 130076);
});
