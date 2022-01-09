import test from 'ava';
import { rest } from 'msw';
import { DiscogsClient } from '../lib/client.js';
import { setupMockAPI } from './_setup.js';

const server = setupMockAPI();

test.serial('User: Get Identity', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/oauth/identity', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient('agent', { userToken: 'test-token' });
    await client.user().getIdentity();
});

test.serial('User: Get Profile', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/users/rodneyfool', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient('agent', { userToken: 'test-token' });
    await client.user().getProfile('rodneyfool');
});

test.serial('User: Edit Profile', async t => {
    t.plan(1);

    server.use(
        rest.post('https://api.discogs.com/users/rodneyfool', (req, res, ctx) => {
            t.deepEqual(req.body, {
                name: 'Nicolas Cage',
                home_page: 'www.discogs.com',
                location: 'Portland',
                profile: 'I am a Discogs user!',
                curr_abbr: 'USD',
            });
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient('agent', { userToken: 'test-token' });
    await client.user().editProfile('rodneyfool', {
        name: 'Nicolas Cage',
        home_page: 'www.discogs.com',
        location: 'Portland',
        profile: 'I am a Discogs user!',
        curr_abbr: 'USD',
    });
});

test.serial('User: Get User Submissions', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/users/rodneyfool/submissions', (req, res, ctx) => {
            t.deepEqual(
                [...req.url.searchParams.entries()],
                [
                    ['page', '4'],
                    ['per_page', '48'],
                ]
            );
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient('agent', { userToken: 'test-token' });
    await client.user().getSubmissions('rodneyfool', { page: 4, per_page: 48 });
});

test.serial('User: Get User Contributions', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/users/rodneyfool/contributions', (req, res, ctx) => {
            t.deepEqual(
                [...req.url.searchParams.entries()],
                [
                    ['page', '2'],
                    ['per_page', '50'],
                    ['sort', 'artist'],
                    ['sort_order', 'desc'],
                ]
            );
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient('agent', { userToken: 'test-token' });
    await client.user().getContributions('rodneyfool', { page: 2, per_page: 50, sort: 'artist', sort_order: 'desc' });
});
