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
     * @param {string} user - The user name
     * @return {Promise<unknown>}
     */
    user.getProfile = function (user) {
        return client.get(`/users/${escape(user)}`);
    };

    /**
     * Get the inventory for the given user
     * @param {string} user - The user name
     * @param {object} [params] - Extra params like status, sort and sort_order, pagination
     * @return {Promise<unknown>}
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
     * @return {Promise<unknown>}
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
     * @return {Promise<unknown>}
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
     * @return {Promise<unknown>}
     */
    user.getLists = function (user, params) {
        let path = `/users/${escape(user)}/lists`;
        // Add pagination params when present
        path = addParams(path, params);
        return client.get(path);
    };

    return user;
}
