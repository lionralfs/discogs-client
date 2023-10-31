import userFactory from '@lib/user.js';
import type { DiscogsClient } from '@lib/client.js';
import { Substitute } from '@fluffy-spoon/substitute';
import { test, describe } from 'vitest';

describe('User', () => {
    test('getInventory: Should not send query params when requesting without pagination', async () => {
        // Given
        const client = Substitute.for<DiscogsClient>();
        const user = userFactory(client);

        // When
        await user.getInventory('rodneyfool');

        // Then
        client.received().get(`/users/rodneyfool/inventory`);
    });

    test('getContributions: Should not send query params when requesting without pagination', async () => {
        // Given
        const client = Substitute.for<DiscogsClient>();
        const user = userFactory(client);

        // When
        await user.getContributions('rodneyfool');

        // Then
        client.received().get(`/users/rodneyfool/contributions`);
    });

    test('getSubmissions: Should not send query params when requesting without pagination', async () => {
        // Given
        const client = Substitute.for<DiscogsClient>();
        const user = userFactory(client);

        // When
        await user.getSubmissions('rodneyfool');

        // Then
        client.received().get(`/users/rodneyfool/submissions`);
    });

    test('getLists: Should not send query params when requesting without pagination', async () => {
        // Given
        const client = Substitute.for<DiscogsClient>();
        const user = userFactory(client);

        // When
        await user.getLists('rodneyfool');

        // Then
        client.received().get(`/users/rodneyfool/lists`);
    });
});
