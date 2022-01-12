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
     * await client.user().collection().getReleases('rodneyfool', 3, { sort: 'artist', sort_order: 'desc' });
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
     * Add a release instance to the (optionally) given collection folder
     * @param {string} user - The user name
     * @param {(number|string)} release - The release ID
     * @param {(number|string)} [folder] - The folder ID (defaults to the "Uncategorized" folder)
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().collection().addRelease('rodneyfool', 3, 130076);
     */
    collection.addRelease = function (user, release, folder = 1) {
        return client.post(
            { url: `/users/${escape(user)}/collection/folders/${folder}/releases/${release}`, authLevel: 2 },
            null
        );
    };

    /**
     * Edit a release instance in the given collection folder
     * @param {string} user - The user name
     * @param {(number|string)} folder - The folder ID
     * @param {(number|string)} release - The release ID
     * @param {(number|string)} instance - The release instance ID
     * @param {Partial<{ rating: 1 | 2 | 3 | 4 | 5 | null; folder_id: number }>} data - The instance data
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().collection().editRelease('rodneyfool', 4, 130076, 1, { rating: 5, folder_id: 16 });
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
     * Remove an instance of a release from a user's collection folder.
     * @param {string} user - The user name
     * @param {(number|string)} folder - The folder ID
     * @param {(number|string)} release - The release ID
     * @param {(number|string)} instance - The release instance ID
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().collection().removeRelease('rodneyfool', 3, 130076, 1);
     */
    collection.removeRelease = function (user, folder, release, instance) {
        return client.delete({
            url: `/users/${escape(user)}/collection/folders/${folder}/releases/${release}/instances/${instance}`,
            authLevel: 2,
        });
    };

    /**
     * Retrieve a list of user-defined collection notes fields.
     * These fields are available on every release in the collection.
     * @param {string} user - The user name
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().collection().getFields('rodneyfool');
     */
    collection.getFields = function (user) {
        return client.get(`/users/${escape(user)}/collection/fields`);
    };

    /**
     * Change the value of a notes field on a particular instance.
     * @param {string} user - The user name
     * @param {(number|string)} folder - The folder ID
     * @param {(number|string)} release - The release ID
     * @param {(number|string)} instance - The release instance ID
     * @param {number} field - The ID of the field
     * @param {string} value - The new value of the field
     * @returns {Promise<unknown>}
     *
     * @example
     * await client.user().collection().editInstanceNote('rodneyfool', 3, 130076, 1, 8, 'foo');
     */
    collection.editInstanceNote = function (user, folder, release, instance, field, value) {
        let path = `/users/${escape(
            user
        )}/collection/folders/${folder}/releases/${release}/instances/${instance}/fields/${field}?value=${value}`;
        return client.post(path, null);
    };

    return collection;
}
