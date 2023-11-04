import { rest } from 'msw';
import { DiscogsClient } from '@lib/client.js';
import { DiscogsError } from '@lib/error.js';
import { setupMockAPI } from './setup.js';
import { expect, test, describe } from 'vitest';

const server = setupMockAPI();

describe('Error', () => {
    test('Passed an instance of DiscogsError when bad status code', async () => {
        server.use(
            rest.get('https://api.discogs.com/labels/1123123123123/releases', (req, res, ctx) => {
                expect(req.method).toBeDefined();
                return res(ctx.status(404), ctx.json({ message: 'error message' }));
            })
        );

        const client = new DiscogsClient();
        try {
            await client.database().getLabelReleases(1123123123123, { page: 3, per_page: 25 });
        } catch (err: unknown) {
            expect((err as DiscogsError).statusCode).toBe(404);
            expect((err as DiscogsError).message).toBe('error message');
            expect(err instanceof DiscogsError);
        }
    });
});
