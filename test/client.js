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
