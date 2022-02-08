// @ts-check
import test from 'ava';
import { rest } from 'msw';
import { DiscogsClient } from '../lib/client.js';
import { setupMockAPI } from './_setup.js';

const server = setupMockAPI();

test.serial('Marketplace: Get a listing', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/marketplace/listings/172723812', (req, res, ctx) => {
            t.deepEqual([...req.url.searchParams.entries()], []);
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
    await client.marketplace().getListing(172723812);
});

test.serial('Marketplace: Get a listing (with currency arg)', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/marketplace/listings/172723812', (req, res, ctx) => {
            t.deepEqual([...req.url.searchParams.entries()], [['curr_abbr', 'USD']]);
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
    await client.marketplace().getListing(172723812, 'USD');
});

test.serial('Marketplace: Edit a listing', async t => {
    t.plan(1);

    server.use(
        rest.post('https://api.discogs.com/marketplace/listings/172723812', (req, res, ctx) => {
            t.deepEqual(req.body, {
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

    let client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
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

test.serial('Marketplace: Delete a listing', async t => {
    t.plan(1);

    server.use(
        rest.delete('https://api.discogs.com/marketplace/listings/172723812', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(204), ctx.json({}));
        })
    );

    let client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
    await client.marketplace().deleteListing(172723812);
});

test.serial('Marketplace: Add a listing', async t => {
    t.plan(1);

    server.use(
        rest.post('https://api.discogs.com/marketplace/listings', (req, res, ctx) => {
            t.deepEqual(req.body, {
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

    let client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
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

test.serial('Marketplace: Get an order', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/marketplace/orders/1', (req, res, ctx) => {
            t.pass();
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
    await client.marketplace().getOrder(1);
});

test.serial('Marketplace: Edit an order', async t => {
    t.plan(1);

    server.use(
        rest.post('https://api.discogs.com/marketplace/orders/1', (req, res, ctx) => {
            t.deepEqual(req.body, {
                status: 'Shipped',
                shipping: 10,
            });
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
    await client.marketplace().editOrder(1, { status: 'Shipped', shipping: 10 });
});

test.serial('Marketplace: Get orders', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/marketplace/orders', (req, res, ctx) => {
            t.deepEqual(
                [...req.url.searchParams.entries()],
                [
                    ['status', "Cancelled (Per Buyer's Request)"],
                    ['created_after', '2019-06-24T20:58:58Z'],
                    ['created_before', '2019-06-25T20:58:58Z'],
                    ['archived', 'true'],
                    ['sort', 'last_activity'],
                    ['sort_order', 'desc'],
                    ['page', '2'],
                    ['per_page', '50'],
                ]
            );
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
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

test.serial('Marketplace: Get order messages', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/marketplace/orders/1/messages', (req, res, ctx) => {
            t.deepEqual(
                [...req.url.searchParams.entries()],
                [
                    ['page', '2'],
                    ['per_page', '50'],
                ]
            );
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
    await client.marketplace().getOrderMessages(1, { page: 2, per_page: 50 });
});

test.serial('Marketplace: Add message to order', async t => {
    t.plan(1);

    server.use(
        rest.post('https://api.discogs.com/marketplace/orders/1/messages', (req, res, ctx) => {
            t.deepEqual(req.body, {
                message: 'hello world',
                status: 'New Order',
            });
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
    await client.marketplace().addOrderMessage(1, { message: 'hello world', status: 'New Order' });
});

test.serial('Marketplace: Get fee without currency', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/marketplace/fee/10.00', (req, res, ctx) => {
            t.deepEqual([...req.url.searchParams.entries()], []);
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
    await client.marketplace().getFee(10);
});

test.serial('Marketplace: Get fee with currency', async t => {
    t.plan(1);

    server.use(
        rest.get('https://api.discogs.com/marketplace/fee/10.00/EUR', (req, res, ctx) => {
            t.deepEqual([...req.url.searchParams.entries()], []);
            return res(ctx.status(200), ctx.json({}));
        })
    );

    let client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
    await client.marketplace().getFee(10, 'EUR');
});
