import collectionFactory from '@lib/collection.js';
import type { DiscogsClient } from '@lib/client.js';
import { Substitute } from '@fluffy-spoon/substitute';
import { expect, test, describe } from 'vitest';

describe('Collection', () => {
    test('Get folder metadata (throws auth error because not authenticated and requesting folder_id != 0)', async () => {
        // Given
        const client = Substitute.for<DiscogsClient>();
        const collection = collectionFactory(client);
        client.authenticated(2).returns(false);

        // When/Then
        await expect(collection.getFolder('rodneyfool', 1234)).rejects.toThrow();
    });

    test('Get folder releases (throws auth error because not authenticated and requesting folder_id != 0)', async () => {
        // Given
        const client = Substitute.for<DiscogsClient>();
        const collection = collectionFactory(client);
        client.authenticated(2).returns(false);

        // When/Then
        await expect(collection.getReleases('rodneyfool', 1234)).rejects.toThrow();
    });

    test('Collection items by folder (throws auth error)', async () => {
        // Given
        const client = Substitute.for<DiscogsClient>();
        const collection = collectionFactory(client);
        client.authenticated(2).returns(false);

        // When/Then
        await expect(
            collection.getReleases('rodneyfool', '1234', { sort: 'artist', sort_order: 'desc' })
        ).rejects.toThrow();
    });

    test('getReleases: Should not send query params when requesting without pagination', async () => {
        // Given
        const client = Substitute.for<DiscogsClient>();
        const collection = collectionFactory(client);
        client.authenticated(2).returns(true);

        // When
        await collection.getReleases('some-user', 123);

        // Then
        client.received().get(`/users/some-user/collection/folders/123/releases`);
    });
});
