import { http, HttpResponse } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { setupMockAPI } from './setup.js';
import { Response } from 'node-fetch';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('Inventory', () => {
    test('Should support requesting an export', async () => {
        server.use(
            http.post('https://api.discogs.com/inventory/export', ({ request }) => {
                expect(request.method).toBeDefined();
                return HttpResponse.json({}, { status: 200 });
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        const response = await client.inventory().exportInventory();
        expect(response.data).toBe(undefined);
    });

    test('Should support retrieving recent exports (without pagination params)', async () => {
        server.use(
            http.get('https://api.discogs.com/inventory/export', ({ request }) => {
                expect(request.method).toBeDefined();
                return HttpResponse.json({
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
                }, { status: 200 });
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        const response = await client.inventory().getExports();
        expect(response.data).toBeTruthy();
    });

    test('Should support retrieving recent exports (with pagination params)', async () => {
        server.use(
            http.get('https://api.discogs.com/inventory/export', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([
                    ['page', '2'],
                    ['per_page', '10'],
                ]);
                return HttpResponse.json({
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
                }, { status: 200 });
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        const response = await client.inventory().getExports({ page: 2, per_page: 10 });
        expect(response.data).toBeTruthy();
    });

    test('Should support retrieving an export by id', async () => {
        server.use(
            http.get('https://api.discogs.com/inventory/export/599632', ({ request }) => {
                expect(request.method).toBeDefined();
                return HttpResponse.json({
                    status: 'success',
                    created_ts: '2018-09-27T12:50:39',
                    url: 'https://api.discogs.com/inventory/export/599632',
                    finished_ts: '2018-09-27T12:59:02',
                    download_url: 'https://api.discogs.com/inventory/export/599632/download',
                    filename: 'cburmeister-inventory-20180927-1259.csv',
                    id: 599632,
                }, { status: 200 });
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        const response = await client.inventory().getExport(599632);
        expect(response.data).toBeTruthy();
    });

    test('Should support downloading an export by id', async () => {
        server.use(
            http.get('https://api.discogs.com/inventory/export/599632/download', ({ request }) => {
                expect(request.method).toBeDefined();
                return HttpResponse.text('some,csv,here', { status: 200 });
            })
        );
        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        const response = await client.inventory().downloadExport(599632);
        expect(response.data instanceof Response);
    });
});
