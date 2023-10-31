import { rest } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { setupMockAPI } from './setup.js';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('User', () => {
    test('Get Identity', async () => {
        server.use(
            rest.get('https://api.discogs.com/oauth/identity', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().getIdentity();
    });

    test('Get Profile', async () => {
        server.use(
            rest.get('https://api.discogs.com/users/rodneyfool', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient();
        await client.user().getProfile('rodneyfool');
    });

    test('Edit Profile', async () => {
        server.use(
            rest.post('https://api.discogs.com/users/rodneyfool', (req, res, ctx) => {
                expect(req.body).toStrictEqual({
                    name: 'Nicolas Cage',
                    home_page: 'www.discogs.com',
                    location: 'Portland',
                    profile: 'I am a Discogs user!',
                    curr_abbr: 'USD',
                });
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.user().editProfile('rodneyfool', {
            name: 'Nicolas Cage',
            home_page: 'www.discogs.com',
            location: 'Portland',
            profile: 'I am a Discogs user!',
            curr_abbr: 'USD',
        });
    });

    test('Get User Submissions', async () => {
        server.use(
            rest.get('https://api.discogs.com/users/rodneyfool/submissions', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([
                    ['page', '4'],
                    ['per_page', '48'],
                ]);
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.user().getSubmissions('rodneyfool', { page: 4, per_page: 48 });
    });

    test('Get User Contributions', async () => {
        server.use(
            rest.get('https://api.discogs.com/users/rodneyfool/contributions', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([
                    ['page', '2'],
                    ['per_page', '50'],
                    ['sort', 'artist'],
                    ['sort_order', 'desc'],
                ]);
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client
            .user()
            .getContributions('rodneyfool', { page: 2, per_page: 50, sort: 'artist', sort_order: 'desc' });
    });

    test('Get User Inventory', async () => {
        server.use(
            rest.get('https://api.discogs.com/users/rodneyfool/inventory', (req, res, ctx) => {
                expect([...req.url.searchParams.entries()]).toStrictEqual([
                    ['status', 'for sale'],
                    ['page', '3'],
                    ['per_page', '25'],
                    ['sort', 'status'],
                    ['sort_order', 'asc'],
                ]);
                return res(ctx.status(200), ctx.json({}));
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.user().getInventory('rodneyfool', {
            status: 'for sale',
            page: 3,
            per_page: 25,
            sort: 'status',
            sort_order: 'asc',
        });
    });
});
