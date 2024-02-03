import { http, HttpResponse } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { setupMockAPI } from './setup.js';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('Marketplace', () => {
    test('Get a listing', async () => {
        server.use(
            http.get('https://api.discogs.com/marketplace/listings/172723812', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([]);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getListing(172723812);
    });

    test('Get a listing (with currency arg)', async () => {
        server.use(
            http.get('https://api.discogs.com/marketplace/listings/172723812', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([['curr_abbr', 'USD']]);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getListing(172723812, 'USD');
    });

    test('Edit a listing', async () => {
        server.use(
            http.post('https://api.discogs.com/marketplace/listings/172723812', async ({ request }) => {
                const body = await request.json();

                expect(body).toStrictEqual({
                    release_id: 1,
                    condition: 'Mint (M)',
                    sleeve_condition: 'Fair (F)',
                    price: 10,
                    comments: 'This item is wonderful',
                    allow_offers: true,
                    status: 'Draft',
                    external_id: '1234321',
                    location: 'top shelf',
                    weight: 200,
                    format_quantity: 'auto',
                });
                return new Response(null, { status: 204 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().editListing(172723812, {
            release_id: 1,
            condition: 'Mint (M)',
            sleeve_condition: 'Fair (F)',
            price: 10,
            comments: 'This item is wonderful',
            allow_offers: true,
            status: 'Draft',
            external_id: '1234321',
            location: 'top shelf',
            weight: 200,
            format_quantity: 'auto',
        });
    });

    test('Delete a listing', async () => {
        server.use(
            http.delete('https://api.discogs.com/marketplace/listings/172723812', ({ request }) => {
                expect(request.method).toBeDefined();
                return new Response(null, { status: 204 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().deleteListing(172723812);
    });

    test('Add a listing', async () => {
        server.use(
            http.post('https://api.discogs.com/marketplace/listings', async ({ request }) => {
                const body = await request.json();

                expect(body).toStrictEqual({
                    release_id: 1,
                    condition: 'Mint (M)',
                    sleeve_condition: 'Fair (F)',
                    price: 10,
                    comments: 'This item is wonderful',
                    allow_offers: true,
                    status: 'Draft',
                    external_id: '1234321',
                    location: 'top shelf',
                    weight: 200,
                    format_quantity: 'auto',
                });
                return HttpResponse.json({}, { status: 201 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().addListing({
            release_id: 1,
            condition: 'Mint (M)',
            sleeve_condition: 'Fair (F)',
            price: 10,
            comments: 'This item is wonderful',
            allow_offers: true,
            status: 'Draft',
            external_id: '1234321',
            location: 'top shelf',
            weight: 200,
            format_quantity: 'auto',
        });
    });

    test('Get an order', async () => {
        server.use(
            http.get('https://api.discogs.com/marketplace/orders/1', ({ request }) => {
                expect(request.method).toBeDefined();
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getOrder(1);
    });

    test('Edit an order', async () => {
        server.use(
            http.post('https://api.discogs.com/marketplace/orders/1', async ({ request }) => {
                const body = await request.json();

                expect(body).toStrictEqual({
                    status: 'Shipped',
                    shipping: 10,
                });
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().editOrder(1, { status: 'Shipped', shipping: 10 });
    });

    test('Get orders', async () => {
        server.use(
            http.get('https://api.discogs.com/marketplace/orders', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([
                    ['status', "Cancelled (Per Buyer's Request)"],
                    ['created_after', '2019-06-24T20:58:58Z'],
                    ['created_before', '2019-06-25T20:58:58Z'],
                    ['archived', 'true'],
                    ['sort', 'last_activity'],
                    ['sort_order', 'desc'],
                    ['page', '2'],
                    ['per_page', '50'],
                ]);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getOrders({
            status: "Cancelled (Per Buyer's Request)",
            created_after: '2019-06-24T20:58:58Z',
            created_before: '2019-06-25T20:58:58Z',
            archived: true,
            sort: 'last_activity',
            sort_order: 'desc',
            page: 2,
            per_page: 50,
        });
    });

    test('Get order messages', async () => {
        server.use(
            http.get('https://api.discogs.com/marketplace/orders/1/messages', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([
                    ['page', '2'],
                    ['per_page', '50'],
                ]);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getOrderMessages(1, { page: 2, per_page: 50 });
    });

    test('Add message to order', async () => {
        server.use(
            http.post('https://api.discogs.com/marketplace/orders/1/messages', async ({ request }) => {
                const body = await request.json();

                expect(body).toStrictEqual({
                    message: 'hello world',
                    status: 'New Order',
                });
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().addOrderMessage(1, { message: 'hello world', status: 'New Order' });
    });

    test('Get fee without currency', async () => {
        server.use(
            http.get('https://api.discogs.com/marketplace/fee/10.00', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([]);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getFee(10);
    });

    test('Get fee with currency', async () => {
        server.use(
            http.get('https://api.discogs.com/marketplace/fee/10.00/EUR', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([]);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getFee(10, 'EUR');
    });

    test('Get price suggestion', async () => {
        server.use(
            http.get('https://api.discogs.com/marketplace/price_suggestions/1', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([]);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getPriceSuggestions(1);
    });

    test('Get Release Stats without currency', async () => {
        server.use(
            http.get('https://api.discogs.com/marketplace/stats/1', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([]);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getReleaseStats(1);
    });

    test('Get Release Stats with currency', async () => {
        server.use(
            http.get('https://api.discogs.com/marketplace/stats/1', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([['curr_abbr', 'EUR']]);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getReleaseStats(1, 'EUR');
    });
});
