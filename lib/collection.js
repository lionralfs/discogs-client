import { escape, addParams } from './util.js';
import { AuthError } from './error.js';

/**
 * @typedef {import('./client.js').DiscogsClient} DiscogsClient
 * @typedef {import('./client.js').PaginationParameters} PaginationParameters
 */

/**
 * @param {DiscogsClient} client
 */
export default function (client) {
    let collection = {};

    /**
     * Get a list of all collection folders for the given user
     * @param {string} user - The user name
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().collection().getFolders('rodneyfool');
     */
    collection.getFolders = function (user) {
        return client.get(`/users/${escape(user)}/collection/folders`);
    };

    /**
     * Get metadata for a specified collection folder
     * @param {string} user - The Discogs user name
     * @param {number | string} folder - A folder ID (0 = public folder)
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().collection().getFolder('rodneyfool', 3);
     */
    collection.getFolder = function (user, folder) {
        if (client.authenticated(2) || Number(folder) === 0) {
            return client.get(`/users/${escape(user)}/collection/folders/${folder}`);
        }

        return Promise.reject(new AuthError());
    };

    /**
     * Add a new collection folder
     * @param {string} user - The user name
     * @param {string} name - The folder name
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().collection().addFolder('rodneyfool', 'My favorites');
     */
    collection.addFolder = function (user, name) {
        return client.post({ url: `/users/${escape(user)}/collection/folders`, authLevel: 2 }, { name: name });
    };

    /**
     * Change a folder name. The name of folder 0 and 1 can't be changed.
     * @param {string} user - The user name
     * @param {(number|string)}	folder - The folder ID
     * @param {string} name - The new folder name
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().collection().setFolderName('rodneyfool', 3, 'New Name');
     */
    collection.setFolderName = function (user, folder, name) {
        return client.post(
            { url: `/users/${escape(user)}/collection/folders/${folder}`, authLevel: 2 },
            { name: name }
        );
    };

    /**
     * Delete a folder. A folder must be empty before it can be deleted.
     * @param {string} user - The user name
     * @param {(number|string)}	folder - The folder ID
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().collection().deleteFolder('rodneyfool', 3);
     */
    collection.deleteFolder = function (user, folder) {
        return client.delete({ url: `/users/${escape(user)}/collection/folders/${folder}`, authLevel: 2 });
    };

    /**
     * Get the releases in a user's collection folder (0 = public folder)
     * @param {string} user - The user name
     * @param {(number|string)} folder - The folder ID
     * @param {PaginationParameters & import('./client.js').SortParameters<'label'|'artist'|'title'|'catno'|'format'|'rating'|'added'|'year'>} [params] - Optional extra pagination and sorting params
     * @returns {Promise<unknown>}
     * 
     * @example
     */
    collection.getReleases = function (user, folder, params) {
        if (client.authenticated(2) || Number(folder) === 0) {
            let path = `/users/${escape(user)}/collection/folders/${folder}/releases`;
            path = addParams(path, params);
            return client.get(path);
        }
        return Promise.reject(new AuthError());
    };

    /**
     * Get the instances of a release in a user's collection
     * @param {string} user - The user name
     * @param {(number|string)} release - The release ID
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().collection().getReleaseInstances('susan.salkeld', 7781525);
     */
    collection.getReleaseInstances = function (user, release) {
        return client.get(`/users/${escape(user)}/collection/releases/${release}`);
    };

    /**
     * @TODO
     *
     * Add a release instance to the (optionally) given collection folder
     * @param {string} user - The user name
     * @param {(number|string)} release - The release ID
     * @param {(number|string)} [folder] - The folder ID (defaults to the "Uncategorized" folder)
     * @returns {Promise<unknown>}
     */
    collection.addRelease = function (user, release, folder = 1) {
        return client.post(
            { url: `/users/${escape(user)}/collection/folders/${folder}/releases/${release}`, authLevel: 2 },
            null
        );
    };

    /**
     * @TODO
     *
     * Edit a release instance in the given collection folder
     * @param {string} user - The user name
     * @param {(number|string)} folder - The folder ID
     * @param {(number|string)} release - The release ID
     * @param {(number|string)} instance - The release instance ID
     * @param {object} data - The instance data {rating: 4, folder_id: 1532}
     * @returns {Promise<unknown>}
     */
    collection.editRelease = function (user, folder, release, instance, data) {
        return client.post(
            {
                url: `/users/${escape(user)}/collection/folders/${folder}/releases/${release}/instances/${instance}`,
                authLevel: 2,
            },
            data
        );
    };

    /**
     * @TODO
     *
     * Delete a release instance from the given folder
     * @param {string} user - The user name
     * @param {(number|string)} folder - The folder ID
     * @param {(number|string)} release - The release ID
     * @param {(number|string)} instance - The release instance ID
     * @returns {Promise<unknown>}
     */
    collection.removeRelease = function (user, folder, release, instance) {
        return client.delete({
            url: `/users/${escape(user)}/collection/folders/${folder}/releases/${release}/instances/${instance}`,
            authLevel: 2,
        });
    };

    return collection;
}
