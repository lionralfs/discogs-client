import test from 'ava';
import databaseFactory from '@lib/database.js';
import type { DiscogsClient } from '@lib/client.js';
import { Substitute } from '@fluffy-spoon/substitute';

test('Database (getArtistReleases): Should not send query params when requesting without pagination', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const database = databaseFactory(client);

    // When
    await database.getArtistReleases(108713);

    // Then
    t.notThrows(() => client.received().get(`/artists/108713/releases`));
});

test('Database (getRelease): Should not send query params when requesting without pagination', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const database = databaseFactory(client);

    // When
    await database.getRelease(108713);

    // Then
    t.notThrows(() => client.received().get(`/releases/108713`));
});

test('Database (getMasterVersions): Should not send query params when requesting without pagination', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const database = databaseFactory(client);

    // When
    await database.getMasterVersions(108713);

    // Then
    t.notThrows(() => client.received().get(`/masters/108713/versions`));
});

test('Database (getLabelReleases): Should not send query params when requesting without pagination', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const database = databaseFactory(client);

    // When
    await database.getLabelReleases(108713);

    // Then
    t.notThrows(() => client.received().get(`/labels/108713/releases`));
});

test('Database (search): Should not send query params when requesting without pagination', async t => {
    // Given
    const client = Substitute.for<DiscogsClient>();
    const database = databaseFactory(client);

    // When
    await database.search();

    // Then
    t.notThrows(() => client.received().get({ url: `/database/search`, authLevel: 1 }));
});
