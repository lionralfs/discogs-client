import { escape, addParams } from './util.js';

/**
 * @typedef {import('./client.js').DiscogsClient} DiscogsClient
 * @typedef {import('./client.js').CallbackFn} CallbackFn
 */

/**
 * @param {DiscogsClient} client
 */
export default function (client) {
    let list = {};

    /**
     * Get the items in a list by list ID
     * @param {(number|string)} list - The list ID
     * @param {CallbackFn} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    list.getItems = function (list, callback) {
        let path = `/lists/${escape(list)}`;
        return client.get(path, callback);
    };

    return list;
}
