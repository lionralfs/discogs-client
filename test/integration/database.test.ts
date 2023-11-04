import { rest } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { setupMockAPI } from './setup.js';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('Database', () => {
    test('Test search without query but with params', async () => {
        server.use(
            rest.get('https://api.discogs.com/database/search', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()].length).toBe(2);
                expect(req.url.searchParams.get('artist')).toBe('X');
                expect(req.url.searchParams.get('title')).toBe('Y');

                return res(ctx.status(200), ctx.json({}));
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.database().search({ artist: 'X', title: 'Y' });
    });

    test('Test search with query and params', async () => {
        server.use(
            rest.get('https://api.discogs.com/database/search', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()].length).toBe(3);
                expect(req.url.searchParams.get('q')).toBe('somequery');
                expect(req.url.searchParams.get('artist')).toBe('X');
                expect(req.url.searchParams.get('title')).toBe('Y');

                return res(ctx.status(200), ctx.json({}));
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.database().search({ query: 'somequery', artist: 'X', title: 'Y' });
    });

    test('Test search with query only', async () => {
        server.use(
            rest.get('https://api.discogs.com/database/search', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()].length).toBe(1);
                expect(req.url.searchParams.get('q')).toBe('somequery');
                return res(ctx.status(200), ctx.json({}));
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.database().search({ query: 'somequery' });
    });

    test('Test with every option', async () => {
        server.use(
            rest.get('https://api.discogs.com/database/search', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()].length).toBe(18);
                expect(req.url.searchParams.get('q')).toBe('nirvana');
                expect(req.url.searchParams.get('type')).toBe('release');
                expect(req.url.searchParams.get('title')).toBe('nirvana - nevermind');
                expect(req.url.searchParams.get('release_title')).toBe('nevermind');
                expect(req.url.searchParams.get('credit')).toBe('kurt');
                expect(req.url.searchParams.get('artist')).toBe('nirvana');
                expect(req.url.searchParams.get('anv')).toBe('nirvana');
                expect(req.url.searchParams.get('label')).toBe('dgc');
                expect(req.url.searchParams.get('genre')).toBe('rock');
                expect(req.url.searchParams.get('style')).toBe('grunge');
                expect(req.url.searchParams.get('country')).toBe('canada');
                expect(req.url.searchParams.get('year')).toBe('1991');
                expect(req.url.searchParams.get('format')).toBe('album');
                expect(req.url.searchParams.get('catno')).toBe('DGCD-24425');
                expect(req.url.searchParams.get('barcode')).toBe('7 2064-24425-2 4');
                expect(req.url.searchParams.get('track')).toBe('smells like teen spirit');
                expect(req.url.searchParams.get('submitter')).toBe('milKt');
                expect(req.url.searchParams.get('contributor')).toBe('jerome99');
                return res(ctx.status(200), ctx.json({}));
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
            rest.get('https://api.discogs.com/releases/249504', (req, res, ctx) => {
                const params = req.url.searchParams;
                expect([...params.entries()].length).toBe(0);
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient();
        await client.database().getRelease(249504);
    });

    test('Get release with currency', async () => {
        server.use(
            rest.get('https://api.discogs.com/releases/249504', (req, res, ctx) => {
                const params = req.url.searchParams;
                expect([...params.entries()].length).toBe(1);
                expect(params.get('curr_abbr')).toBe('USD');
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient();
        await client.database().getRelease(249504, 'USD');
    });

    test('Get a users release rating', async () => {
        server.use(
            rest.get('https://api.discogs.com/releases/249504/rating/someuser', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient();
        await client.database().getReleaseRating(249504, 'someuser');
    });

    test('Give release rating as current user', async () => {
        server.use(
            rest.put('https://api.discogs.com/releases/249504/rating/someuser', (req, res, ctx) => {
                expect(req.body).toStrictEqual({ rating: 2 });
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.database().setReleaseRating(249504, 'someuser', 2);
    });

    test('Give release rating as current user (cap at 5)', async () => {
        server.use(
            rest.put('https://api.discogs.com/releases/249504/rating/someuser', (req, res, ctx) => {
                expect(req.body).toStrictEqual({ rating: 5 });
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await client.database().setReleaseRating(249504, 'someuser', 6);
    });

    test('Remove release rating as current user', async () => {
        server.use(
            rest.delete('https://api.discogs.com/releases/249504/rating/someuser', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200));
            })
        );

        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.database().setReleaseRating(249504, 'someuser', null);
    });

    test('Get Community Release Rating', async () => {
        server.use(
            rest.get('https://api.discogs.com/releases/249504/rating', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient();
        await client.database().getReleaseCommunityRating(249504);
    });

    test('Get Release Stats', async () => {
        server.use(
            rest.get('https://api.discogs.com/releases/249504/stats', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient();
        await client.database().getReleaseStats(249504);
    });

    test('Get Master Release', async () => {
        server.use(
            rest.get('https://api.discogs.com/masters/1000', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient();
        await client.database().getMaster(1000);
    });

    test('Get Master Release Versions', async () => {
        server.use(
            rest.get('https://api.discogs.com/masters/1000/versions', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([
                    ['page', '2'],
                    ['per_page', '25'],
                    ['format', 'Vinyl'],
                    ['label', 'Scorpio Music'],
                    ['released', '1992'],
                    ['country', 'Belgium'],
                    ['sort', 'released'],
                    ['sort_order', 'asc'],
                ]);
                return res(ctx.status(200), ctx.json({}));
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
            rest.get('https://api.discogs.com/artists/108713', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient();
        await client.database().getArtist(108713);
    });

    test('Get Artist Releases', async () => {
        server.use(
            rest.get('https://api.discogs.com/artists/108713/releases', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([
                    ['page', '2'],
                    ['sort', 'year'],
                    ['sort_order', 'asc'],
                ]);
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient();
        await client.database().getArtistReleases(108713, { page: 2, sort: 'year', sort_order: 'asc' });
    });

    test('Get Label', async () => {
        server.use(
            rest.get('https://api.discogs.com/labels/1', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient();
        await client.database().getLabel(1);
    });

    test('Get Label Releases', async () => {
        server.use(
            rest.get('https://api.discogs.com/labels/1/releases', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([
                    ['page', '3'],
                    ['per_page', '25'],
                ]);
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient();
        await client.database().getLabelReleases(1, { page: 3, per_page: 25 });
    });
});
