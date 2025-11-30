import marketplaceFactory from '@lib/marketplace.js';
import type { DiscogsClient } from '@lib/client.js';
import { Substitute } from '@fluffy-spoon/substitute';
import { test, describe } from 'vitest';

describe('Marketplace', () => {
    test('getListing: Should not send query params when requesting without pagination', async () => {
        // Given
        const client = Substitute.for<DiscogsClient>();
        const marketplace = marketplaceFactory(client);

        // When
        await marketplace.getListing(172723812);

        // Then
        client.received().get(`/marketplace/listings/172723812`);
    });

    test('getOrders: Should not send query params when requesting without pagination', async () => {
        // Given
        const client = Substitute.for<DiscogsClient>();
        const marketplace = marketplaceFactory(client);

        // When
        await marketplace.getOrders();

        // Then
        client.received().get({ url: `/marketplace/orders`, authLevel: 2 });
    });

    test('getOrderMessages: Should not send query params when requesting without pagination', async () => {
        // Given
        const client = Substitute.for<DiscogsClient>();
        const marketplace = marketplaceFactory(client);

        // When
        await marketplace.getOrderMessages('1-1');

        // Then
        client.received().get({ url: `/marketplace/orders/1-1/messages`, authLevel: 2 });
    });

    test('getReleaseStats: Should not send query params when requesting without pagination', async () => {
        // Given
        const client = Substitute.for<DiscogsClient>();
        const marketplace = marketplaceFactory(client);

        // When
        await marketplace.getReleaseStats(1);

        // Then
        client.received().get(`/marketplace/stats/1`);
    });
});
