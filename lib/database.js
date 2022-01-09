import { addParams, escape } from './util.js';

/**
 * @typedef {import('./client.js').DiscogsClient} DiscogsClient
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
     * @param {(number|string)} artist - The Discogs artist ID
     * @returns {Promise<unknown>}
     */
    database.getArtist = function (artist) {
        return client.get('/artists/' + artist);
    };

    /**
     * Get artist release data
     * @param {(number|string)} artist - The Discogs artist ID
     * @param {object} [params] - Optional pagination params
     * @returns {Promise<unknown>}
     */
    database.getArtistReleases = function (artist, params) {
        let path = '/artists/' + artist + '/releases';
        path = addParams(path, params);
        return client.get(path);
    };

    /**
     * Get release data
     * @param {(number|string)} release - The Discogs release ID
     * @param {Currency} [currency] - Currency for marketplace data. Defaults to the authenticated users currency.
     * @returns {Promise<unknown>}
     */
    database.getRelease = function (release, currency) {
        let path = '/releases/' + release;
        if (currency !== undefined) {
            path += `?curr_abbr=${currency}`;
        }
        return client.get(path);
    };

    /**
     * Get the release rating for the given user
     * @param {(number|string)} release - The Discogs release ID
     * @param {string} user - The Discogs user name
     * @returns {Promise<unknown>}
     */
    database.getReleaseRating = function (release, user) {
        return client.get('/releases/' + release + '/rating/' + escape(user));
    };

    /**
     * Set (or remove) a release rating for the given logged in user
     * @param {(number|string)} release - The Discogs release ID
     * @param {string} user - The Discogs user name
     * @param {1 | 2 | 3 | 4 | 5 | null} rating - The new rating for a release between 1 and 5. Null = remove rating
     * @returns {Promise<unknown>}
     */
    database.setReleaseRating = function (release, user, rating) {
        let url = '/releases/' + release + '/rating/' + escape(user);
        if (!rating) {
            return client.delete({ url: url, authLevel: 2 });
        } else {
            return client.put({ url: url, authLevel: 2 }, { rating: rating > 5 ? 5 : rating });
        }
    };

    /**
     * Get the average rating and the total number of user ratings for a given release.
     * @param {(number|string)} release - The Discogs release ID
     * @returns {Promise<unknown>}
     */
    database.getReleaseCommunityRating = function (release) {
        let path = `/releases/${release}/rating`;
        return client.get(path);
    };

    /**
     * Get the total number of “haves” (in the community’s collections)
     * and “wants” (in the community’s wantlists) for a given release.
     * @param {(number|string)} release - The Discogs release ID
     * @returns {Promise<unknown>}
     */
    database.getReleaseStats = function (release) {
        let path = `/releases/${release}/stats`;
        return client.get(path);
    };

    /**
     * Get master release data
     * @param {(number|string)} master - The Discogs master release ID
     * @returns {Promise<unknown>}
     */
    database.getMaster = function (master) {
        return client.get(`/masters/${master}`);
    };

    /**
     * Get the release versions contained in the given master release
     * @param {(number|string)} master - The Discogs master release ID
     * @param {object} [params] - optional pagination params
     * @returns {Promise<unknown>}
     */
    database.getMasterVersions = function (master, params) {
        let path = `/masters/${master}/versions`;
        path = addParams(path, params);
        return client.get(path);
    };

    /**
     * Get label data
     * @param {(number|string)} label - The Discogs label ID
     * @returns {Promise<unknown>}
     */
    database.getLabel = function (label) {
        return client.get(`/labels/${label}`);
    };

    /**
     * Get label release data
     * @param {(number|string)} label - The Discogs label ID
     * @param {object} [params] - Optional pagination params
     * @returns {Promise<unknown>}
     */
    database.getLabelReleases = function (label, params) {
        let path = `/labels/${label}/releases`;
        path = addParams(path, params);
        return client.get(path);
    };

    /**
     * Get an image
     * @param {string} url - The full image url
     * @returns {Promise<unknown>}
     */
    database.getImage = function (url) {
        return client.get({ url: url, encoding: 'binary', queue: false, json: false });
    };

    /**
     * Search the database
     * @param {string} query - The search query
     * @param {object} [params] - Search parameters as defined on http://www.discogs.com/developers/#page:database,header:database-search
     * @returns {Promise<unknown>}
     */
    database.search = function (query, params) {
        let obj = {};
        if (typeof params === 'object') {
            obj = params;
        } else if (typeof query === 'object') {
            obj = query;
        }
        if (typeof query === 'string') {
            obj.q = query;
        }
        return client.get({ url: addParams('/database/search', obj), authLevel: 1 });
    };

    return database;
}
