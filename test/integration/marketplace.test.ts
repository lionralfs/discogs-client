import { rest } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { setupMockAPI } from './setup.js';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('Marketplace', () => {
    test('Get a listing', async () => {
        server.use(
            rest.get('https://api.discogs.com/marketplace/listings/172723812', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([]);
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getListing(172723812);
    });

    test('Get a listing (with currency arg)', async () => {
        server.use(
            rest.get('https://api.discogs.com/marketplace/listings/172723812', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([['curr_abbr', 'USD']]);
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getListing(172723812, 'USD');
    });

    test('Edit a listing', async () => {
        server.use(
            rest.post('https://api.discogs.com/marketplace/listings/172723812', (req, res, ctx) => {
                expect(req.body).toStrictEqual({
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
                return res(ctx.status(204), ctx.json({}));
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
            rest.delete('https://api.discogs.com/marketplace/listings/172723812', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(204), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().deleteListing(172723812);
    });

    test('Add a listing', async () => {
        server.use(
            rest.post('https://api.discogs.com/marketplace/listings', (req, res, ctx) => {
                expect(req.body).toStrictEqual({
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
                return res(ctx.status(201), ctx.json({}));
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
            rest.get('https://api.discogs.com/marketplace/orders/1', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getOrder(1);
    });

    test('Edit an order', async () => {
        server.use(
            rest.post('https://api.discogs.com/marketplace/orders/1', (req, res, ctx) => {
                expect(req.body).toStrictEqual({
                    status: 'Shipped',
                    shipping: 10,
                });
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().editOrder(1, { status: 'Shipped', shipping: 10 });
    });

    test('Get orders', async () => {
        server.use(
            rest.get('https://api.discogs.com/marketplace/orders', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([
                    ['status', "Cancelled (Per Buyer's Request)"],
                    ['created_after', '2019-06-24T20:58:58Z'],
                    ['created_before', '2019-06-25T20:58:58Z'],
                    ['archived', 'true'],
                    ['sort', 'last_activity'],
                    ['sort_order', 'desc'],
                    ['page', '2'],
                    ['per_page', '50'],
                ]);
                return res(ctx.status(200), ctx.json({}));
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
            rest.get('https://api.discogs.com/marketplace/orders/1/messages', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([
                    ['page', '2'],
                    ['per_page', '50'],
                ]);
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getOrderMessages(1, { page: 2, per_page: 50 });
    });

    test('Add message to order', async () => {
        server.use(
            rest.post('https://api.discogs.com/marketplace/orders/1/messages', (req, res, ctx) => {
                expect(req.body).toStrictEqual({
                    message: 'hello world',
                    status: 'New Order',
                });
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().addOrderMessage(1, { message: 'hello world', status: 'New Order' });
    });

    test('Get fee without currency', async () => {
        server.use(
            rest.get('https://api.discogs.com/marketplace/fee/10.00', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([]);
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getFee(10);
    });

    test('Get fee with currency', async () => {
        server.use(
            rest.get('https://api.discogs.com/marketplace/fee/10.00/EUR', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([]);
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getFee(10, 'EUR');
    });

    test('Get price suggestion', async () => {
        server.use(
            rest.get('https://api.discogs.com/marketplace/price_suggestions/1', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([]);
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getPriceSuggestions(1);
    });

    test('Get Release Stats without currency', async () => {
        server.use(
            rest.get('https://api.discogs.com/marketplace/stats/1', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([]);
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getReleaseStats(1);
    });

    test('Get Release Stats with currency', async () => {
        server.use(
            rest.get('https://api.discogs.com/marketplace/stats/1', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([['curr_abbr', 'EUR']]);
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.marketplace().getReleaseStats(1, 'EUR');
    });
});
