import test from 'ava';
import { rest } from 'msw';
import { DiscogsClient } from '../lib/client.js';
import { setupMockAPI } from './_setup.js';

const server = setupMockAPI();

test.serial('Collection: Test get all folders', async t => {
    t.plan(2);

    server.use(
        rest.get('https://api.discogs.com/users/rodneyfool/collection/folders', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({ folders: [] }));
        })
    );
    let client = new DiscogsClient('agent', { token: 'test-token' });
    let data = await client.user().collection().getFolders('rodneyfool');
    t.deepEqual(data.folders, []);
});

test.serial('Collection: Test folder creation', async t => {
    t.plan(3);

    server.use(
        rest.post('https://api.discogs.com/users/rodneyfool/collection/folders', (req, res, ctx) => {
            let { name } = req.body;
            t.pass();
            return res(ctx.status(200), ctx.json({ id: 123, name: name }));
        })
    );
    let client = new DiscogsClient('agent', { userToken: 'test-token' });
    let data = await client.user().collection().addFolder('rodneyfool', 'My favorites');
    t.is(data.id, 123);
    t.is(data.name, 'My favorites');
});

test.serial('Collection: Get folder metadata', async t => {
    t.plan(2);

    server.use(
        rest.get('https://api.discogs.com/users/rodneyfool/collection/folders/3', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({ id: 3 }));
        })
    );

    let client = new DiscogsClient('agent', { userToken: 'test-token' });
    let data = await client.user().collection().getFolder('rodneyfool', 3);
    t.is(data.id, 3);
});

test.serial('Collection: Edit folder name', async t => {
    t.plan(3);

    server.use(
        rest.post('https://api.discogs.com/users/rodneyfool/collection/folders/3', (req, res, ctx) => {
            let { name } = req.body;
            t.pass();
            return res(ctx.status(200), ctx.json({ id: 3, name: name }));
        })
    );

    let client = new DiscogsClient('agent', { userToken: 'test-token' });
    let data = await client.user().collection().setFolderName('rodneyfool', 3, 'New Name');
    t.is(data.id, 3);
    t.is(data.name, 'New Name');
});

test.serial('Collection: Delete folder', async t => {
    t.plan(2);

    server.use(
        rest.delete('https://api.discogs.com/users/rodneyfool/collection/folders/3', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(204));
        })
    );

    let client = new DiscogsClient('agent', { userToken: 'test-token' });
    let data = await client.user().collection().deleteFolder('rodneyfool', 3);
    t.is(data, '')
});
