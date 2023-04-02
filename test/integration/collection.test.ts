import test from 'ava';
import { rest } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { setupMockAPI } from './_setup.test.js';

const server = setupMockAPI();

test.serial('Collection: Test get all folders', async t => {
    t.plan(1);
    server.use(
        rest.get('https://api.discogs.com/users/rodneyfool/collection/folders', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({}));
        })
    );
    const client = new DiscogsClient();
    await client.user().collection().getFolders('rodneyfool');
});

test.serial('Collection: Test folder creation', async t => {
    t.plan(1);
    server.use(
        rest.post('https://api.discogs.com/users/rodneyfool/collection/folders', (req, res, ctx) => {
            t.deepEqual(req.body, { name: 'My favorites' });
            return res(ctx.status(200), ctx.json({}));
        })
    );
    const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.user().collection().addFolder('rodneyfool', 'My favorites');
});

test.serial('Collection: Get folder metadata', async t => {
    t.plan(1);
    server.use(
        rest.get('https://api.discogs.com/users/rodneyfool/collection/folders/3', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({}));
        })
    );
    const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.user().collection().getFolder('rodneyfool', 3);
});

test.serial('Collection: Get folder metadata (no auth required for public folder)', async t => {
    t.plan(1);
    server.use(
        rest.get('https://api.discogs.com/users/rodneyfool/collection/folders/0', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({}));
        })
    );
    const client = new DiscogsClient();
    await client.user().collection().getFolder('rodneyfool', 0);
});

test.serial('Collection: Edit folder name', async t => {
    t.plan(1);
    server.use(
        rest.post('https://api.discogs.com/users/rodneyfool/collection/folders/3', (req, res, ctx) => {
            t.deepEqual(req.body, { name: 'New Name' });
            return res(ctx.status(200), ctx.json({}));
        })
    );
    const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.user().collection().setFolderName('rodneyfool', 3, 'New Name');
});

test.serial('Collection: Delete folder', async t => {
    t.plan(1);
    server.use(
        rest.delete('https://api.discogs.com/users/rodneyfool/collection/folders/3', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(204));
        })
    );
    const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.user().collection().deleteFolder('rodneyfool', 3);
});

test.serial('Collection: Get instances of release in collection', async t => {
    t.plan(1);
    server.use(
        rest.get('https://api.discogs.com/users/susan.salkeld/collection/releases/7781525', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200));
        })
    );
    const client = new DiscogsClient();
    await client.user().collection().getReleaseInstances('susan.salkeld', 7781525);
});

test.serial('Collection: Collection items by folder', async t => {
    t.plan(1);
    server.use(
        rest.get('https://api.discogs.com/users/rodneyfool/collection/folders/3/releases', (req, res, ctx) => {
            t.deepEqual(
                [...req.url.searchParams.entries()],
                [
                    ['sort', 'artist'],
                    ['sort_order', 'desc'],
                ]
            );
            return res(ctx.status(200));
        })
    );
    const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.user().collection().getReleases('rodneyfool', 3, { sort: 'artist', sort_order: 'desc' });
});

test.serial('Collection: Collection items by folder (default doesnt need auth)', async t => {
    t.plan(1);
    server.use(
        rest.get('https://api.discogs.com/users/rodneyfool/collection/folders/0/releases', (req, res, ctx) => {
            t.deepEqual(
                [...req.url.searchParams.entries()],
                [
                    ['sort', 'artist'],
                    ['sort_order', 'desc'],
                ]
            );
            return res(ctx.status(200));
        })
    );
    const client = new DiscogsClient();
    await client.user().collection().getReleases('rodneyfool', '0', { sort: 'artist', sort_order: 'desc' });
});

test.serial('Collection: Add release to folder', async t => {
    t.plan(1);
    server.use(
        rest.post('https://api.discogs.com/users/rodneyfool/collection/folders/3/releases/130076', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(201));
        })
    );
    const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.user().collection().addRelease('rodneyfool', 130076, 3);
});

test.serial('Collection: Edit release', async t => {
    t.plan(1);
    server.use(
        rest.post(
            'https://api.discogs.com/users/rodneyfool/collection/folders/4/releases/130076/instances/1',
            (req, res, ctx) => {
                t.pass();
                return res(ctx.status(204));
            }
        )
    );
    const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.user().collection().editRelease('rodneyfool', 4, 130076, 1, { rating: 5, folder_id: 16 });
});

test.serial('Collection: Delete release from folder', async t => {
    t.plan(1);
    server.use(
        rest.delete(
            'https://api.discogs.com/users/rodneyfool/collection/folders/3/releases/130076/instances/1',
            (req, res, ctx) => {
                t.pass();
                return res(ctx.status(204));
            }
        )
    );
    const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.user().collection().removeRelease('rodneyfool', 3, 130076, 1);
});

test.serial('Collection: Get collection note fields', async t => {
    t.plan(1);
    server.use(
        rest.get('https://api.discogs.com/users/rodneyfool/collection/fields', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200));
        })
    );
    const client = new DiscogsClient();
    await client.user().collection().getFields('rodneyfool');
});

test.serial('Collection: Update note on instance', async t => {
    t.plan(2);
    server.use(
        rest.post(
            'https://api.discogs.com/users/rodneyfool/collection/folders/3/releases/130076/instances/1/fields/8',
            (req, res, ctx) => {
                t.is(req.url.searchParams.get('value'), 'foo');
                t.deepEqual(req.body, '');
                return res(ctx.status(204));
            }
        )
    );
    const client = new DiscogsClient();
    await client.user().collection().editInstanceNote('rodneyfool', 3, 130076, 1, 8, 'foo');
});

test.serial('Collection: Get collection value', async t => {
    t.plan(1);
    server.use(
        rest.get('https://api.discogs.com/users/rodneyfool/collection/value', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(204));
        })
    );
    const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.user().collection().getValue('rodneyfool');
});
