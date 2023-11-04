import wantlistFactory from '@lib/wantlist.js';
import type { DiscogsClient } from '@lib/client.js';
import { Substitute } from '@fluffy-spoon/substitute';
import { describe, test } from 'vitest';

describe('Wantlist', () => {
    test('Wantlist (getReleases): Should not send query params when requesting without pagination', async () => {
        // Given
        const client = Substitute.for<DiscogsClient>();
        const wantlist = wantlistFactory(client);

        // When
        await wantlist.getReleases('rodneyfool');

        // Then
        client.received().get(`/users/rodneyfool/wants`);
    });
});
