import { escape } from './util.js';

/**
 * @typedef {import('./client.js').DiscogsClient} DiscogsClient
 */

/**
 * @param {DiscogsClient} client
 */
export default function (client) {
    let list = {};

    /**
     * Get the items in a list by list ID
     * @param {(number|string)} list - The list ID
     * @typedef {{created_ts: string; modified_ts: string; name: string; list_id: number; url: string; items: Array<{comment: string; display_title: string; uri: string; image_url: string; resource_url: string; type: string; id: number}>; resource_url: string; public: boolean; description: string;}} GetListItemsResponse
     * @returns {Promise<import('./client.js').RateLimitedResponse<GetListItemsResponse>>}
     *
     * @see https://www.discogs.com/developers/#page:user-lists,header:user-lists-list-get
     *
     * @example
     * await client.user().list().getItems(123)
     */
    list.getItems = function (list) {
        let path = `/lists/${escape(list)}`;
        return client.get(path);
    };

    return list;
}
