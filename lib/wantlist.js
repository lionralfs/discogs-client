import { escape, addParams } from './util.js';

/**
 * @typedef {import('./client.js').DiscogsClient} DiscogsClient
 * @typedef {import('./client.js').CallbackFn} CallbackFn
 */

/**
 * @param {DiscogsClient} client
 */
export default function (client) {
    let wantlist = {};

    /**
     * Get the list of wantlisted releases for the given user name
     * @param {string} user - The user name
     * @param {object} [params] - Optional pagination params
     * @param {CallbackFn} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    wantlist.getReleases = function (user, params, callback) {
        let path = '/users/' + escape(user) + '/wants';
        if (arguments.length === 2 && typeof params === 'function') {
            callback = params;
        } else {
            path = addParams(path, params);
        }
        return client.get(path, callback);
    };

    /**
     * Add a release to the user's wantlist
     * @param {string} user - The user name
     * @param {(number|string)} release - The release ID
     * @param {{notes?: string, rating?: 0 | 1 | 2 | 3 | 4 | 5}} [data] - Optional notes and rating
     * @param {CallbackFn} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    wantlist.addRelease = function (user, release, data, callback) {
        let _data = data;
        if (arguments.length === 3 && typeof data === 'function') {
            callback = data;
            _data = null;
        }
        return client.put({ url: '/users/' + escape(user) + '/wants/' + release, authLevel: 2 }, _data, callback);
    };

    /**
     * Edit the notes or rating on a release in the user's wantlist
     * @param {string} user - The user name
     * @param {(number|string)} release - The release ID
     * @param {{notes?: string, rating?: 0 | 1 | 2 | 3 | 4 | 5}} [data] - The notes and rating {notes: 'Test', rating: 4}
     * @param {CallbackFn} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    wantlist.editNotes = function (user, release, data, callback) {
        return client.post({ url: '/users/' + escape(user) + '/wants/' + release, authLevel: 2 }, data, callback);
    };

    /**
     * Remove a release from the user's wantlist
     * @param {string} user - The user name
     * @param {(number|string)} release - The release ID
     * @param {CallbackFn} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    wantlist.removeRelease = function (user, release, callback) {
        return client.delete({ url: '/users/' + escape(user) + '/wants/' + release, authLevel: 2 }, callback);
    };

    return wantlist;
}
