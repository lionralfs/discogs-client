import collection from './collection.js';
import list from './list.js';
import { escape, addParams } from './util.js';
import wantlist from './wantlist.js';

/**
 * @typedef {import('./client.js').DiscogsClient} DiscogsClient
 * @typedef {import('./client.js').CallbackFn} CallbackFn
 */

/**
 * @param {DiscogsClient} client
 */
export default function (client) {
    var user = {};

    /**
     * Get the profile for the given user
     * @param {string} user - The user name
     * @param {CallbackFn} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    user.getProfile = function (user, callback) {
        return client.get('/users/' + escape(user), callback);
    };

    /**
     * Get the inventory for the given user
     * @param {string} user - The user name
     * @param {object} [params] - Extra params like status, sort and sort_order, pagination
     * @param {CallbackFn} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    user.getInventory = function (user, params, callback) {
        var path = '/users/' + escape(user) + '/inventory';
        if (arguments.length === 2 && typeof params === 'function') {
            callback = params;
        } else {
            // Add pagination params when present
            path = addParams(path, params);
        }
        return client.get(path, callback);
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
     * @param {CallbackFn} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    user.getContributions = function (user, params, callback) {
        var path = '/users/' + escape(user) + '/contributions';
        if (arguments.length === 2 && typeof params === 'function') {
            callback = params;
        } else {
            // Add pagination params when present
            path = addParams(path, params);
        }
        return client.get(path, callback);
    };

    /**
     * Get the submissions for the given user
     * @param {string} user - The user name
     * @param {object} [params] - Optional pagination params
     * @param {CallbackFn} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    user.getSubmissions = function (user, params, callback) {
        var path = '/users/' + escape(user) + '/submissions';
        if (arguments.length === 2 && typeof params === 'function') {
            callback = params;
        } else {
            // Add pagination params when present
            path = addParams(path, params);
        }
        return client.get(path, callback);
    };

    /**
     * Get the lists for the given user
     * @param {string} user - The user name
     * @param {object} [params] - Optional pagination params
     * @param {CallbackFn} [callback] - The callback
     * @return {DiscogsClient|Promise}
     */
    user.getLists = function (user, params, callback) {
        var path = '/users/' + escape(user) + '/lists';
        if (arguments.length === 2 && typeof params === 'function') {
            callback = params;
        } else {
            // Add pagination params when present
            path = addParams(path, params);
        }
        return client.get(path, callback);
    };

    return user;
}
