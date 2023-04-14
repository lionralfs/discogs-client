import test from 'ava';
import { rest } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { setupMockAPI } from './_setup.test.js';

const server = setupMockAPI();

test.serial('Inventory: Should support requesting an export', async t => {
    t.plan(2);
    server.use(
        rest.post('https://api.discogs.com/inventory/export', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({}));
        })
    );
    const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    const response = await client.inventory().exportInventory();
    t.is(response.data, undefined);
});

test.serial('Inventory: Should support retrieving recent exports (without pagination params)', async t => {
    t.plan(2);
    server.use(
        rest.get('https://api.discogs.com/inventory/export', (req, res, ctx) => {
            t.pass();
            return res(
                ctx.status(200),
                ctx.json({
                    items: [
                        {
                            status: 'success',
                            created_ts: '2018-09-27T12:59:02',
                            url: 'https://api.discogs.com/inventory/export/599632',
                            finished_ts: '2018-09-27T12:59:02',
                            download_url: 'https://api.discogs.com/inventory/export/599632/download',
                            filename: 'cburmeister-inventory-20180927-1259.csv',
                            id: 599632,
                        },
                    ],
                    pagination: {
                        per_page: 50,
                        items: 15,
                        page: 1,
                        urls: {},
                        pages: 1,
                    },
                })
            );
        })
    );
    const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    const response = await client.inventory().getExports();
    t.truthy(response.data);
});

test.serial('Inventory: Should support retrieving recent exports (with pagination params)', async t => {
    t.plan(2);
    server.use(
        rest.get('https://api.discogs.com/inventory/export', (req, res, ctx) => {
            t.deepEqual(
                [...req.url.searchParams.entries()],
                [
                    ['page', '2'],
                    ['per_page', '10'],
                ]
            );
            return res(
                ctx.status(200),
                ctx.json({
                    items: [
                        {
                            status: 'success',
                            created_ts: '2018-09-27T12:59:02',
                            url: 'https://api.discogs.com/inventory/export/599632',
                            finished_ts: '2018-09-27T12:59:02',
                            download_url: 'https://api.discogs.com/inventory/export/599632/download',
                            filename: 'cburmeister-inventory-20180927-1259.csv',
                            id: 599632,
                        },
                    ],
                    pagination: {
                        per_page: 50,
                        items: 15,
                        page: 1,
                        urls: {},
                        pages: 1,
                    },
                })
            );
        })
    );
    const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    const response = await client.inventory().getExports({ page: 2, per_page: 10 });
    t.truthy(response.data);
});

test.serial('Inventory: Should support retrieving an export by id', async t => {
    t.plan(2);
    server.use(
        rest.get('https://api.discogs.com/inventory/export/599632', (req, res, ctx) => {
            t.pass();
            return res(
                ctx.status(200),
                ctx.json({
                    status: 'success',
                    created_ts: '2018-09-27T12:50:39',
                    url: 'https://api.discogs.com/inventory/export/599632',
                    finished_ts: '2018-09-27T12:59:02',
                    download_url: 'https://api.discogs.com/inventory/export/599632/download',
                    filename: 'cburmeister-inventory-20180927-1259.csv',
                    id: 599632,
                })
            );
        })
    );
    const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
    const response = await client.inventory().getExport(599632);
    t.truthy(response.data);
});
