import { http, HttpResponse } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { setupMockAPI } from './setup.js';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('Wantlist', () => {
    test("Get releases in user's wantlist", async () => {
        server.use(
            http.get('https://api.discogs.com/users/rodneyfool/wants', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([
                    ['page', '2'],
                    ['per_page', '4'],
                ]);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient();
        await client.user().wantlist().getReleases('rodneyfool', { page: 2, per_page: 4 });
    });

    test('Add release to wantlist', async () => {
        server.use(
            http.put('https://api.discogs.com/users/rodneyfool/wants/130076', async ({ request }) => {
                const body = await request.json();

                expect(body).toStrictEqual({
                    notes: 'My favorite release',
                    rating: 5,
                });
                return HttpResponse.json({}, { status: 201 });
            })
        );

        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().wantlist().addRelease('rodneyfool', 130076, { notes: 'My favorite release', rating: 5 });
    });

    test('Edit wantlist notes for release', async () => {
        server.use(
            http.post('https://api.discogs.com/users/rodneyfool/wants/130076', async ({ request }) => {
                const body = await request.json();

                expect(body).toStrictEqual({
                    notes: 'My favorite release',
                    rating: 4,
                });
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().wantlist().editNotes('rodneyfool', 130076, { notes: 'My favorite release', rating: 4 });
    });

    test('Remove release from wantlist', async () => {
        server.use(
            http.delete('https://api.discogs.com/users/rodneyfool/wants/130076', ({ request }) => {
                expect(request.method).toBeDefined();
                return new Response(null, { status: 204 });
            })
        );

        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().wantlist().removeRelease('rodneyfool', 130076);
    });
});
