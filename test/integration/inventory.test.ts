import { rest } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { setupMockAPI } from './setup.js';
import { Response } from 'node-fetch';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('Inventory', () => {
    test('Should support requesting an export', async () => {
        server.use(
            rest.post('https://api.discogs.com/inventory/export', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200), ctx.json({}));
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        const response = await client.inventory().exportInventory();
        expect(response.data).toBe(undefined);
    });

    test('Should support retrieving recent exports (without pagination params)', async () => {
        server.use(
            rest.get('https://api.discogs.com/inventory/export', (req, res, ctx) => {
                expect(req.method).toBeDefined();
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
        expect(response.data).toBeTruthy();
    });

    test('Should support retrieving recent exports (with pagination params)', async () => {
        server.use(
            rest.get('https://api.discogs.com/inventory/export', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([
                    ['page', '2'],
                    ['per_page', '10'],
                ]);
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
        expect(response.data).toBeTruthy();
    });

    test('Should support retrieving an export by id', async () => {
        server.use(
            rest.get('https://api.discogs.com/inventory/export/599632', (req, res, ctx) => {
                expect(req.method).toBeDefined();
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
        expect(response.data).toBeTruthy();
    });

    test('Should support downloading an export by id', async () => {
        server.use(
            rest.get('https://api.discogs.com/inventory/export/599632/download', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200), ctx.text('some,csv,here'));
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        const response = await client.inventory().downloadExport(599632);
        expect(response.data instanceof Response);
    });
});
