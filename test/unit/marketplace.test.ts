import test from 'ava';
import marketplaceFactory from '@lib/marketplace.js';
import type { DiscogsClient } from '@lib/client.js';
import { Substitute } from '@fluffy-spoon/substitute';

test('Marketplace (getListing): Should not send query params when requesting without pagination', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const marketplace = marketplaceFactory(client);

    // When
    await marketplace.getListing(172723812);

    // Then
    t.notThrows(() => client.received().get(`/marketplace/listings/172723812`));
});

test('Marketplace (getOrders): Should not send query params when requesting without pagination', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const marketplace = marketplaceFactory(client);

    // When
    await marketplace.getOrders();

    // Then
    t.notThrows(() => client.received().get({ url: `/marketplace/orders`, authLevel: 2 }));
});

test('Marketplace (getOrderMessages): Should not send query params when requesting without pagination', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const marketplace = marketplaceFactory(client);

    // When
    await marketplace.getOrderMessages(1);

    // Then
    t.notThrows(() => client.received().get({ url: `/marketplace/orders/1/messages`, authLevel: 2 }));
});

test('Marketplace (getReleaseStats): Should not send query params when requesting without pagination', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const marketplace = marketplaceFactory(client);

    // When
    await marketplace.getReleaseStats(1);

    // Then
    t.notThrows(() => client.received().get(`/marketplace/stats/1`));
});
