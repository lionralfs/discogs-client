import { addParams, escape } from './util.js';

/**
 * @typedef {import('./client.js').DiscogsClient} DiscogsClient
 * @typedef {'USD'|'GBP'|'EUR'|'CAD'|'AUD'|'JPY'|'CHF'|'MXN'|'BRL'|'NZD'|'SEK'|'ZAR'} Currency
 * @typedef {import('./client.js').PaginationParameters} PaginationParameters
 */

/**
 * @param {DiscogsClient} client
 * @see https://www.discogs.com/developers/#page:database
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
     * @typedef {{namevariations: Array<string>; profile: string; releases_url; string; resource_url: string; uri: string; urls: Array<string>; data_quality: string; id: number; images: Array<{height: number; resource_url: string; type: string; uri: string; uri150: string; width: number}>; members: Array<{active: boolean; id: number; name: string; resource_url: string;}>}} GetArtistResponse
     * @returns {Promise<import('./client.js').RateLimitedResponse<GetArtistResponse>>}
     *
     * @see https://www.discogs.com/developers/#page:database,header:database-artist-get
     *
     * @example
     * await client.database().getArtist(108713);
     */
    database.getArtist = function (artist) {
        return client.get('/artists/' + artist);
    };

    /**
     * Get artist release data
     * @param {(number|string)} artist - The Discogs artist ID
     * @param {PaginationParameters & import('./client.js').SortParameters<'year'|'title'|'format'>} [params] - Optional pagination params
     * @typedef {{releases: Array<{artist: string; id: number; main_release: number; resource_url: string; role: string; thumb: string; title: string; type: string; year: number}>}} GetArtistReleasesResponses
     * @returns {Promise<import('./client.js').RateLimitedResponse<GetArtistReleasesResponses & import('./client.js').PaginationResponse>>}
     *
     * @see https://www.discogs.com/developers/#page:database,header:database-artist-releases-get
     *
     * @example
     * await client.database().getArtistReleases(108713, { page: 2, sort: 'year', sort_order: 'asc' });
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
     * @typedef {{title: string; id: number; artists: Array<{anv: string; id: number; join: string; name: string; resource_url: string; role: string; tracks: string}>; data_quality: string; thumb: string; community: Array<{contributors: Array<{resource_url: string; username: string;}>; data_quality: string; have: number; rating: {average: number; count: number}; status: string; submitter: {resource_url: string; username: string}; want: number;}>; companies: Array<{catno: string; entity_type: string; entity_type_name: string; id: number; name: string; resource_url: string}>; country: string; date_added: string; date_changed: string; estimated_weight: number; extraartists: Array<{anv: string; id: number; join: string; name: string; resource_url: string; role: string; tracks: string;}>; format_quantity: number; formats: Array<{descriptions: Array<string>; name: string; qty: string}>; genres: Array<string>; identifiers: Array<{type: string; value: string}>; images: Array<{height: number; resource_url: string; type: string; uri: string; uri150: string; width: number}>; labels: Array<{catno: string; entity_type: string; id: number; name: string; resource_url: string}>; lowest_price: number; master_id: number; master_url: string; notes: string; num_for_sale: number; released: string; released_formatted: string; resource_url: string; series: Array<{name: string; catno: string; entity_type: string; entity_type_name: string; id: number; resource_url: string; thumbnail_url: string}>; status: string; styles: Array<string>; tracklist: Array<{duration: string; position: string; title: string; type_: string}>; uri: string; videos: Array<{description: string; duration: number; embed: boolean; title: string; uri: string}>; year: number}} GetReleaseResponse
     * @returns {Promise<import('./client.js').RateLimitedResponse<GetReleaseResponse>>}
     *
     * @see https://www.discogs.com/developers/#page:database,header:database-release-get
     *
     * @example
     * await client.database().getRelease(249504);
     *
     * @example
     * await client.database().getRelease(249504, 'USD');
     */
    database.getRelease = function (release, currency) {
        let path = `/releases/${release}`;
        if (currency !== undefined) {
            path += `?curr_abbr=${currency}`;
        }
        return client.get(path);
    };

    /**
     * Get the release rating for the given user
     * @param {(number|string)} release - The Discogs release ID
     * @param {string} user - The Discogs user name
     * @typedef {{username: string; release_id: number; rating: number}} GetReleaseRatingResponse
     * @returns {Promise<import('./client.js').RateLimitedResponse<GetReleaseRatingResponse>>}
     *
     * @see https://www.discogs.com/developers/#page:database,header:database-release-rating-by-user-get
     *
     * @example
     * await client.database().getReleaseRating(249504, 'rodneyfool');
     */
    database.getReleaseRating = function (release, user) {
        return client.get(`/releases/${release}/rating/${escape(user)}`);
    };

    /**
     * Set (or remove) a release rating for the given logged in user
     * @param {(number|string)} release - The Discogs release ID
     * @param {string} user - The Discogs user name
     * @param {1 | 2 | 3 | 4 | 5 | null} rating - The new rating for a release between 1 and 5. Null = remove rating
     * @returns {Promise<import('./client.js').RateLimitedResponse<GetReleaseRatingResponse | void>>}
     *
     * @see https://www.discogs.com/developers/#page:database,header:database-release-rating-by-user-put
     * @see https://www.discogs.com/developers/#page:database,header:database-release-rating-by-user-delete
     *
     * @example
     * await client.database().setReleaseRating(249504, 'rodneyfool', 2);
     *
     * @example
     * await client.database().setReleaseRating(249504, 'rodneyfool', null);
     */
    database.setReleaseRating = function (release, user, rating) {
        let url = `/releases/${release}/rating/${escape(user)}`;
        if (!rating) {
            return client.delete({ url: url, authLevel: 2 });
        } else {
            return client.put({ url: url, authLevel: 2 }, { rating: rating > 5 ? 5 : rating });
        }
    };

    /**
     * Get the average rating and the total number of user ratings for a given release.
     * @param {(number|string)} release - The Discogs release ID
     * @typedef {{rating: {count: number; average: number}; release_id: number}} GetReleaseCommunityRatingResponse
     * @returns {Promise<import('./client.js').RateLimitedResponse<GetReleaseCommunityRatingResponse>>}
     *
     * @see https://www.discogs.com/developers/#page:database,header:database-community-release-rating-get
     *
     * @example
     * await client.database().getReleaseCommunityRating(249504);
     */
    database.getReleaseCommunityRating = function (release) {
        let path = `/releases/${release}/rating`;
        return client.get(path);
    };

    /**
     * Get the total number of "haves" (in the community's collections)
     * and "wants" (in the community's wantlists) for a given release.
     * @param {(number|string)} release - The Discogs release ID
     * @returns {Promise<unknown>}
     *
     * @see https://www.discogs.com/developers/#page:database,header:database-release-stats-get
     *
     * @example
     * await client.database().getReleaseStats(249504);
     */
    database.getReleaseStats = function (release) {
        let path = `/releases/${release}/stats`;
        return client.get(path);
    };

    /**
     * Get master release data
     * @param {(number|string)} master - The Discogs master release ID
     * @returns {Promise<unknown>}
     *
     * @see https://www.discogs.com/developers/#page:database,header:database-master-release-get
     *
     * @example
     * await client.database().getMaster(1000);
     */
    database.getMaster = function (master) {
        return client.get(`/masters/${master}`);
    };

    /**
     * Get the release versions contained in the given master release
     * @param {(number|string)} master - The Discogs master release ID
     * @param {PaginationParameters & Partial<{ format: string; label: string; released: string; country: string } & import('./client.js').SortParameters<'released'|'title'|'format'|'label'|'catno'|'country'>>} [params] - optional pagination params
     * @returns {Promise<unknown>}
     *
     * @see https://www.discogs.com/developers/#page:database,header:database-master-release-versions-get
     *
     * @example
     * await client.database().getMasterVersions(1000, {
     *     page: 2,
     *     per_page: 25,
     *     format: 'Vinyl',
     *     label: 'Scorpio Music',
     *     released: '1992',
     *     country: 'Belgium',
     *     sort: 'released',
     *     sort_order: 'asc'
     * });
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
     *
     * @see https://www.discogs.com/developers/#page:database,header:database-label-get
     *
     * @example
     * await client.database().getLabel(1)
     */
    database.getLabel = function (label) {
        return client.get(`/labels/${label}`);
    };

    /**
     * Get label release data
     * @param {(number|string)} label - The Discogs label ID
     * @param {PaginationParameters} [params] - Optional pagination params
     * @returns {Promise<unknown>}
     *
     * @see https://www.discogs.com/developers/#page:database,header:database-all-label-releases-get
     *
     * @example
     * await client.database().getLabelReleases(1, { page: 3, per_page: 25 });
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
     *
     * @see https://www.discogs.com/developers/#page:images
     *
     * @example
     * let { data: release } = await client.database().getRelease(176126);
     * let { data: imageData } = await client.database().getImage(release.images[0].resource_url);
     */
    database.getImage = function (url) {
        return client.get({ url: url, encoding: 'binary', queue: false, json: false });
    };

    /**
     * Search the database
     * @param {PaginationParameters & Partial<{
     *   query: string;
     *   type: 'release' | 'master' | 'artist' | 'label';
     *   title: string;
     *   release_title: string;
     *   credit: string;
     *   artist: string;
     *   anv: string;
     *   label: string;
     *   genre: string;
     *   style: string;
     *   country: string;
     *   year: string;
     *   format: string;
     *   catno: string;
     *   barcode: string;
     *   track: string;
     *   submitter: string;
     *   contributor: string;
     * }>} [params] - Search parameters
     * @returns {Promise<unknown>}
     *
     * @see https://www.discogs.com/developers/#page:database,header:database-search-get
     *
     * @example
     * await client.database().search({
     *     query: 'nirvana', // Your search query
     *     type: 'release', // One of 'release', 'master', 'artist', 'label'
     *     title: 'nirvana - nevermind', // Search by combined “Artist Name - Release Title” title field.
     *     release_title: 'nevermind', // Search release titles.
     *     credit: 'kurt', // Search release credits.
     *     artist: 'nirvana', // Search artist names.
     *     anv: 'nirvana', // Search artist ANV.
     *     label: 'dgc', // Search label names.
     *     genre: 'rock', // Search genres.
     *     style: 'grunge', // Search styles.
     *     country: 'canada', // Search release country.
     *     year: '1991', // Search release year.
     *     format: 'album', // Search formats.
     *     catno: 'DGCD-24425', // Search catalog number.
     *     barcode: '7 2064-24425-2 4', // Search barcodes.
     *     track: 'smells like teen spirit', // Search track titles.
     *     submitter: 'milKt', // Search submitter username.
     *     contributor: 'jerome99', // Search contributor usernames.
     * });
     */
    database.search = function (params = {}) {
        let args = { ...params };
        if (args.query) {
            args.q = args.query;
            delete args.query;
        }
        return client.get({ url: addParams('/database/search', args), authLevel: 1 });
    };

    return database;
}
