import { addParams, escape } from './util.js';

/**
 * @typedef {import('./client.js').DiscogsClient} DiscogsClient
 * @typedef {import('./client.js').CallbackFn} CallbackFn
 * @typedef {'USD'|'GBP'|'EUR'|'CAD'|'AUD'|'JPY'|'CHF'|'MXN'|'BRL'|'NZD'|'SEK'|'ZAR'} Currency
 */

/**
 * @param {DiscogsClient} client
 */
export default function (client) {
    let database = {};

    /**
     * Expose Discogs database status constants
     */
    database.status = { accepted: 'Accepted', draft: 'Draft', deleted: 'Deleted', rejected: 'Rejected' };

    /**
     * Get artist data
     * @param {number} artist - The Discogs artist ID
     * @param {CallbackFn} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    database.getArtist = function (artist, callback) {
        return client.get('/artists/' + artist, callback);
    };

    /**
     * Get artist release data
     * @param {(number|string)} artist - The Discogs artist ID
     * @param {object} [params] - Optional pagination params
     * @param {CallbackFn} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    database.getArtistReleases = function (artist, params, callback) {
        let path = '/artists/' + artist + '/releases';
        if (arguments.length === 2 && typeof params === 'function') {
            callback = params;
        } else {
            path = addParams(path, params);
        }
        return client.get(path, callback);
    };

    /**
     * Get release data
     * @param {(number|string)} release - The Discogs release ID
     * @param {Currency} [currency] - Currency for marketplace data. Defaults to the authenticated users currency.
     * @param {CallbackFn} [callback] - Callback
     * @return {DiscogsClient|Promise}
     */
    database.getRelease = function (release, currency, callback) {
        let path = '/releases/' + release;
        if (arguments.length === 2 && typeof currency === 'function') {
            callback = currency;
        } else if (currency !== undefined) {
            path += `?curr_abbr=${currency}`;
        }
        return client.get(path, callback);
    };

    /**
     * Get the release rating for the given user
     * @param {(number|string)} release - The Discogs release ID
     * @param {string} user - The Discogs user name
     * @param {CallbackFn} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    database.getReleaseRating = function (release, user, callback) {
        return client.get('/releases/' + release + '/rating/' + escape(user), callback);
    };

    /**
     * Set (or remove) a release rating for the given logged in user
     * @param {(number|string)} release - The Discogs release ID
     * @param {string} user - The Discogs user name
     * @param {1 | 2 | 3 | 4 | 5 | null} rating - The new rating for a release between 1 and 5. Null = remove rating
     * @param {CallbackFn} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    database.setReleaseRating = function (release, user, rating, callback) {
        let url = '/releases/' + release + '/rating/' + escape(user);
        if (!rating) {
            return client.delete({ url: url, authLevel: 2 }, callback);
        } else {
            return client.put({ url: url, authLevel: 2 }, { rating: rating > 5 ? 5 : rating }, callback);
        }
    };

    /**
     * Get the average rating and the total number of user ratings for a given release.
     * @param {number} release - The Discogs release ID
     * @param {CallbackFn} [callback] - Callback function
     * @returns {DiscogsClient|Promise}
     */
    database.getReleaseCommunityRating = function (release, callback) {
        let path = `/releases/${release}/rating`;
        return client.get(path, callback);
    };

    /**
     * Get the total number of “haves” (in the community’s collections)
     * and “wants” (in the community’s wantlists) for a given release.
     * @param {number} release - The Discogs release ID
     * @param {CallbackFn} [callback] - Callback function
     * @returns {DiscogsClient|Promise}
     */
    database.getReleaseStats = function (release, callback) {
        let path = `/releases/${release}/stats`;
        return client.get(path, callback);
    };

    /**
     * Get master release data
     * @param {(number|string)} master - The Discogs master release ID
     * @param {CallbackFn} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    database.getMaster = function (master, callback) {
        return client.get('/masters/' + master, callback);
    };

    /**
     * Get the release versions contained in the given master release
     * @param {(number|string)} master - The Discogs master release ID
     * @param {object} [params] - optional pagination params
     * @param {CallbackFn} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    database.getMasterVersions = function (master, params, callback) {
        let path = '/masters/' + master + '/versions';
        if (arguments.length === 2 && typeof params === 'function') {
            callback = params;
        } else {
            path = addParams(path, params);
        }
        return client.get(path, callback);
    };

    /**
     * Get label data
     * @param {(number|string)} label - The Discogs label ID
     * @param {CallbackFn} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    database.getLabel = function (label, callback) {
        return client.get('/labels/' + label, callback);
    };

    /**
     * Get label release data
     * @param {(number|string)} label - The Discogs label ID
     * @param {object} [params] - Optional pagination params
     * @param {CallbackFn} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    database.getLabelReleases = function (label, params, callback) {
        let path = '/labels/' + label + '/releases';
        if (arguments.length === 2 && typeof params === 'function') {
            callback = params;
        } else {
            path = addParams(path, params);
        }
        return client.get(path, callback);
    };

    /**
     * Get an image
     * @param {string} url - The full image url
     * @param {CallbackFn} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    database.getImage = function (url, callback) {
        return client.get({ url: url, encoding: 'binary', queue: false, json: false }, callback);
    };

    /**
     * Search the database
     * @param {string} query - The search query
     * @param {object} [params] - Search parameters as defined on http://www.discogs.com/developers/#page:database,header:database-search
     * @param {CallbackFn} [callback] - Callback function
     * @return {DiscogsClient|Promise}
     */
    database.search = function (query, params, callback) {
        let obj = {};
        if (arguments.length === 2 && typeof params === 'function') {
            callback = params;
        }
        if (typeof params === 'object') {
            obj = params;
        } else if (typeof query === 'object') {
            obj = query;
        }
        if (typeof query === 'string') {
            obj.q = query;
        }
        return client.get({ url: addParams('/database/search', obj), authLevel: 1 }, callback);
    };

    return database;
}
