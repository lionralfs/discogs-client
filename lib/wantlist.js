import { escape, toQueryString } from './util.js';

/**
 * @typedef {import('./client.js').DiscogsClient} DiscogsClient
 * @typedef {import('./client.js').PaginationParameters} PaginationParameters
 */

/**
 * @param {DiscogsClient} client
 */
export default function (client) {
    let wantlist = {};

    /**
     * Get the list of wantlisted releases for the given user name
     * @param {string} user - The user name
     * @param {PaginationParameters} [params] - Optional pagination params
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().wantlist().getReleases('rodneyfool', { page: 2, per_page: 4 });
     */
    wantlist.getReleases = function (user, params) {
        let path = `/users/${escape(user)}/wants?${toQueryString(params)}`;

        return client.get(path);
    };

    /**
     * Add a release to the user's wantlist
     * @param {string} user - The user name
     * @param {(number|string)} release - The release ID
     * @param {{notes?: string, rating?: 0 | 1 | 2 | 3 | 4 | 5}} [data] - Optional notes and rating
     * @returns {Promise<unknown>}
     */
    wantlist.addRelease = function (user, release, data) {
        return client.put({ url: `/users/${escape(user)}/wants/${release}`, authLevel: 2 }, data);
    };

    /**
     * Edit the notes or rating on a release in the user's wantlist
     * @param {string} user - The user name
     * @param {(number|string)} release - The release ID
     * @param {{notes?: string, rating?: 0 | 1 | 2 | 3 | 4 | 5}} [data] - The notes and rating {notes: 'Test', rating: 4}
     * @returns {Promise<unknown>}
     */
    wantlist.editNotes = function (user, release, data) {
        return client.post({ url: `/users/${escape(user)}/wants/${release}`, authLevel: 2 }, data);
    };

    /**
     * Remove a release from the user's wantlist
     * @param {string} user - The user name
     * @param {(number|string)} release - The release ID
     * @returns {Promise<unknown>}
     */
    wantlist.removeRelease = function (user, release) {
        return client.delete({ url: `/users/${escape(user)}/wants/${release}`, authLevel: 2 });
    };

    return wantlist;
}
