import test from 'ava';
import collectionFactory from '@lib/collection.js';
import type { DiscogsClient } from '@lib/client.js';
import { Substitute } from '@fluffy-spoon/substitute';

test('Collection: Get folder metadata (throws auth error because not authenticated and requesting folder_id != 0)', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const collection = collectionFactory(client);
    client.authenticated(2).returns(false);

    // When/Then
    await t.throwsAsync(collection.getFolder('rodneyfool', 1234));
});

test('Collection: Collection items by folder (throws auth error)', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const collection = collectionFactory(client);
    client.authenticated(2).returns(false);

    // When/Then
    await t.throwsAsync(collection.getReleases('rodneyfool', '1234', { sort: 'artist', sort_order: 'desc' }));
});
