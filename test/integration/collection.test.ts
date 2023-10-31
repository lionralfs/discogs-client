import { rest } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { setupMockAPI } from './setup.js';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('Collection', () => {
    test('Get all folders', async () => {
        server.use(
            rest.get('https://api.discogs.com/users/rodneyfool/collection/folders', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200), ctx.json({}));
            })
        );
        const client = new DiscogsClient();
        await client.user().collection().getFolders('rodneyfool');
    });

    test('Test folder creation', async () => {
        server.use(
            rest.post('https://api.discogs.com/users/rodneyfool/collection/folders', (req, res, ctx) => {
                expect(req.body).toStrictEqual({ name: 'My favorites' });
                return res(ctx.status(200), ctx.json({}));
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().collection().addFolder('rodneyfool', 'My favorites');
    });

    test('Get folder metadata', async () => {
        server.use(
            rest.get('https://api.discogs.com/users/rodneyfool/collection/folders/3', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200), ctx.json({ id: 1337 }));
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().collection().getFolder('rodneyfool', 3);
    });

    test('Get folder metadata (no auth required for public folder)', async () => {
        server.use(
            rest.get('https://api.discogs.com/users/rodneyfool/collection/folders/0', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200), ctx.json({ id: 1337 }));
            })
        );
        const client = new DiscogsClient();
        await client.user().collection().getFolder('rodneyfool', 0);
    });

    test('Edit folder name', async () => {
        server.use(
            rest.post('https://api.discogs.com/users/rodneyfool/collection/folders/3', (req, res, ctx) => {
                expect(req.body).toStrictEqual({ name: 'New Name' });
                return res(ctx.status(200), ctx.json({}));
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().collection().setFolderName('rodneyfool', 3, 'New Name');
    });

    test('Delete folder', async () => {
        server.use(
            rest.delete('https://api.discogs.com/users/rodneyfool/collection/folders/3', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(204));
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().collection().deleteFolder('rodneyfool', 3);
    });

    test('Get instances of release in collection', async () => {
        server.use(
            rest.get('https://api.discogs.com/users/susan.salkeld/collection/releases/7781525', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200));
            })
        );
        const client = new DiscogsClient();
        await client.user().collection().getReleaseInstances('susan.salkeld', 7781525);
    });

    test('Collection items by folder', async () => {
        server.use(
            rest.get('https://api.discogs.com/users/rodneyfool/collection/folders/3/releases', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([
                    ['sort', 'artist'],
                    ['sort_order', 'desc'],
                ]);
                return res(ctx.status(200));
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().collection().getReleases('rodneyfool', 3, { sort: 'artist', sort_order: 'desc' });
    });

    test('Collection items by folder (default doesnt need auth)', async () => {
        server.use(
            rest.get('https://api.discogs.com/users/rodneyfool/collection/folders/0/releases', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([
                    ['sort', 'artist'],
                    ['sort_order', 'desc'],
                ]);
                return res(ctx.status(200));
            })
        );
        const client = new DiscogsClient();
        await client.user().collection().getReleases('rodneyfool', '0', { sort: 'artist', sort_order: 'desc' });
    });

    test('Add release to folder', async () => {
        server.use(
            rest.post(
                'https://api.discogs.com/users/rodneyfool/collection/folders/3/releases/130076',
                (req, res, ctx) => {
                    expect(req.method).toBeDefined();
                    return res(ctx.status(201));
                }
            )
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().collection().addRelease('rodneyfool', 130076, 3);
    });

    test('Edit release', async () => {
        server.use(
            rest.post(
                'https://api.discogs.com/users/rodneyfool/collection/folders/4/releases/130076/instances/1',
                (req, res, ctx) => {
                    expect(req.method).toBeDefined();
                    return res(ctx.status(204));
                }
            )
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().collection().editRelease('rodneyfool', 4, 130076, 1, { rating: 5, folder_id: 16 });
    });

    test('Delete release from folder', async () => {
        server.use(
            rest.delete(
                'https://api.discogs.com/users/rodneyfool/collection/folders/3/releases/130076/instances/1',
                (req, res, ctx) => {
                    expect(req.method).toBeDefined();
                    return res(ctx.status(204));
                }
            )
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().collection().removeRelease('rodneyfool', 3, 130076, 1);
    });

    test('Get collection note fields', async () => {
        server.use(
            rest.get('https://api.discogs.com/users/rodneyfool/collection/fields', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200));
            })
        );
        const client = new DiscogsClient();
        await client.user().collection().getFields('rodneyfool');
    });

    test('Update note on instance', async () => {
        server.use(
            rest.post(
                'https://api.discogs.com/users/rodneyfool/collection/folders/3/releases/130076/instances/1/fields/8',
                (req, res, ctx) => {
                    expect(req.url.searchParams.get('value')).toBe('foo');
                    expect(req.body).toBe('');
                    return res(ctx.status(204));
                }
            )
        );
        const client = new DiscogsClient();
        await client.user().collection().editInstanceNote('rodneyfool', 3, 130076, 1, 8, 'foo');
    });

    test('Get collection value', async () => {
        server.use(
            rest.get('https://api.discogs.com/users/rodneyfool/collection/value', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(204));
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().collection().getValue('rodneyfool');
    });
});
