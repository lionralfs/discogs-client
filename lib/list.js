import { escape, addParams } from './util.js';

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
     * @return {Promise<unknown>}
     */
    list.getItems = function (list) {
        let path = `/lists/${escape(list)}`;
        return client.get(path);
    };

    return list;
}
