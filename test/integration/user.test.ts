import { http, HttpResponse } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { setupMockAPI } from './setup.js';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('User', () => {
    test('Get Identity', async () => {
        server.use(
            http.get('https://api.discogs.com/oauth/identity', ({ request }) => {
                expect(request.method).toBeDefined();
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ auth: { userToken: 'testtoken12345' } });
        await client.user().getIdentity();
    });

    test('Get Profile', async () => {
        server.use(
            http.get('https://api.discogs.com/users/rodneyfool', ({ request }) => {
                expect(request.method).toBeDefined();
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient();
        await client.user().getProfile('rodneyfool');
    });

    test('Edit Profile', async () => {
        server.use(
            http.post('https://api.discogs.com/users/rodneyfool', async ({ request }) => {
                const body = await request.json();

                expect(body).toStrictEqual({
                    name: 'Nicolas Cage',
                    home_page: 'www.discogs.com',
                    location: 'Portland',
                    profile: 'I am a Discogs user!',
                    curr_abbr: 'USD',
                });
                return HttpResponse.json({}, { status: 200 });
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
            http.get('https://api.discogs.com/users/rodneyfool/submissions', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([
                    ['page', '4'],
                    ['per_page', '48'],
                ]);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client.user().getSubmissions('rodneyfool', { page: 4, per_page: 48 });
    });

    test('Get User Contributions', async () => {
        server.use(
            http.get('https://api.discogs.com/users/rodneyfool/contributions', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([
                    ['page', '2'],
                    ['per_page', '50'],
                    ['sort', 'artist'],
                    ['sort_order', 'desc'],
                ]);
                return HttpResponse.json({}, { status: 200 });
            })
        );

        const client = new DiscogsClient({ userAgent: 'agent', auth: { userToken: 'test-token' } });
        await client
            .user()
            .getContributions('rodneyfool', { page: 2, per_page: 50, sort: 'artist', sort_order: 'desc' });
    });

    test('Get User Inventory', async () => {
        server.use(
            http.get('https://api.discogs.com/users/rodneyfool/inventory', ({ request }) => {
                const url = new URL(request.url);

                expect([...url.searchParams.entries()]).toStrictEqual([
                    ['status', 'for sale'],
                    ['page', '3'],
                    ['per_page', '25'],
                    ['sort', 'status'],
                    ['sort_order', 'asc'],
                ]);
                return HttpResponse.json({}, { status: 200 });
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
