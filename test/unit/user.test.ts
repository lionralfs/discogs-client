import test from 'ava';
import userFactory from '@lib/user.js';
import type { DiscogsClient } from '@lib/client.js';
import { Substitute } from '@fluffy-spoon/substitute';

test('User (getInventory): Should not send query params when requesting without pagination', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const user = userFactory(client);

    // When
    await user.getInventory('rodneyfool');

    // Then
    t.notThrows(() => client.received().get(`/users/rodneyfool/inventory`));
});

test('User (getContributions): Should not send query params when requesting without pagination', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const user = userFactory(client);

    // When
    await user.getContributions('rodneyfool');

    // Then
    t.notThrows(() => client.received().get(`/users/rodneyfool/contributions`));
});

test('User (getSubmissions): Should not send query params when requesting without pagination', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const user = userFactory(client);

    // When
    await user.getSubmissions('rodneyfool');

    // Then
    t.notThrows(() => client.received().get(`/users/rodneyfool/submissions`));
});

test('User (getLists): Should not send query params when requesting without pagination', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const user = userFactory(client);

    // When
    await user.getLists('rodneyfool');

    // Then
    t.notThrows(() => client.received().get(`/users/rodneyfool/lists`));
});