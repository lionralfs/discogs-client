import { http, HttpResponse } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { setupMockAPI } from './setup.js';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('Database', () => {
    test('Test search without query but with params', async () => {
        server.use(
            http.get('https://api.discogs.com/database/search', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()].length).toBe(2);
                expect(url.searchParams.get('artist')).toBe('X');
                expect(url.searchParams.get('title')).toBe('Y');

                return HttpResponse.json({}, { status: 200 });
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.database().search({ artist: 'X', title: 'Y' });
    });

    test('Test search with query and params', async () => {
        server.use(
            http.get('https://api.discogs.com/database/search', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()].length).toBe(3);
                expect(url.searchParams.get('q')).toBe('somequery');
                expect(url.searchParams.get('artist')).toBe('X');
                expect(url.searchParams.get('title')).toBe('Y');

                return HttpResponse.json({}, { status: 200 });
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.database().search({ query: 'somequery', artist: 'X', title: 'Y' });
    });

    test('Test search with query only', async () => {
        server.use(
            http.get('https://api.discogs.com/database/search', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()].length).toBe(1);
                expect(url.searchParams.get('q')).toBe('somequery');
                return HttpResponse.json({}, { status: 200 });
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.database().search({ query: 'somequery' });
    });

    test('Test with every option', async () => {
        server.use(
            http.get('https://api.discogs.com/database/search', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()].length).toBe(18);
                expect(url.searchParams.get('q')).toBe('nirvana');
                expect(url.searchParams.get('type')).toBe('release');
                expect(url.searchParams.get('title')).toBe('nirvana - nevermind');
                expect(url.searchParams.get('release_title')).toBe('nevermind');
                expect(url.searchParams.get('credit')).toBe('kurt');
                expect(url.searchParams.get('artist')).toBe('nirvana');
                expect(url.searchParams.get('anv')).toBe('nirvana');
                expect(url.searchParams.get('label')).toBe('dgc');
                expect(url.searchParams.get('genre')).toBe('rock');
                expect(url.searchParams.get('style')).toBe('grunge');
                expect(url.searchParams.get('country')).toBe('canada');
                expect(url.searchParams.get('year')).toBe('1991');
                expect(url.searchParams.get('format')).toBe('album');
                expect(url.searchParams.get('catno')).toBe('DGCD-24425');
                expect(url.searchParams.get('barcode')).toBe('7 2064-24425-2 4');
                expect(url.searchParams.get('track')).toBe('smells like teen spirit');
                expect(url.searchParams.get('submitter')).toBe('milKt');
                expect(url.searchParams.get('contributor')).toBe('jerome99');
                return HttpResponse.json({}, { status: 200 });
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.database().search({
            query: 'nirvana', // Your search query
            type: 'release', // One of 'release', 'master', 'artist', 'label'
            title: 'nirvana - nevermind', // Search by combined “Artist Name - Release Title” title field.
            release_title: 'nevermind', // Search release titles.
            credit: 'kurt', // Search release credits.
            artist: 'nirvana', // Search artist names.
            anv: 'nirvana', // Search artist ANV.
            label: 'dgc', // Search label names.
            genre: 'rock', // Search genres.
            style: 'grunge', // Search styles.
            country: 'canada', // Search release country.
            year: '1991', // Search release year.
            format: 'album', // Search formats.
            catno: 'DGCD-24425', // Search catalog number.
            barcode: '7 2064-24425-2 4', // Search barcodes.
            track: 'smells like teen spirit', // Search track titles.
            submitter: 'milKt', // Search submitter username.
            contributor: 'jerome99', // Search contributor usernames.
        });
    });

    test('Get release', async () => {
        server.use(
            http.get('https://api.discogs.com/releases/249504', ({ request }) => {
                const url = new URL(request.url);
                const params = url.searchParams;
                expect([...params.entries()].length).toBe(0);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient();
        await client.database().getRelease(249504);
    });

    test('Get release with currency', async () => {
        server.use(
            http.get('https://api.discogs.com/releases/249504', ({ request }) => {
                const url = new URL(request.url);
                const params = url.searchParams;
                expect([...params.entries()].length).toBe(1);
                expect(params.get('curr_abbr')).toBe('USD');
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient();
        await client.database().getRelease(249504, 'USD');
    });

    test('Get a users release rating', async () => {
        server.use(
            http.get('https://api.discogs.com/releases/249504/rating/someuser', ({ request }) => {
                expect(request.method).toBeDefined();
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient();
        await client.database().getReleaseRating(249504, 'someuser');
    });

    test('Give release rating as current user', async () => {
        server.use(
            http.put('https://api.discogs.com/releases/249504/rating/someuser', async ({ request }) => {
                const body = await request.json();

                expect(body).toStrictEqual({ rating: 2 });
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.database().setReleaseRating(249504, 'someuser', 2);
    });

    test('Give release rating as current user (cap at 5)', async () => {
        server.use(
            http.put('https://api.discogs.com/releases/249504/rating/someuser', async ({ request }) => {
                const body = await request.json();

                expect(body).toStrictEqual({ rating: 5 });
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await client.database().setReleaseRating(249504, 'someuser', 6);
    });

    test('Remove release rating as current user', async () => {
        server.use(
            http.delete('https://api.discogs.com/releases/249504/rating/someuser', ({ request }) => {
                expect(request.method).toBeDefined();
                return HttpResponse.json(null, { status: 200 });
            })
        );

        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.database().setReleaseRating(249504, 'someuser', null);
    });

    test('Get Community Release Rating', async () => {
        server.use(
            http.get('https://api.discogs.com/releases/249504/rating', ({ request }) => {
                expect(request.method).toBeDefined();
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient();
        await client.database().getReleaseCommunityRating(249504);
    });

    test('Get Release Stats', async () => {
        server.use(
            http.get('https://api.discogs.com/releases/249504/stats', ({ request }) => {
                expect(request.method).toBeDefined();
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient();
        await client.database().getReleaseStats(249504);
    });

    test('Get Master Release', async () => {
        server.use(
            http.get('https://api.discogs.com/masters/1000', ({ request }) => {
                expect(request.method).toBeDefined();
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient();
        await client.database().getMaster(1000);
    });

    test('Get Master Release Versions', async () => {
        server.use(
            http.get('https://api.discogs.com/masters/1000/versions', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([
                    ['page', '2'],
                    ['per_page', '25'],
                    ['format', 'Vinyl'],
                    ['label', 'Scorpio Music'],
                    ['released', '1992'],
                    ['country', 'Belgium'],
                    ['sort', 'released'],
                    ['sort_order', 'asc'],
                ]);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient();
        await client.database().getMasterVersions(1000, {
            page: 2,
            per_page: 25,
            format: 'Vinyl',
            label: 'Scorpio Music',
            released: '1992',
            country: 'Belgium',
            sort: 'released',
            sort_order: 'asc',
        });
    });

    test('Get Artist', async () => {
        server.use(
            http.get('https://api.discogs.com/artists/108713', ({ request }) => {
                expect(request.method).toBeDefined();
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient();
        await client.database().getArtist(108713);
    });

    test('Get Artist Releases', async () => {
        server.use(
            http.get('https://api.discogs.com/artists/108713/releases', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([
                    ['page', '2'],
                    ['sort', 'year'],
                    ['sort_order', 'asc'],
                ]);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient();
        await client.database().getArtistReleases(108713, { page: 2, sort: 'year', sort_order: 'asc' });
    });

    test('Get Label', async () => {
        server.use(
            http.get('https://api.discogs.com/labels/1', ({ request }) => {
                expect(request.method).toBeDefined();
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient();
        await client.database().getLabel(1);
    });

    test('Get Label Releases', async () => {
        server.use(
            http.get('https://api.discogs.com/labels/1/releases', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([
                    ['page', '3'],
                    ['per_page', '25'],
                ]);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient();
        await client.database().getLabelReleases(1, { page: 3, per_page: 25 });
    });
});
