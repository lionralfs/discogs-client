import collection from './collection.js';
import list from './list.js';
import { escape, addParams } from './util.js';
import wantlist from './wantlist.js';

/**
 * @typedef {import('./client.js').DiscogsClient} DiscogsClient
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
     * @param {{ name?: string; home_page?: string; location?: string; profile?: string; curr_abbr?: import('./database.js').Currency}} [data] - The profile data
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
     * @param {object} [params] - Extra params like status, sort and sort_order, pagination
     * @returns {Promise<unknown>}
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
     * @param {object} [params] - Optional pagination and sorting params
     * @returns {Promise<unknown>}
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
     * @param {object} [params] - Optional pagination params
     * @returns {Promise<unknown>}
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
     * @param {object} [params] - Optional pagination params
     * @returns {Promise<unknown>}
     */
    user.getLists = function (user, params) {
        let path = `/users/${escape(user)}/lists`;
        // Add pagination params when present
        path = addParams(path, params);
        return client.get(path);
    };

    return user;
}
