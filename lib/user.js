import collection from './collection.js';
import list from './list.js';
import { escape, addParams } from './util.js';
import wantlist from './wantlist.js';

/**
 * @typedef {import('./client.js').DiscogsClient} DiscogsClient
 * @typedef {import('./client.js').PaginationParameters} PaginationParameters
 * @typedef {import('./database.js').Currency} Currency
 */

/**
 * @param {DiscogsClient} client
 */
export default function (client) {
    let user = {};

    /**
     * Get the profile for the given user
     * @param {string} username - The user name
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().getProfile('rodneyfool');
     */
    user.getProfile = function (username) {
        return client.get(`/users/${escape(username)}`);
    };

    /**
     * Edit a user's profile data.
     * @param {string} username - The user name
     * @param {Partial<{ name: string; home_page: string; location: string; profile: string; curr_abbr: Currency}>} [data] - The profile data
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().editProfile('rodneyfool', {
     *     name: 'Nicolas Cage',
     *     home_page: 'www.discogs.com',
     *     location: 'Portland',
     *     profile: 'I am a Discogs user!',
     *     curr_abbr: 'USD',
     * });
     */
    user.editProfile = function (username, data) {
        return client.post(`/users/${escape(username)}`, data);
    };

    /**
     * Get the inventory for the given user
     * @param {string} user - The user name
     * @param {Partial<{status: string}> & PaginationParameters & import('./client.js').SortParameters<'listed'|'price'|'item'|'artist'|'label'|'catno'|'audio'|'status'|'location'>} [params] - Extra params like status, sort and sort_order, pagination
     * @returns {Promise<unknown>}
     *
     * @see https://www.discogs.com/developers/#page:marketplace,header:marketplace-inventory
     *
     * @example
     * await client.user().getInventory('rodneyfool', { status: 'for sale', page: 3, per_page: 25, sort: 'status', sort_order: 'asc' });
     */
    user.getInventory = function (user, params) {
        let path = `/users/${escape(user)}/inventory`;
        // Add pagination params when present
        path = addParams(path, params);
        return client.get(path);
    };

    /**
     * Copy the client getIdentity function to the user module
     */
    user.getIdentity = client.getIdentity;

    /**
     * Expose the collection functions and pass the client instance
     * @returns {ReturnType<collection>}
     */
    user.collection = function () {
        return collection(client);
    };

    /**
     * Expose the wantlist functions and pass the client instance
     * @returns {ReturnType<wantlist>}
     */
    user.wantlist = function () {
        return wantlist(client);
    };

    /**
     * Expose the list functions and pass the client instance
     * @returns {ReturnType<list>}
     */
    user.list = function () {
        return list(client);
    };

    /**
     * Get the contributions for the given user
     * @param {string} user - The user name
     * @param {PaginationParameters & import('./client.js').SortParameters<'label'|'artist'|'title'|'catno'|'format'|'rating'|'year'|'added'>} [params] - Optional pagination and sorting params
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().getContributions('rodneyfool', {
     *     page: 2,
     *     per_page: 50,
     *     sort: 'artist',
     *     sort_order: 'desc'
     * });
     */
    user.getContributions = function (user, params) {
        let path = `/users/${escape(user)}/contributions`;
        // Add pagination params when present
        path = addParams(path, params);
        return client.get(path);
    };

    /**
     * Get the submissions for the given user
     * @param {string} user - The user name
     * @param {PaginationParameters} [params] - Optional pagination params
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().getSubmissions('rodneyfool', { page: 2, per_page: 100 });
     */
    user.getSubmissions = function (user, params) {
        let path = `/users/${escape(user)}/submissions`;
        // Add pagination params when present
        path = addParams(path, params);
        return client.get(path);
    };

    /**
     * Get the lists for the given user
     * @param {string} user - The user name
     * @param {PaginationParameters} [params] - Optional pagination params
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().getLists('rodneyfool', { page: 3, per_page: 25 });
     */
    user.getLists = function (user, params) {
        let path = `/users/${escape(user)}/lists`;
        // Add pagination params when present
        path = addParams(path, params);
        return client.get(path);
    };

    return user;
}
