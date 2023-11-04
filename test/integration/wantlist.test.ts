import { rest } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { setupMockAPI } from './setup.js';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('Wantlist', () => {
    test("Get releases in user's wantlist", async () => {
        server.use(
            rest.get('https://api.discogs.com/users/rodneyfool/wants', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([
                    ['page', '2'],
                    ['per_page', '4'],
                ]);
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient();
        await client.user().wantlist().getReleases('rodneyfool', { page: 2, per_page: 4 });
    });

    test('Add release to wantlist', async () => {
        server.use(
            rest.put('https://api.discogs.com/users/rodneyfool/wants/130076', (req, res, ctx) => {
                expect(req.body).toStrictEqual({
                    notes: 'My favorite release',
                    rating: 5,
                });
                return res(ctx.status(201), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().wantlist().addRelease('rodneyfool', 130076, { notes: 'My favorite release', rating: 5 });
    });

    test('Edit wantlist notes for release', async () => {
        server.use(
            rest.post('https://api.discogs.com/users/rodneyfool/wants/130076', (req, res, ctx) => {
                expect(req.body).toStrictEqual({
                    notes: 'My favorite release',
                    rating: 4,
                });
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().wantlist().editNotes('rodneyfool', 130076, { notes: 'My favorite release', rating: 4 });
    });

    test('Remove release from wantlist', async () => {
        server.use(
            rest.delete('https://api.discogs.com/users/rodneyfool/wants/130076', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(204), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().wantlist().removeRelease('rodneyfool', 130076);
    });
});
