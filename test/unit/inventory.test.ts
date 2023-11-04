import inventoryFactory from '@lib/inventory.js';
import type { DiscogsClient } from '@lib/client.js';
import { Substitute } from '@fluffy-spoon/substitute';
import { test, describe } from 'vitest';

describe('Inventory', () => {
    test('downloadExport: Should pass json=false', async () => {
        // Given
        const client = Substitute.for<DiscogsClient>();
        const inventory = inventoryFactory(client);

        // When
        await inventory.downloadExport(4647524);

        // Then
        client.received().get({ url: `/inventory/export/4647524/download`, json: false });
    });
});
