import test from 'ava';
import inventoryFactory from '@lib/inventory.js';
import type { DiscogsClient } from '@lib/client.js';
import { Substitute } from '@fluffy-spoon/substitute';

test('Inventory (downloadExport): Should pass json=false', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const inventory = inventoryFactory(client);

    // When
    await inventory.downloadExport(4647524);

    // Then
    t.notThrows(() => client.received().get({ url: `/inventory/export/4647524/download`, json: false }));
});
