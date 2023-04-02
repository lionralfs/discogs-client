import test from 'ava';
import { DiscogsClient } from '@lib/client.js';

test('Collection: Get folder metadata (throws auth error)', async t => {
    const client = new DiscogsClient();
    await t.throwsAsync(client.user().collection().getFolder('rodneyfool', 1234));
});

test('Collection: Collection items by folder (throws auth error)', async t => {
    const client = new DiscogsClient();
    await t.throwsAsync(
        client.user().collection().getReleases('rodneyfool', '1234', { sort: 'artist', sort_order: 'desc' })
    );
});
