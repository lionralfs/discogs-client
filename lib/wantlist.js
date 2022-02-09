import { escape, toQueryString } from './util.js';

/**
 * @typedef {import('./client.js').DiscogsClient} DiscogsClient
 * @typedef {import('./client.js').PaginationParameters} PaginationParameters
 * @typedef {{text: string; qty: number; descriptions: Array<string>; name: string}} Format
 * @typedef {{resource_url: string; entity_type: string; catno: string; id: number; name: string}} Label
 * @typedef {import('./database.js').Artist} Artist
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
     * @typedef {{resource_url: string; id: number; notes?: string; rating: number; basic_information: {resource_url: string; id: number; formats: Array<Format>; thumb: string; cover_image: string; title: string; labels: Array<Label>; year: number; artists: Array<Artist>}}} WantlistEntryResponse
     * @returns {Promise<import('./client.js').RateLimitedResponse<import('./client.js').PaginationResponse & {wants: Array<WantlistEntryResponse>}>>}
     *
     * @see https://www.discogs.com/developers/#page:user-wantlist,header:user-wantlist-wantlist-get
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
     * @returns {Promise<import('./client.js').RateLimitedResponse<WantlistEntryResponse>>}
     *
     * @see https://www.discogs.com/developers/#page:user-wantlist,header:user-wantlist-add-to-wantlist-put
     *
     * @example
     * await client.user().wantlist().addRelease('rodneyfool', 130076, { notes: 'My favorite release', rating: 5 });
     */
    wantlist.addRelease = function (user, release, data) {
        return client.put({ url: `/users/${escape(user)}/wants/${release}`, authLevel: 2 }, data);
    };

    /**
     * Edit the notes or rating on a release in the user's wantlist
     * @param {string} user - The user name
     * @param {(number|string)} release - The release ID
     * @param {{notes?: string, rating?: 0 | 1 | 2 | 3 | 4 | 5}} [data] - The notes and rating { notes: 'Test', rating: 4 }
     * @returns {Promise<import('./client.js').RateLimitedResponse<WantlistEntryResponse>>}
     *
     * @see https://www.discogs.com/developers/#page:user-wantlist,header:user-wantlist-add-to-wantlist-post
     *
     * @example
     * await client.user().wantlist().editNotes('rodneyfool', 130076, { notes: 'My favorite release', rating: 4 });
     */
    wantlist.editNotes = function (user, release, data) {
        return client.post({ url: `/users/${escape(user)}/wants/${release}`, authLevel: 2 }, data);
    };

    /**
     * Remove a release from the user's wantlist
     * @param {string} user - The user name
     * @param {(number|string)} release - The release ID
     * @returns {Promise<import('./client.js').RateLimitedResponse<void>>}
     *
     * @see https://www.discogs.com/developers/#page:user-wantlist,header:user-wantlist-add-to-wantlist-delete
     *
     * @example
     * await client.user().wantlist().removeRelease('rodneyfool', 130076);
     */
    wantlist.removeRelease = function (user, release) {
        return client.delete({ url: `/users/${escape(user)}/wants/${release}`, authLevel: 2 });
    };

    return wantlist;
}
