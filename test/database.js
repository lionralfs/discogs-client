// @ts-check
import test from 'ava';
import { rest } from 'msw';
import { DiscogsClient } from '../lib/client.js';
import { setupMockAPI } from './_setup.js';

const server = setupMockAPI();

test.serial('Database: Test search without query but with params', async t => {
    t.plan(3);
    server.use(
        rest.get('https://api.discogs.com/database/search', (req, res, ctx) => {
            t.is([...req.url.searchParams.entries()].length, 2);
            t.is(req.url.searchParams.get('artist'), 'X');
            t.is(req.url.searchParams.get('title'), 'Y');

            return res(ctx.status(200), ctx.json({}));
        })
    );
    let client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.database().search({ artist: 'X', title: 'Y' });
});

test.serial('Database: Test search with query and params', async t => {
    t.plan(4);
    server.use(
        rest.get('https://api.discogs.com/database/search', (req, res, ctx) => {
            t.is([...req.url.searchParams.entries()].length, 3);
            t.is(req.url.searchParams.get('q'), 'somequery');
            t.is(req.url.searchParams.get('artist'), 'X');
            t.is(req.url.searchParams.get('title'), 'Y');

            return res(ctx.status(200), ctx.json({}));
        })
    );
    let client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.database().search({ query: 'somequery', artist: 'X', title: 'Y' });
});

test.serial('Database: Test search with query only', async t => {
    t.plan(2);
    server.use(
        rest.get('https://api.discogs.com/database/search', (req, res, ctx) => {
            t.is([...req.url.searchParams.entries()].length, 1);
            t.is(req.url.searchParams.get('q'), 'somequery');
            return res(ctx.status(200), ctx.json({}));
        })
    );
    let client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.database().search({ query: 'somequery' });
});

test.serial('Database: Test with every option', async t => {
    t.plan(19);
    server.use(
        rest.get('https://api.discogs.com/database/search', (req, res, ctx) => {
            t.is([...req.url.searchParams.entries()].length, 18);
            t.is(req.url.searchParams.get('q'), 'nirvana');
            t.is(req.url.searchParams.get('type'), 'release');
            t.is(req.url.searchParams.get('title'), 'nirvana - nevermind');
            t.is(req.url.searchParams.get('release_title'), 'nevermind');
            t.is(req.url.searchParams.get('credit'), 'kurt');
            t.is(req.url.searchParams.get('artist'), 'nirvana');
            t.is(req.url.searchParams.get('anv'), 'nirvana');
            t.is(req.url.searchParams.get('label'), 'dgc');
            t.is(req.url.searchParams.get('genre'), 'rock');
            t.is(req.url.searchParams.get('style'), 'grunge');
            t.is(req.url.searchParams.get('country'), 'canada');
            t.is(req.url.searchParams.get('year'), '1991');
            t.is(req.url.searchParams.get('format'), 'album');
            t.is(req.url.searchParams.get('catno'), 'DGCD-24425');
            t.is(req.url.searchParams.get('barcode'), '7 2064-24425-2 4');
            t.is(req.url.searchParams.get('track'), 'smells like teen spirit');
            t.is(req.url.searchParams.get('submitter'), 'milKt');
            t.is(req.url.searchParams.get('contributor'), 'jerome99');
            return res(ctx.status(200), ctx.json({}));
        })
    );
    let client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
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

test.serial('Database: Get release', async t => {
    t.plan(1);
    server.use(
        rest.get('https://api.discogs.com/releases/249504', (req, res, ctx) => {
            let params = req.url.searchParams;
            t.is([...params.entries()].length, 0);
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient();
    await client.database().getRelease(249504);
});

test.serial('Database: Get release with currency', async t => {
    t.plan(2);
    server.use(
        rest.get('https://api.discogs.com/releases/249504', (req, res, ctx) => {
            let params = req.url.searchParams;
            t.is([...params.entries()].length, 1);
            t.is(params.get('curr_abbr'), 'USD');
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient();
    await client.database().getRelease(249504, 'USD');
});

test.serial('Database: Get a users release rating', async t => {
    t.plan(1);
    server.use(
        rest.get('https://api.discogs.com/releases/249504/rating/someuser', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient();
    await client.database().getReleaseRating(249504, 'someuser');
});

test.serial('Database: Give release rating as current user', async t => {
    t.plan(1);

    server.use(
        rest.put('https://api.discogs.com/releases/249504/rating/someuser', (req, res, ctx) => {
            t.deepEqual(req.body, { rating: 2 });
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.database().setReleaseRating(249504, 'someuser', 2);
});

test.serial('Database: Remove release rating as current user', async t => {
    t.plan(2);

    server.use(
        rest.delete('https://api.discogs.com/releases/249504/rating/someuser', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200));
        })
    );

    let client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    await client.database().setReleaseRating(249504, 'someuser', null);
});

test.serial('Database: Get Community Release Rating', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/releases/249504/rating', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient();
    await client.database().getReleaseCommunityRating(249504);
});

test.serial('Database: Get Release Stats', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/releases/249504/stats', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient();
    await client.database().getReleaseStats(249504);
});

test.serial('Database: Get Master Release', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/masters/1000', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient();
    await client.database().getMaster(1000);
});

test.serial('Database: Get Master Release Versions', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/masters/1000/versions', (req, res, ctx) => {
            t.deepEqual(
                [...req.url.searchParams.entries()],
                [
                    ['page', '2'],
                    ['per_page', '25'],
                    ['format', 'Vinyl'],
                    ['label', 'Scorpio Music'],
                    ['released', '1992'],
                    ['country', 'Belgium'],
                    ['sort', 'released'],
                    ['sort_order', 'asc'],
                ]
            );
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient();
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

test.serial('Database: Get Artist', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/artists/108713', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient();
    await client.database().getArtist(108713);
});

test.serial('Database: Get Artist Releases', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/artists/108713/releases', (req, res, ctx) => {
            t.deepEqual(
                [...req.url.searchParams.entries()],
                [
                    ['page', '2'],
                    ['sort', 'year'],
                    ['sort_order', 'asc'],
                ]
            );
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient();
    await client.database().getArtistReleases(108713, { page: 2, sort: 'year', sort_order: 'asc' });
});

test.serial('Database: Get Label', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/labels/1', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient();
    await client.database().getLabel(1);
});

test.serial('Database: Get Label Releases', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/labels/1/releases', (req, res, ctx) => {
            t.deepEqual(
                [...req.url.searchParams.entries()],
                [
                    ['page', '3'],
                    ['per_page', '25'],
                ]
            );
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient();
    await client.database().getLabelReleases(1, { page: 3, per_page: 25 });
});
