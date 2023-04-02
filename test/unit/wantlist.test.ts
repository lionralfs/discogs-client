import test from 'ava';
import wantlistFactory from '@lib/wantlist.js';
import type { DiscogsClient } from '@lib/client.js';
import { Substitute } from '@fluffy-spoon/substitute';

test('Wantlist (getReleases): Should not send query params when requesting without pagination', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const wantlist = wantlistFactory(client);

    // When
    await wantlist.getReleases('rodneyfool');

    // Then
    t.notThrows(() => client.received().get(`/users/rodneyfool/wants`));
});